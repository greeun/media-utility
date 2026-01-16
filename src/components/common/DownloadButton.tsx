'use client';

import { Download, Check } from 'lucide-react';
import { useState } from 'react';
import { saveAs } from 'file-saver';

interface DownloadButtonProps {
  blob: Blob;
  filename: string;
  disabled?: boolean;
  className?: string;
}

export default function DownloadButton({
  blob,
  filename,
  disabled = false,
  className = '',
}: DownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    saveAs(blob, filename);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        downloaded
          ? 'bg-green-500 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {downloaded ? (
        <>
          <Check className="w-4 h-4" />
          다운로드됨
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          다운로드
        </>
      )}
    </button>
  );
}
