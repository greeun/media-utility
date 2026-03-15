'use client';

import { useTranslations } from 'next-intl';
import {
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Video,
  Info,
  Cloud,
  Loader2,
  HardDrive,
  Calendar,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UrlGeneratorIcon } from '@/components/icons/FeatureIcons';
import { PageHeader, FormatButton } from '@/design-system/v2';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';
import { formatFileSize } from '@/services/urlGenerator';
import { useUrlGenerator } from './_hooks/useUrlGenerator';
import type { UrlType } from './_types';

const ACCENT = ACCENT_COLORS.pink;

export default function UrlGeneratorPage() {
  const t = useTranslations();
  const {
    files,
    urlType,
    copiedId,
    isGenerating,
    expiresInDays,
    usePassword,
    password,
    showPassword,
    storageInfo,
    setUrlType,
    setExpiresInDays,
    setUsePassword,
    setPassword,
    setShowPassword,
    handleFilesSelected,
    handleCopy,
    removeFile,
    clearAll,
    getUrl,
    getUrlSize,
    uploadAllToR2,
  } = useUrlGenerator();

  return (
    <ToolPageLayout>
      {/* 헤더 */}
      <PageHeader
        icon={<UrlGeneratorIcon size={28} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('urlGenerator.title')}
        description={t('urlGenerator.description')}
      />

      {/* 저장소 정보 (R2 선택 시) */}
      {urlType === 'r2' && storageInfo && (
        <div
          className="mb-6 p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
          style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}
        >
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-black uppercase tracking-wide">
                  {t('common.storage')}
                </span>
                <span className="text-gray-900 font-medium">
                  {formatFileSize(storageInfo.usedBytes)} / {formatFileSize(storageInfo.maxBytes)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-300 border-2 border-black overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    storageInfo.usedPercent > 90
                      ? 'bg-red-500'
                      : storageInfo.usedPercent > 70
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(storageInfo.usedPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1 font-bold">
                {storageInfo.fileCount} {t('common.files')} | {storageInfo.usedPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        className="mb-6 opacity-0 animate-fade-up"
        style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
      >
        <div className="p-6 bg-white border-4 border-black">
          <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-black cursor-pointer hover:bg-gray-50 transition-all duration-200">
            <div className="p-4 border-4 border-black mb-3">
              <Upload className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black uppercase tracking-wide text-black">
              {t('common.upload')}
            </span>
            <span className="text-sm font-bold text-gray-600 mt-1">
              {t('common.image')} / {t('common.video')}
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* URL 타입 선택 */}
      {files.length > 0 && (
        <div
          className="mb-6 p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
          style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}
        >
          <h3 className="text-sm font-black uppercase tracking-wide text-black mb-4">
            {t('urlGenerator.urlType')}
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {([
              { key: 'base64' as UrlType, title: t('urlGenerator.types.base64'), desc: t('urlGenerator.types.base64Desc') },
              { key: 'blob' as UrlType, title: t('urlGenerator.types.blob'), desc: t('urlGenerator.types.blobDesc') },
              { key: 'r2' as UrlType, title: t('urlGenerator.types.r2'), desc: t('urlGenerator.types.r2Desc'), hasIcon: true },
            ]).map((type) => (
              <button
                key={type.key}
                onClick={() => setUrlType(type.key)}
                className={`p-4 text-left transition-all border-4 ${
                  urlType === type.key
                    ? 'bg-white'
                    : 'bg-white border-black hover:bg-gray-50'
                }`}
                style={
                  urlType === type.key
                    ? { borderColor: ACCENT }
                    : undefined
                }
              >
                <div className="flex items-center gap-2 mb-1">
                  {type.hasIcon && <Cloud className="w-4 h-4 text-gray-900" />}
                  <h4
                    className="font-bold text-sm uppercase tracking-wide"
                    style={urlType === type.key ? { color: ACCENT } : { color: '#000' }}
                  >
                    {type.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-600">{type.desc}</p>
              </button>
            ))}
          </div>

          {/* R2 옵션 */}
          {urlType === 'r2' && (
            <div className="mt-4 p-4 bg-gray-50 border-4 border-black space-y-4">
              {/* 만료 기간 선택 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-black mb-3">
                  <Calendar className="w-4 h-4" />
                  {t('urlGenerator.cloudOptions.expiry')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 30, 90, 365].map((days) => (
                    <FormatButton
                      key={days}
                      label={
                        days === 7
                          ? t('urlGenerator.cloudOptions.week', { count: 1 })
                          : days === 30
                          ? t('urlGenerator.cloudOptions.day', { count: 30 })
                          : days === 90
                          ? t('urlGenerator.cloudOptions.days', { count: 90 })
                          : t('urlGenerator.cloudOptions.permanent')
                      }
                      active={expiresInDays === days}
                      accentColor={ACCENT}
                      onClick={() => setExpiresInDays(days)}
                    />
                  ))}
                </div>
              </div>

              {/* 비밀번호 보호 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-black mb-3">
                  <Lock className="w-4 h-4" />
                  {t('urlGenerator.cloudOptions.password')}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                      className="w-4 h-4 accent-pink-500"
                    />
                    <span className="text-sm font-bold text-gray-900">
                      {t('urlGenerator.cloudOptions.password')}
                    </span>
                  </label>
                  {usePassword && (
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('urlGenerator.cloudOptions.passwordPlaceholder')}
                        className="w-full px-4 py-2 pr-10 bg-white border-4 border-black text-black text-sm font-bold focus:outline-none"
                        style={{ outlineColor: ACCENT }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 전체 업로드 버튼 */}
              {files.some((f) => !f.r2Url && !f.r2Uploading) && (
                <button
                  onClick={uploadAllToR2}
                  disabled={usePassword && !password}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-4 font-bold uppercase tracking-wide text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
                >
                  <Cloud className="w-4 h-4" />
                  {t('urlGenerator.cloudOptions.upload')}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div
          className="mb-6 p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wide text-black">
              {t('urlGenerator.result.title')}{' '}
              <span className="text-gray-600 font-bold">({files.length})</span>
            </h3>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 hover:text-white hover:bg-red-600 border-4 border-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('common.deleteAll')}
            </button>
          </div>

          <div className="space-y-3">
            {files.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-gray-50 border-4 border-black"
              >
                <div className="flex items-start gap-4">
                  {/* 미리보기 */}
                  <div className="w-16 h-16 border-4 border-black overflow-hidden bg-gray-200 flex-shrink-0">
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

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Video className="w-4 h-4 text-gray-600" />
                      )}
                      <p className="font-bold text-black truncate text-sm">
                        {item.file.name}
                      </p>
                      {item.r2HasPassword && (
                        <Lock className="w-3 h-3 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-bold">
                      {formatFileSize(item.file.size)}
                      {urlType === 'base64' && (
                        <span className="ml-2">| URL: {getUrlSize(item)}</span>
                      )}
                      {urlType === 'r2' && item.r2Url && (
                        <span className="ml-2 text-emerald-600">| {t('common.completed')}</span>
                      )}
                    </p>

                    {/* R2 업로드 진행률 */}
                    {urlType === 'r2' && item.r2Uploading && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Loader2 className="w-3 h-3 animate-spin" style={{ color: ACCENT }} />
                          <span className="text-xs font-bold" style={{ color: ACCENT }}>
                            {t('common.processing')} {item.r2Progress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-300 border-2 border-black overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{ width: `${item.r2Progress || 0}%`, backgroundColor: ACCENT }}
                          />
                        </div>
                      </div>
                    )}

                    {/* R2 에러 */}
                    {urlType === 'r2' && item.r2Error && (
                      <p className="mt-2 text-xs font-bold text-red-600">
                        {t('common.error')}: {item.r2Error}
                      </p>
                    )}

                    {/* URL 미리보기 */}
                    {getUrl(item) && (
                      <div className="mt-2 p-2 bg-gray-100 border-2 border-black">
                        <code className="text-xs text-gray-900 break-all line-clamp-2 font-mono">
                          {getUrl(item)?.substring(0, 180)}
                          {(getUrl(item)?.length || 0) > 180 && '...'}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(item)}
                      disabled={
                        (urlType === 'r2' && item.r2Uploading) ||
                        (urlType === 'r2' && usePassword && !password && !item.r2Url)
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase tracking-wide transition-all border-4 disabled:opacity-50 ${
                        copiedId === item.id
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'text-white'
                      }`}
                      style={
                        copiedId !== item.id
                          ? { backgroundColor: ACCENT, borderColor: ACCENT }
                          : undefined
                      }
                    >
                      {item.r2Uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('common.processing')}
                        </>
                      ) : copiedId === item.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t('urlGenerator.result.copied')}
                        </>
                      ) : urlType === 'r2' && !item.r2Url ? (
                        <>
                          <Cloud className="w-4 h-4" />
                          {t('common.upload')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t('urlGenerator.result.copy')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase tracking-wide border-4 border-black text-black hover:bg-black hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 정보 카드 */}
      <div
        className="mb-6 p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
        style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
      >
        <div className="flex gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
          <div>
            <h3 className="font-black uppercase tracking-wide text-sm mb-3" style={{ color: ACCENT }}>
              {t('urlGenerator.urlType')}
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <strong className="text-black">{t('urlGenerator.types.base64')}:</strong>{' '}
                {t('urlGenerator.types.base64Desc')}
              </li>
              <li>
                <strong className="text-black">{t('urlGenerator.types.blob')}:</strong>{' '}
                {t('urlGenerator.types.blobDesc')}
              </li>
              <li>
                <strong className="text-black">{t('urlGenerator.types.r2')}:</strong>{' '}
                {t('urlGenerator.types.r2Desc')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
