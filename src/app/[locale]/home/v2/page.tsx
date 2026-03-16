'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import {
  ImageConverterIcon,
  ImageCompressorIcon,
  ImageEditorIcon,
  GifMakerIcon,
  VideoConverterIcon,
  VideoFormatIcon,
  VideoResizerIcon,
  UrlGeneratorIcon,
  BackgroundRemoverIcon,
  WatermarkIcon,
  MemeGeneratorIcon,
  FaceBlurIcon,
  HtmlToImageIcon,
  UpscalerIcon,
} from '@/components/icons/FeatureIcons';

// Swiss Modernism + Exaggerated Minimalism: Pink + Cyan color system
const accentConfig = {
  pink: {
    bg: 'bg-[#EC4899]',
    hover: 'hover:bg-[#F472B6]',
    text: 'text-[#EC4899]',
    border: 'border-[#EC4899]',
  },
  cyan: {
    bg: 'bg-[#06B6D4]',
    hover: 'hover:bg-[#22D3EE]',
    text: 'text-[#06B6D4]',
    border: 'border-[#06B6D4]',
  },
  orange: {
    bg: 'bg-[#F97316]',
    hover: 'hover:bg-[#FB923C]',
    text: 'text-[#F97316]',
    border: 'border-[#F97316]',
  },
  purple: {
    bg: 'bg-[#A855F7]',
    hover: 'hover:bg-[#C084FC]',
    text: 'text-[#A855F7]',
    border: 'border-[#A855F7]',
  },
  emerald: {
    bg: 'bg-[#10B981]',
    hover: 'hover:bg-[#34D399]',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]',
  },
  yellow: {
    bg: 'bg-[#FBBF24]',
    hover: 'hover:bg-[#FCD34D]',
    text: 'text-[#FBBF24]',
    border: 'border-[#FBBF24]',
  },
};

