'use client';

import { useState, useCallback } from 'react';
import { createGifFromImages } from '@/services/gifGenerator';
import { saveAs } from 'file-saver';
import type { ImageItem } from '../_types';

export default function useGifMaker() {
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

  const handleFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      processFiles(files);
    },
    [processFiles],
  );

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

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles],
  );

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
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const files = images.map((img) => img.file);
      const result = await createGifFromImages(
        files,
        { width, height, delay, quality },
        (p) => setProgress(p),
      );

      setResultGif(result);
      setResultPreview(URL.createObjectURL(result));
    } catch (error) {
      console.error('GIF 생성 오류:', error);
    }

    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (resultGif) {
      saveAs(resultGif, 'animation.gif');
    }
  };

  return {
    // 상태
    images,
    isGenerating,
    progress,
    resultGif,
    resultPreview,
    width,
    height,
    delay,
    quality,
    isDragging,

    // 설정 변경
    setWidth,
    setHeight,
    setDelay,
    setQuality,

    // 액션
    handleFilesSelected,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    removeImage,
    clearAll,
    moveImage,
    handleGenerate,
    handleDownload,
  };
}
