/**
 * i18n Navigation 단위 테스트
 *
 * src/i18n/navigation.ts의 내보내기 검증
 */

const mockCreateNavigation = jest.fn(() => ({
  Link: jest.fn(),
  redirect: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));

jest.mock('next-intl/navigation', () => ({
  createNavigation: mockCreateNavigation,
}));

jest.mock('@/i18n/config', () => ({
  locales: ['en', 'ko', 'ja'],
  defaultLocale: 'en',
}));

describe('i18n Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createNavigation이 올바른 옵션으로 호출되어야 함', () => {
    // 모듈이 import 시점에 실행되므로 이미 호출됨
    require('@/i18n/navigation');

    expect(mockCreateNavigation).toHaveBeenCalledWith({
      locales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      localePrefix: 'as-needed',
    });
  });

  it('Link, redirect, usePathname, useRouter가 내보내져야 함', () => {
    const nav = require('@/i18n/navigation');

    expect(nav.Link).toBeDefined();
    expect(nav.redirect).toBeDefined();
    expect(nav.usePathname).toBeDefined();
    expect(nav.useRouter).toBeDefined();
  });
});
