export const ACCENT_COLORS = {
  pink: '#EC4899',
  cyan: '#06B6D4',
  orange: '#F97316',
  purple: '#A855F7',
  emerald: '#10B981',
  yellow: '#FBBF24',
} as const;

export type AccentColorKey = keyof typeof ACCENT_COLORS;

export const TOOL_ACCENT: Record<string, AccentColorKey> = {
  'image-converter': 'pink',
  'image-compressor': 'cyan',
  'image-editor': 'purple',
  'image-upscaler': 'cyan',
  'gif-maker': 'emerald',
  'video-converter': 'orange',
  watermark: 'purple',
  'background-remover': 'purple',
  'face-blur': 'pink',
  'meme-generator': 'orange',
  'html-to-image': 'yellow',
  'url-generator': 'pink',
};

export function getAccentColor(key: AccentColorKey): string {
  return ACCENT_COLORS[key];
}
