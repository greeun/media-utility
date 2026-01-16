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

export interface UploadOptions {
  expiresInDays?: number;
  password?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  url: string;
  viewUrl: string;
  key: string;
  expiresAt?: string;
  hasPassword: boolean;
}

/**
 * R2에 파일 업로드
 */
export async function uploadToR2(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const { expiresInDays = 30, password, onProgress } = options || {};

  // 1. Presigned URL 요청
  onProgress?.(10);

  const presignResponse = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      expiresInDays,
      password,
    }),
  });

  if (!presignResponse.ok) {
    const error = await presignResponse.json();
    throw new Error(error.error || 'Presigned URL 생성 실패');
  }

  const { signedUrl, key, expiresAt } = await presignResponse.json();
  onProgress?.(30);

  // 2. R2에 직접 업로드
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('R2 업로드 실패');
  }
  onProgress?.(80);

  // 3. 업로드 완료 확인 및 공개 URL 받기
  const completeResponse = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });

  if (!completeResponse.ok) {
    const error = await completeResponse.json();
    throw new Error(error.error || '업로드 완료 처리 실패');
  }

  const { url, viewUrl } = await completeResponse.json();
  onProgress?.(100);

  return { url, viewUrl, key, expiresAt, hasPassword: !!password };
}

/**
 * 저장소 정보 조회
 */
export async function getStorageInfo(): Promise<{
  usedBytes: number;
  maxBytes: number;
  usedPercent: number;
  fileCount: number;
}> {
  const response = await fetch('/api/storage');

  if (!response.ok) {
    throw new Error('저장소 정보 조회 실패');
  }

  return response.json();
}

