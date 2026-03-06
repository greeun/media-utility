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
  VideoFormatIcon,
  VideoResizerIcon,
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
      { key: 'videoFormatConverter', href: '/video-format-converter', icon: VideoFormatIcon, accent: 'cyan' },
      { key: 'videoResizer', href: '/video-resizer', icon: VideoResizerIcon, accent: 'purple' },
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
          flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider
          transition-all duration-200 border-4 border-transparent
          ${hasActiveItem
            ? 'border-black bg-black text-white'
            : 'hover:border-black'
          }
        `}
      >
        <CategoryIcon size={18} strokeWidth={2.5} />
        <span>{t(`menu.${category.key}`)}</span>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[240px] bg-white border-4 border-black shadow-[8px_8px_0_0_#000] z-50">
          {category.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = isPathActive(item.href);

            return (
              <Link
                key={item.key}
                href={getLocalizedHref(item.href)}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-bold border-b-2 border-gray-200 last:border-b-0
                  transition-all duration-200
                  ${isActive
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                <ItemIcon size={20} strokeWidth={2.5} />
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
    <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
      <nav className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href={getLocalizedHref('/')} className="group flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 border-4 border-black bg-[#EC4899] group-hover:bg-[#06B6D4] transition-colors duration-200">
              <Zap className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <span className="font-black text-xl tracking-tight">
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
          <div className="flex items-center gap-3">
            <LanguageSelector />

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 border-4 border-black hover:bg-black hover:text-white transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={3} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={3} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 border-t-4 border-black mt-4">
            <div className="flex flex-col gap-1 pt-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.href);

                return (
                  <Link
                    key={item.key}
                    href={item.localizedHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 text-sm font-bold border-4 border-transparent
                      transition-all duration-200
                      ${isActive
                        ? 'border-black bg-black text-white'
                        : 'hover:border-black'
                      }
                    `}
                  >
                    <Icon size={22} strokeWidth={2.5} />
                    <span className="uppercase tracking-wide">{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 bg-white rotate-45" />
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
