'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { MemeGeneratorIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { PageHeader, SettingsPanel, RangeSlider, ActionButtonGroup } from '@/design-system/v2/components';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import { FONT_OPTIONS } from './_constants';
import { useMemeGenerator } from './_hooks/useMemeGenerator';

// 악센트 컬러
const ACCENT = ACCENT_COLORS.orange; // #F97316

export default function MemeGeneratorPage() {
  const t = useTranslations();

  const {
    file,
    preview,
    result,
    resultUrl,
    topText,
    setTopText,
    bottomText,
    setBottomText,
    fontSize,
    setFontSize,
    textColor,
    setTextColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    fontFamily,
    setFontFamily,
    isGenerating,
    hasText,
    previewCanvasRef,
    handleFilesSelected,
    handleClear,
    handleGenerate,
    handleDownload,
  } = useMemeGenerator();

  return (
    <ToolPageLayout>
      {/* Header */}
      <PageHeader
        icon={<MemeGeneratorIcon size={28} className="text-black" />}
        iconBgColor={ACCENT}
        title={t('memeGenerator.title')}
        description={t('memeGenerator.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('memeGenerator.constraints.0'), t('memeGenerator.constraints.1')]}
        accentColor="amber"
      />

      {/* 업로드 영역 */}
      {!file && (
        <div
          className="mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <div className="p-6 bg-white border-4 border-black">
            <FileUploader
              accept="image/*"
              multiple={false}
              maxFiles={1}
              maxSize={50}
              onFilesSelected={handleFilesSelected}
            />
          </div>
        </div>
      )}

      {/* 편집 영역 */}
      {file && (
        <>
          {/* 미리보기 패널 */}
          <div
            className="mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <div className="p-6 bg-white border-4 border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black uppercase tracking-wide text-black">
                  {t('memeGenerator.preview')}
                </h3>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 border-2 border-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  {t('memeGenerator.changeImage')}
                </button>
              </div>
              <div className="flex justify-center">
                <canvas
                  ref={previewCanvasRef}
                  className="border-4 border-black max-w-full"
                />
              </div>
            </div>
          </div>

          {/* 텍스트 설정 패널 */}
          <SettingsPanel
            title={t('memeGenerator.textSettings')}
            accentColor={ACCENT}
          >
            <div className="space-y-6">
              {/* 상단 텍스트 */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                  {t('memeGenerator.topText')}
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder={t('memeGenerator.topTextPlaceholder')}
                  className="w-full px-3 py-2 bg-white text-black border-4 border-black text-sm focus:outline-none"
                  style={{ borderColor: topText.trim() ? ACCENT : undefined }}
                />
              </div>

              {/* 하단 텍스트 */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                  {t('memeGenerator.bottomText')}
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder={t('memeGenerator.bottomTextPlaceholder')}
                  className="w-full px-3 py-2 bg-white text-black border-4 border-black text-sm focus:outline-none"
                  style={{ borderColor: bottomText.trim() ? ACCENT : undefined }}
                />
              </div>

              {/* 폰트 크기 / 스트로크 두께 */}
              <div className="grid grid-cols-2 gap-6">
                <RangeSlider
                  label={t('memeGenerator.fontSize')}
                  value={fontSize}
                  min={20}
                  max={200}
                  accentColor={ACCENT}
                  unit="px"
                  onChange={setFontSize}
                />
                <RangeSlider
                  label={t('memeGenerator.strokeWidth')}
                  value={strokeWidth}
                  min={0}
                  max={15}
                  accentColor={ACCENT}
                  unit="px"
                  onChange={setStrokeWidth}
                />
              </div>

              {/* 색상 / 폰트 선택 */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                    {t('memeGenerator.textColor')}
                  </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 cursor-pointer border-4 border-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                    {t('memeGenerator.strokeColor')}
                  </label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-10 cursor-pointer border-4 border-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                    {t('memeGenerator.font')}
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-black border-4 border-black text-sm"
                  >
                    {FONT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </SettingsPanel>

          {/* 액션 버튼 */}
          <ActionButtonGroup
            accentColor={ACCENT}
            delay="0.2s"
            primaryAction={{
              label: t('memeGenerator.generate'),
              loadingLabel: t('memeGenerator.generating'),
              isLoading: isGenerating,
              disabled: !hasText,
              onClick: handleGenerate,
            }}
            downloadAction={
              result
                ? {
                    label: t('common.download'),
                    onClick: handleDownload,
                  }
                : undefined
            }
          />

          {/* 결과 */}
          {resultUrl && (
            <div
              className="mt-6 opacity-0 animate-fade-up"
              style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
            >
              <div className="p-6 bg-white border-4 border-black">
                <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4">
                  {t('memeGenerator.result')}
                </h3>
                <div className="flex justify-center">
                  <img
                    src={resultUrl}
                    alt="Generated meme"
                    className="border-4 border-black max-w-full max-h-[500px]"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 사용 방법 */}
      <div className="mt-12">
        <HowToUse
          title={t('memeGenerator.howToUse.title')}
          description={t('memeGenerator.howToUse.description')}
          accentColor="amber"
          steps={[
            { number: 1, title: t('memeGenerator.howToUse.step1Title'), description: t('memeGenerator.howToUse.step1Desc') },
            { number: 2, title: t('memeGenerator.howToUse.step2Title'), description: t('memeGenerator.howToUse.step2Desc') },
            { number: 3, title: t('memeGenerator.howToUse.step3Title'), description: t('memeGenerator.howToUse.step3Desc') },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'GIF']}
        />
      </div>
    </ToolPageLayout>
  );
}
