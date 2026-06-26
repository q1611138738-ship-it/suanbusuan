import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TimeSelect24hProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onChange: (val: { timeKnown: boolean; solarTime?: string }) => void;
  required?: boolean;
  unknownTimeLabel?: string;
  disabled?: boolean;
}

export function TimeSelect24h({ value, onChange, required, unknownTimeLabel, disabled }: TimeSelect24hProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const [timeKnown, setTimeKnown] = useState<boolean>(() => value ? value.timeKnown !== false : true);
  const [hour, setHour] = useState<string>(() => value?.solarTime ? value.solarTime.split(':')[0] : '');
  const [minute, setMinute] = useState<string>(() => value?.solarTime ? value.solarTime.split(':')[1] : '');

  const handleTimeKnownChange = (checked: boolean) => {
    setTimeKnown(!checked);
    onChange({ timeKnown: !checked, solarTime: !checked && hour && minute ? `${hour}:${minute}` : undefined });
  };

  const handleHourChange = (h: string | null) => {
    if (!h) return;
    setHour(h);
    if (minute) {
      onChange({ timeKnown, solarTime: `${h}:${minute}` });
    }
  };

  const handleMinuteChange = (m: string | null) => {
    if (!m) return;
    setMinute(m);
    if (hour) {
      onChange({ timeKnown, solarTime: `${hour}:${m}` });
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Select value={String(hour ?? "")} onValueChange={(v) => { if (v) handleHourChange(v) }} disabled={!timeKnown || disabled} required={required && timeKnown}>
            <SelectTrigger className="h-12 rounded-xl w-full">
              <SelectValue placeholder="时" />
            </SelectTrigger>
            <SelectContent>
              {hours.map(h => (
                <SelectItem key={h} value={h}>{h}时</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={String(minute ?? "")} onValueChange={(v) => { if (v) handleMinuteChange(v) }} disabled={!timeKnown || disabled} required={required && timeKnown}>
            <SelectTrigger className="h-12 rounded-xl w-full">
              <SelectValue placeholder="分" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map(m => (
                <SelectItem key={m} value={m}>{m}分</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2.5 pt-2 px-1">
        <Checkbox 
          id="timeUnknown" 
          checked={!timeKnown} 
          onCheckedChange={(checked) => handleTimeKnownChange(checked as boolean)}
          className="w-5 h-5 rounded-md border-stone-300 dark:border-stone-700 data-[state=checked]:bg-stone-900 dark:data-[state=checked]:bg-stone-100"
        />
        <Label htmlFor="timeUnknown" className="text-[15px] font-medium text-stone-600 dark:text-stone-400 cursor-pointer select-none">
          {unknownTimeLabel || '不清楚具体时间'}
        </Label>
      </div>
    </div>
  );
}
