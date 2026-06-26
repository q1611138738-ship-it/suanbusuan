import { Solar } from 'lunar-javascript';
import { ChartJSON } from '@/types/module';
import { getTrueSolarTime } from './trueSolarTime';
import { calculateFiveElements } from './fiveElements';
import { getShenShaForPillars } from './shensha';
import { getPreciseDaYun } from './dayun';
import { BRANCH_HIDDEN } from './constants';
import { extractBreakpoints } from './breakpoints';
import { calculateWangShuai } from './wangshuai';
import { generateKaiyunAdvice } from './kaiyun';
// In-memory cache for simple Phase 1 caching
const chartCache = new Map<string, ChartJSON>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateHash(input: any): string {
  return JSON.stringify({
    solarDatetime: input.solarDatetime,
    gender: input.gender,
    longitude: input.longitude,
    timeKnown: input.timeKnown
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeChart(input: Record<string, any>): ChartJSON {
  const hash = generateHash(input);
  if (chartCache.has(hash)) {
    return chartCache.get(hash)!;
  }

  const { solarDatetime, gender, longitude, timeKnown } = input;
  let baseDate = new Date(solarDatetime);
  let timeAdjusted = false;

  // 真太阳时校正
  if (timeKnown && longitude !== undefined) {
    baseDate = getTrueSolarTime(baseDate, longitude);
    timeAdjusted = true;
  }

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + 1;
  const day = baseDate.getDate();
  const hour = baseDate.getHours();
  const min = baseDate.getMinutes();
  const sec = baseDate.getSeconds();

  const solar = Solar.fromYmdHms(year, month, day, hour, min, sec);
  const lunar = solar.getLunar();
  const baZi = lunar.getEightChar();
  
  // 晚子时算当日，早子时算次日 (lunar-javascript sect 2 对应这个规则)
  baZi.setSect(2);

  // 四柱
  const pillars = {
    year: { gan: baZi.getYearGan(), zhi: baZi.getYearZhi() },
    month: { gan: baZi.getMonthGan(), zhi: baZi.getMonthZhi() },
    day: { gan: baZi.getDayGan(), zhi: baZi.getDayZhi() },
    hour: { gan: baZi.getTimeGan(), zhi: baZi.getTimeZhi() }
  };

  // 藏干
  const hiddenStems = {
    year: BRANCH_HIDDEN[pillars.year.zhi] || [],
    month: BRANCH_HIDDEN[pillars.month.zhi] || [],
    day: BRANCH_HIDDEN[pillars.day.zhi] || [],
    hour: BRANCH_HIDDEN[pillars.hour.zhi] || []
  };

  // 十神 (天干十神)
  const tenGods = {
    year: baZi.getYearShiShenGan(),
    month: baZi.getMonthShiShenGan(),
    day: '日主', // 日干对自己
    hour: baZi.getTimeShiShenGan()
  };

  // 纳音
  const naYin = {
    year: baZi.getYearNaYin(),
    month: baZi.getMonthNaYin(),
    day: baZi.getDayNaYin(),
    hour: baZi.getTimeNaYin()
  };

  // 空亡 (以日柱查)
  const xunKong = {
    year: baZi.getYearXunKong(),
    month: baZi.getMonthXunKong(),
    day: baZi.getDayXunKong(),
    hour: baZi.getTimeXunKong()
  };

  // 五行
  const fiveElements = calculateFiveElements(baZi);

  // 神煞
  const shenSha = getShenShaForPillars(baZi);

  // 大运
  // 1: 男, 0: 女
  const genderCode = gender === 'male' ? 1 : 0;
  const preciseYun = getPreciseDaYun(baseDate, genderCode, baZi);
  
  // 仍然使用 lunar-javascript 来获取大运干支列表（排运逻辑没问题），但使用精算的起运时间
  const yun = baZi.getYun(genderCode, 1);
  const daYunArr = yun.getDaYun();
  
  // 起运公历年份
  const startSolarYear = baseDate.getFullYear() + preciseYun.years;

  const luck = {
    startAge: daYunArr.length > 0 ? daYunArr[0].getStartAge() : 0,
    startYear: startSolarYear,
    forward: preciseYun.isForward,
    startDesc: preciseYun.startDesc,
    startDate: preciseYun.startDate,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    steps: daYunArr.map((d: any) => {
      const ganZhi = d.getGanZhi();
      return {
        age: d.getStartAge(),
        year: d.getStartYear(),
        gan: ganZhi.substring(0, 1),
        zhi: ganZhi.substring(1)
      };
    })
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const localAdjustedTime = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())} ${pad(baseDate.getHours())}:${pad(baseDate.getMinutes())}:${pad(baseDate.getSeconds())}`;

  // Deterministic WangShuai & Kaiyun calculation
  const patternResult = calculateWangShuai(baZi);
  const kaiyunAdvice = generateKaiyunAdvice(patternResult.favorableElements, patternResult.unfavorableElements);

  const chartJSON: ChartJSON = {
    input: {
      ...input,
      timeAdjusted,
      adjustedTime: timeAdjusted ? localAdjustedTime : undefined
    },
    pillars,
    hiddenStems,
    tenGods,
    naYin,
    xunKong,
    fiveElements,
    shenSha,
    luck,
    currentYear: new Date().getFullYear(),
    pattern: patternResult,
    kaiyun: kaiyunAdvice,
    judgment: {
      strengthScore: patternResult.strengthScore,
      strengthLabel: patternResult.dmStrength,
      usefulElementsCandidate: patternResult.favorableElements
    }
  };

  chartJSON.breakpoints = extractBreakpoints(chartJSON);

  chartCache.set(hash, chartJSON);
  return chartJSON;
}
