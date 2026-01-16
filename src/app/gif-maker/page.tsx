'use client';

import { useState, useCallback } from 'react';
import { Film, Upload, Trash2, Download, RefreshCw, GripVertical } from 'lucide-react';
import { createGifFromImages } from '@/services/gifGenerator';
import { saveAs } from 'file-saver';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export default function GifMakerPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultGif, setResultGif] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);

  // GIF 옵션
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(400);
  const [delay, setDelay] = useState(500);
  const [quality, setQuality] = useState(10);

  const handleFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    const newImages: ImageItem[] = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    setResultGif(null);
    setResultPreview(null);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResultGif(null);
    setResultPreview(null);
  }, [images]);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return newImages;
    });
  }, []);

  const handleGenerate = async () => {
    if (images.length < 2) {
      alert('최소 2개 이상의 이미지가 필요합니다.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const files = images.map((img) => img.file);
      const result = await createGifFromImages(
        files,
        { width, height, delay, quality },
        (p) => setProgress(p)
      );

      setResultGif(result);
      setResultPreview(URL.createObjectURL(result));
    } catch (error) {
      console.error('GIF 생성 오류:', error);
      alert('GIF 생성 중 오류가 발생했습니다.');
    }

    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (resultGif) {
      saveAs(resultGif, 'animation.gif');
    }
  };

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GIF 만들기</h1>
          <p className="mt-2 text-gray-600">
            여러 이미지를 합쳐서 애니메이션 GIF를 만드세요
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Image List */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">이미지 추가</span>
                <span className="text-xs text-gray-500">PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image List */}
            {images.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    이미지 ({images.length}개)
                  </h2>
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    전체 삭제
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">드래그하여 순서를 변경하세요</p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group"
                    >
                      <button className="text-gray-400 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                        <img
                          src={img.preview}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="flex-1 text-sm text-gray-700 truncate">
                        {img.file.name}
                      </span>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <button
                            onClick={() => moveImage(index, index - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            ↑
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            onClick={() => moveImage(index, index + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Options & Preview */}
          <div className="space-y-6">
            {/* Options */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">GIF 설정</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      너비 (px)
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      min="100"
                      max="1000"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      높이 (px)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      min="100"
                      max="1000"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    프레임 간격: {delay}ms
                  </label>
                  <input
                    type="range"
                    value={delay}
                    onChange={(e) => setDelay(Number(e.target.value))}
                    min="100"
                    max="2000"
                    step="100"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>빠름</span>
                    <span>느림</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    품질: {quality} (낮을수록 좋음)
                  </label>
                  <input
                    type="range"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    min="1"
                    max="20"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            {images.length >= 2 && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    생성 중... {progress}%
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5" />
                    GIF 생성하기
                  </>
                )}
              </button>
            )}

            {/* Preview */}
            {resultPreview && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">결과</h2>
                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                  <img
                    src={resultPreview}
                    alt="Generated GIF"
                    className="max-w-full max-h-[300px]"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    크기: {((resultGif?.size || 0) / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
