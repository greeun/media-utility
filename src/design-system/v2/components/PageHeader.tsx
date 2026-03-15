'use client';

import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
}

export default function PageHeader({ icon, iconBgColor, title, description }: PageHeaderProps) {
  return (
    <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-start gap-6">
        <div
          className="flex-shrink-0 w-16 h-16 border-4 border-black flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          {icon}
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">{title}</h1>
          <p className="text-lg font-bold text-gray-900">{description}</p>
        </div>
      </div>
    </div>
  );
}
