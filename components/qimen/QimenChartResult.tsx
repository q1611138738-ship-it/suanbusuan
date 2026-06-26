'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toVerifySummary } from '@/modules/qimen/engine';
import styles from './QimenChartResult.module.css';

interface QimenChartResultProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chart: any;
}

// 洛书九宫固定排列（上南下北、左东右西 → 巽离坤/震中兑/艮坎乾）
const GONG_LAYOUT: [string, number][] = [
  ['巽', 4], ['离', 9], ['坤', 2],
  ['震', 3], ['中', 5], ['兑', 7],
  ['艮', 8], ['坎', 1], ['乾', 6],
];

// 三吉门
const LUCKY_DOORS = new Set(['开门', '休门', '生门']);
// 凶门
const BAD_DOORS = new Set(['死门', '惊门']);

const VITALITY_CLASS: Record<string, string> = {
  '旺': styles.vitalityStrong,
  '相': styles.vitalityStrong,
  '休': styles.vitalityNeutral,
  '囚': styles.vitalityWeak,
  '死': styles.vitalityDead,
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getDoorClass(door: string): string {
  if (LUCKY_DOORS.has(door)) return styles.doorLucky;
  if (BAD_DOORS.has(door)) return styles.doorBad;
  return styles.doorNeutral;
}

export function QimenChartResult({ chart }: QimenChartResultProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!chart || !chart._qimenChart) return null;

  const qimenChart = chart._qimenChart;
  const palaces = qimenChart.palaces;
  const verifySummary = toVerifySummary(qimenChart);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPalace = (name: string, num: number): any | null => {
    return palaces.find((p: any) => p.gongName === name && p.gongNumber === num) || null;
  };

  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden mb-4">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-stone-800 dark:bg-stone-200 rounded-full" />
          <h3 className="font-semibold text-sm text-stone-800 dark:text-stone-200">
            奇门排盘：{qimenChart.ju.label}
          </h3>
          <span className="text-xs text-stone-400 ml-1">
            值符 {qimenChart.zhiFu.star} · 值使 {qimenChart.zhiShi.door}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 flex flex-col gap-3">
          {/* Verify summary */}
          <div className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/40 px-3 py-2 rounded-lg whitespace-pre-wrap leading-relaxed font-mono">
            {verifySummary}
          </div>

          {/* 3x3 Grid */}
          <div className={styles.board}>
            {GONG_LAYOUT.map(([name, num]) => {
              const p = getPalace(name, num);
              const isMid = num === 5;

              if (!p || isMid) {
                // 中5宫: 只显示地盘干
                const midPalace = getPalace(name, num);
                return (
                  <div key={`${name}${num}`} className={joinClasses(styles.palace, styles.midPalace)}>
                    <span className={styles.gongLabel}>{name}{num}宫</span>
                    {midPalace?.earthStems && (
                      <span className={styles.midStem}>{midPalace.earthStems.join('')}</span>
                    )}
                  </div>
                );
              }

              // Normal palace
              const isKongWang = p.isKongWang;
              const isZhiFu = p.isZhiFuGong;
              const isZhiShi = p.isZhiShiGong;
              const isYiMa = p.isYiMa;
              const mainStar = p.heavenStar?.[0] || '';
              const starVitality = p.starVitality;
              const door = p.door || '';
              const divinity = p.divinity || '';

              return (
                <div
                  key={`${name}${num}`}
                  className={joinClasses(
                    styles.palace,
                    isZhiFu && styles.zhiFuPalace,
                    isZhiShi && styles.zhiShiPalace,
                    isKongWang && styles.kongWangPalace
                  )}
                >
                  <div className={styles.metaRow}>
                    <span className={styles.divinity}>
                      {divinity}
                    </span>
                    <span className={styles.gongLabel}>{name}{num}</span>
                  </div>

                  <div className={styles.mainRow}>
                    <div className={styles.starBlock}>
                      <span className={styles.star}>{mainStar}</span>
                      {starVitality && (
                        <span className={joinClasses(styles.vitality, VITALITY_CLASS[starVitality])}>
                          {starVitality}
                        </span>
                      )}
                    </div>
                    <div className={styles.heavenStemBlock}>
                      <span className={styles.stemLabel}>天</span>
                      <span className={styles.stemValue}>{p.heavenStems.join('')}</span>
                    </div>
                  </div>

                  <div className={styles.doorRow}>
                    <span className={joinClasses(styles.door, getDoorClass(door))}>
                      {door}
                    </span>
                    <div className={styles.earthStemBlock}>
                      <span className={styles.stemLabel}>地</span>
                      <span className={styles.stemValue}>{p.earthStems.join('')}</span>
                    </div>
                  </div>

                  <div className={styles.badgeRow} aria-label="宫位标记">
                      {isZhiFu && (
                        <span className={joinClasses(styles.badge, styles.badgeZhiFu)}>
                          值符
                        </span>
                      )}
                      {isZhiShi && (
                        <span className={joinClasses(styles.badge, styles.badgeZhiShi)}>
                          值使
                        </span>
                      )}
                      {isYiMa && (
                        <span className={joinClasses(styles.badge, styles.badgeYiMa)} title="驿马">驿马</span>
                      )}
                      {isKongWang && (
                        <span className={joinClasses(styles.badge, styles.badgeKong)}>
                          空亡
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={joinClasses(styles.legendSwatch, styles.legendZhiFu)} /> 值符宫
            </span>
            <span className={styles.legendItem}>
              <span className={joinClasses(styles.legendChip, styles.badgeZhiShi)}>值使</span> 值使
            </span>
            <span className={styles.legendItem}>
              <span className={joinClasses(styles.legendChip, styles.badgeYiMa)}>驿马</span> 驿马
            </span>
            <span className={styles.legendItem}>
              <span className={joinClasses(styles.legendChip, styles.badgeKong)}>空亡</span> 空亡
            </span>
            <span className={styles.legendDivider} />
            <span className={styles.legendItem}><span className={joinClasses(styles.legendDot, styles.legendLucky)} /> 吉门</span>
            <span className={styles.legendItem}><span className={joinClasses(styles.legendDot, styles.legendBad)} /> 凶门</span>
          </div>
        </div>
      )}
    </div>
  );
}
