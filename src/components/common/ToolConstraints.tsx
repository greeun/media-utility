'use client';

import { AlertTriangle } from 'lucide-react';

interface ToolConstraintsProps {
  constraints: string[];
  accentColor?: string;
}

// Swiss Modernism Color System
const colorClasses: Record<string, {
  bg: string;
  border: string;
  icon: string;
  text: string;
}> = {
  pink: {
    bg: 'bg-[#EC4899]/10',
    border: 'border-4 border-[#EC4899]',
    icon: 'text-[#EC4899]',
    text: 'text-gray-900',
  },
  cyan: {
    bg: 'bg-[#06B6D4]/10',
    border: 'border-4 border-[#06B6D4]',
    icon: 'text-[#06B6D4]',
    text: 'text-gray-900',
  },
  orange: {
    bg: 'bg-[#F97316]/10',
    border: 'border-4 border-[#F97316]',
    icon: 'text-[#F97316]',
    text: 'text-gray-900',
  },
  purple: {
    bg: 'bg-[#A855F7]/10',
    border: 'border-4 border-[#A855F7]',
    icon: 'text-[#A855F7]',
    text: 'text-gray-900',
  },
  emerald: {
    bg: 'bg-[#10B981]/10',
    border: 'border-4 border-[#10B981]',
    icon: 'text-[#10B981]',
    text: 'text-gray-900',
  },
  yellow: {
    bg: 'bg-[#FBBF24]/10',
    border: 'border-4 border-[#FBBF24]',
    icon: 'text-[#FBBF24]',
    text: 'text-gray-900',
  },
  sky: {
    bg: 'bg-[#06B6D4]/10',
    border: 'border-4 border-[#06B6D4]',
    icon: 'text-[#06B6D4]',
    text: 'text-gray-900',
  },
  teal: {
    bg: 'bg-[#06B6D4]/10',
    border: 'border-4 border-[#06B6D4]',
    icon: 'text-[#06B6D4]',
    text: 'text-gray-900',
  },
  violet: {
    bg: 'bg-[#A855F7]/10',
    border: 'border-4 border-[#A855F7]',
    icon: 'text-[#A855F7]',
    text: 'text-gray-900',
  },
  rose: {
    bg: 'bg-[#EC4899]/10',
    border: 'border-4 border-[#EC4899]',
    icon: 'text-[#EC4899]',
    text: 'text-gray-900',
  },
};

export default function ToolConstraints({ constraints, accentColor = 'pink' }: ToolConstraintsProps) {
  if (!constraints || constraints.length === 0) return null;

  const colors = colorClasses[accentColor] || colorClasses.pink;

  return (
    <div
      className={`mb-6 p-4 bg-white ${colors.border} opacity-0 animate-fade-up`}
      style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} strokeWidth={2.5} />
        <ul className={`text-sm font-bold ${colors.text} space-y-1`}>
          {constraints.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
