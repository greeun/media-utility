import { loadImage } from './imageConverter';

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

/**
 * 이미지 밝기·휘도 조절
 */
export async function adjustBrightness(
  file: File | Blob,
  brightness: number,
  luminance: number = 0,
  contrast: number = 0,
  exposure: number = 0,
  outputFormat: string = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  const img = await loadImage(file instanceof File ? file : new File([file], 'image'));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const brightnessOffset = brightness * 2.55;
  const luminanceFactor = luminance / 100;
  const contrastFactor = (259 * (contrast * 2.55 + 255)) / (255 * (259 - contrast * 2.55));
  const exposureMultiplier = Math.pow(2, exposure / 100);

  // ITU-R BT.709 가중치
  const LR = 0.2126;
  const LG = 0.7152;
  const LB = 0.0722;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 노출 조절 (곱셈 기반)
    if (exposure !== 0) {
      r *= exposureMultiplier;
      g *= exposureMultiplier;
      b *= exposureMultiplier;
    }

    // 밝기 조절 (오프셋 기반)
    r += brightnessOffset;
    g += brightnessOffset;
    b += brightnessOffset;

    // 휘도 조절 (가중치 기반)
    if (luminanceFactor !== 0) {
      const currentLuminance = LR * r + LG * g + LB * b;
      const luminanceAdjust = currentLuminance * luminanceFactor;
      r += luminanceAdjust;
      g += luminanceAdjust;
      b += luminanceAdjust;
    }

    // 대비 조절 (중간값 128 기준)
    if (contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    data[i]     = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 명도 조절에 실패했습니다.'));
        }
      },
      outputFormat,
      quality
    );
  });
}
