/**
 * useFileManager 훅 유닛 테스트
 */
import { renderHook, act } from '@testing-library/react';
import { useFileManager, type BaseFile } from '@/shared/hooks/useFileManager';

/** 테스트용 파일 객체 생성 헬퍼 */
function createMockFile(overrides: Partial<BaseFile> = {}): BaseFile {
  return {
    id: 'file-1',
    originalFile: new File(['dummy'], 'test.png', { type: 'image/png' }),
    originalName: 'test.png',
    preview: 'blob:mock-preview-1',
    status: 'pending',
    progress: 0,
    ...overrides,
  };
}

describe('useFileManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── addFiles ───────────────────────────────────────────────
  describe('addFiles', () => {
    it('파일을 추가할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFileManager());
      const file = createMockFile();

      act(() => {
        result.current.addFiles([file]);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toEqual(file);
    });

    it('기존 파일 목록에 새 파일이 추가되어야 한다', () => {
      const { result } = renderHook(() => useFileManager());
      const file1 = createMockFile({ id: 'file-1' });
      const file2 = createMockFile({ id: 'file-2', originalName: 'test2.png' });

      act(() => {
        result.current.addFiles([file1]);
      });
      act(() => {
        result.current.addFiles([file2]);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0].id).toBe('file-1');
      expect(result.current.files[1].id).toBe('file-2');
    });
  });

  // ─── updateFile ─────────────────────────────────────────────
  describe('updateFile', () => {
    it('특정 id의 파일을 부분 업데이트할 수 있어야 한다', () => {
      const { result } = renderHook(() => useFileManager());
      const file = createMockFile({ id: 'file-1', status: 'pending', progress: 0 });

      act(() => {
        result.current.addFiles([file]);
      });
      act(() => {
        result.current.updateFile('file-1', { status: 'processing', progress: 50 });
      });

      expect(result.current.files[0].status).toBe('processing');
      expect(result.current.files[0].progress).toBe(50);
      // 변경하지 않은 필드는 유지되어야 한다
      expect(result.current.files[0].originalName).toBe('test.png');
    });

    it('존재하지 않는 id로 업데이트 시 변경이 없어야 한다', () => {
      const { result } = renderHook(() => useFileManager());
      const file = createMockFile({ id: 'file-1' });

      act(() => {
        result.current.addFiles([file]);
      });
      act(() => {
        result.current.updateFile('nonexistent-id', { status: 'completed' });
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].status).toBe('pending');
    });
  });

  // ─── removeFile ─────────────────────────────────────────────
  describe('removeFile', () => {
    it('파일을 제거하고 URL.revokeObjectURL을 호출해야 한다', () => {
      const { result } = renderHook(() => useFileManager());
      const file = createMockFile({ id: 'file-1', preview: 'blob:mock-preview' });

      act(() => {
        result.current.addFiles([file]);
      });
      act(() => {
        result.current.removeFile('file-1');
      });

      expect(result.current.files).toHaveLength(0);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-preview');
    });
  });

  // ─── clearAll ───────────────────────────────────────────────
  describe('clearAll', () => {
    it('전체 파일을 초기화하고 모든 preview URL을 해제해야 한다', () => {
      const { result } = renderHook(() => useFileManager());
      const file1 = createMockFile({ id: 'file-1', preview: 'blob:preview-1' });
      const file2 = createMockFile({ id: 'file-2', preview: 'blob:preview-2' });

      act(() => {
        result.current.addFiles([file1, file2]);
      });
      act(() => {
        result.current.clearAll();
      });

      expect(result.current.files).toHaveLength(0);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-2');
    });
  });

  // ─── 필터링 및 카운트 ──────────────────────────────────────
  describe('pendingFiles / completedFiles', () => {
    it('pending과 error 상태의 파일만 pendingFiles에 포함되어야 한다', () => {
      const { result } = renderHook(() => useFileManager());

      act(() => {
        result.current.addFiles([
          createMockFile({ id: '1', status: 'pending' }),
          createMockFile({ id: '2', status: 'processing' }),
          createMockFile({ id: '3', status: 'error' }),
          createMockFile({ id: '4', status: 'completed' }),
        ]);
      });

      expect(result.current.pendingFiles).toHaveLength(2);
      expect(result.current.pendingFiles.map((f) => f.id)).toEqual(['1', '3']);
    });

    it('completed 상태의 파일만 completedFiles에 포함되어야 한다', () => {
      const { result } = renderHook(() => useFileManager());

      act(() => {
        result.current.addFiles([
          createMockFile({ id: '1', status: 'pending' }),
          createMockFile({ id: '2', status: 'completed' }),
          createMockFile({ id: '3', status: 'completed' }),
        ]);
      });

      expect(result.current.completedFiles).toHaveLength(2);
      expect(result.current.completedFiles.map((f) => f.id)).toEqual(['2', '3']);
    });
  });

  describe('pendingCount / completedCount', () => {
    it('정확한 카운트를 반환해야 한다', () => {
      const { result } = renderHook(() => useFileManager());

      act(() => {
        result.current.addFiles([
          createMockFile({ id: '1', status: 'pending' }),
          createMockFile({ id: '2', status: 'error' }),
          createMockFile({ id: '3', status: 'completed' }),
          createMockFile({ id: '4', status: 'processing' }),
          createMockFile({ id: '5', status: 'completed' }),
        ]);
      });

      expect(result.current.pendingCount).toBe(2);
      expect(result.current.completedCount).toBe(2);
    });
  });
});
