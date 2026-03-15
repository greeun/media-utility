'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GeneratedUrl, UrlType, StorageInfo } from '../_types';
import {
  fileToDataUrl,
  fileToBlobUrl,
  copyToClipboard,
  formatFileSize,
  getDataUrlSize,
  uploadToR2,
  getStorageInfo,
} from '@/services/urlGenerator';

export function useUrlGenerator() {
  const [files, setFiles] = useState<GeneratedUrl[]>([]);
  const [urlType, setUrlType] = useState<UrlType>('base64');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // R2 옵션
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 저장소 정보
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  useEffect(() => {
    const fetchStorageInfo = async () => {
      if (urlType !== 'r2') return;

      try {
        const info = await getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Storage info fetch failed:', error);
      }
    };

    fetchStorageInfo();
  }, [urlType]);

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

        try {
          item.dataUrl = await fileToDataUrl(file);
        } catch (error) {
          console.error('Data URL creation error:', error);
        }

        item.blobUrl = fileToBlobUrl(file);

        return item;
      })
    );

    setFiles((prev) => [...prev, ...newItems]);
    setIsGenerating(false);
  }, []);

  const handleR2Upload = useCallback(async (item: GeneratedUrl) => {
    if (item.r2Url || item.r2Uploading) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === item.id ? { ...f, r2Uploading: true, r2Progress: 0, r2Error: undefined } : f
      )
    );

    try {
      const { url, expiresAt, hasPassword } = await uploadToR2(item.file, {
        expiresInDays,
        password: usePassword ? password : undefined,
        onProgress: (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, r2Progress: progress } : f))
          );
        },
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, r2Url: url, r2Uploading: false, r2Progress: 100, r2ExpiresAt: expiresAt, r2HasPassword: hasPassword }
            : f
        )
      );

      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('R2 upload error:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, r2Uploading: false, r2Error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      );
    }
  }, [expiresInDays, usePassword, password]);

  const handleCopy = useCallback(async (item: GeneratedUrl) => {
    let url: string | undefined;

    if (urlType === 'base64') {
      url = item.dataUrl;
    } else if (urlType === 'blob') {
      url = item.blobUrl;
    } else if (urlType === 'r2') {
      if (!item.r2Url && !item.r2Uploading) {
        await handleR2Upload(item);
        return;
      }
      url = item.r2Url;
    }

    if (url) {
      const success = await copyToClipboard(url);
      if (success) {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    }
  }, [urlType, handleR2Upload]);

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

  const getUrl = useCallback((item: GeneratedUrl) => {
    if (urlType === 'base64') return item.dataUrl;
    if (urlType === 'blob') return item.blobUrl;
    if (urlType === 'r2') return item.r2Url;
    return undefined;
  }, [urlType]);

  const getUrlSize = useCallback((item: GeneratedUrl) => {
    if (urlType === 'base64' && item.dataUrl) {
      return formatFileSize(getDataUrlSize(item.dataUrl));
    }
    return formatFileSize(item.file.size);
  }, [urlType]);

  const uploadAllToR2 = useCallback(async () => {
    const filesToUpload = files.filter((f) => !f.r2Url && !f.r2Uploading);
    for (const file of filesToUpload) {
      await handleR2Upload(file);
    }
  }, [files, handleR2Upload]);

  return {
    // 상태
    files,
    urlType,
    copiedId,
    isGenerating,
    expiresInDays,
    usePassword,
    password,
    showPassword,
    storageInfo,

    // 상태 변경
    setUrlType,
    setExpiresInDays,
    setUsePassword,
    setPassword,
    setShowPassword,

    // 액션
    handleFilesSelected,
    handleR2Upload,
    handleCopy,
    removeFile,
    clearAll,
    getUrl,
    getUrlSize,
    uploadAllToR2,
  };
}
