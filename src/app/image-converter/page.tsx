'use client';

import { useState, useCallback } from 'react';
import { Image as ImageIcon, Download, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import FileUploader from '@/components/upload/FileUploader';
import ProgressBar from '@/components/common/ProgressBar';
import { convertImage, generateNewFilename } from '@/services/imageConverter';
import { convertHeicToJpg, isHeicFile } from '@/services/heicConverter';
import { saveAs } from 'file-saver';

interface ConvertedFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

const OUTPUT_FORMATS = [
  { value: 'jpg', label: 'JPG', mime: 'image/jpeg' },
  { value: 'png', label: 'PNG', mime: 'image/png' },
  { value: 'webp', label: 'WebP', mime: 'image/webp' },
];

export default function ImageConverterPage() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: ConvertedFile[] = selectedFiles
      .filter((file) => file.type.startsWith('image/') || isHeicFile(file))
      .map((file) => ({
        id: crypto.randomUUID(),
        originalFile: file,
        originalName: file.name,
        preview: URL.createObjectURL(file),
        targetFormat,
        status: 'pending' as const,
        progress: 0,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, [targetFormat]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  }, [files]);

  const convertFile = async (file: ConvertedFile): Promise<Blob> => {
    // HEIC 파일 처리
    if (isHeicFile(file.originalFile)) {
      return convertHeicToJpg(
        file.originalFile,
        { quality: quality / 100, toType: targetFormat === 'png' ? 'image/png' : 'image/jpeg' },
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }
      );
    }

    // 일반 이미지 변환
    return convertImage(
      file.originalFile,
      { format: targetFormat, quality: quality / 100 },
      (progress) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
        );
      }
    );
  };

  const handleConvert = async () => {
    setIsConverting(true);
    const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f))
      );

      try {
        const result = await convertFile(file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'completed', progress: 100, result, targetFormat }
              : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error', error: (error as Error).message }
              : f
          )
        );
      }
    }

    setIsConverting(false);
  };

  const handleDownload = (file: ConvertedFile) => {
    if (file.result) {
      const newFilename = generateNewFilename(file.originalName, file.targetFormat);
      saveAs(file.result, newFilename);
    }
  };

  const handleDownloadAll = () => {
    const completedFiles = files.filter((f) => f.status === 'completed' && f.result);
    completedFiles.forEach((file) => {
      if (file.result) {
        const newFilename = generateNewFilename(file.originalName, file.targetFormat);
        saveAs(file.result, newFilename);
      }
    });
  };

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">이미지 변환</h1>
          <p className="mt-2 text-gray-600">
            PNG, JPG, WebP, HEIC 등 다양한 이미지 포맷을 변환하세요
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <FileUploader
            accept="image/*,.heic,.heif"
            multiple={true}
            maxFiles={20}
            maxSize={50}
            onFilesSelected={handleFilesSelected}
          />
        </div>

        {/* Options */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">변환 옵션</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출력 포맷
                </label>
                <div className="flex gap-2">
                  {OUTPUT_FORMATS.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setTargetFormat(format.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        targetFormat === format.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  품질: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                파일 목록 ({files.length}개)
              </h2>
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                전체 삭제
              </button>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {!isHeicFile(file.originalFile) ? (
                      <img
                        src={file.preview}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        HEIC
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.originalFile.size / 1024).toFixed(1)} KB
                      {file.status === 'completed' && file.result && (
                        <span className="text-green-600 ml-2">
                          → {(file.result.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </p>
                    {(file.status === 'processing' || file.status === 'completed') && (
                      <div className="mt-2">
                        <ProgressBar progress={file.progress} status={file.status} />
                      </div>
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {file.error}
                      </p>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {pendingCount > 0 && (
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    변환 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    {pendingCount}개 변환하기
                  </>
                )}
              </button>
            )}
            {completedCount > 0 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                {completedCount}개 모두 다운로드
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
