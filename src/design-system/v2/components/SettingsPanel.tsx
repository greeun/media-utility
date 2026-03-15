'use client';

import { Sparkles } from 'lucide-react';

interface SettingsPanelProps {
  title: string;
  accentColor: string;
  delay?: string;
  children: React.ReactNode;
}

export default function SettingsPanel({ title, accentColor, delay = '0.15s', children }: SettingsPanelProps) {
  return (
    <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: delay, animationFillMode: 'forwards' }}>
      <div className="p-6 bg-white border-4 border-black">
        <h3 className="text-lg font-black uppercase tracking-wide text-black mb-6 flex items-center gap-3">
          <Sparkles className="w-5 h-5" style={{ color: accentColor }} strokeWidth={2.5} />
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
