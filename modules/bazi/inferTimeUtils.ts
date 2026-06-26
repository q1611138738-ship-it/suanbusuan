import { Solar, Lunar } from 'lunar-javascript';
import { computeChart } from './computeChart';
import { ChartJSON } from '@/types/module';

export interface CandidateInfo {
  shichen: string; // e.g., "子时 (23:00-01:00)"
  time: string; // e.g., "00:30"
  ganZhi: string; // e.g., "甲子"
  tenGod: string; // e.g., "正财"
  shenSha: string[]; // e.g., ["桃花", "天乙贵人"]
  mingGong: string; // e.g., "乙亥"
  chart: ChartJSON; // 完整的排盘数据
}

// 12个时辰的代表时间
const REPRESENTATIVE_TIMES = [
  { name: '早子时', time: '00:30', desc: '(00:00-01:00)' }, // 严格讲早子时是00-01
  { name: '丑时', time: '02:30', desc: '(01:00-03:00)' },
  { name: '寅时', time: '04:30', desc: '(03:00-05:00)' },
  { name: '卯时', time: '06:30', desc: '(05:00-07:00)' },
  { name: '辰时', time: '08:30', desc: '(07:00-09:00)' },
  { name: '巳时', time: '10:30', desc: '(09:00-11:00)' },
  { name: '午时', time: '12:30', desc: '(11:00-13:00)' },
  { name: '未时', time: '14:30', desc: '(13:00-15:00)' },
  { name: '申时', time: '16:30', desc: '(15:00-17:00)' },
  { name: '酉时', time: '18:30', desc: '(17:00-19:00)' },
  { name: '戌时', time: '20:30', desc: '(19:00-21:00)' },
  { name: '亥时', time: '22:30', desc: '(21:00-23:00)' },
  { name: '晚子时', time: '23:30', desc: '(23:00-24:00)' },
];

export function generateCandidateCharts(baseFormData: any): { candidates: CandidateInfo[], comparisonTable: string } {
  const candidates: CandidateInfo[] = [];

  const { solarYear, solarMonth, solarDay, lunarDate, inputMode } = baseFormData;
  
  let y: number, m: number, d: number;

  if (inputMode === 'lunar' && lunarDate) {
    // 转换农历到公历
    const lunar = Lunar.fromYmd(lunarDate.year, lunarDate.month, lunarDate.day);
    const solar = lunar.getSolar();
    y = solar.getYear();
    m = solar.getMonth();
    d = solar.getDay();
  } else {
    y = solarYear;
    m = solarMonth;
    d = solarDay;
  }

  // 避免同一个时辰重复（比如有的日子早晚子时干支一样，有的可能不一样，保险起见都列出，或者合并为子时）
  // 在 Lunar-javascript 中，晚子时（23-24）和早子时（00-01）算作不同的日子吗？
  // 排盘设置了 baZi.setSect(2); 早子算当天，晚子算当天。所以子时日柱一样。干支可能也一样。
  // 我们循环所有时间
  
  for (const rt of REPRESENTATIVE_TIMES) {
    const [hourStr, minuteStr] = rt.time.split(':');
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minuteStr, 10);

    const solarDatetime = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${rt.time}:00`;
    
    const input = {
      ...baseFormData,
      solarDatetime,
      solarYear: y,
      solarMonth: m,
      solarDay: d,
      solarHour: hour,
      solarMinute: min,
      timeKnown: true // 我们模拟已知时间来获取对应的排盘
    };

    const chart = computeChart(input);
    
    // 获取命宫
    const solarObj = Solar.fromYmdHms(y, m, d, hour, min, 0);
    const lunarObj = solarObj.getLunar();
    const baZiObj = lunarObj.getEightChar();
    baZiObj.setSect(2);
    const mingGong = baZiObj.getMingGong();

    candidates.push({
      shichen: `${rt.name} ${rt.desc}`,
      time: rt.time,
      ganZhi: chart.pillars.hour.gan + chart.pillars.hour.zhi,
      tenGod: chart.tenGods.hour,
      shenSha: chart.shenSha.hour.map((s: any) => s.name),
      mingGong: mingGong,
      chart: chart
    });
  }

  // 构建对比表字符串
  let comparisonTable = `【12时辰差异对比表（时柱与命宫）】\n`;
  comparisonTable += `| 时辰 | 时段 | 时柱干支 | 时柱十神 | 时柱神煞 | 命宫 |\n`;
  comparisonTable += `|---|---|---|---|---|---|\n`;
  for (const c of candidates) {
    comparisonTable += `| ${c.shichen} | ${c.time} | ${c.ganZhi} | ${c.tenGod} | ${c.shenSha.join('、') || '无'} | ${c.mingGong} |\n`;
  }

  return { candidates, comparisonTable };
}
