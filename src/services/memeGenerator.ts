/**
 * 밈 생성기 서비스 - Canvas API 기반 밈 텍스트 오버레이
 */

export interface MemeTextOptions {
  topText: string;
  bottomText: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'));
    img.src = src;
  });
}

function drawMemeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  textColor: string,
  strokeColor: string,
  strokeWidth: number
) {
  if (!text.trim()) return;

  ctx.font = `bold ${fontSize}px "${fontFamily}", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = textColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';

  // 줄바꿈 처리
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  for (let i = 0; i < lines.length; i++) {
    const lineY = y + i * (fontSize * 1.15);
    ctx.strokeText(lines[i], x, lineY);
    ctx.fillText(lines[i], x, lineY);
  }
}

/**
 * 밈 이미지 생성
 */
export async function generateMeme(
  file: File,
  options: MemeTextOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { topText, bottomText, fontSize, fontFamily, textColor, strokeColor, strokeWidth } = options;

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

    const maxWidth = canvas.width * 0.9;
    const margin = canvas.height * 0.03;

    // 상단 텍스트
    if (topText.trim()) {
      drawMemeText(ctx, topText, canvas.width / 2, margin, maxWidth, fontSize, fontFamily, textColor, strokeColor, strokeWidth);
    }

    onProgress?.(60);

    // 하단 텍스트 - 아래에서 위로
    if (bottomText.trim()) {
      ctx.textBaseline = 'bottom';
      const words = bottomText.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      ctx.font = `bold ${fontSize}px "${fontFamily}", Impact, sans-serif`;
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const totalHeight = lines.length * fontSize * 1.15;
      const startY = canvas.height - margin - totalHeight;

      ctx.textBaseline = 'top';
      for (let i = 0; i < lines.length; i++) {
        const lineY = startY + i * (fontSize * 1.15);
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(lines[i], canvas.width / 2, lineY);
        ctx.fillText(lines[i], canvas.width / 2, lineY);
      }
    }

    onProgress?.(80);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('밈 생성에 실패했습니다.'))),
        'image/png',
        0.95
      );
    });

    onProgress?.(100);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
