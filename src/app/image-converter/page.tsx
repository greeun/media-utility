'use client';

import { useState, useCallback } from 'react';
import { Download, Trash2, RefreshCw, CheckCircle, AlertCircle, Upload, Sparkles } from 'lucide-react';
import { ImageConverterIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import { convertImage, generateNewFilename } from '@/services/imageConverter';
import { convertHeicToJpg, isHeicFile } from '@/services/heicConverter';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

interface ConvertedFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

const OUTPUT_FORMATS = [
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

export default function ImageConverterPage() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: ConvertedFile[] = selectedFiles
      .filter((file) => file.type.startsWith('image/') || isHeicFile(file))
      .map((file) => ({
        id: crypto.randomUUID(),
        originalFile: file,
        originalName: file.name,
        preview: URL.createObjectURL(file),
        targetFormat,
        status: 'pending' as const,
        progress: 0,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, [targetFormat]);

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

  const convertFile = async (file: ConvertedFile): Promise<Blob> => {
    if (isHeicFile(file.originalFile)) {
      return convertHeicToJpg(
        file.originalFile,
        { quality: quality / 100, toType: targetFormat === 'png' ? 'image/png' : 'image/jpeg' },
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }
      );
    }

    return convertImage(
      file.originalFile,
      { format: targetFormat, quality: quality / 100 },
      (progress) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
        );
      }
    );
  };

  const handleConvert = async () => {
    setIsConverting(true);
    const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f))
      );

      try {
        const result = await convertFile(file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'completed', progress: 100, result, targetFormat }
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

    setIsConverting(false);
  };

  const handleDownload = (file: ConvertedFile) => {
    if (file.result) {
      const newFilename = generateNewFilename(file.originalName, file.targetFormat);
      saveAs(file.result, newFilename);
    }
  };

  const handleDownloadAll = () => {
    const completedFiles = files.filter((f) => f.status === 'completed' && f.result);
    completedFiles.forEach((file) => {
      if (file.result) {
        const newFilename = generateNewFilename(file.originalName, file.targetFormat);
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
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.75_0.18_195)] flex items-center justify-center shadow-[0_0_30px_oklch(0.75_0.18_195/0.3)]">
              <ImageConverterIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">이미지 변환</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">
                PNG, JPG, WebP, HEIC 등 다양한 이미지 포맷을 변환하세요
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
            <FileUploader
              accept="image/*,.heic,.heif"
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
                <Sparkles className="w-4 h-4 text-[oklch(0.75_0.18_195)]" />
                변환 옵션
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-3">출력 포맷</label>
                  <div className="flex gap-2">
                    {OUTPUT_FORMATS.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setTargetFormat(format.value)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${targetFormat === format.value
                            ? 'bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] shadow-[0_0_20px_oklch(0.75_0.18_195/0.3)]'
                            : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)] hover:text-[oklch(0.85_0.02_240)]'
                          }
                        `}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-3">
                    품질: <span className="text-[oklch(0.75_0.18_195)] font-semibold">{quality}%</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-[oklch(0.75_0.18_195)] [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_oklch(0.75_0.18_195/0.5)]"
                  />
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
                  파일 목록 <span className="text-[oklch(0.55_0.02_240)] font-normal">({files.length}개)</span>
                </h3>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.22_25)] hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  전체 삭제
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
                      {!isHeicFile(file.originalFile) ? (
                        <img
                          src={file.preview}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[oklch(0.50_0.02_240)] text-xs font-mono">
                          HEIC
                        </div>
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
                                : 'bg-[oklch(0.75_0.18_195)]'
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
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.75_0.18_195/0.4)] transition-all"
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
                onClick={handleConvert}
                disabled={isConverting}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.75_0.18_195/0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    변환 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {pendingCount}개 변환하기
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
                {completedCount}개 모두 다운로드
              </button>
            )}
          </div>
        )}

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse
            title="이미지 포맷 변환기"
            description="PNG, JPG, WebP, HEIC 등 다양한 이미지 포맷을 손쉽게 변환하세요. 모든 처리는 브라우저에서 이루어져 개인정보가 보호됩니다."
            accentColor="sky"
            steps={[
              {
                number: 1,
                title: '이미지 업로드',
                description: '변환할 이미지 파일을 드래그하거나 클릭하여 선택하세요. 여러 파일을 한 번에 업로드할 수 있습니다.',
              },
              {
                number: 2,
                title: '포맷 및 품질 설정',
                description: '원하는 출력 포맷(JPG, PNG, WebP)과 이미지 품질을 선택하세요.',
              },
              {
                number: 3,
                title: '변환 및 다운로드',
                description: '변환 버튼을 클릭하고, 완료되면 개별 또는 일괄 다운로드하세요.',
              },
            ]}
            supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'HEIC/HEIF', 'GIF', 'BMP', 'TIFF']}
            features={[
              {
                title: 'HEIC 변환 지원',
                description: 'iPhone에서 촬영한 HEIC 파일을 JPG나 PNG로 간편하게 변환할 수 있습니다.',
              },
              {
                title: '품질 조절',
                description: '이미지 품질을 1-100% 범위에서 조절하여 파일 크기와 화질의 균형을 맞출 수 있습니다.',
              },
              {
                title: '일괄 변환',
                description: '여러 이미지를 한 번에 업로드하고 동일한 설정으로 일괄 변환할 수 있습니다.',
              },
              {
                title: 'WebP 지원',
                description: '최신 WebP 포맷으로 변환하여 웹사이트 성능을 최적화하세요.',
              },
            ]}
            faqs={[
              {
                question: 'HEIC 파일이란 무엇인가요?',
                answer: 'HEIC는 Apple이 iOS 11부터 사용하는 고효율 이미지 포맷입니다. JPG보다 파일 크기가 작으면서 화질은 동일합니다.',
              },
              {
                question: '품질 설정은 어떻게 선택하나요?',
                answer: '웹용 이미지는 70-80%, 인쇄용이나 원본 보존이 필요한 경우 90-100%를 추천합니다.',
              },
              {
                question: '파일 크기 제한이 있나요?',
                answer: '파일당 최대 100MB까지 지원하며, 한 번에 최대 10개 파일을 업로드할 수 있습니다.',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
