import React, { useState, useMemo } from 'react';
export interface PillarData {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
}

interface PillarKeypadProps {
  value: PillarData;
  timeKnown: boolean;
  onChange: (val: PillarData, timeKnown: boolean) => void;
  onComplete: () => void; // Triggered when all 8 slots are filled
}

const YANG_GANS = ['甲', '丙', '戊', '庚', '壬'];
const YANG_ZHIS = ['子', '寅', '辰', '午', '申', '戌'];
const YIN_ZHIS = ['丑', '卯', '巳', '未', '酉', '亥'];
const GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHIS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getWuXingColor(char: string) {
  if (['甲', '乙', '寅', '卯'].includes(char)) return 'text-green-600 dark:text-green-500';
  if (['丙', '丁', '巳', '午'].includes(char)) return 'text-red-600 dark:text-red-500';
  if (['戊', '己', '辰', '戌', '丑', '未'].includes(char)) return 'text-[#8c6239] dark:text-[#a67c52]'; // Brown
  if (['庚', '辛', '申', '酉'].includes(char)) return 'text-amber-500 dark:text-amber-400'; // Gold/Orange
  if (['壬', '癸', '亥', '子'].includes(char)) return 'text-blue-600 dark:text-blue-500';
  return 'text-stone-800 dark:text-stone-200';
}

type SlotId = 'yearGan' | 'yearZhi' | 'monthGanZhi' | 'dayGan' | 'dayZhi' | 'hourGan' | 'hourZhi';

const SLOT_ORDER: SlotId[] = [
  'yearGan', 'yearZhi', 'monthGanZhi', 'dayGan', 'dayZhi', 'hourGan', 'hourZhi'
];

function getWuHuDun(yearGan: string): string[] {
  if (!yearGan) return [];
  let startGanIdx = 0;
  if (yearGan === '甲' || yearGan === '己') startGanIdx = 2; // 丙寅
  else if (yearGan === '乙' || yearGan === '庚') startGanIdx = 4; // 戊寅
  else if (yearGan === '丙' || yearGan === '辛') startGanIdx = 6; // 庚寅
  else if (yearGan === '丁' || yearGan === '壬') startGanIdx = 8; // 壬寅
  else if (yearGan === '戊' || yearGan === '癸') startGanIdx = 0; // 甲寅

  const res = [];
  const startZhiIdx = 2; // 寅
  for (let i = 0; i < 12; i++) {
    const g = GANS[(startGanIdx + i) % 10];
    const z = ZHIS[(startZhiIdx + i) % 12];
    res.push(g + z);
  }
  return res;
}

