'use client';

// 이미지 변환기 비즈니스 로직 훅

import { useState, useCallback } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import { useBatchProcessor } from '@/hooks/useBatchProcessor';
import { convertImage, convertSvgToRaster, isSvgFile, generateNewFilename } from '@/services/imageConverter';
import { convertHeicToJpg, isHeicFile } from '@/services/heicConverter';
import { convertPsdToImage, isPsdFile } from '@/services/psdConverter';
import { convertRawToImage, isRawFile } from '@/services/rawConverter';
import { saveAs } from 'file-saver';
import type { ConvertedFile } from '../_types';

export function useImageConverter() {
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [quality, setQuality] = useState(90);

  const {
    files,
    addFiles,
    updateFile,
    removeFile,
    clearAll,
    pendingFiles,
    completedFiles,
    pendingCount,
    completedCount,
  } = useFileManager<ConvertedFile>();

  // 파일 변환 처리 함수
  const convertFile = useCallback(
    async (file: ConvertedFile, onProgress: (progress: number) => void): Promise<Partial<ConvertedFile>> => {
      let result: Blob;

      if (isHeicFile(file.originalFile)) {
        // HEIC 파일 변환
        result = await convertHeicToJpg(
          file.originalFile,
          { quality: quality / 100, toType: targetFormat === 'png' ? 'image/png' : 'image/jpeg' },
          onProgress
        );
      } else if (isSvgFile(file.originalFile)) {
        // SVG 파일 래스터 변환
        result = await convertSvgToRaster(
          file.originalFile,
          { format: targetFormat, quality: quality / 100 },
          onProgress
        );
      } else if (isPsdFile(file.originalFile)) {
        // PSD 파일 변환
        result = await convertPsdToImage(
          file.originalFile,
          targetFormat as 'png' | 'jpg' | 'webp',
          { quality: quality / 100 },
          onProgress
        );
      } else if (isRawFile(file.originalFile)) {
        // RAW 파일 변환
        const rawResult = await convertRawToImage(
          file.originalFile,
          { format: targetFormat as 'png' | 'jpg' | 'webp', quality: quality / 100 },
          onProgress
        );
        result = rawResult.blob;
      } else {
        // 일반 이미지 변환
        result = await convertImage(
          file.originalFile,
          { format: targetFormat, quality: quality / 100 },
          onProgress
        );
      }

      return { result, targetFormat };
    },
    [targetFormat, quality]
  );

  const { isProcessing, processAll } = useBatchProcessor<ConvertedFile>({
    updateFile,
    pendingFiles,
  });

  // 파일 선택 핸들러
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      const newFiles: ConvertedFile[] = selectedFiles
        .filter(
          (file) =>
            file.type.startsWith('image/') ||
            isHeicFile(file) ||
            isSvgFile(file) ||
            isPsdFile(file) ||
            isRawFile(file)
        )
        .map((file) => ({
          id: crypto.randomUUID(),
          originalFile: file,
          originalName: file.name,
          preview: URL.createObjectURL(file),
          targetFormat,
          status: 'pending' as const,
          progress: 0,
        }));

      addFiles(newFiles);
    },
    [targetFormat, addFiles]
  );

  // 변환 실행 핸들러
  const handleConvert = useCallback(() => {
    processAll(convertFile);
  }, [processAll, convertFile]);

  // 단일 파일 다운로드
  const handleDownload = useCallback((file: ConvertedFile) => {
    if (file.result) {
      const newFilename = generateNewFilename(file.originalName, file.targetFormat);
      saveAs(file.result, newFilename);
    }
  }, []);

  // 전체 파일 다운로드
  const handleDownloadAll = useCallback(() => {
    completedFiles.forEach((file) => {
      if (file.result) {
        const newFilename = generateNewFilename(file.originalName, file.targetFormat);
        saveAs(file.result, newFilename);
      }
    });
  }, [completedFiles]);

  return {
    // 상태
    files,
    targetFormat,
    quality,
    isConverting: isProcessing,
    pendingCount,
    completedCount,

    // 상태 변경
    setTargetFormat,
    setQuality,

    // 핸들러
    handleFilesSelected,
    removeFile,
    clearAll,
    handleConvert,
    handleDownload,
    handleDownloadAll,
  };
}
