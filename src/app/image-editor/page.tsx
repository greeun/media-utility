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
} from 'lucide-react';
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { rotateImage, flipImage, resizeImage, cropImage } from '@/services/imageEditor';
import { optimizeImage } from '@/services/imageConverter';
import { saveAs } from 'file-saver';

type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize' | null;

export default function ImageEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Crop state
  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Resize state
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);

  // Optimize state
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

      // 이미지 로드 후 크기 설정
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

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-4">
            <Crop className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">이미지 편집</h1>
          <p className="mt-2 text-gray-600">
            자르기, 회전, 뒤집기, 리사이즈, 최적화
          </p>
        </div>

        {/* Upload Area */}
        {!preview && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <label
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
              <span className={`text-lg font-medium ${isDragging ? 'text-purple-600' : 'text-gray-700'}`}>
                {isDragging ? '여기에 놓으세요' : '이미지를 선택하거나 드래그하세요'}
              </span>
              <span className="text-sm text-gray-500 mt-1">PNG, JPG, WebP 지원</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Editor */}
        {preview && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setEditMode(editMode === 'crop' ? null : 'crop')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    editMode === 'crop' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Crop className="w-4 h-4" />
                  자르기
                </button>
                <button
                  onClick={() => handleRotate(-90)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  왼쪽 회전
                </button>
                <button
                  onClick={() => handleRotate(90)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RotateCw className="w-4 h-4" />
                  오른쪽 회전
                </button>
                <button
                  onClick={() => handleFlip('horizontal')}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  좌우 뒤집기
                </button>
                <button
                  onClick={() => handleFlip('vertical')}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <FlipVertical className="w-4 h-4" />
                  상하 뒤집기
                </button>
                <button
                  onClick={() => setEditMode(editMode === 'resize' ? null : 'resize')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    editMode === 'resize' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Minimize2 className="w-4 h-4" />
                  리사이즈
                </button>
                <button
                  onClick={() => setEditMode(editMode === 'optimize' ? null : 'optimize')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    editMode === 'optimize' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  최적화
                </button>
              </div>
            </div>

            {/* Edit Panels */}
            {editMode === 'crop' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">드래그하여 자를 영역을 선택하세요</p>
                  <button
                    onClick={handleCropApply}
                    disabled={!crop || isProcessing}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    자르기 적용
                  </button>
                </div>
              </div>
            )}

            {editMode === 'resize' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">너비</label>
                    <input
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => setResizeWidth(Number(e.target.value))}
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">높이</label>
                    <input
                      type="number"
                      value={resizeHeight}
                      onChange={(e) => setResizeHeight(Number(e.target.value))}
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={maintainRatio}
                      onChange={(e) => setMaintainRatio(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">비율 유지</span>
                  </label>
                  <button
                    onClick={handleResize}
                    disabled={isProcessing}
                    className="mt-6 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    리사이즈 적용
                  </button>
                </div>
              </div>
            )}

            {editMode === 'optimize' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      품질: {optimizeQuality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={optimizeQuality}
                      onChange={(e) => setOptimizeQuality(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최대 크기: {maxSize}MB
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={maxSize}
                      onChange={(e) => setMaxSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={handleOptimize}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    최적화 적용
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="relative flex items-center justify-center min-h-[400px] bg-gray-100 rounded-xl overflow-hidden">
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
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
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                  원본: {file?.name} ({((file?.size || 0) / 1024).toFixed(1)} KB)
                </span>
                {editedBlob && (
                  <span className="text-green-600">
                    편집 후: {(editedBlob.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <label className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                다른 이미지 선택
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
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  원본으로 되돌리기
                </button>
              )}
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-purple-500 text-white rounded-full font-semibold hover:bg-purple-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                다운로드
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
