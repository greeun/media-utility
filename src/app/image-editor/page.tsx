'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Minimize2,
  Download,
  Upload,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { rotateImage, flipImage, resizeImage, cropImage } from '@/services/imageEditor';
import { optimizeImage } from '@/services/imageConverter';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize' | null;

export default function ImageEditorPage() {
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
      console.error('회전 오류:', error);
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
      console.error('뒤집기 오류:', error);
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
      console.error('자르기 오류:', error);
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
      console.error('리사이즈 오류:', error);
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
      console.error('최적화 오류:', error);
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
    { mode: 'crop' as const, icon: Crop, label: '자르기', action: () => setEditMode(editMode === 'crop' ? null : 'crop') },
    { icon: RotateCcw, label: '왼쪽', action: () => handleRotate(-90) },
    { icon: RotateCw, label: '오른쪽', action: () => handleRotate(90) },
    { icon: FlipHorizontal, label: '좌우', action: () => handleFlip('horizontal') },
    { icon: FlipVertical, label: '상하', action: () => handleFlip('vertical') },
    { mode: 'resize' as const, icon: Minimize2, label: '리사이즈', action: () => setEditMode(editMode === 'resize' ? null : 'resize') },
    { mode: 'optimize' as const, icon: RefreshCw, label: '최적화', action: () => setEditMode(editMode === 'optimize' ? null : 'optimize') },
  ];

  return (
    <div className="min-h-full bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-500 rounded-lg mb-4">
            <Crop className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">이미지 편집</h1>
          <p className="mt-1 text-slate-600">
            자르기, 회전, 뒤집기, 리사이즈, 최적화
          </p>
        </div>

        {/* Upload Area */}
        {!preview && (
          <Card className="border-slate-200">
            <CardContent className="p-8">
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-violet-500' : 'text-slate-400'}`} />
                <span className={`text-lg font-medium ${isDragging ? 'text-violet-600' : 'text-slate-700'}`}>
                  {isDragging ? '여기에 놓으세요' : '이미지를 선택하거나 드래그하세요'}
                </span>
                <span className="text-sm text-slate-500 mt-1">PNG, JPG, WebP 지원</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>
        )}

        {/* Editor */}
        {preview && (
          <div className="space-y-4">
            {/* Toolbar */}
            <Card className="border-slate-200">
              <CardContent className="p-3">
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {toolbarButtons.map((btn, idx) => {
                    const Icon = btn.icon;
                    const isActive = btn.mode && editMode === btn.mode;
                    return (
                      <Button
                        key={idx}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        onClick={btn.action}
                        disabled={isProcessing && !btn.mode}
                        className={isActive ? "bg-violet-600 hover:bg-violet-700" : ""}
                      >
                        <Icon className="w-4 h-4 mr-1.5" />
                        {btn.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Edit Panels */}
            {editMode === 'crop' && (
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">드래그하여 자를 영역을 선택하세요</p>
                    <Button
                      onClick={handleCropApply}
                      disabled={!crop || isProcessing}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      자르기 적용
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {editMode === 'resize' && (
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="w-28">
                      <Label className="text-slate-700 mb-2 block">너비</Label>
                      <Input
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => setResizeWidth(Number(e.target.value))}
                      />
                    </div>
                    <div className="w-28">
                      <Label className="text-slate-700 mb-2 block">높이</Label>
                      <Input
                        type="number"
                        value={resizeHeight}
                        onChange={(e) => setResizeHeight(Number(e.target.value))}
                      />
                    </div>
                    <label className="flex items-center gap-2 h-9">
                      <Checkbox
                        checked={maintainRatio}
                        onChange={(e) => setMaintainRatio(e.target.checked)}
                      />
                      <span className="text-sm text-slate-700">비율 유지</span>
                    </label>
                    <Button
                      onClick={handleResize}
                      disabled={isProcessing}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      리사이즈 적용
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {editMode === 'optimize' && (
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-end gap-6">
                    <div className="flex-1 min-w-[180px]">
                      <Label className="text-slate-700 mb-2 block">품질: {optimizeQuality}%</Label>
                      <Slider
                        min={10}
                        max={100}
                        value={optimizeQuality}
                        onChange={(e) => setOptimizeQuality(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <Label className="text-slate-700 mb-2 block">최대 크기: {maxSize}MB</Label>
                      <Slider
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={maxSize}
                        onChange={(e) => setMaxSize(Number(e.target.value))}
                      />
                    </div>
                    <Button
                      onClick={handleOptimize}
                      disabled={isProcessing}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      최적화 적용
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Preview */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="relative flex items-center justify-center min-h-[400px] bg-slate-100 rounded-lg overflow-hidden">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
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
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    원본: {file?.name} ({((file?.size || 0) / 1024).toFixed(1)} KB)
                  </span>
                  {editedBlob && (
                    <span className="text-emerald-600 font-medium">
                      편집 후: {(editedBlob.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label>
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    다른 이미지 선택
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              {editedBlob && (
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  원본으로 되돌리기
                </Button>
              )}
              <Button
                onClick={handleDownload}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
