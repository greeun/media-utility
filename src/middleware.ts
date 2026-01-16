import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: [
    '/',
    '/(en|ko|zh|es|ar|pt|id|fr|ja|ru|de)/:path*',
    '/(image-converter|image-editor|gif-maker|video-converter|url-generator)',
  ],
};
