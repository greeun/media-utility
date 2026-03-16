/**
 * 배치 처리 통합 테스트
 *
 * useFileManager + useBatchProcessor 연동 검증
 * - 파일 추가 → 배치 처리 → 상태 변화 확인
 * - 일부 파일 실패 시 나머지 계속 처리
 */

import { renderHook, act } from '@testing-library/react';
import { useFileManager, BaseFile } from '@/shared/hooks/useFileManager';
import { useBatchProcessor } from '@/shared/hooks/useBatchProcessor';

describe('배치 처리 통합 테스트', () => {
  // 테스트용 파일 생성 헬퍼
  function createMockFile(id: string, name: string): BaseFile {
    const blob = new Blob(['test-data'], { type: 'image/jpeg' });
    const file = new File([blob], name, { type: 'image/jpeg' });
    return {
      id,
      originalFile: file,
      originalName: name,
      preview: `blob:preview-${id}`,
      status: 'pending',
      progress: 0,
    };
  }

  it('파일 추가 후 배치 처리 시 상태가 completed로 변경되어야 함', async () => {
    // useFileManager 훅 렌더링
    const { result: fileManagerResult } = renderHook(() =>
      useFileManager<BaseFile>()
    );

    // 파일 추가
    act(() => {
      fileManagerResult.current.addFiles([
        createMockFile('file-1', 'image1.jpg'),
        createMockFile('file-2', 'image2.jpg'),
      ]);
    });

    expect(fileManagerResult.current.files).toHaveLength(2);
    expect(fileManagerResult.current.pendingCount).toBe(2);

    // useBatchProcessor 훅 렌더링
    const { result: batchResult } = renderHook(() =>
      useBatchProcessor<BaseFile>({
        updateFile: fileManagerResult.current.updateFile,
        pendingFiles: fileManagerResult.current.pendingFiles,
      })
    );

    // 배치 처리 실행 (성공하는 처리 함수)
    const processFn = jest.fn(
      async (file: BaseFile, onProgress: (p: number) => void) => {
        onProgress(50);
        onProgress(100);
        return {
          result: new Blob(['processed'], { type: 'image/jpeg' }),
        } as Partial<BaseFile>;
      }
    );

    await act(async () => {
      await batchResult.current.processAll(processFn);
    });

    // 모든 파일이 처리되었는지 확인
    expect(processFn).toHaveBeenCalledTimes(2);
    expect(fileManagerResult.current.completedCount).toBe(2);
    expect(fileManagerResult.current.files[0].status).toBe('completed');
    expect(fileManagerResult.current.files[1].status).toBe('completed');
  });

  it('일부 파일 실패 시 나머지 파일은 계속 처리되어야 함', async () => {
    const { result: fileManagerResult } = renderHook(() =>
      useFileManager<BaseFile>()
    );

    act(() => {
      fileManagerResult.current.addFiles([
        createMockFile('file-a', 'success.jpg'),
        createMockFile('file-b', 'fail.jpg'),
        createMockFile('file-c', 'success2.jpg'),
      ]);
    });

    expect(fileManagerResult.current.files).toHaveLength(3);

    const { result: batchResult } = renderHook(() =>
      useBatchProcessor<BaseFile>({
        updateFile: fileManagerResult.current.updateFile,
        pendingFiles: fileManagerResult.current.pendingFiles,
      })
    );

    // 두 번째 파일만 실패하는 처리 함수
    const processFn = jest.fn(
      async (file: BaseFile, onProgress: (p: number) => void) => {
        if (file.originalName === 'fail.jpg') {
          throw new Error('처리 실패');
        }
        onProgress(100);
        return {
          result: new Blob(['processed'], { type: 'image/jpeg' }),
        } as Partial<BaseFile>;
      }
    );

    await act(async () => {
      await batchResult.current.processAll(processFn);
    });

    // 3개 모두 처리 시도됨
    expect(processFn).toHaveBeenCalledTimes(3);

    // 성공 파일 확인
    const files = fileManagerResult.current.files;
    expect(files.find((f) => f.id === 'file-a')?.status).toBe('completed');
    expect(files.find((f) => f.id === 'file-c')?.status).toBe('completed');

    // 실패 파일 확인
    const failedFile = files.find((f) => f.id === 'file-b');
    expect(failedFile?.status).toBe('error');
    expect(failedFile?.error).toBe('처리 실패');
  });

  it('빈 파일 목록으로 배치 처리 시 아무것도 실행되지 않아야 함', async () => {
    const { result: fileManagerResult } = renderHook(() =>
      useFileManager<BaseFile>()
    );

    const { result: batchResult } = renderHook(() =>
      useBatchProcessor<BaseFile>({
        updateFile: fileManagerResult.current.updateFile,
        pendingFiles: fileManagerResult.current.pendingFiles,
      })
    );

    const processFn = jest.fn();

    await act(async () => {
      await batchResult.current.processAll(processFn);
    });

    expect(processFn).not.toHaveBeenCalled();
    expect(batchResult.current.isProcessing).toBe(false);
  });

  it('파일 제거 후 배치 처리 시 제거된 파일은 처리하지 않아야 함', async () => {
    const { result: fileManagerResult } = renderHook(() =>
      useFileManager<BaseFile>()
    );

    act(() => {
      fileManagerResult.current.addFiles([
        createMockFile('file-x', 'keep.jpg'),
        createMockFile('file-y', 'remove.jpg'),
      ]);
    });

    // 파일 하나 제거
    act(() => {
      fileManagerResult.current.removeFile('file-y');
    });

    expect(fileManagerResult.current.files).toHaveLength(1);

    const { result: batchResult } = renderHook(() =>
      useBatchProcessor<BaseFile>({
        updateFile: fileManagerResult.current.updateFile,
        pendingFiles: fileManagerResult.current.pendingFiles,
      })
    );

    const processFn = jest.fn(async () => ({
      result: new Blob(['processed'], { type: 'image/jpeg' }),
    }));

    await act(async () => {
      await batchResult.current.processAll(processFn);
    });

    // 제거되지 않은 파일만 처리됨
    expect(processFn).toHaveBeenCalledTimes(1);
  });
});
