'use client';

import { useTranslations } from 'next-intl';
import { Download, RefreshCw, Code, Eye } from 'lucide-react';
import { HtmlToImageIcon } from '@/components/icons/FeatureIcons';
import { PageHeader, FormatButton } from '@/design-system/v2';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { useHtmlToImage } from './_hooks/useHtmlToImage';
import { FORMAT_OPTIONS } from './_constants';
import type { ImageFormat } from './_types';

const ACCENT = ACCENT_COLORS.yellow;

export default function HtmlToImagePage() {
  const t = useTranslations();
  const {
    html,
    css,
    width,
    height,
    format,
    quality,
    backgroundColor,
    isConverting,
    result,
    resultUrl,
    activeTab,
    previewRef,
    setHtml,
    setCss,
    setWidth,
    setHeight,
    setFormat,
    setQuality,
    setBackgroundColor,
    setActiveTab,
    handleConvert,
    handleDownload,
  } = useHtmlToImage();

  return (
    <ToolPageLayout maxWidth="xl">
      {/* Header */}
      <PageHeader
        icon={<HtmlToImageIcon size={28} className="text-black" />}
        iconBgColor={ACCENT}
        title={t('htmlToImage.title')}
        description={t('htmlToImage.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('htmlToImage.constraints.0'), t('htmlToImage.constraints.1')]}
        accentColor="emerald"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 코드 에디터 */}
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <div className="p-6 bg-white border-4 border-black h-full">
            {/* 탭 */}
            <div className="flex gap-2 mb-4">
              <FormatButton
                label="HTML"
                active={activeTab === 'html'}
                accentColor={ACCENT}
                onClick={() => setActiveTab('html')}
              />
              <FormatButton
                label="CSS"
                active={activeTab === 'css'}
                accentColor={ACCENT}
                onClick={() => setActiveTab('css')}
              />
            </div>

            {activeTab === 'html' ? (
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder={t('htmlToImage.htmlPlaceholder')}
                className="w-full h-64 px-4 py-3 bg-gray-50 border-4 border-black text-black text-sm font-mono resize-none focus:outline-none"
              />
            ) : (
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder={t('htmlToImage.cssPlaceholder')}
                className="w-full h-64 px-4 py-3 bg-gray-50 border-4 border-black text-black text-sm font-mono resize-none focus:outline-none"
              />
            )}

            {/* 설정 */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-900 mb-1">
                    {t('htmlToImage.width')}
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={4000}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white text-black border-4 border-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-900 mb-1">
                    {t('htmlToImage.height')}
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={4000}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white text-black border-4 border-black text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-900 mb-1">
                    {t('htmlToImage.format')}
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ImageFormat)}
                    className="w-full px-3 py-2 bg-white text-black border-4 border-black text-sm"
                  >
                    {FORMAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-900 mb-1">
                    {t('htmlToImage.quality')}
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white text-black border-4 border-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-900 mb-1">
                    {t('htmlToImage.bgColor')}
                  </label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-[38px] cursor-pointer border-4 border-black bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 미리보기 */}
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
          <div className="p-6 bg-white border-4 border-black h-full">
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" style={{ color: ACCENT }} />
              {t('htmlToImage.preview')}
            </h3>
            <div className="border-4 border-black overflow-hidden" style={{ backgroundColor }}>
              <iframe
                ref={previewRef}
                title="HTML Preview"
                className="w-full border-0"
                style={{ height: '300px' }}
                sandbox="allow-same-origin"
              />
            </div>

            {/* 결과 */}
            {resultUrl && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-2">
                  {t('htmlToImage.result')}
                </h4>
                <div className="border-4 border-black overflow-hidden">
                  <img src={resultUrl} alt="Converted result" className="w-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-3 justify-center mt-6 opacity-0 animate-fade-up"
        style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
      >
        <button
          onClick={handleConvert}
          disabled={isConverting || !html.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-4 border-black font-bold uppercase tracking-wide text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: ACCENT, color: 'black' }}
        >
          {isConverting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t('htmlToImage.converting')}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {t('htmlToImage.convert')}
            </>
          )}
        </button>
        {result && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-black text-white font-bold uppercase tracking-wide text-sm transition-all hover:bg-gray-900"
          >
            <Download className="w-4 h-4" />
            {t('common.download')}
          </button>
        )}
      </div>

      {/* How To Use */}
      <div className="mt-12">
        <HowToUse
          title={t('htmlToImage.howToUse.title')}
          description={t('htmlToImage.howToUse.description')}
          accentColor="emerald"
          steps={[
            { number: 1, title: t('htmlToImage.howToUse.step1Title'), description: t('htmlToImage.howToUse.step1Desc') },
            { number: 2, title: t('htmlToImage.howToUse.step2Title'), description: t('htmlToImage.howToUse.step2Desc') },
            { number: 3, title: t('htmlToImage.howToUse.step3Title'), description: t('htmlToImage.howToUse.step3Desc') },
          ]}
          supportedFormats={['PNG', 'JPG', 'SVG']}
          features={[
            { title: t('htmlToImage.features.code'), description: t('htmlToImage.features.codeDesc') },
            { title: t('htmlToImage.features.preview'), description: t('htmlToImage.features.previewDesc') },
            { title: t('htmlToImage.features.format'), description: t('htmlToImage.features.formatDesc') },
            { title: t('htmlToImage.features.size'), description: t('htmlToImage.features.sizeDesc') },
          ]}
        />
      </div>
    </ToolPageLayout>
  );
}
