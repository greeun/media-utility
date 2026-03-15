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
      <div className="p-8 bg-white border-4 border-black">
        <label
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center w-full h-64 border-4 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'bg-gray-100'
              : 'border-black hover:bg-gray-50'
          }`}
          style={isDragging ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : undefined}
        >
          <div
            className="p-6 border-4 border-current transition-colors mb-4"
            style={isDragging ? { color: accentColor } : { color: 'black' }}
          >
            <Upload className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <span
            className="text-xl font-black uppercase tracking-wide transition-colors"
            style={isDragging ? { color: accentColor } : { color: 'black' }}
          >
            {label}
          </span>
          <span className="text-sm font-bold text-gray-600 mt-2">{hint}</span>
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
