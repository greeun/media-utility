/**
 * faceBlur 서비스 유닛 테스트
 */
import { detectFaces, applyFaceBlur, DetectedFace, FaceBlurOptions } from '@/services/faceBlur';

// MediaPipe 모킹
jest.mock('@mediapipe/tasks-vision', () => ({
  FaceDetector: {
    createFromOptions: jest.fn(),
  },
  FilesetResolver: {
    forVisionTasks: jest.fn(),
  },
}));

describe('faceBlur', () => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    jest.clearAllMocks();

    // URL 모킹
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Canvas 모킹
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
      filter: '',
      imageSmoothingEnabled: true,
      fillStyle: '',
      fillRect: jest.fn(),
    })) as never;

    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(mockBlob);
    }) as never;

    // Image 모킹
    (global.Image as never) = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      naturalWidth = 800;
      naturalHeight = 600;
      width = 800;
      height = 600;

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as never;
  });

  describe('detectFaces', () => {
    it('얼굴이 감지되지 않으면 빈 배열을 반환해야 함', async () => {
      const mockDetector = {
        detect: jest.fn(() => ({ detections: [] })),
      };

      const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
      (FilesetResolver.forVisionTasks as jest.Mock).mockResolvedValue({});
      (FaceDetector.createFromOptions as jest.Mock).mockResolvedValue(mockDetector);

      const result = await detectFaces(mockFile);

      expect(result).toEqual([]);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('얼굴 감지 결과를 올바르게 변환해야 함', async () => {
      // 싱글턴 캐시를 리셋하기 위해 모듈을 새로 로드
      jest.resetModules();
      jest.mock('@mediapipe/tasks-vision', () => ({
        FaceDetector: {
          createFromOptions: jest.fn(),
        },
        FilesetResolver: {
          forVisionTasks: jest.fn(),
        },
      }));

      const mockDetections = [
        {
          boundingBox: {
            originX: 100,
            originY: 150,
            width: 200,
            height: 250,
          },
          categories: [{ score: 0.95 }],
        },
        {
          boundingBox: {
            originX: 400,
            originY: 200,
            width: 180,
            height: 220,
          },
          categories: [{ score: 0.88 }],
        },
      ];

      const mockDetector = {
        detect: jest.fn(() => ({ detections: mockDetections })),
      };

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { FaceDetector, FilesetResolver } = require('@mediapipe/tasks-vision');
      (FilesetResolver.forVisionTasks as jest.Mock).mockResolvedValue({});
      (FaceDetector.createFromOptions as jest.Mock).mockResolvedValue(mockDetector);

      // 모듈을 새로 로드하여 싱글턴 캐시가 없는 상태에서 테스트
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { detectFaces: freshDetectFaces } = require('@/services/faceBlur');
      const result = await freshDetectFaces(mockFile);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        x: 100,
        y: 150,
        width: 200,
        height: 250,
        confidence: 0.95,
      });
      expect(result[1]).toEqual({
        x: 400,
        y: 200,
        width: 180,
        height: 220,
        confidence: 0.88,
      });
    });

    it('이미지 로드 실패 시 에러를 던져야 함', async () => {
      (global.Image as never) = class {
        onload: (() => void) | null = null;
        onerror: ((e: unknown) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('로드 실패'));
          }, 0);
        }
      } as never;

      const mockDetector = {
        detect: jest.fn(() => ({ detections: [] })),
      };

      const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
      (FilesetResolver.forVisionTasks as jest.Mock).mockResolvedValue({});
      (FaceDetector.createFromOptions as jest.Mock).mockResolvedValue(mockDetector);

      await expect(detectFaces(mockFile)).rejects.toThrow('이미지를 로드할 수 없습니다');
    });
  });

  describe('applyFaceBlur', () => {
    const mockFaces: DetectedFace[] = [
      { x: 100, y: 100, width: 200, height: 200, confidence: 0.95 },
    ];

    const mockOptions: FaceBlurOptions = {
      blurType: 'gaussian',
      blurIntensity: 15,
      autoDetect: true,
    };

    it('가우시안 블러를 적용해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await applyFaceBlur(mockFile, mockFaces, mockOptions, mockProgressFn);

      expect(result).toBe(mockBlob);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('모자이크 블러를 적용해야 함', async () => {
      const mosaicOptions: FaceBlurOptions = {
        ...mockOptions,
        blurType: 'mosaic',
      };

      const result = await applyFaceBlur(mockFile, mockFaces, mosaicOptions);

      expect(result).toBe(mockBlob);
    });

    it('얼굴과 수동 영역을 함께 블러 처리해야 함', async () => {
      const optionsWithRegions: FaceBlurOptions = {
        ...mockOptions,
        additionalRegions: [{ x: 400, y: 400, width: 100, height: 100 }],
      };

      const result = await applyFaceBlur(mockFile, mockFaces, optionsWithRegions);

      expect(result).toBe(mockBlob);
    });

    it('블러 영역이 없으면 원본 파일을 반환해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await applyFaceBlur(mockFile, [], mockOptions, mockProgressFn);

      expect(result).toBe(mockFile);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const result = await applyFaceBlur(mockFile, mockFaces, mockOptions);

      expect(result).toBe(mockBlob);
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(null);
      }) as never;

      await expect(applyFaceBlur(mockFile, mockFaces, mockOptions)).rejects.toThrow(
        '블러 처리에 실패했습니다'
      );
    });

    it('블러 강도를 조절해야 함', async () => {
      const highIntensityOptions: FaceBlurOptions = {
        ...mockOptions,
        blurIntensity: 50,
      };

      const result = await applyFaceBlur(mockFile, mockFaces, highIntensityOptions);

      expect(result).toBe(mockBlob);
    });

    it('경계를 벗어난 영역도 안전하게 처리해야 함', async () => {
      const edgeFaces: DetectedFace[] = [
        { x: -50, y: -50, width: 100, height: 100, confidence: 0.9 },
        { x: 750, y: 550, width: 100, height: 100, confidence: 0.9 },
      ];

      const result = await applyFaceBlur(mockFile, edgeFaces, mockOptions);

      expect(result).toBe(mockBlob);
    });
  });
});
