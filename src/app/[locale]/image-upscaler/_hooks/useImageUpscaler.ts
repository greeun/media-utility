'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import { useDownloader } from '@/hooks/useDownloader';
import { upscaleImage } from '@/services/imageUpscaler';
import type { UpscaleFile } from '../_types';

export function useImageUpscaler() {
  const {
    files,
    addFiles,
    updateFile,
    removeFile: baseRemoveFile,
    clearAll: baseClearAll,
    pendingCount,
    completedCount,
  } = useFileManager<UpscaleFile>();

  const [scale, setScale] = useState<2 | 3 | 4>(2);
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [isProcessing, setIsProcessing] = useState(false);

  // 비교 슬라이더
  const compareRef = useRef<HTMLDivElement>(null);
  const [comparePosition, setComparePosition] = useState(50);

  const firstCompleted = files.find((f) => f.status === 'completed');

  // 다운로더
  const { downloadFile, downloadAll } = useDownloader({
    generateFilename: (file) => {
      const baseName =
        file.originalName.substring(0, file.originalName.lastIndexOf('.')) ||
        file.originalName;
      return `${baseName}_${scale}x.${format}`;
    },
  });

  // 파일 선택 핸들러
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      const newFiles: UpscaleFile[] = selectedFiles
        .filter((f) => f.type.startsWith('image/'))
        .map((f) => ({
          id: crypto.randomUUID(),
          originalFile: f,
          originalName: f.name,
          preview: URL.createObjectURL(f),
          status: 'pending' as const,
          progress: 0,
          originalSize: { width: 0, height: 0 },
        }));

      // 원본 크기 측정
      newFiles.forEach((nf) => {
        const img = new Image();
        img.onload = () => {
          updateFile(nf.id, {
            originalSize: { width: img.naturalWidth, height: img.naturalHeight },
          } as Partial<UpscaleFile>);
        };
        img.src = nf.preview;
      });

      addFiles(newFiles);
    },
    [addFiles, updateFile]
  );

  // 파일 제거 (resultUrl도 해제)
  const removeFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file?.resultUrl) URL.revokeObjectURL(file.resultUrl);
      baseRemoveFile(id);
    },
    [files, baseRemoveFile]
  );

  // 전체 삭제 (resultUrl도 해제)
  const clearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    baseClearAll();
  }, [files, baseClearAll]);

  // 업스케일 처리
  const handleUpscale = useCallback(async () => {
    setIsProcessing(true);
    const pending = files.filter(
      (f) => f.status === 'pending' || f.status === 'error'
    );

    for (const file of pending) {
      updateFile(file.id, {
        status: 'processing',
        progress: 0,
      } as Partial<UpscaleFile>);

      try {
        const result = await upscaleImage(
          file.originalFile,
          { scale, format },
          (p) => updateFile(file.id, { progress: p } as Partial<UpscaleFile>)
        );
        const resultUrl = URL.createObjectURL(result);
        updateFile(file.id, {
          status: 'completed',
          progress: 100,
          result,
          resultUrl,
        } as Partial<UpscaleFile>);
      } catch (error) {
        updateFile(file.id, {
          status: 'error',
          error: (error as Error).message,
        } as Partial<UpscaleFile>);
      }
    }
    setIsProcessing(false);
  }, [files, scale, format, updateFile]);

  // 개별 다운로드
  const handleDownload = useCallback(
    (file: UpscaleFile) => {
      downloadFile(file);
    },
    [downloadFile]
  );

  // 전체 다운로드
  const handleDownloadAll = useCallback(() => {
    downloadAll(files);
  }, [downloadAll, files]);

  // 비교 슬라이더 핸들러
  const handleCompareMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!compareRef.current) return;
      const rect = compareRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setComparePosition(Math.max(0, Math.min(100, x)));
    },
    []
  );

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // 상태
    files,
    scale,
    format,
    isProcessing,
    compareRef,
    comparePosition,
    firstCompleted,
    pendingCount,
    completedCount,

    // 액션
    setScale,
    setFormat,
    handleFilesSelected,
    removeFile,
    clearAll,
    handleUpscale,
    handleDownload,
    handleDownloadAll,
    handleCompareMove,
  };
}
