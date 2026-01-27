/**
 * PSD 변환 서비스 - @webtoon/psd 기반
 */

/**
 * PSD 파일을 래스터 이미지로 변환
 */
export async function convertPsdToImage(
  file: File,
  format: 'png' | 'jpg' | 'webp' = 'png',
  options?: { quality?: number },
  onProgress?: (progress: number) => void
): Promise<Blob> {
  onProgress?.(10);

  const Psd = (await import('@webtoon/psd')).default;

  onProgress?.(20);

  const arrayBuffer = await file.arrayBuffer();
  const psd = Psd.parse(arrayBuffer);

  onProgress?.(40);

  const canvas = document.createElement('canvas');
  canvas.width = psd.width;
  canvas.height = psd.height;
  const ctx = canvas.getContext('2d')!;

  // compositeBuffer: Uint8ClampedArray (RGBA)
  const compositeBuffer = await psd.composite();

  onProgress?.(60);

  const pixelData = new Uint8ClampedArray(compositeBuffer.buffer as ArrayBuffer);
  const imageData = new ImageData(pixelData, psd.width, psd.height);
  ctx.putImageData(imageData, 0, 0);

  onProgress?.(80);

  // JPG는 투명도 미지원 → 흰색 배경 추가
  if (format === 'jpg') {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = psd.width;
    bgCanvas.height = psd.height;
    const bgCtx = bgCanvas.getContext('2d')!;
    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.drawImage(canvas, 0, 0);

    const mimeType = 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      bgCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('PSD 변환에 실패했습니다.'))),
        mimeType,
        options?.quality ?? 0.92
      );
    });
    onProgress?.(100);
    return blob;
  }

  const mimeMap: Record<string, string> = {
    png: 'image/png',
    webp: 'image/webp',
  };
  const mimeType = mimeMap[format] || 'image/png';

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('PSD 변환에 실패했습니다.'))),
      mimeType,
      format === 'png' ? undefined : (options?.quality ?? 0.92)
    );
  });

  onProgress?.(100);
  return blob;
}

/**
 * PSD 파일 여부 확인
 */
export function isPsdFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith('.psd') ||
    file.type === 'image/vnd.adobe.photoshop' ||
    file.type === 'application/x-photoshop'
  );
}
