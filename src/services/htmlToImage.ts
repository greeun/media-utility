/**
 * HTML → 이미지 변환 서비스 - html-to-image 기반
 */

export interface HtmlToImageOptions {
  html: string;
  css?: string;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'svg';
  quality?: number;
  backgroundColor?: string;
}

/**
 * HTML 코드를 이미지로 변환
 */
export async function convertHtmlToImage(
  options: HtmlToImageOptions
): Promise<Blob> {
  const { html, css, width, height, format, quality, backgroundColor } = options;

  // 렌더링할 컨테이너 생성
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '-99999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'hidden';
  if (backgroundColor) {
    container.style.backgroundColor = backgroundColor;
  }

  // CSS 삽입
  if (css) {
    const style = document.createElement('style');
    style.textContent = css;
    container.appendChild(style);
  }

  // HTML 삽입
  const content = document.createElement('div');
  content.innerHTML = html;
  container.appendChild(content);

  document.body.appendChild(container);

  try {
    const htmlToImage = await import('html-to-image');

    const captureOptions = {
      width,
      height,
      quality: quality ?? 0.92,
      backgroundColor: backgroundColor || undefined,
      pixelRatio: 1,
    };

    let blob: Blob;

    if (format === 'svg') {
      const dataUrl = await htmlToImage.toSvg(container, captureOptions);
      const svgText = decodeURIComponent(dataUrl.split(',')[1] || '');
      blob = new Blob([svgText], { type: 'image/svg+xml' });
    } else if (format === 'jpg') {
      const dataUrl = await htmlToImage.toJpeg(container, captureOptions);
      blob = dataUrlToBlob(dataUrl);
    } else {
      const dataUrl = await htmlToImage.toPng(container, captureOptions);
      blob = dataUrlToBlob(dataUrl);
    }

    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}
