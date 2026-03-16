'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Download, RefreshCw, Loader2 } from 'lucide-react';
import { VideoFormatIcon } from '@/components/icons/FeatureIcons';
import { convertVideoFormat } from '@/services/videoProcessor';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';
import { ToolPageLayout } from '@/design-system/v2/layouts';
import {
  PageHeader,
  SettingsPanel,
  FormatButton,
  ActionButtonGroup,
} from '@/design-system/v2/components';
import { ACCENT_COLORS } from '@/design-system/v2/tokens';

type OutputFormat = 'mp4' | 'webm' | 'mov' | 'avi';

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'mp4', label: 'MP4' },
  { value: 'webm', label: 'WebM' },
  { value: 'mov', label: 'MOV' },
  { value: 'avi', label: 'AVI' },
];

// 액센트 컬러
const ACCENT = ACCENT_COLORS.cyan;

export default function VideoFormatConverterPage() {
  const t = useTranslations();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const processFile = useCallback((selectedFile: File) => {
    if (selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setResultPreview(null);

      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'mp4') setOutputFormat('webm');
      else setOutputFormat('mp4');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  }, [processFile]);

  const handleConvert = async () => {
    if (!file) return;

    if (typeof SharedArrayBuffer === 'undefined') {
      alert(t('videoFormatConverter.sharedArrayBufferError') || '브라우저가 SharedArrayBuffer를 지원하지 않습니다.');
      return;
    }

    setIsProcessing(true);
    setLoadingFFmpeg(true);
    setProgress(0);

    try {
      const output = await convertVideoFormat(file, outputFormat, (p) => {
        setLoadingFFmpeg(false);
        setProgress(p);
      });
      setResult(output);
      setResultPreview(URL.createObjectURL(output));
    } catch (error) {
      console.error('Conversion error:', error);
      alert(`${t('videoFormatConverter.conversionError') || '변환 중 오류 발생'}: ${error instanceof Error ? error.message : String(error)}`);
    }

    setIsProcessing(false);
    setLoadingFFmpeg(false);
  };

  const handleDownload = () => {
    if (result) {
      const baseName = file?.name.replace(/\.[^.]+$/, '') || 'converted';
      saveAs(result, `${baseName}.${outputFormat}`);
    }
  };

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (resultPreview) URL.revokeObjectURL(resultPreview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setResultPreview(null);
    setProgress(0);
  };

  const inputFormat = file?.name.split('.').pop()?.toUpperCase() || '';

  return (
    <ToolPageLayout maxWidth="xl">
      {/* 헤더 */}
      <PageHeader
        icon={<VideoFormatIcon size={32} className="text-white" />}
        iconBgColor={ACCENT}
        title={t('videoFormatConverter.title')}
        description={t('videoFormatConverter.description')}
      />

      {/* 제약사항 */}
      <ToolConstraints
        constraints={[t('videoFormatConverter.constraints.0'), t('videoFormatConverter.constraints.1')]}
        accentColor="cyan"
      />

      {/* 업로드 영역 */}
      {!preview && (
        <div
          className="mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <div className="p-8 bg-white border-4 border-black">
            <label
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex flex-col items-center justify-center w-full h-64 border-4 border-dashed cursor-pointer transition-all
                ${isDragging
                  ? 'border-[#06B6D4] bg-[#06B6D4]/5'
                  : 'border-black hover:border-[#06B6D4] hover:bg-gray-50'
                }
              `}
            >
              <div className={`p-6 border-4 border-current transition-colors ${isDragging ? 'text-[#06B6D4]' : 'text-black'}`}>
                <Upload className="w-10 h-10" strokeWidth={2.5} />
              </div>
              <span className={`mt-4 text-xl font-black uppercase tracking-wide ${isDragging ? 'text-[#06B6D4]' : 'text-black'}`}>
                {t('common.dragOrClick')}
              </span>
              <span className="text-sm font-bold text-gray-600 mt-2">MP4, WebM, MOV, AVI</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* 편집 영역 */}
      {preview && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* 좌측: 미리보기 & 옵션 */}
          <div className="space-y-6">
            {/* 미리보기 */}
            <div
              className="p-6 bg-white border-4 border-black opacity-0 animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4">
                {t('videoFormatConverter.preview')}
              </h3>
              <div className="bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  src={preview}
                  controls
                  className="w-full max-h-[280px]"
                />
              </div>
              <div className="mt-3 text-sm font-bold text-gray-900">
                {file?.name} ({((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </div>
              {inputFormat && (
                <div className="mt-1 text-xs font-bold text-gray-600">
                  {t('videoFormatConverter.currentFormat')}: <span style={{ color: ACCENT }}>{inputFormat}</span>
                </div>
              )}
            </div>

            {/* 포맷 선택 */}
            <SettingsPanel title={t('videoFormatConverter.outputFormat')} accentColor={ACCENT}>
              <div className="grid grid-cols-4 gap-3">
                {FORMAT_OPTIONS.map((fmt) => (
                  <FormatButton
                    key={fmt.value}
                    label={fmt.label}
                    active={outputFormat === fmt.value}
                    accentColor={ACCENT}
                    onClick={() => setOutputFormat(fmt.value)}
                  />
                ))}
              </div>
            </SettingsPanel>

            {/* 진행률 표시 */}
            {isProcessing && !loadingFFmpeg && (
              <div className="h-2 bg-gray-200 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: ACCENT }}
                />
              </div>
            )}
          </div>

          {/* 우측: 결과 */}
          <div className="space-y-6">
            {resultPreview && result && (
              <div
                className="p-6 bg-white border-4 border-black opacity-0 animate-scale-in"
                style={{ animationFillMode: 'forwards' }}
              >
                <h3 className="text-lg font-black uppercase tracking-wide text-black mb-4">
                  {t('videoFormatConverter.result')}
                </h3>
                <div className="bg-black overflow-hidden">
                  <video src={resultPreview} controls className="w-full max-h-[280px]" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-900">
                      {((result.size) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span
                      className="ml-2 px-2 py-1 text-xs font-black uppercase text-white border-4 border-black"
                      style={{ backgroundColor: ACCENT }}
                    >
                      {outputFormat}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      {preview && (
        <ActionButtonGroup
          accentColor={ACCENT}
          primaryAction={
            !result
              ? {
                  label: `${inputFormat} → ${outputFormat.toUpperCase()} ${t('common.convert')}`,
                  loadingLabel: loadingFFmpeg ? t('common.ffmpegLoading') : `${t('common.converting')} ${progress}%`,
                  isLoading: isProcessing,
                  onClick: handleConvert,
                }
              : undefined
          }
          downloadAction={
            result
              ? {
                  label: `${t('common.download')} (${((result.size) / (1024 * 1024)).toFixed(2)} MB)`,
                  onClick: handleDownload,
                }
              : undefined
          }
        />
      )}

      {/* 새 파일 업로드 */}
      {preview && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wide border-4 border-black hover:bg-black hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" strokeWidth={2.5} />
            {t('common.upload')}
          </button>
        </div>
      )}

      {/* 사용 방법 */}
      <div className="mt-12">
        <HowToUse
          title={t('videoFormatConverter.howToUse.title')}
          description={t('videoFormatConverter.howToUse.description')}
          accentColor="cyan"
          steps={[
            {
              number: 1,
              title: t('videoFormatConverter.howToUse.step1Title'),
              description: t('videoFormatConverter.howToUse.step1Desc'),
            },
            {
              number: 2,
              title: t('videoFormatConverter.howToUse.step2Title'),
              description: t('videoFormatConverter.howToUse.step2Desc'),
            },
            {
              number: 3,
              title: t('videoFormatConverter.howToUse.step3Title'),
              description: t('videoFormatConverter.howToUse.step3Desc'),
            },
          ]}
          supportedFormats={['MP4', 'WebM', 'MOV', 'AVI']}
        />
      </div>
    </ToolPageLayout>
  );
}
