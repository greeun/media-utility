import type { BaseFile } from '@/hooks/useFileManager';
import type { DetectedFace } from '@/services/faceBlur';

export interface BlurFile extends Omit<BaseFile, 'status'> {
  status: 'pending' | 'detecting' | 'detected' | 'processing' | 'completed' | 'error';
  faces: DetectedFace[];
}
