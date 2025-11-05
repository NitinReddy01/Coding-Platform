import React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onCheckedChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        {/* Track background - changes from zinc-700 to primary when checked */}
        <div className="w-11 h-6 bg-zinc-700 border-2 border-zinc-600 rounded-full peer hover:bg-zinc-600 peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:bg-primary peer-checked:border-primary peer-checked:hover:bg-primary/90 transition-colors duration-200"></div>
        {/* Thumb circle - translates and changes color when checked */}
        <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-300 rounded-full shadow-md peer-checked:translate-x-5 peer-checked:bg-white peer-checked:shadow-lg transition-all duration-200"></div>
      </div>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </label>
  );
};
