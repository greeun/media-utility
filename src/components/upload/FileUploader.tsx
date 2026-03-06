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
        className={`relative border-4 border-dashed bg-white p-12 transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-[#EC4899] bg-[#EC4899]/5'
            : 'border-black hover:border-[#EC4899] hover:bg-gray-50'
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

        <div className="flex flex-col items-center justify-center gap-6">
          <div className={`p-6 border-4 border-current transition-colors ${isDragging ? 'text-[#EC4899]' : 'text-black'}`}>
            <Upload className="w-10 h-10" strokeWidth={2.5} />
          </div>

          <div className="text-center">
            <p className={`text-xl font-black uppercase tracking-wide transition-colors ${isDragging ? 'text-[#EC4899]' : 'text-black'}`}>
              {t('dragOrClick')}
            </p>
            <p className="text-sm font-bold text-gray-600 mt-2">
              {t('maxFiles', { count: maxFiles, size: maxSize })}
            </p>
          </div>

          {/* File type indicators based on accept prop */}
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
            {accept.includes('image') && (
              <span className="flex items-center gap-2">
                <FileImage className="w-5 h-5" strokeWidth={2.5} />
                {t('image')}
              </span>
            )}
            {accept.includes('video') && (
              <span className="flex items-center gap-2">
                <FileVideo className="w-5 h-5" strokeWidth={2.5} />
                {t('video')}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-black text-white border-4 border-black">
          <X className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}
    </div>
  );
}
