'use client';

import { RefreshCw, Download } from 'lucide-react';

interface ActionButtonGroupProps {
  accentColor: string;
  delay?: string;
  primaryAction?: {
    label: string;
    loadingLabel: string;
    isLoading: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  downloadAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function ActionButtonGroup({
  accentColor,
  delay = '0.25s',
  primaryAction,
  downloadAction,
}: ActionButtonGroupProps) {
  if (!primaryAction && !downloadAction) return null;

  return (
    <div
      className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.isLoading}
          className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-black text-lg uppercase tracking-wide border-4 border-black hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {primaryAction.isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={2.5} />
              {primaryAction.loadingLabel}
            </>
          ) : (
            <>
              {primaryAction.icon ?? <RefreshCw className="w-5 h-5" strokeWidth={2.5} />}
              {primaryAction.label}
            </>
          )}
        </button>
      )}
      {downloadAction && (
        <button
          onClick={downloadAction.onClick}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-black text-lg uppercase tracking-wide border-4 border-black hover:bg-black hover:text-white transition-all duration-200"
          style={{ backgroundColor: accentColor }}
        >
          <Download className="w-5 h-5" strokeWidth={2.5} />
          {downloadAction.label}
        </button>
      )}
    </div>
  );
}
