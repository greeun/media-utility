'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Download, RefreshCw, Loader2, Link2, Link2Off } from 'lucide-react';
import { VideoResizerIcon } from '@/components/icons/FeatureIcons';
import { resizeVideo } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import {
  PageHeader,
  SettingsPanel,
  ActionButtonGroup,
} from '@/design-system/v2/components';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';

const PRESET_SIZES = [
  { label: '4K', width: 3840, height: 2160 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: '720p', width: 1280, height: 720 },
  { label: '540p', width: 960, height: 540 },
  { label: '480p', width: 854, height: 480 },
  { label: '360p', width: 640, height: 360 },
];

// 액센트 컬러
const ACCENT = ACCENT_COLORS.purple;

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

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (resultPreview) URL.revokeObjectURL(resultPreview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setResultPreview(null);
    setProgress(0);
  };

  return (
    <ToolPageLayout maxWidth="xl">
      {/* 헤더 */}
      <PageHeader
        icon={<VideoResizerIcon size={32} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('videoResizer.title')}
        description={t('videoResizer.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('videoResizer.constraints.0'), t('videoResizer.constraints.1')]}
        accentColor="purple"
      />

      {/* 업로드 영역 */}
      {!preview && (
        <div
          className="mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <div className="p-8 bg-white border-4 border-black">
            <label
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex flex-col items-center justify-center w-full h-64 border-4 border-dashed cursor-pointer transition-all
                ${isDragging
                  ? 'border-[#A855F7] bg-[#A855F7]/5'
                  : 'border-black hover:border-[#A855F7] hover:bg-gray-50'
                }
              `}
            >
              <div className={`p-6 border-4 border-current transition-colors ${isDragging ? 'text-[#A855F7]' : 'text-black'}`}>
                <Upload className="w-10 h-10" strokeWidth={2.5} />
              </div>
              <span className={`mt-4 text-xl font-black uppercase tracking-wide ${isDragging ? 'text-[#A855F7]' : 'text-black'}`}>
                {t('common.dragOrClick')}
              </span>
              <span className="text-sm font-bold text-gray-600 mt-2">MP4, WebM, MOV, AVI</span>
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

      {/* 편집 영역 */}
      {preview && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* 좌측: 미리보기 & 옵션 */}
          <div className="space-y-6">
            {/* 미리보기 */}
            <div
              className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4">
                {t('videoResizer.preview')}
              </h3>
              <div className="bg-black overflow-hidden">
                <video
                  ref={previewVideoRef}
                  src={preview}
                  controls
                  className="w-full max-h-[280px]"
                />
              </div>
              <div className="mt-3 text-sm font-bold text-gray-900">
                {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </div>
              {originalWidth > 0 && (
                <div className="mt-1 text-xs font-bold text-gray-600">
                  {t('videoResizer.originalSize')}: <span style={{ color: ACCENT }}>{originalWidth} × {originalHeight}</span>
                </div>
              )}
            </div>

            {/* 크기 설정 */}
            <SettingsPanel title={t('videoResizer.sizeSettings')} accentColor={ACCENT}>
              {/* 프리셋 */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                  {t('videoResizer.presets')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset.width, preset.height)}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all border-4 ${
                        outputWidth === preset.width && outputHeight === preset.height
                          ? 'text-white border-black'
                          : 'bg-white text-black border-black hover:bg-black hover:text-white'
                      }`}
                      style={
                        outputWidth === preset.width && outputHeight === preset.height
                          ? { backgroundColor: ACCENT }
                          : undefined
                      }
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 커스텀 크기 */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-900 mb-2">{t('videoResizer.width')}</label>
                  <input
                    type="number"
                    value={outputWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    min="100"
                    max="7680"
                    className="w-full px-3 py-2 bg-white text-black text-sm font-bold border-4 border-black focus:outline-none"
                    style={{ borderColor: undefined }}
                    onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                    onBlur={(e) => (e.target.style.borderColor = '#000')}
                  />
                </div>
                <button
                  onClick={() => setKeepAspectRatio(!keepAspectRatio)}
                  className="mb-0.5 p-2 border-4 border-black transition-all"
                  style={keepAspectRatio ? { backgroundColor: ACCENT, color: '#fff' } : { backgroundColor: '#fff', color: '#000' }}
                  title={keepAspectRatio ? t('videoResizer.aspectRatioLocked') : t('videoResizer.aspectRatioFree')}
                >
                  {keepAspectRatio ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
                </button>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-900 mb-2">{t('videoResizer.height')}</label>
                  <input
                    type="number"
                    value={outputHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    min="100"
                    max="4320"
                    className="w-full px-3 py-2 bg-white text-black text-sm font-bold border-4 border-black focus:outline-none"
                    onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                    onBlur={(e) => (e.target.style.borderColor = '#000')}
                  />
                </div>
              </div>
            </SettingsPanel>

            {/* 진행률 표시 */}
            {isProcessing && !loadingFFmpeg && (
              <div className="h-2 bg-gray-200 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: ACCENT }}
                />
              </div>
            )}
          </div>

          {/* 우측: 결과 */}
          <div className="space-y-6">
            {resultPreview && result && (
              <div
                className="p-6 bg-white border-4 border-black opacity-0 animate-scale-in"
                style={{ animationFillMode: 'forwards' }}
              >
                <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4">
                  {t('videoResizer.result')}
                </h3>
                <div className="bg-black overflow-hidden">
                  <video ref={videoRef} src={resultPreview} controls className="w-full max-h-[280px]" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-900">
                      {((result.size) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span
                      className="ml-2 px-2 py-1 text-xs font-black uppercase text-white border-4 border-black"
                      style={{ backgroundColor: ACCENT }}
                    >
                      {outputWidth} × {outputHeight}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      {preview && (
        <ActionButtonGroup
          accentColor={ACCENT}
          primaryAction={
            !result
              ? {
                  label: `${outputWidth} × ${outputHeight} ${t('videoResizer.resize')}`,
                  loadingLabel: loadingFFmpeg ? t('common.ffmpegLoading') : `${t('videoResizer.resizing')} ${progress}%`,
                  isLoading: isProcessing,
                  onClick: handleResize,
                }
              : undefined
          }
          downloadAction={
            result
              ? {
                  label: `${t('common.download')} (${((result.size) / (1024 * 1024)).toFixed(2)} MB)`,
                  onClick: handleDownload,
                }
              : undefined
          }
        />
      )}

      {/* 새 파일 업로드 */}
      {preview && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wide border-4 border-black hover:bg-black hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" strokeWidth={2.5} />
            {t('common.upload')}
          </button>
        </div>
      )}

      {/* 사용 방법 */}
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
    </ToolPageLayout>
  );
}
