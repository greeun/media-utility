/**
 * htmlToImage 서비스 유닛 테스트
 */
import { convertHtmlToImage, HtmlToImageOptions } from '@/services/htmlToImage';

// html-to-image 모킹
jest.mock('html-to-image', () => ({
  toPng: jest.fn(),
  toJpeg: jest.fn(),
  toSvg: jest.fn(),
}));

describe('htmlToImage', () => {
  const mockPngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const mockJpegDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCeAAX/2Q==';
  const mockSvgDataUrl = 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3C%2Fsvg%3E';

  beforeEach(() => {
    jest.clearAllMocks();

    // DOM 메서드 모킹
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  describe('convertHtmlToImage', () => {
    const baseOptions: HtmlToImageOptions = {
      html: '<div>Hello World</div>',
      width: 800,
      height: 600,
      format: 'png',
    };

    it('HTML을 PNG로 변환해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      const result = await convertHtmlToImage(baseOptions);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/png');
      expect(htmlToImage.toPng).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({
          width: 800,
          height: 600,
          quality: 0.92,
          pixelRatio: 1,
        })
      );
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('HTML을 JPG로 변환해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toJpeg as jest.Mock).mockResolvedValue(mockJpegDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        format: 'jpg',
      };

      const result = await convertHtmlToImage(options);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/jpeg');
      expect(htmlToImage.toJpeg).toHaveBeenCalled();
    });

    it('HTML을 SVG로 변환해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toSvg as jest.Mock).mockResolvedValue(mockSvgDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        format: 'svg',
      };

      const result = await convertHtmlToImage(options);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/svg+xml');
      expect(htmlToImage.toSvg).toHaveBeenCalled();
    });

    it('CSS를 포함하여 변환해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        css: 'body { background: red; }',
      };

      await convertHtmlToImage(options);

      const container = (document.body.appendChild as jest.Mock).mock.calls[0][0];
      expect(container.querySelector('style')).toBeTruthy();
    });

    it('배경색을 적용해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        backgroundColor: '#ffffff',
      };

      await convertHtmlToImage(options);

      const container = (document.body.appendChild as jest.Mock).mock.calls[0][0];
      // jsdom은 color를 rgb 형식으로 변환함
      expect(container.style.backgroundColor).toMatch(/^(#ffffff|rgb\(255,\s*255,\s*255\))$/);
      expect(htmlToImage.toPng).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({
          backgroundColor: '#ffffff',
        })
      );
    });

    it('커스텀 품질을 적용해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        quality: 0.5,
      };

      await convertHtmlToImage(options);

      expect(htmlToImage.toPng).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({
          quality: 0.5,
        })
      );
    });

    it('컨테이너를 화면 밖에 배치해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      await convertHtmlToImage(baseOptions);

      const container = (document.body.appendChild as jest.Mock).mock.calls[0][0];
      expect(container.style.position).toBe('fixed');
      expect(container.style.left).toBe('-99999px');
      expect(container.style.top).toBe('-99999px');
    });

    it('컨테이너 크기를 올바르게 설정해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      await convertHtmlToImage(baseOptions);

      const container = (document.body.appendChild as jest.Mock).mock.calls[0][0];
      expect(container.style.width).toBe('800px');
      expect(container.style.height).toBe('600px');
      expect(container.style.overflow).toBe('hidden');
    });

    it('변환 실패 시에도 컨테이너를 제거해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockRejectedValue(new Error('변환 실패'));

      await expect(convertHtmlToImage(baseOptions)).rejects.toThrow('변환 실패');

      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('빈 HTML을 처리해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        html: '',
      };

      const result = await convertHtmlToImage(options);

      expect(result).toBeInstanceOf(Blob);
    });

    it('복잡한 HTML을 처리해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue(mockPngDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        html: '<div><h1>제목</h1><p>내용</p><img src="test.jpg" /></div>',
      };

      const result = await convertHtmlToImage(options);

      expect(result).toBeInstanceOf(Blob);
    });

    it('SVG 변환 시 toSvg를 사용해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toSvg as jest.Mock).mockResolvedValue(mockSvgDataUrl);

      const options: HtmlToImageOptions = {
        ...baseOptions,
        format: 'svg',
      };

      const result = await convertHtmlToImage(options);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/svg+xml');
      expect(htmlToImage.toSvg).toHaveBeenCalled();
    });

    it('잘못된 data URL을 처리해야 함', async () => {
      const htmlToImage = await import('html-to-image');
      (htmlToImage.toPng as jest.Mock).mockResolvedValue('invalid-data-url');

      await expect(convertHtmlToImage(baseOptions)).rejects.toThrow();
    });
  });
});
