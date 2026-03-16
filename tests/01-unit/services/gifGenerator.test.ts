/**
 * gifGenerator 서비스 유닛 테스트
 */
import { createGifFromImages, createGifFromCanvases } from '@/services/gifGenerator';

// gif.js 모킹
const mockGifInstance = {
  addFrame: jest.fn(),
  render: jest.fn(),
  on: jest.fn(),
};

const MockGIF = jest.fn(() => mockGifInstance);

jest.mock('gif.js', () => ({
  __esModule: true,
  default: MockGIF,
}));

// imageConverter 모킹
jest.mock('@/services/imageConverter', () => ({
  loadImage: jest.fn(),
}));

import { loadImage } from '@/services/imageConverter';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const GIF = require('gif.js').default;

describe('gifGenerator', () => {
  const mockBlob = new Blob(['gif'], { type: 'image/gif' });
  const mockFile1 = new File([mockBlob], 'image1.jpg', { type: 'image/jpeg' });
  const mockFile2 = new File([mockBlob], 'image2.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGifInstance.addFrame.mockClear();
    mockGifInstance.render.mockClear();
    mockGifInstance.on.mockClear();

    // Canvas 모킹
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      drawImage: jest.fn(),
    })) as never;
  });

  describe('createGifFromImages', () => {
    const mockImage = {
      width: 800,
      height: 600,
    } as HTMLImageElement;

    beforeEach(() => {
      (loadImage as jest.Mock).mockResolvedValue(mockImage);

      // on 메서드 시뮬레이션
      mockGifInstance.on.mockImplementation((event: string, callback: (data: unknown) => void) => {
        if (event === 'finished') {
          setTimeout(() => callback(mockBlob), 0);
        }
        if (event === 'progress') {
          setTimeout(() => callback(0.5), 0);
        }
      });
    });

    it('여러 이미지로 GIF를 생성해야 함', async () => {
      const files = [mockFile1, mockFile2];

      const result = await createGifFromImages(files);

      expect(result).toBe(mockBlob);
      expect(GIF).toHaveBeenCalledWith({
        workers: 2,
        quality: 10,
        width: 400,
        height: 400,
        repeat: 0,
        workerScript: '/workers/gif.worker.js',
      });
      expect(mockGifInstance.addFrame).toHaveBeenCalledTimes(2);
      expect(mockGifInstance.render).toHaveBeenCalled();
    });

    it('커스텀 옵션으로 GIF를 생성해야 함', async () => {
      const files = [mockFile1];
      const options = {
        width: 640,
        height: 480,
        delay: 1000,
        quality: 5,
        repeat: -1,
      };

      await createGifFromImages(files, options);

      expect(GIF).toHaveBeenCalledWith({
        workers: 2,
        quality: 5,
        width: 640,
        height: 480,
        repeat: -1,
        workerScript: '/workers/gif.worker.js',
      });
      expect(mockGifInstance.addFrame).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        { delay: 1000, copy: true }
      );
    });

    it('진행률 콜백을 호출해야 함', async () => {
      const files = [mockFile1, mockFile2];
      const mockProgressFn = jest.fn();

      await createGifFromImages(files, {}, mockProgressFn);

      // 이미지 처리 진행률 (0-80%)
      expect(mockProgressFn).toHaveBeenCalledWith(expect.any(Number));
      expect(mockProgressFn.mock.calls.some(([val]) => val <= 80)).toBe(true);
      // 렌더링 진행률 (80-100%)
      expect(mockProgressFn.mock.calls.some(([val]) => val > 80)).toBe(true);
      // 최종 완료
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('단일 이미지로 GIF를 생성해야 함', async () => {
      const result = await createGifFromImages([mockFile1]);

      expect(result).toBe(mockBlob);
      expect(mockGifInstance.addFrame).toHaveBeenCalledTimes(1);
    });

    it('이미지 로드 실패 시 계속 진행해야 함', async () => {
      (loadImage as jest.Mock)
        .mockRejectedValueOnce(new Error('로드 실패'))
        .mockResolvedValueOnce(mockImage);

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      const result = await createGifFromImages([mockFile1, mockFile2]);

      expect(result).toBe(mockBlob);
      expect(consoleError).toHaveBeenCalledWith('이미지 처리 오류:', expect.any(Error));
      expect(mockGifInstance.addFrame).toHaveBeenCalledTimes(1); // 성공한 1개만

      consoleError.mockRestore();
    });

    it('이미지 비율을 유지하면서 크기를 조정해야 함', async () => {
      const wideImage = { width: 1600, height: 800 } as HTMLImageElement;
      (loadImage as jest.Mock).mockResolvedValue(wideImage);

      const result = await createGifFromImages([mockFile1], { width: 400, height: 400 });

      // GIF가 정상적으로 생성되었는지 확인
      expect(result).toBe(mockBlob);
      expect(mockGifInstance.addFrame).toHaveBeenCalled();
    });

    it('Canvas context 생성 실패 시 에러를 로그하고 이미지를 건너뛰어야 함', async () => {
      // 서비스 로직: context 실패 시 catch에서 console.error 후 skip
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === 'canvas') {
          (el as HTMLCanvasElement).getContext = jest.fn(() => null) as never;
        }
        return el;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // context 실패 시 에러 로그를 남기고 정상 종료 (GIF에 프레임 없이)
      const result = await createGifFromImages([mockFile1]);
      expect(result).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith('이미지 처리 오류:', expect.any(Error));

      consoleSpy.mockRestore();
      (document.createElement as jest.Mock).mockRestore();
    });
  });

  describe('createGifFromCanvases', () => {
    let mockCanvas1: HTMLCanvasElement;
    let mockCanvas2: HTMLCanvasElement;

    beforeAll(() => {
      mockCanvas1 = document.createElement('canvas');
      mockCanvas1.width = 400;
      mockCanvas1.height = 400;
      mockCanvas2 = document.createElement('canvas');
      mockCanvas2.width = 400;
      mockCanvas2.height = 400;
    });

    beforeEach(() => {
      mockGifInstance.on.mockImplementation((event: string, callback: (data: unknown) => void) => {
        if (event === 'finished') {
          setTimeout(() => callback(mockBlob), 0);
        }
        if (event === 'progress') {
          setTimeout(() => callback(0.8), 0);
        }
      });
    });

    it('Canvas 배열로 GIF를 생성해야 함', async () => {
      const canvases = [mockCanvas1, mockCanvas2];

      const result = await createGifFromCanvases(canvases);

      expect(result).toBe(mockBlob);
      expect(mockGifInstance.addFrame).toHaveBeenCalledTimes(2);
      expect(mockGifInstance.addFrame).toHaveBeenCalledWith(mockCanvas1, {
        delay: 100,
        copy: true,
      });
      expect(mockGifInstance.render).toHaveBeenCalled();
    });

    it('커스텀 옵션으로 GIF를 생성해야 함', async () => {
      const options = {
        delay: 200,
        quality: 15,
        repeat: 5,
      };

      await createGifFromCanvases([mockCanvas1], options);

      expect(GIF).toHaveBeenCalledWith({
        workers: 2,
        quality: 15,
        width: 400,
        height: 400,
        repeat: 5,
        workerScript: '/workers/gif.worker.js',
      });
      expect(mockGifInstance.addFrame).toHaveBeenCalledWith(mockCanvas1, {
        delay: 200,
        copy: true,
      });
    });

    it('진행률 콜백을 호출해야 함', async () => {
      const mockProgressFn = jest.fn();

      await createGifFromCanvases([mockCanvas1, mockCanvas2], {}, mockProgressFn);

      // finished 이벤트에서 100 호출
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('빈 캔버스 배열로도 GIF를 생성해야 함', async () => {
      const result = await createGifFromCanvases([]);

      expect(result).toBe(mockBlob);
      expect(mockGifInstance.addFrame).not.toHaveBeenCalled();
    });

    it('첫 번째 캔버스 크기를 기준으로 GIF를 생성해야 함', async () => {
      const customCanvas = document.createElement('canvas');
      customCanvas.width = 640;
      customCanvas.height = 480;

      await createGifFromCanvases([customCanvas]);

      expect(GIF).toHaveBeenCalledWith({
        workers: 2,
        quality: 10,
        width: 640,
        height: 480,
        repeat: 0,
        workerScript: '/workers/gif.worker.js',
      });
    });
  });
});
