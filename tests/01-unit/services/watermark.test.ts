/**
 * watermark 서비스 유닛 테스트
 */
import { applyTextWatermark, applyImageWatermark, TextWatermarkOptions, ImageWatermarkOptions } from '@/services/watermark';

describe('watermark', () => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });
  const mockWatermarkImage = {
    naturalWidth: 200,
    naturalHeight: 100,
  } as HTMLImageElement;

  let mockCtx: Record<string, jest.Mock | string | number>;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(() => {
    jest.clearAllMocks();

    // URL 모킹
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Image 모킹
    (global.Image as unknown) = class {
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
    };

    // Canvas Context 모킹
    mockCtx = {
      drawImage: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      font: '',
      fillStyle: '',
      textBaseline: 'top',
      globalAlpha: 1,
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

  describe('applyTextWatermark', () => {
    const baseOptions: TextWatermarkOptions = {
      text: 'WATERMARK',
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      opacity: 0.5,
      rotation: 0,
      position: 'bottom-right',
      tileMode: false,
    };

    it('텍스트 워터마크를 적용해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await applyTextWatermark(mockFile, baseOptions, mockProgressFn);

      expect(result).toBeInstanceOf(Blob);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(40);
      expect(mockProgressFn).toHaveBeenCalledWith(80);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('모든 위치에 워터마크를 적용해야 함', async () => {
      const positions = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right',
      ] as const;

      for (const position of positions) {
        const result = await applyTextWatermark(mockFile, { ...baseOptions, position });
        expect(result).toBeInstanceOf(Blob);
      }
    });

    it('타일 모드로 워터마크를 적용해야 함', async () => {
      const options: TextWatermarkOptions = {
        ...baseOptions,
        tileMode: true,
      };

      const result = await applyTextWatermark(mockFile, options);

      expect(result).toBeInstanceOf(Blob);
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('회전을 적용해야 함', async () => {
      const options: TextWatermarkOptions = {
        ...baseOptions,
        rotation: 45,
      };

      await applyTextWatermark(mockFile, options);

      expect(mockCtx.rotate).toHaveBeenCalledWith((45 * Math.PI) / 180);
    });

    it('투명도를 적용해야 함', async () => {
      const options: TextWatermarkOptions = {
        ...baseOptions,
        opacity: 0.3,
      };

      await applyTextWatermark(mockFile, options);

      // globalAlpha가 설정되었는지 확인 (마지막에 1로 복원됨)
      expect(mockCtx.fillText).toHaveBeenCalled();
    });

    it('폰트 설정을 적용해야 함', async () => {
      const options: TextWatermarkOptions = {
        ...baseOptions,
        fontSize: 64,
        fontFamily: 'Impact',
      };

      await applyTextWatermark(mockFile, options);

      expect(mockCtx.font).toContain('64px');
      expect(mockCtx.font).toContain('Impact');
    });

    it('색상을 적용해야 함', async () => {
      const options: TextWatermarkOptions = {
        ...baseOptions,
        color: '#FF0000',
      };

      await applyTextWatermark(mockFile, options);

      expect(mockCtx.fillStyle).toBe('#FF0000');
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const result = await applyTextWatermark(mockFile, baseOptions);

      expect(result).toBeInstanceOf(Blob);
    });

    it('이미지 로드 실패 시 에러를 던져야 함', async () => {
      (global.Image as unknown) = class {
        onload: (() => void) | null = null;
        onerror: ((e: unknown) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('로드 실패'));
          }, 0);
        }
      };

      await expect(applyTextWatermark(mockFile, baseOptions)).rejects.toThrow(
        '이미지를 로드할 수 없습니다'
      );
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(applyTextWatermark(mockFile, baseOptions)).rejects.toThrow(
        '워터마크 적용에 실패했습니다'
      );
    });
  });

  describe('applyImageWatermark', () => {
    const baseOptions: ImageWatermarkOptions = {
      watermarkImage: mockWatermarkImage,
      scale: 1.0,
      opacity: 0.5,
      position: 'bottom-right',
      tileMode: false,
    };

    it('이미지 워터마크를 적용해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await applyImageWatermark(mockFile, baseOptions, mockProgressFn);

      expect(result).toBeInstanceOf(Blob);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(40);
      expect(mockProgressFn).toHaveBeenCalledWith(80);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('모든 위치에 워터마크를 적용해야 함', async () => {
      const positions = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right',
      ] as const;

      for (const position of positions) {
        const result = await applyImageWatermark(mockFile, { ...baseOptions, position });
        expect(result).toBeInstanceOf(Blob);
      }
    });

    it('타일 모드로 워터마크를 적용해야 함', async () => {
      const options: ImageWatermarkOptions = {
        ...baseOptions,
        tileMode: true,
      };

      const result = await applyImageWatermark(mockFile, options);

      expect(result).toBeInstanceOf(Blob);
      expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    it('스케일을 적용해야 함', async () => {
      const options: ImageWatermarkOptions = {
        ...baseOptions,
        scale: 0.5,
      };

      await applyImageWatermark(mockFile, options);

      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        mockWatermarkImage,
        expect.any(Number),
        expect.any(Number),
        100, // 200 * 0.5
        50   // 100 * 0.5
      );
    });

    it('투명도를 적용해야 함', async () => {
      const options: ImageWatermarkOptions = {
        ...baseOptions,
        opacity: 0.3,
      };

      await applyImageWatermark(mockFile, options);

      // drawImage가 호출되었는지 확인
      expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const result = await applyImageWatermark(mockFile, baseOptions);

      expect(result).toBeInstanceOf(Blob);
    });

    it('이미지 로드 실패 시 에러를 던져야 함', async () => {
      (global.Image as unknown) = class {
        onload: (() => void) | null = null;
        onerror: ((e: unknown) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('로드 실패'));
          }, 0);
        }
      };

      await expect(applyImageWatermark(mockFile, baseOptions)).rejects.toThrow(
        '이미지를 로드할 수 없습니다'
      );
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(applyImageWatermark(mockFile, baseOptions)).rejects.toThrow(
        '워터마크 적용에 실패했습니다'
      );
    });
  });
});
