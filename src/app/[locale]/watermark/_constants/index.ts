import type { WatermarkPosition } from '@/services/watermark';

// 워터마크 위치 옵션 배열
export const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'top-left', label: '↖' },
  { value: 'top-center', label: '↑' },
  { value: 'top-right', label: '↗' },
  { value: 'center-left', label: '←' },
  { value: 'center', label: '●' },
  { value: 'center-right', label: '→' },
  { value: 'bottom-left', label: '↙' },
  { value: 'bottom-center', label: '↓' },
  { value: 'bottom-right', label: '↘' },
];

// 폰트 옵션 배열
export const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
];
