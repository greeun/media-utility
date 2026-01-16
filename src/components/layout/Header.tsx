'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  ImageConverterIcon,
  ImageEditorIcon,
  GifMakerIcon,
  VideoConverterIcon,
  UrlGeneratorIcon,
} from '@/components/icons/FeatureIcons';
import LanguageSelector from '@/components/common/LanguageSelector';

const navigationItems = [
  { key: 'imageConverter', href: '/image-converter', icon: ImageConverterIcon, accent: 'cyan' },
  { key: 'imageEditor', href: '/image-editor', icon: ImageEditorIcon, accent: 'violet' },
  { key: 'gifMaker', href: '/gif-maker', icon: GifMakerIcon, accent: 'emerald' },
  { key: 'videoConverter', href: '/video-converter', icon: VideoConverterIcon, accent: 'amber' },
  { key: 'urlGenerator', href: '/url-generator', icon: UrlGeneratorIcon, accent: 'magenta' },
];

const accentStyles = {
  cyan: {
    active: 'bg-[oklch(0.75_0.18_195/0.15)] text-[oklch(0.80_0.20_195)] border-[oklch(0.75_0.18_195/0.3)]',
    hover: 'hover:text-[oklch(0.80_0.20_195)] hover:bg-[oklch(0.75_0.18_195/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.75_0.18_195/0.3)]',
  },
  violet: {
    active: 'bg-[oklch(0.65_0.22_290/0.15)] text-[oklch(0.70_0.26_290)] border-[oklch(0.65_0.22_290/0.3)]',
    hover: 'hover:text-[oklch(0.70_0.26_290)] hover:bg-[oklch(0.65_0.22_290/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.65_0.22_290/0.3)]',
  },
  emerald: {
    active: 'bg-[oklch(0.72_0.17_160/0.15)] text-[oklch(0.78_0.20_160)] border-[oklch(0.72_0.17_160/0.3)]',
    hover: 'hover:text-[oklch(0.78_0.20_160)] hover:bg-[oklch(0.72_0.17_160/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.72_0.17_160/0.3)]',
  },
  amber: {
    active: 'bg-[oklch(0.80_0.18_80/0.15)] text-[oklch(0.85_0.22_80)] border-[oklch(0.80_0.18_80/0.3)]',
    hover: 'hover:text-[oklch(0.85_0.22_80)] hover:bg-[oklch(0.80_0.18_80/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.80_0.18_80/0.3)]',
  },
  magenta: {
    active: 'bg-[oklch(0.70_0.20_330/0.15)] text-[oklch(0.75_0.25_330)] border-[oklch(0.70_0.20_330/0.3)]',
    hover: 'hover:text-[oklch(0.75_0.25_330)] hover:bg-[oklch(0.70_0.20_330/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.70_0.20_330/0.3)]',
  },
};

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build localized href
  const getLocalizedHref = (href: string) => {
    if (locale === 'en') return href;
    return `/${locale}${href}`;
  };

  // Check if path is active
  const isPathActive = (href: string) => {
    const localizedHref = getLocalizedHref(href);
    return pathname === localizedHref || pathname === href;
  };

  const navigation = navigationItems.map((item) => ({
    ...item,
    name: t(`${item.key}.title`),
    localizedHref: getLocalizedHref(item.href),
  }));

  return (
    <header className="glass sticky top-0 z-50 border-b border-[oklch(1_0_0/0.06)]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={getLocalizedHref('/')} className="group flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[oklch(0.75_0.18_195)] transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 text-[oklch(0.08_0.01_240)]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] tracking-tight text-[oklch(0.95_0.01_80)]">
                {t('common.siteName')}
              </span>
              <span className="text-[10px] font-mono text-[oklch(0.50_0.02_240)] uppercase tracking-widest">
                {t('common.tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isPathActive(item.href);
              const accent = accentStyles[item.accent as keyof typeof accentStyles];

              return (
                <Link
                  key={item.key}
                  href={item.localizedHref}
                  className={`
                    relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                    transition-all duration-300 border border-transparent
                    ${isActive
                      ? `${accent.active} ${accent.glow}`
                      : `text-[oklch(0.60_0.02_240)] ${accent.hover}`
                    }
                  `}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-current to-transparent" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Language Selector + Mobile Menu */}
          <div className="flex items-center gap-2">
            <LanguageSelector />

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-[oklch(0.70_0.02_240)] hover:text-[oklch(0.95_0.01_80)] hover:bg-[oklch(1_0_0/0.05)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[oklch(1_0_0/0.06)] animate-fade-up">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.href);
                const accent = accentStyles[item.accent as keyof typeof accentStyles];

                return (
                  <Link
                    key={item.key}
                    href={item.localizedHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg
                      transition-all duration-300 border border-transparent
                      ${isActive
                        ? `${accent.active}`
                        : `text-[oklch(0.60_0.02_240)] ${accent.hover}`
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
