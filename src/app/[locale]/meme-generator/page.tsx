'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { MemeGeneratorIcon } from '@/components/icons/FeatureIcons';
import FileUploader from '@/components/upload/FileUploader';
import { generateMeme } from '@/services/memeGenerator';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';

export default function MemeGeneratorPage() {
  const t = useTranslations();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(60);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const imgFile = selectedFiles.find((f) => f.type.startsWith('image/'));
    if (!imgFile) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(imgFile);
    setPreview(URL.createObjectURL(imgFile));
    setResult(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
  }, [preview, resultUrl]);

  const handleClear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreview('');
    setResult(null);
    setResultUrl('');
    setTopText('');
    setBottomText('');
  }, [preview, resultUrl]);

  // 실시간 미리보기
  useEffect(() => {
    if (!previewCanvasRef.current || !preview) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(600 / img.naturalWidth, 500 / img.naturalHeight, 1);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const scaledFontSize = fontSize * scale;
      const maxWidth = canvas.width * 0.9;
      const margin = canvas.height * 0.03;

      ctx.font = `bold ${scaledFontSize}px "${fontFamily}", Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * scale;
      ctx.lineJoin = 'round';

      // 상단 텍스트
      if (topText.trim()) {
        ctx.textBaseline = 'top';
        const words = topText.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        for (let i = 0; i < lines.length; i++) {
          const lineY = margin + i * scaledFontSize * 1.15;
          ctx.strokeText(lines[i], canvas.width / 2, lineY);
          ctx.fillText(lines[i], canvas.width / 2, lineY);
        }
      }

      // 하단 텍스트
      if (bottomText.trim()) {
        ctx.textBaseline = 'top';
        const words = bottomText.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const totalH = lines.length * scaledFontSize * 1.15;
        const startY = canvas.height - margin - totalH;
        for (let i = 0; i < lines.length; i++) {
          const lineY = startY + i * scaledFontSize * 1.15;
          ctx.strokeText(lines[i], canvas.width / 2, lineY);
          ctx.fillText(lines[i], canvas.width / 2, lineY);
        }
      }
    };
    img.src = preview;
  }, [preview, topText, bottomText, fontSize, fontFamily, textColor, strokeColor, strokeWidth]);

  const handleGenerate = async () => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const blob = await generateMeme(file, {
        topText, bottomText, fontSize, fontFamily, textColor, strokeColor, strokeWidth,
      });
      setResult(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('밈 생성 실패:', error);
    }
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (result) {
      const baseName = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'meme';
      saveAs(result, `${baseName}_meme.png`);
    }
  };

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.78_0.16_55)] flex items-center justify-center shadow-[0_0_30px_oklch(0.78_0.16_55/0.3)]">
              <MemeGeneratorIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">{t('memeGenerator.title')}</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">{t('memeGenerator.description')}</p>
            </div>
          </div>
        </div>

        {/* 제약사항 */}
        <ToolConstraints
          constraints={[t('memeGenerator.constraints.0'), t('memeGenerator.constraints.1')]}
          accentColor="amber"
        />

        {/* Upload Area */}
        {!file && (
          <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
              <FileUploader accept="image/*" multiple={false} maxFiles={1} maxSize={50} onFilesSelected={handleFilesSelected} />
            </div>
          </div>
        )}

        {/* Editor */}
        {file && (
          <>
            {/* 미리보기 */}
            <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)]">{t('memeGenerator.preview')}</h3>
                  <button onClick={handleClear}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.22_25)] hover:text-[oklch(0.75_0.25_25)] hover:bg-[oklch(0.65_0.22_25/0.1)] rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> {t('memeGenerator.changeImage')}
                  </button>
                </div>
                <div className="flex justify-center">
                  <canvas ref={previewCanvasRef} className="rounded-lg border border-[oklch(1_0_0/0.1)] max-w-full" />
                </div>
              </div>
            </div>

            {/* 텍스트 설정 */}
            <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
              <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
                <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[oklch(0.78_0.16_55)]" />
                  {t('memeGenerator.textSettings')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('memeGenerator.topText')}</label>
                    <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder={t('memeGenerator.topTextPlaceholder')}
                      className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm focus:outline-none focus:border-[oklch(0.78_0.16_55/0.5)]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('memeGenerator.bottomText')}</label>
                    <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder={t('memeGenerator.bottomTextPlaceholder')}
                      className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm focus:outline-none focus:border-[oklch(0.78_0.16_55/0.5)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">
                        {t('memeGenerator.fontSize')}: <span className="text-[oklch(0.78_0.16_55)] font-semibold">{fontSize}px</span>
                      </label>
                      <input type="range" min={20} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[oklch(0.78_0.16_55)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">
                        {t('memeGenerator.strokeWidth')}: <span className="text-[oklch(0.78_0.16_55)] font-semibold">{strokeWidth}px</span>
                      </label>
                      <input type="range" min={0} max={15} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[oklch(0.78_0.16_55)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('memeGenerator.textColor')}</label>
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer border border-[oklch(1_0_0/0.1)]" />
                    </div>
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('memeGenerator.strokeColor')}</label>
                      <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer border border-[oklch(1_0_0/0.1)]" />
                    </div>
                    <div>
                      <label className="block text-sm text-[oklch(0.70_0.02_240)] mb-2">{t('memeGenerator.font')}</label>
                      <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm">
                        <option value="Impact">Impact</option>
                        <option value="Arial Black">Arial Black</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Arial">Arial</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <button onClick={handleGenerate} disabled={isGenerating || (!topText.trim() && !bottomText.trim())}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.78_0.16_55)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.78_0.16_55/0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                {isGenerating ? (<><RefreshCw className="w-4 h-4 animate-spin" />{t('memeGenerator.generating')}</>) : (<><RefreshCw className="w-4 h-4" />{t('memeGenerator.generate')}</>)}
              </button>
              {result && (
                <button onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.72_0.17_160/0.4)]">
                  <Download className="w-4 h-4" />{t('common.download')}
                </button>
              )}
            </div>

            {/* Result */}
            {resultUrl && (
              <div className="mt-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                <div className="p-6 rounded-2xl border border-[oklch(0.72_0.17_160/0.2)] bg-[oklch(0.72_0.17_160/0.05)]">
                  <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4">{t('memeGenerator.result')}</h3>
                  <div className="flex justify-center">
                    <img src={resultUrl} alt="Generated meme" className="rounded-lg border border-[oklch(1_0_0/0.1)] max-w-full max-h-[500px]" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse title={t('memeGenerator.howToUse.title')} description={t('memeGenerator.howToUse.description')} accentColor="amber"
            steps={[
              { number: 1, title: t('memeGenerator.howToUse.step1Title'), description: t('memeGenerator.howToUse.step1Desc') },
              { number: 2, title: t('memeGenerator.howToUse.step2Title'), description: t('memeGenerator.howToUse.step2Desc') },
              { number: 3, title: t('memeGenerator.howToUse.step3Title'), description: t('memeGenerator.howToUse.step3Desc') },
            ]}
            supportedFormats={['JPG/JPEG', 'PNG', 'WebP', 'GIF']}
          />
        </div>
      </div>
    </div>
  );
}
