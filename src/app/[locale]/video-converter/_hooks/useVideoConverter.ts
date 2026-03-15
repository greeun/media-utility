'use client';

import { useState, useCallback, useRef } from 'react';
import { videoToGif, gifToMp4, extractFrames } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';
import type { ConversionMode } from '../_types';

export function useVideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<ConversionMode>('video-to-gif');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | Blob[] | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);

  // video-to-gif 옵션
  const [fps, setFps] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [outputWidth, setOutputWidth] = useState(480);

  // frame extraction 옵션
  const [framesFps, setFramesFps] = useState(1);
  const [maxFrames, setMaxFrames] = useState(10);

  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = file?.type.startsWith('video/') || false;
  const isGif = file?.type === 'image/gif' || false;

  const processFile = useCallback((selectedFile: File) => {
    const fileIsVideo = selectedFile.type.startsWith('video/');
    const fileIsGif = selectedFile.type === 'image/gif';

    if (fileIsVideo || fileIsGif) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setResultPreview(null);

      if (fileIsGif) {
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

    // SharedArrayBuffer 지원 확인
    if (typeof SharedArrayBuffer === 'undefined') {
      console.error('SharedArrayBuffer is not supported. FFmpeg WASM requires SharedArrayBuffer.');
      alert('브라우저가 SharedArrayBuffer를 지원하지 않습니다. 최신 브라우저를 사용하거나 HTTPS로 접속해주세요.');
      return;
    }

    console.log('Starting conversion...', {
      mode,
      file: file.name,
      size: file.size,
      type: file.type,
    });

    setIsProcessing(true);
    setLoadingFFmpeg(true);
    setProgress(0);

    try {
      let output: Blob | Blob[];

      switch (mode) {
        case 'video-to-gif':
          console.log('Converting video to GIF...');
          output = await videoToGif(
            file,
            { fps, startTime, duration, width: outputWidth },
            (p) => {
              setLoadingFFmpeg(false);
              setProgress(p);
              console.log('Progress:', p);
            }
          );
          setResult(output);
          setResultPreview(URL.createObjectURL(output));
          console.log('Video to GIF conversion completed');
          break;

        case 'gif-to-mp4':
          console.log('Converting GIF to MP4...');
          output = await gifToMp4(file, {}, (p) => {
            setLoadingFFmpeg(false);
            setProgress(p);
            console.log('Progress:', p);
          });
          setResult(output);
          setResultPreview(URL.createObjectURL(output));
          console.log('GIF to MP4 conversion completed');
          break;

        case 'video-to-frames':
          console.log('Extracting frames...');
          output = await extractFrames(
            file,
            { fps: framesFps, startTime, duration, maxFrames },
            (p) => {
              setLoadingFFmpeg(false);
              setProgress(p);
              console.log('Progress:', p);
            }
          );
          setResult(output);
          console.log('Frame extraction completed:', output.length, 'frames');
          break;
      }
    } catch (error) {
      console.error('Conversion error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      alert(`변환 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
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

  return {
    // 상태
    file,
    preview,
    mode,
    setMode,
    isProcessing,
    progress,
    result,
    resultPreview,
    loadingFFmpeg,

    // video-to-gif 옵션
    fps,
    setFps,
    startTime,
    setStartTime,
    duration,
    setDuration,
    outputWidth,
    setOutputWidth,

    // frame extraction 옵션
    framesFps,
    setFramesFps,
    maxFrames,
    setMaxFrames,

    // 드래그
    isDragging,

    // refs
    videoRef,

    // computed
    isVideo,
    isGif,

    // 핸들러
    processFile,
    handleFileSelect,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleConvert,
    handleDownload,
    handleDownloadFrame,
    handleDownloadAllFrames,
  };
}
