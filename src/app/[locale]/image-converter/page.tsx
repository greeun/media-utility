'use client';

// 이미지 변환기 페이지 - UI 렌더링만 담당

import { useTranslations } from 'next-intl';
import { ImageConverterIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { isHeicFile } from '@/services/heicConverter';
import { PageHeader, SettingsPanel, FileListPanel, FileListItem, ActionButtonGroup, FormatButton, RangeSlider } from '@/design-system/v2';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import { useImageConverter } from './_hooks/useImageConverter';
import { OUTPUT_FORMATS } from './_constants';

export default function ImageConverterPage() {
  const t = useTranslations();
  const accentColor = ACCENT_COLORS.pink;

  const {
    files,
    targetFormat,
    quality,
    isConverting,
    pendingCount,
    completedCount,
    setTargetFormat,
    setQuality,
    handleFilesSelected,
    removeFile,
    clearAll,
    handleConvert,
    handleDownload,
    handleDownloadAll,
  } = useImageConverter();

  return (
    <ToolPageLayout>
      {/* 헤더 */}
      <PageHeader
        icon={<ImageConverterIcon size={32} className="text-white" />}
        iconBgColor={accentColor}
        title={t('imageConverter.title')}
        description={t('imageConverter.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('imageConverter.constraints.0'), t('imageConverter.constraints.1'), t('imageConverter.constraints.2')]}
        accentColor="pink"
      />

      {/* 파일 업로드 영역 */}
      <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <FileUploader
          accept="image/*,.heic,.heif,.svg,.psd,.cr2,.cr3,.nef,.arw,.dng,.orf,.rw2,.raf,.raw"
          multiple={true}
          maxFiles={20}
          maxSize={50}
          onFilesSelected={handleFilesSelected}
        />
      </div>

      {/* 설정 패널 */}
      {files.length > 0 && (
        <SettingsPanel title={t('common.settings')} accentColor={accentColor}>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* 출력 포맷 선택 */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">
                {t('imageConverter.outputFormat')}
              </label>
              <div className="flex gap-2">
                {OUTPUT_FORMATS.map((format) => (
                  <FormatButton
                    key={format.value}
                    label={format.label}
                    active={targetFormat === format.value}
                    accentColor={accentColor}
                    onClick={() => setTargetFormat(format.value)}
                  />
                ))}
              </div>
            </div>

            {/* 품질 슬라이더 */}
            <RangeSlider
              label={t('imageConverter.quality')}
              value={quality}
              min={10}
              max={100}
              accentColor={accentColor}
              onChange={setQuality}
            />
          </div>
        </SettingsPanel>
      )}

      {/* 파일 목록 */}
      {files.length > 0 && (
        <FileListPanel
          title={t('imageConverter.fileList')}
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
              sizeInfo={
                <>
                  {(file.originalFile.size / 1024).toFixed(1)} KB
                  {file.status === 'completed' && file.result && (
                    <span className="text-[#10B981] group-hover:text-[#34D399] ml-2">
                      → {(file.result.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </>
              }
              status={file.status}
              progress={file.progress}
              error={file.error}
              accentColor={accentColor}
              previewContent={
                isHeicFile(file.originalFile)
                  ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-900 text-xs font-mono font-bold">
                      HEIC
                    </div>
                  )
                  : undefined
              }
              onDownload={() => handleDownload(file)}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </FileListPanel>
      )}

      {/* 액션 버튼 */}
      {files.length > 0 && (
        <ActionButtonGroup
          accentColor={accentColor}
          primaryAction={
            pendingCount > 0
              ? {
                  label: t('imageConverter.convertCount', { count: pendingCount }),
                  loadingLabel: t('common.converting'),
                  isLoading: isConverting,
                  onClick: handleConvert,
                }
              : undefined
          }
          downloadAction={
            completedCount > 0
              ? {
                  label: t('imageConverter.downloadCount', { count: completedCount }),
                  onClick: handleDownloadAll,
                }
              : undefined
          }
        />
      )}

      {/* 사용 방법 */}
      <div className="mt-12">
        <HowToUse
          title={t('imageConverter.howToUse.title')}
          description={t('imageConverter.howToUse.description')}
          accentColor="pink"
          steps={[
            {
              number: 1,
              title: t('imageConverter.howToUse.step1Title'),
              description: t('imageConverter.howToUse.step1Desc'),
            },
            {
              number: 2,
              title: t('imageConverter.howToUse.step2Title'),
              description: t('imageConverter.howToUse.step2Desc'),
            },
            {
              number: 3,
              title: t('imageConverter.howToUse.step3Title'),
              description: t('imageConverter.howToUse.step3Desc'),
            },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'HEIC/HEIF', 'SVG', 'PSD', 'RAW (CR2/NEF/ARW/DNG)', 'GIF', 'BMP', 'TIFF']}
          features={[
            {
              title: t('imageConverter.features.heic'),
              description: t('imageConverter.features.heicDesc'),
            },
            {
              title: t('imageConverter.features.quality'),
              description: t('imageConverter.features.qualityDesc'),
            },
            {
              title: t('imageConverter.features.batch'),
              description: t('imageConverter.features.batchDesc'),
            },
            {
              title: t('imageConverter.features.webp'),
              description: t('imageConverter.features.webpDesc'),
            },
          ]}
          faqs={[
            {
              question: t('imageConverter.faq.q1'),
              answer: t('imageConverter.faq.a1'),
            },
            {
              question: t('imageConverter.faq.q2'),
              answer: t('imageConverter.faq.a2'),
            },
            {
              question: t('imageConverter.faq.q3'),
              answer: t('imageConverter.faq.a3'),
            },
          ]}
        />
      </div>
    </ToolPageLayout>
  );
}
