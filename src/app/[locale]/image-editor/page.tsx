'use client';

import { useTranslations } from 'next-intl';
import {
  Download,
  Upload,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { ImageEditorIcon } from '@/components/icons/FeatureIcons';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { useImageEditor } from './_hooks/useImageEditor';

const ACCENT = '#A855F7';

export default function ImageEditorPage() {
  const t = useTranslations();

  const {
    file,
    preview,
    editedBlob,
    editMode,
    isProcessing,
    crop,
    setCrop,
    imgRef,
    resizeWidth,
    resizeHeight,
    handleResizeWidthChange,
    handleResizeHeightChange,
    maintainRatio,
    setMaintainRatio,
    optimizeQuality,
    setOptimizeQuality,
    brightness,
    setBrightness,
    luminance,
    setLuminance,
    contrast,
    setContrast,
    exposure,
    setExposure,
    isDragging,
    handleFileSelect,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleCropApply,
    handleResize,
    handleOptimize,
    handleBrightnessApply,
    handleDownload,
    handleReset,
    toolbarButtons,
  } = useImageEditor();

  return (
    <div className="min-h-full bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        {/* 헤더 */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-16 h-16 border-4 border-black flex items-center justify-center"
              style={{ backgroundColor: ACCENT }}
            >
              <ImageEditorIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">
                {t('imageEditor.title')}
              </h1>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {t('imageEditor.description')}
              </p>
            </div>
          </div>
        </div>

        {/* 제약사항 */}
        <ToolConstraints
          constraints={[t('imageEditor.constraints.0')]}
          accentColor="amber"
        />

        {/* 업로드 영역 */}
        {!preview && (
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="p-8 bg-white border-4 border-black">
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center w-full h-64 border-4 border-dashed cursor-pointer transition-all
                  ${isDragging
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                  }
                `}
              >
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
                <span className={`text-lg font-bold uppercase tracking-wide ${isDragging ? 'text-purple-600' : 'text-gray-500'}`}>
                  {t('common.dragOrClick')}
                </span>
                <span className="text-sm text-gray-400 mt-2 font-medium">PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* 에디터 */}
        {preview && (
          <div className="space-y-4">
            {/* 툴바 */}
            <div className="p-4 bg-white border-4 border-black opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {toolbarButtons.map((btn, idx) => {
                  const Icon = btn.icon;
                  const isActive = btn.mode && editMode === btn.mode;
                  return (
                    <button
                      key={idx}
                      onClick={btn.action}
                      disabled={isProcessing && !btn.mode}
                      style={isActive ? { backgroundColor: ACCENT, borderColor: ACCENT } : undefined}
                      className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-black uppercase tracking-wide transition-all border-4
                        ${isActive
                          ? 'text-white'
                          : 'bg-white text-black border-black hover:bg-black hover:text-white'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 편집 패널 - 자르기 */}
            {editMode === 'crop' && (
              <div className="p-4 bg-white border-4 border-black">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                    {t('imageEditor.crop.freeform')}
                  </p>
                  <button
                    onClick={handleCropApply}
                    disabled={!crop || isProcessing}
                    style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                    className="px-4 py-2 border-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {t('imageEditor.crop.apply')}
                  </button>
                </div>
              </div>
            )}

            {/* 편집 패널 - 크기 변경 */}
            {editMode === 'resize' && (
              <div className="p-4 bg-white border-4 border-black">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="w-28">
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      {t('imageEditor.resize.width')}
                    </label>
                    <input
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => handleResizeWidthChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white text-black border-4 border-black focus:outline-none"
                      style={{ borderColor: undefined }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#000'; }}
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      {t('imageEditor.resize.height')}
                    </label>
                    <input
                      type="number"
                      value={resizeHeight}
                      onChange={(e) => handleResizeHeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white text-black border-4 border-black focus:outline-none"
                      onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#000'; }}
                    />
                  </div>
                  <label className="flex items-center gap-2 h-10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintainRatio}
                      onChange={(e) => setMaintainRatio(e.target.checked)}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm font-bold text-gray-700">{t('imageEditor.resize.keepRatio')}</span>
                  </label>
                  <button
                    onClick={handleResize}
                    disabled={isProcessing}
                    style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                    className="px-4 py-2 border-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {t('imageEditor.resize.apply')}
                  </button>
                </div>
              </div>
            )}

            {/* 편집 패널 - 최적화 */}
            {editMode === 'optimize' && (
              <div className="p-4 bg-white border-4 border-black">
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      {t('imageEditor.optimize.quality')}:{' '}
                      <span style={{ color: ACCENT }}>{optimizeQuality}%</span>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={optimizeQuality}
                      onChange={(e) => setOptimizeQuality(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleOptimize}
                    disabled={isProcessing}
                    style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                    className="px-4 py-2 border-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {t('imageEditor.optimize.apply')}
                  </button>
                </div>
              </div>
            )}

            {/* 편집 패널 - 명도 조절 */}
            {editMode === 'brightness' && (
              <div className="p-4 bg-white border-4 border-black">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      {t('imageEditor.brightness.label')}:{' '}
                      <span style={{ color: ACCENT }}>{brightness}</span>
                    </label>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
                      <span>-100</span>
                      <span>0</span>
                      <span>+100</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      {t('imageEditor.brightness.luminanceLabel')}:{' '}
                      <span style={{ color: ACCENT }}>{luminance}</span>
                    </label>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={luminance}
                      onChange={(e) => setLuminance(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
                      <span>-100</span>
                      <span>0</span>
                      <span>+100</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      {t('imageEditor.brightness.contrastLabel')}:{' '}
                      <span style={{ color: ACCENT }}>{contrast}</span>
                    </label>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
                      <span>-100</span>
                      <span>0</span>
                      <span>+100</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                      {t('imageEditor.brightness.exposureLabel')}:{' '}
                      <span style={{ color: ACCENT }}>{exposure}</span>
                    </label>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={exposure}
                      onChange={(e) => setExposure(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
                      <span>-100</span>
                      <span>0</span>
                      <span>+100</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => { setBrightness(0); setLuminance(0); setContrast(0); setExposure(0); }}
                    className="px-4 py-2 border-4 border-black text-sm font-black uppercase tracking-wide bg-white text-black hover:bg-black hover:text-white transition-all"
                  >
                    {t('imageEditor.brightness.reset')}
                  </button>
                  <button
                    onClick={handleBrightnessApply}
                    disabled={isProcessing || (brightness === 0 && luminance === 0 && contrast === 0 && exposure === 0)}
                    style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                    className="px-4 py-2 border-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {t('imageEditor.brightness.apply')}
                  </button>
                </div>
              </div>
            )}

            {/* 이미지 미리보기 */}
            <div className="p-4 bg-white border-4 border-black opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
              <div className="relative flex items-center justify-center min-h-[400px] bg-gray-100 border-4 border-black overflow-hidden">
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
                  </div>
                )}
                {editMode === 'crop' ? (
                  <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
                    <img
                      ref={imgRef}
                      src={preview}
                      alt="Edit preview"
                      className="max-h-[600px] object-contain"
                    />
                  </ReactCrop>
                ) : (
                  <img
                    ref={imgRef}
                    src={preview}
                    alt="Edit preview"
                    className="max-h-[600px] object-contain"
                    style={
                      editMode === 'brightness' && (brightness !== 0 || luminance !== 0 || contrast !== 0 || exposure !== 0)
                        ? { filter: `brightness(${(1 + brightness / 100) * (1 + luminance / 200) * Math.pow(2, exposure / 100)}) contrast(${1 + contrast / 100})` }
                        : undefined
                    }
                  />
                )}
              </div>

              {/* 파일 정보 */}
              <div className="mt-4 flex items-center justify-between text-sm font-bold text-gray-500">
                <span>
                  {file?.name} ({((file?.size || 0) / 1024).toFixed(1)} KB)
                </span>
                {editedBlob && (
                  <span style={{ color: ACCENT }} className="font-black">
                    → {(editedBlob.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-4 border-black bg-white text-black font-black uppercase tracking-wide cursor-pointer hover:bg-black hover:text-white transition-all">
                <Upload className="w-4 h-4" />
                {t('common.upload')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {editedBlob && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-4 border-black bg-white text-black font-black uppercase tracking-wide hover:bg-black hover:text-white transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('common.cancel')}
                </button>
              )}
              <button
                onClick={handleDownload}
                style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border-4 text-white font-black uppercase tracking-wide hover:opacity-90 transition-all"
              >
                <Download className="w-4 h-4" />
                {t('common.download')}
              </button>
            </div>
          </div>
        )}

        {/* 사용 방법 */}
        <div className="mt-12">
          <HowToUse
            title={t('imageEditor.howToUse.title')}
            description={t('imageEditor.howToUse.description')}
            accentColor="violet"
            steps={[
              {
                number: 1,
                title: t('imageEditor.howToUse.step1Title'),
                description: t('imageEditor.howToUse.step1Desc'),
              },
              {
                number: 2,
                title: t('imageEditor.howToUse.step2Title'),
                description: t('imageEditor.howToUse.step2Desc'),
              },
              {
                number: 3,
                title: t('imageEditor.howToUse.step3Title'),
                description: t('imageEditor.howToUse.step3Desc'),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
