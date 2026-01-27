/**
 * 워터마크 서비스 - Canvas API 기반 텍스트/이미지 워터마크
 */

export type WatermarkPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

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

export interface ImageWatermarkOptions {
  watermarkImage: HTMLImageElement;
  scale: number;
  opacity: number;
  position: WatermarkPosition;
  tileMode: boolean;
}

function getPositionCoords(
  position: WatermarkPosition,
  canvasW: number,
  canvasH: number,
  wmW: number,
  wmH: number,
  margin = 20
): { x: number; y: number } {
  const positions: Record<WatermarkPosition, { x: number; y: number }> = {
    'top-left': { x: margin, y: margin },
    'top-center': { x: (canvasW - wmW) / 2, y: margin },
    'top-right': { x: canvasW - wmW - margin, y: margin },
    'center-left': { x: margin, y: (canvasH - wmH) / 2 },
    'center': { x: (canvasW - wmW) / 2, y: (canvasH - wmH) / 2 },
    'center-right': { x: canvasW - wmW - margin, y: (canvasH - wmH) / 2 },
    'bottom-left': { x: margin, y: canvasH - wmH - margin },
    'bottom-center': { x: (canvasW - wmW) / 2, y: canvasH - wmH - margin },
    'bottom-right': { x: canvasW - wmW - margin, y: canvasH - wmH - margin },
  };
  return positions[position];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'));
    img.src = src;
  });
}

/**
 * 텍스트 워터마크 적용
 */
export async function applyTextWatermark(
  file: File,
  options: TextWatermarkOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { text, fontSize, fontFamily, color, opacity, rotation, position, tileMode } = options;

  onProgress?.(10);

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    onProgress?.(40);

    ctx.globalAlpha = opacity;
    ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';

    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontSize * 1.2;

    if (tileMode) {
      const spacingX = textW + 80;
      const spacingY = textH + 80;
      for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
          ctx.save();
          ctx.translate(x + textW / 2, y + textH / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(text, -textW / 2, -textH / 2);
          ctx.restore();
        }
      }
    } else {
      const pos = getPositionCoords(position, canvas.width, canvas.height, textW, textH);
      ctx.save();
      ctx.translate(pos.x + textW / 2, pos.y + textH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, -textW / 2, -textH / 2);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    onProgress?.(80);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('워터마크 적용에 실패했습니다.'))),
        file.type || 'image/png',
        0.92
      );
    });

    onProgress?.(100);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * 이미지 워터마크 적용
 */
export async function applyImageWatermark(
  file: File,
  options: ImageWatermarkOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { watermarkImage, scale, opacity, position, tileMode } = options;

  onProgress?.(10);

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    onProgress?.(40);

    const wmW = watermarkImage.naturalWidth * scale;
    const wmH = watermarkImage.naturalHeight * scale;

    ctx.globalAlpha = opacity;

    if (tileMode) {
      const spacingX = wmW + 60;
      const spacingY = wmH + 60;
      for (let y = 0; y < canvas.height; y += spacingY) {
        for (let x = 0; x < canvas.width; x += spacingX) {
          ctx.drawImage(watermarkImage, x, y, wmW, wmH);
        }
      }
    } else {
      const pos = getPositionCoords(position, canvas.width, canvas.height, wmW, wmH);
      ctx.drawImage(watermarkImage, pos.x, pos.y, wmW, wmH);
    }

    ctx.globalAlpha = 1;
    onProgress?.(80);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('워터마크 적용에 실패했습니다.'))),
        file.type || 'image/png',
        0.92
      );
    });

    onProgress?.(100);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
