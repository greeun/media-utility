'use client';

interface ProgressBarProps {
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  showLabel?: boolean;
}

export default function ProgressBar({ progress, status, showLabel = true }: ProgressBarProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-[oklch(0.30_0.02_240)]';
      case 'processing':
        return 'bg-[oklch(0.75_0.18_195)]';
      case 'completed':
        return 'bg-[oklch(0.72_0.17_160)]';
      case 'error':
        return 'bg-[oklch(0.65_0.22_25)]';
      default:
        return 'bg-[oklch(0.30_0.02_240)]';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '처리 중...';
      case 'completed':
        return '완료';
      case 'error':
        return '오류';
      default:
        return '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <>
            <span className="text-xs text-[oklch(0.55_0.02_240)]">{getStatusText()}</span>
            <span className="text-xs font-medium text-[oklch(0.75_0.02_240)]">{Math.round(progress)}%</span>
          </>
        )}
      </div>
      <div className="w-full h-2 bg-[oklch(0.20_0.025_240)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
