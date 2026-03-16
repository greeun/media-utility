/**
 * ThemeSelector 컴포넌트 테스트
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeSelector from '@/components/common/ThemeSelector';

// 테마 데이터 모킹
jest.mock('@/design-system/themes', () => ({
  themes: [
    {
      id: 'swiss',
      name: 'Swiss Modernism',
      description: '흑백 대비, 굵은 테두리',
      preview: { bg: '#F9FAFB', card: '#FFFFFF', accent: '#EC4899', text: '#000000' },
    },
    {
      id: 'soft',
      name: 'Soft Minimal',
      description: '따뜻한 배경, 부드러운 테두리',
      preview: { bg: '#FAF5F0', card: '#FFFFFF', accent: '#E8927C', text: '#2D2D2D' },
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      description: '다크 테마',
      preview: { bg: '#1A1A2E', card: '#16213E', accent: '#0F3460', text: '#E4E4E4' },
    },
  ],
  DEFAULT_THEME: 'swiss',
}));

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ThemeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('기본 렌더링이 되어야 함', () => {
    render(<ThemeSelector />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('초기 로드 시 localStorage에서 테마를 복원해야 함', () => {
    localStorageMock.getItem.mockReturnValueOnce('dark');
    render(<ThemeSelector />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('저장된 테마가 없으면 DEFAULT_THEME를 적용해야 함', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    render(<ThemeSelector />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('swiss');
  });

  it('버튼 클릭 시 드롭다운이 열려야 함', () => {
    render(<ThemeSelector />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('테마 선택')).toBeInTheDocument();
    // 테마 이름은 토글 버튼의 span에도 표시될 수 있으므로 getAllByText 사용
    expect(screen.getAllByText('Swiss Modernism').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Soft Minimal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Dark Mode').length).toBeGreaterThanOrEqual(1);
  });

  it('모든 테마 옵션을 표시해야 함', () => {
    render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button'));

    // 3개 테마 + 헤더 확인
    const buttons = screen.getAllByRole('button');
    // 토글 버튼(1) + 테마 버튼(3) = 4개
    expect(buttons.length).toBe(4);
  });

  it('테마 선택 시 data-theme 속성과 localStorage가 업데이트되어야 함', () => {
    render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button'));

    const darkButton = screen.getAllByRole('button').find((btn) =>
      btn.textContent?.includes('Dark Mode')
    );
    fireEvent.click(darkButton!);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('테마 선택 후 드롭다운이 닫혀야 함', async () => {
    render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('테마 선택')).toBeInTheDocument();

    const softButton = screen.getAllByRole('button').find((btn) =>
      btn.textContent?.includes('Soft Minimal')
    );
    fireEvent.click(softButton!);

    await waitFor(() => {
      expect(screen.queryByText('테마 선택')).not.toBeInTheDocument();
    });
  });

  it('외부 클릭 시 드롭다운이 닫혀야 함', async () => {
    render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('테마 선택')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('테마 선택')).not.toBeInTheDocument();
    });
  });

  it('각 테마에 색상 프리뷰가 표시되어야 함', () => {
    const { container } = render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button'));

    // 각 테마에 4개 색상 프리뷰 원 (3 테마 x 4 = 12개)
    const colorCircles = container.querySelectorAll('.rounded-full');
    expect(colorCircles.length).toBe(12);
  });

  it('현재 테마에 활성 인디케이터가 표시되어야 함', () => {
    const { container } = render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button'));

    // 활성 테마에 rotate-45 인디케이터
    const activeIndicator = container.querySelector('.rotate-45');
    expect(activeIndicator).toBeInTheDocument();
  });

  it('각 테마에 설명이 표시되어야 함', () => {
    render(<ThemeSelector />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('흑백 대비, 굵은 테두리')).toBeInTheDocument();
    expect(screen.getByText('따뜻한 배경, 부드러운 테두리')).toBeInTheDocument();
    expect(screen.getByText('다크 테마')).toBeInTheDocument();
  });

  it('드롭다운 토글이 작동해야 함', async () => {
    render(<ThemeSelector />);

    const button = screen.getByRole('button');

    // 열기
    fireEvent.click(button);
    expect(screen.getByText('테마 선택')).toBeInTheDocument();

    // 닫기
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText('테마 선택')).not.toBeInTheDocument();
    });
  });

  it('ChevronDown 아이콘이 열림 상태에서 회전해야 함', () => {
    const { container } = render(<ThemeSelector />);

    const button = screen.getByRole('button');
    const svgs = container.querySelectorAll('svg');
    const chevron = svgs[svgs.length - 1]; // 마지막 SVG = ChevronDown

    // 닫힘 상태
    expect(chevron).not.toHaveClass('rotate-180');

    // 열림 상태
    fireEvent.click(button);
    expect(chevron).toHaveClass('rotate-180');
  });
});
