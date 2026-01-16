'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Shield, Zap, Globe, ChevronRight } from 'lucide-react';
import {
  ImageConverterIcon,
  ImageEditorIcon,
  GifMakerIcon,
  VideoConverterIcon,
  UrlGeneratorIcon,
} from '@/components/icons/FeatureIcons';

const accentConfig = {
  cyan: {
    bg: 'bg-[oklch(0.75_0.18_195)]',
    bgHover: 'group-hover:bg-[oklch(0.80_0.20_195)]',
    border: 'border-[oklch(0.75_0.18_195/0.2)]',
    borderHover: 'group-hover:border-[oklch(0.75_0.18_195/0.4)]',
    text: 'text-[oklch(0.80_0.20_195)]',
    glow: 'group-hover:shadow-[0_0_40px_oklch(0.75_0.18_195/0.25)]',
    badge: 'bg-[oklch(0.75_0.18_195/0.1)] text-[oklch(0.80_0.20_195)]',
  },
  violet: {
    bg: 'bg-[oklch(0.65_0.22_290)]',
    bgHover: 'group-hover:bg-[oklch(0.70_0.26_290)]',
    border: 'border-[oklch(0.65_0.22_290/0.2)]',
    borderHover: 'group-hover:border-[oklch(0.65_0.22_290/0.4)]',
    text: 'text-[oklch(0.70_0.26_290)]',
    glow: 'group-hover:shadow-[0_0_40px_oklch(0.65_0.22_290/0.25)]',
    badge: 'bg-[oklch(0.65_0.22_290/0.1)] text-[oklch(0.70_0.26_290)]',
  },
  emerald: {
    bg: 'bg-[oklch(0.72_0.17_160)]',
    bgHover: 'group-hover:bg-[oklch(0.78_0.20_160)]',
    border: 'border-[oklch(0.72_0.17_160/0.2)]',
    borderHover: 'group-hover:border-[oklch(0.72_0.17_160/0.4)]',
    text: 'text-[oklch(0.78_0.20_160)]',
    glow: 'group-hover:shadow-[0_0_40px_oklch(0.72_0.17_160/0.25)]',
    badge: 'bg-[oklch(0.72_0.17_160/0.1)] text-[oklch(0.78_0.20_160)]',
  },
  amber: {
    bg: 'bg-[oklch(0.80_0.18_80)]',
    bgHover: 'group-hover:bg-[oklch(0.85_0.22_80)]',
    border: 'border-[oklch(0.80_0.18_80/0.2)]',
    borderHover: 'group-hover:border-[oklch(0.80_0.18_80/0.4)]',
    text: 'text-[oklch(0.85_0.22_80)]',
    glow: 'group-hover:shadow-[0_0_40px_oklch(0.80_0.18_80/0.25)]',
    badge: 'bg-[oklch(0.80_0.18_80/0.1)] text-[oklch(0.85_0.22_80)]',
  },
  magenta: {
    bg: 'bg-[oklch(0.70_0.20_330)]',
    bgHover: 'group-hover:bg-[oklch(0.75_0.25_330)]',
    border: 'border-[oklch(0.70_0.20_330/0.2)]',
    borderHover: 'group-hover:border-[oklch(0.70_0.20_330/0.4)]',
    text: 'text-[oklch(0.75_0.25_330)]',
    glow: 'group-hover:shadow-[0_0_40px_oklch(0.70_0.20_330/0.25)]',
    badge: 'bg-[oklch(0.70_0.20_330/0.1)] text-[oklch(0.75_0.25_330)]',
  },
};

