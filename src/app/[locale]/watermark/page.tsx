'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, RefreshCw, CheckCircle, AlertCircle, Sparkles, Type, Image as ImageIcon } from 'lucide-react';
import { WatermarkIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import { applyTextWatermark, applyImageWatermark } from '@/services/watermark';
import type { WatermarkPosition } from '@/services/watermark';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';

type WatermarkType = 'text' | 'image';

interface WatermarkedFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'top-left', label: '↖' },
  { value: 'top-center', label: '↑' },
  { value: 'top-right', label: '↗' },
  { value: 'center-left', label: '←' },
  { value: 'center', label: '●' },
  { value: 'center-right', label: '→' },
  { value: 'bottom-left', label: '↙' },
  { value: 'bottom-center', label: '↓' },
  { value: 'bottom-right', label: '↘' },
];

export default function WatermarkPage() {
  const t = useTranslations();

  const [files, setFiles] = useState<WatermarkedFile[]>([]);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [isProcessing, setIsProcessing] = useState(false);

  // 텍스트 워터마크 옵션
  const [text, setText] = useState('Watermark');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(50);
  const [rotation, setRotation] = useState(-30);
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
  const [tileMode, setTileMode] = useState(false);

  // 이미지 워터마크 옵션
  const [wmImagePreview, setWmImagePreview] = useState<string>('');
  const [wmImageElement, setWmImageElement] = useState<HTMLImageElement | null>(null);
  const [wmScale, setWmScale] = useState(30);
  const wmFileRef = useRef<HTMLInputElement>(null);

  const handleWmImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setWmImagePreview(url);
    const img = new Image();
    img.onload = () => setWmImageElement(img);
    img.src = url;
  }, []);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: WatermarkedFile[] = selectedFiles
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        originalFile: file,
        originalName: file.name,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setFiles([]);
  }, [files]);

  const handleApply = async () => {
    setIsProcessing(true);
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pending) {
      setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f));

      try {
        let result: Blob;
        if (watermarkType === 'text') {
          result = await applyTextWatermark(file.originalFile, {
            text, fontSize, fontFamily, color,
            opacity: opacity / 100,
            rotation,
            position,
            tileMode,
          }, (p) => setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, progress: p } : f)));
        } else {
          if (!wmImageElement) throw new Error('워터마크 이미지를 선택해주세요.');
          result = await applyImageWatermark(file.originalFile, {
            watermarkImage: wmImageElement,
            scale: wmScale / 100,
            opacity: opacity / 100,
            position,
            tileMode,
          }, (p) => setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, progress: p } : f)));
        }
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'completed', progress: 100, result } : f));
      } catch (error) {
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: 'error', error: (error as Error).message } : f));
      }
    }
    setIsProcessing(false);
  };

  const handleDownload = (file: WatermarkedFile) => {
    if (file.result) {
      const baseName = file.originalName.substring(0, file.originalName.lastIndexOf('.')) || file.originalName;
      const ext = file.originalName.split('.').pop() || 'png';
      saveAs(file.result, `${baseName}_watermarked.${ext}`);
    }
  };

  const handleDownloadAll = () => {
    files.filter((f) => f.status === 'completed' && f.result).forEach(handleDownload);
  };

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  // 미리보기 캔버스
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const firstFile = files[0];

  useEffect(() => {
    if (!previewCanvasRef.current || !firstFile) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(400 / img.naturalWidth, 300 / img.naturalHeight, 1);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 워터마크 미리보기
      if (watermarkType === 'text' && text.trim()) {
        const previewFontSize = fontSize * scale;
        ctx.globalAlpha = opacity / 100;
        ctx.font = `${previewFontSize}px "${fontFamily}", sans-serif`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        const tw = ctx.measureText(text).width;
        const th = previewFontSize * 1.2;

        if (tileMode) {
          const sx = tw + 40 * scale;
          const sy = th + 40 * scale;
          for (let y = -canvas.height; y < canvas.height * 2; y += sy) {
            for (let x = -canvas.width; x < canvas.width * 2; x += sx) {
              ctx.save();
              ctx.translate(x + tw / 2, y + th / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.fillText(text, -tw / 2, -th / 2);
              ctx.restore();
            }
          }
        } else {
          const margin = 10 * scale;
          const posMap: Record<string, { x: number; y: number }> = {
            'top-left': { x: margin, y: margin },
            'top-center': { x: (canvas.width - tw) / 2, y: margin },
            'top-right': { x: canvas.width - tw - margin, y: margin },
            'center-left': { x: margin, y: (canvas.height - th) / 2 },
            'center': { x: (canvas.width - tw) / 2, y: (canvas.height - th) / 2 },
            'center-right': { x: canvas.width - tw - margin, y: (canvas.height - th) / 2 },
            'bottom-left': { x: margin, y: canvas.height - th - margin },
            'bottom-center': { x: (canvas.width - tw) / 2, y: canvas.height - th - margin },
            'bottom-right': { x: canvas.width - tw - margin, y: canvas.height - th - margin },
          };
          const pos = posMap[position] || posMap['bottom-right'];
          ctx.save();
          ctx.translate(pos.x + tw / 2, pos.y + th / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(text, -tw / 2, -th / 2);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    };
    img.src = firstFile.preview;
  }, [firstFile, watermarkType, text, fontSize, fontFamily, color, opacity, rotation, position, tileMode, wmScale]);

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.65_0.20_275)] flex items-center justify-center shadow-[0_0_30px_oklch(0.65_0.20_275/0.3)]">
              <WatermarkIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">{t('watermark.title')}</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">{t('watermark.description')}</p>
            </div>
          </div>
        </div>

        {/* 제약사항 */}
        <ToolConstraints
          constraints={[t('watermark.constraints.0')]}
          accentColor="teal"
        />

        {/* Upload Area */}
        <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
            <FileUploader accept="image/*" multiple maxFiles={20} maxSize={50} onFilesSelected={handleFilesSelected} />
          </div>
        </div>

        {/* Options */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[oklch(0.65_0.20_275)]" />
                {t('watermark.settings')}
              </h3>

              {/* 워터마크 타입 선택 */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setWatermarkType('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${watermarkType === 'text' ? 'bg-[oklch(0.65_0.20_275)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}
                >
                  <Type className="w-4 h-4" /> {t('watermark.textType')}
                </button>
                <button
                  onClick={() => setWatermarkType('image')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${watermarkType === 'image' ? 'bg-[oklch(0.65_0.20_275)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}
                >
                  <ImageIcon className="w-4 h-4" /> {t('watermark.imageType')}
                </button>
              </div>

              {watermarkType === 'text' ? (
                <div className="space-y-4">
                  {/* 텍스트 입력 */}
                  <div>
                    <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('watermark.text')}</label>
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm focus:outline-none focus:border-[oklch(0.65_0.20_275/0.5)]"
                      placeholder={t('watermark.textPlaceholder')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 폰트 크기 */}
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">
                        {t('watermark.fontSize')}: <span className="text-[oklch(0.65_0.20_275)] font-semibold">{fontSize}px</span>
                      </label>
                      <input type="range" min={12} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[oklch(0.65_0.20_275)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                    </div>
                    {/* 회전 */}
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">
                        {t('watermark.rotation')}: <span className="text-[oklch(0.65_0.20_275)] font-semibold">{rotation}°</span>
                      </label>
                      <input type="range" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[oklch(0.65_0.20_275)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 색상 */}
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('watermark.color')}</label>
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer border border-[oklch(1_0_0/0.1)]" />
                    </div>
                    {/* 폰트 */}
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('watermark.font')}</label>
                      <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm">
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('watermark.wmImage')}</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => wmFileRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.70_0.02_240)] text-sm hover:bg-[oklch(0.20_0.025_240)]">
                        {t('watermark.selectImage')}
                      </button>
                      <input ref={wmFileRef} type="file" accept="image/*" className="hidden" onChange={handleWmImageSelect} />
                      {wmImagePreview && (
                        <img src={wmImagePreview} alt="watermark" className="h-10 rounded border border-[oklch(1_0_0/0.1)]" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">
                      {t('watermark.scale')}: <span className="text-[oklch(0.65_0.20_275)] font-semibold">{wmScale}%</span>
                    </label>
                    <input type="range" min={5} max={100} value={wmScale} onChange={(e) => setWmScale(Number(e.target.value))}
                      className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[oklch(0.65_0.20_275)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                  </div>
                </div>
              )}

              {/* 공통 옵션 */}
              <div className="mt-6 space-y-4 pt-4 border-t border-[oklch(1_0_0/0.06)]">
                {/* 투명도 */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">
                    {t('watermark.opacity')}: <span className="text-[oklch(0.65_0.20_275)] font-semibold">{opacity}%</span>
                  </label>
                  <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[oklch(0.65_0.20_275)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                </div>

                {/* 위치 */}
                <div>
                  <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('watermark.position')}</label>
                  <div className="grid grid-cols-3 gap-1.5 w-fit">
                    {POSITIONS.map((pos) => (
                      <button key={pos.value} onClick={() => { setPosition(pos.value); setTileMode(false); }}
                        className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${position === pos.value && !tileMode ? 'bg-[oklch(0.65_0.20_275)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.55_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}>
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 타일 모드 */}
                <label className="flex items-center gap-2 text-sm text-[oklch(0.70_0.02_240)] cursor-pointer">
                  <input type="checkbox" checked={tileMode} onChange={(e) => setTileMode(e.target.checked)}
                    className="w-4 h-4 rounded accent-[oklch(0.65_0.20_275)]" />
                  {t('watermark.tileMode')}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 미리보기 */}
        {firstFile && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.18s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">{t('watermark.preview')}</h3>
              <div className="flex justify-center">
                <canvas ref={previewCanvasRef} className="rounded-lg border border-[oklch(1_0_0/0.1)] max-w-full" />
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)]">
                  {t('watermark.fileList')} <span className="text-[oklch(0.55_0.02_240)] font-normal">({files.length})</span>
                </h3>
                <button onClick={clearAll} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.22_25)] hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> {t('common.deleteAll')}
                </button>
              </div>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 rounded-xl bg-[oklch(0.12_0.015_250)] border border-[oklch(1_0_0/0.04)] hover:border-[oklch(1_0_0/0.08)] transition-colors">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[oklch(0.16_0.02_245)] flex-shrink-0">
                      <img src={file.preview} alt={file.originalName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[oklch(0.95_0.01_80)] truncate">{file.originalName}</p>
                      <p className="text-xs text-[oklch(0.50_0.02_240)]">{(file.originalFile.size / 1024).toFixed(1)} KB</p>
                      {(file.status === 'processing' || file.status === 'completed') && (
                        <div className="mt-2 h-1 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${file.status === 'completed' ? 'bg-[oklch(0.72_0.17_160)]' : 'bg-[oklch(0.65_0.20_275)]'}`} style={{ width: `${file.progress}%` }} />
                        </div>
                      )}
                      {file.status === 'error' && (
                        <p className="text-xs text-[oklch(0.65_0.22_25)] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{file.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <>
                          <CheckCircle className="w-5 h-5 text-[oklch(0.72_0.17_160)]" />
                          <button onClick={() => handleDownload(file)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[oklch(0.65_0.20_275)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.65_0.20_275/0.4)] transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => removeFile(file.id)} className="w-9 h-9 flex items-center justify-center rounded-lg text-[oklch(0.50_0.02_240)] hover:text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
            {pendingCount > 0 && (
              <button onClick={handleApply} disabled={isProcessing || (watermarkType === 'text' && !text.trim()) || (watermarkType === 'image' && !wmImageElement)}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.65_0.20_275)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.65_0.20_275/0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? (<><RefreshCw className="w-4 h-4 animate-spin" />{t('watermark.applying')}</>) : (<><RefreshCw className="w-4 h-4" />{t('watermark.applyCount', { count: pendingCount })}</>)}
              </button>
            )}
            {completedCount > 0 && (
              <button onClick={handleDownloadAll} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.72_0.17_160/0.4)]">
                <Download className="w-4 h-4" />{t('watermark.downloadCount', { count: completedCount })}
              </button>
            )}
          </div>
        )}

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse title={t('watermark.howToUse.title')} description={t('watermark.howToUse.description')} accentColor="violet"
            steps={[
              { number: 1, title: t('watermark.howToUse.step1Title'), description: t('watermark.howToUse.step1Desc') },
              { number: 2, title: t('watermark.howToUse.step2Title'), description: t('watermark.howToUse.step2Desc') },
              { number: 3, title: t('watermark.howToUse.step3Title'), description: t('watermark.howToUse.step3Desc') },
            ]}
            supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'GIF']}
            features={[
              { title: t('watermark.features.text'), description: t('watermark.features.textDesc') },
              { title: t('watermark.features.image'), description: t('watermark.features.imageDesc') },
              { title: t('watermark.features.tile'), description: t('watermark.features.tileDesc') },
              { title: t('watermark.features.batch'), description: t('watermark.features.batchDesc') },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
