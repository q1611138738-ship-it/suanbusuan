'use client';

import React, { useState, useMemo } from 'react';
import { Solar, Lunar } from 'lunar-javascript';
import { getTrueSolarTime } from '@/modules/bazi/trueSolarTime';
import { getShenShaForPillars } from '@/modules/bazi/shensha';
import { getPreciseDaYun } from '@/modules/bazi/dayun';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BaziChartResultProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: Record<string, any>;
}

// 提取五行颜色映射
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

function getTenGodColor(god: string) {
  const lucky = ['正官', '正印', '偏印', '正财', '偏财', '食神', '比肩', '劫财'];
  const unlucky = ['七杀', '伤官'];
  if (unlucky.includes(god)) return 'text-red-600 dark:text-red-500';
  if (lucky.includes(god)) return 'text-green-600 dark:text-green-500';
  return 'text-stone-500';
}

function formatDateTime(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

export function BaziChartResult({ input }: BaziChartResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDaYunIndex, setActiveDaYunIndex] = useState(0);
  const [activeLiuNianIndex, setActiveLiuNianIndex] = useState(-1); // -1 means none selected

  const chartData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let solar: any = null;
    let baseDate: Date;
    let originalDate: Date;
    let timeAdjusted = false;

    // 1. Resolve date
    const inputMode = input.inputMode || 'solar';
    const timeKnown = input.timeKnown === true || input.timeKnown === 'true';
    const gender = input.gender;

    if (inputMode === 'solar') {
      const { solarDate, solarTime } = input;
      const datetimeStr = solarDate ? `${solarDate}T${solarTime || "12:00"}:00` : new Date().toISOString();
      baseDate = new Date(datetimeStr);
      originalDate = new Date(baseDate.getTime());
    } else if (inputMode === 'lunar') {
      const ld = input.lunarDate;
      if (ld) {
        const lunarInput = Lunar.fromYmd(ld.year, ld.isLeapMonth ? -ld.month : ld.month, ld.day);
        const tempSolar = lunarInput.getSolar();
        const solarTime = input.solarTime || '12:00';
        baseDate = new Date(`${tempSolar.getYear()}-${String(tempSolar.getMonth()).padStart(2, '0')}-${String(tempSolar.getDay()).padStart(2, '0')}T${solarTime}:00`);
        originalDate = new Date(baseDate.getTime());
        // Recreate solar with time included
        solar = Solar.fromYmdHms(
          baseDate.getFullYear(),
          baseDate.getMonth() + 1,
          baseDate.getDate(),
          baseDate.getHours(),
          baseDate.getMinutes(),
          baseDate.getSeconds()
        );
      } else {
        baseDate = new Date();
        originalDate = new Date(baseDate.getTime());
      }
    } else {
      baseDate = new Date(); // fallback
      originalDate = new Date(baseDate.getTime());
    }

    const longitude = input.birthPlace?.longitude ? Number(input.birthPlace.longitude) : undefined;
    if (timeKnown && longitude !== undefined) {
      baseDate = getTrueSolarTime(baseDate, longitude);
      timeAdjusted = true;
    }

    if (!solar) {
      solar = Solar.fromYmdHms(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        baseDate.getDate(),
        baseDate.getHours(),
        baseDate.getMinutes(),
        baseDate.getSeconds()
      );
    }

    const lunar = solar.getLunar();
    const baZi = lunar.getEightChar();
    baZi.setSect(2); // 早晚子时约定

    // 获取排盘数据
    const genderCode = gender === 'male' ? 1 : 0;
    const preciseYun = getPreciseDaYun(baseDate, genderCode, baZi);
    
    // We still use lunar-javascript's yun object to get the array of DaYun pillars
    const yun = baZi.getYun(genderCode, 1);
    const daYunArr = yun.getDaYun();
    const shenShaList = getShenShaForPillars(baZi);

    return {
      solar,
      lunar,
      baZi,
      yun,
      preciseYun,
      daYunArr,
      shenShaList,
      baseDate,
      originalDate,
      timeAdjusted,
      genderStr: gender === 'male' ? '男' : '女',
      timeKnown
    };
  }, [input]);

  const { solar, lunar, baZi, yun, preciseYun, daYunArr, shenShaList, baseDate, originalDate, timeAdjusted, genderStr, timeKnown } = chartData;

  // 四柱数组: 时, 日, 月, 年 (从左到右显示，这里定义好顺序)
  // 按照问真八字习惯，从左到右：年柱、月柱、日柱、时柱
  const pillars = [
    {
      title: '年柱',
      gan: baZi.getYearGan(), zhi: baZi.getYearZhi(),
      shiShen: baZi.getYearShiShenGan(),
      hiddenStems: baZi.getYearHideGan(),
      hiddenShiShen: baZi.getYearShiShenZhi(),
      diShi: baZi.getYearDiShi(),
      ziZuo: Lunar.fromYmd(lunar.getYear(), 1, 1).getEightChar().getYearZhi(), // 这里自坐有点复杂，简单用其对应的长生，其实地支的自坐就是对应天干在地支的十二长生，即该柱的地势
      naYin: baZi.getYearNaYin(),
      xunKong: baZi.getYearXunKong(),
      shenSha: shenShaList.year
    },
    {
      title: '月柱',
      gan: baZi.getMonthGan(), zhi: baZi.getMonthZhi(),
      shiShen: baZi.getMonthShiShenGan(),
      hiddenStems: baZi.getMonthHideGan(),
      hiddenShiShen: baZi.getMonthShiShenZhi(),
      diShi: baZi.getMonthDiShi(),
      naYin: baZi.getMonthNaYin(),
      xunKong: baZi.getMonthXunKong(),
      shenSha: shenShaList.month
    },
    {
      title: '日柱',
      gan: baZi.getDayGan(), zhi: baZi.getDayZhi(),
      shiShen: '元男', // 或者是元女
      hiddenStems: baZi.getDayHideGan(),
      hiddenShiShen: baZi.getDayShiShenZhi(),
      diShi: baZi.getDayDiShi(),
      naYin: baZi.getDayNaYin(),
      xunKong: baZi.getDayXunKong(),
      shenSha: shenShaList.day
    },
    {
      title: '时柱',
      gan: baZi.getTimeGan(), zhi: baZi.getTimeZhi(),
      shiShen: baZi.getTimeShiShenGan(),
      hiddenStems: baZi.getTimeHideGan(),
      hiddenShiShen: baZi.getTimeShiShenZhi(),
      diShi: baZi.getTimeDiShi(),
      naYin: baZi.getTimeNaYin(),
      xunKong: baZi.getTimeXunKong(),
      shenSha: shenShaList.hour
    }
  ];
  
  if (genderStr === '女') {
    pillars[2].shiShen = '元女';
  }

  const birthPlaceStr = input.birthPlace 
    ? [input.birthPlace.province, input.birthPlace.city, input.birthPlace.district].filter(Boolean).join(' ') 
    : '未知';

  const jqSolar = lunar.getPrevJieQi().getSolar();
  const jqDate = new Date(jqSolar.getYear(), jqSolar.getMonth() - 1, jqSolar.getDay(), jqSolar.getHour(), jqSolar.getMinute(), jqSolar.getSecond());
  
  const diffTime = baseDate.getTime() - jqDate.getTime();
  const jieQiStr = lunar.getPrevJieQi().getName() + '后' + 
    Math.floor(diffTime / (1000 * 60 * 60 * 24)) + '天' +
    Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + '小时';

  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
      {/* 顶部标题与折叠按钮 */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-stone-800 dark:bg-stone-200 rounded-full" />
          <h3 className="font-semibold text-stone-800 dark:text-stone-200">排盘结果 ({lunar.getYearShengXiao()}命)</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          {isExpanded ? '收起详情' : '查看完整排盘'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-0">
          {/* 基本信息区块 */}
          <div className="bg-[#1C1C1E] text-stone-300 text-xs sm:text-sm">
            <div className="flex items-center p-4 border-b border-stone-800">
              <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center text-xl shadow-inner text-amber-500 border border-stone-700 font-serif mr-4">
                {lunar.getYearShengXiao()}
              </div>
              <div className="flex-1">
                <div className="text-stone-100 font-medium mb-1 flex items-center gap-3">
                  <span className="text-base">{genderStr === '男' ? '乾造' : '坤造'}</span>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-stone-800 text-[10px] border border-stone-700">生肖: {lunar.getYearShengXiao()}</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-800 text-[10px] border border-stone-700">{new Date().getFullYear() - solar.getYear() + 1}岁 {genderStr}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 详细信息列表 */}
            <div className="grid grid-cols-1 divide-y divide-stone-800/50 bg-[#F4F4F5] dark:bg-[#1A1A1C] text-[#333] dark:text-[#CCC]">
              <div className="px-4 py-2 flex gap-2"><span className="text-stone-500 dark:text-stone-500 min-w-[70px]">农历：</span>{lunar.toString()} {timeKnown ? '' : '(时辰未知)'}</div>
              <div className="px-4 py-2 flex gap-2"><span className="text-stone-500 dark:text-stone-500 min-w-[70px]">阳历：</span>{timeKnown ? formatDateTime(originalDate) : solar.toString()}</div>
              {timeAdjusted && <div className="px-4 py-2 flex gap-2"><span className="text-stone-500 dark:text-stone-500 min-w-[70px]">真太阳时：</span>{formatDateTime(baseDate)}</div>}
              <div className="px-4 py-2 flex gap-2"><span className="text-stone-500 dark:text-stone-500 min-w-[70px]">出生地区：</span>{birthPlaceStr}</div>
              <div className="px-4 py-2 flex gap-2"><span className="text-stone-500 dark:text-stone-500 min-w-[70px]">出生节气：</span>{jieQiStr}</div>
              
              <div className="grid grid-cols-2 divide-x divide-stone-800/50">
                <div className="px-4 py-2 flex flex-col gap-1">
                  <div className="flex gap-2"><span className="text-stone-500 dark:text-stone-500">胎元：</span>{baZi.getTaiYuan()}</div>
                  <div className="flex gap-2"><span className="text-stone-500 dark:text-stone-500">命宫：</span>{baZi.getMingGong()}</div>
                  <div className="flex gap-2"><span className="text-stone-500 dark:text-stone-500">身宫：</span>{baZi.getShenGong()}</div>
                </div>
                <div className="px-4 py-2 flex flex-col gap-1">
                  <div className="flex gap-2"><span className="text-stone-500 dark:text-stone-500">年空：</span>{baZi.getYearXunKong()}</div>
                  <div className="flex gap-2"><span className="text-stone-500 dark:text-stone-500">日空：</span>{baZi.getDayXunKong()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 核心四柱排盘区 */}
          <div className="overflow-x-auto bg-white dark:bg-stone-950 pb-4">
            <div className="min-w-[320px] w-full grid grid-cols-5 text-center text-sm border-t border-stone-200 dark:border-stone-800 divide-x divide-stone-100 dark:divide-stone-900">
              {/* 左侧表头 */}
              <div className="flex flex-col text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-900/50">
                <div className="py-2 h-[34px] border-b border-stone-100 dark:border-stone-800"></div>
                <div className="py-2 h-[34px]">主星</div>
                <div className="py-2 h-[42px]">天干</div>
                <div className="py-2 h-[42px] border-b border-stone-100 dark:border-stone-800">地支</div>
                <div className="py-2 h-[68px] flex items-center justify-center border-b border-stone-100 dark:border-stone-800">藏干</div>
                <div className="py-2 h-[30px]">星运</div>
                <div className="py-2 h-[30px]">自坐</div>
                <div className="py-2 h-[30px]">空亡</div>
                <div className="py-2 h-[30px] border-b border-stone-100 dark:border-stone-800">纳音</div>
                <div className="py-2 pt-3 flex-1">神煞</div>
              </div>

              {/* 四柱数据 */}
              {pillars.map((pillar, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="py-2 h-[34px] text-xs text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">{pillar.title}</div>
                  <div className={`py-2 h-[34px] text-xs ${getTenGodColor(pillar.shiShen)}`}>{pillar.shiShen}</div>
                  <div className={`py-1.5 h-[42px] text-2xl font-bold font-serif ${getElementColor(pillar.gan)}`}>{pillar.gan}</div>
                  <div className={`py-1.5 h-[42px] text-2xl font-bold font-serif border-b border-stone-100 dark:border-stone-800 ${getElementColor(pillar.zhi)}`}>
                    {!timeKnown && idx === 3 ? '?' : pillar.zhi}
                  </div>
                  
                  {/* 藏干 */}
                  <div className="py-2 h-[68px] flex flex-col items-center justify-center gap-1 border-b border-stone-100 dark:border-stone-800">
                    {(!timeKnown && idx === 3) ? null : pillar.hiddenStems.map((gan: string, i: number) => (
                      <div key={i} className="flex items-center gap-1 text-[11px]">
                        <span className={getElementColor(gan)}>{gan}</span>
                        <span className={getTenGodColor(pillar.hiddenShiShen[i])}>{pillar.hiddenShiShen[i]}</span>
                      </div>
                    ))}
                  </div>

                  <div className="py-1.5 h-[30px] text-xs text-stone-600 dark:text-stone-400">{pillar.diShi}</div>
                  <div className="py-1.5 h-[30px] text-xs text-stone-600 dark:text-stone-400">{pillar.diShi}</div> {/* 自坐简略处理 */}
                  <div className="py-1.5 h-[30px] text-xs text-stone-600 dark:text-stone-400">{pillar.xunKong}</div>
                  <div className="py-1.5 h-[30px] text-xs text-stone-600 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">{pillar.naYin}</div>
                  
                  {/* 神煞 */}
                  <div className="py-2 pt-3 flex flex-col gap-1 items-center flex-1">
                    {(!timeKnown && idx === 3) ? null : pillar.shenSha.map((sha: string, i: number) => (
                      <span key={i} className="text-[10px] text-amber-700/80 dark:text-amber-500/80">{sha}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 大运流年交互区 */}
          <div className="bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
            <div className="px-4 py-3 text-xs text-stone-500 border-b border-stone-200 dark:border-stone-800 flex justify-between">
              <div>
                <p>起运：{preciseYun.startDesc}</p>
                {preciseYun.startDate && (
                  <p className="mt-0.5">交运：{(() => {
                    const sd = new Date(preciseYun.startDate);
                    return `${sd.getFullYear()}年${sd.getMonth() + 1}月${sd.getDate()}日${sd.getHours()}时交大运`;
                  })()}</p>
                )}
              </div>
            </div>
            
            {/* 大运列表 (横向滚动) */}
            <div className="flex overflow-x-auto p-2 gap-2 hide-scrollbar">
              <div className="flex items-center justify-center px-3 text-xs font-medium text-stone-400 border-r border-stone-200 dark:border-stone-700 shrink-0">
                大运
              </div>
              {daYunArr.map((dy: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveDaYunIndex(idx);
                    setActiveLiuNianIndex(-1); // 重置流年选择
                  }}
                  className={`flex flex-col items-center justify-center min-w-[48px] p-2 rounded-xl border transition-all ${
                    activeDaYunIndex === idx 
                      ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-md' 
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100 dark:bg-stone-950 dark:text-stone-400 dark:border-stone-800 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-[10px] opacity-80 mb-1">{dy.getStartAge()}岁</span>
                  <span className="text-sm font-bold font-serif">{dy.getGanZhi()}</span>
                  <span className="text-[10px] opacity-80 mt-1">{dy.getStartYear()}</span>
                </button>
              ))}
            </div>

            {/* 选中大运对应的流年列表 */}
            {activeDaYunIndex >= 0 && (
              <div className="p-2 pt-0">
                <div className="flex overflow-x-auto gap-2 py-2 hide-scrollbar">
                  <div className="flex items-center justify-center px-3 text-xs font-medium text-stone-400 border-r border-stone-200 dark:border-stone-700 shrink-0">
                    流年
                  </div>
                  {daYunArr[activeDaYunIndex].getLiuNian().map((ln: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveLiuNianIndex(idx)}
                      className={`flex flex-col items-center justify-center min-w-[48px] p-2 rounded-xl transition-all ${
                        activeLiuNianIndex === idx
                          ? 'bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-100 font-bold shadow-inner'
                          : 'bg-transparent text-stone-600 hover:bg-stone-200/50 dark:text-stone-400 dark:hover:bg-stone-800/50'
                      }`}
                    >
                      <span className="text-[10px] opacity-70 mb-1">{ln.getYear()}</span>
                      <span className="text-sm font-serif">{ln.getGanZhi()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 选中流年对应的流月列表 */}
            {activeDaYunIndex >= 0 && activeLiuNianIndex >= 0 && (
              <div className="p-2 pt-0 pb-3 bg-stone-100/50 dark:bg-stone-900/50 border-t border-stone-200/50 dark:border-stone-800/50">
                 <div className="flex overflow-x-auto gap-1 py-2 hide-scrollbar">
                  <div className="flex items-center justify-center px-3 text-xs font-medium text-stone-400 border-r border-stone-200 dark:border-stone-700 shrink-0">
                    流月
                  </div>
                  {daYunArr[activeDaYunIndex].getLiuNian()[activeLiuNianIndex].getLiuYue().map((ly: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center min-w-[40px] p-1.5"
                    >
                      <span className="text-[10px] text-stone-400">{ly.getMonthInChinese()}月</span>
                      <span className="text-xs font-serif text-stone-700 dark:text-stone-300">{ly.getGanZhi()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
