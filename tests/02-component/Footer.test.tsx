/**
 * Footer 컴포넌트 테스트
 */
import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';

// next-intl 모킹
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === 'copyright' && values) {
      return `© ${values.year} All rights reserved`;
    }
    return key;
  },
}));

describe('Footer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.useFakeTimers();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.useRealTimers();
  });

  it('기본 렌더링이 되어야 함', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('현재 연도를 표시해야 함', () => {
    jest.setSystemTime(new Date('2024-01-01'));

    render(<Footer />);

    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('버전 정보를 표시해야 함', () => {
    process.env.NEXT_PUBLIC_VERSION = '1.2.3';

    render(<Footer />);

    expect(screen.getByText(/v1\.2\.3/)).toBeInTheDocument();
  });

  it('버전이 없어도 에러 없이 렌더링되어야 함', () => {
    delete process.env.NEXT_PUBLIC_VERSION;

    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('개인정보 안내를 표시해야 함', () => {
    render(<Footer />);

    expect(screen.getByText('privacyNote')).toBeInTheDocument();
  });

  it('클라이언트 사이드 배지를 표시해야 함', () => {
    render(<Footer />);

    expect(screen.getByText('clientSide')).toBeInTheDocument();
  });

  it('무료 사용 배지를 표시해야 함', () => {
    render(<Footer />);

    expect(screen.getByText('freeUse')).toBeInTheDocument();
  });

  it('올바른 레이아웃이 적용되어야 함', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-[oklch(0.06_0.01_240)]');
    expect(footer).toHaveClass('border-t');
  });

  it('반응형 레이아웃이 적용되어야 함', () => {
    const { container } = render(<Footer />);

    const flexContainer = container.querySelector('.flex.flex-col');
    expect(flexContainer).toHaveClass('md:flex-row');
  });

  it('copyright 번역 함수에 연도를 전달해야 함', () => {
    jest.setSystemTime(new Date('2025-06-15'));

    render(<Footer />);

    expect(screen.getByText(/© 2025 All rights reserved/)).toBeInTheDocument();
  });

  it('버전이 투명 텍스트로 표시되어야 함', () => {
    process.env.NEXT_PUBLIC_VERSION = '1.0.0';

    const { container } = render(<Footer />);

    const versionSpan = container.querySelector('.text-transparent');
    expect(versionSpan).toBeInTheDocument();
    expect(versionSpan?.textContent).toContain('v1.0.0');
  });

  it('배지에 색상이 적용되어야 함', () => {
    const { container } = render(<Footer />);

    const badges = container.querySelectorAll('.rounded-full');
    expect(badges).toHaveLength(2);

    // 첫 번째 배지: 클라이언트 사이드 (초록색)
    expect(badges[0]).toHaveClass('bg-[oklch(0.72_0.17_160)]');

    // 두 번째 배지: 무료 사용 (파란색)
    expect(badges[1]).toHaveClass('bg-[oklch(0.75_0.18_195)]');
  });

  it('텍스트 정렬이 반응형으로 적용되어야 함', () => {
    const { container } = render(<Footer />);

    const textContainer = container.querySelector('.text-center');
    expect(textContainer).toHaveClass('md:text-left');
  });

  it('올바른 간격이 적용되어야 함', () => {
    const { container } = render(<Footer />);

    // gap-4는 flex 컨테이너에 적용됨
    const flexContainer = container.querySelector('.flex.flex-col');
    expect(flexContainer).toHaveClass('gap-4');
  });
});
