'use client';

import { useTranslations } from 'next-intl';
import { Type, Image as ImageIcon } from 'lucide-react';
import { WatermarkIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import {
  PageHeader,
  SettingsPanel,
  FileListPanel,
  FileListItem,
  ActionButtonGroup,
  RangeSlider,
} from '@/design-system/v2/components';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import { useWatermark } from './_hooks/useWatermark';
import { POSITIONS, FONT_OPTIONS } from './_constants';

// 퍼플 액센트 컬러
const ACCENT = ACCENT_COLORS.purple;

export default function WatermarkPage() {
  const t = useTranslations();
  const {
    // 파일 관련
    files,
    removeFile,
    clearAll,
    handleFilesSelected,
    pendingCount,
    completedCount,
    // 처리 상태
    isProcessing,
    // 워터마크 타입
    watermarkType,
    setWatermarkType,
    // 텍스트 옵션
    text,
    setText,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    color,
    setColor,
    opacity,
    setOpacity,
    rotation,
    setRotation,
    position,
    setPosition,
    tileMode,
    setTileMode,
    // 이미지 옵션
    wmImagePreview,
    wmImageElement,
    wmScale,
    setWmScale,
    wmFileRef,
    handleWmImageSelect,
    // 미리보기
    previewCanvasRef,
    firstFile,
    // 액션
    handleApply,
    handleDownload,
    handleDownloadAll,
  } = useWatermark();

  return (
    <ToolPageLayout>
      {/* 헤더 */}
      <PageHeader
        icon={<WatermarkIcon size={32} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('watermark.title')}
        description={t('watermark.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('watermark.constraints.0')]}
        accentColor="teal"
      />

      {/* 업로드 영역 */}
      <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <div className="p-6 bg-white border-4 border-black">
          <FileUploader accept="image/*" multiple maxFiles={20} maxSize={50} onFilesSelected={handleFilesSelected} />
        </div>
      </div>

      {/* 설정 패널 */}
      {files.length > 0 && (
        <SettingsPanel title={t('watermark.settings')} accentColor={ACCENT}>
          {/* 워터마크 타입 선택 */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setWatermarkType('text')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wide border-4 border-black transition-all duration-200 ${
                watermarkType === 'text'
                  ? 'text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={watermarkType === 'text' ? { backgroundColor: ACCENT } : undefined}
            >
              <Type className="w-4 h-4" strokeWidth={2.5} /> {t('watermark.textType')}
            </button>
            <button
              onClick={() => setWatermarkType('image')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wide border-4 border-black transition-all duration-200 ${
                watermarkType === 'image'
                  ? 'text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={watermarkType === 'image' ? { backgroundColor: ACCENT } : undefined}
            >
              <ImageIcon className="w-4 h-4" strokeWidth={2.5} /> {t('watermark.imageType')}
            </button>
          </div>

          {watermarkType === 'text' ? (
            <div className="space-y-5">
              {/* 텍스트 입력 */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                  {t('watermark.text')}
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black text-sm font-bold focus:outline-none"
                  placeholder={t('watermark.textPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                {/* 폰트 크기 */}
                <RangeSlider
                  label={t('watermark.fontSize')}
                  value={fontSize}
                  min={12}
                  max={200}
                  accentColor={ACCENT}
                  unit="px"
                  onChange={setFontSize}
                />
                {/* 회전 */}
                <RangeSlider
                  label={t('watermark.rotation')}
                  value={rotation}
                  min={-180}
                  max={180}
                  accentColor={ACCENT}
                  unit="deg"
                  onChange={setRotation}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                {/* 색상 */}
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                    {t('watermark.color')}
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-12 cursor-pointer border-4 border-black"
                  />
                </div>
                {/* 폰트 */}
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                    {t('watermark.font')}
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black text-sm font-bold"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 워터마크 이미지 선택 */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">
                  {t('watermark.wmImage')}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => wmFileRef.current?.click()}
                    className="px-5 py-3 bg-white text-black text-sm font-black uppercase tracking-wide border-4 border-black hover:bg-black hover:text-white transition-all duration-200"
                  >
                    {t('watermark.selectImage')}
                  </button>
                  <input ref={wmFileRef} type="file" accept="image/*" className="hidden" onChange={handleWmImageSelect} />
                  {wmImagePreview && (
                    <img src={wmImagePreview} alt="watermark" className="h-12 border-4 border-black" />
                  )}
                </div>
              </div>
              {/* 스케일 */}
              <RangeSlider
                label={t('watermark.scale')}
                value={wmScale}
                min={5}
                max={100}
                accentColor={ACCENT}
                onChange={setWmScale}
              />
            </div>
          )}

          {/* 공통 옵션 */}
          <div className="mt-6 space-y-5 pt-6 border-t-4 border-black">
            {/* 투명도 */}
            <RangeSlider
              label={t('watermark.opacity')}
              value={opacity}
              min={5}
              max={100}
              accentColor={ACCENT}
              onChange={setOpacity}
            />

            {/* 위치 */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">
                {t('watermark.position')}
              </label>
              <div className="grid grid-cols-3 gap-2 w-fit">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => { setPosition(pos.value); setTileMode(false); }}
                    className={`w-12 h-12 text-sm font-black flex items-center justify-center border-4 border-black transition-all duration-200 ${
                      position === pos.value && !tileMode
                        ? 'text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    style={position === pos.value && !tileMode ? { backgroundColor: ACCENT } : undefined}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 타일 모드 */}
            <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={tileMode}
                onChange={(e) => setTileMode(e.target.checked)}
                className="w-5 h-5 border-4 border-black"
                style={{ accentColor: ACCENT }}
              />
              {t('watermark.tileMode')}
            </label>
          </div>
        </SettingsPanel>
      )}

      {/* 미리보기 */}
      {firstFile && (
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}>
          <div className="p-6 bg-white border-4 border-black">
            <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4">
              {t('watermark.preview')}
            </h3>
            <div className="flex justify-center">
              <canvas ref={previewCanvasRef} className="border-4 border-black max-w-full" />
            </div>
          </div>
        </div>
      )}

      {/* 파일 목록 */}
      {files.length > 0 && (
        <FileListPanel
          title={t('watermark.fileList')}
          count={files.length}
          deleteAllLabel={t('common.deleteAll')}
          onClearAll={clearAll}
        >
          {files.map((file) => (
            <FileListItem
              key={file.id}
              id={file.id}
              preview={file.preview}
              name={file.originalName}
              sizeInfo={`${(file.originalFile.size / 1024).toFixed(1)} KB`}
              status={file.status}
              progress={file.progress}
              error={file.error}
              accentColor={ACCENT}
              onDownload={file.status === 'completed' ? () => handleDownload(file) : undefined}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </FileListPanel>
      )}

      {/* 액션 버튼 */}
      {files.length > 0 && (
        <ActionButtonGroup
          accentColor={ACCENT}
          primaryAction={
            pendingCount > 0
              ? {
                  label: t('watermark.applyCount', { count: pendingCount }),
                  loadingLabel: t('watermark.applying'),
                  isLoading: isProcessing,
                  disabled:
                    isProcessing ||
                    (watermarkType === 'text' && !text.trim()) ||
                    (watermarkType === 'image' && !wmImageElement),
                  onClick: handleApply,
                }
              : undefined
          }
          downloadAction={
            completedCount > 0
              ? {
                  label: t('watermark.downloadCount', { count: completedCount }),
                  onClick: handleDownloadAll,
                }
              : undefined
          }
        />
      )}

      {/* 사용 방법 */}
      <div className="mt-12">
        <HowToUse
          title={t('watermark.howToUse.title')}
          description={t('watermark.howToUse.description')}
          accentColor="violet"
          steps={[
            { number: 1, title: t('watermark.howToUse.step1Title'), description: t('watermark.howToUse.step1Desc') },
            { number: 2, title: t('watermark.howToUse.step2Title'), description: t('watermark.howToUse.step2Desc') },
            { number: 3, title: t('watermark.howToUse.step3Title'), description: t('watermark.howToUse.step3Desc') },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'GIF']}
          features={[
            { title: t('watermark.features.text'), description: t('watermark.features.textDesc') },
            { title: t('watermark.features.image'), description: t('watermark.features.imageDesc') },
            { title: t('watermark.features.tile'), description: t('watermark.features.tileDesc') },
            { title: t('watermark.features.batch'), description: t('watermark.features.batchDesc') },
          ]}
        />
      </div>
    </ToolPageLayout>
  );
}
