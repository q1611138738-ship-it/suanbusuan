'use client';

import { WheelPicker as NcdaiWheelPicker, WheelPickerWrapper } from '@ncdai/react-wheel-picker';
import '@ncdai/react-wheel-picker/style.css';

interface WheelPickerProps {
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function WheelPicker({
  items,
  value,
  onChange,
  disabled = false,
}: WheelPickerProps) {
  return (
    <div style={{ height: 220, width: '100%', pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.5 : 1 }}>
      <WheelPickerWrapper className="w-full h-full bg-transparent border-none shadow-none rounded-none px-0">
        <NcdaiWheelPicker
        options={items.map(i => ({ value: i.value, label: i.label }))}
        value={value}
        onValueChange={(val) => onChange(String(val))}
        optionItemHeight={44}
        visibleCount={16}
        dragSensitivity={8}
        scrollSensitivity={10}
        classNames={{
          optionItem: "!text-[14px] !text-stone-400/80 dark:!text-stone-500/80 font-normal transition-colors duration-100 flex items-center justify-center",
          highlightItem: "!text-[16px] !text-stone-900 dark:!text-stone-50 font-semibold transition-colors duration-100 flex items-center justify-center",
          highlightWrapper: "!bg-transparent !border-y !border-stone-200/70 dark:!border-stone-700/50 !rounded-none !shadow-none !ring-0 focus-within:!ring-0 outline-none before:hidden after:hidden data-[rwp-focused=true]:!ring-0",
        }}
      />
      </WheelPickerWrapper>
    </div>
  );
}
