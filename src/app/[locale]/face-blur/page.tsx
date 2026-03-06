'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, RefreshCw, CheckCircle, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { FaceBlurIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import ToolConstraints from '@/components/common/ToolConstraints';
import { detectFaces, applyFaceBlur } from '@/services/faceBlur';
import type { DetectedFace } from '@/services/faceBlur';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

interface BlurFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  status: 'pending' | 'detecting' | 'detected' | 'processing' | 'completed' | 'error';
  progress: number;
  faces: DetectedFace[];
  result?: Blob;
  error?: string;
}

export default function FaceBlurPage() {
  const t = useTranslations();

  const [files, setFiles] = useState<BlurFile[]>([]);
  const [blurType, setBlurType] = useState<'gaussian' | 'mosaic'>('gaussian');
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const firstFile = files[0];

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: BlurFile[] = selectedFiles
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        id: crypto.randomUUID(),
        originalFile: f,
        originalName: f.name,
        preview: URL.createObjectURL(f),
        status: 'pending' as const,
        progress: 0,
        faces: [],
      }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setFiles([]);
  }, [files]);

  // 얼굴 감지
  const handleDetect = async () => {
    setIsProcessing(true);
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pending) {
      setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'detecting', progress: 10 } : f));
      try {
        const faces = await detectFaces(file.originalFile);
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'detected', progress: 50, faces } : f));
      } catch (error) {
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'error', error: (error as Error).message } : f));
      }
    }
    setIsProcessing(false);
  };

  // 블러 적용
  const handleApplyBlur = async () => {
    setIsProcessing(true);
    const detected = files.filter((f) => f.status === 'detected');

    for (const file of detected) {
      setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'processing', progress: 50 } : f));
      try {
        const result = await applyFaceBlur(
          file.originalFile,
          file.faces,
          { blurType, blurIntensity, autoDetect: true },
          (p) => setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, progress: 50 + p * 0.5 } : f))
        );
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'completed', progress: 100, result } : f));
      } catch (error) {
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'error', error: (error as Error).message } : f));
      }
    }
    setIsProcessing(false);
  };

  const handleDownload = (file: BlurFile) => {
    if (file.result) {
      const baseName = file.originalName.substring(0, file.originalName.lastIndexOf('.')) || file.originalName;
      const ext = file.originalName.split('.').pop() || 'png';
      saveAs(file.result, `${baseName}_blurred.${ext}`);
    }
  };

  const handleDownloadAll = () => {
    files.filter((f) => f.status === 'completed' && f.result).forEach(handleDownload);
  };

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const detectedCount = files.filter((f) => f.status === 'detected').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  // 미리보기 캔버스 - 감지된 얼굴 표시
  useEffect(() => {
    if (!previewCanvasRef.current || !firstFile || firstFile.faces.length === 0) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(500 / img.naturalWidth, 400 / img.naturalHeight, 1);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 얼굴 영역 박스 표시
      ctx.strokeStyle = 'oklch(0.70 0.22 25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);

      for (const face of firstFile.faces) {
        const x = face.x * scale;
        const y = face.y * scale;
        const w = face.width * scale;
        const h = face.height * scale;
        ctx.strokeRect(x, y, w, h);

        // 신뢰도 표시
        ctx.setLineDash([]);
        ctx.fillStyle = 'oklch(0.70 0.22 25)';
        ctx.font = `bold ${12 * scale}px sans-serif`;
        ctx.fillText(`${Math.round(face.confidence * 100)}%`, x, y - 4 * scale);
        ctx.setLineDash([6, 4]);
      }
    };
    img.src = firstFile.preview;
  }, [firstFile]);

  return (
    <div className="min-h-full bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 border-4 border-black bg-[#EC4899] flex items-center justify-center">
              <FaceBlurIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">{t('faceBlur.title')}</h1>
              <p className="mt-1 text-lg font-bold text-gray-900">{t('faceBlur.description')}</p>
            </div>
          </div>
        </div>

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
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <div className="p-6 bg-white border-4 border-black">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[oklch(0.70_0.22_25)]" />
                {t('faceBlur.settings')}
              </h3>
              <div className="space-y-4">
                {/* 블러 타입 */}
                <div className="flex gap-2">
                  <button onClick={() => setBlurType('gaussian')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${blurType === 'gaussian' ? 'bg-[oklch(0.70_0.22_25)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}>
                    {t('faceBlur.gaussian')}
                  </button>
                  <button onClick={() => setBlurType('mosaic')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${blurType === 'mosaic' ? 'bg-[oklch(0.70_0.22_25)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}>
                    {t('faceBlur.mosaic')}
                  </button>
                </div>
                {/* 강도 */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">
                    {t('faceBlur.intensity')}: <span className="text-[oklch(0.70_0.22_25)] font-semibold">{blurIntensity}</span>
                  </label>
                  <input type="range" min={5} max={50} value={blurIntensity} onChange={(e) => setBlurIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[oklch(0.70_0.22_25)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                  <div className="flex justify-between text-xs text-[oklch(0.50_0.02_240)] mt-1">
                    <span>{t('faceBlur.light')}</span>
                    <span>{t('faceBlur.strong')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 미리보기 - 감지된 얼굴 표시 */}
        {firstFile && firstFile.faces.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}>
            <div className="p-6 bg-white border-4 border-black">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[oklch(0.70_0.22_25)]" />
                {t('faceBlur.detectedFaces', { count: firstFile.faces.length })}
              </h3>
              <div className="flex justify-center">
                <canvas ref={previewCanvasRef} className="rounded-lg border border-[oklch(1_0_0/0.1)] max-w-full" />
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="p-6 bg-white border-4 border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)]">
                  {t('faceBlur.fileList')} <span className="text-[oklch(0.55_0.02_240)] font-normal">({files.length})</span>
                </h3>
                <button onClick={clearAll} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.22_25)] hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] rounded-lg transition-colors">
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
                        {file.status === 'detected' && `${file.faces.length} ${t('faceBlur.facesFound')}`}
                        {file.status === 'detecting' && t('faceBlur.detecting')}
                        {file.status === 'processing' && t('common.processing')}
                        {file.status === 'pending' && t('common.pending')}
                        {file.status === 'error' && file.error}
                      </p>
                      {(file.status === 'processing' || file.status === 'detecting' || file.status === 'completed') && (
                        <div className="mt-2 h-1 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${file.status === 'completed' ? 'bg-[oklch(0.72_0.17_160)]' : 'bg-[oklch(0.70_0.22_25)]'}`} style={{ width: `${file.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <>
                          <CheckCircle className="w-5 h-5 text-[oklch(0.72_0.17_160)]" />
                          <button onClick={() => handleDownload(file)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[oklch(0.70_0.22_25)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.70_0.22_25/0.4)] transition-all">
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
              <button onClick={handleDetect} disabled={isProcessing}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.70_0.22_25)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover: disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? (<><RefreshCw className="w-4 h-4 animate-spin" />{t('faceBlur.detecting')}</>) : (<><Eye className="w-4 h-4" />{t('faceBlur.detectCount', { count: pendingCount })}</>)}
              </button>
            )}
            {detectedCount > 0 && (
              <button onClick={handleApplyBlur} disabled={isProcessing}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.70_0.22_25)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover: disabled:opacity-50 disabled:cursor-not-allowed">
                <RefreshCw className="w-4 h-4" />{t('faceBlur.applyCount', { count: detectedCount })}
              </button>
            )}
            {completedCount > 0 && (
              <button onClick={handleDownloadAll} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:">
                <Download className="w-4 h-4" />{t('faceBlur.downloadCount', { count: completedCount })}
              </button>
            )}
          </div>
        )}

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse title={t('faceBlur.howToUse.title')} description={t('faceBlur.howToUse.description')} accentColor="rose"
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
      </div>
    </div>
  );
}
