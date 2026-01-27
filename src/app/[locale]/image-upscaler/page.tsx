'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, RefreshCw, CheckCircle, AlertCircle, ZoomIn, Monitor } from 'lucide-react';
import { UpscalerIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import { upscaleImage } from '@/services/imageUpscaler';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

interface UpscaleFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  resultUrl?: string;
  error?: string;
  originalSize: { width: number; height: number };
}

export default function ImageUpscalerPage() {
  const t = useTranslations();

  const [files, setFiles] = useState<UpscaleFile[]>([]);
  const [scale, setScale] = useState<2 | 3 | 4>(2);
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [isProcessing, setIsProcessing] = useState(false);

  const compareRef = useRef<HTMLDivElement>(null);
  const [comparePosition, setComparePosition] = useState(50);

  const firstCompleted = files.find((f) => f.status === 'completed');

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: UpscaleFile[] = selectedFiles
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        id: crypto.randomUUID(),
        originalFile: f,
        originalName: f.name,
        preview: URL.createObjectURL(f),
        status: 'pending' as const,
        progress: 0,
        originalSize: { width: 0, height: 0 },
      }));

    // 원본 크기 측정
    newFiles.forEach((nf) => {
      const img = new Image();
      img.onload = () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === nf.id ? { ...f, originalSize: { width: img.naturalWidth, height: img.naturalHeight } } : f
          )
        );
      };
      img.src = nf.preview;
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      if (file?.resultUrl) URL.revokeObjectURL(file.resultUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    setFiles([]);
  }, [files]);

  const handleUpscale = async () => {
    setIsProcessing(true);
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pending) {
      setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f));
      try {
        const result = await upscaleImage(
          file.originalFile,
          { scale, format },
          (p) => setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, progress: p } : f))
        );
        const resultUrl = URL.createObjectURL(result);
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'completed', progress: 100, result, resultUrl } : f));
      } catch (error) {
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'error', error: (error as Error).message } : f));
      }
    }
    setIsProcessing(false);
  };

  const handleDownload = (file: UpscaleFile) => {
    if (file.result) {
      const baseName = file.originalName.substring(0, file.originalName.lastIndexOf('.')) || file.originalName;
      saveAs(file.result, `${baseName}_${scale}x.${format}`);
    }
  };

  const handleDownloadAll = () => {
    files.filter((f) => f.status === 'completed' && f.result).forEach(handleDownload);
  };

  // 비교 슬라이더 핸들러
  const handleCompareMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setComparePosition(Math.max(0, Math.min(100, x)));
  }, []);

  // cleanup
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.70_0.18_280)] flex items-center justify-center shadow-[0_0_30px_oklch(0.70_0.18_280/0.3)]">
              <UpscalerIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">{t('imageUpscaler.title')}</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">{t('imageUpscaler.description')}</p>
            </div>
          </div>
        </div>

        {/* 데스크톱 권장 안내 */}
        <div className="mb-6 p-4 rounded-xl border border-[oklch(0.70_0.18_280/0.2)] bg-[oklch(0.70_0.18_280/0.05)] opacity-0 animate-fade-up" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}>
          <p className="text-sm text-[oklch(0.70_0.18_280)] flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            {t('imageUpscaler.desktopNotice')}
          </p>
          <p className="text-xs text-[oklch(0.55_0.02_240)] mt-1">{t('imageUpscaler.desktopNoticeDesc')}</p>
        </div>

        {/* Upload Area */}
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
            <FileUploader accept="image/*" multiple maxFiles={5} maxSize={20} onFilesSelected={handleFilesSelected} />
          </div>
        </div>

        {/* 업스케일 설정 */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-[oklch(0.70_0.18_280)]" />
                {t('imageUpscaler.settings')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 배율 */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('imageUpscaler.scale')}</label>
                  <div className="flex gap-2">
                    {([2, 3, 4] as const).map((s) => (
                      <button key={s} onClick={() => setScale(s)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${scale === s ? 'bg-[oklch(0.70_0.18_280)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}>
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
                {/* 출력 형식 */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('imageUpscaler.format')}</label>
                  <div className="flex gap-2">
                    {(['png', 'jpg', 'webp'] as const).map((f) => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all uppercase ${format === f ? 'bg-[oklch(0.70_0.18_280)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* 예상 출력 크기 표시 */}
              {files[0]?.originalSize.width > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-[oklch(0.12_0.015_250)]">
                  <p className="text-xs text-[oklch(0.55_0.02_240)]">
                    {t('imageUpscaler.outputSize')}: {files[0].originalSize.width}x{files[0].originalSize.height} → <span className="text-[oklch(0.70_0.18_280)] font-semibold">{files[0].originalSize.width * scale}x{files[0].originalSize.height * scale}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 비교 뷰 */}
        {firstCompleted && firstCompleted.resultUrl && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">{t('imageUpscaler.compare')}</h3>
              <div
                ref={compareRef}
                className="relative overflow-hidden rounded-xl cursor-col-resize select-none"
                style={{ aspectRatio: `${firstCompleted.originalSize.width}/${firstCompleted.originalSize.height}` }}
                onMouseMove={handleCompareMove}
              >
                {/* 확대 결과 (전체) */}
                <img src={firstCompleted.resultUrl} alt="upscaled" className="absolute inset-0 w-full h-full object-contain" />
                {/* 원본 (클리핑) */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${comparePosition}%` }}>
                  <img src={firstCompleted.preview} alt="original" className="w-full h-full object-contain" style={{ minWidth: compareRef.current?.clientWidth ?? '100%' }} />
                </div>
                {/* 슬라이더 라인 */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg" style={{ left: `${comparePosition}%` }}>
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <div className="w-4 h-0.5 bg-[oklch(0.30_0.01_240)] rounded-full" />
                  </div>
                </div>
                {/* 라벨 */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-xs text-white font-medium">{t('imageUpscaler.original')}</div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-[oklch(0.70_0.18_280/0.8)] text-xs text-white font-medium">{scale}x {t('imageUpscaler.upscaled')}</div>
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
                  {t('imageUpscaler.fileList')} <span className="text-[oklch(0.55_0.02_240)] font-normal">({files.length})</span>
                </h3>
                <button onClick={clearAll} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.18_280)] hover:text-[oklch(0.75_0.20_280)] hover:bg-[oklch(0.65_0.18_280/0.1)] rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> {t('common.deleteAll')}
                </button>
              </div>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 rounded-xl bg-[oklch(0.12_0.015_250)] border border-[oklch(1_0_0/0.04)] hover:border-[oklch(1_0_0/0.08)] transition-colors">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[oklch(0.16_0.02_245)] flex-shrink-0">
                      <img src={file.preview} alt={file.originalName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[oklch(0.95_0.01_80)] truncate">{file.originalName}</p>
                      <p className="text-xs text-[oklch(0.50_0.02_240)]">
                        {file.originalSize.width > 0 && `${file.originalSize.width}x${file.originalSize.height}`}
                        {file.status === 'completed' && ` → ${file.originalSize.width * scale}x${file.originalSize.height * scale}`}
                        {file.status === 'processing' && ` • ${t('common.processing')}`}
                        {file.status === 'error' && ` • ${file.error}`}
                      </p>
                      {(file.status === 'processing' || file.status === 'completed') && (
                        <div className="mt-2 h-1 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${file.status === 'completed' ? 'bg-[oklch(0.72_0.17_160)]' : 'bg-[oklch(0.70_0.18_280)]'}`} style={{ width: `${file.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <>
                          <CheckCircle className="w-5 h-5 text-[oklch(0.72_0.17_160)]" />
                          <button onClick={() => handleDownload(file)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[oklch(0.70_0.18_280)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.70_0.18_280/0.4)] transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {file.status === 'error' && <AlertCircle className="w-5 h-5 text-[oklch(0.65_0.22_25)]" />}
                      <button onClick={() => removeFile(file.id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[oklch(0.50_0.02_240)] hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] transition-colors">
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
              <button onClick={handleUpscale} disabled={isProcessing}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.70_0.18_280)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.70_0.18_280/0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? (<><RefreshCw className="w-4 h-4 animate-spin" />{t('common.processing')}</>) : (<><ZoomIn className="w-4 h-4" />{t('imageUpscaler.upscaleCount', { count: pendingCount })}</>)}
              </button>
            )}
            {completedCount > 0 && (
              <button onClick={handleDownloadAll} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.72_0.17_160/0.4)]">
                <Download className="w-4 h-4" />{t('imageUpscaler.downloadCount', { count: completedCount })}
              </button>
            )}
          </div>
        )}

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse title={t('imageUpscaler.howToUse.title')} description={t('imageUpscaler.howToUse.description')} accentColor="violet"
            steps={[
              { number: 1, title: t('imageUpscaler.howToUse.step1Title'), description: t('imageUpscaler.howToUse.step1Desc') },
              { number: 2, title: t('imageUpscaler.howToUse.step2Title'), description: t('imageUpscaler.howToUse.step2Desc') },
              { number: 3, title: t('imageUpscaler.howToUse.step3Title'), description: t('imageUpscaler.howToUse.step3Desc') },
            ]}
            supportedFormats={['JPG/JPEG', 'PNG', 'WebP']}
            features={[
              { title: t('imageUpscaler.features.ai'), description: t('imageUpscaler.features.aiDesc') },
              { title: t('imageUpscaler.features.compare'), description: t('imageUpscaler.features.compareDesc') },
              { title: t('imageUpscaler.features.multi'), description: t('imageUpscaler.features.multiDesc') },
              { title: t('imageUpscaler.features.format'), description: t('imageUpscaler.features.formatDesc') },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
