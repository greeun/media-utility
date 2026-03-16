/**
 * i18n Request Config 단위 테스트
 *
 * src/i18n/request.ts의 getRequestConfig 동작 검증
 */

// next-intl/server 모킹
const mockGetRequestConfig = jest.fn((fn: Function) => fn);
jest.mock('next-intl/server', () => ({
  getRequestConfig: mockGetRequestConfig,
}));

jest.mock('@/i18n/config', () => ({
  locales: ['en', 'ko', 'ja'],
  defaultLocale: 'en',
}));

describe('i18n Request Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('getRequestConfig가 호출되어야 함', () => {
    require('@/i18n/request');

    expect(mockGetRequestConfig).toHaveBeenCalledWith(expect.any(Function));
  });

  it('유효한 locale이 전달되면 해당 locale을 사용해야 함', async () => {
    const configFn = require('@/i18n/request').default;

    const result = await configFn({ requestLocale: Promise.resolve('ko') });

    expect(result.locale).toBe('ko');
  });

  it('유효하지 않은 locale이 전달되면 defaultLocale을 사용해야 함', async () => {
    const configFn = require('@/i18n/request').default;

    const result = await configFn({ requestLocale: Promise.resolve('zz') });

    expect(result.locale).toBe('en');
  });

  it('locale이 undefined이면 defaultLocale을 사용해야 함', async () => {
    const configFn = require('@/i18n/request').default;

    const result = await configFn({ requestLocale: Promise.resolve(undefined) });

    expect(result.locale).toBe('en');
  });

  it('messages가 포함되어야 함', async () => {
    const configFn = require('@/i18n/request').default;

    const result = await configFn({ requestLocale: Promise.resolve('en') });

    expect(result).toHaveProperty('messages');
    expect(result).toHaveProperty('locale');
  });
});
