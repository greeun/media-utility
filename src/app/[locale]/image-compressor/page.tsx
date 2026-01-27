'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, RefreshCw, CheckCircle, AlertCircle, Sparkles, ArrowDown } from 'lucide-react';
import { ImageCompressorIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import { compressImage, formatFileSize } from '@/services/imageCompressor';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

interface CompressedFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  originalSize: number;
  compressedSize?: number;
  ratio?: number;
  error?: string;
}

export default function ImageCompressorPage() {
  const t = useTranslations();

  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxSizeMB, setMaxSizeMB] = useState<number | undefined>(undefined);
  const [useMaxSize, setUseMaxSize] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: CompressedFile[] = selectedFiles
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        originalFile: file,
        originalName: file.name,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
        originalSize: file.size,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  }, [files]);

  const handleCompress = async () => {
    setIsCompressing(true);
    const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f))
      );

      try {
        const result = await compressImage(
          file.originalFile,
          {
            quality: quality / 100,
            maxSizeMB: useMaxSize ? maxSizeMB : undefined,
          },
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
            );
          }
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'completed',
                  progress: 100,
                  result: result.blob,
                  compressedSize: result.compressedSize,
                  ratio: result.ratio,
                }
              : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error', error: (error as Error).message }
              : f
          )
        );
      }
    }

    setIsCompressing(false);
  };

  const handleDownload = (file: CompressedFile) => {
    if (file.result) {
      const ext = file.originalName.split('.').pop() || 'jpg';
      const baseName = file.originalName.substring(0, file.originalName.lastIndexOf('.')) || file.originalName;
      saveAs(file.result, `${baseName}_compressed.${ext}`);
    }
  };

  const handleDownloadAll = () => {
    const completedFiles = files.filter((f) => f.status === 'completed' && f.result);
    completedFiles.forEach((file) => {
      handleDownload(file);
    });
  };

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  // 전체 통계
  const totalOriginalSize = files.filter((f) => f.status === 'completed').reduce((sum, f) => sum + f.originalSize, 0);
  const totalCompressedSize = files.filter((f) => f.status === 'completed').reduce((sum, f) => sum + (f.compressedSize || 0), 0);
  const totalRatio = totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0;

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.75_0.17_175)] flex items-center justify-center shadow-[0_0_30px_oklch(0.75_0.17_175/0.3)]">
              <ImageCompressorIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">{t('imageCompressor.title')}</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">
                {t('imageCompressor.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
            <FileUploader
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              multiple={true}
              maxFiles={20}
              maxSize={50}
              onFilesSelected={handleFilesSelected}
            />
          </div>
        </div>

        {/* Options */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[oklch(0.75_0.17_175)]" />
                {t('common.settings')}
              </h3>
              <div className="space-y-6">
                {/* Quality Slider */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-3">
                    {t('imageCompressor.quality')}: <span className="text-[oklch(0.75_0.17_175)] font-semibold">{quality}%</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-[oklch(0.75_0.17_175)] [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_oklch(0.75_0.17_175/0.5)]"
                  />
                  <div className="flex justify-between text-xs text-[oklch(0.50_0.02_240)] mt-1">
                    <span>{t('imageCompressor.smallFile')}</span>
                    <span>{t('imageCompressor.highQuality')}</span>
                  </div>
                </div>

                {/* Max Size Option */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-[oklch(0.70_0.02_240)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useMaxSize}
                      onChange={(e) => setUseMaxSize(e.target.checked)}
                      className="w-4 h-4 rounded accent-[oklch(0.75_0.17_175)]"
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
                        className="w-24 px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm focus:outline-none focus:border-[oklch(0.75_0.17_175/0.5)]"
                      />
                      <span className="text-sm text-[oklch(0.55_0.02_240)]">MB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {completedCount > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}>
            <div className="p-4 rounded-2xl border border-[oklch(0.72_0.17_160/0.2)] bg-[oklch(0.72_0.17_160/0.05)]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-[oklch(0.55_0.02_240)]">{t('imageCompressor.originalSize')}</p>
                    <p className="text-sm font-semibold text-[oklch(0.85_0.02_240)]">{formatFileSize(totalOriginalSize)}</p>
                  </div>
                  <ArrowDown className="w-4 h-4 text-[oklch(0.72_0.17_160)] rotate-[-90deg]" />
                  <div className="text-center">
                    <p className="text-xs text-[oklch(0.55_0.02_240)]">{t('imageCompressor.compressedSize')}</p>
                    <p className="text-sm font-semibold text-[oklch(0.78_0.20_160)]">{formatFileSize(totalCompressedSize)}</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[oklch(0.72_0.17_160/0.15)]">
                  <span className="text-sm font-bold text-[oklch(0.78_0.20_160)]">-{totalRatio}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)]">
                  {t('imageCompressor.fileList')} <span className="text-[oklch(0.55_0.02_240)] font-normal">({files.length})</span>
                </h3>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.22_25)] hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('common.deleteAll')}
                </button>
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[oklch(0.12_0.015_250)] border border-[oklch(1_0_0/0.04)] hover:border-[oklch(1_0_0/0.08)] transition-colors"
                  >
                    {/* Preview */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[oklch(0.16_0.02_245)] flex-shrink-0">
                      <img
                        src={file.preview}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[oklch(0.95_0.01_80)] truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-[oklch(0.50_0.02_240)]">
                        {formatFileSize(file.originalSize)}
                        {file.status === 'completed' && file.compressedSize !== undefined && (
                          <>
                            <span className="text-[oklch(0.78_0.20_160)] ml-2">
                              → {formatFileSize(file.compressedSize)}
                            </span>
                            <span className="text-[oklch(0.72_0.17_160)] ml-1.5 font-medium">
                              (-{file.ratio}%)
                            </span>
                          </>
                        )}
                      </p>
                      {(file.status === 'processing' || file.status === 'completed') && (
                        <div className="mt-2 h-1 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              file.status === 'completed'
                                ? 'bg-[oklch(0.72_0.17_160)]'
                                : 'bg-[oklch(0.75_0.17_175)]'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                      {file.status === 'error' && (
                        <p className="text-xs text-[oklch(0.65_0.22_25)] mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {file.error}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <>
                          <CheckCircle className="w-5 h-5 text-[oklch(0.72_0.17_160)]" />
                          <button
                            onClick={() => handleDownload(file)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[oklch(0.75_0.17_175)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.75_0.17_175/0.4)] transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-[oklch(0.50_0.02_240)] hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
            {pendingCount > 0 && (
              <button
                onClick={handleCompress}
                disabled={isCompressing}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.75_0.17_175)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.75_0.17_175/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompressing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('imageCompressor.compressing')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {t('imageCompressor.compressCount', { count: pendingCount })}
                  </>
                )}
              </button>
            )}
            {completedCount > 0 && (
              <button
                onClick={handleDownloadAll}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.72_0.17_160/0.4)]"
              >
                <Download className="w-4 h-4" />
                {t('imageCompressor.downloadCount', { count: completedCount })}
              </button>
            )}
          </div>
        )}

        {/* How To Use */}
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
      </div>
    </div>
  );
}
