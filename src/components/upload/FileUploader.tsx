'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, FileImage, FileVideo } from 'lucide-react';

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // MB
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploader({
  accept = 'image/*,video/*',
  multiple = true,
  maxFiles = 10,
  maxSize = 100, // 100MB
  onFilesSelected,
}: FileUploaderProps) {
  const t = useTranslations('common');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null);

      if (files.length > maxFiles) {
        setError(t('maxFilesError', { count: maxFiles }));
        return files.slice(0, maxFiles);
      }

      const validFiles = files.filter((file) => {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSize) {
          setError(t('fileSizeError', { size: maxSize }));
          return false;
        }
        return true;
      });

      return validFiles;
    },
    [maxFiles, maxSize, t]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [validateFiles, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      e.target.value = '';
    },
    [validateFiles, onFilesSelected]
  );

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
          isDragging
            ? 'border-[oklch(0.75_0.18_195)] bg-[oklch(0.75_0.18_195/0.05)]'
            : 'border-[oklch(1_0_0/0.1)] hover:border-[oklch(0.75_0.18_195/0.5)] hover:bg-[oklch(0.75_0.18_195/0.02)]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-[oklch(0.75_0.18_195/0.15)]' : 'bg-[oklch(0.16_0.02_245)]'}`}>
            <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-[oklch(0.75_0.18_195)]' : 'text-[oklch(0.45_0.02_240)]'}`} />
          </div>

          <div className="text-center">
            <p className={`text-lg font-medium transition-colors ${isDragging ? 'text-[oklch(0.80_0.20_195)]' : 'text-[oklch(0.85_0.02_240)]'}`}>
              {t('dragOrClick')}
            </p>
            <p className="text-sm text-[oklch(0.55_0.02_240)] mt-1">
              {t('maxFiles', { count: maxFiles, size: maxSize })}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[oklch(0.45_0.02_240)]">
            <span className="flex items-center gap-1">
              <FileImage className="w-4 h-4" />
              {t('image')}
            </span>
            <span className="flex items-center gap-1">
              <FileVideo className="w-4 h-4" />
              {t('video')}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-[oklch(0.65_0.22_25)] text-sm">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
