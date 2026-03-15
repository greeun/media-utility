'use client';

import { useTranslations } from 'next-intl';
import { ZoomIn } from 'lucide-react';
import { UpscalerIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import {
  PageHeader,
  SettingsPanel,
  FileListPanel,
  FileListItem,
  ActionButtonGroup,
  FormatButton,
} from '@/design-system/v2';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import { useImageUpscaler } from './_hooks/useImageUpscaler';

const ACCENT = ACCENT_COLORS.cyan;

export default function ImageUpscalerPage() {
  const t = useTranslations();
  const {
    files,
    scale,
    format,
    isProcessing,
    compareRef,
    comparePosition,
    firstCompleted,
    pendingCount,
    completedCount,
    setScale,
    setFormat,
    handleFilesSelected,
    removeFile,
    clearAll,
    handleUpscale,
    handleDownload,
    handleDownloadAll,
    handleCompareMove,
  } = useImageUpscaler();

  return (
    <ToolPageLayout>
      {/* Header */}
      <PageHeader
        icon={<UpscalerIcon size={28} className="text-black" />}
        iconBgColor={ACCENT}
        title={t('imageUpscaler.title')}
        description={t('imageUpscaler.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[
          t('imageUpscaler.constraints.0'),
          t('imageUpscaler.constraints.1'),
          t('imageUpscaler.constraints.2'),
          t('imageUpscaler.constraints.3'),
        ]}
        accentColor="violet"
      />

      {/* Upload Area */}
      <div
        className="mb-6 opacity-0 animate-fade-up"
        style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
      >
        <div className="p-6 bg-white border-4 border-black">
          <FileUploader
            accept="image/*"
            multiple
            maxFiles={5}
            maxSize={20}
            onFilesSelected={handleFilesSelected}
          />
        </div>
      </div>

      {/* 업스케일 설정 */}
      {files.length > 0 && (
        <SettingsPanel
          title={t('imageUpscaler.settings')}
          accentColor={ACCENT}
          delay="0.15s"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 배율 */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-black mb-3">
                {t('imageUpscaler.scale')}
              </label>
              <div className="flex gap-2">
                {([2, 3, 4] as const).map((s) => (
                  <FormatButton
                    key={s}
                    label={`${s}x`}
                    active={scale === s}
                    accentColor={ACCENT}
                    onClick={() => setScale(s)}
                  />
                ))}
              </div>
            </div>
            {/* 출력 형식 */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-black mb-3">
                {t('imageUpscaler.format')}
              </label>
              <div className="flex gap-2">
                {(['png', 'jpg', 'webp'] as const).map((f) => (
                  <FormatButton
                    key={f}
                    label={f}
                    active={format === f}
                    accentColor={ACCENT}
                    onClick={() => setFormat(f)}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* 예상 출력 크기 표시 */}
          {files[0]?.originalSize.width > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border-4 border-black">
              <p className="text-xs font-bold uppercase tracking-wide text-black">
                {t('imageUpscaler.outputSize')}:{' '}
                {files[0].originalSize.width}x{files[0].originalSize.height}{' '}
                &rarr;{' '}
                <span style={{ color: ACCENT }} className="font-black">
                  {files[0].originalSize.width * scale}x
                  {files[0].originalSize.height * scale}
                </span>
              </p>
            </div>
          )}
        </SettingsPanel>
      )}

      {/* 비교 뷰 */}
      {firstCompleted && firstCompleted.resultUrl && (
        <div
          className="mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}
        >
          <div className="p-6 bg-white border-4 border-black">
            <h3 className="text-lg font-black uppercase tracking-wide text-black mb-6">
              {t('imageUpscaler.compare')}
            </h3>
            <div
              ref={compareRef}
              className="relative overflow-hidden border-4 border-black cursor-col-resize select-none"
              style={{
                aspectRatio: `${firstCompleted.originalSize.width}/${firstCompleted.originalSize.height}`,
              }}
              onMouseMove={handleCompareMove}
            >
              {/* 확대 결과 (전체) */}
              <img
                src={firstCompleted.resultUrl}
                alt="upscaled"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {/* 원본 (클리핑) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${comparePosition}%` }}
              >
                <img
                  src={firstCompleted.preview}
                  alt="original"
                  className="w-full h-full object-contain"
                  style={{
                    minWidth: compareRef.current?.clientWidth ?? '100%',
                  }}
                />
              </div>
              {/* 슬라이더 라인 */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-black"
                style={{ left: `${comparePosition}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-4 border-black flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-black" />
                </div>
              </div>
              {/* 라벨 */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-black text-xs text-white font-black uppercase tracking-wide">
                {t('imageUpscaler.original')}
              </div>
              <div
                className="absolute top-3 right-3 px-3 py-1 text-xs text-white font-black uppercase tracking-wide"
                style={{ backgroundColor: ACCENT }}
              >
                {scale}x {t('imageUpscaler.upscaled')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <FileListPanel
          title={t('imageUpscaler.fileList')}
          count={files.length}
          deleteAllLabel={t('common.deleteAll')}
          delay="0.2s"
          onClearAll={clearAll}
        >
          {files.map((file) => (
            <FileListItem
              key={file.id}
              id={file.id}
              preview={file.preview}
              name={file.originalName}
              sizeInfo={
                <>
                  {file.originalSize.width > 0 &&
                    `${file.originalSize.width}x${file.originalSize.height}`}
                  {file.status === 'completed' &&
                    ` → ${file.originalSize.width * scale}x${file.originalSize.height * scale}`}
                  {file.status === 'processing' && ` / ${t('common.processing')}`}
                </>
              }
              status={file.status}
              progress={file.progress}
              error={file.error}
              accentColor={ACCENT}
              onDownload={
                file.status === 'completed'
                  ? () => handleDownload(file)
                  : undefined
              }
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </FileListPanel>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <ActionButtonGroup
          accentColor={ACCENT}
          delay="0.25s"
          primaryAction={
            pendingCount > 0
              ? {
                  label: t('imageUpscaler.upscaleCount', {
                    count: pendingCount,
                  }),
                  loadingLabel: t('common.processing'),
                  isLoading: isProcessing,
                  icon: <ZoomIn className="w-5 h-5" strokeWidth={2.5} />,
                  onClick: handleUpscale,
                }
              : undefined
          }
          downloadAction={
            completedCount > 0
              ? {
                  label: t('imageUpscaler.downloadCount', {
                    count: completedCount,
                  }),
                  onClick: handleDownloadAll,
                }
              : undefined
          }
        />
      )}

      {/* How To Use */}
      <div className="mt-12">
        <HowToUse
          title={t('imageUpscaler.howToUse.title')}
          description={t('imageUpscaler.howToUse.description')}
          accentColor="violet"
          steps={[
            {
              number: 1,
              title: t('imageUpscaler.howToUse.step1Title'),
              description: t('imageUpscaler.howToUse.step1Desc'),
            },
            {
              number: 2,
              title: t('imageUpscaler.howToUse.step2Title'),
              description: t('imageUpscaler.howToUse.step2Desc'),
            },
            {
              number: 3,
              title: t('imageUpscaler.howToUse.step3Title'),
              description: t('imageUpscaler.howToUse.step3Desc'),
            },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP']}
          features={[
            {
              title: t('imageUpscaler.features.ai'),
              description: t('imageUpscaler.features.aiDesc'),
            },
            {
              title: t('imageUpscaler.features.compare'),
              description: t('imageUpscaler.features.compareDesc'),
            },
            {
              title: t('imageUpscaler.features.multi'),
              description: t('imageUpscaler.features.multiDesc'),
            },
            {
              title: t('imageUpscaler.features.format'),
              description: t('imageUpscaler.features.formatDesc'),
            },
          ]}
        />
      </div>
    </ToolPageLayout>
  );
}
