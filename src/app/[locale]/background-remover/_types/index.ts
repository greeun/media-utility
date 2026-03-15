import type { BaseFile } from '@/hooks/useFileManager';

// 배경 제거 파일 인터페이스
export interface BackgroundRemovedFile extends BaseFile {
  // 배경 제거는 추가 필드 없이 BaseFile 그대로 사용
}
