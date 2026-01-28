'use client';

import { AlertTriangle } from 'lucide-react';

interface ToolConstraintsProps {
  constraints: string[];
  accentColor?: string;
}

// OKLCH 색상 시스템 - HowToUse.tsx와 동일 패턴
const colorClasses: Record<string, {
  bg: string;
  border: string;
  icon: string;
  text: string;
}> = {
  cyan: {
    bg: 'bg-[oklch(0.75_0.18_195/0.05)]',
    border: 'border-[oklch(0.75_0.18_195/0.2)]',
    icon: 'text-[oklch(0.75_0.18_195)]',
    text: 'text-[oklch(0.70_0.10_195)]',
  },
  sky: {
    bg: 'bg-[oklch(0.75_0.18_195/0.05)]',
    border: 'border-[oklch(0.75_0.18_195/0.2)]',
    icon: 'text-[oklch(0.75_0.18_195)]',
    text: 'text-[oklch(0.70_0.10_195)]',
  },
  violet: {
    bg: 'bg-[oklch(0.65_0.22_290/0.05)]',
    border: 'border-[oklch(0.65_0.22_290/0.2)]',
    icon: 'text-[oklch(0.65_0.22_290)]',
    text: 'text-[oklch(0.60_0.12_290)]',
  },
  emerald: {
    bg: 'bg-[oklch(0.72_0.17_160/0.05)]',
    border: 'border-[oklch(0.72_0.17_160/0.2)]',
    icon: 'text-[oklch(0.72_0.17_160)]',
    text: 'text-[oklch(0.67_0.10_160)]',
  },
  amber: {
    bg: 'bg-[oklch(0.80_0.18_80/0.05)]',
    border: 'border-[oklch(0.80_0.18_80/0.2)]',
    icon: 'text-[oklch(0.80_0.18_80)]',
    text: 'text-[oklch(0.75_0.10_80)]',
  },
  teal: {
    bg: 'bg-[oklch(0.75_0.17_175/0.05)]',
    border: 'border-[oklch(0.75_0.17_175/0.2)]',
    icon: 'text-[oklch(0.75_0.17_175)]',
    text: 'text-[oklch(0.70_0.10_175)]',
  },
  rose: {
    bg: 'bg-[oklch(0.70_0.20_330/0.05)]',
    border: 'border-[oklch(0.70_0.20_330/0.2)]',
    icon: 'text-[oklch(0.70_0.20_330)]',
    text: 'text-[oklch(0.65_0.12_330)]',
  },
};

export default function ToolConstraints({ constraints, accentColor = 'cyan' }: ToolConstraintsProps) {
  if (!constraints || constraints.length === 0) return null;

  const colors = colorClasses[accentColor] || colorClasses.cyan;

  return (
    <div
      className={`mb-6 p-4 rounded-xl border ${colors.border} ${colors.bg} opacity-0 animate-fade-up`}
      style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
        <ul className={`text-xs ${colors.text} space-y-1`}>
          {constraints.map((c, i) => (
            <li key={i}>• {c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
