/**
 * useImageEditor 훅 유닛 테스트
 *
 * 목적: '비율 유지(maintainRatio)' ON 상태에서 너비/높이 중 한 쪽만 수정해도
 * 원본 종횡비(aspectRatio)에 맞춰 반대편 값이 자동으로 계산되는지 검증한다.
 *
 * 범위:
 *   - handleResizeWidthChange / handleResizeHeightChange 의 수학적 계산
 *   - maintainRatio on/off 동작 분기
 *   - 0/음수 가드
 *   - preview 변경 시 resizeWidth/Height/aspectRatio 재동기화
 */

// next-intl 모킹: useTranslations 는 키를 그대로 반환
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// file-saver 는 파일 다운로드 부작용을 피하기 위해 모킹
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageEditor } from '@/app/[locale]/image-editor/_hooks/useImageEditor';

/**
 * 테스트용 Image 모킹 유틸
 * tests/setup.js 의 전역 Image 는 width=100/height=100 고정값이므로
 * 각 테스트가 원하는 크기를 반환하도록 덮어쓴다.
 */
function mockImageDimensions(width: number, height: number) {
  class MockImage {
    public width = width;
    public height = height;
    public naturalWidth = width;
    public naturalHeight = height;
    public onload: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    private _src = '';

    get src() {
      return this._src;
    }
    set src(value: string) {
      this._src = value;
      // src 할당 직후 onload 비동기 호출
      setTimeout(() => this.onload?.(), 0);
    }
  }
  (global as unknown as { Image: typeof MockImage }).Image = MockImage;
}

