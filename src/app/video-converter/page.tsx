'use client';

import { useState, useCallback, useRef } from 'react';
import { Video, Upload, Download, RefreshCw, Film, Image as ImageIcon } from 'lucide-react';
import { videoToGif, gifToMp4, extractFrames } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';

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

  // Video to GIF options
  const [fps, setFps] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [outputWidth, setOutputWidth] = useState(480);

  // Frames options
  const [framesFps, setFramesFps] = useState(1);
  const [maxFrames, setMaxFrames] = useState(10);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
    }
  }, []);

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
    <div className="min-h-full bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">비디오 변환</h1>
          <p className="mt-2 text-gray-600">
            비디오를 GIF로, GIF를 MP4로, 비디오에서 프레임 추출
          </p>
        </div>

        {/* Upload Area */}
        {!preview && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700">비디오 또는 GIF 선택</span>
              <span className="text-sm text-gray-500 mt-1">MP4, WebM, MOV, GIF 지원</span>
              <input
                type="file"
                accept="video/*,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Editor */}
        {preview && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Preview & Options */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">원본</h2>
                <div className="bg-gray-100 rounded-xl overflow-hidden">
                  {isVideo ? (
                    <video
                      ref={videoRef}
                      src={preview}
                      controls
                      className="w-full max-h-[300px]"
                    />
                  ) : (
                    <img src={preview} alt="GIF Preview" className="w-full max-h-[300px] object-contain" />
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>

              {/* Mode Selection */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">변환 모드</h2>
                <div className="flex flex-wrap gap-2">
                  {isVideo && (
                    <>
                      <button
                        onClick={() => setMode('video-to-gif')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          mode === 'video-to-gif' ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        비디오 → GIF
                      </button>
                      <button
                        onClick={() => setMode('video-to-frames')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          mode === 'video-to-frames' ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        프레임 추출
                      </button>
                    </>
                  )}
                  {isGif && (
                    <button
                      onClick={() => setMode('gif-to-mp4')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        mode === 'gif-to-mp4' ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      GIF → MP4
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              {mode === 'video-to-gif' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">GIF 옵션</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간 (초)</label>
                        <input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(Number(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">길이 (초)</label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="1"
                          max="30"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">FPS</label>
                        <input
                          type="number"
                          value={fps}
                          onChange={(e) => setFps(Number(e.target.value))}
                          min="5"
                          max="30"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">너비 (px)</label>
                        <input
                          type="number"
                          value={outputWidth}
                          onChange={(e) => setOutputWidth(Number(e.target.value))}
                          min="100"
                          max="1000"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'video-to-frames' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">프레임 추출 옵션</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간 (초)</label>
                        <input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(Number(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">길이 (초)</label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">초당 프레임 수</label>
                        <input
                          type="number"
                          value={framesFps}
                          onChange={(e) => setFramesFps(Number(e.target.value))}
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">최대 프레임 수</label>
                        <input
                          type="number"
                          value={maxFrames}
                          onChange={(e) => setMaxFrames(Number(e.target.value))}
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 border rounded-lg"
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
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    {loadingFFmpeg ? 'FFmpeg 로딩 중...' : `변환 중... ${progress}%`}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    변환하기
                  </>
                )}
              </button>

              {/* New File */}
              <label className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">
                다른 파일 선택
                <input
                  type="file"
                  accept="video/*,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Right: Result */}
            <div className="space-y-6">
              {/* Single Result (GIF or MP4) */}
              {resultPreview && result instanceof Blob && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">결과</h2>
                  <div className="bg-gray-100 rounded-xl overflow-hidden">
                    {mode === 'gif-to-mp4' ? (
                      <video src={resultPreview} controls className="w-full max-h-[300px]" />
                    ) : (
                      <img src={resultPreview} alt="Result" className="w-full max-h-[300px] object-contain" />
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      크기: {((result.size) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </button>
                  </div>
                </div>
              )}

              {/* Frames Result */}
              {Array.isArray(result) && result.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      추출된 프레임 ({result.length}개)
                    </h2>
                    <button
                      onClick={handleDownloadAllFrames}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      모두 다운로드
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
                    {result.map((blob, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(blob)}
                          alt={`Frame ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDownloadFrame(blob, index)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Download className="w-6 h-6 text-white" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">
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
      </div>
    </div>
  );
}
