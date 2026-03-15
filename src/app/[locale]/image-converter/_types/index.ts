// 이미지 변환기에서 사용하는 타입 정의

export interface ConvertedFile {
  id: string;
  originalFile: File;
  originalName: string;
  preview: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}
