/**
 * imageEditor 서비스 유닛 테스트
 */
import { cropImage, rotateImage, flipImage, resizeImage } from '@/services/imageEditor';

// imageConverter 모킹
jest.mock('@/services/imageConverter', () => ({
  loadImage: jest.fn(),
}));

import { loadImage } from '@/services/imageConverter';

describe('imageEditor', () => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });
  const mockImage = {
    width: 800,
    height: 600,
    naturalWidth: 800,
    naturalHeight: 600,
  } as HTMLImageElement;

  let mockCtx: Record<string, jest.Mock | boolean | string>;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(() => {
    jest.clearAllMocks();
    (loadImage as jest.Mock).mockResolvedValue(mockImage);

    // Canvas Context 모킹
    mockCtx = {
      drawImage: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    };

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx) as never;

    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
      callback(mockBlob);
    }) as never;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  describe('cropImage', () => {
    it('이미지를 자르기해야 함', async () => {
      const crop = { x: 100, y: 100, width: 200, height: 200 };

      const result = await cropImage(mockFile, crop);

      expect(result).toBeInstanceOf(Blob);
      expect(loadImage).toHaveBeenCalled();
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockImage,
        100,
        100,
        200,
        200,
        0,
        0,
        200,
        200
      );
    });

    it('Blob을 입력으로 받아야 함', async () => {
      const crop = { x: 0, y: 0, width: 100, height: 100 };

      const result = await cropImage(mockBlob, crop);

      expect(result).toBeInstanceOf(Blob);
    });

    it('출력 형식과 품질을 적용해야 함', async () => {
      const crop = { x: 0, y: 0, width: 100, height: 100 };

      await cropImage(mockFile, crop, 'image/png', 0.95);

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        0.95
      );
    });

    it('Canvas context 생성 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null) as never;

      const crop = { x: 0, y: 0, width: 100, height: 100 };

      await expect(cropImage(mockFile, crop)).rejects.toThrow(
        'Canvas context를 생성할 수 없습니다'
      );
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      const crop = { x: 0, y: 0, width: 100, height: 100 };

      await expect(cropImage(mockFile, crop)).rejects.toThrow('이미지 자르기에 실패했습니다');
    });

    it('경계를 벗어난 자르기 영역도 처리해야 함', async () => {
      const crop = { x: 700, y: 500, width: 200, height: 200 };

      const result = await cropImage(mockFile, crop);

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('rotateImage', () => {
    it('이미지를 90도 회전해야 함', async () => {
      const result = await rotateImage(mockFile, 90);

      expect(result).toBeInstanceOf(Blob);
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalledWith((90 * Math.PI) / 180);
    });

    it('이미지를 180도 회전해야 함', async () => {
      await rotateImage(mockFile, 180);

      expect(mockCtx.rotate).toHaveBeenCalledWith((180 * Math.PI) / 180);
    });

    it('이미지를 270도 회전해야 함', async () => {
      await rotateImage(mockFile, 270);

      expect(mockCtx.rotate).toHaveBeenCalledWith((270 * Math.PI) / 180);
    });

    it('음수 각도로 회전해야 함', async () => {
      await rotateImage(mockFile, -90);

      expect(mockCtx.rotate).toHaveBeenCalledWith((-90 * Math.PI) / 180);
    });

    it('360도 회전해야 함', async () => {
      const result = await rotateImage(mockFile, 360);

      expect(result).toBeInstanceOf(Blob);
    });

    it('Blob을 입력으로 받아야 함', async () => {
      const result = await rotateImage(mockBlob, 90);

      expect(result).toBeInstanceOf(Blob);
    });

    it('출력 형식과 품질을 적용해야 함', async () => {
      await rotateImage(mockFile, 90, 'image/png', 0.95);

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        0.95
      );
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(rotateImage(mockFile, 90)).rejects.toThrow('이미지 회전에 실패했습니다');
    });
  });

  describe('flipImage', () => {
    it('이미지를 수평으로 뒤집어야 함', async () => {
      const result = await flipImage(mockFile, 'horizontal');

      expect(result).toBeInstanceOf(Blob);
      expect(mockCtx.translate).toHaveBeenCalledWith(800, 0);
      expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1);
    });

    it('이미지를 수직으로 뒤집어야 함', async () => {
      const result = await flipImage(mockFile, 'vertical');

      expect(result).toBeInstanceOf(Blob);
      expect(mockCtx.translate).toHaveBeenCalledWith(0, 600);
      expect(mockCtx.scale).toHaveBeenCalledWith(1, -1);
    });

    it('Blob을 입력으로 받아야 함', async () => {
      const result = await flipImage(mockBlob, 'horizontal');

      expect(result).toBeInstanceOf(Blob);
    });

    it('출력 형식과 품질을 적용해야 함', async () => {
      await flipImage(mockFile, 'horizontal', 'image/png', 0.95);

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        0.95
      );
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(flipImage(mockFile, 'horizontal')).rejects.toThrow(
        '이미지 뒤집기에 실패했습니다'
      );
    });
  });

  describe('resizeImage', () => {
    it('비율을 유지하며 이미지를 리사이즈해야 함', async () => {
      const result = await resizeImage(mockFile, 400, 300, true);

      expect(result).toBeInstanceOf(Blob);
      expect(loadImage).toHaveBeenCalled();
    });

    it('비율을 무시하고 이미지를 리사이즈해야 함', async () => {
      const result = await resizeImage(mockFile, 400, 400, false);

      expect(result).toBeInstanceOf(Blob);
      expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 400, 400);
    });

    it('가로 비율 우선으로 리사이즈해야 함', async () => {
      const result = await resizeImage(mockFile, 400, 300, true);

      expect(result).toBeInstanceOf(Blob);
    });

    it('세로 비율 우선으로 리사이즈해야 함', async () => {
      const result = await resizeImage(mockFile, 800, 200, true);

      expect(result).toBeInstanceOf(Blob);
    });

    it('Blob을 입력으로 받아야 함', async () => {
      const result = await resizeImage(mockBlob, 400, 300);

      expect(result).toBeInstanceOf(Blob);
    });

    it('출력 형식과 품질을 적용해야 함', async () => {
      await resizeImage(mockFile, 400, 300, true, 'image/png', 0.95);

      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        0.95
      );
    });

    it('고품질 리사이징을 적용해야 함', async () => {
      await resizeImage(mockFile, 400, 300);

      expect(mockCtx.imageSmoothingEnabled).toBe(true);
      expect(mockCtx.imageSmoothingQuality).toBe('high');
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(resizeImage(mockFile, 400, 300)).rejects.toThrow(
        '이미지 리사이즈에 실패했습니다'
      );
    });

    it('매우 작은 크기로 리사이즈해야 함', async () => {
      const result = await resizeImage(mockFile, 10, 10, false);

      expect(result).toBeInstanceOf(Blob);
    });

    it('매우 큰 크기로 리사이즈해야 함', async () => {
      const result = await resizeImage(mockFile, 4000, 3000, false);

      expect(result).toBeInstanceOf(Blob);
    });
  });
});
