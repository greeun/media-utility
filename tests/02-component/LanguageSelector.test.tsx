/**
 * LanguageSelector 컴포넌트 테스트
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSelector from '@/components/common/LanguageSelector';

// next-intl 모킹
jest.mock('next-intl', () => ({
  useLocale: () => 'ko',
  useTranslations: () => (key: string) => key,
}));

// next/navigation 모킹
const mockReplace = jest.fn();
jest.mock('@/i18n/navigation', () => ({
  usePathname: () => '/image-converter',
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// i18n config 모킹
jest.mock('@/i18n/config', () => ({
  locales: ['ko', 'en', 'ja', 'zh'],
  localeNames: {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
  },
  localeFlags: {
    ko: '🇰🇷',
    en: '🇺🇸',
    ja: '🇯🇵',
    zh: '🇨🇳',
  },
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 렌더링이 되어야 함', () => {
    render(<LanguageSelector />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('🇰🇷')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
  });

  it('버튼 클릭 시 드롭다운이 열려야 함', () => {
    render(<LanguageSelector />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('selectLanguage')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
  });

  it('모든 로케일을 표시해야 함', () => {
    render(<LanguageSelector />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('현재 로케일에 활성 스타일이 적용되어야 함', () => {
    render(<LanguageSelector />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // 드롭다운 내 버튼들 중 한국어 버튼 찾기 (토글 버튼 제외)
    const allButtons = screen.getAllByRole('button');
    const dropdownButtons = allButtons.filter(btn =>
      btn.textContent?.includes('한국어') && btn !== button
    );
    const koButton = dropdownButtons[0];

    // 활성 버튼에 활성 인디케이터 (회전된 사각형 마름모)가 있는지 확인
    expect(koButton?.querySelector('.rotate-45')).toBeInTheDocument();
    expect(koButton).toHaveClass('bg-black', 'text-white');
  });

  it('로케일 선택 시 router.replace가 호출되어야 함', () => {
    render(<LanguageSelector />);

    fireEvent.click(screen.getByRole('button'));

    const enButton = screen.getAllByRole('button').find((btn) =>
      btn.textContent?.includes('English')
    );
    fireEvent.click(enButton!);

    expect(mockReplace).toHaveBeenCalledWith('/image-converter', { locale: 'en' });
  });

  it('로케일 선택 후 드롭다운이 닫혀야 함', async () => {
    render(<LanguageSelector />);

    fireEvent.click(screen.getByRole('button'));

    const enButton = screen.getAllByRole('button').find((btn) =>
      btn.textContent?.includes('English')
    );
    fireEvent.click(enButton!);

    await waitFor(() => {
      expect(screen.queryByText('selectLanguage')).not.toBeInTheDocument();
    });
  });

  it('외부 클릭 시 드롭다운이 닫혀야 함', async () => {
    render(<LanguageSelector />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('selectLanguage')).toBeInTheDocument();

    // 외부 클릭 시뮬레이션
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('selectLanguage')).not.toBeInTheDocument();
    });
  });

  it('드롭다운 토글이 작동해야 함', async () => {
    render(<LanguageSelector />);

    const button = screen.getByRole('button');

    // 열기
    fireEvent.click(button);
    expect(screen.getByText('selectLanguage')).toBeInTheDocument();

    // 닫기
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText('selectLanguage')).not.toBeInTheDocument();
    });
  });

  it('ChevronDown 아이콘이 회전해야 함', () => {
    const { container } = render(<LanguageSelector />);

    const button = screen.getByRole('button');
    const chevron = container.querySelector('svg:last-of-type');

    // 닫힘 상태
    expect(chevron).not.toHaveClass('rotate-180');

    // 열림 상태
    fireEvent.click(button);
    expect(chevron).toHaveClass('rotate-180');
  });

  it('Globe 아이콘이 표시되어야 함', () => {
    const { container } = render(<LanguageSelector />);

    const globeIcon = container.querySelector('svg');
    expect(globeIcon).toBeInTheDocument();
  });

  it('반응형 텍스트가 적용되어야 함', () => {
    render(<LanguageSelector />);

    const flag = screen.getByText('🇰🇷');
    const name = screen.getByText('한국어');

    expect(flag).toHaveClass('hidden', 'sm:inline');
    expect(name).toHaveClass('hidden', 'md:inline');
  });
});
