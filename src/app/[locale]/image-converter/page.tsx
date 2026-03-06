'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { ImageConverterIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import { convertImage, convertSvgToRaster, isSvgFile, generateNewFilename } from '@/services/imageConverter';
import { convertHeicToJpg, isHeicFile } from '@/services/heicConverter';
import { convertPsdToImage, isPsdFile } from '@/services/psdConverter';
import { convertRawToImage, isRawFile } from '@/services/rawConverter';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
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
  const t = useTranslations();

  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: ConvertedFile[] = selectedFiles
      .filter((file) => file.type.startsWith('image/') || isHeicFile(file) || isSvgFile(file) || isPsdFile(file) || isRawFile(file))
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

    if (isSvgFile(file.originalFile)) {
      return convertSvgToRaster(
        file.originalFile,
        { format: targetFormat, quality: quality / 100 },
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }
      );
    }

    if (isPsdFile(file.originalFile)) {
      return convertPsdToImage(
        file.originalFile,
        targetFormat as 'png' | 'jpg' | 'webp',
        { quality: quality / 100 },
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }
      );
    }

    if (isRawFile(file.originalFile)) {
      const result = await convertRawToImage(
        file.originalFile,
        { format: targetFormat as 'png' | 'jpg' | 'webp', quality: quality / 100 },
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }
      );
      return result.blob;
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
    <div className="min-h-full bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 border-4 border-black bg-[#EC4899] flex items-center justify-center">
              <ImageConverterIcon size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">{t('imageConverter.title')}</h1>
              <p className="text-lg font-bold text-gray-900">
                {t('imageConverter.description')}
              </p>
            </div>
          </div>
        </div>

        {/* 제약사항 */}
        <ToolConstraints
          constraints={[t('imageConverter.constraints.0'), t('imageConverter.constraints.1'), t('imageConverter.constraints.2')]}
          accentColor="pink"
        />

        {/* Upload Area */}
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <FileUploader
            accept="image/*,.heic,.heif,.svg,.psd,.cr2,.cr3,.nef,.arw,.dng,.orf,.rw2,.raf,.raw"
            multiple={true}
            maxFiles={20}
            maxSize={50}
            onFilesSelected={handleFilesSelected}
          />
        </div>

        {/* Options */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <div className="p-6 bg-white border-4 border-black">
              <h3 className="text-lg font-black uppercase tracking-wide text-black mb-6 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#EC4899]" strokeWidth={2.5} />
                {t('common.settings')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">{t('imageConverter.outputFormat')}</label>
                  <div className="flex gap-2">
                    {OUTPUT_FORMATS.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setTargetFormat(format.value)}
                        className={`
                          px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 border-4
                          ${targetFormat === format.value
                            ? 'bg-[#EC4899] text-white border-[#EC4899]'
                            : 'bg-white text-black border-black hover:bg-black hover:text-white'
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
                  <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">
                    {t('imageConverter.quality')}: <span className="text-[#EC4899]">{quality}%</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                      [&::-webkit-slider-thumb]:bg-[#EC4899] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="p-6 bg-white border-4 border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black uppercase tracking-wide text-black">
                  {t('imageConverter.fileList')} <span className="text-gray-800 font-normal">({files.length})</span>
                </h3>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide bg-white text-black border-4 border-black hover:bg-black hover:text-white transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  {t('common.deleteAll')}
                </button>
              </div>

              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center gap-4 p-4 bg-gray-50 border-4 border-black hover:bg-black hover:text-white transition-all duration-200"
                  >
                    {/* Preview */}
                    <div className="w-16 h-16 border-4 border-black overflow-hidden bg-white flex-shrink-0">
                      {!isHeicFile(file.originalFile) ? (
                        <img
                          src={file.preview}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-900 text-xs font-mono font-bold">
                          {isHeicFile(file.originalFile) ? 'HEIC' : 'SVG'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black uppercase tracking-wide truncate text-black group-hover:text-white">
                        {file.originalName}
                      </p>
                      <p className="text-xs font-bold mt-1 text-gray-900 group-hover:text-white">
                        {(file.originalFile.size / 1024).toFixed(1)} KB
                        {file.status === 'completed' && file.result && (
                          <span className="text-[#10B981] group-hover:text-[#34D399] ml-2">
                            → {(file.result.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </p>
                      {(file.status === 'processing' || file.status === 'completed') && (
                        <div className="mt-2 h-2 bg-gray-300 overflow-hidden border-2 border-black">
                          <div
                            className={`h-full transition-all duration-200 ${
                              file.status === 'completed'
                                ? 'bg-[#10B981]'
                                : 'bg-[#EC4899]'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                      {file.status === 'error' && (
                        <p className="text-xs font-bold mt-1 flex items-center gap-2 text-red-600 group-hover:text-red-400">
                          <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
                          {file.error}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <>
                          <CheckCircle className="w-6 h-6 text-[#10B981]" strokeWidth={2.5} />
                          <button
                            onClick={() => handleDownload(file)}
                            className="w-10 h-10 flex items-center justify-center border-4 border-black bg-[#EC4899] text-white hover:bg-black transition-all duration-200"
                          >
                            <Download className="w-5 h-5" strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="w-10 h-10 flex items-center justify-center border-4 border-black bg-white text-black hover:bg-black hover:text-white transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
            {pendingCount > 0 && (
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-black text-lg uppercase tracking-wide border-4 border-black hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                    {t('common.converting')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" strokeWidth={2.5} />
                    {t('imageConverter.convertCount', { count: pendingCount })}
                  </>
                )}
              </button>
            )}
            {completedCount > 0 && (
              <button
                onClick={handleDownloadAll}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#EC4899] text-white font-black text-lg uppercase tracking-wide border-4 border-black hover:bg-black hover:text-white transition-all duration-200"
              >
                <Download className="w-5 h-5" strokeWidth={2.5} />
                {t('imageConverter.downloadCount', { count: completedCount })}
              </button>
            )}
          </div>
        )}

        {/* How To Use */}
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
      </div>
    </div>
  );
}
