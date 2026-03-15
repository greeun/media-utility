import { useCallback } from 'react';
import { useFileManager, useBatchProcessor, useDownloader } from '@/hooks';
import { removeImageBackground, generateNewFilename } from '@/services/backgroundRemover';
import type { BackgroundRemovedFile } from '../_types';

export function useBackgroundRemover() {
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
  } = useFileManager<BackgroundRemovedFile>();

  // 배치 프로세서
  const { isProcessing, processAll } = useBatchProcessor<BackgroundRemovedFile>({
    updateFile,
    pendingFiles,
  });

  // 다운로더
  const { downloadFile, downloadAll } = useDownloader({
    generateFilename: useCallback((file) => {
      return generateNewFilename(file.originalName);
    }, []),
  });

  // 파일 선택 핸들러
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      const newFiles: BackgroundRemovedFile[] = selectedFiles
        .filter((file) => file.type.startsWith('image/'))
        .map((file) => ({
          id: crypto.randomUUID(),
          originalFile: file,
          originalName: file.name,
          preview: URL.createObjectURL(file),
          status: 'pending' as const,
          progress: 0,
        }));

      addFiles(newFiles);
    },
    [addFiles]
  );

  // 배경 제거 실행
  const handleProcess = useCallback(() => {
    processAll(async (file, onProgress) => {
      const result = await removeImageBackground(file.originalFile, onProgress);

      return {
        result,
      } as Partial<BackgroundRemovedFile>;
    });
  }, [processAll]);

  // 개별 다운로드
  const handleDownload = useCallback(
    (file: BackgroundRemovedFile) => {
      downloadFile(file);
    },
    [downloadFile]
  );

  // 전체 다운로드
  const handleDownloadAll = useCallback(() => {
    downloadAll(files);
  }, [downloadAll, files]);

  return {
    // 파일 상태
    files,
    pendingCount,
    completedCount,

    // 처리 상태
    isProcessing,

    // 액션
    handleFilesSelected,
    handleProcess,
    handleDownload,
    handleDownloadAll,
    removeFile,
    clearAll,
  };
}
