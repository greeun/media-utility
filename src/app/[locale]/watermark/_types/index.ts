import type { BaseFile } from '@/hooks/useFileManager';
import type { WatermarkPosition } from '@/services/watermark';

// 워터마크 타입 (텍스트 또는 이미지)
export type WatermarkType = 'text' | 'image';

// 워터마크 처리된 파일
export interface WatermarkedFile extends BaseFile {}

// 텍스트 워터마크 옵션
export interface TextWatermarkOptions {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  rotation: number;
  position: WatermarkPosition;
  tileMode: boolean;
}

// 이미지 워터마크 옵션
export interface ImageWatermarkOptions {
  wmImagePreview: string;
  wmImageElement: HTMLImageElement | null;
  wmScale: number;
  opacity: number;
  position: WatermarkPosition;
  tileMode: boolean;
}
