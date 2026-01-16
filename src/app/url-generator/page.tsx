'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, Copy, Check, Trash2, Image as ImageIcon, Video, Info, Cloud, Loader2, HardDrive, Calendar, Lock, Eye, EyeOff } from 'lucide-react';
import { UrlGeneratorIcon } from '@/components/icons/FeatureIcons';
import {
  fileToDataUrl,
  fileToBlobUrl,
  copyToClipboard,
  formatFileSize,
  getDataUrlSize,
  uploadToR2,
  getStorageInfo,
} from '@/services/urlGenerator';
import HowToUse from '@/components/common/HowToUse';

interface GeneratedUrl {
  id: string;
  file: File;
  preview: string;
  dataUrl?: string;
  blobUrl?: string;
  r2Url?: string;
  r2Uploading?: boolean;
  r2Progress?: number;
  r2Error?: string;
  r2ExpiresAt?: string;
  r2HasPassword?: boolean;
  type: 'image' | 'video';
}

interface StorageInfo {
  usedBytes: number;
  maxBytes: number;
  usedPercent: number;
  fileCount: number;
}

export default function UrlGeneratorPage() {
  const [files, setFiles] = useState<GeneratedUrl[]>([]);
  const [urlType, setUrlType] = useState<'base64' | 'blob' | 'r2'>('base64');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);

  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  useEffect(() => {
    const fetchStorageInfo = async () => {
      if (urlType !== 'r2') return;

      try {
        const info = await getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('저장소 정보 조회 실패:', error);
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
          console.error('Data URL 생성 오류:', error);
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
      console.error('R2 업로드 오류:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, r2Uploading: false, r2Error: error instanceof Error ? error.message : '업로드 실패' }
            : f
        )
      );
    }
  }, [expiresInDays, usePassword, password]);

  const handleCopy = async (item: GeneratedUrl) => {
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
    if (urlType === 'base64') return item.dataUrl;
    if (urlType === 'blob') return item.blobUrl;
    if (urlType === 'r2') return item.r2Url;
    return undefined;
  };

  const getUrlSize = (item: GeneratedUrl) => {
    if (urlType === 'base64' && item.dataUrl) {
      return formatFileSize(getDataUrlSize(item.dataUrl));
    }
    return formatFileSize(item.file.size);
  };

  const uploadAllToR2 = useCallback(async () => {
    const filesToUpload = files.filter((f) => !f.r2Url && !f.r2Uploading);
    for (const file of filesToUpload) {
      await handleR2Upload(file);
    }
  }, [files, handleR2Upload]);

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.70_0.20_330)] flex items-center justify-center shadow-[0_0_30px_oklch(0.70_0.20_330/0.3)]">
              <UrlGeneratorIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">URL 생성</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">
                이미지나 비디오를 공유 가능한 URL로 변환하세요
              </p>
            </div>
          </div>
        </div>

        {/* Storage Info */}
        {urlType === 'r2' && storageInfo && (
          <div className="mb-6 p-4 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-[oklch(0.50_0.02_240)]" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[oklch(0.60_0.02_240)]">저장소 사용량</span>
                  <span className="text-[oklch(0.95_0.01_80)] font-medium">
                    {formatFileSize(storageInfo.usedBytes)} / {formatFileSize(storageInfo.maxBytes)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      storageInfo.usedPercent > 90
                        ? 'bg-[oklch(0.65_0.22_25)]'
                        : storageInfo.usedPercent > 70
                        ? 'bg-[oklch(0.80_0.18_80)]'
                        : 'bg-[oklch(0.72_0.17_160)]'
                    }`}
                    style={{ width: `${Math.min(storageInfo.usedPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[oklch(0.50_0.02_240)] mt-1">
                  {storageInfo.fileCount}개 파일 | {storageInfo.usedPercent.toFixed(1)}% 사용
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="mb-6 p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[oklch(1_0_0/0.1)] rounded-xl cursor-pointer hover:border-[oklch(0.70_0.20_330/0.5)] hover:bg-[oklch(0.70_0.20_330/0.02)] transition-all">
            <Upload className="w-8 h-8 text-[oklch(0.40_0.02_240)] mb-2" />
            <span className="text-sm font-medium text-[oklch(0.70_0.02_240)]">파일 선택</span>
            <span className="text-xs text-[oklch(0.50_0.02_240)] mt-1">이미지 또는 비디오</span>
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
          <div className="mb-6 p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">URL 유형</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { key: 'base64', title: 'Base64 Data URL', desc: '파일 데이터가 URL에 포함됨' },
                { key: 'blob', title: 'Blob URL', desc: '현재 세션에서만 유효' },
                { key: 'r2', title: 'R2 클라우드', desc: '영구 저장, 빠른 CDN 제공', icon: Cloud },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setUrlType(type.key as 'base64' | 'blob' | 'r2')}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    urlType === type.key
                      ? 'border-[oklch(0.70_0.20_330)] bg-[oklch(0.70_0.20_330/0.1)]'
                      : 'border-[oklch(1_0_0/0.06)] hover:border-[oklch(1_0_0/0.15)] hover:bg-[oklch(1_0_0/0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {type.icon && <type.icon className="w-4 h-4 text-[oklch(0.75_0.18_195)]" />}
                    <h4 className={`font-semibold text-sm ${urlType === type.key ? 'text-[oklch(0.75_0.25_330)]' : 'text-[oklch(0.95_0.01_80)]'}`}>
                      {type.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[oklch(0.50_0.02_240)]">{type.desc}</p>
                </button>
              ))}
            </div>

            {/* R2 Options */}
            {urlType === 'r2' && (
              <div className="mt-4 p-4 bg-[oklch(0.12_0.015_250)] rounded-xl space-y-4">
                {/* Expiry Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[oklch(0.70_0.02_240)] mb-2">
                    <Calendar className="w-4 h-4" />
                    파일 유효기간
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[7, 30, 90, 365].map((days) => (
                      <button
                        key={days}
                        onClick={() => setExpiresInDays(days)}
                        className={`py-2 px-3 rounded-lg text-sm transition-all ${
                          expiresInDays === days
                            ? 'bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)]'
                            : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'
                        }`}
                      >
                        {days === 365 ? '1년' : `${days}일`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password Protection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[oklch(0.70_0.02_240)] mb-2">
                    <Lock className="w-4 h-4" />
                    접근 제한
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usePassword}
                        onChange={(e) => setUsePassword(e.target.checked)}
                        className="w-4 h-4 rounded bg-[oklch(0.16_0.02_245)] border-[oklch(1_0_0/0.2)] text-[oklch(0.75_0.18_195)] focus:ring-[oklch(0.75_0.18_195)]"
                      />
                      <span className="text-sm text-[oklch(0.70_0.02_240)]">비밀번호로 보호</span>
                    </label>
                    {usePassword && (
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호 입력"
                          className="w-full px-4 py-2 pr-10 bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] rounded-lg text-[oklch(0.95_0.01_80)] text-sm focus:outline-none focus:border-[oklch(0.75_0.18_195)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.50_0.02_240)] hover:text-[oklch(0.70_0.02_240)]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload All Button */}
                {files.some((f) => !f.r2Url && !f.r2Uploading) && (
                  <button
                    onClick={uploadAllToR2}
                    disabled={usePassword && !password}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] font-medium hover:shadow-[0_0_20px_oklch(0.75_0.18_195/0.4)] transition-all disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4" />
                    전체 파일 업로드
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6 p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)]">
                생성된 URL <span className="text-[oklch(0.55_0.02_240)] font-normal">({files.length}개)</span>
              </h3>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.22_25)] hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                전체 삭제
              </button>
            </div>

            <div className="space-y-3">
              {files.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-[oklch(0.12_0.015_250)] border border-[oklch(1_0_0/0.04)]">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[oklch(0.16_0.02_245)] flex-shrink-0">
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
                          <ImageIcon className="w-4 h-4 text-[oklch(0.50_0.02_240)]" />
                        ) : (
                          <Video className="w-4 h-4 text-[oklch(0.50_0.02_240)]" />
                        )}
                        <p className="font-medium text-[oklch(0.95_0.01_80)] truncate text-sm">
                          {item.file.name}
                        </p>
                        {item.r2HasPassword && (
                          <Lock className="w-3 h-3 text-[oklch(0.80_0.18_80)]" />
                        )}
                      </div>
                      <p className="text-xs text-[oklch(0.50_0.02_240)]">
                        원본: {formatFileSize(item.file.size)}
                        {urlType === 'base64' && (
                          <span className="ml-2">| URL 크기: {getUrlSize(item)}</span>
                        )}
                        {urlType === 'r2' && item.r2Url && (
                          <span className="ml-2 text-[oklch(0.72_0.17_160)]">| 업로드 완료</span>
                        )}
                      </p>

                      {/* R2 Expiry */}
                      {urlType === 'r2' && item.r2ExpiresAt && (
                        <p className="text-xs text-[oklch(0.50_0.02_240)] mt-1">
                          만료: {new Date(item.r2ExpiresAt).toLocaleDateString('ko-KR')}
                          {item.r2HasPassword && ' | 비밀번호 보호됨'}
                        </p>
                      )}

                      {/* R2 Upload Progress */}
                      {urlType === 'r2' && item.r2Uploading && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Loader2 className="w-3 h-3 animate-spin text-[oklch(0.75_0.18_195)]" />
                            <span className="text-xs text-[oklch(0.75_0.18_195)]">
                              업로드 중... {item.r2Progress}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[oklch(0.75_0.18_195)] rounded-full transition-all"
                              style={{ width: `${item.r2Progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* R2 Error */}
                      {urlType === 'r2' && item.r2Error && (
                        <p className="mt-2 text-xs text-[oklch(0.65_0.22_25)]">오류: {item.r2Error}</p>
                      )}

                      {/* URL Preview */}
                      {getUrl(item) && (
                        <div className="mt-2 p-2 bg-[oklch(0.16_0.02_245)] rounded-lg">
                          <code className="text-xs text-[oklch(0.60_0.02_240)] break-all line-clamp-2 font-mono">
                            {getUrl(item)?.substring(0, 180)}
                            {(getUrl(item)?.length || 0) > 180 && '...'}
                          </code>
                        </div>
                      )}

                      {/* R2 Not Uploaded */}
                      {urlType === 'r2' && !item.r2Url && !item.r2Uploading && !item.r2Error && (
                        <div className="mt-2 p-2 bg-[oklch(0.16_0.02_245)] rounded-lg">
                          <p className="text-xs text-[oklch(0.50_0.02_240)]">
                            {usePassword && !password
                              ? '비밀번호를 입력한 후 업로드하세요'
                              : '업로드 버튼을 클릭하면 R2에 업로드됩니다'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(item)}
                        disabled={(urlType === 'r2' && item.r2Uploading) || (urlType === 'r2' && usePassword && !password && !item.r2Url)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                          copiedId === item.id
                            ? 'bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)]'
                            : urlType === 'r2'
                            ? 'bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_15px_oklch(0.75_0.18_195/0.3)]'
                            : 'bg-[oklch(0.70_0.20_330)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_15px_oklch(0.70_0.20_330/0.3)]'
                        }`}
                      >
                        {item.r2Uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            업로드 중
                          </>
                        ) : copiedId === item.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            복사됨
                          </>
                        ) : urlType === 'r2' && !item.r2Url ? (
                          <>
                            <Cloud className="w-4 h-4" />
                            업로드
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
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[oklch(1_0_0/0.1)] text-[oklch(0.60_0.02_240)] hover:text-[oklch(0.65_0.22_25)] hover:border-[oklch(0.65_0.22_25/0.3)] transition-colors"
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

        {/* Info Card */}
        <div className="mb-6 p-4 rounded-2xl border border-[oklch(0.75_0.18_195/0.2)] bg-[oklch(0.75_0.18_195/0.05)] opacity-0 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-[oklch(0.75_0.18_195)] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[oklch(0.80_0.20_195)] mb-2 text-sm">URL 유형 설명</h3>
              <ul className="text-sm text-[oklch(0.70_0.02_240)] space-y-1.5">
                <li>
                  <strong className="text-[oklch(0.80_0.20_195)]">Base64 Data URL:</strong> 파일 데이터가 URL에 직접 포함됩니다.
                  HTML, CSS, 이메일 등 어디서든 사용 가능하지만 파일 크기가 커집니다.
                </li>
                <li>
                  <strong className="text-[oklch(0.80_0.20_195)]">Blob URL:</strong> 브라우저가 생성하는 임시 URL입니다.
                  현재 브라우저 세션에서만 유효하며, 탭을 닫으면 무효화됩니다.
                </li>
                <li>
                  <strong className="text-[oklch(0.80_0.20_195)]">R2 클라우드:</strong> Cloudflare R2에 파일을 저장합니다.
                  설정한 유효기간 동안 전 세계 CDN을 통해 빠르게 제공됩니다.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How To Use */}
        <HowToUse
          title="URL 생성기"
          description="이미지와 비디오 파일을 공유 가능한 URL로 변환하세요. Base64, Blob URL, 또는 클라우드 저장 중 선택할 수 있습니다."
          accentColor="rose"
          steps={[
            {
              number: 1,
              title: '파일 업로드',
              description: '이미지 또는 비디오 파일을 업로드하세요. 여러 파일을 한 번에 업로드할 수 있습니다.',
            },
            {
              number: 2,
              title: 'URL 유형 선택',
              description: 'Base64 Data URL, Blob URL, 또는 R2 클라우드 중 원하는 방식을 선택하세요.',
            },
            {
              number: 3,
              title: 'URL 복사',
              description: '생성된 URL을 클립보드에 복사하여 원하는 곳에 사용하세요.',
            },
          ]}
          supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'GIF', 'MP4', 'WebM']}
          features={[
            {
              title: 'Base64 Data URL',
              description: '파일 데이터가 URL에 직접 포함됩니다. HTML, CSS, 이메일 등 어디서든 사용 가능합니다.',
            },
            {
              title: 'Blob URL',
              description: '브라우저가 생성하는 임시 URL입니다. 현재 세션에서만 유효하며 빠르게 생성됩니다.',
            },
            {
              title: 'R2 클라우드 저장',
              description: 'Cloudflare R2에 파일을 저장하여 영구적인 URL을 생성합니다. 전 세계 CDN을 통해 빠르게 제공됩니다.',
            },
            {
              title: '비밀번호 보호',
              description: 'R2 클라우드 저장 시 비밀번호를 설정하여 파일 접근을 제한할 수 있습니다.',
            },
          ]}
          faqs={[
            {
              question: '어떤 URL 유형을 선택해야 하나요?',
              answer: 'HTML/CSS에 직접 삽입: Base64, 임시 미리보기: Blob URL, 영구 공유: R2 클라우드를 추천합니다.',
            },
            {
              question: 'Base64 URL이 너무 긴데요?',
              answer: 'Base64는 파일 데이터를 텍스트로 인코딩하여 원본보다 약 33% 커집니다. 큰 파일은 R2 클라우드를 사용하세요.',
            },
            {
              question: 'R2 클라우드에 저장된 파일은 얼마나 유지되나요?',
              answer: '설정한 유효기간(1시간~영구) 동안 유지됩니다. 유효기간이 지나면 자동 삭제됩니다.',
            },
          ]}
        />
      </div>
    </div>
  );
}
