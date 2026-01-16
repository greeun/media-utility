// 파일 타입 정의
export interface MediaFile {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  preview?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob | string;
  error?: string;
}

// 변환 옵션 타입
export interface ConversionOptions {
  format: string;
  quality?: number;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

// 이미지 편집 옵션
export interface ImageEditOptions {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: number;
  quality?: number;
}

// GIF 생성 옵션
export interface GifOptions {
  width?: number;
  height?: number;
  delay?: number;
  quality?: number;
  repeat?: number;
}

// 비디오 변환 옵션
export interface VideoOptions {
  format?: 'gif' | 'mp4' | 'frames';
  fps?: number;
  startTime?: number;
  duration?: number;
  width?: number;
  height?: number;
}

// URL 생성 옵션
export interface UrlOptions {
  type: 'base64' | 'blob';
  expiresIn?: number;
}

// 지원 포맷
export const SUPPORTED_IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'heif'] as const;
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'avi'] as const;

export type ImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];
export type VideoFormat = typeof SUPPORTED_VIDEO_FORMATS[number];

// 도구 타입
export type ToolType =
  | 'image-converter'
  | 'image-editor'
  | 'gif-maker'
  | 'video-converter'
  | 'url-generator';

// 도구 정보
export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  href: string;
}
