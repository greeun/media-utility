/**
 * HEIC/HEIF 파일을 JPG/PNG로 변환
 * heic-to 라이브러리 사용 (libheif 1.20.2 기반)
 */
export async function convertHeicToJpg(
  file: File,
  options: { quality?: number; toType?: 'image/jpeg' | 'image/png' } = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { quality = 0.9, toType = 'image/jpeg' } = options;

  onProgress?.(10);

  // heic-to 동적 import (SSR 방지)
  const { heicTo } = await import('heic-to');

  onProgress?.(30);

  try {
    const result = await heicTo({
      blob: file,
      type: toType,
      quality,
    });

    onProgress?.(100);

    return result as Blob;
  } catch (error: unknown) {
    let errorMessage = 'HEIC 파일 변환에 실패했습니다.';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      const errObj = error as { message?: string; code?: string | number };
      if (errObj.message) {
        errorMessage = errObj.message;
      } else if (errObj.code) {
        errorMessage = `HEIC 변환 오류 (코드: ${errObj.code})`;
      }
    }

    console.error('HEIC 변환 오류:', errorMessage, error);
    throw new Error(errorMessage);
  }
}

/**
 * 파일이 HEIC/HEIF인지 확인
 */
export function isHeicFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return (
    extension === 'heic' ||
    extension === 'heif' ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  );
}
