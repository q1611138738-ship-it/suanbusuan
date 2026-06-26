import { EightChar } from 'lunar-javascript';
import { STEM_ELEMENTS, BRANCH_ELEMENTS, BRANCH_HIDDEN } from './constants';

export const WANG_SHUAI_WEIGHTS = {
  MONTH_BRANCH: 50,
  OTHER_BRANCH: 10,
  OTHER_STEM: 6.66,
};

export const ELEMENT_RELATIONS: Record<string, string> = {
  '木生': '火', '火生': '土', '土生': '金', '金生': '水', '水生': '木',
  '木克': '土', '土克': '水', '水克': '火', '火克': '金', '金克': '木',
};

// 1. 基本五行生克推导
export function getGeneratingElement(target: string): string {
  for (const [key, val] of Object.entries(ELEMENT_RELATIONS)) {
    if (key.endsWith('生') && val === target) return key[0];
  }
  return '';
}

export function getGeneratedElement(target: string): string {
  return ELEMENT_RELATIONS[target + '生'] || '';
}

export function getDestroyingElement(target: string): string {
  for (const [key, val] of Object.entries(ELEMENT_RELATIONS)) {
    if (key.endsWith('克') && val === target) return key[0];
  }
  return '';
}

export function getDestroyedElement(target: string): string {
  return ELEMENT_RELATIONS[target + '克'] || '';
}

export interface PatternResult {
  isSpecial: boolean;
  patternName: string;
  strengthScore: number;
  dmStrength: '极弱' | '偏弱' | '中和' | '偏强' | '极强';
  favorableElements: string[]; // 喜用神 (主)
  unfavorableElements: string[]; // 忌神
  climateFavorable?: string[]; // 调候用神
  details: string;
}

// 十神辅助
function getTenGodCategory(dmElement: string, targetElement: string): '印枭' | '比劫' | '食伤' | '正偏财' | '官杀' {
  if (targetElement === dmElement) return '比劫';
  if (targetElement === getGeneratingElement(dmElement)) return '印枭';
  if (targetElement === getGeneratedElement(dmElement)) return '食伤';
  if (targetElement === getDestroyedElement(dmElement)) return '正偏财';
  return '官杀';
}

