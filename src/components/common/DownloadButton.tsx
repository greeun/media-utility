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
          ? 'bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)]'
          : 'bg-[oklch(0.75_0.18_195)] hover:bg-[oklch(0.80_0.20_195)] text-[oklch(0.08_0.01_240)] hover:shadow-[0_0_20px_oklch(0.75_0.18_195/0.4)]'
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
