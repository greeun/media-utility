/**
 * psdConverter 서비스 유닛 테스트
 */
import { convertPsdToImage, isPsdFile } from '@/services/psdConverter';

// @webtoon/psd 모킹
const mockPsd = {
  width: 800,
  height: 600,
  composite: jest.fn(),
};

jest.mock('@webtoon/psd', () => ({
  __esModule: true,
  default: {
    parse: jest.fn(() => mockPsd),
  },
}));

describe('psdConverter', () => {
  const mockBlob = new Blob(['test'], { type: 'image/png' });
  const mockFile = new File([mockBlob], 'test.psd', { type: 'image/vnd.adobe.photoshop' });

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

    // composite mock
    const mockBuffer = new Uint8ClampedArray(800 * 600 * 4);
    mockPsd.composite.mockResolvedValue({ buffer: mockBuffer.buffer });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  describe('convertPsdToImage', () => {
    it('PSD를 PNG로 변환해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await convertPsdToImage(mockFile, 'png', {}, mockProgressFn);

      expect(result).toBeInstanceOf(Blob);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(20);
      expect(mockProgressFn).toHaveBeenCalledWith(40);
      expect(mockProgressFn).toHaveBeenCalledWith(60);
      expect(mockProgressFn).toHaveBeenCalledWith(80);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('PSD를 JPG로 변환해야 함', async () => {
      const result = await convertPsdToImage(mockFile, 'jpg', { quality: 0.9 });

      expect(result).toBeInstanceOf(Blob);
    });

    it('PSD를 WebP로 변환해야 함', async () => {
      const result = await convertPsdToImage(mockFile, 'webp', { quality: 0.85 });

      expect(result).toBeInstanceOf(Blob);
    });

    it('기본 형식은 PNG여야 함', async () => {
      const result = await convertPsdToImage(mockFile);

      expect(result).toBeInstanceOf(Blob);
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const result = await convertPsdToImage(mockFile, 'png');

      expect(result).toBeInstanceOf(Blob);
    });

    it('커스텀 품질을 적용해야 함', async () => {
      const result = await convertPsdToImage(mockFile, 'jpg', { quality: 0.5 });

      expect(result).toBeInstanceOf(Blob);
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(convertPsdToImage(mockFile)).rejects.toThrow('PSD 변환에 실패했습니다');
    });

    it('PSD 파싱 실패 시 에러를 던져야 함', async () => {
      const Psd = (await import('@webtoon/psd')).default;
      (Psd.parse as jest.Mock).mockImplementationOnce(() => {
        throw new Error('파싱 오류');
      });

      await expect(convertPsdToImage(mockFile)).rejects.toThrow();
    });
  });

  describe('isPsdFile', () => {
    it('PSD 확장자를 가진 파일을 감지해야 함', () => {
      const file = new File(['test'], 'image.psd', { type: 'image/vnd.adobe.photoshop' });
      expect(isPsdFile(file)).toBe(true);
    });

    it('PSB 확장자를 가진 파일을 감지해야 함', () => {
      const file = new File(['test'], 'image.psb', { type: 'image/vnd.adobe.photoshop' });
      expect(isPsdFile(file)).toBe(true);
    });

    it('대소문자를 구분하지 않아야 함', () => {
      const file = new File(['test'], 'image.PSD', { type: 'image/vnd.adobe.photoshop' });
      expect(isPsdFile(file)).toBe(true);
    });

    it('비PSD 파일을 false로 반환해야 함', () => {
      const jpgFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      const pngFile = new File(['test'], 'image.png', { type: 'image/png' });

      expect(isPsdFile(jpgFile)).toBe(false);
      expect(isPsdFile(pngFile)).toBe(false);
    });
  });
});
