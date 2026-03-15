'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { convertHtmlToImage } from '@/services/htmlToImage';
import { saveAs } from 'file-saver';
import { DEFAULT_HTML, DEFAULT_CSS } from '../_constants';
import type { ImageFormat } from '../_types';

export function useHtmlToImage() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [format, setFormat] = useState<ImageFormat>('png');
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

  const handleConvert = useCallback(async () => {
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
  }, [html, css, width, height, format, quality, backgroundColor, resultUrl]);

  const handleDownload = useCallback(() => {
    if (result) {
      saveAs(result, `html-capture.${format}`);
    }
  }, [result, format]);

  return {
    // 상태
    html,
    css,
    width,
    height,
    format,
    quality,
    backgroundColor,
    isConverting,
    result,
    resultUrl,
    activeTab,
    previewRef,

    // 상태 변경
    setHtml,
    setCss,
    setWidth,
    setHeight,
    setFormat,
    setQuality,
    setBackgroundColor,
    setActiveTab,

    // 액션
    handleConvert,
    handleDownload,
  };
}
