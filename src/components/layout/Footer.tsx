'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-[oklch(0.06_0.01_240)] border-t border-[oklch(1_0_0/0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-[oklch(0.55_0.02_240)]">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
            <p className="text-xs text-[oklch(0.45_0.02_240)] mt-1">
              {t('privacyNote')}
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-[oklch(0.55_0.02_240)]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[oklch(0.72_0.17_160)] rounded-full"></span>
              {t('clientSide')}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[oklch(0.75_0.18_195)] rounded-full"></span>
              {t('freeUse')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
