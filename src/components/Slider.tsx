interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  color?: "blue" | "purple";
}

export function Slider({
  label,
  value,
  min,
  max,
  onChange,
  color = "blue",
}: SliderProps) {
  const colorClasses = {
    blue: "accent-blue-500",
    purple: "accent-purple-500",
  };

  return (
    <div className="flex items-center gap-4 w-full max-w-xl">
      <span className="text-sm text-gray-300 w-28">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${colorClasses[color]}`}
      />
      <span className="text-sm text-white w-8 text-right">{value}</span>
    </div>
  );
}
