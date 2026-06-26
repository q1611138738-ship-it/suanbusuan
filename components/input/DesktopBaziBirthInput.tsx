'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationCascade } from './LocationCascade';
import { GenderSelect } from './GenderSelect';

interface BaziBirthInputProps {
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
}

export function DesktopBaziBirthInput({ value, onChange }: BaziBirthInputProps) {
  // Extract values with fallbacks
  const name = value.name || '';
  const gender = value.gender || 'male';
  const inputMode = value.inputMode || 'solar';

  // Date parsing for default values
  let dateObj = new Date();
  if (value.solarDate) {
    dateObj = new Date(value.solarDate);
  }
  const currentYear = dateObj.getFullYear();
  const currentMonth = dateObj.getMonth() + 1;
  const currentDay = dateObj.getDate();

  let currentHour = 12;
  let currentMinute = 0;
  if (value.solarTime) {
    const [h, m] = value.solarTime.split(':');
    currentHour = parseInt(h, 10);
    currentMinute = parseInt(m, 10);
  }

  // Generate date ranges
  const years = Array.from({ length: 151 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const days = Array.from({ length: getDaysInMonth(currentYear, currentMonth) }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const updateDate = (type: 'year' | 'month' | 'day', val: number) => {
    let y = currentYear, m = currentMonth, d = currentDay;
    if (type === 'year') y = val;
    if (type === 'month') m = val;
    if (type === 'day') d = val;

    const isLunar = inputMode === 'lunar';

    if (isLunar) {
      const maxDays = 30; // Simplify lunar max days
      if (d > maxDays) d = maxDays;
      onChange({
        ...value,
        lunarDate: { year: y, month: m, day: d, isLeapMonth: false },
        inputMode: 'lunar'
      });
    } else {
      const maxDays = getDaysInMonth(y, m);
      if (d > maxDays) d = maxDays;
      const solarDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      onChange({ ...value, solarDate, solarYear: y, solarMonth: m, solarDay: d, inputMode: 'solar' });
    }
  };

  const updateTime = (type: 'hour' | 'minute', val: number) => {
    let h = currentHour, m = currentMinute;
    if (type === 'hour') h = val;
    if (type === 'minute') m = val;
    const solarTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange({ ...value, solarTime, solarHour: h, solarMinute: m });
  };

  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* 姓名与历法/性别行 */}
      <div className="flex items-center gap-8 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="flex items-center gap-4 flex-1">
          <Label className="font-semibold w-20 shrink-0 text-stone-600 dark:text-stone-300">命主姓名</Label>
          <Input
            value={name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="请输入姓名"
            className="max-w-[200px] h-10 rounded-lg bg-stone-50/50 dark:bg-stone-900/50"
          />
        </div>

        <div className="flex items-center gap-8 shrink-0">
          <GenderSelect
            value={gender}
            onChange={(v) => onChange({ ...value, gender: v })}
          />

          <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
            {['solar', 'lunar'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ ...value, inputMode: mode })}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${inputMode === mode
                  ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
              >
                {mode === 'solar' ? '公历' : '农历'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 出生时间行 */}
      <div className="flex items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <Label className="font-semibold w-20 shrink-0 text-stone-600 dark:text-stone-300">出生时间</Label>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="flex items-center gap-1.5">
            <Select value={String(currentYear)} onValueChange={(v) => updateDate('year', parseInt(v as string))}>
              <SelectTrigger className="w-[80px] bg-stone-50/50 dark:bg-stone-900/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-stone-500 font-medium">年</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Select value={String(currentMonth)} onValueChange={(v) => updateDate('month', parseInt(v as string))}>
              <SelectTrigger className="w-[70px] bg-stone-50/50 dark:bg-stone-900/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-stone-500 font-medium">月</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Select value={String(currentDay)} onValueChange={(v) => updateDate('day', parseInt(v as string))}>
              <SelectTrigger className="w-[70px] bg-stone-50/50 dark:bg-stone-900/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-stone-500 font-medium">日</span>
          </div>

          {value.timeKnown !== false && (
            <>
              <div className="flex items-center gap-1.5 ml-1">
                <Select value={String(currentHour)} onValueChange={(v) => updateTime('hour', parseInt(v as string))}>
                  <SelectTrigger className="w-[70px] bg-stone-50/50 dark:bg-stone-900/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {hours.map(h => <SelectItem key={h} value={String(h)}>{String(h).padStart(2, '0')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-stone-500 font-medium">时</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Select value={String(currentMinute)} onValueChange={(v) => updateTime('minute', parseInt(v as string))}>
                  <SelectTrigger className="w-[70px] bg-stone-50/50 dark:bg-stone-900/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {minutes.map(m => <SelectItem key={m} value={String(m)}>{String(m).padStart(2, '0')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-stone-500 font-medium">分</span>
              </div>
            </>
          )}

          <div className="flex items-center space-x-2 ml-4">
            <Checkbox
              id="timeKnown"
              checked={value.timeKnown === false}
              onCheckedChange={(c) => onChange({ ...value, timeKnown: !c })}
              className="border-stone-400"
            />
            <Label htmlFor="timeKnown" className="text-stone-500 cursor-pointer font-normal">不清楚具体时间</Label>
          </div>
        </div>
      </div>

      {/* 出生地址与选项行 */}
      <div className="flex items-start gap-4 pb-2">
        <Label className="font-semibold w-20 shrink-0 pt-3 text-stone-600 dark:text-stone-300">出生地址</Label>
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full max-w-lg">
            <LocationCascade value={value.birthPlace} onChange={(v) => onChange({ ...value, birthPlace: v })} />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dst"
                checked={!!value.isDst}
                onCheckedChange={(c) => onChange({ ...value, isDst: !!c })}
                className="border-stone-400"
              />
              <Label htmlFor="dst" className="text-stone-600 dark:text-stone-400 cursor-pointer font-normal">夏令时</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trueSolar"
                checked={value.useTrueSolarTime !== false}
                onCheckedChange={(c) => onChange({ ...value, useTrueSolarTime: !!c })}
                className="border-stone-400"
              />
              <Label htmlFor="trueSolar" className="text-stone-600 dark:text-stone-400 cursor-pointer font-normal">真太阳时</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lateZi"
                checked={value.useLateZiHour !== false}
                onCheckedChange={(c) => onChange({ ...value, useLateZiHour: !!c })}
                className="border-stone-400"
              />
              <Label htmlFor="lateZi" className="text-stone-600 dark:text-stone-400 cursor-pointer font-normal">区分早晚子时</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
