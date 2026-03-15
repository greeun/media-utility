import { useState, useCallback, useRef, useEffect } from 'react';
import { generateMeme } from '@/services/memeGenerator';
import { saveAs } from 'file-saver';
import type { MemeOptions } from '../_types';

export function useMemeGenerator() {
  // 파일 상태
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');

  // 텍스트 옵션 상태
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(60);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fontFamily, setFontFamily] = useState('Impact');

  // 처리 상태
  const [isGenerating, setIsGenerating] = useState(false);

  // 캔버스 참조
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // 파일 선택 핸들러
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      const imgFile = selectedFiles.find((f) => f.type.startsWith('image/'));
      if (!imgFile) return;
      if (preview) URL.revokeObjectURL(preview);
      setFile(imgFile);
      setPreview(URL.createObjectURL(imgFile));
      setResult(null);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl('');
    },
    [preview, resultUrl]
  );

  // 초기화 핸들러
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

  // 밈 생성 핸들러
  const handleGenerate = useCallback(async () => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const blob = await generateMeme(file, {
        topText,
        bottomText,
        fontSize,
        fontFamily,
        textColor,
        strokeColor,
        strokeWidth,
      });
      setResult(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('밈 생성 실패:', error);
    }
    setIsGenerating(false);
  }, [file, topText, bottomText, fontSize, fontFamily, textColor, strokeColor, strokeWidth, resultUrl]);

  // 다운로드 핸들러
  const handleDownload = useCallback(() => {
    if (result) {
      const baseName = file?.name
        ? file.name.substring(0, file.name.lastIndexOf('.'))
        : 'meme';
      saveAs(result, `${baseName}_meme.png`);
    }
  }, [result, file]);

  // 텍스트가 입력되었는지 여부
  const hasText = topText.trim().length > 0 || bottomText.trim().length > 0;

  return {
    // 파일 상태
    file,
    preview,
    result,
    resultUrl,

    // 텍스트 옵션
    topText,
    setTopText,
    bottomText,
    setBottomText,
    fontSize,
    setFontSize,
    textColor,
    setTextColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    fontFamily,
    setFontFamily,

    // 처리 상태
    isGenerating,
    hasText,

    // 참조
    previewCanvasRef,

    // 액션
    handleFilesSelected,
    handleClear,
    handleGenerate,
    handleDownload,
  };
}
