'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Download, RefreshCw, Loader2, Sparkles, Link2, Link2Off } from 'lucide-react';
import { VideoResizerIcon } from '@/components/icons/FeatureIcons';
import { resizeVideo } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';

const PRESET_SIZES = [
  { label: '4K (3840×2160)', width: 3840, height: 2160 },
  { label: '1080p (1920×1080)', width: 1920, height: 1080 },
  { label: '720p (1280×720)', width: 1280, height: 720 },
  { label: '540p (960×540)', width: 960, height: 540 },
  { label: '480p (854×480)', width: 854, height: 480 },
  { label: '360p (640×360)', width: 640, height: 360 },
];

export default function VideoResizerPage() {
  const t = useTranslations();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [outputWidth, setOutputWidth] = useState(1280);
  const [outputHeight, setOutputHeight] = useState(720);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const processFile = useCallback((selectedFile: File) => {
    if (selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setResultPreview(null);
    }
  }, []);

  // 비디오 메타데이터에서 원본 크기 가져오기
  useEffect(() => {
    if (!preview) return;
    const video = document.createElement('video');
    video.src = preview;
    video.onloadedmetadata = () => {
      setOriginalWidth(video.videoWidth);
      setOriginalHeight(video.videoHeight);
      setOutputWidth(video.videoWidth);
      setOutputHeight(video.videoHeight);
    };
  }, [preview]);

  const handleWidthChange = (newWidth: number) => {
    setOutputWidth(newWidth);
    if (keepAspectRatio && originalWidth > 0) {
      setOutputHeight(Math.round((newWidth / originalWidth) * originalHeight));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setOutputHeight(newHeight);
    if (keepAspectRatio && originalHeight > 0) {
      setOutputWidth(Math.round((newHeight / originalHeight) * originalWidth));
    }
  };

  const applyPreset = (width: number, height: number) => {
    setOutputWidth(width);
    setOutputHeight(height);
    setKeepAspectRatio(false);
  };

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

  const handleResize = async () => {
    if (!file) return;

    if (typeof SharedArrayBuffer === 'undefined') {
      alert(t('videoResizer.sharedArrayBufferError') || '브라우저가 SharedArrayBuffer를 지원하지 않습니다.');
      return;
    }

    setIsProcessing(true);
    setLoadingFFmpeg(true);
    setProgress(0);

    try {
      const output = await resizeVideo(file, outputWidth, outputHeight, (p) => {
        setLoadingFFmpeg(false);
        setProgress(p);
      });
      setResult(output);
      setResultPreview(URL.createObjectURL(output));
    } catch (error) {
      console.error('Resize error:', error);
      alert(`${t('videoResizer.resizeError') || '크기 변경 중 오류 발생'}: ${error instanceof Error ? error.message : String(error)}`);
    }

    setIsProcessing(false);
    setLoadingFFmpeg(false);
  };

  const handleDownload = () => {
    if (result) {
      const ext = file?.name.split('.').pop() || 'mp4';
      const baseName = file?.name.replace(/\.[^.]+$/, '') || 'resized';
      saveAs(result, `${baseName}_${outputWidth}x${outputHeight}.${ext}`);
    }
  };

  return (
    <div className="min-h-full bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 border-4 border-black bg-[#A855F7] flex items-center justify-center">
              <VideoResizerIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">{t('videoResizer.title')}</h1>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {t('videoResizer.description')}
              </p>
            </div>
          </div>
        </div>

        {/* 제약사항 */}
        <ToolConstraints
          constraints={[t('videoResizer.constraints.0'), t('videoResizer.constraints.1')]}
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
                    ? 'border-[oklch(0.70_0.20_290)] bg-[oklch(0.70_0.20_290/0.05)]'
                    : 'border-[oklch(1_0_0/0.1)] hover:border-[oklch(0.70_0.20_290/0.5)] hover:bg-[oklch(0.70_0.20_290/0.02)]'
                  }
                `}
              >
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-[oklch(0.70_0.20_290)]' : 'text-[oklch(0.40_0.02_240)]'}`} />
                <span className={`text-lg font-medium ${isDragging ? 'text-[oklch(0.75_0.25_290)]' : 'text-[oklch(0.70_0.02_240)]'}`}>
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
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">{t('videoResizer.preview')}</h3>
                <div className="bg-[oklch(0.12_0.015_250)] rounded-xl overflow-hidden">
                  <video
                    ref={previewVideoRef}
                    src={preview}
                    controls
                    className="w-full max-h-[280px]"
                  />
                </div>
                <div className="mt-2 text-sm text-[oklch(0.50_0.02_240)]">
                  {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                </div>
                {originalWidth > 0 && (
                  <div className="mt-1 text-xs text-[oklch(0.50_0.02_240)]">
                    {t('videoResizer.originalSize')}: <span className="font-bold">{originalWidth} × {originalHeight}</span>
                  </div>
                )}
              </div>

              {/* Size Options */}
              <div className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[oklch(0.70_0.20_290)]" />
                  {t('videoResizer.sizeSettings')}
                </h3>

                {/* Presets */}
                <div className="mb-4">
                  <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-2 uppercase tracking-wider font-bold">{t('videoResizer.presets')}</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_SIZES.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset.width, preset.height)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          outputWidth === preset.width && outputHeight === preset.height
                            ? 'bg-[oklch(0.70_0.20_290)] text-white shadow-[0_0_15px_oklch(0.70_0.20_290/0.3)]'
                            : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Size */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-1">{t('videoResizer.width')}</label>
                      <input
                        type="number"
                        value={outputWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        min="100"
                        max="7680"
                        className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.70_0.20_290)]"
                      />
                    </div>
                    <button
                      onClick={() => setKeepAspectRatio(!keepAspectRatio)}
                      className={`mt-5 p-2 rounded-lg transition-all ${
                        keepAspectRatio
                          ? 'bg-[oklch(0.70_0.20_290)] text-white'
                          : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.50_0.02_240)]'
                      }`}
                      title={keepAspectRatio ? t('videoResizer.aspectRatioLocked') : t('videoResizer.aspectRatioFree')}
                    >
                      {keepAspectRatio ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-1">{t('videoResizer.height')}</label>
                      <input
                        type="number"
                        value={outputHeight}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        min="100"
                        max="4320"
                        className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.70_0.20_290)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resize Button */}
              <button
                onClick={handleResize}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-[oklch(0.70_0.20_290)] text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-up"
                style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadingFFmpeg ? t('common.ffmpegLoading') : `${t('videoResizer.resizing')} ${progress}%`}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {outputWidth} × {outputHeight} {t('videoResizer.resize')}
                  </>
                )}
              </button>

              {/* Progress */}
              {isProcessing && !loadingFFmpeg && (
                <div className="h-1.5 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[oklch(0.70_0.20_290)] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Download Button (좌측 패널) */}
              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-xl bg-[oklch(0.70_0.20_290)] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_oklch(0.70_0.20_290/0.4)] transition-all opacity-0 animate-fade-up"
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
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">{t('videoResizer.result')}</h3>
                  <div className="bg-[oklch(0.12_0.015_250)] rounded-xl overflow-hidden">
                    <video ref={videoRef} src={resultPreview} controls className="w-full max-h-[280px]" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-[oklch(0.50_0.02_240)]">
                        {((result.size) / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <span className="ml-2 text-xs font-bold text-[oklch(0.70_0.20_290)]">
                        {outputWidth} × {outputHeight}
                      </span>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.70_0.20_290)] text-white font-semibold hover:shadow-[0_0_20px_oklch(0.70_0.20_290/0.4)] transition-all"
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
            title={t('videoResizer.howToUse.title')}
            description={t('videoResizer.howToUse.description')}
            accentColor="purple"
            steps={[
              {
                number: 1,
                title: t('videoResizer.howToUse.step1Title'),
                description: t('videoResizer.howToUse.step1Desc'),
              },
              {
                number: 2,
                title: t('videoResizer.howToUse.step2Title'),
                description: t('videoResizer.howToUse.step2Desc'),
              },
              {
                number: 3,
                title: t('videoResizer.howToUse.step3Title'),
                description: t('videoResizer.howToUse.step3Desc'),
              },
            ]}
            supportedFormats={['MP4', 'WebM', 'MOV', 'AVI']}
          />
        </div>
      </div>
    </div>
  );
}
