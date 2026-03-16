/**
 * useDownloader 훅 유닛 테스트
 */
import { renderHook } from '@testing-library/react';
import { useDownloader } from '@/shared/hooks/useDownloader';
import type { BaseFile } from '@/shared/hooks/useFileManager';
import { saveAs } from 'file-saver';

// file-saver 모듈 mock
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

/** 테스트용 파일 객체 생성 헬퍼 */
function createMockBaseFile(overrides: Partial<BaseFile> = {}): BaseFile {
  return {
    id: 'file-1',
    originalFile: new File(['dummy'], 'test.png', { type: 'image/png' }),
    originalName: 'test.png',
    preview: 'blob:mock-preview',
    status: 'pending',
    progress: 0,
    ...overrides,
  };
}

describe('useDownloader', () => {
  const mockGenerateFilename = jest.fn((file: BaseFile) => `converted-${file.originalName}`);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadFile', () => {
    it('result가 있는 파일은 saveAs를 호출해야 한다', () => {
      const { result } = renderHook(() =>
        useDownloader({ generateFilename: mockGenerateFilename })
      );

      const blob = new Blob(['result-data'], { type: 'image/webp' });
      const file = createMockBaseFile({
        id: 'f1',
        originalName: 'photo.png',
        status: 'completed',
        result: blob,
      });

      result.current.downloadFile(file);

      expect(saveAs).toHaveBeenCalledWith(blob, 'converted-photo.png');
      expect(saveAs).toHaveBeenCalledTimes(1);
    });

    it('result가 없는 파일은 saveAs를 호출하지 않아야 한다', () => {
      const { result } = renderHook(() =>
        useDownloader({ generateFilename: mockGenerateFilename })
      );

      const file = createMockBaseFile({
        id: 'f1',
        status: 'pending',
        result: undefined,
      });

      result.current.downloadFile(file);

      expect(saveAs).not.toHaveBeenCalled();
    });
  });

  describe('downloadAll', () => {
    it('completed 상태이면서 result가 있는 파일만 다운로드해야 한다', () => {
      const { result } = renderHook(() =>
        useDownloader({ generateFilename: mockGenerateFilename })
      );

      const blob1 = new Blob(['data1']);
      const blob2 = new Blob(['data2']);

      const files = [
        createMockBaseFile({ id: 'f1', status: 'completed', result: blob1, originalName: 'a.png' }),
        createMockBaseFile({ id: 'f2', status: 'pending', result: undefined, originalName: 'b.png' }),
        createMockBaseFile({ id: 'f3', status: 'completed', result: blob2, originalName: 'c.png' }),
        createMockBaseFile({ id: 'f4', status: 'error', result: undefined, originalName: 'd.png' }),
      ];

      result.current.downloadAll(files);

      expect(saveAs).toHaveBeenCalledTimes(2);
      expect(saveAs).toHaveBeenCalledWith(blob1, 'converted-a.png');
      expect(saveAs).toHaveBeenCalledWith(blob2, 'converted-c.png');
    });

    it('completed 파일이 없으면 saveAs를 호출하지 않아야 한다', () => {
      const { result } = renderHook(() =>
        useDownloader({ generateFilename: mockGenerateFilename })
      );

      const files = [
        createMockBaseFile({ id: 'f1', status: 'pending' }),
        createMockBaseFile({ id: 'f2', status: 'error' }),
      ];

      result.current.downloadAll(files);

      expect(saveAs).not.toHaveBeenCalled();
    });
  });
});
