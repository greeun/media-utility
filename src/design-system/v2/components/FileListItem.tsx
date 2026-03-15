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
    <div className="group flex items-center gap-4 p-4 bg-gray-50 border-4 border-black hover:bg-black hover:text-white transition-all duration-200">
      {/* Preview */}
      <div className="w-16 h-16 border-4 border-black overflow-hidden bg-white flex-shrink-0">
        {previewContent ?? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black uppercase tracking-wide truncate text-black group-hover:text-white">
          {name}
        </p>
        <p className="text-xs font-bold mt-1 text-gray-900 group-hover:text-white">
          {sizeInfo}
        </p>
        {(status === 'processing' || status === 'completed') && (
          <div className="mt-2 h-2 bg-gray-300 overflow-hidden border-2 border-black">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                backgroundColor: status === 'completed' ? '#10B981' : accentColor,
              }}
            />
          </div>
        )}
        {status === 'error' && (
          <p className="text-xs font-bold mt-1 flex items-center gap-2 text-red-600 group-hover:text-red-400">
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
                className="w-10 h-10 flex items-center justify-center border-4 border-black text-white hover:bg-black transition-all duration-200"
                style={{ backgroundColor: accentColor }}
              >
                <Download className="w-5 h-5" strokeWidth={2.5} />
              </button>
            )}
          </>
        )}
        <button
          onClick={onRemove}
          className="w-10 h-10 flex items-center justify-center border-4 border-black bg-white text-black hover:bg-black hover:text-white transition-all duration-200"
        >
          <Trash2 className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
