import type { BaseFile } from '@/hooks/useFileManager';

// 압축된 파일 정보 인터페이스
export interface CompressedFile extends BaseFile {
  originalSize: number;
  compressedSize?: number;
  ratio?: number;
}
