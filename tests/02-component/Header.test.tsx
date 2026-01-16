/**
 * Header 컴포넌트 테스트
 */
import { render, screen, fireEvent } from '@testing-library/react'

// next-intl mock - Header import 전에 설정해야 함
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.siteName': 'Media Utility',
      'common.tagline': 'Fast & Free',
      'imageConverter.title': '이미지 변환',
      'imageEditor.title': '이미지 편집',
      'gifMaker.title': 'GIF 생성',
      'videoConverter.title': '비디오 변환',
      'urlGenerator.title': 'URL 생성',
    }
    return translations[key] || key
  },
  useLocale: () => 'ko',
}))

// next-intl/navigation mock
jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/ko',
}))

// LanguageSelector mock
jest.mock('@/components/common/LanguageSelector', () => {
  return function MockLanguageSelector() {
    return <div data-testid="language-selector">KO</div>
  }
})

import Header from '@/components/layout/Header'

// next/navigation mock
jest.mock('next/navigation', () => ({
  usePathname: () => '/ko',
}))

describe('Header', () => {
  it('로고와 사이트명이 표시되어야 함', () => {
    render(<Header />)

    expect(screen.getByText('Media Utility')).toBeInTheDocument()
    expect(screen.getByText('Fast & Free')).toBeInTheDocument()
  })

  it('데스크톱 네비게이션 링크가 표시되어야 함', () => {
    render(<Header />)

    expect(screen.getByText('이미지 변환')).toBeInTheDocument()
    expect(screen.getByText('이미지 편집')).toBeInTheDocument()
    expect(screen.getByText('GIF 생성')).toBeInTheDocument()
    expect(screen.getByText('비디오 변환')).toBeInTheDocument()
    expect(screen.getByText('URL 생성')).toBeInTheDocument()
  })

  it('모바일 메뉴 버튼이 존재해야 함', () => {
    render(<Header />)

    // 모바일 메뉴 버튼 (lg:hidden)
    const menuButton = screen.getByRole('button')
    expect(menuButton).toBeInTheDocument()
  })

  it('모바일 메뉴 버튼 클릭 시 모바일 네비게이션이 표시되어야 함', () => {
    render(<Header />)

    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    // 모바일 메뉴가 열리면 네비게이션 항목이 두 번 렌더링됨 (데스크톱 + 모바일)
    const imageConverterLinks = screen.getAllByText('이미지 변환')
    expect(imageConverterLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('모바일 메뉴 닫기 버튼 클릭 시 메뉴가 닫혀야 함', () => {
    render(<Header />)

    const menuButton = screen.getByRole('button')

    // 메뉴 열기
    fireEvent.click(menuButton)
    let imageConverterLinks = screen.getAllByText('이미지 변환')
    expect(imageConverterLinks.length).toBeGreaterThanOrEqual(2)

    // 메뉴 닫기 (같은 버튼이 X 아이콘으로 변경됨)
    fireEvent.click(menuButton)

    // 모바일 메뉴가 닫히면 데스크톱 네비게이션만 남음
    imageConverterLinks = screen.getAllByText('이미지 변환')
    expect(imageConverterLinks.length).toBe(1)
  })

  it('네비게이션 링크에 올바른 href가 설정되어야 함', () => {
    render(<Header />)

    const imageConverterLink = screen.getByRole('link', { name: /이미지 변환/i })
    expect(imageConverterLink).toHaveAttribute('href', '/ko/image-converter')

    const gifMakerLink = screen.getByRole('link', { name: /GIF 생성/i })
    expect(gifMakerLink).toHaveAttribute('href', '/ko/gif-maker')
  })
})
