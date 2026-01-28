'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap, ChevronDown, Image, Palette, Video, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  ImageConverterIcon,
  ImageEditorIcon,
  GifMakerIcon,
  VideoConverterIcon,
  UrlGeneratorIcon,
  BackgroundRemoverIcon,
  ImageCompressorIcon,
  WatermarkIcon,
  MemeGeneratorIcon,
  FaceBlurIcon,
  HtmlToImageIcon,
  UpscalerIcon,
} from '@/components/icons/FeatureIcons';
import LanguageSelector from '@/components/common/LanguageSelector';

// 카테고리별 메뉴 구성
const menuCategories = [
  {
    key: 'image',
    icon: Image,
    accent: 'cyan',
    items: [
      { key: 'imageConverter', href: '/image-converter', icon: ImageConverterIcon, accent: 'cyan' },
      { key: 'imageCompressor', href: '/image-compressor', icon: ImageCompressorIcon, accent: 'teal' },
      { key: 'imageEditor', href: '/image-editor', icon: ImageEditorIcon, accent: 'violet' },
      { key: 'backgroundRemover', href: '/background-remover', icon: BackgroundRemoverIcon, accent: 'purple' },
      { key: 'faceBlur', href: '/face-blur', icon: FaceBlurIcon, accent: 'rose' },
      { key: 'imageUpscaler', href: '/image-upscaler', icon: UpscalerIcon, accent: 'sky' },
      { key: 'gifMaker', href: '/gif-maker', icon: GifMakerIcon, accent: 'emerald' },
    ],
  },
  {
    key: 'design',
    icon: Palette,
    accent: 'orange',
    items: [
      { key: 'watermark', href: '/watermark', icon: WatermarkIcon, accent: 'indigo' },
      { key: 'memeGenerator', href: '/meme-generator', icon: MemeGeneratorIcon, accent: 'orange' },
    ],
  },
  {
    key: 'video',
    icon: Video,
    accent: 'amber',
    items: [
      { key: 'videoConverter', href: '/video-converter', icon: VideoConverterIcon, accent: 'amber' },
    ],
  },
  {
    key: 'others',
    icon: MoreHorizontal,
    accent: 'magenta',
    items: [
      { key: 'htmlToImage', href: '/html-to-image', icon: HtmlToImageIcon, accent: 'lime' },
      { key: 'urlGenerator', href: '/url-generator', icon: UrlGeneratorIcon, accent: 'magenta' },
    ],
  },
];

// 모바일용 플랫 메뉴
const navigationItems = menuCategories.flatMap((cat) => cat.items);

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
  purple: {
    active: 'bg-[oklch(0.70_0.20_290/0.15)] text-[oklch(0.75_0.25_290)] border-[oklch(0.70_0.20_290/0.3)]',
    hover: 'hover:text-[oklch(0.75_0.25_290)] hover:bg-[oklch(0.70_0.20_290/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.70_0.20_290/0.3)]',
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
  teal: {
    active: 'bg-[oklch(0.75_0.17_175/0.15)] text-[oklch(0.80_0.20_175)] border-[oklch(0.75_0.17_175/0.3)]',
    hover: 'hover:text-[oklch(0.80_0.20_175)] hover:bg-[oklch(0.75_0.17_175/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.75_0.17_175/0.3)]',
  },
  indigo: {
    active: 'bg-[oklch(0.65_0.20_275/0.15)] text-[oklch(0.70_0.23_275)] border-[oklch(0.65_0.20_275/0.3)]',
    hover: 'hover:text-[oklch(0.70_0.23_275)] hover:bg-[oklch(0.65_0.20_275/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.65_0.20_275/0.3)]',
  },
  orange: {
    active: 'bg-[oklch(0.78_0.16_55/0.15)] text-[oklch(0.83_0.18_55)] border-[oklch(0.78_0.16_55/0.3)]',
    hover: 'hover:text-[oklch(0.83_0.18_55)] hover:bg-[oklch(0.78_0.16_55/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.78_0.16_55/0.3)]',
  },
  rose: {
    active: 'bg-[oklch(0.70_0.22_25/0.15)] text-[oklch(0.75_0.25_25)] border-[oklch(0.70_0.22_25/0.3)]',
    hover: 'hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.70_0.22_25/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.70_0.22_25/0.3)]',
  },
  lime: {
    active: 'bg-[oklch(0.70_0.17_145/0.15)] text-[oklch(0.75_0.20_145)] border-[oklch(0.70_0.17_145/0.3)]',
    hover: 'hover:text-[oklch(0.75_0.20_145)] hover:bg-[oklch(0.70_0.17_145/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.70_0.17_145/0.3)]',
  },
  sky: {
    active: 'bg-[oklch(0.70_0.18_280/0.15)] text-[oklch(0.75_0.20_280)] border-[oklch(0.70_0.18_280/0.3)]',
    hover: 'hover:text-[oklch(0.75_0.20_280)] hover:bg-[oklch(0.70_0.18_280/0.08)]',
    glow: 'shadow-[0_0_20px_oklch(0.70_0.18_280/0.3)]',
  },
};

// 카테고리 드롭다운 컴포넌트
function CategoryDropdown({
  category,
  t,
  getLocalizedHref,
  isPathActive,
}: {
  category: typeof menuCategories[0];
  t: ReturnType<typeof useTranslations>;
  getLocalizedHref: (href: string) => string;
  isPathActive: (href: string) => boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const CategoryIcon = category.icon;
  const accent = accentStyles[category.accent as keyof typeof accentStyles];

  // 카테고리 내 활성 메뉴 확인
  const hasActiveItem = category.items.some((item) => isPathActive(item.href));

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
          transition-all duration-300 border border-transparent
          ${hasActiveItem
            ? `${accent.active}`
            : `text-[oklch(0.60_0.02_240)] ${accent.hover}`
          }
        `}
      >
        <CategoryIcon size={16} />
        <span>{t(`menu.${category.key}`)}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[200px] py-2 rounded-xl bg-[oklch(0.14_0.01_260)] border border-[oklch(1_0_0/0.08)] shadow-xl shadow-black/20 animate-fade-up z-50">
          {category.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = isPathActive(item.href);
            const itemAccent = accentStyles[item.accent as keyof typeof accentStyles];

            return (
              <Link
                key={item.key}
                href={getLocalizedHref(item.href)}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? `${itemAccent.active}`
                    : `text-[oklch(0.70_0.02_240)] ${itemAccent.hover}`
                  }
                `}
              >
                <ItemIcon size={18} />
                <span>{t(`${item.key}.title`)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
            <span className="font-semibold text-[15px] tracking-tight text-[oklch(0.95_0.01_80)]">
              {t('common.siteName')}
            </span>
          </Link>

          {/* Desktop Navigation - 카테고리별 드롭다운 */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {menuCategories.map((category) => (
              <CategoryDropdown
                key={category.key}
                category={category}
                t={t}
                getLocalizedHref={getLocalizedHref}
                isPathActive={isPathActive}
              />
            ))}
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
