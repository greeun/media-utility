'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Minimize2,
  RefreshCw,
  Crop,
  Sun,
} from 'lucide-react';
import { rotateImage, flipImage, resizeImage, cropImage, adjustBrightness } from '@/services/imageEditor';
import { optimizeImage } from '@/services/imageConverter';
import { saveAs } from 'file-saver';
import type { EditMode, CropType, ToolbarButton } from '../_types';

export function useImageEditor() {
  const t = useTranslations();

  // 파일 및 미리보기 상태
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 자르기 상태
  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);

  // 크기 변경 상태
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(800 / 600);

  // 최적화 상태
  const [optimizeQuality, setOptimizeQuality] = useState(80);
  const [maxSize, setMaxSize] = useState(1);

  // 명도 조절 상태
  const [brightness, setBrightness] = useState(0);
  const [luminance, setLuminance] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [exposure, setExposure] = useState(0);

  // 드래그 앤 드롭 상태
  const [isDragging, setIsDragging] = useState(false);

  // 파일 처리
  const processFile = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setEditedBlob(null);
      setEditMode(null);
      setCrop(undefined);
      setBrightness(0);
      setLuminance(0);
      setContrast(0);
      setExposure(0);

      const img = new Image();
      img.onload = () => {
        setResizeWidth(img.width);
        setResizeHeight(img.height);
        if (img.height > 0) {
          setAspectRatio(img.width / img.height);
        }
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  }, []);

  // 편집 결과(preview)가 바뀔 때마다 현재 이미지 크기/비율을 동기화
  useEffect(() => {
    if (!preview) return;
    const img = new Image();
    img.onload = () => {
      setResizeWidth(img.width);
      setResizeHeight(img.height);
      if (img.height > 0) {
        setAspectRatio(img.width / img.height);
      }
    };
    img.src = preview;
  }, [preview]);

  // 너비 변경 - 비율 유지 시 높이 자동 계산
  const handleResizeWidthChange = useCallback(
    (width: number) => {
      setResizeWidth(width);
      if (maintainRatio && width > 0 && aspectRatio > 0) {
        setResizeHeight(Math.max(1, Math.round(width / aspectRatio)));
      }
    },
    [maintainRatio, aspectRatio],
  );

  // 높이 변경 - 비율 유지 시 너비 자동 계산
  const handleResizeHeightChange = useCallback(
    (height: number) => {
      setResizeHeight(height);
      if (maintainRatio && height > 0 && aspectRatio > 0) {
        setResizeWidth(Math.max(1, Math.round(height * aspectRatio)));
      }
    },
    [maintainRatio, aspectRatio],
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [processFile]);

  // 드래그 앤 드롭 핸들러
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
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  // 현재 소스 가져오기
  const getCurrentSource = (): File | Blob => {
    return editedBlob || file!;
  };

  // 회전 처리
  const handleRotate = async (degrees: number) => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const result = await rotateImage(getCurrentSource(), degrees);
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
    } catch (error) {
      console.error('Rotate error:', error);
    }
    setIsProcessing(false);
  };

  // 뒤집기 처리
  const handleFlip = async (direction: 'horizontal' | 'vertical') => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const result = await flipImage(getCurrentSource(), direction);
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
    } catch (error) {
      console.error('Flip error:', error);
    }
    setIsProcessing(false);
  };

  // 자르기 적용
  const handleCropApply = async () => {
    if (!crop || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const result = await cropImage(getCurrentSource(), {
        x: crop.x * scaleX,
        y: crop.y * scaleY,
        width: crop.width * scaleX,
        height: crop.height * scaleY,
      });
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
      setEditMode(null);
      setCrop(undefined);
    } catch (error) {
      console.error('Crop error:', error);
    }
    setIsProcessing(false);
  };

  // 크기 변경 처리
  const handleResize = async () => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const result = await resizeImage(getCurrentSource(), resizeWidth, resizeHeight, maintainRatio);
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
      setEditMode(null);
    } catch (error) {
      console.error('Resize error:', error);
    }
    setIsProcessing(false);
  };

  // 최적화 처리
  const handleOptimize = async () => {
    if (!file && !editedBlob) return;
    setIsProcessing(true);
    try {
      const source = getCurrentSource();
      const sourceFile = source instanceof File ? source : new File([source], 'image.jpg');
      const result = await optimizeImage(sourceFile, {
        maxSizeMB: maxSize,
        quality: optimizeQuality / 100,
      });
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
      setEditMode(null);
    } catch (error) {
      console.error('Optimize error:', error);
    }
    setIsProcessing(false);
  };

  // 명도 조절 적용
  const handleBrightnessApply = async () => {
    if ((!file && !editedBlob) || (brightness === 0 && luminance === 0 && contrast === 0 && exposure === 0)) return;
    setIsProcessing(true);
    try {
      const result = await adjustBrightness(getCurrentSource(), brightness, luminance, contrast, exposure);
      setEditedBlob(result);
      setPreview(URL.createObjectURL(result));
      setBrightness(0);
      setLuminance(0);
      setContrast(0);
      setExposure(0);
      setEditMode(null);
    } catch (error) {
      console.error('Brightness adjustment error:', error);
    }
    setIsProcessing(false);
  };

  // 다운로드 처리
  const handleDownload = () => {
    const blob = editedBlob || file;
    if (blob) {
      const filename = file?.name || 'edited-image.jpg';
      const newName = `edited_${filename}`;
      saveAs(blob, newName);
    }
  };

  // 초기화 처리
  const handleReset = () => {
    if (file) {
      setEditedBlob(null);
      setPreview(URL.createObjectURL(file));
      setEditMode(null);
      setCrop(undefined);
      setBrightness(0);
      setLuminance(0);
      setContrast(0);
      setExposure(0);
    }
  };

  // 툴바 버튼 목록
  const toolbarButtons: ToolbarButton[] = [
    { mode: 'crop', icon: Crop, label: t('imageEditor.toolbar.crop'), action: () => setEditMode(editMode === 'crop' ? null : 'crop') },
    { icon: RotateCcw, label: t('imageEditor.rotate.left'), action: () => handleRotate(-90) },
    { icon: RotateCw, label: t('imageEditor.rotate.right'), action: () => handleRotate(90) },
    { icon: FlipHorizontal, label: t('imageEditor.flip.horizontal'), action: () => handleFlip('horizontal') },
    { icon: FlipVertical, label: t('imageEditor.flip.vertical'), action: () => handleFlip('vertical') },
    { mode: 'resize', icon: Minimize2, label: t('imageEditor.toolbar.resize'), action: () => setEditMode(editMode === 'resize' ? null : 'resize') },
    { mode: 'optimize', icon: RefreshCw, label: t('imageEditor.toolbar.optimize'), action: () => setEditMode(editMode === 'optimize' ? null : 'optimize') },
    { mode: 'brightness', icon: Sun, label: t('imageEditor.toolbar.brightness'), action: () => setEditMode(editMode === 'brightness' ? null : 'brightness') },
  ];

  return {
    // 상태
    file,
    preview,
    editedBlob,
    editMode,
    isProcessing,
    crop,
    setCrop,
    imgRef,
    resizeWidth,
    setResizeWidth,
    resizeHeight,
    setResizeHeight,
    handleResizeWidthChange,
    handleResizeHeightChange,
    maintainRatio,
    setMaintainRatio,
    optimizeQuality,
    setOptimizeQuality,
    maxSize,
    brightness,
    setBrightness,
    luminance,
    setLuminance,
    contrast,
    setContrast,
    exposure,
    setExposure,
    isDragging,

    // 핸들러
    handleFileSelect,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleCropApply,
    handleResize,
    handleOptimize,
    handleBrightnessApply,
    handleDownload,
    handleReset,

    // 툴바
    toolbarButtons,
  };
}
