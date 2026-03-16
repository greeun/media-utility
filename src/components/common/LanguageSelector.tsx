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
        className="flex items-center gap-2 px-3 py-2 text-sm font-bold transition-all duration-200 border-4 border-transparent hover:border-black"
      >
        <Globe className="w-5 h-5" strokeWidth={2.5} />
        <span className="hidden sm:inline text-xl">{localeFlags[locale]}</span>
        <span className="hidden md:inline text-xs uppercase tracking-wider">{localeNames[locale]}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 z-50 bg-white border-4 border-black shadow-[8px_8px_0_0_#000]">
          <div className="px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] font-bold bg-gray-100 border-b-2 border-black">
            {t('selectLanguage')}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {locales.map((loc) => {
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left
                    transition-all duration-200
                    ${isActive
                      ? 'bg-black text-white border-b-2 border-gray-200 last:border-b-0'
                      : 'hover:bg-gray-100 border-b-2 border-gray-200 last:border-b-0'
                    }`}
                >
                  <span className="text-xl">{localeFlags[loc]}</span>
                  <span className="flex-1">{localeNames[loc]}</span>
                  {isActive && (
                    <span className="w-2 h-2 bg-white rotate-45" />
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
