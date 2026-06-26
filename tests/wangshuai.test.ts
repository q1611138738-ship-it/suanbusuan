import { calculateWangShuai } from '../modules/bazi/wangshuai';

interface TestCase {
  id: string;
  desc: string;
  pillars: [string, string, string, string]; // [年, 月, 日, 时]
  expectedPattern: string;
  expectedDmStrength?: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'case_normal_weak',
    desc: '正格 - 身偏弱 (甲木生于申月)',
    pillars: ['甲申', '壬申', '甲戌', '乙亥'],
    expectedPattern: '正格',
    expectedDmStrength: '偏弱'
  },
  {
    id: 'case_zhuanwang_fire',
    desc: '专旺格 - 炎上格 (纯火)',
    pillars: ['丙午', '甲午', '丙午', '甲午'],
    expectedPattern: '炎上格',
    expectedDmStrength: '极强'
  },
  {
    id: 'case_congcai',
    desc: '从财格 (木弱从土) - 无合化',
    pillars: ['丙午', '戊戌', '甲戌', '庚午'], // 月令戌土，满盘火土，无水木，天干无合
    expectedPattern: '从财格',
    expectedDmStrength: '极弱'
  },
  {
    id: 'case_huaqi_earth',
    desc: '化气格 - 甲己化土',
    pillars: ['戊辰', '己未', '甲辰', '戊辰'], // 甲日己月，合化土，生于未月
    expectedPattern: '化气格',
    expectedDmStrength: '中和'
  }
];

function createMockBazi(pillars: [string, string, string, string]): any {
  return {
    getYearGan: () => pillars[0][0],
    getYearZhi: () => pillars[0][1],
    getMonthGan: () => pillars[1][0],
    getMonthZhi: () => pillars[1][1],
    getDayGan: () => pillars[2][0],
    getDayZhi: () => pillars[2][1],
    getTimeGan: () => pillars[3][0],
    getTimeZhi: () => pillars[3][1]
  };
}

async function runTests() {
  console.log(`Starting WangShuai tests... Total cases: ${TEST_CASES.length}`);
  let passed = 0;
  
  for (const tc of TEST_CASES) {
    const bazi = createMockBazi(tc.pillars);
    
    console.log(`\n========================================`);
    console.log(`Testing: [${tc.id}] ${tc.desc}`);
    console.log(`Pillars: ${tc.pillars.join(' ')}`);
    
    const result = calculateWangShuai(bazi);
    
    console.log(`Expected Pattern: ${tc.expectedPattern} | Actual: ${result.patternName}`);
    if (tc.expectedDmStrength) {
      console.log(`Expected Strength: ${tc.expectedDmStrength} | Actual: ${result.dmStrength} (Score: ${result.strengthScore})`);
    } else {
      console.log(`Actual Strength: ${result.dmStrength} (Score: ${result.strengthScore})`);
    }
    console.log(`Actual Favorable: ${result.favorableElements}`);
    if (result.climateFavorable) console.log(`Climate Modifier: ${result.climateFavorable}`);
    console.log(`Unfavorable Elements: ${result.unfavorableElements}`);
    console.log(`Details: ${result.details}`);
    
    let isPass = true;
    if (!result.patternName.includes(tc.expectedPattern)) isPass = false;
    if (tc.expectedDmStrength && result.dmStrength !== tc.expectedDmStrength) isPass = false;
    
    if (isPass) {
      console.log(`✅ PASS`);
      passed++;
    } else {
      console.log(`❌ FAIL`);
    }
  }
  
  console.log(`\n----------------------------------------`);
  console.log(`Results: ${passed} / ${TEST_CASES.length} passed.`);
}

runTests();