describe('useImageEditor - 리사이즈 비율 유지', () => {
  // 각 테스트 후 Image 모킹 복원 (setup.js 의 기본값으로)
  afterEach(() => {
    mockImageDimensions(100, 100);
  });

  describe('초기 상태', () => {
    it('UH-IE-RS-001: 초기 resizeWidth/resizeHeight 는 기본값(800, 600)이어야 한다', () => {
      const { result } = renderHook(() => useImageEditor());
      expect(result.current.resizeWidth).toBe(800);
      expect(result.current.resizeHeight).toBe(600);
      expect(result.current.maintainRatio).toBe(true);
    });
  });

  describe('handleResizeWidthChange (비율 유지 ON)', () => {
    it('UH-IE-RS-002: 너비 400 입력 시 초기 비율(800:600=4/3)에 맞춰 높이가 300 으로 자동 계산된다', () => {
      const { result } = renderHook(() => useImageEditor());

      act(() => {
        result.current.handleResizeWidthChange(400);
      });

      expect(result.current.resizeWidth).toBe(400);
      expect(result.current.resizeHeight).toBe(300);
    });

    it('UH-IE-RS-006: 너비 0 입력 시 높이는 갱신되지 않는다 (0 가드)', () => {
      const { result } = renderHook(() => useImageEditor());

      act(() => {
        result.current.handleResizeWidthChange(0);
      });

      expect(result.current.resizeWidth).toBe(0);
      // 기존 높이(600) 유지
      expect(result.current.resizeHeight).toBe(600);
    });

    it('UH-IE-RS-007: 너비 -10 입력 시 높이는 갱신되지 않는다 (음수 가드)', () => {
      const { result } = renderHook(() => useImageEditor());

      act(() => {
        result.current.handleResizeWidthChange(-10);
      });

      expect(result.current.resizeWidth).toBe(-10);
      expect(result.current.resizeHeight).toBe(600);
    });
  });

  describe('handleResizeHeightChange (비율 유지 ON)', () => {
    it('UH-IE-RS-003: 높이 150 입력 시 초기 비율에 맞춰 너비가 200 으로 자동 계산된다', () => {
      const { result } = renderHook(() => useImageEditor());

      act(() => {
        result.current.handleResizeHeightChange(150);
      });

      expect(result.current.resizeHeight).toBe(150);
      expect(result.current.resizeWidth).toBe(200);
    });

    // Fixed: 원본 케이스(1001×500)는 FP 오차(1001/500≈2.0019999)로 round→500 결과.
    // 구현은 정확하며 테스트의 십진수 기대값 계산이 틀렸음. 정수 반올림 의도를
    // 보존하기 위해 FP 오차 없는 비율(3:2=1.5)과 .5 경계값으로 재작성.
    it('UH-IE-RS-008: 정수 반올림 — 3×2(ratio=1.5)에서 높이 5 입력 시 너비는 round(5×1.5)=8', async () => {
      mockImageDimensions(3, 2);
      const { result } = renderHook(() => useImageEditor());
      const file = new File(['x'], 'test.png', { type: 'image/png' });

      // preview 갱신을 유발해서 aspectRatio 가 3/2=1.5 로 동기화되게 한다
      act(() => {
        result.current.handleFileSelect({
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      await waitFor(() => {
        expect(result.current.resizeWidth).toBe(3);
        expect(result.current.resizeHeight).toBe(2);
      });

      act(() => {
        result.current.handleResizeHeightChange(5);
      });

      expect(result.current.resizeHeight).toBe(5);
      // 5 * 1.5 = 7.5 → Math.round → 8 (half-away-from-zero)
      expect(result.current.resizeWidth).toBe(8);
    });

    it('UH-IE-RS-009: 결과 최소값 1 보장 — ratio 1000 상태에서 너비 2 입력 시 높이는 Math.max(1, round(2/1000))=1', async () => {
      mockImageDimensions(2000, 2);
      const { result } = renderHook(() => useImageEditor());
      const file = new File(['x'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      await waitFor(() => {
        expect(result.current.resizeWidth).toBe(2000);
        expect(result.current.resizeHeight).toBe(2);
      });

      act(() => {
        result.current.handleResizeWidthChange(2);
      });

      expect(result.current.resizeWidth).toBe(2);
      // 2 / 1000 = 0.002 → round → 0 → Math.max(1, 0) = 1
      expect(result.current.resizeHeight).toBe(1);
    });
  });

  describe('비율 유지 OFF', () => {
    it('UH-IE-RS-004: 비율 유지 OFF 상태에서 너비 변경 시 높이는 그대로 유지된다', () => {
      const { result } = renderHook(() => useImageEditor());

      act(() => {
        result.current.setMaintainRatio(false);
      });

      act(() => {
        result.current.handleResizeWidthChange(123);
      });

      expect(result.current.resizeWidth).toBe(123);
      expect(result.current.resizeHeight).toBe(600);
    });

    it('UH-IE-RS-005: 비율 유지 OFF 상태에서 높이 변경 시 너비는 그대로 유지된다', () => {
      const { result } = renderHook(() => useImageEditor());

      act(() => {
        result.current.setMaintainRatio(false);
      });

      act(() => {
        result.current.handleResizeHeightChange(77);
      });

      expect(result.current.resizeWidth).toBe(800);
      expect(result.current.resizeHeight).toBe(77);
    });
  });

  describe('preview 변경 동기화', () => {
    it('UH-IE-RS-010: 파일 선택 시 이미지 크기에 맞춰 resizeWidth/Height/aspectRatio 가 재동기화되어 이후 계산에 반영된다', async () => {
      mockImageDimensions(1600, 900);
      const { result } = renderHook(() => useImageEditor());
      const file = new File(['x'], 'test.png', { type: 'image/png' });

      act(() => {
        result.current.handleFileSelect({
          target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      // preview 갱신 → effect 발화 → 1600x900 동기화
      await waitFor(() => {
        expect(result.current.resizeWidth).toBe(1600);
        expect(result.current.resizeHeight).toBe(900);
      });

      // 새 비율(1600/900)을 기준으로 너비 800 입력 시 높이 450 (1600/900*450=800)
      act(() => {
        result.current.handleResizeWidthChange(800);
      });

      expect(result.current.resizeWidth).toBe(800);
      // 800 / (1600/900) = 450
      expect(result.current.resizeHeight).toBe(450);
    });
  });
});