export function PillarKeypad({ value, timeKnown, onChange, onComplete }: PillarKeypadProps) {
  const [activeSlot, setActiveSlot] = useState<SlotId>('yearGan');

  // Auto-advance logic
  const advanceSlot = (current: SlotId) => {
    const idx = SLOT_ORDER.indexOf(current);
    if (idx < SLOT_ORDER.length - 1) {
      setActiveSlot(SLOT_ORDER[idx + 1]);
    } else {
      setActiveSlot('hourZhi'); // stay at last
    }
  };

  const handleKeyClick = (char: string) => {
    const nextVal = { ...value, year: { ...value.year }, month: { ...value.month }, day: { ...value.day }, hour: { ...value.hour } };
    let nextTimeKnown = timeKnown;

    if (activeSlot === 'yearGan') {
      nextVal.year.gan = char;
      // Auto-clear yearZhi if yin/yang mismatch
      if (nextVal.year.zhi) {
        const isYangGan = YANG_GANS.includes(char);
        const isYangZhi = YANG_ZHIS.includes(nextVal.year.zhi);
        if (isYangGan !== isYangZhi) nextVal.year.zhi = '';
      }
      // Auto-clear month if yearGan changes
      nextVal.month = { gan: '', zhi: '' };
      advanceSlot('yearGan');
    } else if (activeSlot === 'yearZhi') {
      nextVal.year.zhi = char;
      advanceSlot('yearZhi');
    } else if (activeSlot === 'monthGanZhi') {
      nextVal.month.gan = char[0];
      nextVal.month.zhi = char[1];
      advanceSlot('monthGanZhi');
    } else if (activeSlot === 'dayGan') {
      nextVal.day.gan = char;
      if (nextVal.day.zhi) {
        const isYangGan = YANG_GANS.includes(char);
        const isYangZhi = YANG_ZHIS.includes(nextVal.day.zhi);
        if (isYangGan !== isYangZhi) nextVal.day.zhi = '';
      }
      advanceSlot('dayGan');
    } else if (activeSlot === 'dayZhi') {
      nextVal.day.zhi = char;
      advanceSlot('dayZhi');
    } else if (activeSlot === 'hourGan') {
      if (char === '未知') {
        nextTimeKnown = false;
        nextVal.hour = { gan: '', zhi: '' };
      } else {
        nextTimeKnown = true;
        nextVal.hour.gan = char;
        if (nextVal.hour.zhi) {
          const isYangGan = YANG_GANS.includes(char);
          const isYangZhi = YANG_ZHIS.includes(nextVal.hour.zhi);
          if (isYangGan !== isYangZhi) nextVal.hour.zhi = '';
        }
      }
      advanceSlot('hourGan');
    } else if (activeSlot === 'hourZhi') {
      nextVal.hour.zhi = char;
      advanceSlot('hourZhi');
    }

    onChange(nextVal, nextTimeKnown);

    // Check completion
    const isComplete = 
      nextVal.year.gan && nextVal.year.zhi && 
      nextVal.month.gan && nextVal.month.zhi && 
      nextVal.day.gan && nextVal.day.zhi && 
      (!nextTimeKnown || (nextVal.hour.gan && nextVal.hour.zhi));
    
    if (isComplete) {
      setTimeout(() => onComplete(), 50);
    }
  };

  const clearAll = () => {
    onChange({
      year: { gan: '', zhi: '' },
      month: { gan: '', zhi: '' },
      day: { gan: '', zhi: '' },
      hour: { gan: '', zhi: '' }
    }, true);
    setActiveSlot('yearGan');
  };

  const renderSlot = (label: string, ganVal: string, zhiVal: string, slotGan: SlotId | 'monthGanZhi', slotZhi: SlotId | 'monthGanZhi', isDisabled?: boolean) => {
    const isGanActive = activeSlot === slotGan && !isDisabled;
    const isZhiActive = activeSlot === slotZhi && !isDisabled;

    return (
      <div className="flex flex-col items-center gap-4">
        <span className="text-sm font-medium text-stone-500">{label}</span>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => !isDisabled && setActiveSlot(slotGan)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium transition-all active:scale-95 ${
              isDisabled ? 'bg-stone-100 dark:bg-stone-800/50 opacity-50 cursor-not-allowed' :
              isGanActive 
                ? 'bg-stone-100 dark:bg-stone-800 ring-2 ring-stone-400 dark:ring-stone-500 shadow-sm' 
                : 'bg-stone-100/50 dark:bg-stone-800/30 hover:bg-stone-100 dark:hover:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700'
            }`}
          >
            {ganVal ? <span className={getWuXingColor(ganVal)}>{ganVal}</span> : null}
          </button>
          <button
            type="button"
            onClick={() => !isDisabled && setActiveSlot(slotZhi)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium transition-all active:scale-95 ${
              isDisabled ? 'bg-stone-100 dark:bg-stone-800/50 opacity-50 cursor-not-allowed' :
              isZhiActive 
                ? 'bg-stone-100 dark:bg-stone-800 ring-2 ring-stone-400 dark:ring-stone-500 shadow-sm' 
                : 'bg-stone-100/50 dark:bg-stone-800/30 hover:bg-stone-100 dark:hover:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700'
            }`}
          >
            {zhiVal ? <span className={getWuXingColor(zhiVal)}>{zhiVal}</span> : null}
          </button>
        </div>
      </div>
    );
  };

  const keyboardKeys = useMemo(() => {
    if (activeSlot === 'yearGan' || activeSlot === 'dayGan') {
      return GANS.map(g => ({ label: g, value: g }));
    }
    if (activeSlot === 'yearZhi') {
      const gan = value.year.gan;
      if (!gan) return ZHIS.map(z => ({ label: z, value: z }));
      const isYang = YANG_GANS.includes(gan);
      return (isYang ? YANG_ZHIS : YIN_ZHIS).map(z => ({ label: z, value: z }));
    }
    if (activeSlot === 'dayZhi') {
      const gan = value.day.gan;
      if (!gan) return ZHIS.map(z => ({ label: z, value: z }));
      const isYang = YANG_GANS.includes(gan);
      return (isYang ? YANG_ZHIS : YIN_ZHIS).map(z => ({ label: z, value: z }));
    }
    if (activeSlot === 'monthGanZhi') {
      if (!value.year.gan) return [];
      return getWuHuDun(value.year.gan).map(gz => ({ label: gz, value: gz }));
    }
    if (activeSlot === 'hourGan') {
      return [...GANS.map(g => ({ label: g, value: g })), { label: '未知', value: '未知' }];
    }
    if (activeSlot === 'hourZhi') {
      if (!timeKnown) return [];
      const gan = value.hour.gan;
      if (!gan) return ZHIS.map(z => ({ label: z, value: z }));
      const isYang = YANG_GANS.includes(gan);
      return (isYang ? YANG_ZHIS : YIN_ZHIS).map(z => ({ label: z, value: z }));
    }
    return [];
  }, [activeSlot, value.year.gan, value.day.gan, value.hour.gan, timeKnown]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* 8 Slots Area */}
      <div className="flex justify-between px-4">
        {renderSlot('年柱', value.year.gan, value.year.zhi, 'yearGan', 'yearZhi')}
        {renderSlot('月柱', value.month.gan, value.month.zhi, 'monthGanZhi', 'monthGanZhi', !value.year.gan)}
        {renderSlot('日柱', value.day.gan, value.day.zhi, 'dayGan', 'dayZhi')}
        {renderSlot('时柱', !timeKnown ? '' : value.hour.gan, !timeKnown ? '' : value.hour.zhi, 'hourGan', 'hourZhi')}
      </div>

      {/* Lookup Range & Clear */}
      <div className="flex items-center justify-between px-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-700 dark:text-stone-300 font-medium">查找范围:</span>
          <div className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            1801~2099年
          </div>
        </div>
        <button type="button" onClick={clearAll} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清除
        </button>
      </div>

      {/* Keyboard Area */}
      <div className="bg-stone-50 dark:bg-stone-800/30 p-4 rounded-xl min-h-[180px]">
        {activeSlot === 'monthGanZhi' && !value.year.gan ? (
          <div className="h-full flex items-center justify-center text-stone-400 text-sm">
            请先选择年干
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {keyboardKeys.map((key) => {
              if (key.value === '未知') {
                return (
                  <button
                    key={key.value}
                    type="button"
                    onClick={() => handleKeyClick(key.value)}
                    className="col-span-5 mt-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 active:bg-stone-200 dark:active:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg py-3 text-base font-medium transition-colors"
                  >
                    {key.label}
                  </button>
                );
              }
              
              // For month combos, render Gan and Zhi colors
              const content = key.value.length === 2 ? (
                <>
                  <span className={getWuXingColor(key.value[0])}>{key.value[0]}</span>
                  <span className={getWuXingColor(key.value[1])}>{key.value[1]}</span>
                </>
              ) : (
                <span className={getWuXingColor(key.value)}>{key.label}</span>
              );

              return (
                <button
                  key={key.value}
                  type="button"
                  onClick={() => handleKeyClick(key.value)}
                  className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-600 active:scale-95 active:bg-stone-100 dark:active:bg-stone-800 rounded-lg py-3 text-xl font-medium shadow-sm transition-all flex items-center justify-center gap-0.5"
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
