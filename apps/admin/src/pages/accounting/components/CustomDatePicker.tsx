export function CustomDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5 flex flex-col">
      <label className="text-sm font-medium text-on-surface">{label}</label>
      <input
        type="date"
        className="w-full px-3 py-2 bg-surface border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
