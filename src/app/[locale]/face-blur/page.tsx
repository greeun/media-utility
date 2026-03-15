'use client';

import { useTranslations } from 'next-intl';
import { RefreshCw, Eye, Download } from 'lucide-react';
import { FaceBlurIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { PageHeader, SettingsPanel, FileListPanel, FileListItem, FormatButton, RangeSlider } from '@/design-system/v2';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import { useFaceBlur } from './_hooks/useFaceBlur';
import type { BlurFile } from './_types';

const ACCENT = ACCENT_COLORS.pink;

/** BlurFile의 확장 status를 FileListItem이 받을 수 있는 표준 status로 매핑 */
function mapStatus(status: BlurFile['status']): 'pending' | 'processing' | 'completed' | 'error' {
  if (status === 'detecting') return 'processing';
  if (status === 'detected') return 'pending';
  return status;
}

/** 파일별 상태 텍스트 */
function getStatusText(file: BlurFile, t: ReturnType<typeof useTranslations>): string {
  switch (file.status) {
    case 'detected':
      return `${file.faces.length} ${t('faceBlur.facesFound')}`;
    case 'detecting':
      return t('faceBlur.detecting');
    case 'processing':
      return t('common.processing');
    case 'pending':
      return t('common.pending');
    case 'error':
      return file.error ?? '';
    default:
      return '';
  }
}

export default function FaceBlurPage() {
  const t = useTranslations();
  const {
    files,
    blurType,
    setBlurType,
    blurIntensity,
    setBlurIntensity,
    isProcessing,
    previewCanvasRef,
    firstFile,
    pendingCount,
    detectedCount,
    completedCount,
    handleFilesSelected,
    handleDetect,
    handleApplyBlur,
    handleDownload,
    handleDownloadAll,
    removeFile,
    clearAll,
  } = useFaceBlur();

  return (
    <ToolPageLayout>
      {/* Header */}
      <PageHeader
        icon={<FaceBlurIcon size={28} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('faceBlur.title')}
        description={t('faceBlur.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('faceBlur.constraints.0'), t('faceBlur.constraints.1'), t('faceBlur.constraints.2')]}
        accentColor="rose"
      />

      {/* Upload Area */}
      <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <div className="p-6 bg-white border-4 border-black">
          <FileUploader accept="image/*" multiple maxFiles={10} maxSize={50} onFilesSelected={handleFilesSelected} />
        </div>
      </div>

      {/* 블러 설정 */}
      {files.length > 0 && (
        <SettingsPanel title={t('faceBlur.settings')} accentColor={ACCENT}>
          <div className="space-y-6">
            {/* 블러 타입 */}
            <div className="flex gap-2">
              <FormatButton
                label={t('faceBlur.gaussian')}
                active={blurType === 'gaussian'}
                accentColor={ACCENT}
                onClick={() => setBlurType('gaussian')}
              />
              <FormatButton
                label={t('faceBlur.mosaic')}
                active={blurType === 'mosaic'}
                accentColor={ACCENT}
                onClick={() => setBlurType('mosaic')}
              />
            </div>
            {/* 강도 슬라이더 */}
            <div>
              <RangeSlider
                label={t('faceBlur.intensity')}
                value={blurIntensity}
                min={5}
                max={50}
                accentColor={ACCENT}
                unit=""
                onChange={setBlurIntensity}
              />
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-gray-500 mt-2">
                <span>{t('faceBlur.light')}</span>
                <span>{t('faceBlur.strong')}</span>
              </div>
            </div>
          </div>
        </SettingsPanel>
      )}

      {/* 미리보기 - 감지된 얼굴 표시 */}
      {firstFile && firstFile.faces.length > 0 && (
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}>
          <div className="p-6 bg-white border-4 border-black">
            <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4 flex items-center gap-3">
              <Eye className="w-5 h-5" style={{ color: ACCENT }} strokeWidth={2.5} />
              {t('faceBlur.detectedFaces', { count: firstFile.faces.length })}
            </h3>
            <div className="flex justify-center">
              <canvas ref={previewCanvasRef} className="border-4 border-black max-w-full" />
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <FileListPanel
          title={t('faceBlur.fileList')}
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
              sizeInfo={getStatusText(file, t)}
              status={mapStatus(file.status)}
              progress={file.progress}
              error={file.error}
              accentColor={ACCENT}
              onDownload={file.status === 'completed' ? () => handleDownload(file) : undefined}
              onRemove={() => removeFile(file.id)}
            />
          ))}
        </FileListPanel>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up"
          style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
        >
          {pendingCount > 0 && (
            <button
              onClick={handleDetect}
              disabled={isProcessing}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-black text-lg uppercase tracking-wide border-4 border-black hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                  {t('faceBlur.detecting')}
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" strokeWidth={2.5} />
                  {t('faceBlur.detectCount', { count: pendingCount })}
                </>
              )}
            </button>
          )}
          {detectedCount > 0 && (
            <button
              onClick={handleApplyBlur}
              disabled={isProcessing}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-black text-lg uppercase tracking-wide border-4 border-black hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={2.5} />
              ) : (
                <RefreshCw className="w-5 h-5" strokeWidth={2.5} />
              )}
              {t('faceBlur.applyCount', { count: detectedCount })}
            </button>
          )}
          {completedCount > 0 && (
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-black text-lg uppercase tracking-wide border-4 border-black hover:bg-black hover:text-white transition-all duration-200"
              style={{ backgroundColor: ACCENT }}
            >
              <Download className="w-5 h-5" strokeWidth={2.5} />
              {t('faceBlur.downloadCount', { count: completedCount })}
            </button>
          )}
        </div>
      )}

      {/* How To Use */}
      <div className="mt-12">
        <HowToUse
          title={t('faceBlur.howToUse.title')}
          description={t('faceBlur.howToUse.description')}
          accentColor="rose"
          steps={[
            { number: 1, title: t('faceBlur.howToUse.step1Title'), description: t('faceBlur.howToUse.step1Desc') },
            { number: 2, title: t('faceBlur.howToUse.step2Title'), description: t('faceBlur.howToUse.step2Desc') },
            { number: 3, title: t('faceBlur.howToUse.step3Title'), description: t('faceBlur.howToUse.step3Desc') },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'GIF']}
          features={[
            { title: t('faceBlur.features.auto'), description: t('faceBlur.features.autoDesc') },
            { title: t('faceBlur.features.blur'), description: t('faceBlur.features.blurDesc') },
            { title: t('faceBlur.features.mosaic'), description: t('faceBlur.features.mosaicDesc') },
            { title: t('faceBlur.features.batch'), description: t('faceBlur.features.batchDesc') },
          ]}
        />
      </div>
    </ToolPageLayout>
  );
}
