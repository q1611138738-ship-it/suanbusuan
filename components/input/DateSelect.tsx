import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function DateSelect({ value, onChange, required, disabled }: DateSelectProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const [year, setYear] = useState<string>(() => {
    if (value && typeof value === 'string') return value.split('-')[0] || '';
    return '';
  });
  const [month, setMonth] = useState<string>(() => {
    if (value && typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length >= 2) return parseInt(parts[1], 10).toString();
    }
    return '';
  });
  const [day, setDay] = useState<string>(() => {
    if (value && typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length >= 3) return parseInt(parts[2], 10).toString();
    }
    return '';
  });

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m, 0).getDate();
  };

  const days = year && month ? Array.from({ length: getDaysInMonth(parseInt(year), parseInt(month)) }, (_, i) => i + 1) : [];

  const handleYearChange = (y: string | null) => {
    if (!y) return;
    setYear(y);
    updateValue(y, month, day);
  };

  const handleMonthChange = (m: string | null) => {
    if (!m) return;
    setMonth(m);
    updateValue(year, m, day);
  };

  const handleDayChange = (d: string | null) => {
    if (!d) return;
    setDay(d);
    updateValue(year, month, d);
  };

  const updateValue = (y: string, m: string, d: string) => {
    if (y && m && d) {
      // Validate day in case month changed
      const maxDays = getDaysInMonth(parseInt(y), parseInt(m));
      let safeDay = parseInt(d);
      if (safeDay > maxDays) {
        safeDay = maxDays;
        setDay(safeDay.toString());
      }
      
      const formattedMonth = m.padStart(2, '0');
      const formattedDay = safeDay.toString().padStart(2, '0');
      onChange(`${y}-${formattedMonth}-${formattedDay}`);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <div className="flex-1">
        <Select value={String(year ?? "")} onValueChange={(v) => { if (v) handleYearChange(v) }} required={required} disabled={disabled}>
          <SelectTrigger className="h-12 rounded-xl w-full transition-all active:scale-95">
            <SelectValue placeholder="年" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Select value={String(month ?? "")} onValueChange={(v) => { if (v) handleMonthChange(v) }} required={required} disabled={disabled}>
          <SelectTrigger className="h-12 rounded-xl w-full transition-all active:scale-95">
            <SelectValue placeholder="月" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m} value={m.toString()}>{m}月</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Select value={String(day ?? "")} onValueChange={(v) => { if (v) handleDayChange(v) }} required={required} disabled={disabled}>
          <SelectTrigger className="h-12 rounded-xl w-full transition-all active:scale-95">
            <SelectValue placeholder="日" />
          </SelectTrigger>
          <SelectContent>
            {days.map(d => (
              <SelectItem key={d} value={d.toString()}>{d}日</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
