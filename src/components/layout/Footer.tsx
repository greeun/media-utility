'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();
  const version = process.env.NEXT_PUBLIC_VERSION;

  return (
    <footer style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)', borderTop: 'var(--border-width) solid var(--border)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider mb-2">
              {t('copyright', { year })}
              <span className="ml-2 text-[#EC4899]">v{version}</span>
            </p>
            <p className="text-sm opacity-70">
              {t('privacyNote')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:justify-end">
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-white">
              <span className="w-2 h-2 bg-[#10B981] rotate-45"></span>
              <span className="text-xs font-bold uppercase tracking-wider">{t('clientSide')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-white">
              <span className="w-2 h-2 bg-[#06B6D4] rotate-45"></span>
              <span className="text-xs font-bold uppercase tracking-wider">{t('freeUse')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
