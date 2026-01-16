'use client';

import { useState, useCallback } from 'react';
import { Upload, Trash2, Download, RefreshCw, GripVertical, ChevronUp, ChevronDown, Loader2, Film, Sparkles } from 'lucide-react';
import { GifMakerIcon } from '@/components/icons/FeatureIcons';
import { createGifFromImages } from '@/services/gifGenerator';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

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
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.72_0.17_160)] flex items-center justify-center shadow-[0_0_30px_oklch(0.72_0.17_160/0.3)]">
              <GifMakerIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">GIF 만들기</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">
                여러 이미지를 합쳐서 애니메이션 GIF를 만드세요
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Image List */}
          <div className="space-y-4">
            {/* Upload */}
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${isDragging
                    ? 'border-[oklch(0.72_0.17_160)] bg-[oklch(0.72_0.17_160/0.05)]'
                    : 'border-[oklch(1_0_0/0.1)] hover:border-[oklch(0.72_0.17_160/0.5)] hover:bg-[oklch(0.72_0.17_160/0.02)]'
                  }
                `}
              >
                <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-[oklch(0.72_0.17_160)]' : 'text-[oklch(0.40_0.02_240)]'}`} />
                <span className={`text-sm font-medium ${isDragging ? 'text-[oklch(0.78_0.20_160)]' : 'text-[oklch(0.70_0.02_240)]'}`}>
                  {isDragging ? '여기에 놓으세요' : '이미지를 추가하거나 드래그하세요'}
                </span>
                <span className="text-xs text-[oklch(0.50_0.02_240)] mt-1">PNG, JPG, WebP</span>
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
              <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)]">
                    이미지 <span className="text-[oklch(0.55_0.02_240)] font-normal">({images.length}개)</span>
                  </h3>
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.22_25)] hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    전체 삭제
                  </button>
                </div>
                <p className="text-xs text-[oklch(0.50_0.02_240)] mb-3">위/아래 버튼으로 순서를 변경하세요</p>

                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[oklch(0.12_0.015_250)] border border-[oklch(1_0_0/0.04)] hover:border-[oklch(1_0_0/0.08)] transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-[oklch(0.30_0.02_240)]" />
                      <span className="text-xs font-mono font-medium text-[oklch(0.50_0.02_240)] w-5">
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 rounded overflow-hidden bg-[oklch(0.16_0.02_245)] flex-shrink-0">
                        <img
                          src={img.preview}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="flex-1 text-sm text-[oklch(0.70_0.02_240)] truncate">
                        {img.file.name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {index > 0 && (
                          <button
                            onClick={() => moveImage(index, index - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded text-[oklch(0.50_0.02_240)] hover:text-[oklch(0.80_0.02_240)] hover:bg-[oklch(1_0_0/0.05)] transition-colors"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            onClick={() => moveImage(index, index + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded text-[oklch(0.50_0.02_240)] hover:text-[oklch(0.80_0.02_240)] hover:bg-[oklch(1_0_0/0.05)] transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(img.id)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[oklch(0.50_0.02_240)] hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] transition-colors"
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
          <div className="space-y-4">
            {/* Options */}
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[oklch(0.72_0.17_160)]" />
                GIF 설정
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">너비 (px)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      min="100"
                      max="1000"
                      className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.72_0.17_160)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">높이 (px)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      min="100"
                      max="1000"
                      className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.72_0.17_160)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">
                    프레임 간격: <span className="text-[oklch(0.72_0.17_160)]">{delay}ms</span>
                  </label>
                  <input
                    type="range"
                    value={delay}
                    onChange={(e) => setDelay(Number(e.target.value))}
                    min={100}
                    max={2000}
                    step={100}
                    className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-[oklch(0.72_0.17_160)] [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_oklch(0.72_0.17_160/0.5)]"
                  />
                  <div className="flex justify-between text-xs text-[oklch(0.50_0.02_240)] mt-1">
                    <span>빠름</span>
                    <span>느림</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">
                    품질: <span className="text-[oklch(0.72_0.17_160)]">{quality}</span> <span className="text-[oklch(0.45_0.02_240)]">(낮을수록 좋음)</span>
                  </label>
                  <input
                    type="range"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-[oklch(0.72_0.17_160)] [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_oklch(0.72_0.17_160/0.5)]"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            {images.length >= 2 && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_oklch(0.72_0.17_160/0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-up"
                style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    생성 중... {progress}%
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    GIF 생성하기
                  </>
                )}
              </button>
            )}

            {/* Progress */}
            {isGenerating && (
              <div className="h-1.5 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[oklch(0.72_0.17_160)] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Preview */}
            {resultPreview && (
              <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">결과</h3>
                <div className="bg-[oklch(0.12_0.015_250)] rounded-xl p-4 flex items-center justify-center">
                  <img
                    src={resultPreview}
                    alt="Generated GIF"
                    className="max-w-full max-h-[280px]"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-[oklch(0.50_0.02_240)]">
                    크기: {((resultGif?.size || 0) / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold hover:shadow-[0_0_20px_oklch(0.72_0.17_160/0.4)] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse
            title="GIF 애니메이션 만들기"
            description="여러 이미지를 합쳐서 움직이는 GIF 애니메이션을 만들어보세요. 프레임 순서, 속도, 크기를 자유롭게 조절할 수 있습니다."
            accentColor="emerald"
            steps={[
              {
                number: 1,
                title: '이미지 업로드',
                description: 'GIF로 만들 이미지들을 순서대로 업로드하세요. 드래그로 순서를 변경할 수 있습니다.',
              },
              {
                number: 2,
                title: '설정 조절',
                description: 'GIF 크기, 프레임 간격(속도), 품질을 원하는 대로 설정하세요.',
              },
              {
                number: 3,
                title: 'GIF 생성',
                description: '생성 버튼을 클릭하면 GIF가 만들어집니다. 미리보기 후 다운로드하세요.',
              },
            ]}
            supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'BMP']}
            features={[
              {
                title: '드래그 앤 드롭 순서 변경',
                description: '이미지 순서를 드래그하여 쉽게 변경할 수 있습니다.',
              },
              {
                title: '프레임 속도 조절',
                description: '100ms~2000ms 범위에서 프레임 간격을 조절하여 애니메이션 속도를 설정합니다.',
              },
              {
                title: '크기 조절',
                description: 'GIF의 가로/세로 크기를 픽셀 단위로 설정할 수 있습니다.',
              },
              {
                title: '품질 설정',
                description: '1-20 범위의 품질 설정으로 파일 크기와 화질의 균형을 맞출 수 있습니다.',
              },
            ]}
            faqs={[
              {
                question: '이미지 순서를 어떻게 바꾸나요?',
                answer: '이미지 옆의 화살표 버튼을 사용하거나, 이미지를 드래그하여 순서를 변경할 수 있습니다.',
              },
              {
                question: 'GIF 파일이 너무 큰 경우 어떻게 하나요?',
                answer: 'GIF 크기를 줄이거나 품질 값을 낮추면 파일 크기가 줄어듭니다. 품질 값이 낮을수록 파일이 작아집니다.',
              },
              {
                question: '몇 개의 이미지까지 사용할 수 있나요?',
                answer: '권장 이미지 수는 2-20개입니다. 이미지가 많을수록 생성 시간이 길어지고 파일 크기가 커집니다.',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
