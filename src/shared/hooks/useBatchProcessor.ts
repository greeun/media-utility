import { useState, useCallback } from 'react';
import type { BaseFile } from './useFileManager';

interface UseBatchProcessorOptions<T extends BaseFile> {
  updateFile: (id: string, updates: Partial<T>) => void;
  pendingFiles: T[];
}

export function useBatchProcessor<T extends BaseFile>({
  updateFile,
  pendingFiles,
}: UseBatchProcessorOptions<T>) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAll = useCallback(
    async (
      processFn: (file: T, onProgress: (progress: number) => void) => Promise<Partial<T>>
    ) => {
      setIsProcessing(true);

      for (const file of pendingFiles) {
        updateFile(file.id, { status: 'processing', progress: 0 } as Partial<T>);

        try {
          const onProgress = (progress: number) => {
            updateFile(file.id, { progress } as Partial<T>);
          };

          const result = await processFn(file, onProgress);
          updateFile(file.id, {
            status: 'completed',
            progress: 100,
            ...result,
          } as Partial<T>);
        } catch (error) {
          updateFile(file.id, {
            status: 'error',
            error: (error as Error).message,
          } as Partial<T>);
        }
      }

      setIsProcessing(false);
    },
    [pendingFiles, updateFile]
  );

  return { isProcessing, processAll };
}
