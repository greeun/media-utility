'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export default function LanguageSelector() {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
          text-[oklch(0.60_0.02_240)] hover:text-[oklch(0.85_0.02_240)]
          hover:bg-[oklch(1_0_0/0.05)] transition-all duration-200
          border border-transparent hover:border-[oklch(1_0_0/0.08)]"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeFlags[locale]}</span>
        <span className="hidden md:inline text-xs">{localeNames[locale]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2
          bg-[oklch(0.12_0.01_240)] border border-[oklch(1_0_0/0.1)]
          rounded-xl shadow-xl shadow-[oklch(0_0_0/0.3)]
          animate-fade-up origin-top-right z-50">
          <div className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-[oklch(0.45_0.02_240)] border-b border-[oklch(1_0_0/0.06)] mb-1">
            {t('selectLanguage')}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {locales.map((loc) => {
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                    transition-all duration-150
                    ${isActive
                      ? 'bg-[oklch(0.75_0.18_195/0.15)] text-[oklch(0.85_0.18_195)]'
                      : 'text-[oklch(0.70_0.02_240)] hover:bg-[oklch(1_0_0/0.05)] hover:text-[oklch(0.90_0.02_240)]'
                    }`}
                >
                  <span className="text-base">{localeFlags[loc]}</span>
                  <span className="flex-1">{localeNames[loc]}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_195)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
