'use client';

import { useTranslations } from 'next-intl';
import { Upload, Download, RefreshCw, Film, Image as ImageIcon, Loader2, Video, Sparkles } from 'lucide-react';
import { VideoConverterIcon } from '@/components/icons/FeatureIcons';
import { PageHeader, SettingsPanel, FormatButton, UploadArea } from '@/design-system/v2';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { useVideoConverter } from './_hooks/useVideoConverter';

const ACCENT = ACCENT_COLORS.orange;

export default function VideoConverterPage() {
  const t = useTranslations();
  const {
    file,
    preview,
    mode,
    setMode,
    isProcessing,
    progress,
    result,
    resultPreview,
    loadingFFmpeg,
    fps,
    setFps,
    outputWidth,
    setOutputWidth,
    isDragging,
    videoRef,
    isVideo,
    isGif,
    handleFileSelect,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleConvert,
    handleDownload,
    handleDownloadFrame,
    handleDownloadAllFrames,
  } = useVideoConverter();

  return (
    <ToolPageLayout maxWidth="xl">
      {/* Header */}
      <PageHeader
        icon={<VideoConverterIcon size={28} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('videoConverter.title')}
        description={t('videoConverter.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('videoConverter.constraints.0'), t('videoConverter.constraints.1')]}
        accentColor="sky"
      />

      {/* Upload Area */}
      {!preview && (
        <UploadArea
          accentColor={ACCENT}
          label={t('common.dragOrClick')}
          hint="MP4, WebM, MOV, GIF"
          accept="video/*,image/gif"
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleFileSelect}
        />
      )}

      {/* Editor */}
      {preview && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Preview & Options */}
          <div className="space-y-4">
            {/* Preview */}
            <div
              className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <h3 className="text-sm font-black uppercase tracking-wide text-black mb-4">
                {t('videoConverter.preview')}
              </h3>
              <div className="bg-gray-100 overflow-hidden border-2 border-black">
                {isVideo ? (
                  <video
                    ref={videoRef}
                    src={preview}
                    controls
                    className="w-full max-h-[280px]"
                  />
                ) : (
                  <img src={preview} alt="GIF Preview" className="w-full max-h-[280px] object-contain" />
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </div>
            </div>

            {/* Mode Selection */}
            <div
              className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
              style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}
            >
              <h3 className="text-sm font-black uppercase tracking-wide text-black mb-4">
                {t('common.settings')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {isVideo && (
                  <>
                    <FormatButton
                      label={t('videoConverter.mode.videoToGif')}
                      active={mode === 'video-to-gif'}
                      accentColor={ACCENT}
                      onClick={() => setMode('video-to-gif')}
                    />
                    <FormatButton
                      label={t('videoConverter.mode.extractFrames')}
                      active={mode === 'video-to-frames'}
                      accentColor={ACCENT}
                      onClick={() => setMode('video-to-frames')}
                    />
                  </>
                )}
                {isGif && (
                  <FormatButton
                    label={t('videoConverter.mode.gifToVideo')}
                    active={true}
                    accentColor={ACCENT}
                    onClick={() => {}}
                  />
                )}
              </div>
            </div>

            {/* Options */}
            {mode === 'video-to-gif' && (
              <SettingsPanel
                title={t('gifMaker.options')}
                accentColor={ACCENT}
                delay="0.2s"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">
                      {t('videoConverter.options.fps')}
                    </label>
                    <input
                      type="number"
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      min="5"
                      max="30"
                      className="w-full px-3 py-2 bg-white border-4 border-black text-black focus:outline-none"
                      style={{ outlineColor: ACCENT }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">
                      {t('videoConverter.options.scale')}
                    </label>
                    <input
                      type="number"
                      value={outputWidth}
                      onChange={(e) => setOutputWidth(Number(e.target.value))}
                      min="100"
                      max="1000"
                      className="w-full px-3 py-2 bg-white border-4 border-black text-black focus:outline-none"
                      style={{ outlineColor: ACCENT }}
                    />
                  </div>
                </div>
              </SettingsPanel>
            )}

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full py-3 border-4 text-white font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-up"
              style={{
                backgroundColor: ACCENT,
                borderColor: ACCENT,
                animationDelay: '0.25s',
                animationFillMode: 'forwards',
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingFFmpeg ? t('common.ffmpegLoading') : `${t('common.converting')} ${progress}%`}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {t('common.convert')}
                </>
              )}
            </button>

            {/* Progress */}
            {isProcessing && !loadingFFmpeg && (
              <div className="h-2 bg-gray-300 border-2 border-black overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: ACCENT }}
                />
              </div>
            )}

            {/* New File */}
            <label className="block">
              <div className="w-full py-2.5 border-4 border-black text-black font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-black hover:text-white transition-all">
                <Upload className="w-4 h-4" />
                {t('common.upload')}
              </div>
              <input
                type="file"
                accept="video/*,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Right: Result */}
          <div className="space-y-4">
            {/* Single Result (GIF or MP4) */}
            {resultPreview && result instanceof Blob && (
              <div
                className="p-6 bg-white border-4 border-black opacity-0 animate-scale-in"
                style={{ animationFillMode: 'forwards' }}
              >
                <h3 className="text-sm font-black uppercase tracking-wide text-black mb-4">
                  {t('videoConverter.result')}
                </h3>
                <div className="bg-gray-100 overflow-hidden border-2 border-black">
                  {mode === 'gif-to-mp4' ? (
                    <video src={resultPreview} controls className="w-full max-h-[280px]" />
                  ) : (
                    <img src={resultPreview} alt="Result" className="w-full max-h-[280px] object-contain" />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {((result.size) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 border-4 text-white font-bold uppercase tracking-wide transition-all hover:opacity-90"
                    style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                  >
                    <Download className="w-4 h-4" />
                    {t('common.download')}
                  </button>
                </div>
              </div>
            )}

            {/* Frames Result */}
            {Array.isArray(result) && result.length > 0 && (
              <div
                className="p-6 bg-white border-4 border-black opacity-0 animate-scale-in"
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-wide text-black">
                    {t('videoConverter.extractedFrames')}{' '}
                    <span className="text-gray-600 font-normal">({result.length})</span>
                  </h3>
                  <button
                    onClick={handleDownloadAllFrames}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-4 text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('common.downloadAll')}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-[450px] overflow-y-auto">
                  {result.map((blob, index) => (
                    <div key={index} className="relative group border-4 border-black">
                      <img
                        src={URL.createObjectURL(blob)}
                        alt={`Frame ${index + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                      <button
                        onClick={() => handleDownloadFrame(blob, index)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-6 h-6 text-white" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-xs bg-black/80 text-white px-1.5 py-0.5 font-mono">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How To Use */}
      <div className="mt-12">
        <HowToUse
          title={t('videoConverter.howToUse.title')}
          description={t('videoConverter.howToUse.description')}
          accentColor="amber"
          steps={[
            {
              number: 1,
              title: t('videoConverter.howToUse.step1Title'),
              description: t('videoConverter.howToUse.step1Desc'),
            },
            {
              number: 2,
              title: t('videoConverter.howToUse.step2Title'),
              description: t('videoConverter.howToUse.step2Desc'),
            },
            {
              number: 3,
              title: t('videoConverter.howToUse.step3Title'),
              description: t('videoConverter.howToUse.step3Desc'),
            },
          ]}
          supportedFormats={['MP4', 'WebM', 'MOV', 'AVI', 'GIF']}
        />
      </div>
    </ToolPageLayout>
  );
}
