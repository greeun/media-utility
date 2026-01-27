import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  quality: number; // 0.1 ~ 1.0
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  ratio: number; // 압축률 (%)
}

/**
 * 이미지 압축
 */
export async function compressImage(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  const { quality = 0.8, maxSizeMB, maxWidthOrHeight } = options;
  const originalSize = file.size;

  const compressionOptions: Parameters<typeof imageCompression>[1] = {
    initialQuality: quality,
    useWebWorker: true,
    onProgress: (p) => onProgress?.(p),
  };

  if (maxSizeMB) {
    compressionOptions.maxSizeMB = maxSizeMB;
  } else {
    // maxSizeMB가 없으면 quality 기반 압축을 위해 충분히 큰 값 설정
    compressionOptions.maxSizeMB = originalSize / (1024 * 1024) + 1;
  }

  if (maxWidthOrHeight) {
    compressionOptions.maxWidthOrHeight = maxWidthOrHeight;
  }

  const compressedFile = await imageCompression(file, compressionOptions);
  const compressedSize = compressedFile.size;
  const ratio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return {
    blob: compressedFile,
    originalSize,
    compressedSize,
    ratio,
  };
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
