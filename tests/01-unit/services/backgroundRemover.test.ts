/**
 * backgroundRemover 서비스 유닛 테스트
 */
import { removeImageBackground, generateNewFilename } from '@/services/backgroundRemover';

// @imgly/background-removal 모킹
jest.mock('@imgly/background-removal', () => ({
  removeBackground: jest.fn(),
  Config: {},
}));

import { removeBackground } from '@imgly/background-removal';

describe('backgroundRemover', () => {
  const mockBlob = new Blob(['test'], { type: 'image/png' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('removeImageBackground', () => {
    it('배경 제거를 성공적으로 수행해야 함', async () => {
      const mockProgressFn = jest.fn();
      (removeBackground as jest.Mock).mockResolvedValue(mockBlob);

      const result = await removeImageBackground(mockFile, mockProgressFn);

      expect(result).toBe(mockBlob);
      expect(removeBackground).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          output: {
            format: 'image/png',
            quality: 1.0,
          },
        })
      );
    });

    it('진행률 콜백을 호출해야 함', async () => {
      const mockProgressFn = jest.fn();
      (removeBackground as jest.Mock).mockResolvedValue(mockBlob);

      await removeImageBackground(mockFile, mockProgressFn);

      // 최소 10%, 100% 호출 확인
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
      expect(mockProgressFn.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      (removeBackground as jest.Mock).mockResolvedValue(mockBlob);

      const result = await removeImageBackground(mockFile);

      expect(result).toBe(mockBlob);
    });

    it('배경 제거 실패 시 에러를 던져야 함', async () => {
      (removeBackground as jest.Mock).mockRejectedValue(new Error('모델 로드 실패'));

      await expect(removeImageBackground(mockFile)).rejects.toThrow(
        '배경 제거 중 오류가 발생했습니다'
      );
    });

    it('진행률 콜백에서 progress를 전달받아야 함', async () => {
      const mockProgressFn = jest.fn();
      (removeBackground as jest.Mock).mockImplementation(async (file, config) => {
        // progress 콜백 시뮬레이션
        config.progress('test', 50, 100);
        config.progress('test', 100, 100);
        return mockBlob;
      });

      await removeImageBackground(mockFile, mockProgressFn);

      // 10% (시작) + progress 콜백들 + 100% (완료)
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(50); // 10 + (50/100 * 80)
      expect(mockProgressFn).toHaveBeenCalledWith(90); // 10 + (100/100 * 80)
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });
  });

  describe('generateNewFilename', () => {
    it('확장자를 포함한 파일명에서 새 파일명을 생성해야 함', () => {
      expect(generateNewFilename('photo.jpg')).toBe('photo-no-bg.png');
      expect(generateNewFilename('image.png')).toBe('image-no-bg.png');
      expect(generateNewFilename('test.heic')).toBe('test-no-bg.png');
    });

    it('확장자가 없는 파일명도 처리해야 함', () => {
      expect(generateNewFilename('filename')).toBe('filename-no-bg.png');
    });

    it('여러 점이 있는 파일명을 처리해야 함', () => {
      expect(generateNewFilename('my.photo.backup.jpg')).toBe('my.photo.backup-no-bg.png');
    });

    it('점만 있는 파일명을 처리해야 함', () => {
      // 실제 구현: baseName = originalName.substring(0, originalName.lastIndexOf('.'))
      // '.jpg'의 경우 lastIndexOf('.')는 0이므로 substring(0, 0)은 빈 문자열
      // 따라서 baseName || originalName에서 originalName('.jpg')이 사용됨
      expect(generateNewFilename('.jpg')).toBe('.jpg-no-bg.png');
    });

    it('확장자 대소문자를 구분하지 않아야 함', () => {
      expect(generateNewFilename('photo.JPG')).toBe('photo-no-bg.png');
      expect(generateNewFilename('image.PNG')).toBe('image-no-bg.png');
    });
  });
});
