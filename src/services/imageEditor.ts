import { loadImage } from './imageConverter';
import { ImageEditOptions } from '@/types';

/**
 * 이미지 자르기
 */
export async function cropImage(
  file: File | Blob,
  crop: { x: number; y: number; width: number; height: number },
  outputFormat: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  const img = await loadImage(file instanceof File ? file : new File([file], 'image'));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  // 자르기 영역 설정
  canvas.width = crop.width;
  canvas.height = crop.height;

  // 이미지 자르기
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 자르기에 실패했습니다.'));
        }
      },
      outputFormat,
      quality
    );
  });
}

/**
 * 이미지 회전
 */
export async function rotateImage(
  file: File | Blob,
  degrees: number,
  outputFormat: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  const img = await loadImage(file instanceof File ? file : new File([file], 'image'));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  // 90도 또는 270도 회전 시 캔버스 크기 변경
  const isVerticalRotation = degrees === 90 || degrees === 270 || degrees === -90 || degrees === -270;

  if (isVerticalRotation) {
    canvas.width = img.height;
    canvas.height = img.width;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }

  // 중심점으로 이동 후 회전
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 회전에 실패했습니다.'));
        }
      },
      outputFormat,
      quality
    );
  });
}

/**
 * 이미지 뒤집기
 */
export async function flipImage(
  file: File | Blob,
  direction: 'horizontal' | 'vertical',
  outputFormat: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  const img = await loadImage(file instanceof File ? file : new File([file], 'image'));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  canvas.width = img.width;
  canvas.height = img.height;

  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 뒤집기에 실패했습니다.'));
        }
      },
      outputFormat,
      quality
    );
  });
}

/**
 * 이미지 리사이즈
 */
export async function resizeImage(
  file: File | Blob,
  width: number,
  height: number,
  maintainAspectRatio: boolean = true,
  outputFormat: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  const img = await loadImage(file instanceof File ? file : new File([file], 'image'));

  let targetWidth = width;
  let targetHeight = height;

  if (maintainAspectRatio) {
    const aspectRatio = img.width / img.height;
    if (width / height > aspectRatio) {
      targetWidth = Math.round(height * aspectRatio);
    } else {
      targetHeight = Math.round(width / aspectRatio);
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 고품질 리사이징
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 리사이즈에 실패했습니다.'));
        }
      },
      outputFormat,
      quality
    );
  });
}
