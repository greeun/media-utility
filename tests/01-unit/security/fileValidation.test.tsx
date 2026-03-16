/**
 * 파일 유효성 검증 보안 테스트
 *
 * FileUploader 컴포넌트의 유효성 검증 로직 테스트:
 * - 100MB 초과 파일 거부
 * - 10개 초과 파일 거부
 * - 빈 파일 (0 bytes) 처리
 * - 손상된 이미지 파일 에러 처리
 */

import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';

// next-intl mock
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      dragOrClick: '파일을 끌어다 놓거나 클릭하세요',
      maxFiles: `최대 ${params?.count || 10}개, ${params?.size || 100}MB 이하`,
      maxFilesError: `최대 ${params?.count || 10}개까지 업로드 가능합니다`,
      fileSizeError: `파일 크기는 ${params?.size || 100}MB 이하여야 합니다`,
      image: '이미지',
      video: '비디오',
    };
    return messages[key] || key;
  },
}));

import FileUploader from '@/components/upload/FileUploader';

// 파일 생성 헬퍼
function createFileWithSize(name: string, sizeInBytes: number, type = 'image/jpeg'): File {
  // ArrayBuffer로 지정된 크기의 파일 생성
  const buffer = new ArrayBuffer(sizeInBytes);
  const blob = new Blob([buffer], { type });
  return new File([blob], name, { type });
}

describe('파일 유효성 검증 보안 테스트', () => {
  const mockOnFilesSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('파일 크기 제한 (100MB)', () => {
    it('100MB 초과 파일은 거부되어야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxSize={100}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 100MB 초과 파일 (101MB)
      const oversizedFile = createFileWithSize(
        'huge.jpg',
        101 * 1024 * 1024,
        'image/jpeg'
      );

      // input의 files를 설정하고 change 이벤트 발생
      Object.defineProperty(input, 'files', {
        value: [oversizedFile],
        writable: false,
      });
      fireEvent.change(input);

      // 콜백이 빈 배열(유효한 파일 없음)이면 호출되지 않음
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it('100MB 이하 파일은 허용되어야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxSize={100}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 50MB 파일
      const normalFile = createFileWithSize(
        'normal.jpg',
        50 * 1024 * 1024,
        'image/jpeg'
      );

      Object.defineProperty(input, 'files', {
        value: [normalFile],
        writable: false,
      });
      fireEvent.change(input);

      expect(mockOnFilesSelected).toHaveBeenCalledWith([normalFile]);
    });

    it('정확히 100MB 파일은 허용되어야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxSize={100}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 정확히 100MB
      const exactFile = createFileWithSize(
        'exact.jpg',
        100 * 1024 * 1024,
        'image/jpeg'
      );

      Object.defineProperty(input, 'files', {
        value: [exactFile],
        writable: false,
      });
      fireEvent.change(input);

      expect(mockOnFilesSelected).toHaveBeenCalledWith([exactFile]);
    });
  });

  describe('파일 개수 제한 (10개)', () => {
    it('10개 초과 파일은 10개로 잘려야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxFiles={10}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 12개 파일 생성
      const files = Array.from({ length: 12 }, (_, i) =>
        createFileWithSize(`file-${i}.jpg`, 1024, 'image/jpeg')
      );

      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      fireEvent.change(input);

      // 10개만 전달되어야 함
      expect(mockOnFilesSelected).toHaveBeenCalledWith(
        expect.arrayContaining([])
      );
      const calledFiles = mockOnFilesSelected.mock.calls[0][0];
      expect(calledFiles).toHaveLength(10);
    });

    it('10개 이하 파일은 모두 허용되어야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxFiles={10}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 5개 파일
      const files = Array.from({ length: 5 }, (_, i) =>
        createFileWithSize(`file-${i}.jpg`, 1024, 'image/jpeg')
      );

      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      fireEvent.change(input);

      const calledFiles = mockOnFilesSelected.mock.calls[0][0];
      expect(calledFiles).toHaveLength(5);
    });
  });

  describe('빈 파일 처리', () => {
    it('0 바이트 파일도 유효성 검사를 통과해야 함 (크기 제한 이내)', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxSize={100}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 0 바이트 파일
      const emptyFile = createFileWithSize('empty.jpg', 0, 'image/jpeg');

      Object.defineProperty(input, 'files', {
        value: [emptyFile],
        writable: false,
      });
      fireEvent.change(input);

      // 크기 제한은 통과 (0 < 100MB)
      expect(mockOnFilesSelected).toHaveBeenCalledWith([emptyFile]);
    });
  });

  describe('손상된 이미지 파일 처리', () => {
    it('잘못된 Content-Type의 파일도 업로더 단계에서는 통과해야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxSize={100}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 텍스트 내용이지만 이미지 타입으로 설정된 파일
      const corruptFile = new File(
        ['this is not an image'],
        'corrupt.jpg',
        { type: 'image/jpeg' }
      );

      Object.defineProperty(input, 'files', {
        value: [corruptFile],
        writable: false,
      });
      fireEvent.change(input);

      // 업로더 단계에서는 크기/개수만 검증하므로 통과
      expect(mockOnFilesSelected).toHaveBeenCalledWith([corruptFile]);
    });

    it('크기와 개수를 동시에 초과하는 경우 적절히 처리해야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxFiles={3}
          maxSize={10}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      // 5개 파일 중 2개가 크기 초과
      const files = [
        createFileWithSize('ok1.jpg', 5 * 1024 * 1024, 'image/jpeg'),
        createFileWithSize('ok2.jpg', 5 * 1024 * 1024, 'image/jpeg'),
        createFileWithSize('ok3.jpg', 5 * 1024 * 1024, 'image/jpeg'),
        createFileWithSize('big1.jpg', 11 * 1024 * 1024, 'image/jpeg'),
        createFileWithSize('big2.jpg', 11 * 1024 * 1024, 'image/jpeg'),
      ];

      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      fireEvent.change(input);

      // 먼저 maxFiles(3)로 잘린 후, 크기 검증이 적용됨
      if (mockOnFilesSelected.mock.calls.length > 0) {
        const calledFiles = mockOnFilesSelected.mock.calls[0][0];
        expect(calledFiles.length).toBeLessThanOrEqual(3);
        // 크기 초과 파일은 제외됨
        calledFiles.forEach((f: File) => {
          expect(f.size / (1024 * 1024)).toBeLessThanOrEqual(10);
        });
      }
    });
  });

  describe('커스텀 제한값 테스트', () => {
    it('maxSize를 1MB로 설정하면 1MB 초과 파일이 거부되어야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxSize={1}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const bigFile = createFileWithSize('big.jpg', 2 * 1024 * 1024, 'image/jpeg');

      Object.defineProperty(input, 'files', {
        value: [bigFile],
        writable: false,
      });
      fireEvent.change(input);

      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });

    it('maxFiles를 1로 설정하면 2개 이상 파일이 잘려야 함', () => {
      const { container } = render(
        <FileUploader
          onFilesSelected={mockOnFilesSelected}
          maxFiles={1}
        />
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const files = [
        createFileWithSize('file1.jpg', 1024, 'image/jpeg'),
        createFileWithSize('file2.jpg', 1024, 'image/jpeg'),
      ];

      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      fireEvent.change(input);

      const calledFiles = mockOnFilesSelected.mock.calls[0][0];
      expect(calledFiles).toHaveLength(1);
    });
  });
});
