'use client';

import { useState, useCallback } from 'react';
import { Link2, Upload, Copy, Check, Download, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { fileToDataUrl, fileToBlobUrl, copyToClipboard, formatFileSize, getDataUrlSize } from '@/services/urlGenerator';

interface GeneratedUrl {
  id: string;
  file: File;
  preview: string;
  dataUrl?: string;
  blobUrl?: string;
  type: 'image' | 'video';
}

export default function UrlGeneratorPage() {
  const [files, setFiles] = useState<GeneratedUrl[]>([]);
  const [urlType, setUrlType] = useState<'base64' | 'blob'>('base64');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFilesSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );

    setIsGenerating(true);

    const newItems: GeneratedUrl[] = await Promise.all(
      validFiles.map(async (file) => {
        const isImage = file.type.startsWith('image/');
        const item: GeneratedUrl = {
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          type: isImage ? 'image' : 'video',
        };

        // Base64 URL 생성
        try {
          item.dataUrl = await fileToDataUrl(file);
        } catch (error) {
          console.error('Data URL 생성 오류:', error);
        }

        // Blob URL 생성
        item.blobUrl = fileToBlobUrl(file);

        return item;
      })
    );

    setFiles((prev) => [...prev, ...newItems]);
    setIsGenerating(false);
  }, []);

  const handleCopy = async (item: GeneratedUrl) => {
    const url = urlType === 'base64' ? item.dataUrl : item.blobUrl;
    if (url) {
      const success = await copyToClipboard(url);
      if (success) {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    }
  };

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        if (item.blobUrl) {
          URL.revokeObjectURL(item.blobUrl);
        }
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      URL.revokeObjectURL(f.preview);
      if (f.blobUrl) {
        URL.revokeObjectURL(f.blobUrl);
      }
    });
    setFiles([]);
  }, [files]);

  const getUrl = (item: GeneratedUrl) => {
    return urlType === 'base64' ? item.dataUrl : item.blobUrl;
  };

  const getUrlSize = (item: GeneratedUrl) => {
    if (urlType === 'base64' && item.dataUrl) {
      return formatFileSize(getDataUrlSize(item.dataUrl));
    }
    return formatFileSize(item.file.size);
  };

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500 rounded-2xl mb-4">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">URL 생성</h1>
          <p className="mt-2 text-gray-600">
            이미지나 비디오를 공유 가능한 URL로 변환하세요
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">파일 선택</span>
            <span className="text-xs text-gray-500">이미지 또는 비디오</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>
        </div>

        {/* URL Type Selection */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">URL 유형</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setUrlType('base64')}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                  urlType === 'base64'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">Base64 Data URL</h3>
                <p className="text-sm text-gray-500 mt-1">
                  파일 데이터가 URL에 포함됨. 어디서든 사용 가능
                </p>
              </button>
              <button
                onClick={() => setUrlType('blob')}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                  urlType === 'blob'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">Blob URL</h3>
                <p className="text-sm text-gray-500 mt-1">
                  짧은 임시 URL. 현재 브라우저 세션에서만 유효
                </p>
              </button>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                생성된 URL ({files.length}개)
              </h2>
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                전체 삭제
              </button>
            </div>

            <div className="space-y-4">
              {files.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.preview}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Video className="w-4 h-4 text-gray-400" />
                        )}
                        <p className="font-medium text-gray-900 truncate">
                          {item.file.name}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        원본: {formatFileSize(item.file.size)}
                        {urlType === 'base64' && (
                          <span className="ml-2">
                            | URL 크기: {getUrlSize(item)}
                          </span>
                        )}
                      </p>

                      {/* URL Preview */}
                      <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                        <code className="text-xs text-gray-600 break-all line-clamp-2">
                          {getUrl(item)?.substring(0, 200)}
                          {(getUrl(item)?.length || 0) > 200 && '...'}
                        </code>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleCopy(item)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                          copiedId === item.id
                            ? 'bg-green-500 text-white'
                            : 'bg-pink-500 text-white hover:bg-pink-600'
                        }`}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            복사
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => removeFile(item.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">URL 유형 설명</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>Base64 Data URL:</strong> 파일 데이터가 URL에 직접 포함됩니다.
              HTML, CSS, 이메일 등 어디서든 사용 가능하지만 파일 크기가 커집니다.
            </li>
            <li>
              <strong>Blob URL:</strong> 브라우저가 생성하는 임시 URL입니다.
              현재 브라우저 세션에서만 유효하며, 탭을 닫으면 무효화됩니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
