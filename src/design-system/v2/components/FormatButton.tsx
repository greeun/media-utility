'use client';

interface FormatButtonProps {
  label: string;
  active: boolean;
  accentColor: string;
  onClick: () => void;
}

export default function FormatButton({ label, active, accentColor, onClick }: FormatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`ds-format-btn px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
        active ? 'active' : ''
      }`}
      style={active ? { backgroundColor: accentColor, borderColor: accentColor, color: 'white' } : undefined}
    >
      {label}
    </button>
  );
}
