'use client';

import { Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface FileListItemProps {
  id: string;
  preview: string;
  name: string;
  sizeInfo: React.ReactNode;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  accentColor: string;
  previewContent?: React.ReactNode;
  onDownload?: () => void;
  onRemove: () => void;
}

export default function FileListItem({
  preview,
  name,
  sizeInfo,
  status,
  progress,
  error,
  accentColor,
  previewContent,
  onDownload,
  onRemove,
}: FileListItemProps) {
  return (
    <div className="ds-list-item group flex items-center gap-4 p-4">
      {/* Preview */}
      <div className="ds-card w-16 h-16 overflow-hidden flex-shrink-0">
        {previewContent ?? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black uppercase tracking-wide truncate ds-text">
          {name}
        </p>
        <p className="text-xs font-bold mt-1 ds-text-muted">
          {sizeInfo}
        </p>
        {(status === 'processing' || status === 'completed') && (
          <div className="mt-2 h-2 overflow-hidden" style={{ background: 'var(--muted)', border: `2px solid var(--border)`, borderRadius: 'var(--radius)' }}>
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                backgroundColor: status === 'completed' ? '#10B981' : accentColor,
                borderRadius: 'var(--radius)',
              }}
            />
          </div>
        )}
        {status === 'error' && (
          <p className="text-xs font-bold mt-1 flex items-center gap-2" style={{ color: 'var(--destructive)' }}>
            <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
            {error}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {status === 'completed' && (
          <>
            <CheckCircle className="w-6 h-6 text-[#10B981]" strokeWidth={2.5} />
            {onDownload && (
              <button
                onClick={onDownload}
                className="ds-btn-icon"
                style={{ backgroundColor: accentColor, color: 'white' }}
              >
                <Download className="w-5 h-5" strokeWidth={2.5} />
              </button>
            )}
          </>
        )}
        <button onClick={onRemove} className="ds-btn-icon ds-btn-outline">
          <Trash2 className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