export default function HomeV2() {
  const t = useTranslations();

  const tools = [
    {
      id: 'image-converter',
      nameKey: 'imageConverter.title',
      descKey: 'imageConverter.description',
      icon: ImageConverterIcon,
      href: '/image-converter',
      accent: 'pink',
      number: '01',
    },
    {
      id: 'image-compressor',
      nameKey: 'imageCompressor.title',
      descKey: 'imageCompressor.description',
      icon: ImageCompressorIcon,
      href: '/image-compressor',
      accent: 'cyan',
      number: '02',
    },
    {
      id: 'image-editor',
      nameKey: 'imageEditor.title',
      descKey: 'imageEditor.description',
      icon: ImageEditorIcon,
      href: '/image-editor',
      accent: 'purple',
      number: '03',
    },
    {
      id: 'watermark',
      nameKey: 'watermark.title',
      descKey: 'watermark.description',
      icon: WatermarkIcon,
      href: '/watermark',
      accent: 'emerald',
      number: '04',
    },
    {
      id: 'meme-generator',
      nameKey: 'memeGenerator.title',
      descKey: 'memeGenerator.description',
      icon: MemeGeneratorIcon,
      href: '/meme-generator',
      accent: 'orange',
      number: '05',
    },
    {
      id: 'background-remover',
      nameKey: 'backgroundRemover.title',
      descKey: 'backgroundRemover.description',
      icon: BackgroundRemoverIcon,
      href: '/background-remover',
      accent: 'purple',
      number: '06',
    },
    {
      id: 'face-blur',
      nameKey: 'faceBlur.title',
      descKey: 'faceBlur.description',
      icon: FaceBlurIcon,
      href: '/face-blur',
      accent: 'pink',
      number: '07',
    },
    {
      id: 'html-to-image',
      nameKey: 'htmlToImage.title',
      descKey: 'htmlToImage.description',
      icon: HtmlToImageIcon,
      href: '/html-to-image',
      accent: 'yellow',
      number: '08',
    },
    {
      id: 'image-upscaler',
      nameKey: 'imageUpscaler.title',
      descKey: 'imageUpscaler.description',
      icon: UpscalerIcon,
      href: '/image-upscaler',
      accent: 'cyan',
      number: '09',
    },
    {
      id: 'gif-maker',
      nameKey: 'gifMaker.title',
      descKey: 'gifMaker.description',
      icon: GifMakerIcon,
      href: '/gif-maker',
      accent: 'emerald',
      number: '10',
    },
    {
      id: 'video-converter',
      nameKey: 'videoConverter.title',
      descKey: 'videoConverter.description',
      icon: VideoConverterIcon,
      href: '/video-converter',
      accent: 'orange',
      number: '11',
    },
    {
      id: 'video-format-converter',
      nameKey: 'videoFormatConverter.title',
      descKey: 'videoFormatConverter.description',
      icon: VideoFormatIcon,
      href: '/video-format-converter',
      accent: 'cyan',
      number: '12',
    },
    {
      id: 'video-resizer',
      nameKey: 'videoResizer.title',
      descKey: 'videoResizer.description',
      icon: VideoResizerIcon,
      href: '/video-resizer',
      accent: 'purple',
      number: '13',
    },
    {
      id: 'url-generator',
      nameKey: 'urlGenerator.title',
      descKey: 'urlGenerator.description',
      icon: UrlGeneratorIcon,
      href: '/url-generator',
      accent: 'pink',
      number: '14',
    },
  ];

  const features = [
    {
      icon: Shield,
      titleKey: 'home.privacyTitle',
      descKey: 'home.privacyDesc',
      color: '#EC4899',
    },
    {
      icon: Zap,
      titleKey: 'home.speedTitle',
      descKey: 'home.speedDesc',
      color: '#06B6D4',
    },
    {
      icon: Globe,
      titleKey: 'home.freeTitle',
      descKey: 'home.freeDesc',
      color: '#F97316',
    },
  ];

  return (
    <div className="min-h-full">
      {/* Hero Section - Exaggerated Minimalism */}
      <section className="relative overflow-hidden border-b-4 border-black bg-white">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Left - Giant Typography */}
            <div className="lg:col-span-7 space-y-8">
              {/* Small Label */}
              <div className="inline-flex items-center gap-3 px-0">
                <div className="w-2 h-2 bg-[#EC4899] rotate-45" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">
                  {t('common.browserProcessing')}
                </span>
              </div>

              {/* Giant Headline - Exaggerated */}
              <div className="space-y-2">
                <h1
                  className="font-black tracking-[-0.05em] leading-[0.85]"
                  style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
                >
                  <span className="text-black">Media</span>
                  <br />
                  <span className="text-[#EC4899]">Utility</span>
                </h1>
                <div className="w-20 h-1.5 bg-[#06B6D4]" />
              </div>

              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-gray-900 max-w-xl font-medium leading-relaxed">
                {t('home.subtitle')}
              </p>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/image-converter"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-bold text-lg border-4 border-black hover:bg-white hover:text-black transition-all duration-200 cursor-pointer"
                >
                  {t('common.startNow')}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2 duration-200" />
                </Link>
                <Link
                  href="#tools"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg border-4 border-black hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
                >
                  {t('common.exploreFunctions')}
                </Link>
              </div>
            </div>

            {/* Right - Feature Blocks */}
            <div className="lg:col-span-5 space-y-1">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.titleKey}
                    className="group p-6 border-4 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-4 border-current group-hover:rotate-12 transition-transform duration-200"
                        style={{ color: feature.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg mb-1 uppercase tracking-wide text-black group-hover:text-white">{t(feature.titleKey)}</h3>
                        <p className="text-sm leading-relaxed text-gray-900 group-hover:text-white">{t(feature.descKey)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid - Swiss Grid System */}
      <section id="tools" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Section Header */}
          <div className="mb-16 pb-8 border-b-4 border-black">
            <div className="flex items-end justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-[#EC4899]">
                  {t('home.tools')}
                </span>
                <h2 className="mt-2 text-5xl lg:text-7xl font-black tracking-[-0.03em] text-black">
                  {t('home.selectTool')}
                </h2>
              </div>
              <div className="hidden lg:block text-6xl font-black text-gray-300">14</div>
            </div>
          </div>

          {/* Grid - 12 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const accent = accentConfig[tool.accent as keyof typeof accentConfig];

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-white border-4 border-black p-6 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* Number - Large Background */}
                  <div className="absolute top-4 right-4 text-7xl font-black text-gray-100 group-hover:text-white/5 transition-colors duration-200">
                    {tool.number}
                  </div>

                  <div className="relative space-y-4">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 border-4 border-current ${accent.text} group-hover:border-white group-hover:text-white transition-all duration-200`}>
                      <Icon size={28} />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-wide mb-2 leading-tight text-black group-hover:text-white">
                        {t(tool.nameKey)}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-900 group-hover:text-white">
                        {t(tool.descKey)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-sm font-bold uppercase pt-2 text-black group-hover:text-white">
                      <span>{t('common.startNow')}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2 duration-200" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold Statement */}
      <section className="relative py-32 bg-black text-white overflow-hidden">
        {/* Accent Squares */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#EC4899] rotate-12 opacity-20" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#06B6D4] -rotate-12 opacity-20" />

        <div className="relative mx-auto max-w-5xl px-6 lg:px-12 text-center">
          <div className="space-y-12">
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-[#06B6D4] rotate-45" />
                <span className="font-mono text-sm uppercase tracking-[0.2em] font-bold">
                  {t('home.noInstall')}
                </span>
                <div className="w-3 h-3 bg-[#EC4899] rotate-45" />
              </div>

              <h2 className="text-5xl lg:text-7xl font-black tracking-[-0.03em] leading-tight">
                {t('home.ctaTitle')}
              </h2>
            </div>

            <p className="text-xl text-gray-200 max-w-2xl mx-auto font-medium">
              {t('home.ctaDesc')}
            </p>

            <Link
              href="/image-converter"
              className="group inline-flex items-center gap-4 px-12 py-5 bg-white text-black font-black text-xl border-4 border-white hover:bg-[#EC4899] hover:border-[#EC4899] hover:text-white transition-all duration-200 cursor-pointer"
            >
              {t('common.startNow')}
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2 duration-200" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
