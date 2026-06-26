// Deterministic mapping for Lucky Charms based on Favorable Elements (用神)

export interface KaiyunAdvice {
  luckyColors: string[];
  unluckyColors: string[];
  luckyDirections: string[];
  luckyNumbers: string[];
  industries: string[];
}

const ELEMENT_ATTRIBUTES: Record<string, { colors: string[], directions: string[], numbers: string[], industries: string[] }> = {
  '金': {
    colors: ['白色', '银色', '金色'],
    directions: ['西方', '西北方'],
    numbers: ['4', '9'],
    industries: ['金融', '五金', '汽车', '珠宝', '军警', '外科医生', '机械', '鉴定']
  },
  '木': {
    colors: ['绿色', '青色', '翠色'],
    directions: ['东方', '东南方'],
    numbers: ['3', '8'],
    industries: ['教育', '木材', '农业', '出版', '医疗', '设计', '宗教', '文创']
  },
  '水': {
    colors: ['黑色', '蓝色', '灰色'],
    directions: ['北方'],
    numbers: ['1', '6'],
    industries: ['物流', '贸易', '旅游', '水产', '餐饮', '信息网络', '酒水', '交通']
  },
  '火': {
    colors: ['红色', '紫色', '粉色'],
    directions: ['南方'],
    numbers: ['2', '7'],
    industries: ['互联网', '电子', '演艺', '美业', '餐饮', '照明', '能源', '化工']
  },
  '土': {
    colors: ['黄色', '棕色', '咖色', '土色'],
    directions: ['中央', '本地', '西南方', '东北方'],
    numbers: ['0', '5'],
    industries: ['房地产', '建筑', '农业', '矿业', '仓储', '古董', '畜牧', '中介']
  }
};

export function generateKaiyunAdvice(favorableElements: string[], unfavorableElements: string[]): KaiyunAdvice {
  const luckyColors: string[] = [];
  const luckyDirections: string[] = [];
  const luckyNumbers: string[] = [];
  const industries: string[] = [];
  
  const unluckyColors: string[] = [];

  // Aggregate favorable
  for (const el of favorableElements) {
    if (!ELEMENT_ATTRIBUTES[el]) continue;
    luckyColors.push(...ELEMENT_ATTRIBUTES[el].colors);
    luckyDirections.push(...ELEMENT_ATTRIBUTES[el].directions);
    luckyNumbers.push(...ELEMENT_ATTRIBUTES[el].numbers);
    industries.push(...ELEMENT_ATTRIBUTES[el].industries);
  }

  // Aggregate unfavorable
  for (const el of unfavorableElements) {
    if (!ELEMENT_ATTRIBUTES[el]) continue;
    unluckyColors.push(...ELEMENT_ATTRIBUTES[el].colors);
  }

  return {
    luckyColors: Array.from(new Set(luckyColors)),
    unluckyColors: Array.from(new Set(unluckyColors)),
    luckyDirections: Array.from(new Set(luckyDirections)),
    luckyNumbers: Array.from(new Set(luckyNumbers)),
    industries: Array.from(new Set(industries)).slice(0, 10) // Keep top 10 unique
  };
}