export default function Home() {
  const t = useTranslations();

  const tools = [
    {
      id: 'image-converter',
      nameKey: 'imageConverter.title',
      descKey: 'imageConverter.description',
      icon: ImageConverterIcon,
      href: '/image-converter',
      accent: 'cyan',
      features: ['HEIC → JPG', 'PNG → WebP', t('imageConverter.quality')],
    },
    {
      id: 'image-editor',
      nameKey: 'imageEditor.title',
      descKey: 'imageEditor.description',
      icon: ImageEditorIcon,
      href: '/image-editor',
      accent: 'violet',
      features: [t('imageEditor.toolbar.crop'), t('imageEditor.toolbar.rotate'), t('imageEditor.toolbar.optimize')],
    },
    {
      id: 'gif-maker',
      nameKey: 'gifMaker.title',
      descKey: 'gifMaker.description',
      icon: GifMakerIcon,
      href: '/gif-maker',
      accent: 'emerald',
      features: ['Image → GIF', t('gifMaker.frameDelay'), t('gifMaker.outputSize')],
    },
    {
      id: 'video-converter',
      nameKey: 'videoConverter.title',
      descKey: 'videoConverter.description',
      icon: VideoConverterIcon,
      href: '/video-converter',
      accent: 'amber',
      features: [t('videoConverter.mode.videoToGif'), t('videoConverter.mode.gifToVideo'), t('videoConverter.mode.extractFrames')],
    },
    {
      id: 'url-generator',
      nameKey: 'urlGenerator.title',
      descKey: 'urlGenerator.description',
      icon: UrlGeneratorIcon,
      href: '/url-generator',
      accent: 'magenta',
      features: ['Base64 URL', 'Blob URL', t('urlGenerator.types.r2')],
    },
  ];

  const features = [
    {
      icon: Shield,
      titleKey: 'home.privacyTitle',
      descKey: 'home.privacyDesc',
    },
    {
      icon: Zap,
      titleKey: 'home.speedTitle',
      descKey: 'home.speedDesc',
    },
    {
      icon: Globe,
      titleKey: 'home.freeTitle',
      descKey: 'home.freeDesc',
    },
  ];

  return (
    <div className="min-h-full">
      {/* Hero Section - Editorial Style */}
      <section className="relative overflow-hidden bg-gradient-mesh">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Floating Orbs */}
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-[oklch(0.75_0.18_195/0.15)] rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-[15%] w-48 h-48 bg-[oklch(0.70_0.20_330/0.12)] rounded-full blur-[80px] animate-float" style={{ animationDelay: '-2s' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Content - Typography Heavy */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[oklch(1_0_0/0.1)] bg-[oklch(1_0_0/0.03)]">
                <Shield className="w-4 h-4 text-[oklch(0.72_0.17_160)]" />
                <span className="text-sm text-[oklch(0.70_0.02_240)]">{t('common.browserProcessing')}</span>
                <span className="text-[oklch(0.50_0.02_240)]">·</span>
                <span className="text-sm text-[oklch(0.70_0.02_240)]">{t('common.noServerUpload')}</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95]">
                  <span className="text-[oklch(0.95_0.01_80)]">Media</span>{' '}
                  <span className="text-[oklch(0.75_0.18_195)]">Utility</span>
                </h1>
                <p className="text-xl sm:text-2xl text-[oklch(0.60_0.02_240)] max-w-lg leading-relaxed">
                  {t('home.subtitle')}
                </p>
              </div>

              {/* Description */}
              <p className="text-[oklch(0.55_0.02_240)] max-w-xl leading-relaxed">
                {t('home.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/image-converter"
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_40px_oklch(0.75_0.18_195/0.4)]"
                >
                  {t('common.startNow')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-[oklch(1_0_0/0.2)] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
                </Link>
                <Link
                  href="#tools"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[oklch(1_0_0/0.1)] text-[oklch(0.80_0.02_240)] font-medium hover:bg-[oklch(1_0_0/0.05)] hover:border-[oklch(1_0_0/0.2)] transition-all"
                >
                  {t('common.exploreFunctions')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Side - Stats/Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.titleKey}
                    className={`
                      group p-5 rounded-xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.12_0.015_250/0.5)]
                      hover:border-[oklch(1_0_0/0.12)] hover:bg-[oklch(0.14_0.02_250/0.6)]
                      transition-all duration-300 backdrop-blur-sm
                      opacity-0 animate-fade-up
                    `}
                    style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[oklch(0.20_0.03_240)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-[oklch(0.75_0.18_195)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[oklch(0.95_0.01_80)] mb-1">{t(feature.titleKey)}</h3>
                        <p className="text-sm text-[oklch(0.55_0.02_240)] leading-relaxed">{t(feature.descKey)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid - Asymmetric Bento Layout */}
      <section id="tools" className="py-24 bg-[oklch(0.08_0.01_240)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header - Left Aligned Editorial */}
          <div className="max-w-xl mb-16">
            <span className="font-mono text-xs text-[oklch(0.75_0.18_195)] uppercase tracking-widest">{t('home.tools')}</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tighter text-[oklch(0.95_0.01_80)]">
              {t('home.selectTool')}
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const accent = accentConfig[tool.accent as keyof typeof accentConfig];
              const isLarge = index === 0 || index === 3;

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`
                    group relative p-6 rounded-2xl border bg-[oklch(0.10_0.015_250)]
                    ${accent.border} ${accent.borderHover} ${accent.glow}
                    transition-all duration-500
                    ${isLarge ? 'md:col-span-2 lg:col-span-1' : ''}
                    opacity-0 animate-fade-up
                  `}
                  style={{ animationDelay: `${0.1 + index * 0.08}s`, animationFillMode: 'forwards' }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[oklch(1_0_0/0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative space-y-4">
                    {/* Icon */}
                    <div className={`
                      inline-flex items-center justify-center w-12 h-12 rounded-xl
                      ${accent.bg} ${accent.bgHover} transition-colors
                    `}>
                      <Icon size={24} className="text-[oklch(0.08_0.01_240)]" />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xl font-semibold text-[oklch(0.95_0.01_80)] mb-2 group-hover:text-[oklch(1_0.01_80)] transition-colors">
                        {t(tool.nameKey)}
                      </h3>
                      <p className="text-sm text-[oklch(0.55_0.02_240)] leading-relaxed mb-4">
                        {t(tool.descKey)}
                      </p>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature) => (
                        <span
                          key={feature}
                          className={`
                            px-2.5 py-1 rounded-md text-xs font-medium
                            ${accent.badge}
                          `}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className={`flex items-center gap-1 text-sm font-medium ${accent.text} mt-4`}>
                      <span>{t('common.startNow')}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.01_240)] via-[oklch(0.10_0.02_250)] to-[oklch(0.08_0.01_240)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.02)_1px,transparent_1px)] bg-[size:6rem_6rem]" />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[oklch(0.75_0.18_195/0.08)] rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[oklch(0.72_0.17_160/0.3)] bg-[oklch(0.72_0.17_160/0.1)]">
              <Zap className="w-4 h-4 text-[oklch(0.78_0.20_160)]" />
              <span className="text-sm font-medium text-[oklch(0.78_0.20_160)]">{t('home.noInstall')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-[oklch(0.95_0.01_80)]">
              {t('home.ctaTitle')}
            </h2>

            <p className="text-[oklch(0.55_0.02_240)] max-w-xl mx-auto">
              {t('home.ctaDesc')}
            </p>

            <Link
              href="/image-converter"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[oklch(0.95_0.01_80)] text-[oklch(0.08_0.01_240)] font-semibold text-lg transition-all hover:shadow-[0_0_50px_oklch(0.95_0.01_80/0.3)]"
            >
              {t('common.startNow')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
