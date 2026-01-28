/**
 * HowToUse 컴포넌트 테스트
 */
import { render, screen } from '@testing-library/react';
import HowToUse from '@/components/common/HowToUse';

// next-intl 모킹
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('HowToUse', () => {
  const mockSteps = [
    { number: 1, title: '파일 업로드', description: '파일을 선택하세요' },
    { number: 2, title: '옵션 설정', description: '원하는 옵션을 설정하세요' },
    { number: 3, title: '다운로드', description: '변환된 파일을 다운로드하세요' },
  ];

  const mockFeatures = [
    { title: '빠른 처리', description: '클라이언트 사이드 처리로 빠릅니다' },
    { title: '개인정보 보호', description: '파일이 서버로 전송되지 않습니다' },
  ];

  const mockSupportedFormats = ['JPG', 'PNG', 'WebP'];

  const mockFaqs = [
    { question: '무료인가요?', answer: '네, 완전히 무료입니다.' },
    { question: '파일 제한이 있나요?', answer: '최대 100MB입니다.' },
  ];

  const baseProps = {
    title: '이미지 변환 방법',
    description: '쉽고 빠르게 이미지를 변환하세요',
    steps: mockSteps,
  };

  it('필수 props로 렌더링되어야 함', () => {
    render(<HowToUse {...baseProps} />);

    expect(screen.getByText('이미지 변환 방법')).toBeInTheDocument();
    expect(screen.getByText('쉽고 빠르게 이미지를 변환하세요')).toBeInTheDocument();
    expect(screen.getByText('howToUse')).toBeInTheDocument();
  });

  it('모든 단계를 렌더링해야 함', () => {
    render(<HowToUse {...baseProps} />);

    mockSteps.forEach((step) => {
      expect(screen.getByText(step.number.toString())).toBeInTheDocument();
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    });
  });

  it('지원 포맷을 렌더링해야 함', () => {
    render(<HowToUse {...baseProps} supportedFormats={mockSupportedFormats} />);

    expect(screen.getByText('supportedFormats')).toBeInTheDocument();
    mockSupportedFormats.forEach((format) => {
      expect(screen.getByText(format)).toBeInTheDocument();
    });
  });

  it('주요 기능을 렌더링해야 함', () => {
    render(<HowToUse {...baseProps} features={mockFeatures} />);

    expect(screen.getByText('keyFeatures')).toBeInTheDocument();
    mockFeatures.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });

  it('FAQ를 렌더링해야 함', () => {
    render(<HowToUse {...baseProps} faqs={mockFaqs} />);

    expect(screen.getByText('faq')).toBeInTheDocument();
    mockFaqs.forEach((faq) => {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
      expect(screen.getByText(faq.answer)).toBeInTheDocument();
    });
  });

  it('개인정보 안내를 렌더링해야 함', () => {
    render(<HowToUse {...baseProps} />);

    expect(screen.getByText('privacyNotice')).toBeInTheDocument();
  });

  it('accentColor에 따른 색상 클래스가 적용되어야 함', () => {
    const { rerender } = render(<HowToUse {...baseProps} accentColor="cyan" />);
    expect(screen.getByText('이미지 변환 방법')).toHaveClass('text-[oklch(0.75_0.18_195)]');

    rerender(<HowToUse {...baseProps} accentColor="violet" />);
    expect(screen.getByText('이미지 변환 방법')).toHaveClass('text-[oklch(0.65_0.22_290)]');
  });

  it('잘못된 accentColor는 기본값(cyan)으로 대체되어야 함', () => {
    render(<HowToUse {...baseProps} accentColor="invalid" as any />);
    expect(screen.getByText('이미지 변환 방법')).toHaveClass('text-[oklch(0.75_0.18_195)]');
  });

  it('빈 supportedFormats는 섹션을 렌더링하지 않아야 함', () => {
    render(<HowToUse {...baseProps} supportedFormats={[]} />);

    expect(screen.queryByText('supportedFormats')).not.toBeInTheDocument();
  });

  it('빈 features는 섹션을 렌더링하지 않아야 함', () => {
    render(<HowToUse {...baseProps} features={[]} />);

    expect(screen.queryByText('keyFeatures')).not.toBeInTheDocument();
  });

  it('빈 faqs는 섹션을 렌더링하지 않아야 함', () => {
    render(<HowToUse {...baseProps} faqs={[]} />);

    expect(screen.queryByText('faq')).not.toBeInTheDocument();
  });

  it('모든 옵션을 포함하여 렌더링해야 함', () => {
    render(
      <HowToUse
        {...baseProps}
        supportedFormats={mockSupportedFormats}
        features={mockFeatures}
        faqs={mockFaqs}
      />
    );

    expect(screen.getByText('supportedFormats')).toBeInTheDocument();
    expect(screen.getByText('keyFeatures')).toBeInTheDocument();
    expect(screen.getByText('faq')).toBeInTheDocument();
  });
});
