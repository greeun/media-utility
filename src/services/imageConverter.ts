import imageCompression from 'browser-image-compression';
import { ConversionOptions } from '@/types';

/**
 * 이미지 포맷 변환
 */
export async function convertImage(
  file: File,
  options: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { format, quality = 0.9, width, height, maintainAspectRatio = true } = options;

  // 이미지 로드
  const img = await loadImage(file);

  // 캔버스 생성
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  // 크기 계산
  let targetWidth = width || img.width;
  let targetHeight = height || img.height;

  if (maintainAspectRatio && (width || height)) {
    const aspectRatio = img.width / img.height;
    if (width && !height) {
      targetHeight = Math.round(width / aspectRatio);
    } else if (height && !width) {
      targetWidth = Math.round(height * aspectRatio);
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  onProgress?.(30);

  // 이미지 그리기
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  onProgress?.(60);

  // 포맷 변환
  const mimeType = getMimeType(format);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 변환에 실패했습니다.'));
        }
      },
      mimeType,
      quality
    );
  });

  onProgress?.(100);

  return blob;
}

/**
 * 이미지 압축/최적화
 */
export async function optimizeImage(
  file: File,
  options: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
  } = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { maxSizeMB = 1, maxWidthOrHeight = 1920, quality = 0.8 } = options;

  const compressedFile = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    initialQuality: quality,
    useWebWorker: true,
    onProgress: (p) => onProgress?.(p),
  });

  return compressedFile;
}

/**
 * 이미지 로드 헬퍼
 */
export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    img.src = url;
  });
}

/**
 * MIME 타입 변환
 */
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  };

  return mimeTypes[format.toLowerCase()] || 'image/png';
}

/**
 * 파일 확장자 추출
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * 새 파일명 생성
 */
export function generateNewFilename(originalName: string, newFormat: string): string {
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  return `${baseName}.${newFormat}`;
}
