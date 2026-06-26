'use client';

import { useState } from 'react';
import { BaziBirthPickerSheet } from './BaziBirthPickerSheet';
import { GenderSelect } from './GenderSelect';
import { LocationCascade } from './LocationCascade';
import { ChevronRight, Calendar, MapPin, User } from 'lucide-react';

interface BaziBirthInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (val: Record<string, any>) => void;
}

const MODE_LABELS: Record<string, string> = {
  solar: '公历',
  lunar: '农历',
  pillars: '四柱',
};

const LUNAR_MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

function formatBirthDisplay(data: Record<string, unknown>) {
  const mode = data.inputMode as string || 'solar';

  if (mode === 'solar') {
    const date = data.solarDate as string;
    const time = data.solarTime as string;
    const timeKnown = data.timeKnown as boolean;
    if (!date) return '请选择出生日期时间';
    return `${date} ${timeKnown && time ? time : '时间未知'}`;
  }

  if (mode === 'lunar') {
    const lunarDate = data.lunarDate as { year: number; month: number; day: number; isLeapMonth: boolean } | undefined;
    if (!lunarDate) return '请选择出生日期时间';
    const monthName = lunarDate.isLeapMonth ? `闰${LUNAR_MONTH_NAMES[lunarDate.month - 1]}` : LUNAR_MONTH_NAMES[lunarDate.month - 1];
    const dayName = LUNAR_DAY_NAMES[lunarDate.day - 1] || `${lunarDate.day}`;
    const time = data.solarTime as string;
    const timeKnown = data.timeKnown as boolean;
    return `${lunarDate.year}年 ${monthName} ${dayName} ${timeKnown && time ? time : '时间未知'}`;
  }

  if (mode === 'pillars') {
    const pillars = data.pillars as { year: { gan: string; zhi: string }; month: { gan: string; zhi: string }; day: { gan: string; zhi: string }; hour: { gan: string; zhi: string } | null } | undefined;
    if (!pillars) return '请选择四柱';
    const hourStr = pillars.hour ? `${pillars.hour.gan}${pillars.hour.zhi}` : '未知';
    return `${pillars.year.gan}${pillars.year.zhi} ${pillars.month.gan}${pillars.month.zhi} ${pillars.day.gan}${pillars.day.zhi} ${hourStr}`;
  }

  return '请选择出生日期时间';
}

function formatLocationDisplay(location: Record<string, string> | undefined) {
  if (!location) return '请选择出生地';
  const parts = [location.country, location.province, location.city, location.district].filter(Boolean);
  if (parts.length === 0) return '请选择出生地';
  return parts.join(' ');
}

import { DesktopBaziBirthInput } from './DesktopBaziBirthInput';

export function BaziBirthInput({ value, onChange }: BaziBirthInputProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const inputMode = value.inputMode || 'solar';
  const modeLabel = MODE_LABELS[inputMode] || '公历';
  const birthDisplay = formatBirthDisplay(value);
  const locationDisplay = formatLocationDisplay(value.birthPlace);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBirthConfirm = (data: any) => {
    onChange({ ...value, ...data });
  };

  return (
    <div className="w-full">
      {/* 桌面端视图：平铺大表单 */}
      <div className="hidden md:flex flex-col gap-4 w-full">
        <DesktopBaziBirthInput value={value} onChange={onChange} />
      </div>

      {/* 移动端视图：点击弹层选择 */}
      <div className="flex flex-col w-full md:hidden">
        {/* Birth datetime row */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-3 w-full px-4 py-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors rounded-xl group"
        >
          <Calendar className="w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-stone-400 dark:text-stone-500 mb-0.5">出生日期时间</div>
            <div className={`text-sm font-medium truncate ${birthDisplay.includes('请选择') ? 'text-stone-400' : 'text-stone-900 dark:text-stone-50'}`}>
              {birthDisplay}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">{modeLabel}</span>
            <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 transition-colors" />
          </div>
        </button>

        <div className="h-px mx-4 bg-stone-100 dark:bg-stone-800" />

        {/* Gender row */}
        <div className="flex items-center gap-3 w-full px-4 py-4">
          <User className="w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-stone-400 dark:text-stone-500 mb-0.5">性别</div>
            <GenderSelect
              value={value.gender || ''}
              onChange={(v) => onChange({ ...value, gender: v })}
            />
          </div>
        </div>

        <div className="h-px mx-4 bg-stone-100 dark:bg-stone-800" />

        {/* Location row */}
        <button
          type="button"
          onClick={() => setLocationOpen(!locationOpen)}
          className="flex items-center gap-3 w-full px-4 py-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors rounded-xl group"
        >
          <MapPin className="w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-stone-400 dark:text-stone-500 mb-0.5">出生地（用于真太阳时校准）</div>
            <div className={`text-sm font-medium truncate ${locationDisplay.includes('请选择') ? 'text-stone-400' : 'text-stone-900 dark:text-stone-50'}`}>
              {locationDisplay}
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 transition-all ${locationOpen ? 'rotate-90' : ''}`} />
        </button>

        {/* Expandable location cascade */}
        {locationOpen && (
          <div className="px-4 pb-4 pt-1">
            <LocationCascade
              value={value.birthPlace}
              onChange={(v) => onChange({ ...value, birthPlace: v })}
            />
          </div>
        )}

        {/* Birth Picker Sheet */}
        <BaziBirthPickerSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onConfirm={handleBirthConfirm}
          initialData={value}
        />
      </div>
    </div>
  );
}
