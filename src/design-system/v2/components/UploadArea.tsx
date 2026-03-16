'use client';

import { Upload } from 'lucide-react';

interface UploadAreaProps {
  accentColor: string;
  label: string;
  hint: string;
  accept: string;
  delay?: string;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
}

export default function UploadArea({
  accentColor,
  label,
  hint,
  accept,
  delay = '0.1s',
  isDragging,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFileSelect,
  multiple = false,
}: UploadAreaProps) {
  return (
    <div className="opacity-0 animate-fade-up" style={{ animationDelay: delay, animationFillMode: 'forwards' }}>
      <div className="ds-panel p-8">
        <label
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="ds-upload flex flex-col items-center justify-center w-full h-64 cursor-pointer transition-all duration-200"
          style={isDragging ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : undefined}
        >
          <div
            className="ds-card p-6 transition-colors mb-4"
            style={isDragging ? { color: accentColor, borderColor: accentColor } : undefined}
          >
            <Upload className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <span
            className="text-xl font-black uppercase tracking-wide transition-colors ds-text"
            style={isDragging ? { color: accentColor } : undefined}
          >
            {label}
          </span>
          <span className="text-sm font-bold ds-text-muted mt-2">{hint}</span>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={onFileSelect}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
