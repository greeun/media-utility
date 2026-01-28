'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, RefreshCw, Code, Eye } from 'lucide-react';
import { HtmlToImageIcon } from '@/components/icons/FeatureIcons';
import { convertHtmlToImage } from '@/services/htmlToImage';
import { saveAs } from 'file-saver';
import ToolConstraints from '@/components/common/ToolConstraints';
import HowToUse from '@/components/common/HowToUse';

const DEFAULT_HTML = `<div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
  <h1 style="font-size: 32px; color: #333; margin-bottom: 16px;">Hello, World!</h1>
  <p style="font-size: 16px; color: #666;">This is a preview of HTML to Image conversion.</p>
</div>`;

const DEFAULT_CSS = `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}`;

export default function HtmlToImagePage() {
  const t = useTranslations();

  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [format, setFormat] = useState<'png' | 'jpg' | 'svg'>('png');
  const [quality, setQuality] = useState(92);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');

  const previewRef = useRef<HTMLIFrameElement>(null);

  // 실시간 미리보기
  useEffect(() => {
    if (!previewRef.current) return;
    const doc = previewRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
<style>
html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: ${backgroundColor}; }
${css || ''}
</style>
</head>
<body>${html}</body>
</html>`);
    doc.close();
  }, [html, css, backgroundColor]);

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const blob = await convertHtmlToImage({
        html,
        css,
        width,
        height,
        format,
        quality: quality / 100,
        backgroundColor,
      });
      setResult(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('HTML 변환 실패:', error);
    }
    setIsConverting(false);
  };

  const handleDownload = () => {
    if (result) {
      saveAs(result, `html-capture.${format}`);
    }
  };

  return (
    <div className="min-h-full bg-[oklch(0.08_0.01_240)] py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[oklch(0.70_0.17_145)] flex items-center justify-center shadow-[0_0_30px_oklch(0.70_0.17_145/0.3)]">
              <HtmlToImageIcon size={28} className="text-[oklch(0.08_0.01_240)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.95_0.01_80)]">{t('htmlToImage.title')}</h1>
              <p className="mt-1 text-[oklch(0.55_0.02_240)]">{t('htmlToImage.description')}</p>
            </div>
          </div>
        </div>

        {/* 제약사항 */}
        <ToolConstraints
          constraints={[t('htmlToImage.constraints.0'), t('htmlToImage.constraints.1')]}
          accentColor="emerald"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 코드 에디터 */}
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] h-full">
              {/* 탭 */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => setActiveTab('html')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'html' ? 'bg-[oklch(0.70_0.17_145)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}>
                  <Code className="w-3.5 h-3.5" /> HTML
                </button>
                <button onClick={() => setActiveTab('css')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'css' ? 'bg-[oklch(0.70_0.17_145)] text-[oklch(0.08_0.01_240)]' : 'bg-[oklch(0.16_0.02_245)] text-[oklch(0.70_0.02_240)] hover:bg-[oklch(0.20_0.025_240)]'}`}>
                  <Code className="w-3.5 h-3.5" /> CSS
                </button>
              </div>

              {activeTab === 'html' ? (
                <textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder={t('htmlToImage.htmlPlaceholder')}
                  className="w-full h-64 px-4 py-3 rounded-lg bg-[oklch(0.06_0.01_240)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.90_0.01_80)] text-sm font-mono resize-none focus:outline-none focus:border-[oklch(0.70_0.17_145/0.5)]" />
              ) : (
                <textarea value={css} onChange={(e) => setCss(e.target.value)} placeholder={t('htmlToImage.cssPlaceholder')}
                  className="w-full h-64 px-4 py-3 rounded-lg bg-[oklch(0.06_0.01_240)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.90_0.01_80)] text-sm font-mono resize-none focus:outline-none focus:border-[oklch(0.70_0.17_145/0.5)]" />
              )}

              {/* 설정 */}
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-1">{t('htmlToImage.width')}</label>
                    <input type="number" min={100} max={4000} value={width} onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-1">{t('htmlToImage.height')}</label>
                    <input type="number" min={100} max={4000} value={height} onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-1">{t('htmlToImage.format')}</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpg' | 'svg')}
                      className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm">
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="svg">SVG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-1">{t('htmlToImage.quality')}</label>
                    <input type="number" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[oklch(0.16_0.02_245)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.95_0.01_80)] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[oklch(0.60_0.02_240)] mb-1">{t('htmlToImage.bgColor')}</label>
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full h-9 rounded-lg cursor-pointer border border-[oklch(1_0_0/0.1)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            <div className="p-6 rounded-2xl border border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)] h-full">
              <h3 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[oklch(0.70_0.17_145)]" />
                {t('htmlToImage.preview')}
              </h3>
              <div className="rounded-lg border border-[oklch(1_0_0/0.1)] overflow-hidden" style={{ backgroundColor }}>
                <iframe
                  ref={previewRef}
                  title="HTML Preview"
                  className="w-full border-0"
                  style={{ height: '300px' }}
                  sandbox="allow-same-origin"
                />
              </div>

              {/* 결과 */}
              {resultUrl && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-[oklch(0.95_0.01_80)] mb-2">{t('htmlToImage.result')}</h4>
                  <div className="rounded-lg border border-[oklch(0.72_0.17_160/0.2)] overflow-hidden">
                    <img src={resultUrl} alt="Converted result" className="w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <button onClick={handleConvert} disabled={isConverting || !html.trim()}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.70_0.17_145)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.70_0.17_145/0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
            {isConverting ? (<><RefreshCw className="w-4 h-4 animate-spin" />{t('htmlToImage.converting')}</>) : (<><RefreshCw className="w-4 h-4" />{t('htmlToImage.convert')}</>)}
          </button>
          {result && (
            <button onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)] font-semibold transition-all hover:shadow-[0_0_30px_oklch(0.72_0.17_160/0.4)]">
              <Download className="w-4 h-4" />{t('common.download')}
            </button>
          )}
        </div>

        {/* How To Use */}
        <div className="mt-12">
          <HowToUse title={t('htmlToImage.howToUse.title')} description={t('htmlToImage.howToUse.description')} accentColor="emerald"
            steps={[
              { number: 1, title: t('htmlToImage.howToUse.step1Title'), description: t('htmlToImage.howToUse.step1Desc') },
              { number: 2, title: t('htmlToImage.howToUse.step2Title'), description: t('htmlToImage.howToUse.step2Desc') },
              { number: 3, title: t('htmlToImage.howToUse.step3Title'), description: t('htmlToImage.howToUse.step3Desc') },
            ]}
            supportedFormats={['PNG', 'JPG', 'SVG']}
            features={[
              { title: t('htmlToImage.features.code'), description: t('htmlToImage.features.codeDesc') },
              { title: t('htmlToImage.features.preview'), description: t('htmlToImage.features.previewDesc') },
              { title: t('htmlToImage.features.format'), description: t('htmlToImage.features.formatDesc') },
              { title: t('htmlToImage.features.size'), description: t('htmlToImage.features.sizeDesc') },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
