'use client';

import { useCallback, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null);

      if (files.length > maxFiles) {
        setError(`최대 ${maxFiles}개의 파일만 선택할 수 있습니다.`);
        return files.slice(0, maxFiles);
      }

      const validFiles = files.filter((file) => {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSize) {
          setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
          return false;
        }
        return true;
      });

      return validFiles;
    },
    [maxFiles, maxSize]
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
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
          <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-sm text-gray-500 mt-1">
              최대 {maxFiles}개, 파일당 {maxSize}MB까지
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FileImage className="w-4 h-4" />
              이미지
            </span>
            <span className="flex items-center gap-1">
              <FileVideo className="w-4 h-4" />
              비디오
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
