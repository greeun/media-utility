import { useState, useCallback } from 'react';

export interface BaseFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

export function useFileManager<T extends BaseFile>() {
  const [files, setFiles] = useState<T[]>([]);

  const addFiles = useCallback((newFiles: T[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<T>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  }, [files]);

  const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');
  const completedFiles = files.filter((f) => f.status === 'completed');
  const pendingCount = pendingFiles.length;
  const completedCount = completedFiles.length;

  return {
    files,
    setFiles,
    addFiles,
    updateFile,
    removeFile,
    clearAll,
    pendingFiles,
    completedFiles,
    pendingCount,
    completedCount,
  };
}
