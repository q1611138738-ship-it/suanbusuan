'use client';

import { useState, useCallback } from 'react';
import { WheelPicker } from './WheelPicker';
import { PillarKeypad } from './PillarKeypad';
import { reverseLookupBaZi, ReverseLookupResult } from '@/modules/bazi/reverseLookup';

type InputMode = 'solar' | 'lunar' | 'pillars';

interface BaziBirthPickerSheetProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfirm: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

/* ── Data generators ── */

function yearItems() {
  const cur = new Date().getFullYear();
  const out = [];
  for (let y = cur; y >= 1900; y--) out.push({ label: `${y}年`, value: String(y) });
  return out;
}
function solarMonthItems() {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}月`,
    value: String(i + 1).padStart(2, '0'),
  }));
}
function solarDayItems(year: number, month: number) {
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => ({
    label: `${i + 1}日`,
    value: String(i + 1).padStart(2, '0'),
  }));
}
function hourItems() {
  return Array.from({ length: 24 }, (_, i) => ({
    label: `${String(i).padStart(2, '0')}时`,
    value: String(i).padStart(2, '0'),
  }));
}
function minuteItems() {
  return Array.from({ length: 60 }, (_, i) => ({
    label: `${String(i).padStart(2, '0')}分`,
    value: String(i).padStart(2, '0'),
  }));
}

const LUNAR_MONTHS = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
function lunarMonthItems() {
  return LUNAR_MONTHS.map((n, i) => ({ label: n, value: String(i + 1) }));
}
const LUNAR_DAYS = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
];
function lunarDayItems(count = 30) {
  return LUNAR_DAYS.slice(0, count).map((n, i) => ({ label: n, value: String(i + 1) }));
}

const TABS: { key: InputMode; label: string }[] = [
  { key: 'solar', label: '公历' },
  { key: 'lunar', label: '农历' },
  { key: 'pillars', label: '四柱' },
];

/* ── Component ── */

export function BaziBirthPickerSheet({ open, onClose, onConfirm, initialData }: BaziBirthPickerSheetProps) {
  const now = new Date();
  const [mode, setMode] = useState<InputMode>(initialData?.inputMode || 'solar');

  // Solar
  const [sYear, setSYear] = useState(String(initialData?.solarYear || now.getFullYear()));
  const [sMonth, setSMonth] = useState(String(initialData?.solarMonth || now.getMonth() + 1).padStart(2, '0'));
  const [sDay, setSDay] = useState(String(initialData?.solarDay || now.getDate()).padStart(2, '0'));
  const [sHour, setSHour] = useState(String(initialData?.solarHour ?? 12).padStart(2, '0'));
  const [sMinute, setSMinute] = useState(String(initialData?.solarMinute ?? 0).padStart(2, '0'));
  const [timeKnown, setTimeKnown] = useState(initialData?.timeKnown !== false);

  // Lunar
  const [lYear, setLYear] = useState(String(initialData?.lunarYear || now.getFullYear()));
  const [lMonth, setLMonth] = useState(String(initialData?.lunarMonth || 1));
  const [lDay, setLDay] = useState(String(initialData?.lunarDay || 1));
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // Pillars
  const [pillarData, setPillarData] = useState(initialData?.pillars || {
    year: { gan: '', zhi: '' },
    month: { gan: '', zhi: '' },
    day: { gan: '', zhi: '' },
    hour: { gan: '', zhi: '' },
  });
  const [pillarTimeKnown, setPillarTimeKnown] = useState(true);
  const [candidates, setCandidates] = useState<ReverseLookupResult[] | null>(null);

  // Clamp solar day
  const solarDays = solarDayItems(Number(sYear), Number(sMonth));
  const clampedSDay = Number(sDay) > solarDays.length ? String(solarDays.length).padStart(2, '0') : sDay;
  if (clampedSDay !== sDay) {
    queueMicrotask(() => setSDay(clampedSDay));
  }

  const handleConfirm = useCallback(() => {
    if (mode === 'solar') {
      onConfirm({
        inputMode: 'solar',
        solarDate: `${sYear}-${sMonth}-${sDay}`,
        solarTime: timeKnown ? `${sHour}:${sMinute}` : '',
        timeKnown,
        solarYear: Number(sYear), solarMonth: Number(sMonth), solarDay: Number(sDay),
        solarHour: Number(sHour), solarMinute: Number(sMinute),
      });
      onClose();
    } else if (mode === 'lunar') {
      onConfirm({
        inputMode: 'lunar',
        lunarDate: { year: Number(lYear), month: Number(lMonth), day: Number(lDay), isLeapMonth },
        solarTime: timeKnown ? `${sHour}:${sMinute}` : '',
        timeKnown,
        lunarYear: Number(lYear), lunarMonth: Number(lMonth), lunarDay: Number(lDay),
        solarHour: Number(sHour), solarMinute: Number(sMinute),
      });
      onClose();
    } else {
      // Pillars mode
      if (candidates !== null) {
        // If already looking at candidates, don't do anything on 'Confirm' unless we want to force select first
        return;
      }
      
      const { year, month, day, hour } = pillarData;
      if (!year.gan || !year.zhi || !month.gan || !month.zhi || !day.gan || !day.zhi || (pillarTimeKnown && (!hour.gan || !hour.zhi))) {
        alert("请先填满八字信息");
        return;
      }

      const res = reverseLookupBaZi(
        year.gan + year.zhi,
        month.gan + month.zhi,
        day.gan + day.zhi,
        pillarTimeKnown ? hour.gan + hour.zhi : ''
      );
      setCandidates(res);
    }
  }, [mode, sYear, sMonth, sDay, sHour, sMinute, timeKnown, lYear, lMonth, lDay, isLeapMonth, pillarData, pillarTimeKnown, candidates, onConfirm, onClose]);

  if (!open) return null;

  /* ── Shared inner content ── */
  const header = (
    <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-stone-100 dark:border-stone-800">
      {candidates !== null && mode === 'pillars' ? (
        <button type="button" onClick={() => setCandidates(null)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-sm font-medium transition-all active:scale-95 active:text-stone-800 dark:active:text-stone-100">
          返回
        </button>
      ) : (
        <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-sm font-medium transition-all active:scale-95 active:text-stone-800 dark:active:text-stone-100">
          取消
        </button>
      )}
      <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 tracking-wide">
        {candidates !== null && mode === 'pillars' ? '请选择真实公历日期' : '出生信息'}
      </span>
      {!(candidates !== null && mode === 'pillars') && (
        <button
          type="button"
          onClick={handleConfirm}
          className="text-sm font-semibold px-5 py-1.5 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity active:scale-95"
        >
          确定
        </button>
      )}
    </div>
  );

  const tabs = (
    <div className="flex gap-1 p-1 bg-stone-100/80 dark:bg-stone-800/80 rounded-xl mx-6 mt-4 mb-2">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setMode(key)}
          className={`flex-1 h-10 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 ${
            mode === key
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 active:bg-stone-200/50 dark:active:bg-stone-700/50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const solarPicker = (
    <div className="flex flex-col gap-3 px-4">
      <div className="flex gap-0.5">
        <div className="flex-[2.2]"><WheelPicker items={yearItems()} value={sYear} onChange={setSYear} /></div>
        <div className="flex-1"><WheelPicker items={solarMonthItems()} value={sMonth} onChange={setSMonth} /></div>
        <div className="flex-1"><WheelPicker items={solarDays} value={clampedSDay} onChange={setSDay} /></div>
        <div className="flex-1"><WheelPicker items={hourItems()} value={sHour} onChange={setSHour} disabled={!timeKnown} /></div>
        <div className="flex-1"><WheelPicker items={minuteItems()} value={sMinute} onChange={setSMinute} disabled={!timeKnown} /></div>
      </div>
      <label className="flex items-center gap-2.5 justify-center text-sm text-stone-500 dark:text-stone-400 cursor-pointer select-none py-1">
        <input type="checkbox" checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 accent-stone-700" />
        不清楚具体时间
      </label>
    </div>
  );

  const lunarPicker = (
    <div className="flex flex-col gap-3 px-4">
      <div className="flex gap-0.5">
        <div className="flex-[2.2]"><WheelPicker items={yearItems()} value={lYear} onChange={setLYear} /></div>
        <div className="flex-[1.3]"><WheelPicker items={lunarMonthItems()} value={lMonth} onChange={setLMonth} /></div>
        <div className="flex-[1.3]"><WheelPicker items={lunarDayItems()} value={lDay} onChange={setLDay} /></div>
        <div className="flex-1"><WheelPicker items={hourItems()} value={sHour} onChange={setSHour} disabled={!timeKnown} /></div>
        <div className="flex-1"><WheelPicker items={minuteItems()} value={sMinute} onChange={setSMinute} disabled={!timeKnown} /></div>
      </div>
      <div className="flex items-center gap-5 justify-center py-1">
        <label className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 cursor-pointer select-none">
          <input type="checkbox" checked={isLeapMonth} onChange={(e) => setIsLeapMonth(e.target.checked)} className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 accent-stone-700" />
          闰月
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 cursor-pointer select-none">
          <input type="checkbox" checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 accent-stone-700" />
          不清楚具体时间
        </label>
      </div>
    </div>
  );

  const selectCandidate = (c: ReverseLookupResult) => {
    const [y, m, d] = c.solarDate.split('-');
    const [h, min] = (c.solarTime || '12:00').split(':');
    
    setSYear(y);
    setSMonth(m);
    setSDay(d);
    setSHour(h);
    setSMinute(min);
    setTimeKnown(!!c.solarTime);
    setMode('solar');
    setCandidates(null);
    
    // Automatically submit with solar mode
    onConfirm({
      inputMode: 'solar',
      solarDate: c.solarDate,
      solarTime: c.solarTime || '',
      timeKnown: !!c.solarTime,
      solarYear: Number(y), solarMonth: Number(m), solarDay: Number(d),
      solarHour: Number(h), solarMinute: Number(min),
    });
    onClose();
  };

  const pillarsPicker = (
    <div className="w-full">
      {candidates === null ? (
        <PillarKeypad
          value={pillarData}
          timeKnown={pillarTimeKnown}
          onChange={(val, tk) => { setPillarData(val); setPillarTimeKnown(tk); }}
          onComplete={handleConfirm}
        />
      ) : (
        <div className="flex flex-col px-4 py-2 gap-3 max-h-[60vh] overflow-y-auto">
          {candidates.length === 0 ? (
            <div className="py-10 text-center text-stone-500 dark:text-stone-400">
              <p>在查找范围内未找到符合该八字的公历日期。</p>
              <p className="text-sm mt-1 opacity-70">请检查干支输入是否有误，或尝试扩大查找范围。</p>
            </div>
          ) : (
            candidates.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectCandidate(c)}
                className="bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 active:bg-stone-200 dark:active:bg-stone-700 p-4 rounded-xl flex flex-col gap-1.5 text-left transition-all border border-stone-200/50 dark:border-stone-700/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500 dark:text-stone-400 w-10">阳历:</span>
                  <span className="text-base text-stone-800 dark:text-stone-200 font-medium">
                    {c.solarDate} {c.solarTime ? c.solarTime + ':00' : '00:00:00'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500 dark:text-stone-400 w-10">阴历:</span>
                  <span className="text-base text-stone-800 dark:text-stone-200 font-medium">
                    {c.lunarString}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  const body = (
    <div className="flex-1 overflow-y-auto min-h-0 py-2">
      {!(mode === 'pillars' && candidates !== null) && tabs}
      <div className="mt-2">
        {mode === 'solar' && solarPicker}
        {mode === 'lunar' && lunarPicker}
        {mode === 'pillars' && pillarsPicker}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop — lighter overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Desktop: centered modal (md+) */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[500px] max-h-[80dvh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl shadow-stone-900/10 dark:shadow-black/40 flex flex-col animate-in fade-in zoom-in-95 duration-200"
          style={{ ['--picker-bg' as string]: 'rgba(255,255,255,0.97)' }}
        >
          {header}
          {body}
        </div>
      </div>

      {/* Mobile: bottom sheet (<md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div
          className="w-full bg-white dark:bg-stone-900 rounded-t-3xl shadow-2xl shadow-stone-900/10 dark:shadow-black/40 flex flex-col animate-in slide-in-from-bottom duration-250"
          style={{
            maxHeight: '82dvh',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            ['--picker-bg' as string]: 'rgba(255,255,255,0.97)',
          }}
        >
          {header}
          {body}
        </div>
      </div>
    </>
  );
}
