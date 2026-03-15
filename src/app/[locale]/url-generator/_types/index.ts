export type UrlType = 'base64' | 'blob' | 'r2';

export interface GeneratedUrl {
  id: string;
  file: File;
  preview: string;
  dataUrl?: string;
  blobUrl?: string;
  r2Url?: string;
  r2Uploading?: boolean;
  r2Progress?: number;
  r2Error?: string;
  r2ExpiresAt?: string;
  r2HasPassword?: boolean;
  type: 'image' | 'video';
}

export interface StorageInfo {
  usedBytes: number;
  maxBytes: number;
  usedPercent: number;
  fileCount: number;
}
