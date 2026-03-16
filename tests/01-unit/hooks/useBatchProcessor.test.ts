/**
 * useBatchProcessor 훅 유닛 테스트
 */
import { renderHook, act } from '@testing-library/react';
import { useBatchProcessor } from '@/shared/hooks/useBatchProcessor';
import type { BaseFile } from '@/shared/hooks/useFileManager';

/** 테스트용 파일 객체 생성 헬퍼 */
function createMockFile(overrides: Partial<BaseFile> = {}): BaseFile {
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

describe('useBatchProcessor', () => {
  let mockUpdateFile: jest.Mock;

  beforeEach(() => {
    mockUpdateFile = jest.fn();
  });

  it('초기 상태에서 isProcessing은 false여야 한다', () => {
    const { result } = renderHook(() =>
      useBatchProcessor({ updateFile: mockUpdateFile, pendingFiles: [] })
    );

    expect(result.current.isProcessing).toBe(false);
  });

  it('processAll: pending 파일을 순차 처리하여 completed 상태로 만들어야 한다', async () => {
    const files = [
      createMockFile({ id: 'f1', status: 'pending' }),
      createMockFile({ id: 'f2', status: 'pending' }),
    ];
    const mockResult = new Blob(['result']);

    const { result } = renderHook(() =>
      useBatchProcessor({ updateFile: mockUpdateFile, pendingFiles: files })
    );

    const processFn = jest.fn().mockResolvedValue({ result: mockResult });

    await act(async () => {
      await result.current.processAll(processFn);
    });

    // 각 파일에 대해 processing 시작 호출 확인
    expect(mockUpdateFile).toHaveBeenCalledWith('f1', { status: 'processing', progress: 0 });
    expect(mockUpdateFile).toHaveBeenCalledWith('f2', { status: 'processing', progress: 0 });

    // 각 파일에 대해 completed 호출 확인
    expect(mockUpdateFile).toHaveBeenCalledWith('f1', {
      status: 'completed',
      progress: 100,
      result: mockResult,
    });
    expect(mockUpdateFile).toHaveBeenCalledWith('f2', {
      status: 'completed',
      progress: 100,
      result: mockResult,
    });

    // processFn이 2번 호출되어야 한다
    expect(processFn).toHaveBeenCalledTimes(2);
  });

  it('processAll: 처리 중 진행률이 업데이트되어야 한다', async () => {
    const files = [createMockFile({ id: 'f1', status: 'pending' })];

    const { result } = renderHook(() =>
      useBatchProcessor({ updateFile: mockUpdateFile, pendingFiles: files })
    );

    // processFn 내부에서 onProgress 콜백 호출
    const processFn = jest.fn().mockImplementation(async (_file, onProgress) => {
      onProgress(25);
      onProgress(50);
      onProgress(75);
      return { result: new Blob(['done']) };
    });

    await act(async () => {
      await result.current.processAll(processFn);
    });

    expect(mockUpdateFile).toHaveBeenCalledWith('f1', { progress: 25 });
    expect(mockUpdateFile).toHaveBeenCalledWith('f1', { progress: 50 });
    expect(mockUpdateFile).toHaveBeenCalledWith('f1', { progress: 75 });
  });

  it('processAll: 개별 파일 에러 시 나머지 파일은 계속 처리해야 한다', async () => {
    const files = [
      createMockFile({ id: 'f1', status: 'pending' }),
      createMockFile({ id: 'f2', status: 'pending' }),
    ];

    const { result } = renderHook(() =>
      useBatchProcessor({ updateFile: mockUpdateFile, pendingFiles: files })
    );

    const processFn = jest.fn()
      .mockRejectedValueOnce(new Error('처리 실패'))
      .mockResolvedValueOnce({ result: new Blob(['ok']) });

    await act(async () => {
      await result.current.processAll(processFn);
    });

    // 첫 번째 파일은 에러 상태
    expect(mockUpdateFile).toHaveBeenCalledWith('f1', {
      status: 'error',
      error: '처리 실패',
    });

    // 두 번째 파일은 정상 완료
    expect(mockUpdateFile).toHaveBeenCalledWith('f2', {
      status: 'completed',
      progress: 100,
      result: expect.any(Blob),
    });
  });

  it('processAll: pendingFiles가 비어있으면 즉시 완료해야 한다', async () => {
    const { result } = renderHook(() =>
      useBatchProcessor({ updateFile: mockUpdateFile, pendingFiles: [] })
    );

    const processFn = jest.fn();

    await act(async () => {
      await result.current.processAll(processFn);
    });

    expect(processFn).not.toHaveBeenCalled();
    expect(mockUpdateFile).not.toHaveBeenCalled();
    expect(result.current.isProcessing).toBe(false);
  });

  it('isProcessing: 처리 중에는 true, 완료 후에는 false여야 한다', async () => {
    const files = [createMockFile({ id: 'f1', status: 'pending' })];

    const { result } = renderHook(() =>
      useBatchProcessor({ updateFile: mockUpdateFile, pendingFiles: files })
    );

    expect(result.current.isProcessing).toBe(false);

    let resolveProcess: () => void;
    const processFn = jest.fn().mockImplementation(
      () => new Promise<Partial<BaseFile>>((resolve) => {
        resolveProcess = () => resolve({ result: new Blob(['done']) });
      })
    );

    let processPromise: Promise<void>;
    act(() => {
      processPromise = result.current.processAll(processFn);
    });

    // 처리 중 상태 확인
    expect(result.current.isProcessing).toBe(true);

    // 처리 완료
    await act(async () => {
      resolveProcess!();
      await processPromise!;
    });

    expect(result.current.isProcessing).toBe(false);
  });
});
