'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Download, RefreshCw, Film, Image as ImageIcon, Loader2, Video, Sparkles } from 'lucide-react';
import { VideoConverterIcon } from '@/components/icons/FeatureIcons';
import { videoToGif, gifToMp4, extractFrames } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';
import HowToUse from '@/components/common/HowToUse';

type ConversionMode = 'video-to-gif' | 'gif-to-mp4' | 'video-to-frames';

export default function VideoConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<ConversionMode>('video-to-gif');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | Blob[] | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);

  const [fps, setFps] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [outputWidth, setOutputWidth] = useState(480);

  const [framesFps, setFramesFps] = useState(1);
  const [maxFrames, setMaxFrames] = useState(10);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const processFile = useCallback((selectedFile: File) => {
    const isVideo = selectedFile.type.startsWith('video/');
    const isGif = selectedFile.type === 'image/gif';

    if (isVideo || isGif) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setResultPreview(null);

      if (isGif) {
        setMode('gif-to-mp4');
      } else {
        setMode('video-to-gif');
      }
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

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLoadingFFmpeg(true);
    setProgress(0);

    try {
      let output: Blob | Blob[];

      switch (mode) {
        case 'video-to-gif':
          output = await videoToGif(
            file,
            { fps, startTime, duration, width: outputWidth },
            (p) => {
              setLoadingFFmpeg(false);
              setProgress(p);
            }
          );
          setResult(output);
          setResultPreview(URL.createObjectURL(output));
          break;

        case 'gif-to-mp4':
          output = await gifToMp4(file, {}, (p) => {
            setLoadingFFmpeg(false);
            setProgress(p);
          });
          setResult(output);
          setResultPreview(URL.createObjectURL(output));
          break;

        case 'video-to-frames':
          output = await extractFrames(
            file,
            { fps: framesFps, startTime, duration, maxFrames },
            (p) => {
              setLoadingFFmpeg(false);
              setProgress(p);
            }
          );
          setResult(output);
          break;
      }
    } catch (error) {
      console.error('변환 오류:', error);
      alert('변환 중 오류가 발생했습니다. 다시 시도해주세요.');
    }

    setIsProcessing(false);
    setLoadingFFmpeg(false);
  };

  const handleDownload = () => {
    if (result instanceof Blob) {
      const ext = mode === 'gif-to-mp4' ? 'mp4' : 'gif';
      const filename = `converted.${ext}`;
      saveAs(result, filename);
    }
  };

  const handleDownloadFrame = (blob: Blob, index: number) => {
    saveAs(blob, `frame_${index + 1}.png`);
  };

  const handleDownloadAllFrames = () => {
    if (Array.isArray(result)) {
      result.forEach((blob, index) => {
        saveAs(blob, `frame_${index + 1}.png`);
      });
    }
  };

  const isVideo = file?.type.startsWith('video/');
  const isGif = file?.type === 'image/gif';

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.80_0.18_80)] flex items-center justify-center shadow-[0_0_30px_oklch(0.80_0.18_80/0.3)]">
              <VideoConverterIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">비디오 변환</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">
                비디오를 GIF로, GIF를 MP4로, 비디오에서 프레임 추출
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
                    ? 'border-[oklch(0.80_0.18_80)] bg-[oklch(0.80_0.18_80/0.05)]'
                    : 'border-[oklch(1_0_0/0.1)] hover:border-[oklch(0.80_0.18_80/0.5)] hover:bg-[oklch(0.80_0.18_80/0.02)]'
                  }
                `}
              >
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-[oklch(0.80_0.18_80)]' : 'text-[oklch(0.40_0.02_240)]'}`} />
                <span className={`text-lg font-medium ${isDragging ? 'text-[oklch(0.85_0.22_80)]' : 'text-[oklch(0.70_0.02_240)]'}`}>
                  {isDragging ? '여기에 놓으세요' : '비디오 또는 GIF를 선택하거나 드래그하세요'}
                </span>
                <span className="text-sm text-[oklch(0.50_0.02_240)] mt-2">MP4, WebM, MOV, GIF 지원</span>
                <input
                  type="file"
                  accept="video/*,image/gif"
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
              <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">원본</h3>
                <div className="bg-[oklch(0.12_0.015_250)] rounded-xl overflow-hidden">
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
                <div className="mt-2 text-sm text-[oklch(0.50_0.02_240)]">
                  {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>

              {/* Mode Selection */}
              <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">변환 모드</h3>
                <div className="flex flex-wrap gap-2">
                  {isVideo && (
                    <>
                      <button
                        onClick={() => setMode('video-to-gif')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          mode === 'video-to-gif'
                            ? 'bg-[oklch(0.80_0.18_80)] text-[oklch(0.08_0.01_240)] shadow-[0_0_20px_oklch(0.80_0.18_80/0.3)]'
                            : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        비디오 → GIF
                      </button>
                      <button
                        onClick={() => setMode('video-to-frames')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          mode === 'video-to-frames'
                            ? 'bg-[oklch(0.80_0.18_80)] text-[oklch(0.08_0.01_240)] shadow-[0_0_20px_oklch(0.80_0.18_80/0.3)]'
                            : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        프레임 추출
                      </button>
                    </>
                  )}
                  {isGif && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[oklch(0.80_0.18_80)] text-[oklch(0.08_0.01_240)] shadow-[0_0_20px_oklch(0.80_0.18_80/0.3)]"
                    >
                      <Video className="w-4 h-4" />
                      GIF → MP4
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              {mode === 'video-to-gif' && (
                <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[oklch(0.80_0.18_80)]" />
                    GIF 옵션
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">시작 시간 (초)</label>
                        <input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(Number(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">길이 (초)</label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="1"
                          max="30"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">FPS</label>
                        <input
                          type="number"
                          value={fps}
                          onChange={(e) => setFps(Number(e.target.value))}
                          min="5"
                          max="30"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">너비 (px)</label>
                        <input
                          type="number"
                          value={outputWidth}
                          onChange={(e) => setOutputWidth(Number(e.target.value))}
                          min="100"
                          max="1000"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'video-to-frames' && (
                <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[oklch(0.80_0.18_80)]" />
                    프레임 추출 옵션
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">시작 시간 (초)</label>
                        <input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(Number(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">길이 (초)</label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">초당 프레임 수</label>
                        <input
                          type="number"
                          value={framesFps}
                          onChange={(e) => setFramesFps(Number(e.target.value))}
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[oklch(0.60_0.02_240)] mb-2">최대 프레임 수</label>
                        <input
                          type="number"
                          value={maxFrames}
                          onChange={(e) => setMaxFrames(Number(e.target.value))}
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] focus:outline-none focus:border-[oklch(0.80_0.18_80)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-[oklch(0.80_0.18_80)] text-[oklch(0.08_0.01_240)] font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_oklch(0.80_0.18_80/0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 animate-fade-up"
                style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadingFFmpeg ? 'FFmpeg 로딩 중...' : `변환 중... ${progress}%`}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    변환하기
                  </>
                )}
              </button>

              {/* Progress */}
              {isProcessing && !loadingFFmpeg && (
                <div className="h-1.5 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[oklch(0.80_0.18_80)] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* New File */}
              <label className="block">
                <div className="w-full py-2.5 rounded-xl border border-[oklch(1_0_0/0.1)] text-[oklch(0.70_0.02_240)] font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-[oklch(1_0_0/0.05)] hover:border-[oklch(1_0_0/0.2)] transition-all">
                  <Upload className="w-4 h-4" />
                  다른 파일 선택
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
                <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">결과</h3>
                  <div className="bg-[oklch(0.12_0.015_250)] rounded-xl overflow-hidden">
                    {mode === 'gif-to-mp4' ? (
                      <video src={resultPreview} controls className="w-full max-h-[280px]" />
                    ) : (
                      <img src={resultPreview} alt="Result" className="w-full max-h-[280px] object-contain" />
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-[oklch(0.50_0.02_240)]">
                      크기: {((result.size) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.80_0.18_80)] text-[oklch(0.08_0.01_240)] font-semibold hover:shadow-[0_0_20px_oklch(0.80_0.18_80/0.4)] transition-all"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </button>
                  </div>
                </div>
              )}

              {/* Frames Result */}
              {Array.isArray(result) && result.length > 0 && (
                <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)]">
                      추출된 프레임 <span className="text-[oklch(0.55_0.02_240)] font-normal">({result.length}개)</span>
                    </h3>
                    <button
                      onClick={handleDownloadAllFrames}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[oklch(0.80_0.18_80)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_15px_oklch(0.80_0.18_80/0.3)] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      모두 다운로드
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-[450px] overflow-y-auto">
                    {result.map((blob, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(blob)}
                          alt={`Frame ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDownloadFrame(blob, index)}
                          className="absolute inset-0 bg-[oklch(0.08_0.01_240/0.6)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Download className="w-6 h-6 text-[oklch(0.95_0.01_80)]" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-xs bg-[oklch(0.08_0.01_240/0.8)] text-[oklch(0.95_0.01_80)] px-1.5 py-0.5 rounded font-mono">
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
            title="비디오 변환기"
            description="비디오를 GIF로, GIF를 MP4로 변환하거나 비디오에서 프레임을 추출하세요. FFmpeg WebAssembly로 브라우저에서 직접 처리합니다."
            accentColor="amber"
            steps={[
              {
                number: 1,
                title: '파일 업로드',
                description: '비디오(MP4, WebM, MOV) 또는 GIF 파일을 업로드하세요.',
              },
              {
                number: 2,
                title: '변환 모드 선택',
                description: '비디오→GIF, GIF→MP4, 프레임 추출 중 원하는 모드를 선택하세요.',
              },
              {
                number: 3,
                title: '설정 및 변환',
                description: '옵션을 설정하고 변환 버튼을 클릭하세요. 완료 후 다운로드합니다.',
              },
            ]}
            supportedFormats={['MP4', 'WebM', 'MOV', 'AVI', 'GIF']}
            features={[
              {
                title: '비디오 → GIF',
                description: '비디오의 일부 구간을 GIF 애니메이션으로 변환합니다. 시작 시간, 길이, FPS를 설정할 수 있습니다.',
              },
              {
                title: 'GIF → MP4',
                description: 'GIF 파일을 MP4 비디오로 변환합니다. 소셜 미디어 업로드에 적합합니다.',
              },
              {
                title: '프레임 추출',
                description: '비디오에서 원하는 간격으로 프레임을 이미지로 추출합니다.',
              },
              {
                title: 'FFmpeg WebAssembly',
                description: '브라우저에서 FFmpeg를 실행하여 서버 업로드 없이 변환합니다.',
              },
            ]}
            faqs={[
              {
                question: '처음 사용 시 로딩이 오래 걸리나요?',
                answer: '처음 사용 시 FFmpeg 라이브러리(약 30MB)를 로드합니다. 이후에는 캐시되어 빠르게 시작됩니다.',
              },
              {
                question: '긴 비디오도 변환할 수 있나요?',
                answer: '파일 크기 100MB, 길이 제한은 없지만, 긴 비디오는 처리 시간이 오래 걸릴 수 있습니다.',
              },
              {
                question: 'GIF로 변환하면 파일이 너무 커지는데요?',
                answer: 'GIF는 압축 효율이 낮습니다. FPS를 낮추거나, 출력 크기를 줄이거나, 짧은 구간만 선택하세요.',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
