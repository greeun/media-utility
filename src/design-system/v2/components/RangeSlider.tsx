'use client';

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  accentColor: string;
  unit?: string;
  onChange: (value: number) => void;
}

export default function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  accentColor,
  unit = '%',
  onChange,
}: RangeSliderProps) {
  return (
    <div>
      <label className="block text-sm font-bold uppercase tracking-wide ds-text mb-3">
        {label}: <span style={{ color: accentColor }}>{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ds-range w-full h-3 appearance-none cursor-pointer"
        style={{
          background: 'var(--muted)',
          borderRadius: 'var(--radius)',
          // @ts-expect-error CSS custom property
          '--slider-color': accentColor,
        }}
      />
    </div>
  );
}
