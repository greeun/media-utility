'use client';

import { Trash2 } from 'lucide-react';

interface FileListPanelProps {
  title: string;
  count: number;
  deleteAllLabel: string;
  delay?: string;
  onClearAll: () => void;
  children: React.ReactNode;
}

export default function FileListPanel({
  title,
  count,
  deleteAllLabel,
  delay = '0.2s',
  onClearAll,
  children,
}: FileListPanelProps) {
  return (
    <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: delay, animationFillMode: 'forwards' }}>
      <div className="ds-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black uppercase tracking-wide ds-text">
            {title} <span className="ds-text-muted font-normal">({count})</span>
          </h3>
          <button
            onClick={onClearAll}
            className="ds-btn-outline flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            {deleteAllLabel}
          </button>
        </div>
        <div className="space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
}
