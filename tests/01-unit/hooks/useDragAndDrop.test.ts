/**
 * useDragAndDrop 훅 유닛 테스트
 */
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '@/shared/hooks/useDragAndDrop';

/** 드래그 이벤트 mock 생성 헬퍼 */
function createDragEvent(files: File[] = []): React.DragEvent {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    dataTransfer: {
      files,
    },
  } as unknown as React.DragEvent;
}

/** input change 이벤트 mock 생성 헬퍼 */
function createInputEvent(files: File[] = []): React.ChangeEvent<HTMLInputElement> {
  return {
    target: {
      files,
      value: 'C:\\fakepath\\test.png',
    },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe('useDragAndDrop', () => {
  let mockOnFiles: jest.Mock;

  beforeEach(() => {
    mockOnFiles = jest.fn();
  });

  it('초기 상태에서 isDragging은 false여야 한다', () => {
    const { result } = renderHook(() => useDragAndDrop(mockOnFiles));

    expect(result.current.isDragging).toBe(false);
  });

  it('handleDragEnter: isDragging을 true로 설정해야 한다', () => {
    const { result } = renderHook(() => useDragAndDrop(mockOnFiles));
    const event = createDragEvent();

    act(() => {
      result.current.handleDragEnter(event);
    });

    expect(result.current.isDragging).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('handleDragLeave: isDragging을 false로 설정해야 한다', () => {
    const { result } = renderHook(() => useDragAndDrop(mockOnFiles));
    const enterEvent = createDragEvent();
    const leaveEvent = createDragEvent();

    // 먼저 드래그 진입
    act(() => {
      result.current.handleDragEnter(enterEvent);
    });
    expect(result.current.isDragging).toBe(true);

    // 드래그 이탈
    act(() => {
      result.current.handleDragLeave(leaveEvent);
    });

    expect(result.current.isDragging).toBe(false);
    expect(leaveEvent.preventDefault).toHaveBeenCalled();
    expect(leaveEvent.stopPropagation).toHaveBeenCalled();
  });

  it('handleDragOver: preventDefault를 호출해야 한다', () => {
    const { result } = renderHook(() => useDragAndDrop(mockOnFiles));
    const event = createDragEvent();

    act(() => {
      result.current.handleDragOver(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('handleDrop: isDragging을 false로 설정하고 onFiles 콜백을 호출해야 한다', () => {
    const { result } = renderHook(() => useDragAndDrop(mockOnFiles));
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    const event = createDragEvent([file]);

    // 먼저 드래그 진입
    act(() => {
      result.current.handleDragEnter(createDragEvent());
    });
    expect(result.current.isDragging).toBe(true);

    // 드롭
    act(() => {
      result.current.handleDrop(event);
    });

    expect(result.current.isDragging).toBe(false);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockOnFiles).toHaveBeenCalledWith([file]);
  });

  it('handleFileSelect: 파일 선택 시 onFiles 콜백을 호출해야 한다', () => {
    const { result } = renderHook(() => useDragAndDrop(mockOnFiles));
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const event = createInputEvent([file]);

    act(() => {
      result.current.handleFileSelect(event);
    });

    expect(mockOnFiles).toHaveBeenCalledWith([file]);
  });

  it('handleFileSelect: target.value를 빈 문자열로 초기화해야 한다', () => {
    const { result } = renderHook(() => useDragAndDrop(mockOnFiles));
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const event = createInputEvent([file]);

    act(() => {
      result.current.handleFileSelect(event);
    });

    expect(event.target.value).toBe('');
  });
});
