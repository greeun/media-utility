import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { detectFaces, applyFaceBlur } from '@/services/faceBlur';
import { saveAs } from 'file-saver';
import type { BlurFile } from '../_types';

export function useFaceBlur() {
  const [files, setFiles] = useState<BlurFile[]>([]);

  const addFiles = useCallback((newFiles: BlurFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<BlurFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
  }, [files]);

  const completedCount = files.filter((f) => f.status === 'completed').length;

  const [blurType, setBlurType] = useState<'gaussian' | 'mosaic'>('gaussian');
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const firstFile = files[0] ?? null;

  // useFileManager의 pendingCount는 'pending'|'error'만 포함하므로 그대로 사용 가능
  // 하지만 'detecting'/'detected'는 별도 필터링 필요
  const pendingCount = useMemo(
    () => files.filter((f) => f.status === 'pending' || f.status === 'error').length,
    [files]
  );
  const detectedCount = useMemo(
    () => files.filter((f) => f.status === 'detected').length,
    [files]
  );

  // 파일 선택 핸들러
  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      const newFiles: BlurFile[] = selectedFiles
        .filter((f) => f.type.startsWith('image/'))
        .map((f) => ({
          id: crypto.randomUUID(),
          originalFile: f,
          originalName: f.name,
          preview: URL.createObjectURL(f),
          status: 'pending' as const,
          progress: 0,
          faces: [],
        }));
      addFiles(newFiles);
    },
    [addFiles]
  );

  // 얼굴 감지
  const handleDetect = useCallback(async () => {
    setIsProcessing(true);
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');

    for (const file of pending) {
      updateFile(file.id, { status: 'detecting', progress: 10 } as Partial<BlurFile>);
      try {
        const faces = await detectFaces(file.originalFile);
        updateFile(file.id, { status: 'detected', progress: 50, faces } as Partial<BlurFile>);
      } catch (error) {
        updateFile(file.id, {
          status: 'error',
          error: (error as Error).message,
        } as Partial<BlurFile>);
      }
    }
    setIsProcessing(false);
  }, [files, updateFile]);

  // 블러 적용
  const handleApplyBlur = useCallback(async () => {
    setIsProcessing(true);
    const detected = files.filter((f) => f.status === 'detected');

    for (const file of detected) {
      updateFile(file.id, { status: 'processing', progress: 50 } as Partial<BlurFile>);
      try {
        const result = await applyFaceBlur(
          file.originalFile,
          file.faces,
          { blurType, blurIntensity, autoDetect: true },
          (p) => updateFile(file.id, { progress: 50 + p * 0.5 } as Partial<BlurFile>)
        );
        updateFile(file.id, { status: 'completed', progress: 100, result } as Partial<BlurFile>);
      } catch (error) {
        updateFile(file.id, {
          status: 'error',
          error: (error as Error).message,
        } as Partial<BlurFile>);
      }
    }
    setIsProcessing(false);
  }, [files, updateFile, blurType, blurIntensity]);

  // 다운로드
  const handleDownload = useCallback(
    (file: BlurFile) => {
      if (file.result) {
        const baseName = file.originalName.substring(0, file.originalName.lastIndexOf('.')) || file.originalName;
        const ext = file.originalName.split('.').pop() || 'png';
        saveAs(file.result, `${baseName}_blurred.${ext}`);
      }
    },
    []
  );

  const handleDownloadAll = useCallback(() => {
    files.filter((f) => f.status === 'completed' && f.result).forEach(handleDownload);
  }, [files, handleDownload]);

  // 미리보기 캔버스 - 감지된 얼굴 표시
  useEffect(() => {
    if (!previewCanvasRef.current || !firstFile || firstFile.faces.length === 0) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(500 / img.naturalWidth, 400 / img.naturalHeight, 1);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 얼굴 영역 박스 표시
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);

      for (const face of firstFile.faces) {
        const x = face.x * scale;
        const y = face.y * scale;
        const w = face.width * scale;
        const h = face.height * scale;
        ctx.strokeRect(x, y, w, h);

        // 신뢰도 표시
        ctx.setLineDash([]);
        ctx.fillStyle = '#EC4899';
        ctx.font = `bold ${12 * scale}px sans-serif`;
        ctx.fillText(`${Math.round(face.confidence * 100)}%`, x, y - 4 * scale);
        ctx.setLineDash([6, 4]);
      }
    };
    img.src = firstFile.preview;
  }, [firstFile]);

  return {
    files,
    blurType,
    setBlurType,
    blurIntensity,
    setBlurIntensity,
    isProcessing,
    previewCanvasRef,
    firstFile,
    pendingCount,
    detectedCount,
    completedCount,
    handleFilesSelected,
    handleDetect,
    handleApplyBlur,
    handleDownload,
    handleDownloadAll,
    removeFile,
    clearAll,
  };
}
