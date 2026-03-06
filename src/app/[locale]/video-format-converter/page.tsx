'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Download, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { VideoFormatIcon } from '@/components/icons/FeatureIcons';
import { convertVideoFormat } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';

type OutputFormat = 'mp4' | 'webm' | 'mov' | 'avi';

const FORMAT_OPTIONS: { value: OutputFormat; label: string; mime: string }[] = [
  { value: 'mp4', label: 'MP4', mime: 'video/mp4' },
  { value: 'webm', label: 'WebM', mime: 'video/webm' },
  { value: 'mov', label: 'MOV', mime: 'video/quicktime' },
  { value: 'avi', label: 'AVI', mime: 'video/x-msvideo' },
];

export default function VideoFormatConverterPage() {
  const t = useTranslations();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const processFile = useCallback((selectedFile: File) => {
    if (selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setResultPreview(null);

      // 현재 포맷과 다른 포맷을 자동 선택
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'mp4') setOutputFormat('webm');
      else setOutputFormat('mp4');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  }, [processFile]);

  const handleConvert = async () => {
    if (!file) return;

    if (typeof SharedArrayBuffer === 'undefined') {
      alert(t('videoFormatConverter.sharedArrayBufferError') || '브라우저가 SharedArrayBuffer를 지원하지 않습니다.');
      return;
    }

    setIsProcessing(true);
    setLoadingFFmpeg(true);
    setProgress(0);

    try {
      const output = await convertVideoFormat(file, outputFormat, (p) => {
        setLoadingFFmpeg(false);
        setProgress(p);
      });
      setResult(output);
      setResultPreview(URL.createObjectURL(output));
    } catch (error) {
      console.error('Conversion error:', error);
      alert(`${t('videoFormatConverter.conversionError') || '변환 중 오류 발생'}: ${error instanceof Error ? error.message : String(error)}`);
    }

    setIsProcessing(false);
    setLoadingFFmpeg(false);
  };

  const handleDownload = () => {
    if (result) {
      const baseName = file?.name.replace(/\.[^.]+$/, '') || 'converted';
      saveAs(result, `${baseName}.${outputFormat}`);
    }
  };

  const inputFormat = file?.name.split('.').pop()?.toUpperCase() || '';

  return (
    <div className="min-h-full bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 border-4 border-black bg-[#06B6D4] flex items-center justify-center">
              <VideoFormatIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">{t('videoFormatConverter.title')}</h1>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {t('videoFormatConverter.description')}
              </p>
            </div>
          </div>
        </div>

        {/* 제약사항 */}
        <ToolConstraints
          constraints={[t('videoFormatConverter.constraints.0'), t('videoFormatConverter.constraints.1')]}
          accentColor="sky"
        />

        {/* Upload Area */}
        {!preview && (
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="p-8 bg-white border-4 border-black">
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${isDragging
                    ? 'border-[oklch(0.75_0.18_195)] bg-[oklch(0.75_0.18_195/0.05)]'
                    : 'border-[oklch(1_0_0/0.1)] hover:border-[oklch(0.75_0.18_195/0.5)] hover:bg-[oklch(0.75_0.18_195/0.02)]'
                  }
                `}
              >
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-[oklch(0.75_0.18_195)]' : 'text-[oklch(0.40_0.02_240)]'}`} />
                <span className={`text-lg font-medium ${isDragging ? 'text-[oklch(0.80_0.20_195)]' : 'text-[oklch(0.70_0.02_240)]'}`}>
                  {t('common.dragOrClick')}
                </span>
                <span className="text-sm text-[oklch(0.50_0.02_240)] mt-2">MP4, WebM, MOV, AVI</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Editor */}
        {preview && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Preview & Options */}
            <div className="space-y-4">
              {/* Preview */}
              <div className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">{t('videoFormatConverter.preview')}</h3>
                <div className="bg-[oklch(0.12_0.015_250)] rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    src={preview}
                    controls
                    className="w-full max-h-[280px]"
                  />
                </div>
                <div className="mt-2 text-sm text-[oklch(0.50_0.02_240)]">
                  {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                </div>
                {inputFormat && (
                  <div className="mt-1 text-xs text-[oklch(0.50_0.02_240)]">
                    {t('videoFormatConverter.currentFormat')}: <span className="font-bold">{inputFormat}</span>
                  </div>
                )}
              </div>

              {/* Format Selection */}
              <div className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[oklch(0.75_0.18_195)]" />
                  {t('videoFormatConverter.outputFormat')}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {FORMAT_OPTIONS.map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => setOutputFormat(fmt.value)}
                      className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                        outputFormat === fmt.value
                          ? 'bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] shadow-[0_0_20px_oklch(0.75_0.18_195/0.3)]'
                          : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-up"
                style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadingFFmpeg ? t('common.ffmpegLoading') : `${t('common.converting')} ${progress}%`}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {inputFormat} → {outputFormat.toUpperCase()} {t('common.convert')}
                  </>
                )}
              </button>

              {/* Progress */}
              {isProcessing && !loadingFFmpeg && (
                <div className="h-1.5 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[oklch(0.75_0.18_195)] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Download Button (좌측 패널) */}
              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-xl bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_oklch(0.75_0.18_195/0.4)] transition-all opacity-0 animate-fade-up"
                  style={{ animationFillMode: 'forwards' }}
                >
                  <Download className="w-4 h-4" />
                  {t('common.download')} ({((result.size) / (1024 * 1024)).toFixed(2)} MB)
                </button>
              )}

              {/* New File */}
              <label className="block">
                <div className="w-full py-2.5 rounded-xl border border-[oklch(1_0_0/0.1)] text-[oklch(0.70_0.02_240)] font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-[oklch(1_0_0/0.05)] hover:border-[oklch(1_0_0/0.2)] transition-all">
                  <Upload className="w-4 h-4" />
                  {t('common.upload')}
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Right: Result */}
            <div className="space-y-4">
              {resultPreview && result && (
                <div className="p-6 bg-white border-4 border-black opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">{t('videoFormatConverter.result')}</h3>
                  <div className="bg-[oklch(0.12_0.015_250)] rounded-xl overflow-hidden">
                    <video src={resultPreview} controls className="w-full max-h-[280px]" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-[oklch(0.50_0.02_240)]">
                        {((result.size) / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <span className="ml-2 text-xs font-bold uppercase text-[oklch(0.75_0.18_195)]">
                        {outputFormat}
                      </span>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] font-semibold hover:shadow-[0_0_20px_oklch(0.75_0.18_195/0.4)] transition-all"
                    >
                      <Download className="w-4 h-4" />
                      {t('common.download')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse
            title={t('videoFormatConverter.howToUse.title')}
            description={t('videoFormatConverter.howToUse.description')}
            accentColor="cyan"
            steps={[
              {
                number: 1,
                title: t('videoFormatConverter.howToUse.step1Title'),
                description: t('videoFormatConverter.howToUse.step1Desc'),
              },
              {
                number: 2,
                title: t('videoFormatConverter.howToUse.step2Title'),
                description: t('videoFormatConverter.howToUse.step2Desc'),
              },
              {
                number: 3,
                title: t('videoFormatConverter.howToUse.step3Title'),
                description: t('videoFormatConverter.howToUse.step3Desc'),
              },
            ]}
            supportedFormats={['MP4', 'WebM', 'MOV', 'AVI']}
          />
        </div>
      </div>
    </div>
  );
}
