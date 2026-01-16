export const locales = ['en', 'ko', 'zh', 'es', 'ar', 'pt', 'id', 'fr', 'ja', 'ru', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  zh: '中文',
  es: 'Español',
  ar: 'العربية',
  pt: 'Português',
  id: 'Bahasa Indonesia',
  fr: 'Français',
  ja: '日本語',
  ru: 'Русский',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
  zh: '🇨🇳',
  es: '🇪🇸',
  ar: '🇸🇦',
  pt: '🇧🇷',
  id: '🇮🇩',
  fr: '🇫🇷',
  ja: '🇯🇵',
  ru: '🇷🇺',
  de: '🇩🇪',
};
