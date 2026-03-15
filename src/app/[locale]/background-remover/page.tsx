'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { BackgroundRemoverIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import {
  PageHeader,
  FileListPanel,
  FileListItem,
  ActionButtonGroup,
} from '@/design-system/v2/components';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import { useBackgroundRemover } from './_hooks/useBackgroundRemover';

// 악센트 컬러
const ACCENT = ACCENT_COLORS.purple; // #A855F7

// 투명 배경 체커보드 프리뷰 컴포넌트
function CheckerboardPreview({ result, name }: { result: Blob; name: string }) {
  const objectUrl = useMemo(() => URL.createObjectURL(result), [result]);

  return (
    <div
      className="w-full h-full relative"
      style={{
        backgroundImage:
          'repeating-conic-gradient(#D1D5DB 0% 25%, #FFFFFF 0% 50%)',
        backgroundSize: '12px 12px',
      }}
    >
      <img
        src={objectUrl}
        alt={name}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export default function BackgroundRemoverPage() {
  const t = useTranslations();

  const {
    files,
    pendingCount,
    completedCount,
    isProcessing,
    handleFilesSelected,
    handleProcess,
    handleDownload,
    handleDownloadAll,
    removeFile,
    clearAll,
  } = useBackgroundRemover();

  return (
    <ToolPageLayout>
      {/* 헤더 */}
      <PageHeader
        icon={<BackgroundRemoverIcon size={32} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('backgroundRemover.title')}
        description={t('backgroundRemover.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[
          t('backgroundRemover.constraints.0'),
          t('backgroundRemover.constraints.1'),
          t('backgroundRemover.constraints.2'),
        ]}
        accentColor="violet"
      />

      {/* 업로드 영역 */}
      <div
        className="mb-6 opacity-0 animate-fade-up"
        style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
      >
        <FileUploader
          accept="image/*"
          multiple={true}
          maxFiles={5}
          maxSize={10}
          onFilesSelected={handleFilesSelected}
        />
      </div>

      {/* 파일 목록 */}
      {files.length > 0 && (
        <FileListPanel
          title={t('backgroundRemover.fileList')}
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
                    <span className="ml-2" style={{ color: '#10B981' }}>
                      → {(file.result.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </>
              }
              status={file.status}
              progress={file.progress}
              error={file.error}
              accentColor={ACCENT}
              previewContent={
                file.status === 'completed' && file.result ? (
                  <CheckerboardPreview
                    result={file.result}
                    name={file.originalName}
                  />
                ) : undefined
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
          accentColor={ACCENT}
          primaryAction={
            pendingCount > 0
              ? {
                  label: t('backgroundRemover.processCount', {
                    count: pendingCount,
                  }),
                  loadingLabel: t('common.processing'),
                  isLoading: isProcessing,
                  onClick: handleProcess,
                }
              : undefined
          }
          downloadAction={
            completedCount > 0
              ? {
                  label: t('backgroundRemover.downloadCount', {
                    count: completedCount,
                  }),
                  onClick: handleDownloadAll,
                }
              : undefined
          }
        />
      )}

      {/* 사용 방법 */}
      <div className="mt-12">
        <HowToUse
          title={t('backgroundRemover.howToUse.title')}
          description={t('backgroundRemover.howToUse.description')}
          accentColor="violet"
          steps={[
            {
              number: 1,
              title: t('backgroundRemover.howToUse.step1Title'),
              description: t('backgroundRemover.howToUse.step1Desc'),
            },
            {
              number: 2,
              title: t('backgroundRemover.howToUse.step2Title'),
              description: t('backgroundRemover.howToUse.step2Desc'),
            },
            {
              number: 3,
              title: t('backgroundRemover.howToUse.step3Title'),
              description: t('backgroundRemover.howToUse.step3Desc'),
            },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'BMP', 'TIFF']}
          features={[
            {
              title: t('backgroundRemover.features.ai'),
              description: t('backgroundRemover.features.aiDesc'),
            },
            {
              title: t('backgroundRemover.features.privacy'),
              description: t('backgroundRemover.features.privacyDesc'),
            },
            {
              title: t('backgroundRemover.features.transparent'),
              description: t('backgroundRemover.features.transparentDesc'),
            },
            {
              title: t('backgroundRemover.features.batch'),
              description: t('backgroundRemover.features.batchDesc'),
            },
          ]}
          faqs={[
            {
              question: t('backgroundRemover.faq.q1'),
              answer: t('backgroundRemover.faq.a1'),
            },
            {
              question: t('backgroundRemover.faq.q2'),
              answer: t('backgroundRemover.faq.a2'),
            },
            {
              question: t('backgroundRemover.faq.q3'),
              answer: t('backgroundRemover.faq.a3'),
            },
          ]}
        />
      </div>
    </ToolPageLayout>
  );
}
