/**
 * 디자인 테마 시스템
 *
 * 각 테마는 CSS 변수로 정의되며, data-theme 속성으로 전환된다.
 * globals.css에서 [data-theme="이름"] 셀렉터로 적용.
 */

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

export const themes: ThemeDefinition[] = [
  {
    id: 'swiss',
    name: 'Swiss Modernism',
    description: '흑백 대비, 굵은 테두리, 직선 코너',
    preview: { bg: '#F9FAFB', card: '#FFFFFF', accent: '#EC4899', text: '#000000' },
  },
  {
    id: 'soft',
    name: 'Soft Minimal',
    description: '따뜻한 배경, 부드러운 테두리, 눈이 편한',
    preview: { bg: '#FAF9F7', card: '#FFFFFF', accent: '#6366F1', text: '#1E293B' },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: '어두운 배경, 눈 피로 최소화',
    preview: { bg: '#0F172A', card: '#1E293B', accent: '#38BDF8', text: '#F1F5F9' },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: '차분한 파란 톤, 시원한 느낌',
    preview: { bg: '#F0F9FF', card: '#FFFFFF', accent: '#0EA5E9', text: '#0C4A6E' },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: '자연스러운 녹색 톤, 편안한 느낌',
    preview: { bg: '#F0FDF4', card: '#FFFFFF', accent: '#10B981', text: '#14532D' },
  },
];

export const DEFAULT_THEME = 'soft';

export function getTheme(id: string): ThemeDefinition | undefined {
  return themes.find((t) => t.id === id);
}
