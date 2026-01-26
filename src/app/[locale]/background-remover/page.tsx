'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { BackgroundRemoverIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import { removeImageBackground, generateNewFilename } from '@/services/backgroundRemover';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

interface ProcessedFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

export default function BackgroundRemoverPage() {
  const t = useTranslations();

  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: ProcessedFile[] = selectedFiles
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        originalFile: file,
        originalName: file.name,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
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

  const handleProcess = async () => {
    setIsProcessing(true);
    const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f))
      );

      try {
        const result = await removeImageBackground(
          file.originalFile,
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
            );
          }
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'completed', progress: 100, result }
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

    setIsProcessing(false);
  };

  const handleDownload = (file: ProcessedFile) => {
    if (file.result) {
      const newFilename = generateNewFilename(file.originalName);
      saveAs(file.result, newFilename);
    }
  };

  const handleDownloadAll = () => {
    const completedFiles = files.filter((f) => f.status === 'completed' && f.result);
    completedFiles.forEach((file) => {
      if (file.result) {
        const newFilename = generateNewFilename(file.originalName);
        saveAs(file.result, newFilename);
      }
    });
  };

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.70_0.20_290)] flex items-center justify-center shadow-[0_0_30px_oklch(0.70_0.20_290/0.3)]">
              <BackgroundRemoverIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">{t('backgroundRemover.title')}</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">
                {t('backgroundRemover.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
            <FileUploader
              accept="image/*"
              multiple={true}
              maxFiles={5}
              maxSize={10}
              onFilesSelected={handleFilesSelected}
            />
          </div>
        </div>

        {/* Info Notice */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <div className="p-4 rounded-xl bg-[oklch(0.70_0.20_290/0.1)] border border-[oklch(0.70_0.20_290/0.2)]">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[oklch(0.75_0.25_290)] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[oklch(0.75_0.02_240)]">
                  <p className="font-medium text-[oklch(0.85_0.02_240)] mb-1">
                    {t('backgroundRemover.aiNotice')}
                  </p>
                  <p className="text-[oklch(0.65_0.02_240)]">
                    {t('backgroundRemover.aiNoticeDesc')}
                  </p>
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
                  {t('backgroundRemover.fileList')} <span className="text-[oklch(0.55_0.02_240)] font-normal">({files.length})</span>
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
                      {file.status === 'completed' && file.result ? (
                        <div className="w-full h-full relative" style={{
                          backgroundImage: 'repeating-conic-gradient(oklch(0.20_0.02_245) 0% 25%, oklch(0.16_0.02_245) 0% 50%)',
                          backgroundPosition: '0 0, 8px 8px',
                          backgroundSize: '16px 16px'
                        }}>
                          <img
                            src={URL.createObjectURL(file.result)}
                            alt={file.originalName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <img
                          src={file.preview}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[oklch(0.95_0.01_80)] truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-[oklch(0.50_0.02_240)]">
                        {(file.originalFile.size / 1024).toFixed(1)} KB
                        {file.status === 'completed' && file.result && (
                          <span className="text-[oklch(0.72_0.17_160)] ml-2">
                            → {(file.result.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </p>
                      {(file.status === 'processing' || file.status === 'completed') && (
                        <div className="mt-2 h-1 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              file.status === 'completed'
                                ? 'bg-[oklch(0.72_0.17_160)]'
                                : 'bg-[oklch(0.70_0.20_290)]'
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
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[oklch(0.70_0.20_290)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.70_0.20_290/0.4)] transition-all"
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
                onClick={handleProcess}
                disabled={isProcessing}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.70_0.20_290)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.70_0.20_290/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {t('backgroundRemover.processCount', { count: pendingCount })}
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
                {t('backgroundRemover.downloadCount', { count: completedCount })}
              </button>
            )}
          </div>
        )}

        {/* How To Use */}
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
      </div>
    </div>
  );
}
