'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Minimize2,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  Crop,
} from 'lucide-react';
import { ImageEditorIcon } from '@/components/icons/FeatureIcons';
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { rotateImage, flipImage, resizeImage, cropImage } from '@/services/imageEditor';
import { optimizeImage } from '@/services/imageConverter';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize' | null;

export default function ImageEditorPage() {
  const t = useTranslations();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);

  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);

  const [optimizeQuality, setOptimizeQuality] = useState(80);
  const [maxSize, setMaxSize] = useState(1);

  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setEditedBlob(null);
      setEditMode(null);
      setCrop(undefined);

      const img = new Image();
      img.onload = () => {
        setResizeWidth(img.width);
        setResizeHeight(img.height);
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
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
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  const getCurrentSource = (): File | Blob => {
    return editedBlob || file!;
  };

  const handleRotate = async (degrees: number) => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const result = await rotateImage(getCurrentSource(), degrees);
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
    } catch (error) {
      console.error('Rotate error:', error);
    }
    setIsProcessing(false);
  };

  const handleFlip = async (direction: 'horizontal' | 'vertical') => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const result = await flipImage(getCurrentSource(), direction);
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
    } catch (error) {
      console.error('Flip error:', error);
    }
    setIsProcessing(false);
  };

  const handleCropApply = async () => {
    if (!crop || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const result = await cropImage(getCurrentSource(), {
        x: crop.x * scaleX,
        y: crop.y * scaleY,
        width: crop.width * scaleX,
        height: crop.height * scaleY,
      });
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
      setEditMode(null);
      setCrop(undefined);
    } catch (error) {
      console.error('Crop error:', error);
    }
    setIsProcessing(false);
  };

  const handleResize = async () => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const result = await resizeImage(getCurrentSource(), resizeWidth, resizeHeight, maintainRatio);
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
      setEditMode(null);
    } catch (error) {
      console.error('Resize error:', error);
    }
    setIsProcessing(false);
  };

  const handleOptimize = async () => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const source = getCurrentSource();
      const sourceFile = source instanceof File ? source : new File([source], 'image.jpg');
      const result = await optimizeImage(sourceFile, {
        maxSizeMB: maxSize,
        quality: optimizeQuality / 100,
      });
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
      setEditMode(null);
    } catch (error) {
      console.error('Optimize error:', error);
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    const blob = editedBlob || file;
    if (blob) {
      const filename = file?.name || 'edited-image.jpg';
      const newName = `edited_${filename}`;
      saveAs(blob, newName);
    }
  };

  const handleReset = () => {
    if (file) {
      setEditedBlob(null);
      setPreview(URL.createObjectURL(file));
      setEditMode(null);
      setCrop(undefined);
    }
  };

  const toolbarButtons = [
    { mode: 'crop' as const, icon: Crop, label: t('imageEditor.toolbar.crop'), action: () => setEditMode(editMode === 'crop' ? null : 'crop') },
    { icon: RotateCcw, label: t('imageEditor.rotate.left'), action: () => handleRotate(-90) },
    { icon: RotateCw, label: t('imageEditor.rotate.right'), action: () => handleRotate(90) },
    { icon: FlipHorizontal, label: t('imageEditor.flip.horizontal'), action: () => handleFlip('horizontal') },
    { icon: FlipVertical, label: t('imageEditor.flip.vertical'), action: () => handleFlip('vertical') },
    { mode: 'resize' as const, icon: Minimize2, label: t('imageEditor.toolbar.resize'), action: () => setEditMode(editMode === 'resize' ? null : 'resize') },
    { mode: 'optimize' as const, icon: RefreshCw, label: t('imageEditor.toolbar.optimize'), action: () => setEditMode(editMode === 'optimize' ? null : 'optimize') },
  ];

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.65_0.22_290)] flex items-center justify-center shadow-[0_0_30px_oklch(0.65_0.22_290/0.3)]">
              <ImageEditorIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">{t('imageEditor.title')}</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">
                {t('imageEditor.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!preview && (
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="p-8 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${isDragging
                    ? 'border-[oklch(0.65_0.22_290)] bg-[oklch(0.65_0.22_290/0.05)]'
                    : 'border-[oklch(1_0_0/0.1)] hover:border-[oklch(0.65_0.22_290/0.5)] hover:bg-[oklch(0.65_0.22_290/0.02)]'
                  }
                `}
              >
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-[oklch(0.65_0.22_290)]' : 'text-[oklch(0.40_0.02_240)]'}`} />
                <span className={`text-lg font-medium ${isDragging ? 'text-[oklch(0.70_0.26_290)]' : 'text-[oklch(0.70_0.02_240)]'}`}>
                  {t('common.dragOrClick')}
                </span>
                <span className="text-sm text-[oklch(0.50_0.02_240)] mt-2">PNG, JPG, WebP</span>
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

        {/* Editor */}
        {preview && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="p-4 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {toolbarButtons.map((btn, idx) => {
                  const Icon = btn.icon;
                  const isActive = btn.mode && editMode === btn.mode;
                  return (
                    <button
                      key={idx}
                      onClick={btn.action}
                      disabled={isProcessing && !btn.mode}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-[oklch(0.65_0.22_290)] text-[oklch(0.08_0.01_240)] shadow-[0_0_20px_oklch(0.65_0.22_290/0.3)]'
                          : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)] hover:text-[oklch(0.85_0.02_240)]'
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

            {/* Edit Panels */}
            {editMode === 'crop' && (
              <div className="p-4 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[oklch(0.60_0.02_240)]">{t('imageEditor.crop.freeform')}</p>
                  <button
                    onClick={handleCropApply}
                    disabled={!crop || isProcessing}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[oklch(0.65_0.22_290)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.65_0.22_290/0.3)] transition-all disabled:opacity-50"
                  >
                    {t('imageEditor.crop.apply')}
                  </button>
                </div>
              </div>
            )}

            {editMode === 'resize' && (
              <div className="p-4 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="w-28">
                    <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">{t('imageEditor.resize.width')}</label>
                    <input
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => setResizeWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.65_0.22_290)]"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">{t('imageEditor.resize.height')}</label>
                    <input
                      type="number"
                      value={resizeHeight}
                      onChange={(e) => setResizeHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.65_0.22_290)]"
                    />
                  </div>
                  <label className="flex items-center gap-2 h-10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintainRatio}
                      onChange={(e) => setMaintainRatio(e.target.checked)}
                      className="w-4 h-4 rounded bg-[oklch(0.16_0.02_245)] border-[oklch(1_0_0/0.2)] text-[oklch(0.65_0.22_290)] focus:ring-[oklch(0.65_0.22_290)]"
                    />
                    <span className="text-sm text-[oklch(0.70_0.02_240)]">{t('imageEditor.resize.keepRatio')}</span>
                  </label>
                  <button
                    onClick={handleResize}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[oklch(0.65_0.22_290)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.65_0.22_290/0.3)] transition-all disabled:opacity-50"
                  >
                    {t('imageEditor.resize.apply')}
                  </button>
                </div>
              </div>
            )}

            {editMode === 'optimize' && (
              <div className="p-4 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">
                      {t('imageEditor.optimize.quality')}: <span className="text-[oklch(0.65_0.22_290)]">{optimizeQuality}%</span>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={optimizeQuality}
                      onChange={(e) => setOptimizeQuality(Number(e.target.value))}
                      className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:bg-[oklch(0.65_0.22_290)] [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_oklch(0.65_0.22_290/0.5)]"
                    />
                  </div>
                  <button
                    onClick={handleOptimize}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[oklch(0.65_0.22_290)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.65_0.22_290/0.3)] transition-all disabled:opacity-50"
                  >
                    {t('imageEditor.optimize.apply')}
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            <div className="p-4 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
              <div className="relative flex items-center justify-center min-h-[400px] bg-[oklch(0.12_0.015_250)] rounded-xl overflow-hidden">
                {isProcessing && (
                  <div className="absolute inset-0 bg-[oklch(0.08_0.01_240/0.8)] flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-[oklch(0.65_0.22_290)] animate-spin" />
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
                  />
                )}
              </div>

              {/* File info */}
              <div className="mt-4 flex items-center justify-between text-sm text-[oklch(0.50_0.02_240)]">
                <span>
                  {file?.name} ({((file?.size || 0) / 1024).toFixed(1)} KB)
                </span>
                {editedBlob && (
                  <span className="text-[oklch(0.72_0.17_160)] font-medium">
                    → {(editedBlob.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[oklch(1_0_0/0.1)] text-[oklch(0.70_0.02_240)] font-medium cursor-pointer hover:bg-[oklch(1_0_0/0.05)] hover:border-[oklch(1_0_0/0.2)] transition-all">
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[oklch(1_0_0/0.1)] text-[oklch(0.70_0.02_240)] font-medium hover:bg-[oklch(1_0_0/0.05)] hover:border-[oklch(1_0_0/0.2)] transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('common.cancel')}
                </button>
              )}
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[oklch(0.65_0.22_290)] text-[oklch(0.08_0.01_240)] font-semibold hover:shadow-[0_0_30px_oklch(0.65_0.22_290/0.4)] transition-all"
              >
                <Download className="w-4 h-4" />
                {t('common.download')}
              </button>
            </div>
          </div>
        )}

        {/* How To Use */}
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
