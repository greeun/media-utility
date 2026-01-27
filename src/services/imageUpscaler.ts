/**
 * 이미지 업스케일 서비스 - UpscalerJS 기반
 * AI 모델을 사용하여 저해상도 이미지를 고해상도로 확대
 */

export interface UpscaleOptions {
  scale: 2 | 3 | 4;
  format: 'png' | 'jpg' | 'webp';
  quality?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let upscalerInstance: any = null;
let currentScale: number = 0;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'));
    img.src = src;
  });
}

async function getUpscaler(scale: number) {
  if (upscalerInstance && currentScale === scale) return upscalerInstance;

  // 기존 인스턴스 정리
  if (upscalerInstance) {
    try { upscalerInstance.dispose(); } catch { /* ignore */ }
  }

  const Upscaler = (await import('upscaler')).default;
  const model = (await import('@upscalerjs/esrgan-slim')).default;

  upscalerInstance = new Upscaler({
    model: {
      ...model,
      scale,
    },
  });
  currentScale = scale;

  return upscalerInstance;
}

/**
 * 이미지 업스케일 (AI 확대)
 */
export async function upscaleImage(
  file: File,
  options: UpscaleOptions = { scale: 2, format: 'png' },
  onProgress?: (progress: number) => void
): Promise<Blob> {
  onProgress?.(5);

  const url = URL.createObjectURL(file);

  try {
    const img = await loadImage(url);

    onProgress?.(10);

    const upscaler = await getUpscaler(options.scale);

    onProgress?.(20);

    // UpscalerJS가 처리 - 결과는 base64 data URL 문자열
    const result = await upscaler.upscale(img, {
      output: 'tensor',
      patchSize: 64,
      padding: 4,
      progress: (percent: number) => {
        // 20% ~ 85% 구간에 매핑
        onProgress?.(20 + Math.floor(percent * 65));
      },
    });

    onProgress?.(85);

    // Tensor → Canvas → Blob
    const tf = await import('@tensorflow/tfjs');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth * options.scale;
    canvas.height = img.naturalHeight * options.scale;

    await tf.browser.toPixels(result, canvas);
    result.dispose();

    onProgress?.(90);

    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      webp: 'image/webp',
    };
    const mimeType = mimeMap[options.format] || 'image/png';

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('업스케일 변환에 실패했습니다.'))),
        mimeType,
        options.format === 'png' ? undefined : (options.quality ?? 0.92)
      );
    });

    onProgress?.(100);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
