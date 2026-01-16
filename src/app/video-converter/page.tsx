'use client';

import { useState, useCallback, useRef } from 'react';
import { Video, Upload, Download, RefreshCw, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import { videoToGif, gifToMp4, extractFrames } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

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
    <div className="min-h-full bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-lg mb-4">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">비디오 변환</h1>
          <p className="mt-1 text-slate-600">
            비디오를 GIF로, GIF를 MP4로, 비디오에서 프레임 추출
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
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className={`text-lg font-medium ${isDragging ? 'text-amber-600' : 'text-slate-700'}`}>
                  {isDragging ? '여기에 놓으세요' : '비디오 또는 GIF를 선택하거나 드래그하세요'}
                </span>
                <span className="text-sm text-slate-500 mt-1">MP4, WebM, MOV, GIF 지원</span>
                <input
                  type="file"
                  accept="video/*,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>
        )}

        {/* Editor */}
        {preview && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Preview & Options */}
            <div className="space-y-4">
              {/* Preview */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">원본</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-slate-100 rounded-lg overflow-hidden">
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
                  <div className="mt-2 text-sm text-slate-500">
                    {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                </CardContent>
              </Card>

              {/* Mode Selection */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">변환 모드</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {isVideo && (
                      <>
                        <Button
                          variant={mode === 'video-to-gif' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMode('video-to-gif')}
                          className={mode === 'video-to-gif' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                        >
                          <Film className="w-4 h-4 mr-1.5" />
                          비디오 → GIF
                        </Button>
                        <Button
                          variant={mode === 'video-to-frames' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMode('video-to-frames')}
                          className={mode === 'video-to-frames' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                        >
                          <ImageIcon className="w-4 h-4 mr-1.5" />
                          프레임 추출
                        </Button>
                      </>
                    )}
                    {isGif && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Video className="w-4 h-4 mr-1.5" />
                        GIF → MP4
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Options */}
              {mode === 'video-to-gif' && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">GIF 옵션</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 mb-2 block">시작 시간 (초)</Label>
                        <Input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(Number(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 mb-2 block">길이 (초)</Label>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="1"
                          max="30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 mb-2 block">FPS</Label>
                        <Input
                          type="number"
                          value={fps}
                          onChange={(e) => setFps(Number(e.target.value))}
                          min="5"
                          max="30"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 mb-2 block">너비 (px)</Label>
                        <Input
                          type="number"
                          value={outputWidth}
                          onChange={(e) => setOutputWidth(Number(e.target.value))}
                          min="100"
                          max="1000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mode === 'video-to-frames' && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">프레임 추출 옵션</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 mb-2 block">시작 시간 (초)</Label>
                        <Input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(Number(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 mb-2 block">길이 (초)</Label>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 mb-2 block">초당 프레임 수</Label>
                        <Input
                          type="number"
                          value={framesFps}
                          onChange={(e) => setFramesFps(Number(e.target.value))}
                          min="1"
                          max="10"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 mb-2 block">최대 프레임 수</Label>
                        <Input
                          type="number"
                          value={maxFrames}
                          onChange={(e) => setMaxFrames(Number(e.target.value))}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Convert Button */}
              <Button
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleConvert}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {loadingFFmpeg ? 'FFmpeg 로딩 중...' : `변환 중... ${progress}%`}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    변환하기
                  </>
                )}
              </Button>

              {/* Progress */}
              {isProcessing && !loadingFFmpeg && (
                <Progress value={progress} variant="default" />
              )}

              {/* New File */}
              <label className="block">
                <Button variant="outline" className="w-full cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    다른 파일 선택
                  </span>
                </Button>
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
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">결과</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-slate-100 rounded-lg overflow-hidden">
                      {mode === 'gif-to-mp4' ? (
                        <video src={resultPreview} controls className="w-full max-h-[280px]" />
                      ) : (
                        <img src={resultPreview} alt="Result" className="w-full max-h-[280px] object-contain" />
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        크기: {((result.size) / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <Button
                        onClick={handleDownload}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Frames Result */}
              {Array.isArray(result) && result.length > 0 && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        추출된 프레임 ({result.length}개)
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={handleDownloadAllFrames}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        모두 다운로드
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
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
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                          >
                            <Download className="w-6 h-6 text-white" />
                          </button>
                          <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
