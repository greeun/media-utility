'use client';

import { useState, useCallback } from 'react';
import { Film, Upload, Trash2, Download, RefreshCw, GripVertical, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { createGifFromImages } from '@/services/gifGenerator';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

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

  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(400);
  const [delay, setDelay] = useState(500);
  const [quality, setQuality] = useState(10);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((files: File[]) => {
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

  const handleFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, [processFiles]);

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

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

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
    <div className="min-h-full bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-lg mb-4">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GIF 만들기</h1>
          <p className="mt-1 text-slate-600">
            여러 이미지를 합쳐서 애니메이션 GIF를 만드세요
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Image List */}
          <div className="space-y-4">
            {/* Upload */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <label
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${isDragging ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {isDragging ? '여기에 놓으세요' : '이미지를 추가하거나 드래그하세요'}
                  </span>
                  <span className="text-xs text-slate-500">PNG, JPG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </label>
              </CardContent>
            </Card>

            {/* Image List */}
            {images.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">이미지 ({images.length}개)</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      전체 삭제
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">위/아래 버튼으로 순서를 변경하세요</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                      >
                        <GripVertical className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-medium text-slate-500 w-5">
                          {index + 1}
                        </span>
                        <div className="w-10 h-10 rounded overflow-hidden bg-slate-200 flex-shrink-0">
                          <img
                            src={img.preview}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="flex-1 text-sm text-slate-700 truncate">
                          {img.file.name}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveImage(index, index - 1)}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                          )}
                          {index < images.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveImage(index, index + 1)}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-500"
                            onClick={() => removeImage(img.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Options & Preview */}
          <div className="space-y-4">
            {/* Options */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">GIF 설정</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 mb-2 block">너비 (px)</Label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      min="100"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-2 block">높이 (px)</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      min="100"
                      max="1000"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 mb-2 block">프레임 간격: {delay}ms</Label>
                  <Slider
                    value={delay}
                    onChange={(e) => setDelay(Number(e.target.value))}
                    min={100}
                    max={2000}
                    step={100}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>빠름</span>
                    <span>느림</span>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 mb-2 block">품질: {quality} (낮을수록 좋음)</Label>
                  <Slider
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    min={1}
                    max={20}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            {images.length >= 2 && (
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중... {progress}%
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 mr-2" />
                    GIF 생성하기
                  </>
                )}
              </Button>
            )}

            {/* Progress */}
            {isGenerating && (
              <Progress value={progress} variant="default" />
            )}

            {/* Preview */}
            {resultPreview && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">결과</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center">
                    <img
                      src={resultPreview}
                      alt="Generated GIF"
                      className="max-w-full max-h-[280px]"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      크기: {((resultGif?.size || 0) / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      onClick={handleDownload}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      다운로드
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
