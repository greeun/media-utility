import type { Crop as CropType } from 'react-image-crop';

export type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize' | 'brightness' | null;

export interface ToolbarButton {
  mode?: EditMode;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
}

export type { CropType };
