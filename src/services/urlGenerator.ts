/**
 * 파일을 Base64 Data URL로 변환
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Data URL 변환에 실패했습니다.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 파일을 Blob URL로 변환
 */
export function fileToBlobUrl(file: File | Blob): string {
  return URL.createObjectURL(file);
}

/**
 * Blob URL 해제
 */
export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Base64 문자열을 Blob으로 변환
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/png'): Blob {
  // Data URL에서 base64 부분만 추출
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * URL 복사 기능
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * 파일 크기 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Data URL의 크기 계산 (bytes)
 */
export function getDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  return Math.round((base64.length * 3) / 4);
}
