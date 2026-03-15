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
      className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-200 border-4 ${
        active
          ? 'text-white'
          : 'bg-white text-black border-black hover:bg-black hover:text-white'
      }`}
      style={active ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
    >
      {label}
    </button>
  );
}
