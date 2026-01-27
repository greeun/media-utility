/**
 * RAW 변환 서비스 - LibRaw-Wasm 기반
 * CR2, NEF, ARW, DNG 등 카메라 RAW 파일을 JPG/PNG/WebP로 변환
 */

export interface RawConvertOptions {
  format: 'png' | 'jpg' | 'webp';
  quality?: number; // 0.1 ~ 1.0
}

export interface RawMetadata {
  camera?: string;
  iso?: number;
  shutterSpeed?: string;
  aperture?: string;
  focalLength?: string;
  dateTime?: string;
  width: number;
  height: number;
}

const RAW_EXTENSIONS = [
  '.cr2', '.cr3', '.nef', '.arw', '.dng', '.orf', '.rw2',
  '.raf', '.srw', '.pef', '.rwl', '.raw', '.3fr', '.kdc',
  '.mrw', '.nrw', '.srf', '.sr2', '.x3f', '.erf', '.mef',
];

/**
 * RAW 파일 여부 확인
 */
export function isRawFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return RAW_EXTENSIONS.includes(ext);
}

/**
 * RAW 파일을 래스터 이미지로 변환
 */
export async function convertRawToImage(
  file: File,
  options: RawConvertOptions = { format: 'jpg' },
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; metadata: RawMetadata }> {
  onProgress?.(5);

  const LibRaw = (await import('libraw-wasm')).default;

  onProgress?.(15);

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(25);

  const libraw = new LibRaw();
  await libraw.open(arrayBuffer);

  onProgress?.(40);

  // 메타데이터 추출
  const metadata: RawMetadata = {
    width: libraw.imageWidth ?? 0,
    height: libraw.imageHeight ?? 0,
  };

  try {
    if (libraw.cameraModel) metadata.camera = libraw.cameraModel;
    if (libraw.isoSpeed) metadata.iso = libraw.isoSpeed;
    if (libraw.shutterSpeed) metadata.shutterSpeed = `1/${Math.round(1 / libraw.shutterSpeed)}s`;
    if (libraw.aperture) metadata.aperture = `f/${libraw.aperture}`;
    if (libraw.focalLength) metadata.focalLength = `${libraw.focalLength}mm`;
    if (libraw.timestamp) {
      metadata.dateTime = new Date(libraw.timestamp * 1000).toLocaleString();
    }
  } catch {
    // 메타데이터 추출 실패는 무시
  }

  onProgress?.(50);

  // RAW → RGBA 디코딩
  const imageData = await libraw.extractImage();

  onProgress?.(70);

  // Canvas에 렌더링
  const canvas = document.createElement('canvas');
  canvas.width = metadata.width || imageData.width;
  canvas.height = metadata.height || imageData.height;
  const ctx = canvas.getContext('2d')!;

  const canvasImageData = new ImageData(
    new Uint8ClampedArray(imageData.data.buffer as ArrayBuffer),
    canvas.width,
    canvas.height
  );
  ctx.putImageData(canvasImageData, 0, 0);

  onProgress?.(85);

  // JPG는 투명도 미지원 → 흰색 배경
  if (options.format === 'jpg') {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    const bgCtx = bgCanvas.getContext('2d')!;
    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.drawImage(canvas, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      bgCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('RAW 변환에 실패했습니다.'))),
        'image/jpeg',
        options.quality ?? 0.92
      );
    });

    onProgress?.(100);
    libraw.close();
    return { blob, metadata };
  }

  const mimeMap: Record<string, string> = {
    png: 'image/png',
    webp: 'image/webp',
  };
  const mimeType = mimeMap[options.format] || 'image/png';

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('RAW 변환에 실패했습니다.'))),
      mimeType,
      options.format === 'png' ? undefined : (options.quality ?? 0.92)
    );
  });

  onProgress?.(100);
  libraw.close();
  return { blob, metadata };
}
