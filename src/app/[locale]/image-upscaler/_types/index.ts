import type { BaseFile } from '@/hooks/useFileManager';

export interface UpscaleFile extends BaseFile {
  resultUrl?: string;
  originalSize: { width: number; height: number };
}
