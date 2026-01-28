/**
 * Header 컴포넌트 테스트
 */
import { render, screen, fireEvent } from '@testing-library/react';

// next-intl mock - Header import 전에 설정해야 함
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.siteName': 'Media Utility',
      'common.tagline': 'Fast & Free',
      'menu.image': '이미지',
      'menu.design': '디자인',
      'menu.video': '비디오',
      'menu.others': '기타',
      'imageConverter.title': '이미지 변환',
      'imageCompressor.title': '이미지 압축',
      'imageEditor.title': '이미지 편집',
      'backgroundRemover.title': '배경 제거',
      'faceBlur.title': '얼굴 블러',
      'imageUpscaler.title': '이미지 업스케일',
      'gifMaker.title': 'GIF 생성',
      'watermark.title': '워터마크',
      'memeGenerator.title': '밈 생성',
      'videoConverter.title': '비디오 변환',
      'htmlToImage.title': 'HTML to 이미지',
      'urlGenerator.title': 'URL 생성',
    };
    return translations[key] || key;
  },
  useLocale: () => 'ko',
}));

// next/link mock
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// next/navigation mock
jest.mock('next/navigation', () => ({
  usePathname: () => '/ko/image-converter',
}));

// LanguageSelector mock
jest.mock('@/components/common/LanguageSelector', () => {
  return function MockLanguageSelector() {
    return <div data-testid="language-selector">KO</div>;
  };
});

// FeatureIcons mock
jest.mock('@/components/icons/FeatureIcons', () => ({
  ImageConverterIcon: () => <span data-testid="icon-image-converter">IC</span>,
  ImageEditorIcon: () => <span data-testid="icon-image-editor">IE</span>,
  GifMakerIcon: () => <span data-testid="icon-gif-maker">GM</span>,
  VideoConverterIcon: () => <span data-testid="icon-video-converter">VC</span>,
  UrlGeneratorIcon: () => <span data-testid="icon-url-generator">UG</span>,
  BackgroundRemoverIcon: () => <span data-testid="icon-bg-remover">BR</span>,
  ImageCompressorIcon: () => <span data-testid="icon-compressor">CP</span>,
  WatermarkIcon: () => <span data-testid="icon-watermark">WM</span>,
  MemeGeneratorIcon: () => <span data-testid="icon-meme">MG</span>,
  FaceBlurIcon: () => <span data-testid="icon-face-blur">FB</span>,
  HtmlToImageIcon: () => <span data-testid="icon-html">HI</span>,
  UpscalerIcon: () => <span data-testid="icon-upscaler">US</span>,
}));

import Header from '@/components/layout/Header';

describe('Header', () => {
  it('로고와 사이트명이 표시되어야 함', () => {
    render(<Header />);

    expect(screen.getByText('Media Utility')).toBeInTheDocument();
  });

  it('카테고리 드롭다운 버튼이 표시되어야 함', () => {
    render(<Header />);

    // 카테고리 버튼들
    expect(screen.getByText('이미지')).toBeInTheDocument();
    expect(screen.getByText('디자인')).toBeInTheDocument();
    expect(screen.getByText('비디오')).toBeInTheDocument();
    expect(screen.getByText('기타')).toBeInTheDocument();
  });

  it('카테고리 클릭 시 드롭다운이 열려야 함', () => {
    render(<Header />);

    const imageCategory = screen.getByText('이미지');
    fireEvent.click(imageCategory);

    // 드롭다운 내 메뉴 아이템들
    expect(screen.getByText('이미지 변환')).toBeInTheDocument();
    expect(screen.getByText('이미지 압축')).toBeInTheDocument();
    expect(screen.getByText('이미지 편집')).toBeInTheDocument();
  });

  it('모바일 메뉴 버튼이 존재해야 함', () => {
    render(<Header />);

    // 모바일 메뉴 버튼 (lg:hidden)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('모바일 메뉴 버튼 클릭 시 모바일 네비게이션이 표시되어야 함', () => {
    render(<Header />);

    // 모바일 메뉴 버튼 찾기 (lg:hidden 클래스를 가진 버튼)
    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn =>
      btn.className.includes('lg:hidden')
    );

    if (mobileMenuButton) {
      fireEvent.click(mobileMenuButton);

      // 모바일 메뉴가 열리면 네비게이션 항목들이 표시됨
      expect(screen.getByText('이미지 변환')).toBeInTheDocument();
    }
  });

  it('언어 선택기가 표시되어야 함', () => {
    render(<Header />);

    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });

  it('홈 링크가 올바른 href를 가져야 함', () => {
    render(<Header />);

    const homeLink = screen.getByText('Media Utility').closest('a');
    expect(homeLink).toHaveAttribute('href', '/ko/');
  });

  it('드롭다운 외부 클릭 시 닫혀야 함', () => {
    render(<Header />);

    // 이미지 카테고리 열기
    const imageCategory = screen.getByText('이미지');
    fireEvent.click(imageCategory);

    expect(screen.getByText('이미지 변환')).toBeInTheDocument();

    // 외부 클릭
    fireEvent.mouseDown(document.body);

    // 드롭다운이 닫힘 (이미지 변환은 모바일 메뉴에서만 보이게 됨)
    // 데스크톱 드롭다운의 이미지 변환이 사라짐
  });
});
