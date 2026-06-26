'use client';

import { useState } from 'react';
import { RefreshCcw, Trash2 } from 'lucide-react';

interface PillarPickerProps {
  value: {
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    hour: { gan: string; zhi: string } | null;
  };
  timeKnown: boolean;
  onTimeKnownChange: (v: boolean) => void;
  onChange: (val: PillarPickerProps['value']) => void;
}

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getElementColor(char: string) {
  const wood = ['甲', '乙', '寅', '卯'];
  const fire = ['丙', '丁', '巳', '午'];
  const earth = ['戊', '己', '辰', '戌', '丑', '未'];
  const metal = ['庚', '辛', '申', '酉'];
  const water = ['壬', '癸', '亥', '子'];

  if (wood.includes(char)) return 'text-green-600 dark:text-green-500';
  if (fire.includes(char)) return 'text-red-600 dark:text-red-500';
  if (earth.includes(char)) return 'text-amber-700 dark:text-amber-600';
  if (metal.includes(char)) return 'text-orange-500 dark:text-orange-400';
  if (water.includes(char)) return 'text-blue-600 dark:text-blue-500';
  return 'text-stone-900 dark:text-stone-100';
}

const SLOT_ORDER = [
  { key: 'year', type: 'gan' },
  { key: 'year', type: 'zhi' },
  { key: 'month', type: 'gan' },
  { key: 'month', type: 'zhi' },
  { key: 'day', type: 'gan' },
  { key: 'day', type: 'zhi' },
  { key: 'hour', type: 'gan' },
  { key: 'hour', type: 'zhi' },
] as const;

export function PillarPicker({ value, timeKnown, onTimeKnownChange, onChange }: PillarPickerProps) {
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const pillars = [
    { label: '年柱', gan: value.year.gan, zhi: value.year.zhi, key: 'year' },
    { label: '月柱', gan: value.month.gan, zhi: value.month.zhi, key: 'month' },
    { label: '日柱', gan: value.day.gan, zhi: value.day.zhi, key: 'day' },
    { label: '时柱', gan: value.hour?.gan || '', zhi: value.hour?.zhi || '', key: 'hour' },
  ] as const;

  const handleCharClick = (char: string) => {
    const slot = SLOT_ORDER[activeSlot];
    const newVal = { ...value };
    
    if (slot.key === 'hour') {
      newVal.hour = {
        gan: slot.type === 'gan' ? char : (value.hour?.gan || ''),
        zhi: slot.type === 'zhi' ? char : (value.hour?.zhi || ''),
      };
      if (newVal.hour.gan && newVal.hour.zhi) {
        onTimeKnownChange(true);
      }
    } else {
      newVal[slot.key] = {
        ...newVal[slot.key],
        [slot.type]: char,
      };
    }
    
    onChange(newVal);
    
    // Auto-advance
    if (activeSlot < 7) {
      setActiveSlot(activeSlot + 1);
    }
  };

  const handleClear = () => {
    onChange({
      year: { gan: '', zhi: '' },
      month: { gan: '', zhi: '' },
      day: { gan: '', zhi: '' },
      hour: { gan: '', zhi: '' },
    });
    setActiveSlot(0);
  };

  const currentType = SLOT_ORDER[activeSlot].type;
  const keyboardItems = currentType === 'gan' ? HEAVENLY_STEMS : EARTHLY_BRANCHES;

  return (
    <div className="flex flex-col select-none">
      {/* 4 Pillars Header & Slots */}
      <div className="flex justify-between px-2 mb-6">
        {pillars.map((pillar, i) => {
          const ganSlotIndex = i * 2;
          const zhiSlotIndex = i * 2 + 1;
          const isGanActive = activeSlot === ganSlotIndex;
          const isZhiActive = activeSlot === zhiSlotIndex;
          
          return (
            <div key={pillar.key} className="flex flex-col items-center">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-3">{pillar.label}</span>
              
              <button
                type="button"
                onClick={() => setActiveSlot(ganSlotIndex)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium transition-all mb-3
                  ${pillar.gan ? getElementColor(pillar.gan) : 'text-transparent'}
                  ${isGanActive ? 'bg-stone-200 dark:bg-stone-700 ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 dark:ring-offset-stone-900' : 'bg-stone-100 dark:bg-stone-800'}
                `}
              >
                {pillar.gan}
              </button>
              
              <button
                type="button"
                onClick={() => setActiveSlot(zhiSlotIndex)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium transition-all
                  ${pillar.zhi ? getElementColor(pillar.zhi) : 'text-transparent'}
                  ${isZhiActive ? 'bg-stone-200 dark:bg-stone-700 ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 dark:ring-offset-stone-900' : 'bg-stone-100 dark:bg-stone-800'}
                `}
              >
                {pillar.zhi}
              </button>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-xs font-medium text-stone-700 dark:text-stone-300">
          <span className="mr-2">查找范围:</span>
          <button type="button" className="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-3 py-1.5 rounded-full flex items-center gap-1">
            1801~2099年
            <RefreshCcw className="w-3 h-3" />
          </button>
        </div>
        <button type="button" onClick={handleClear} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
          <Trash2 className="w-3.5 h-3.5" />
          清除
        </button>
      </div>

      {/* Keyboard */}
      <div className="grid grid-cols-5 gap-2 pb-4">
        {keyboardItems.map(char => (
          <button
            key={char}
            type="button"
            onClick={() => handleCharClick(char)}
            className={`h-12 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center text-xl font-semibold transition-colors shadow-sm ${getElementColor(char)}`}
          >
            {char}
          </button>
        ))}
      </div>
      
      {/* Time unknown toggle inside pillar picker */}
      <label className="flex items-center gap-2 justify-center text-sm text-stone-500 dark:text-stone-400 cursor-pointer pt-2 pb-1 border-t border-stone-100 dark:border-stone-800">
        <input
          type="checkbox"
          checked={!timeKnown}
          onChange={(e) => {
             const checked = e.target.checked;
             onTimeKnownChange(!checked);
             if (checked) {
               onChange({
                 ...value,
                 hour: null
               });
               // if hour is active, jump back to day
               if (activeSlot >= 6) {
                 setActiveSlot(5);
               }
             }
          }}
          className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 accent-stone-700"
        />
        不知道时柱
      </label>
    </div>
  );
}
