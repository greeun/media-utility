'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import { applyTextWatermark, applyImageWatermark } from '@/services/watermark';
import type { WatermarkPosition } from '@/services/watermark';
import { saveAs } from 'file-saver';
import type { WatermarkedFile, WatermarkType } from '../_types';

/**
 * 캔버스에 텍스트 워터마크 미리보기를 그리는 함수
 */
function drawTextWatermarkPreview(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scale: number,
  options: {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    opacity: number;
    rotation: number;
    position: WatermarkPosition;
    tileMode: boolean;
  }
) {
  const { text, fontSize, fontFamily, color, opacity, rotation, position, tileMode } = options;
  const previewFontSize = fontSize * scale;
  ctx.globalAlpha = opacity / 100;
  ctx.font = `${previewFontSize}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  const tw = ctx.measureText(text).width;
  const th = previewFontSize * 1.2;

  if (tileMode) {
    // 타일 모드: 반복 패턴으로 워터마크 배치
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
    // 단일 위치 모드
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

/**
 * 워터마크 기능의 모든 상태와 비즈니스 로직을 관리하는 훅
 */
export function useWatermark() {
  const {
    files,
    addFiles,
    updateFile,
    removeFile,
    clearAll,
    pendingCount,
    completedCount,
  } = useFileManager<WatermarkedFile>();

  // 처리 중 상태
  const [isProcessing, setIsProcessing] = useState(false);

  // 워터마크 타입 (텍스트/이미지)
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

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

  // 미리보기 캔버스
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // 워터마크 이미지 선택 핸들러
  const handleWmImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setWmImagePreview(url);
    const img = new Image();
    img.onload = () => setWmImageElement(img);
    img.src = url;
  }, []);

  // 파일 선택 핸들러
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
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
      addFiles(newFiles);
    },
    [addFiles]
  );

  // 워터마크 일괄 적용
  const handleApply = async () => {
    setIsProcessing(true);
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pending) {
      updateFile(file.id, { status: 'processing', progress: 0 });

      try {
        let result: Blob;
        if (watermarkType === 'text') {
          result = await applyTextWatermark(
            file.originalFile,
            {
              text,
              fontSize,
              fontFamily,
              color,
              opacity: opacity / 100,
              rotation,
              position,
              tileMode,
            },
            (p) => updateFile(file.id, { progress: p })
          );
        } else {
          if (!wmImageElement) throw new Error('워터마크 이미지를 선택해주세요.');
          result = await applyImageWatermark(
            file.originalFile,
            {
              watermarkImage: wmImageElement,
              scale: wmScale / 100,
              opacity: opacity / 100,
              position,
              tileMode,
            },
            (p) => updateFile(file.id, { progress: p })
          );
        }
        updateFile(file.id, { status: 'completed', progress: 100, result });
      } catch (error) {
        updateFile(file.id, { status: 'error', error: (error as Error).message });
      }
    }
    setIsProcessing(false);
  };

  // 개별 다운로드
  const handleDownload = useCallback((file: WatermarkedFile) => {
    if (file.result) {
      const baseName =
        file.originalName.substring(0, file.originalName.lastIndexOf('.')) || file.originalName;
      const ext = file.originalName.split('.').pop() || 'png';
      saveAs(file.result, `${baseName}_watermarked.${ext}`);
    }
  }, []);

  // 전체 다운로드
  const handleDownloadAll = useCallback(() => {
    files
      .filter((f) => f.status === 'completed' && f.result)
      .forEach(handleDownload);
  }, [files, handleDownload]);

  // 미리보기 캔버스 렌더링
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

      // 텍스트 워터마크 미리보기
      if (watermarkType === 'text' && text.trim()) {
        drawTextWatermarkPreview(ctx, canvas, scale, {
          text,
          fontSize,
          fontFamily,
          color,
          opacity,
          rotation,
          position,
          tileMode,
        });
      }
    };
    img.src = firstFile.preview;
  }, [firstFile, watermarkType, text, fontSize, fontFamily, color, opacity, rotation, position, tileMode, wmScale]);

  return {
    // 파일 관련
    files,
    removeFile,
    clearAll,
    handleFilesSelected,
    pendingCount,
    completedCount,

    // 처리 상태
    isProcessing,

    // 워터마크 타입
    watermarkType,
    setWatermarkType,

    // 텍스트 옵션
    text,
    setText,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    color,
    setColor,
    opacity,
    setOpacity,
    rotation,
    setRotation,
    position,
    setPosition,
    tileMode,
    setTileMode,

    // 이미지 옵션
    wmImagePreview,
    wmImageElement,
    wmScale,
    setWmScale,
    wmFileRef,
    handleWmImageSelect,

    // 미리보기
    previewCanvasRef,
    firstFile,

    // 액션
    handleApply,
    handleDownload,
    handleDownloadAll,
  };
}
