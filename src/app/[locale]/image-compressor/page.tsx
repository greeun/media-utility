'use client';

import { useTranslations } from 'next-intl';
import { ArrowDown } from 'lucide-react';
import { ImageCompressorIcon } from '@/components/icons/FeatureIcons';
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
import { formatFileSize } from '@/services/imageCompressor';
import { useImageCompressor } from './_hooks/useImageCompressor';

// 악센트 컬러
const ACCENT = ACCENT_COLORS.cyan; // #06B6D4

export default function ImageCompressorPage() {
  const t = useTranslations();

  const {
    files,
    pendingCount,
    completedCount,
    quality,
    setQuality,
    maxSizeMB,
    setMaxSizeMB,
    useMaxSize,
    setUseMaxSize,
    isProcessing,
    handleFilesSelected,
    handleCompress,
    handleDownload,
    handleDownloadAll,
    removeFile,
    clearAll,
    stats,
  } = useImageCompressor();

  return (
    <ToolPageLayout>
      {/* 헤더 */}
      <PageHeader
        icon={<ImageCompressorIcon size={32} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('imageCompressor.title')}
        description={t('imageCompressor.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('imageCompressor.constraints.0'), t('imageCompressor.constraints.1')]}
        accentColor="cyan"
      />

      {/* 업로드 영역 */}
      <div
        className="mb-6 opacity-0 animate-fade-up"
        style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
      >
        <FileUploader
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          multiple={true}
          maxFiles={20}
          maxSize={50}
          onFilesSelected={handleFilesSelected}
        />
      </div>

      {/* 설정 패널 */}
      {files.length > 0 && (
        <SettingsPanel title={t('common.settings')} accentColor={ACCENT}>
          <div className="space-y-6">
            {/* 품질 슬라이더 */}
            <RangeSlider
              label={t('imageCompressor.quality')}
              value={quality}
              min={10}
              max={100}
              accentColor={ACCENT}
              unit="%"
              onChange={setQuality}
            />
            <div className="flex justify-between text-xs font-bold text-gray-900 -mt-4">
              <span>{t('imageCompressor.smallFile')}</span>
              <span>{t('imageCompressor.highQuality')}</span>
            </div>

            {/* 최대 크기 옵션 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useMaxSize}
                  onChange={(e) => setUseMaxSize(e.target.checked)}
                  className="w-4 h-4 accent-[#06B6D4]"
                />
                {t('imageCompressor.useMaxSize')}
              </label>
              {useMaxSize && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    min={0.1}
                    max={50}
                    step={0.1}
                    value={maxSizeMB || 1}
                    onChange={(e) => setMaxSizeMB(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-white text-black text-sm font-bold border-4 border-black focus:outline-none focus:border-[#06B6D4]"
                  />
                  <span className="text-sm font-bold text-black">MB</span>
                </div>
              )}
            </div>
          </div>
        </SettingsPanel>
      )}

      {/* 압축 결과 통계 */}
      {completedCount > 0 && (
        <div
          className="mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}
        >
          <div className="p-4 bg-white border-4 border-black">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-900">
                    {t('imageCompressor.originalSize')}
                  </p>
                  <p className="text-sm font-black text-black">
                    {formatFileSize(stats.totalOriginalSize)}
                  </p>
                </div>
                <ArrowDown
                  className="w-5 h-5 text-black rotate-[-90deg]"
                  strokeWidth={2.5}
                />
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-900">
                    {t('imageCompressor.compressedSize')}
                  </p>
                  <p className="text-sm font-black" style={{ color: ACCENT }}>
                    {formatFileSize(stats.totalCompressedSize)}
                  </p>
                </div>
              </div>
              <div
                className="px-4 py-2 border-4 border-black font-black text-sm"
                style={{ backgroundColor: ACCENT, color: '#FFFFFF' }}
              >
                -{stats.totalRatio}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 파일 목록 */}
      {files.length > 0 && (
        <FileListPanel
          title={t('imageCompressor.fileList')}
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
                  {formatFileSize(file.originalSize)}
                  {file.status === 'completed' && file.compressedSize !== undefined && (
                    <>
                      <span style={{ color: '#10B981' }} className="ml-2">
                        → {formatFileSize(file.compressedSize)}
                      </span>
                      <span style={{ color: ACCENT }} className="ml-1.5 font-black">
                        (-{file.ratio}%)
                      </span>
                    </>
                  )}
                </>
              }
              status={file.status}
              progress={file.progress}
              error={file.error}
              accentColor={ACCENT}
              onDownload={() => handleDownload(file)}
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
                  label: t('imageCompressor.compressCount', { count: pendingCount }),
                  loadingLabel: t('imageCompressor.compressing'),
                  isLoading: isProcessing,
                  onClick: handleCompress,
                }
              : undefined
          }
          downloadAction={
            completedCount > 0
              ? {
                  label: t('imageCompressor.downloadCount', { count: completedCount }),
                  onClick: handleDownloadAll,
                }
              : undefined
          }
        />
      )}

      {/* 사용 방법 */}
      <div className="mt-12">
        <HowToUse
          title={t('imageCompressor.howToUse.title')}
          description={t('imageCompressor.howToUse.description')}
          accentColor="cyan"
          steps={[
            {
              number: 1,
              title: t('imageCompressor.howToUse.step1Title'),
              description: t('imageCompressor.howToUse.step1Desc'),
            },
            {
              number: 2,
              title: t('imageCompressor.howToUse.step2Title'),
              description: t('imageCompressor.howToUse.step2Desc'),
            },
            {
              number: 3,
              title: t('imageCompressor.howToUse.step3Title'),
              description: t('imageCompressor.howToUse.step3Desc'),
            },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'GIF']}
          features={[
            {
              title: t('imageCompressor.features.quality'),
              description: t('imageCompressor.features.qualityDesc'),
            },
            {
              title: t('imageCompressor.features.maxSize'),
              description: t('imageCompressor.features.maxSizeDesc'),
            },
            {
              title: t('imageCompressor.features.batch'),
              description: t('imageCompressor.features.batchDesc'),
            },
            {
              title: t('imageCompressor.features.privacy'),
              description: t('imageCompressor.features.privacyDesc'),
            },
          ]}
          faqs={[
            {
              question: t('imageCompressor.faq.q1'),
              answer: t('imageCompressor.faq.a1'),
            },
            {
              question: t('imageCompressor.faq.q2'),
              answer: t('imageCompressor.faq.a2'),
            },
            {
              question: t('imageCompressor.faq.q3'),
              answer: t('imageCompressor.faq.a3'),
            },
          ]}
        />
      </div>
    </ToolPageLayout>
  );
}
