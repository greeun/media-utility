/**
 * Middleware 단위 테스트
 *
 * src/middleware.ts의 locale 라우팅 설정 검증
 */

// next-intl/middleware 모킹
const mockCreateMiddleware = jest.fn(() => jest.fn());
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: mockCreateMiddleware,
}));

// i18n config 모킹
jest.mock('@/i18n/config', () => ({
  locales: ['en', 'ko', 'zh', 'es', 'ar', 'pt', 'id', 'fr', 'ja', 'ru', 'de'],
  defaultLocale: 'en',
}));

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('createMiddleware가 올바른 옵션으로 호출되어야 함', () => {
    require('@/middleware');

    expect(mockCreateMiddleware).toHaveBeenCalledWith({
      locales: ['en', 'ko', 'zh', 'es', 'ar', 'pt', 'id', 'fr', 'ja', 'ru', 'de'],
      defaultLocale: 'en',
      localePrefix: 'as-needed',
    });
  });

  it('config.matcher가 올바른 패턴을 포함해야 함', () => {
    const middleware = require('@/middleware');

    expect(middleware.config).toBeDefined();
    expect(middleware.config.matcher).toBeInstanceOf(Array);
    expect(middleware.config.matcher).toContain('/');
  });

  it('matcher가 locale 경로 패턴을 포함해야 함', () => {
    const middleware = require('@/middleware');

    const localePattern = middleware.config.matcher.find(
      (pattern: string) => pattern.includes('(en|ko')
    );
    expect(localePattern).toBeDefined();
    // 11개 locale 모두 포함 확인
    expect(localePattern).toContain('en');
    expect(localePattern).toContain('ko');
    expect(localePattern).toContain('zh');
    expect(localePattern).toContain('ja');
    expect(localePattern).toContain('de');
  });

  it('matcher가 도구 페이지 경로 패턴을 포함해야 함', () => {
    const middleware = require('@/middleware');

    const toolPattern = middleware.config.matcher.find(
      (pattern: string) => pattern.includes('image-converter')
    );
    expect(toolPattern).toBeDefined();
    expect(toolPattern).toContain('image-editor');
    expect(toolPattern).toContain('gif-maker');
    expect(toolPattern).toContain('video-converter');
    expect(toolPattern).toContain('url-generator');
    expect(toolPattern).toContain('background-remover');
    expect(toolPattern).toContain('image-compressor');
    expect(toolPattern).toContain('watermark');
    expect(toolPattern).toContain('meme-generator');
    expect(toolPattern).toContain('face-blur');
    expect(toolPattern).toContain('html-to-image');
    expect(toolPattern).toContain('image-upscaler');
  });

  it('default export가 함수여야 함', () => {
    const middleware = require('@/middleware');

    expect(typeof middleware.default).toBe('function');
  });
});
