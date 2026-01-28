/**
 * heicConverter 서비스 유닛 테스트
 */
import { convertHeicToJpg, isHeicFile } from '@/services/heicConverter';

// heic-to 모킹
jest.mock('heic-to', () => ({
  heicTo: jest.fn(),
}));

describe('heicConverter', () => {
  const mockBlob = new Blob(['converted'], { type: 'image/jpeg' });
  const mockHeicFile = new File([mockBlob], 'photo.heic', { type: 'image/heic' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertHeicToJpg', () => {
    it('HEIC를 JPG로 변환해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockResolvedValue(mockBlob);

      const mockProgressFn = jest.fn();
      const result = await convertHeicToJpg(mockHeicFile, {}, mockProgressFn);

      expect(result).toBe(mockBlob);
      expect(heicTo).toHaveBeenCalledWith({
        blob: mockHeicFile,
        type: 'image/jpeg',
        quality: 0.9,
      });
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(30);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('HEIC를 PNG로 변환해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockResolvedValue(mockBlob);

      const result = await convertHeicToJpg(mockHeicFile, {
        toType: 'image/png',
        quality: 1.0,
      });

      expect(result).toBe(mockBlob);
      expect(heicTo).toHaveBeenCalledWith({
        blob: mockHeicFile,
        type: 'image/png',
        quality: 1.0,
      });
    });

    it('기본 품질 설정으로 변환해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockResolvedValue(mockBlob);

      await convertHeicToJpg(mockHeicFile);

      expect(heicTo).toHaveBeenCalledWith({
        blob: mockHeicFile,
        type: 'image/jpeg',
        quality: 0.9,
      });
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockResolvedValue(mockBlob);

      const result = await convertHeicToJpg(mockHeicFile);

      expect(result).toBe(mockBlob);
    });

    it('변환 실패 시 Error 객체로 에러를 던져야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockRejectedValue(new Error('변환 실패'));

      await expect(convertHeicToJpg(mockHeicFile)).rejects.toThrow('변환 실패');
    });

    it('변환 실패 시 문자열 에러를 처리해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockRejectedValue('문자열 에러');

      await expect(convertHeicToJpg(mockHeicFile)).rejects.toThrow('문자열 에러');
    });

    it('변환 실패 시 객체 에러를 처리해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockRejectedValue({ message: '객체 에러' });

      await expect(convertHeicToJpg(mockHeicFile)).rejects.toThrow('객체 에러');
    });

    it('변환 실패 시 에러 코드를 처리해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockRejectedValue({ code: 'ERR_INVALID_FORMAT' });

      await expect(convertHeicToJpg(mockHeicFile)).rejects.toThrow(
        'HEIC 변환 오류 (코드: ERR_INVALID_FORMAT)'
      );
    });

    it('변환 실패 시 알 수 없는 에러를 처리해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockRejectedValue({});

      await expect(convertHeicToJpg(mockHeicFile)).rejects.toThrow(
        'HEIC 파일 변환에 실패했습니다'
      );
    });

    it('커스텀 품질로 변환해야 함', async () => {
      const { heicTo } = await import('heic-to');
      (heicTo as jest.Mock).mockResolvedValue(mockBlob);

      await convertHeicToJpg(mockHeicFile, { quality: 0.5 });

      expect(heicTo).toHaveBeenCalledWith({
        blob: mockHeicFile,
        type: 'image/jpeg',
        quality: 0.5,
      });
    });
  });

  describe('isHeicFile', () => {
    it('HEIC 확장자를 가진 파일을 감지해야 함', () => {
      const heicFile = new File([mockBlob], 'photo.heic', { type: 'image/jpeg' });
      expect(isHeicFile(heicFile)).toBe(true);
    });

    it('HEIF 확장자를 가진 파일을 감지해야 함', () => {
      const heifFile = new File([mockBlob], 'photo.heif', { type: 'image/jpeg' });
      expect(isHeicFile(heifFile)).toBe(true);
    });

    it('대소문자를 구분하지 않아야 함', () => {
      const upperFile = new File([mockBlob], 'photo.HEIC', { type: 'image/jpeg' });
      const mixedFile = new File([mockBlob], 'photo.Heic', { type: 'image/jpeg' });
      expect(isHeicFile(upperFile)).toBe(true);
      expect(isHeicFile(mixedFile)).toBe(true);
    });

    it('MIME 타입으로 HEIC를 감지해야 함', () => {
      const heicTypeFile = new File([mockBlob], 'photo.jpg', { type: 'image/heic' });
      const heifTypeFile = new File([mockBlob], 'photo.jpg', { type: 'image/heif' });
      expect(isHeicFile(heicTypeFile)).toBe(true);
      expect(isHeicFile(heifTypeFile)).toBe(true);
    });

    it('비HEIC 파일을 false로 반환해야 함', () => {
      const jpgFile = new File([mockBlob], 'photo.jpg', { type: 'image/jpeg' });
      const pngFile = new File([mockBlob], 'photo.png', { type: 'image/png' });
      expect(isHeicFile(jpgFile)).toBe(false);
      expect(isHeicFile(pngFile)).toBe(false);
    });

    it('확장자가 없는 파일을 false로 반환해야 함', () => {
      const noExtFile = new File([mockBlob], 'photo', { type: 'image/jpeg' });
      expect(isHeicFile(noExtFile)).toBe(false);
    });

    it('다른 확장자를 가진 파일을 false로 반환해야 함', () => {
      const webpFile = new File([mockBlob], 'photo.webp', { type: 'image/webp' });
      expect(isHeicFile(webpFile)).toBe(false);
    });
  });
});
