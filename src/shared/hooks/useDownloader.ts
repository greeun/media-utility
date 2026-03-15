import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import type { BaseFile } from './useFileManager';

interface UseDownloaderOptions {
  generateFilename: (file: BaseFile) => string;
}

export function useDownloader({ generateFilename }: UseDownloaderOptions) {
  const downloadFile = useCallback(
    (file: BaseFile) => {
      if (file.result) {
        saveAs(file.result, generateFilename(file));
      }
    },
    [generateFilename]
  );

  const downloadAll = useCallback(
    (files: BaseFile[]) => {
      const completed = files.filter((f) => f.status === 'completed' && f.result);
      completed.forEach(downloadFile);
    },
    [downloadFile]
  );

  return { downloadFile, downloadAll };
}
