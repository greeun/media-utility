import { removeBackground, Config } from '@imgly/background-removal';

/**
 * 이미지 배경 제거
 */
export async function removeImageBackground(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    onProgress?.(10);

    const config: Config = {
      progress: (key, current, total) => {
        // 진행률 계산 (10% ~ 90%)
        const progress = 10 + Math.round((current / total) * 80);
        onProgress?.(progress);
      },
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    };

    // 배경 제거 실행 (AI 모델 자동 다운로드 및 처리)
    const blob = await removeBackground(file, config);

    onProgress?.(100);
    return blob;
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error('배경 제거 중 오류가 발생했습니다: ' + (error as Error).message);
  }
}

/**
 * 새 파일명 생성
 */
export function generateNewFilename(originalName: string): string {
  const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  return `${baseName}-no-bg.png`;
}
