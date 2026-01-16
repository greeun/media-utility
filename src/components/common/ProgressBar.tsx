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
        return 'bg-gray-200';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
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
            <span className="text-xs text-gray-500">{getStatusText()}</span>
            <span className="text-xs font-medium text-gray-700">{Math.round(progress)}%</span>
          </>
        )}
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