// 2. 主函数
export function calculateWangShuai(baZi: typeof EightChar.prototype): PatternResult {
  const dm = baZi.getDayGan();
  const dmElement = STEM_ELEMENTS[dm];
  const motherElement = getGeneratingElement(dmElement);

  const pillars = {
    year: { stem: baZi.getYearGan(), branch: baZi.getYearZhi() },
    month: { stem: baZi.getMonthGan(), branch: baZi.getMonthZhi() },
    day: { stem: baZi.getDayGan(), branch: baZi.getDayZhi() },
    hour: { stem: baZi.getTimeGan(), branch: baZi.getTimeZhi() }
  };

  // 分布统计所有元素的原始得分 (不含合局)
  const rawElementScores: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  
  // 势 (天干)
  for (const p of [pillars.year, pillars.month, pillars.hour]) {
    rawElementScores[STEM_ELEMENTS[p.stem]] += WANG_SHUAI_WEIGHTS.OTHER_STEM;
  }

  const branchPillars = [
    { b: pillars.month.branch, w: WANG_SHUAI_WEIGHTS.MONTH_BRANCH },
    { b: pillars.year.branch, w: WANG_SHUAI_WEIGHTS.OTHER_BRANCH },
    { b: pillars.day.branch, w: WANG_SHUAI_WEIGHTS.OTHER_BRANCH },
    { b: pillars.hour.branch, w: WANG_SHUAI_WEIGHTS.OTHER_BRANCH }
  ];

  for (const bp of branchPillars) {
    const mainEl = STEM_ELEMENTS[BRANCH_HIDDEN[bp.b][0]];
    rawElementScores[mainEl] += bp.w;
  }

  // 计算带合局加权的 elementScores
  const elementScores: Record<string, number> = { ...rawElementScores };
  
  // 令与地 (地支) - 支持三合、三会局加权
  const branches = [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch];
  const frames = [
    // 三会
    { components: ['寅', '卯', '辰'], element: '木', type: 'hui' },
    { components: ['巳', '午', '未'], element: '火', type: 'hui' },
    { components: ['申', '酉', '戌'], element: '金', type: 'hui' },
    { components: ['亥', '子', '丑'], element: '水', type: 'hui' },
    // 三合
    { components: ['亥', '卯', '未'], element: '木', type: 'he' },
    { components: ['寅', '午', '戌'], element: '火', type: 'he' },
    { components: ['巳', '酉', '丑'], element: '金', type: 'he' },
    { components: ['申', '子', '辰'], element: '水', type: 'he' },
    // 半合 (必须包含中神)
    { components: ['亥', '卯'], element: '木', type: 'banhe' },
    { components: ['卯', '未'], element: '木', type: 'banhe' },
    { components: ['寅', '午'], element: '火', type: 'banhe' },
    { components: ['午', '戌'], element: '火', type: 'banhe' },
    { components: ['巳', '酉'], element: '金', type: 'banhe' },
    { components: ['酉', '丑'], element: '金', type: 'banhe' },
    { components: ['申', '子'], element: '水', type: 'banhe' },
    { components: ['子', '辰'], element: '水', type: 'banhe' }
  ];

  let frameElement: string | null = null;
  let frameComponents: string[] = [];
  let frameType: string = '';
  for (const frame of frames) {
    if (frame.components.every(c => branches.includes(c))) {
      frameElement = frame.element;
      frameComponents = frame.components;
      frameType = frame.type;
      break;
    }
  }

  if (frameElement) {
    for (const bp of branchPillars) {
      if (frameComponents.includes(bp.b)) {
        if (frameType === 'banhe') {
           // 半合局作用域分层：不剥夺原始本气，仅为合化五行叠加分数
           elementScores[frameElement] += bp.w;
        } else {
           // 三合、三会：完全转化为合局五行，剥夺原始本气
           const mainEl = STEM_ELEMENTS[BRANCH_HIDDEN[bp.b][0]];
           elementScores[mainEl] -= bp.w;
           elementScores[frameElement] += bp.w;
        }
      }
    }
  }

  const strengthScore = elementScores[dmElement] + elementScores[motherElement];

  // 检查是否有根 (日主同类五行是否在地支本气中出现，成局也算本气根)
  let hasRoot = false;
  if (frameElement === dmElement) {
    hasRoot = true;
  }
  for (const branch of branches) {
    if (STEM_ELEMENTS[BRANCH_HIDDEN[branch][0]] === dmElement) {
      hasRoot = true;
      break;
    }
  }

  // 检查化气组合
  const combineTransforms: Record<string, string> = {
    '甲己': '土', '乙庚': '金', '丙辛': '水', '丁壬': '木', '戊癸': '火'
  };
  const getTransform = (stem1: string, stem2: string) => combineTransforms[`${stem1}${stem2}`] || combineTransforms[`${stem2}${stem1}`] || null;

  // ==== 1. 尝试判定化气格 ====
  let transformElement: string | null = null;
  // 仅限月干或时干与日干相合 (紧贴日主)
  const monthTrans = getTransform(dm, pillars.month.stem);
  const hourTrans = getTransform(dm, pillars.hour.stem);
  
  // 隔离合局：得月令支持必须看原始本气，不受合局加权影响
  const monthOriginalMain = STEM_ELEMENTS[BRANCH_HIDDEN[pillars.month.branch][0]];

  if (monthTrans) {
    // 严格：化神必须得月令本气支持（不仅是相生，必须完全匹配）
    if (monthOriginalMain === monthTrans) {
      transformElement = monthTrans;
    }
  } else if (hourTrans) {
    if (monthOriginalMain === hourTrans) {
      transformElement = hourTrans;
    }
  }

  if (transformElement) {
    // 日主自身有本气根，或有透出的比劫相助，能独立则不化
    let hasMainDmRoot = false;
    for (const branch of [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch]) {
      if (STEM_ELEMENTS[BRANCH_HIDDEN[branch][0]] === dmElement) {
        hasMainDmRoot = true;
        break;
      }
    }
    const hasCompanionStem = [pillars.year.stem, pillars.month.stem, pillars.hour.stem].some(s => STEM_ELEMENTS[s] === dmElement);

    if (!hasMainDmRoot && !hasCompanionStem) {
      // 无强力破化（克星极低），且仅凭某五行分数高不得触发（化神本身必须有分数）
      const destroyingTrans = getDestroyingElement(transformElement);
      if (rawElementScores[destroyingTrans] < 10 && rawElementScores[transformElement] >= 20) {
        return {
          isSpecial: true,
          patternName: `化气格（化${transformElement}）`,
          strengthScore,
          dmStrength: '中和', // 化气不论本身旺衰
          favorableElements: [transformElement, getGeneratingElement(transformElement)],
          unfavorableElements: [getDestroyingElement(transformElement), getDestroyedElement(transformElement)],
          details: `日主与邻干合化${transformElement}，月令得气且无克破，化气格成。`
        };
      }
    }
  }

  // ==== 2. 尝试判定从格 (从弱) ====
  let maxEl = '';
  let maxScore = -1;
  for (const [el, score] of Object.entries(elementScores)) {
    if (el !== dmElement && el !== motherElement && score > maxScore) {
      maxScore = score;
      maxEl = el;
    }
  }

  if (dmElement === '木' && pillars.month.branch === '丑') console.log('DEBUG U008:', rawElementScores, elementScores, maxScore, maxEl);
  if (maxScore >= 40) {
    const cat = getTenGodCategory(dmElement, maxEl);

    // 计算是否有“通根得力比劫”
    let biJieRoots = 0;
    for (const branch of [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch]) {
      if ((frameType === 'hui' || frameType === 'he') && frameComponents.includes(branch) && frameElement !== dmElement) continue;
      
      let hasBiJieRootHere = BRANCH_HIDDEN[branch].some(s => STEM_ELEMENTS[s] === dmElement);
      if (cat === '食伤' && ['辰', '戌', '丑', '未'].includes(branch)) {
        // 从儿格：墓库中只有本气算作比劫根
        hasBiJieRootHere = STEM_ELEMENTS[BRANCH_HIDDEN[branch][0]] === dmElement;
      }
      if (hasBiJieRootHere) biJieRoots++;
    }
    
    let daySitsOnRoot = false;
    if (!((frameType === 'hui' || frameType === 'he') && frameComponents.includes(pillars.day.branch) && frameElement !== dmElement)) {
      daySitsOnRoot = BRANCH_HIDDEN[pillars.day.branch].some(s => STEM_ELEMENTS[s] === dmElement);
      if (cat === '食伤' && ['辰', '戌', '丑', '未'].includes(pillars.day.branch)) {
        daySitsOnRoot = STEM_ELEMENTS[BRANCH_HIDDEN[pillars.day.branch][0]] === dmElement;
      }
    }
    
    const hasStrongBiJie = biJieRoots >= 2 || daySitsOnRoot || (biJieRoots >= 1 && elementScores[dmElement] >= 10);
    
    // 重新判定是否真的有根
    let hasRoot = false;
    for (const branch of [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch]) {
      if ((frameType === 'hui' || frameType === 'he') && frameComponents.includes(branch) && frameElement !== dmElement) {
        continue; // 合局拔根：如果地支参与了三合/三会且未合化为日主五行，则不作为根
      }
      if (BRANCH_HIDDEN[branch].some(s => STEM_ELEMENTS[s] === dmElement)) {
        hasRoot = true;
        break;
      }
    }

    // 计算是否有印星生扶
    let motherHasRoot = false;
    for (const branch of [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch]) {
      if ((frameType === 'hui' || frameType === 'he') && frameComponents.includes(branch) && frameElement !== motherElement) {
        continue;
      }
      if (BRANCH_HIDDEN[branch].some(s => STEM_ELEMENTS[s] === motherElement)) {
        motherHasRoot = true;
        break;
      }
    }
    // 无根的天干浮印不计入。但只要地支有根（哪怕是中余气且天干不透），也算作有根气生扶
    const hasMotherSupport = motherHasRoot;

    if (cat === '食伤') {
      // 从儿格成立条件：食伤当令成势(maxScore>=40) + 印星微弱(得分为0) + 地支比劫根<2 + 官杀极弱
      const officerEl = getDestroyingElement(dmElement);
      if (elementScores[motherElement] < 5 && biJieRoots < 2 && elementScores[officerEl] < 10) {
        return {
          isSpecial: true,
          patternName: '从儿格',
          strengthScore,
          dmStrength: '极弱',
          favorableElements: [maxEl, getGeneratingElement(maxEl)],
          unfavorableElements: [dmElement, motherElement],
          details: `食伤当令成势，局中无印星且无通根得力比劫，从儿格成。`
        };
      }
    } else if (!hasRoot && !hasMotherSupport && !hasStrongBiJie) {
      // 其他从格（从财、从杀、从势）必须满足：无本气根 + 印星极弱 + 无通根得力比劫
      let patternName = '从势格';
      if (cat === '正偏财') patternName = '从财格';
      if (cat === '官杀') patternName = '从杀格';

      return {
        isSpecial: true,
        patternName,
        strengthScore,
        dmStrength: '极弱',
        favorableElements: [maxEl, getGeneratingElement(maxEl)],
        unfavorableElements: [dmElement, motherElement],
        details: `日主无本气根、无印星生扶且无比劫救应，${cat}(${maxEl})偏旺，构成${patternName}。`
      };
    }
  }

  // ==== 3. 尝试判定专旺格 (从强) ====
  // 专旺改结构判定: 某一行成局(三合/三会)或一方独旺(主导五行分数极高,且日主得分 >= 60) + 无有力官杀克破(<5) + 无重财耗泄(<10)
  const powerElement = getDestroyingElement(dmElement);
  const generatedElement = getGeneratedElement(dmElement);
  const wealthElement = getDestroyedElement(dmElement);

  const hasHuiOrHe = frameType === 'hui' || frameType === 'he';
  const isDominant = strengthScore >= 75;

  let isZhuanWang = false;
  if (hasHuiOrHe && (frameElement === dmElement || frameElement === motherElement)) {
    if (elementScores[powerElement] < 5 && elementScores[wealthElement] < 20 && strengthScore > 60) {
      isZhuanWang = true;
    }
  } else if (isDominant) {
    if (elementScores[powerElement] < 5 && elementScores[generatedElement] < 5 && elementScores[wealthElement] < 20) {
      isZhuanWang = true;
    }
  }

  if (isZhuanWang) {
      const specializedNames: Record<string, string> = {
        '木': '曲直格', '火': '炎上格', '土': '稼穑格', '金': '从革格', '水': '润下格'
      };
      return {
        isSpecial: true,
        patternName: specializedNames[dmElement] || '专旺格',
        strengthScore,
        dmStrength: '极强',
        favorableElements: [dmElement, motherElement, getGeneratedElement(dmElement)],
        unfavorableElements: [getDestroyingElement(dmElement), getDestroyedElement(dmElement)],
        details: `日主成局或一方独旺，且无有力克泄，构成专旺格。`
      };
    }


  // ==== 4. 普通格局 (正格) ====
  let dmStrength: PatternResult['dmStrength'] = '中和';
  if (strengthScore >= 65) dmStrength = '极强';
  else if (strengthScore >= 52) dmStrength = '偏强';
  else if (strengthScore >= 48) dmStrength = '中和';
  else if (strengthScore >= 25) dmStrength = '偏弱';
  else dmStrength = '极弱';

  let favorableElements: string[] = [];
  let unfavorableElements: string[] = [];

  if (dmStrength === '极强' || dmStrength === '偏强') {
    // 身强喜 克泄耗
    favorableElements = [getDestroyingElement(dmElement), getGeneratedElement(dmElement), getDestroyedElement(dmElement)];
    unfavorableElements = [dmElement, motherElement];
  } else if (dmStrength === '极弱' || dmStrength === '偏弱') {
    // 身弱喜 生扶
    favorableElements = [dmElement, motherElement];
    unfavorableElements = [getDestroyingElement(dmElement), getGeneratedElement(dmElement), getDestroyedElement(dmElement)];
  } else {
    // 中和，根据四柱缺什么补什么，暂时简略
    favorableElements = [getGeneratedElement(dmElement), getDestroyingElement(dmElement)];
    unfavorableElements = [dmElement, motherElement];
  }

  // ==== 5. 调候 (Climate) 修正 ====
  let climateFavorable: string[] = [];
  const monthB = pillars.month.branch;
  // 冬季生人喜火暖局
  if (['亥', '子', '丑'].includes(monthB)) {
    climateFavorable.push('火');
    // 如果日主是金水，更需要火
    if (['庚', '辛', '壬', '癸'].includes(dm)) climateFavorable.push('木'); // 木生火
  }
  // 夏季生人喜水降温
  if (['巳', '午', '未'].includes(monthB)) {
    climateFavorable.push('水');
    if (['甲', '乙', '丙', '丁'].includes(dm)) climateFavorable.push('金'); // 金生水
  }

  // 如果调候用神不为空，把它放到 favorable 的首位（或者作为独立补充提供给下游）
  // 普通格局下，调候只作为修正，不推翻主用神，因此可以交集，或者直接提供两个字段
  // 我们把它添加到 favorable 里，提高权重
  const combinedFavorable = Array.from(new Set([...favorableElements, ...climateFavorable]));

  return {
    isSpecial: false,
    patternName: '正格（普通扶抑）',
    strengthScore: Math.round(strengthScore * 100) / 100,
    dmStrength,
    favorableElements: combinedFavorable, // 已经融合了调候
    climateFavorable: climateFavorable.length > 0 ? climateFavorable : undefined,
    unfavorableElements,
    details: `日主得分：${Math.round(strengthScore * 100) / 100}，属于${dmStrength}。` + 
             (climateFavorable.length > 0 ? `生于${monthB}月，需调候，喜${climateFavorable.join('、')}。` : '')
  };
}
