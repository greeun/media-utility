'use client';

import { useTranslations } from 'next-intl';
import { Trash2, Download, GripVertical, ChevronUp, ChevronDown, Loader2, Film } from 'lucide-react';
import { GifMakerIcon } from '@/components/icons/FeatureIcons';
import { PageHeader, SettingsPanel, RangeSlider, UploadArea } from '@/design-system/v2';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import useGifMaker from './_hooks/useGifMaker';

const accent = ACCENT_COLORS.emerald;

export default function GifMakerPage() {
  const t = useTranslations();
  const {
    images,
    isGenerating,
    progress,
    resultGif,
    resultPreview,
    width,
    height,
    delay,
    isDragging,
    setWidth,
    setHeight,
    setDelay,
    handleFilesSelected,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    removeImage,
    clearAll,
    moveImage,
    handleGenerate,
    handleDownload,
  } = useGifMaker();

  return (
    <ToolPageLayout maxWidth="xl">
      {/* 헤더 */}
      <PageHeader
        icon={<GifMakerIcon size={28} className="text-black" />}
        iconBgColor={accent}
        title={t('gifMaker.title')}
        description={t('gifMaker.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('gifMaker.constraints.0'), t('gifMaker.constraints.1')]}
        accentColor="emerald"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 왼쪽: 업로드 + 이미지 목록 */}
        <div className="space-y-4">
          {/* 업로드 영역 */}
          <UploadArea
            accentColor={accent}
            label={t('gifMaker.addImages')}
            hint="PNG, JPG, WebP"
            accept="image/*"
            delay="0.1s"
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileSelect={handleFilesSelected}
            multiple
          />

          {/* 이미지 목록 */}
          {images.length > 0 && (
            <div
              className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
              style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-black">
                  {t('gifMaker.images')}{' '}
                  <span className="text-gray-500 font-normal">({images.length})</span>
                </h3>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('common.deleteAll')}
                </button>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-mono font-bold text-gray-500 w-5">
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-black">
                      <img
                        src={img.preview}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                      {img.file.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(index, index - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          onClick={() => moveImage(index, index + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 설정 + 결과 */}
        <div className="space-y-4">
          {/* 설정 패널 */}
          <SettingsPanel title={t('gifMaker.options')} accentColor={accent} delay="0.2s">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                    {t('imageEditor.resize.width')} (px)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min="100"
                    max="1000"
                    className="w-full px-3 py-2 bg-white border-4 border-black text-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                    {t('imageEditor.resize.height')} (px)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min="100"
                    max="1000"
                    className="w-full px-3 py-2 bg-white border-4 border-black text-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <RangeSlider
                label={t('gifMaker.frameDelay')}
                value={delay}
                min={100}
                max={2000}
                step={100}
                accentColor={accent}
                unit="ms"
                onChange={setDelay}
              />
            </div>
          </SettingsPanel>

          {/* GIF 생성 버튼 */}
          {images.length >= 2 && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-black text-white border-4 border-black font-black uppercase tracking-wide text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-up"
              style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('gifMaker.creating')} {progress}%
                </>
              ) : (
                <>
                  <Film className="w-5 h-5" />
                  {t('gifMaker.createGif')}
                </>
              )}
            </button>
          )}

          {/* 진행 바 */}
          {isGenerating && (
            <div className="h-2 bg-gray-300 border-2 border-black overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: accent }}
              />
            </div>
          )}

          {/* 결과 프리뷰 */}
          {resultPreview && (
            <div
              className="p-6 bg-white border-4 border-black opacity-0 animate-scale-in"
              style={{ animationFillMode: 'forwards' }}
            >
              <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4">
                {t('gifMaker.result')}
              </h3>
              <div className="border-4 border-black p-4 flex items-center justify-center bg-gray-50">
                <img
                  src={resultPreview}
                  alt="Generated GIF"
                  className="max-w-full max-h-[280px]"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  {((resultGif?.size || 0) / 1024).toFixed(1)} KB
                </span>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-black uppercase tracking-wide text-white border-4 border-black hover:brightness-110 transition-all"
                  style={{ backgroundColor: accent }}
                >
                  <Download className="w-4 h-4" />
                  {t('common.download')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 사용 방법 */}
      <div className="mt-12">
        <HowToUse
          title={t('gifMaker.howToUse.title')}
          description={t('gifMaker.howToUse.description')}
          accentColor="emerald"
          steps={[
            {
              number: 1,
              title: t('gifMaker.howToUse.step1Title'),
              description: t('gifMaker.howToUse.step1Desc'),
            },
            {
              number: 2,
              title: t('gifMaker.howToUse.step2Title'),
              description: t('gifMaker.howToUse.step2Desc'),
            },
            {
              number: 3,
              title: t('gifMaker.howToUse.step3Title'),
              description: t('gifMaker.howToUse.step3Desc'),
            },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'BMP']}
        />
      </div>
    </ToolPageLayout>
  );
}
