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
import ThemeSelector from '@/components/common/ThemeSelector';

// 카테고리별 메뉴 구성
const menuCategories = [
  {
    key: 'image',
    icon: Image,
    items: [
      { key: 'imageConverter', href: '/image-converter', icon: ImageConverterIcon },
      { key: 'imageCompressor', href: '/image-compressor', icon: ImageCompressorIcon },
      { key: 'imageEditor', href: '/image-editor', icon: ImageEditorIcon },
      { key: 'backgroundRemover', href: '/background-remover', icon: BackgroundRemoverIcon },
      { key: 'faceBlur', href: '/face-blur', icon: FaceBlurIcon },
      { key: 'imageUpscaler', href: '/image-upscaler', icon: UpscalerIcon },
      { key: 'gifMaker', href: '/gif-maker', icon: GifMakerIcon },
    ],
  },
  {
    key: 'design',
    icon: Palette,
    items: [
      { key: 'watermark', href: '/watermark', icon: WatermarkIcon },
      { key: 'memeGenerator', href: '/meme-generator', icon: MemeGeneratorIcon },
    ],
  },
  {
    key: 'video',
    icon: Video,
    items: [
      { key: 'videoConverter', href: '/video-converter', icon: VideoConverterIcon },
      { key: 'videoFormatConverter', href: '/video-format-converter', icon: VideoFormatIcon },
      { key: 'videoResizer', href: '/video-resizer', icon: VideoResizerIcon },
    ],
  },
  {
    key: 'others',
    icon: MoreHorizontal,
    items: [
      { key: 'htmlToImage', href: '/html-to-image', icon: HtmlToImageIcon },
      { key: 'urlGenerator', href: '/url-generator', icon: UrlGeneratorIcon },
    ],
  },
];

// 모바일용 플랫 메뉴
const navigationItems = menuCategories.flatMap((cat) => cat.items);

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

  const hasActiveItem = category.items.some((item) => isPathActive(item.href));

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
          transition-all duration-200
          ${hasActiveItem
            ? 'border-4 border-black bg-black text-white'
            : 'border-4 border-transparent hover:border-black'
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
        <div className="absolute top-full left-0 mt-1 min-w-[240px] z-50 bg-white border-4 border-black shadow-[8px_8px_0_0_#000]">
          {category.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = isPathActive(item.href);

            return (
              <Link
                key={item.key}
                href={getLocalizedHref(item.href)}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-bold
                  transition-all duration-200
                  ${isActive
                    ? 'bg-black text-white border-b-2 border-gray-200 last:border-b-0'
                    : 'hover:bg-gray-100 border-b-2 border-gray-200 last:border-b-0'
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

  const getLocalizedHref = (href: string) => {
    if (locale === 'en') return href;
    return `/${locale}${href}`;
  };

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
    <header className="sticky top-0 z-50" style={{ background: 'var(--header-bg)', borderBottom: 'var(--border-width) solid var(--header-border)' }}>
      <nav className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href={getLocalizedHref('/')} className="group flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 transition-colors duration-200" style={{ border: 'var(--border-width) solid var(--border)', background: 'var(--primary)', borderRadius: 'var(--radius)' }}>
              <Zap className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <span className="font-black text-xl tracking-tight">
              {t('common.siteName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeSelector />
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
          <div className="lg:hidden pb-6 mt-4 border-t-4 border-black">
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
                      flex items-center gap-3 px-4 py-3 text-sm font-bold
                      transition-all duration-200
                      ${isActive
                        ? 'border-4 border-black bg-black text-white'
                        : 'border-4 border-transparent hover:border-black'
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
