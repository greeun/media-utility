/**
 * imageUpscaler 서비스 유닛 테스트
 */
import { upscaleImage, UpscaleOptions } from '@/services/imageUpscaler';

// upscaler 모킹
const mockUpscaler = {
  upscale: jest.fn(),
  dispose: jest.fn(),
};

jest.mock('upscaler', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockUpscaler),
  };
}, { virtual: true });

jest.mock('@upscalerjs/esrgan-slim/2x', () => ({ default: {} }));
jest.mock('@upscalerjs/esrgan-slim/3x', () => ({ default: {} }));
jest.mock('@upscalerjs/esrgan-slim/4x', () => ({ default: {} }));

describe('imageUpscaler', () => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });
  const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  beforeEach(() => {
    jest.clearAllMocks();

    // URL 모킹
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Image 모킹
    (global.Image as never) = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      naturalWidth = 800;
      naturalHeight = 600;

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as never;

    // Canvas 모킹
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
    })) as never;

    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(mockBlob);
    }) as never;

    // Upscaler 모킹
    mockUpscaler.upscale.mockImplementation(async (img, options) => {
      // progress 콜백 시뮬레이션
      if (options.progress) {
        options.progress(0.5);
        options.progress(1.0);
      }
      return mockDataUrl;
    });
  });

  describe('upscaleImage', () => {
    it('2x 업스케일을 수행해야 함', async () => {
      const options: UpscaleOptions = {
        scale: 2,
        format: 'png',
      };

      const result = await upscaleImage(mockFile, options);

      expect(result).toBe(mockBlob);
      expect(mockUpscaler.upscale).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          output: 'base64',
          patchSize: 64,
          padding: 4,
        })
      );
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('3x 업스케일을 수행해야 함', async () => {
      const options: UpscaleOptions = {
        scale: 3,
        format: 'png',
      };

      const result = await upscaleImage(mockFile, options);

      expect(result).toBe(mockBlob);
    });

    it('4x 업스케일을 수행해야 함', async () => {
      const options: UpscaleOptions = {
        scale: 4,
        format: 'png',
      };

      const result = await upscaleImage(mockFile, options);

      expect(result).toBe(mockBlob);
    });

    it('JPG 형식으로 변환해야 함', async () => {
      const options: UpscaleOptions = {
        scale: 2,
        format: 'jpg',
        quality: 0.9,
      };

      await upscaleImage(mockFile, options);

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/jpeg',
        0.9
      );
    });

    it('WebP 형식으로 변환해야 함', async () => {
      const options: UpscaleOptions = {
        scale: 2,
        format: 'webp',
        quality: 0.85,
      };

      await upscaleImage(mockFile, options);

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/webp',
        0.85
      );
    });

    it('PNG는 quality를 적용하지 않아야 함', async () => {
      const options: UpscaleOptions = {
        scale: 2,
        format: 'png',
        quality: 0.9,
      };

      await upscaleImage(mockFile, options);

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        undefined
      );
    });

    it('진행률 콜백을 호출해야 함', async () => {
      const mockProgressFn = jest.fn();
      const options: UpscaleOptions = {
        scale: 2,
        format: 'png',
      };

      await upscaleImage(mockFile, options, mockProgressFn);

      expect(mockProgressFn).toHaveBeenCalledWith(5); // 시작
      expect(mockProgressFn).toHaveBeenCalledWith(10); // 이미지 로드
      expect(mockProgressFn).toHaveBeenCalledWith(20); // upscaler 준비
      expect(mockProgressFn.mock.calls.some(([val]) => val > 20 && val < 85)).toBe(true); // progress 중
      expect(mockProgressFn).toHaveBeenCalledWith(85); // 업스케일 완료
      expect(mockProgressFn).toHaveBeenCalledWith(90); // Canvas 변환
      expect(mockProgressFn).toHaveBeenCalledWith(100); // 완료
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const options: UpscaleOptions = {
        scale: 2,
        format: 'png',
      };

      const result = await upscaleImage(mockFile, options);

      expect(result).toBe(mockBlob);
    });

    it('기본 옵션으로 업스케일해야 함', async () => {
      const result = await upscaleImage(mockFile);

      expect(result).toBe(mockBlob);
      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        undefined
      );
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

      const options: UpscaleOptions = {
        scale: 2,
        format: 'png',
      };

      await expect(upscaleImage(mockFile, options)).rejects.toThrow(
        '이미지를 로드할 수 없습니다'
      );
    });

    it('upscale 실패 시 에러를 던져야 함', async () => {
      mockUpscaler.upscale.mockRejectedValue(new Error('업스케일 실패'));

      const options: UpscaleOptions = {
        scale: 2,
        format: 'png',
      };

      await expect(upscaleImage(mockFile, options)).rejects.toThrow('업스케일 실패');
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(null);
      }) as never;

      const options: UpscaleOptions = {
        scale: 2,
        format: 'png',
      };

      await expect(upscaleImage(mockFile, options)).rejects.toThrow(
        '업스케일 변환에 실패했습니다'
      );
    });

    it('스케일 변경 시 기존 인스턴스를 정리해야 함', async () => {
      // 첫 번째 호출: 2x
      await upscaleImage(mockFile, { scale: 2, format: 'png' });

      // 두 번째 호출: 3x (dispose 호출되어야 함)
      await upscaleImage(mockFile, { scale: 3, format: 'png' });

      expect(mockUpscaler.dispose).toHaveBeenCalledTimes(1);
    });

    it('동일 스케일로 호출해도 매번 새 인스턴스를 생성해야 함', async () => {
      mockUpscaler.dispose.mockClear();

      await upscaleImage(mockFile, { scale: 2, format: 'png' });
      await upscaleImage(mockFile, { scale: 2, format: 'png' });

      // 서비스 로직이 매번 새 인스턴스를 생성하므로 dispose가 호출됨
      expect(mockUpscaler.dispose).toHaveBeenCalled();
    });

    it('quality 기본값을 적용해야 함', async () => {
      await upscaleImage(mockFile, { scale: 2, format: 'jpg' });

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/jpeg',
        0.92
      );
    });

    it('progress 콜백을 upscaler에 전달해야 함', async () => {
      const mockProgressFn = jest.fn();

      await upscaleImage(mockFile, { scale: 2, format: 'png' }, mockProgressFn);

      // upscale 내부에서 progress 콜백이 호출되었는지 확인
      expect(mockUpscaler.upscale).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          progress: expect.any(Function),
        })
      );
    });
  });
});
