import { useState, useCallback, useMemo } from 'react';
import { useFileManager, useBatchProcessor, useDownloader } from '@/hooks';
import { compressImage } from '@/services/imageCompressor';
import type { CompressedFile } from '../_types';

export function useImageCompressor() {
  // 파일 관리
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
  } = useFileManager<CompressedFile>();

  // 압축 옵션 상태
  const [quality, setQuality] = useState(80);
  const [maxSizeMB, setMaxSizeMB] = useState<number | undefined>(undefined);
  const [useMaxSize, setUseMaxSize] = useState(false);

  // 배치 프로세서
  const { isProcessing, processAll } = useBatchProcessor<CompressedFile>({
    updateFile,
    pendingFiles,
  });

  // 다운로더
  const { downloadFile, downloadAll } = useDownloader({
    generateFilename: useCallback((file) => {
      const ext = file.originalName.split('.').pop() || 'jpg';
      const baseName =
        file.originalName.substring(0, file.originalName.lastIndexOf('.')) ||
        file.originalName;
      return `${baseName}_compressed.${ext}`;
    }, []),
  });

  // 파일 선택 핸들러
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      const newFiles: CompressedFile[] = selectedFiles
        .filter((file) => file.type.startsWith('image/'))
        .map((file) => ({
          id: crypto.randomUUID(),
          originalFile: file,
          originalName: file.name,
          preview: URL.createObjectURL(file),
          status: 'pending' as const,
          progress: 0,
          originalSize: file.size,
        }));

      addFiles(newFiles);
    },
    [addFiles]
  );

  // 압축 실행
  const handleCompress = useCallback(() => {
    processAll(async (file, onProgress) => {
      const result = await compressImage(
        file.originalFile,
        {
          quality: quality / 100,
          maxSizeMB: useMaxSize ? maxSizeMB : undefined,
        },
        onProgress
      );

      return {
        result: result.blob,
        compressedSize: result.compressedSize,
        ratio: result.ratio,
      } as Partial<CompressedFile>;
    });
  }, [processAll, quality, useMaxSize, maxSizeMB]);

  // 개별 다운로드
  const handleDownload = useCallback(
    (file: CompressedFile) => {
      downloadFile(file);
    },
    [downloadFile]
  );

  // 전체 다운로드
  const handleDownloadAll = useCallback(() => {
    downloadAll(files);
  }, [downloadAll, files]);

  // 전체 통계 계산
  const stats = useMemo(() => {
    const totalOriginalSize = completedFiles.reduce(
      (sum, f) => sum + f.originalSize,
      0
    );
    const totalCompressedSize = completedFiles.reduce(
      (sum, f) => sum + (f.compressedSize || 0),
      0
    );
    const totalRatio =
      totalOriginalSize > 0
        ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100)
        : 0;

    return { totalOriginalSize, totalCompressedSize, totalRatio };
  }, [completedFiles]);

  return {
    // 파일 상태
    files,
    pendingCount,
    completedCount,

    // 압축 옵션
    quality,
    setQuality,
    maxSizeMB,
    setMaxSizeMB,
    useMaxSize,
    setUseMaxSize,

    // 처리 상태
    isProcessing,

    // 액션
    handleFilesSelected,
    handleCompress,
    handleDownload,
    handleDownloadAll,
    removeFile,
    clearAll,

    // 통계
    stats,
  };
}
