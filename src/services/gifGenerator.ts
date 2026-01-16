import { loadImage } from './imageConverter';
import { GifOptions } from '@/types';

/**
 * 여러 이미지로 GIF 생성
 */
export async function createGifFromImages(
  files: File[],
  options: GifOptions = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { width = 400, height = 400, delay = 500, quality = 10, repeat = 0 } = options;

  // gif.js 동적 import (SSR 방지)
  const GIF = (await import('gif.js')).default;

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality,
      width,
      height,
      repeat,
      workerScript: '/workers/gif.worker.js',
    });

    let processed = 0;
    const total = files.length;

    // 이미지 로드 및 추가
    const processImages = async () => {
      for (const file of files) {
        try {
          const img = await loadImage(file);

          // 캔버스에 이미지 그리기 (크기 조정)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas context를 생성할 수 없습니다.');
          }

          canvas.width = width;
          canvas.height = height;

          // 이미지 비율 유지하면서 캔버스에 맞추기
          const scale = Math.min(width / img.width, height / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (width - scaledWidth) / 2;
          const y = (height - scaledHeight) / 2;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          gif.addFrame(canvas, { delay, copy: true });

          processed++;
          onProgress?.(Math.round((processed / total) * 80));
        } catch (error) {
          console.error('이미지 처리 오류:', error);
        }
      }

      gif.render();
    };

    gif.on('finished', (blob: Blob) => {
      onProgress?.(100);
      resolve(blob);
    });

    gif.on('progress', (p: number) => {
      onProgress?.(80 + Math.round(p * 20));
    });

    processImages().catch(reject);
  });
}

/**
 * Canvas 프레임들로 GIF 생성
 */
export async function createGifFromCanvases(
  canvases: HTMLCanvasElement[],
  options: GifOptions = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { delay = 100, quality = 10, repeat = 0 } = options;

  const GIF = (await import('gif.js')).default;

  const width = canvases[0]?.width || 400;
  const height = canvases[0]?.height || 400;

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality,
      width,
      height,
      repeat,
      workerScript: '/workers/gif.worker.js',
    });

    canvases.forEach((canvas) => {
      gif.addFrame(canvas, { delay, copy: true });
    });

    gif.on('finished', (blob: Blob) => {
      onProgress?.(100);
      resolve(blob);
    });

    gif.on('progress', (p: number) => {
      onProgress?.(Math.round(p * 100));
    });

    gif.render();
  });
}
