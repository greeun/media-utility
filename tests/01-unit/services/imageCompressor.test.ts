/**
 * imageCompressor 서비스 유닛 테스트
 */
import { compressImage, formatFileSize, CompressionOptions } from '@/services/imageCompressor';

// browser-image-compression 모킹
jest.mock('browser-image-compression', () => jest.fn());

import imageCompression from 'browser-image-compression';

describe('imageCompressor', () => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });
  Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compressImage', () => {
    it('이미지를 압축해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 512 * 1024 }); // 0.5MB
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.8,
      };

      const result = await compressImage(mockFile, options);

      expect(result.blob).toBe(compressedBlob);
      expect(result.originalSize).toBe(1024 * 1024);
      expect(result.compressedSize).toBe(512 * 1024);
      expect(result.ratio).toBe(50); // 50% 압축
      expect(imageCompression).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          initialQuality: 0.8,
          useWebWorker: true,
        })
      );
    });

    it('maxSizeMB 옵션을 적용해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 256 * 1024 });
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.8,
        maxSizeMB: 0.5,
      };

      await compressImage(mockFile, options);

      expect(imageCompression).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          maxSizeMB: 0.5,
        })
      );
    });

    it('maxSizeMB가 없으면 자동 계산해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 512 * 1024 });
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.8,
      };

      await compressImage(mockFile, options);

      // 원본 크기(1MB) + 1 = 2MB
      expect(imageCompression).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          maxSizeMB: 2,
        })
      );
    });

    it('maxWidthOrHeight 옵션을 적용해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 512 * 1024 });
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.8,
        maxWidthOrHeight: 1920,
      };

      await compressImage(mockFile, options);

      expect(imageCompression).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          maxWidthOrHeight: 1920,
        })
      );
    });

    it('진행률 콜백을 호출해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 512 * 1024 });

      (imageCompression as jest.Mock).mockImplementation((file, options) => {
        options.onProgress?.(50);
        options.onProgress?.(100);
        return Promise.resolve(compressedBlob);
      });

      const mockProgressFn = jest.fn();
      const options: CompressionOptions = {
        quality: 0.8,
      };

      await compressImage(mockFile, options, mockProgressFn);

      expect(mockProgressFn).toHaveBeenCalledWith(50);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 512 * 1024 });
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.8,
      };

      const result = await compressImage(mockFile, options);

      expect(result.blob).toBe(compressedBlob);
    });

    it('압축률을 정확하게 계산해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 256 * 1024 }); // 0.25MB
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.8,
      };

      const result = await compressImage(mockFile, options);

      // (1 - 0.25/1) * 100 = 75%
      expect(result.ratio).toBe(75);
    });

    it('원본 크기가 0일 때 압축률을 0으로 계산해야 함', async () => {
      const zeroSizeFile = new File([mockBlob], 'empty.jpg', { type: 'image/jpeg' });
      Object.defineProperty(zeroSizeFile, 'size', { value: 0 });

      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 0 });
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.8,
      };

      const result = await compressImage(zeroSizeFile, options);

      expect(result.ratio).toBe(0);
    });

    it('압축 실패 시 에러를 던져야 함', async () => {
      (imageCompression as jest.Mock).mockRejectedValue(new Error('압축 실패'));

      const options: CompressionOptions = {
        quality: 0.8,
      };

      await expect(compressImage(mockFile, options)).rejects.toThrow('압축 실패');
    });

    it('매우 높은 품질로 압축해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 900 * 1024 });
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 1.0,
      };

      const result = await compressImage(mockFile, options);

      expect(result.ratio).toBe(12); // 약간의 압축
    });

    it('매우 낮은 품질로 압축해야 함', async () => {
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });
      Object.defineProperty(compressedBlob, 'size', { value: 100 * 1024 });
      (imageCompression as jest.Mock).mockResolvedValue(compressedBlob);

      const options: CompressionOptions = {
        quality: 0.1,
      };

      const result = await compressImage(mockFile, options);

      expect(result.ratio).toBe(90); // 높은 압축률
    });
  });

  describe('formatFileSize', () => {
    it('바이트를 포맷해야 함', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('킬로바이트를 포맷해야 함', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(5120)).toBe('5.0 KB');
      expect(formatFileSize(10240)).toBe('10.0 KB');
      expect(formatFileSize(1024 * 100)).toBe('100.0 KB');
      expect(formatFileSize(1024 * 999)).toBe('999.0 KB');
    });

    it('메가바이트를 포맷해야 함', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 5)).toBe('5.00 MB');
      expect(formatFileSize(1024 * 1024 * 10)).toBe('10.00 MB');
      expect(formatFileSize(1024 * 1024 * 100)).toBe('100.00 MB');
    });

    it('소수점을 올바르게 표시해야 함', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5KB
      expect(formatFileSize(2560)).toBe('2.5 KB'); // 2.5KB
      expect(formatFileSize(1536 * 1024)).toBe('1.50 MB'); // 1.5MB
      expect(formatFileSize(2560 * 1024)).toBe('2.50 MB'); // 2.5MB
    });

    it('큰 파일 크기를 포맷해야 함', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1024.00 MB'); // 1GB
      expect(formatFileSize(1024 * 1024 * 1024 * 2)).toBe('2048.00 MB'); // 2GB
    });

    it('0 바이트를 포맷해야 함', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('1 바이트를 포맷해야 함', () => {
      expect(formatFileSize(1)).toBe('1 B');
    });

    it('KB 경계값을 올바르게 포맷해야 함', () => {
      expect(formatFileSize(1023)).toBe('1023 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1025)).toBe('1.0 KB');
    });

    it('MB 경계값을 올바르게 포맷해야 함', () => {
      expect(formatFileSize(1024 * 1023)).toBe('1023.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1025)).toBe('1.00 MB');
    });
  });
});
