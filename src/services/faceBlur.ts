/**
 * 얼굴 블러 서비스 - MediaPipe Face Detection + Canvas API
 */

export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface FaceBlurOptions {
  blurType: 'gaussian' | 'mosaic';
  blurIntensity: number; // 5 ~ 50
  additionalRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  autoDetect: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let faceDetectorInstance: any = null;
let initPromise: Promise<void> | null = null;

async function initFaceDetector(): Promise<void> {
  if (faceDetectorInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    faceDetectorInstance = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
    });
  })();

  return initPromise;
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
 * 이미지에서 얼굴 감지
 */
export async function detectFaces(file: File): Promise<DetectedFace[]> {
  await initFaceDetector();
  if (!faceDetectorInstance) throw new Error('Face Detector 초기화 실패');

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const result = faceDetectorInstance.detect(img);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.detections.map((d: any) => {
      const bb = d.boundingBox!;
      return {
        x: bb.originX,
        y: bb.originY,
        width: bb.width,
        height: bb.height,
        confidence: d.categories[0]?.score ?? 0,
      };
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * 영역에 가우시안 블러 적용
 */
function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  regions: Array<{ x: number; y: number; width: number; height: number }>,
  intensity: number
) {
  for (const region of regions) {
    const x = Math.max(0, Math.floor(region.x));
    const y = Math.max(0, Math.floor(region.y));
    const w = Math.min(Math.floor(region.width), canvas.width - x);
    const h = Math.min(Math.floor(region.height), canvas.height - y);

    if (w <= 0 || h <= 0) continue;

    // 임시 캔버스에서 블러 적용
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = w;
    tmpCanvas.height = h;
    const tmpCtx = tmpCanvas.getContext('2d')!;
    tmpCtx.filter = `blur(${intensity}px)`;
    // 블러 엣지 처리를 위해 더 넓은 영역을 그린 후 크롭
    const padding = intensity * 2;
    tmpCtx.drawImage(canvas, x - padding, y - padding, w + padding * 2, h + padding * 2, -padding, -padding, w + padding * 2, h + padding * 2);

    ctx.drawImage(tmpCanvas, 0, 0, w, h, x, y, w, h);
  }
}

/**
 * 영역에 모자이크 적용
 */
function applyMosaic(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  regions: Array<{ x: number; y: number; width: number; height: number }>,
  intensity: number
) {
  for (const region of regions) {
    const x = Math.max(0, Math.floor(region.x));
    const y = Math.max(0, Math.floor(region.y));
    const w = Math.min(Math.floor(region.width), canvas.width - x);
    const h = Math.min(Math.floor(region.height), canvas.height - y);

    if (w <= 0 || h <= 0) continue;

    const blockSize = Math.max(2, Math.floor(intensity / 2));

    // 축소 후 확대하여 모자이크 효과
    const tmpCanvas = document.createElement('canvas');
    const smallW = Math.max(1, Math.floor(w / blockSize));
    const smallH = Math.max(1, Math.floor(h / blockSize));
    tmpCanvas.width = smallW;
    tmpCanvas.height = smallH;
    const tmpCtx = tmpCanvas.getContext('2d')!;
    tmpCtx.imageSmoothingEnabled = false;
    tmpCtx.drawImage(canvas, x, y, w, h, 0, 0, smallW, smallH);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmpCanvas, 0, 0, smallW, smallH, x, y, w, h);
    ctx.imageSmoothingEnabled = true;
  }
}

/**
 * 얼굴 블러 적용
 */
export async function applyFaceBlur(
  file: File,
  faces: DetectedFace[],
  options: FaceBlurOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
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

    // 블러 영역 = 감지된 얼굴 + 수동 영역
    const regions = [
      ...faces.map((f) => ({
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
      })),
      ...(options.additionalRegions || []),
    ];

    if (regions.length === 0) {
      onProgress?.(100);
      return file;
    }

    onProgress?.(60);

    if (options.blurType === 'gaussian') {
      applyGaussianBlur(ctx, canvas, regions, options.blurIntensity);
    } else {
      applyMosaic(ctx, canvas, regions, options.blurIntensity);
    }

    onProgress?.(80);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('블러 처리에 실패했습니다.'))),
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
