import { EightChar } from 'lunar-javascript';

// 天乙贵人查表 (以年干或日干查地支)
const TIAN_YI: Record<string, string[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
  '辛': ['寅', '午']
};

// 文昌贵人查表 (以年干或日干查地支)
const WEN_CHANG: Record<string, string[]> = {
  '甲': ['巳'], '乙': ['午'], '丙': ['申'], '戊': ['申'],
  '丁': ['酉'], '己': ['酉'], '庚': ['亥'], '辛': ['子'],
  '壬': ['寅'], '癸': ['卯']
};

// 羊刃查表 (以日干查地支)
const YANG_REN: Record<string, string[]> = {
  '甲': ['卯'], '丙': ['午'], '戊': ['午'],
  '庚': ['酉'], '壬': ['子']
};

// 禄神查表 (以日干查地支)
const LU_SHEN: Record<string, string[]> = {
  '甲': ['寅'], '乙': ['卯'], '丙': ['巳'], '丁': ['午'],
  '戊': ['巳'], '己': ['午'], '庚': ['申'], '辛': ['酉'],
  '壬': ['亥'], '癸': ['子']
};

// 桃花/咸池查表 (以年支或日支查地支)
const TAO_HUA: Record<string, string[]> = {
  '申': ['酉'], '子': ['酉'], '辰': ['酉'],
  '寅': ['卯'], '午': ['卯'], '戌': ['卯'],
  '亥': ['子'], '卯': ['子'], '未': ['子'],
  '巳': ['午'], '酉': ['午'], '丑': ['午']
};

// 驿马查表 (以年支或日支查地支)
const YI_MA: Record<string, string[]> = {
  '申': ['寅'], '子': ['寅'], '辰': ['寅'],
  '寅': ['申'], '午': ['申'], '戌': ['申'],
  '亥': ['巳'], '卯': ['巳'], '未': ['巳'],
  '巳': ['亥'], '酉': ['亥'], '丑': ['亥']
};

// 华盖查表 (以年支或日支查地支)
const HUA_GAI: Record<string, string[]> = {
  '申': ['辰'], '子': ['辰'], '辰': ['辰'],
  '寅': ['戌'], '午': ['戌'], '戌': ['戌'],
  '亥': ['未'], '卯': ['未'], '未': ['未'],
  '巳': ['丑'], '酉': ['丑'], '丑': ['丑']
};

// 天德贵人查表 (以月支查天干或地支)
const TIAN_DE: Record<string, string[]> = {
  '子': ['巳'], '丑': ['庚'], '寅': ['丁'], '卯': ['申'],
  '辰': ['壬'], '巳': ['辛'], '午': ['亥'], '未': ['甲'],
  '申': ['癸'], '酉': ['寅'], '戌': ['丙'], '亥': ['乙']
};

// 月德贵人查表 (以月支查天干)
const YUE_DE: Record<string, string[]> = {
  '寅': ['丙'], '午': ['丙'], '戌': ['丙'],
  '申': ['壬'], '子': ['壬'], '辰': ['壬'],
  '亥': ['甲'], '卯': ['甲'], '未': ['甲'],
  '巳': ['庚'], '酉': ['庚'], '丑': ['庚']
};

// 【新增】太极贵人 (以年干或日干查地支)
const TAI_JI: Record<string, string[]> = {
  '甲': ['子', '午'], '乙': ['子', '午'],
  '丙': ['卯', '酉'], '丁': ['卯', '酉'],
  '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
  '庚': ['寅', '亥'], '辛': ['寅', '亥'],
  '壬': ['巳', '申'], '癸': ['巳', '申']
};

// 【新增】德秀贵人 (以月支查天干)
const DE_XIU: Record<string, string[]> = {
  '寅': ['丙', '丁', '戊', '癸'], '午': ['丙', '丁', '戊', '癸'], '戌': ['丙', '丁', '戊', '癸'],
  '申': ['壬', '癸', '戊', '己', '丙', '辛'], '子': ['壬', '癸', '戊', '己', '丙', '辛'], '辰': ['壬', '癸', '戊', '己', '丙', '辛'],
  '巳': ['庚', '辛', '乙'], '酉': ['庚', '辛', '乙'], '丑': ['庚', '辛', '乙'],
  '亥': ['甲', '乙', '丁', '壬'], '卯': ['甲', '乙', '丁', '壬'], '未': ['甲', '乙', '丁', '壬']
};

