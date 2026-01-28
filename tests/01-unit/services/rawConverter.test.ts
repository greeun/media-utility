/**
 * rawConverter 서비스 유닛 테스트
 */
import { convertRawToImage, isRawFile, RawConvertOptions } from '@/services/rawConverter';

// libraw-wasm 모킹
const mockLibRaw = {
  open: jest.fn(),
  extractImage: jest.fn(),
  close: jest.fn(),
  imageWidth: 800,
  imageHeight: 600,
  cameraModel: 'Canon EOS 5D',
  isoSpeed: 400,
  shutterSpeed: 0.008, // 1/125s
  aperture: 2.8,
  focalLength: 50,
  timestamp: 1640000000,
};

jest.mock('libraw-wasm', () => ({
  __esModule: true,
  default: jest.fn(() => mockLibRaw),
}));

describe('rawConverter', () => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
  const mockFile = new File([mockBlob], 'test.cr2', { type: 'image/x-canon-cr2' });

  let mockCtx: Record<string, jest.Mock | string>;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(() => {
    jest.clearAllMocks();

    // ArrayBuffer mock
    mockFile.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(100));

    // ImageData 모킹 (jsdom에서 필요)
    if (typeof global.ImageData === 'undefined') {
      global.ImageData = class ImageData {
        data: Uint8ClampedArray;
        width: number;
        height: number;
        constructor(data: Uint8ClampedArray, width: number, height?: number) {
          this.data = data;
          this.width = width;
          this.height = height || (data.length / (width * 4));
        }
      } as never;
    }

    // Canvas Context 모킹
    mockCtx = {
      putImageData: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      drawImage: jest.fn(),
    };

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx) as never;

    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
      callback(mockBlob);
    }) as never;

    // extractImage mock
    const mockImageData = new Uint8ClampedArray(800 * 600 * 4);
    mockLibRaw.extractImage.mockResolvedValue({
      data: mockImageData,
      width: 800,
      height: 600,
    });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  describe('convertRawToImage', () => {
    it('RAW를 JPG로 변환해야 함', async () => {
      const mockProgressFn = jest.fn();
      const options: RawConvertOptions = { format: 'jpg', quality: 0.9 };

      const result = await convertRawToImage(mockFile, options, mockProgressFn);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.metadata.width).toBe(800);
      expect(result.metadata.height).toBe(600);
      expect(mockProgressFn).toHaveBeenCalledWith(5);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
      expect(mockLibRaw.close).toHaveBeenCalled();
    });

    it('RAW를 PNG로 변환해야 함', async () => {
      const options: RawConvertOptions = { format: 'png' };

      const result = await convertRawToImage(mockFile, options);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        undefined
      );
    });

    it('RAW를 WebP로 변환해야 함', async () => {
      const options: RawConvertOptions = { format: 'webp', quality: 0.85 };

      const result = await convertRawToImage(mockFile, options);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/webp',
        0.85
      );
    });

    it('메타데이터를 추출해야 함', async () => {
      const result = await convertRawToImage(mockFile);

      expect(result.metadata.width).toBe(800);
      expect(result.metadata.height).toBe(600);
      expect(result.metadata.camera).toBe('Canon EOS 5D');
      expect(result.metadata.iso).toBe(400);
      expect(result.metadata.shutterSpeed).toBe('1/125s');
      expect(result.metadata.aperture).toBe('f/2.8');
      expect(result.metadata.focalLength).toBe('50mm');
    });

    it('메타데이터 추출 실패 시 무시해야 함', async () => {
      mockLibRaw.cameraModel = null;
      mockLibRaw.isoSpeed = 0;

      const result = await convertRawToImage(mockFile);

      expect(result.metadata.camera).toBeUndefined();
      expect(result.metadata.iso).toBeUndefined();

      // 복원
      mockLibRaw.cameraModel = 'Canon EOS 5D';
      mockLibRaw.isoSpeed = 400;
    });

    it('기본 옵션으로 변환해야 함', async () => {
      const result = await convertRawToImage(mockFile);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/jpeg',
        0.92
      );
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const result = await convertRawToImage(mockFile);

      expect(result.blob).toBeInstanceOf(Blob);
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(convertRawToImage(mockFile)).rejects.toThrow('RAW 변환에 실패했습니다');
    });

    // close 호출은 정상 변환 후에만 발생 (에러 시에는 호출되지 않을 수 있음)
    it('정상 변환 후 close를 호출해야 함', async () => {
      await convertRawToImage(mockFile);
      expect(mockLibRaw.close).toHaveBeenCalled();
    });
  });

  describe('isRawFile', () => {
    const rawExtensions = ['cr2', 'cr3', 'nef', 'arw', 'dng', 'raf', 'orf', 'rw2', 'pef', 'srw'];

    it.each(rawExtensions)('%s 확장자를 RAW 파일로 인식해야 함', (ext) => {
      const file = new File(['test'], `image.${ext}`, { type: `image/x-${ext}` });
      expect(isRawFile(file)).toBe(true);
    });

    it('대소문자를 구분하지 않아야 함', () => {
      const file = new File(['test'], 'image.CR2', { type: 'image/x-canon-cr2' });
      expect(isRawFile(file)).toBe(true);
    });

    it('비RAW 파일을 false로 반환해야 함', () => {
      const jpgFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      const pngFile = new File(['test'], 'image.png', { type: 'image/png' });

      expect(isRawFile(jpgFile)).toBe(false);
      expect(isRawFile(pngFile)).toBe(false);
    });
  });
});
