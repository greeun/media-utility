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
      <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">
        {label}: <span style={{ color: accentColor }}>{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 bg-gray-200 appearance-none cursor-pointer"
        style={{
          // @ts-expect-error CSS custom property
          '--slider-color': accentColor,
        }}
      />
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: var(--slider-color);
          border: 2px solid black;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