// 【新增】金舆 (以日干或年干查地支)
const JIN_YU: Record<string, string[]> = {
  '甲': ['辰'], '乙': ['巳'], '丙': ['未'], '戊': ['未'],
  '丁': ['申'], '己': ['申'], '庚': ['戌'], '辛': ['亥'],
  '壬': ['丑'], '癸': ['寅']
};

// 【新增】红艳煞 (以日干查地支)
const HONG_YAN: Record<string, string[]> = {
  '甲': ['午'], '乙': ['申'], '丙': ['寅'], '丁': ['未'],
  '戊': ['辰'], '己': ['辰'], '庚': ['戌'], '辛': ['酉'],
  '壬': ['子'], '癸': ['申']
};

// 【新增】孤辰 (以年支查地支)
const GU_CHEN: Record<string, string[]> = {
  '亥': ['寅'], '子': ['寅'], '丑': ['寅'],
  '寅': ['巳'], '卯': ['巳'], '辰': ['巳'],
  '巳': ['申'], '午': ['申'], '未': ['申'],
  '申': ['亥'], '酉': ['亥'], '戌': ['亥']
};

// 【新增】寡宿 (以年支查地支)
const GUA_SU: Record<string, string[]> = {
  '亥': ['戌'], '子': ['戌'], '丑': ['戌'],
  '寅': ['丑'], '卯': ['丑'], '辰': ['丑'],
  '巳': ['辰'], '午': ['辰'], '未': ['辰'],
  '申': ['未'], '酉': ['未'], '戌': ['未']
};

// 【新增】披麻 (以年支查地支)
const PI_MA: Record<string, string[]> = {
  '子': ['酉'], '丑': ['戌'], '寅': ['亥'], '卯': ['子'],
  '辰': ['丑'], '巳': ['寅'], '午': ['卯'], '未': ['辰'],
  '申': ['巳'], '酉': ['午'], '戌': ['未'], '亥': ['申']
};

// 【新增】日柱专属神煞 (直接匹配干支组合)
const SHI_LING = ['甲辰', '乙亥', '丙辰', '丁酉', '戊午', '庚戌', '庚寅', '辛亥', '壬寅', '癸未'];
const JIU_CHOU = ['丁酉', '戊子', '戊午', '己卯', '己酉', '辛卯', '辛酉', '壬子', '壬午'];
const LIU_XIU = ['丙午', '丁未', '戊子', '戊午', '己丑', '己未'];
const GU_LUAN = ['乙巳', '丁巳', '辛亥', '戊申', '壬寅', '戊午', '壬子', '丙午'];

