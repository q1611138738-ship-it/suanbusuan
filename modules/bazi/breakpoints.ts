import { ChartJSON, CandidateBreakpoint } from '@/types/module';
import { STEM_ELEMENTS, BRANCH_HIDDEN } from './constants';

const WU_XING_GENERATION: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
const WU_XING_CONTROL: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

function getDayMasterElement(dayGan: string): string {
  return STEM_ELEMENTS[dayGan] || '木';
}

function getTenGodElementRelation(dayElement: string, targetElement: string): 'same' | 'generate_out' | 'generate_in' | 'control_out' | 'control_in' {
  if (dayElement === targetElement) return 'same'; // 比劫
  if (WU_XING_GENERATION[dayElement] === targetElement) return 'generate_out'; // 食伤
  if (WU_XING_GENERATION[targetElement] === dayElement) return 'generate_in'; // 印枭
  if (WU_XING_CONTROL[dayElement] === targetElement) return 'control_out'; // 财星
  if (WU_XING_CONTROL[targetElement] === dayElement) return 'control_in'; // 官杀
  return 'same';
}

export function extractBreakpoints(chart: ChartJSON): CandidateBreakpoint[] {
  const breakpoints: CandidateBreakpoint[] = [];
  const dayGan = chart.pillars.day.gan;
  const dayElement = getDayMasterElement(dayGan);
  
  const birthYear = chart.input.solarYear || new Date(chart.input.solarDate || chart.input.solarDatetime || Date.now()).getFullYear();
  const currentAge = chart.currentYear - birthYear;

  const getAgeRange = (periodType?: string, pillars?: ('year'|'month'|'day'|'hour')[]): [number, number] => {
    if (periodType === 'early_life' || (pillars && pillars.includes('year') && pillars.length === 1)) return [0, 15];
    if (periodType === 'mid_life' || (pillars && pillars.includes('day') && !pillars.includes('hour') && !pillars.includes('year'))) return [31, 45];
    if (periodType === 'late_life' || (pillars && pillars.includes('hour') && pillars.length === 1)) return [46, 100];
    if (pillars && pillars.includes('month') && pillars.length === 1) return [16, 30];
    
    // If multiple pillars involved or lifelong, allow it to span up to currentAge so it passes filter if it's lifelong
    // But actually, lifelong traits are true across time. 
    return [0, 100]; 
  };
  
  // 1. 粗筛从格 (A5 Foundation)
  // 获取五行总分
  const fe = chart.fiveElements as Record<string, number>;
  const totalScore = Object.values(fe).reduce((a, b) => a + b, 0);
  
  // 找出日主一党的分数（比劫 + 印枭）
  let selfScore = 0;
  let dominantElement = '';
  let maxScore = 0;
  
  for (const [el, score] of Object.entries(fe)) {
    const relation = getTenGodElementRelation(dayElement, el);
    if (relation === 'same' || relation === 'generate_in') {
      selfScore += score;
    }
    if (score > maxScore) {
      maxScore = score;
      dominantElement = el;
    }
  }

  const selfRatio = selfScore / (totalScore || 1);
  const domRatio = maxScore / (totalScore || 1);
  const domRelation = getTenGodElementRelation(dayElement, dominantElement);

  // 从格粗筛：日主一党极弱 (< 15%)，且某一种异党五行极强 (> 60%)
  if (selfRatio < 0.15 && domRatio > 0.6) {
    let typeName = '从格';
    let coreDomain: 'wealth' | 'career' | 'general' = 'general';
    let meaning = '你的人生起伏极度依赖外界环境和机遇（顺势而为），一旦遇到生扶自己（比劫印枭）的年份反而容易破财大败。';
    
    if (domRelation === 'control_out') {
      typeName = '从财格';
      coreDomain = 'wealth';
      meaning = '你是典型的从财格，满盘财星，人生起伏与财富机遇高度绑定。顺应市场趋势则大发，遇到生扶自己（比劫印枭）的年份反而容易破财大败。';
    } else if (domRelation === 'control_in') {
      typeName = '从杀格';
      coreDomain = 'career';
      meaning = '你是典型的从杀格，满盘官杀，极其适合在体制内、军队或大企业爬升。顺应领导和权威则显贵，遇到生扶自己（比劫印枭）的年份反而容易惹事罢官。';
    } else if (domRelation === 'generate_out') {
      typeName = '从儿格';
      coreDomain = 'career';
      meaning = '你是典型的从儿格，满盘食伤，才华横溢极具创造力。靠专业技能和创意吃饭，遇到生扶自己（印枭）的年份反而容易抑郁或事业受阻。';
    }

    breakpoints.push({
      id: `cong_ge_${dominantElement}`,
      category: 'personality',
      basis: {
        description: `满盘${dominantElement}五行极旺（占比 ${(domRatio*100).toFixed(0)}%），日主${dayElement}极弱无根，疑似${typeName}`,
        involvedPillars: ['year', 'month', 'day', 'hour'],
      },
      timeRange: { isLifelong: true, ageRange: [0, 100] }, // 性格特质，不受时间过滤阻挡
      signalStrength: 9, // 极强信号，从格定一生
      isTimeDependent: false, // 粗筛暂定不依赖单一时辰
      coreMeaning: {
        domain: coreDomain,
        direction: 'neutral',
        template: meaning
      }
    });
  }

  // 2. 宫位冲合动 - 日支被冲 (Event/Pattern)
  // 检查原局地支是否冲日支 (子午、丑未、寅申、卯酉、辰戌、巳亥)
  const clashes: Record<string, string> = { '子':'午', '午':'子', '丑':'未', '未':'丑', '寅':'申', '申':'寅', '卯':'酉', '酉':'卯', '辰':'戌', '戌':'辰', '巳':'亥', '亥':'巳' };
  const dayZhi = chart.pillars.day.zhi;
  const clashingZhi = clashes[dayZhi];
  
  if (clashingZhi) {
    const pillarsWithClash = ['year', 'month', 'hour'].filter(p => chart.pillars[p].zhi === clashingZhi) as ('year'|'month'|'hour')[];
    
    if (pillarsWithClash.length > 0) {
      const isHourClash = pillarsWithClash.includes('hour');
      breakpoints.push({
        id: `clash_day_branch_${clashingZhi}`,
        category: 'pattern',
        basis: {
          description: `原局${pillarsWithClash.join('、')}支(${clashingZhi})冲配偶宫日支(${dayZhi})`,
          involvedPillars: ['day', ...pillarsWithClash],
        },
        timeRange: { isLifelong: true, ageRange: getAgeRange(undefined, ['day', ...pillarsWithClash]) },
        signalStrength: 8,
        isTimeDependent: isHourClash,
        coreMeaning: {
          domain: 'marriage',
          direction: 'negative',
          template: "原局带有婚姻宫相冲的配置，感情容易出现剧烈动荡，适合晚婚或者聚少离多的相处模式。"
        }
      });
    }
  }

  // 3. 神煞 - 羊刃 (Pattern)
  const shenShaObj = chart.shenSha as { year: string[], month: string[], day: string[], hour: string[] };
  if (shenShaObj) {
    const yangRenHour = shenShaObj.hour?.includes('羊刃');
    if (yangRenHour) {
      breakpoints.push({
        id: `yangren_hour`,
        category: 'pattern',
        basis: {
          description: `羊刃落入时柱`,
          involvedPillars: ['hour'],
          involvedShensha: ['羊刃']
        },
        timeRange: { isLifelong: true, periodType: 'late_life', ageRange: [46, 100] },
        signalStrength: 8,
        isTimeDependent: true,
        coreMeaning: {
          domain: 'health',
          direction: 'negative',
          template: "时柱带羊刃，晚年性格脾气可能比较刚烈，或者容易遇到见血、手术类的事情，需要注意身体保养和修心养性。"
        }
      });
    }

    // 驿马在日时
    const yiMaDay = shenShaObj.day?.includes('驿马');
    const yiMaHour = shenShaObj.hour?.includes('驿马');
    
    if (yiMaDay || yiMaHour) {
      const pillars: ('day' | 'hour')[] = [];
      if (yiMaDay) pillars.push('day');
      if (yiMaHour) pillars.push('hour');
      
      breakpoints.push({
        id: `yima_day_hour`,
        category: 'pattern',
        basis: {
          description: `驿马落入中晚年宫位`,
          involvedPillars: pillars,
          involvedShensha: ['驿马']
        },
        timeRange: { isLifelong: true, periodType: 'mid_life', ageRange: getAgeRange('mid_life', pillars) },
        signalStrength: 7,
        isTimeDependent: !!yiMaHour,
        coreMeaning: {
          domain: 'career',
          direction: 'neutral',
          template: "中晚年宫位带驿马，说明中年以后多走动，或者工作性质需要频繁出差、变动居所。"
        }
      });
    }
  }

  return breakpoints;
}