export function getShenShaForPillars(baZi: typeof EightChar.prototype) {
  const yearStem = baZi.getYearGan();
  const yearBranch = baZi.getYearZhi();
  const monthBranch = baZi.getMonthZhi();
  const dayStem = baZi.getDayGan();
  const dayBranch = baZi.getDayZhi();
  const yearNaYin = baZi.getYearNaYin();

  const stems = [baZi.getYearGan(), baZi.getMonthGan(), baZi.getDayGan(), baZi.getTimeGan()];
  const branches = [baZi.getYearZhi(), baZi.getMonthZhi(), baZi.getDayZhi(), baZi.getTimeZhi()];

  const getShenSha = (branch: string, stem: string, index: number) => {
    const shensha: string[] = [];

    // 天乙贵人
    if (TIAN_YI[yearStem]?.includes(branch) || TIAN_YI[dayStem]?.includes(branch)) shensha.push('天乙贵人');
    
    // 文昌贵人
    if (WEN_CHANG[yearStem]?.includes(branch) || WEN_CHANG[dayStem]?.includes(branch)) shensha.push('文昌贵人');
    
    // 羊刃
    if (YANG_REN[dayStem]?.includes(branch)) shensha.push('羊刃');
    
    // 禄神
    if (LU_SHEN[dayStem]?.includes(branch)) shensha.push('禄神');

    // 桃花
    if ((index !== 0 && TAO_HUA[yearBranch]?.includes(branch)) || (index !== 2 && TAO_HUA[dayBranch]?.includes(branch))) shensha.push('桃花');

    // 驿马
    if ((index !== 0 && YI_MA[yearBranch]?.includes(branch)) || (index !== 2 && YI_MA[dayBranch]?.includes(branch))) shensha.push('驿马');

    // 华盖
    if ((index !== 0 && HUA_GAI[yearBranch]?.includes(branch)) || (index !== 2 && HUA_GAI[dayBranch]?.includes(branch))) shensha.push('华盖');

    // 天德、月德
    if (TIAN_DE[monthBranch]?.includes(stem) || TIAN_DE[monthBranch]?.includes(branch)) shensha.push('天德贵人');
    if (YUE_DE[monthBranch]?.includes(stem) || YUE_DE[monthBranch]?.includes(branch)) shensha.push('月德贵人');

    // 【新增】太极贵人
    if (TAI_JI[yearStem]?.includes(branch) || TAI_JI[dayStem]?.includes(branch)) shensha.push('太极贵人');

    // 【新增】德秀贵人
    if (DE_XIU[monthBranch]?.includes(stem)) shensha.push('德秀贵人');

    // 【新增】金舆
    if (JIN_YU[yearStem]?.includes(branch) || JIN_YU[dayStem]?.includes(branch)) shensha.push('金舆');

    // 【新增】红艳煞
    if (HONG_YAN[dayStem]?.includes(branch)) shensha.push('红艳煞');

    // 【新增】将星 (以年支或日支查地支)
    const JIANG_XING: Record<string, string> = {
      '寅': '午', '午': '午', '戌': '午',
      '申': '子', '子': '子', '辰': '子',
      '巳': '酉', '酉': '酉', '丑': '酉',
      '亥': '卯', '卯': '卯', '未': '卯'
    };
    if (JIANG_XING[yearBranch] === branch || JIANG_XING[dayBranch] === branch) {
      shensha.push('将星');
    }

    // 孤辰、寡宿
    if (index !== 0 && GU_CHEN[yearBranch]?.includes(branch)) shensha.push('孤辰');
    if (index !== 0 && GUA_SU[yearBranch]?.includes(branch)) shensha.push('寡宿');

    // 披麻
    if (index !== 0 && PI_MA[yearBranch]?.includes(branch)) shensha.push('披麻');

    // 【新增】童子煞
    const isSpring = ['寅', '卯', '辰'].includes(monthBranch);
    const isSummer = ['巳', '午', '未'].includes(monthBranch);
    const isAutumn = ['申', '酉', '戌'].includes(monthBranch);
    const isWinter = ['亥', '子', '丑'].includes(monthBranch);
    
    let isTongZi = false;
    if ((isSpring || isAutumn) && ['寅', '子'].includes(branch)) isTongZi = true;
    if ((isSummer || isWinter) && ['卯', '未', '辰'].includes(branch)) isTongZi = true;
    
    if (!isTongZi) {
      if ((yearNaYin.includes('金') || yearNaYin.includes('木')) && ['午', '卯'].includes(branch)) isTongZi = true;
      if ((yearNaYin.includes('水') || yearNaYin.includes('火')) && ['酉', '戌'].includes(branch)) isTongZi = true;
      if (yearNaYin.includes('土') && ['辰', '巳'].includes(branch)) isTongZi = true;
    }
    
    if (isTongZi) shensha.push('童子煞');

    // 日柱专属神煞
    if (index === 2) {
      const pillar = stem + branch;
      if (['庚辰', '壬辰', '戊戌', '庚戌'].includes(pillar)) shensha.push('魁罡');
      if (SHI_LING.includes(pillar)) shensha.push('十灵日');
      if (JIU_CHOU.includes(pillar)) shensha.push('九丑日');
      if (LIU_XIU.includes(pillar)) shensha.push('六秀日');
      if (GU_LUAN.includes(pillar)) shensha.push('孤鸾煞');
    }

    // 按照指定顺序输出，或者只返回去重后的结果
    return Array.from(new Set(shensha));
  };

  return {
    year: getShenSha(branches[0], stems[0], 0),
    month: getShenSha(branches[1], stems[1], 1),
    day: getShenSha(branches[2], stems[2], 2),
    hour: getShenSha(branches[3], stems[3], 3)
  };
}
