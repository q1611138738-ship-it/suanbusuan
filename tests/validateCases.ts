import * as xlsx from 'xlsx';
import * as fs from 'fs';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const ELEMENTS = '金木水火土';

interface TestCase {
  id: string;
  source: string;
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  pattern: string;
  isSpecial: string;
  favorable: string;
  unfavorable: string;
  acceptance: string;
  evidence: string;
  subject: string;
  confidence: string;
  status: string;
  issue?: string;
  rawPillars: string;
}

function isValidGanzhi(str: string) {
  if (!str || str.length !== 2) return false;
  return STEMS.includes(str[0]) && BRANCHES.includes(str[1]);
}

function validateData() {
  const workbook = xlsx.readFile('tests/判定层对照集_合并清洗_v2.xlsx');
  const sheetName = '对照集_可用';
  const worksheet = workbook.Sheets[sheetName];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  
  const results: TestCase[] = [];
  const validCases: TestCase[] = [];
  const invalidCases: TestCase[] = [];
  const suspectCases: TestCase[] = [];
  const incompleteCases: TestCase[] = [];
  
  const pillarSet = new Set<string>();

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    
    // Map columns (handling variations)
    const getVal = (keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== '') return String(row[k]).trim();
      }
      return '';
    };

    const id = getVal(['编号', 'id', '序号', 'ID']) || String(i + 1);
    const source = getVal(['出处', '书名', '来源']);
    const yearPillar = getVal(['年柱', '年']);
    const monthPillar = getVal(['月柱', '月']);
    const dayPillar = getVal(['日柱', '日']);
    const hourPillar = getVal(['时柱', '时']);
    const dayMaster = getVal(['日主', '天干', '日元']);
    const pattern = getVal(['格局', '格局名', '基准·格局']);
    const isSpecialStr = getVal(['是否特殊', '是否特殊格局', '特殊格局', '是否特格']);
    const isSpecial = isSpecialStr === '是' || isSpecialStr === 'true' || isSpecialStr === '1' ? '是' : '否';
    const favorable = getVal(['喜用神', '喜用', '用神', '基准·喜用神']);
    const unfavorable = getVal(['忌神', '忌', '基准·忌神']);
    let acceptance = getVal(['口径', '验收口径', '测试模式']);
    const evidence = getVal(['依据', '原文依据', '原文', '原文依据(任铁樵/徐乐吾)']);
    const subject = getVal(['命主', '名字', '姓名']);
    const confidence = getVal(['置信度']);

    if (!acceptance) {
      acceptance = isSpecial === '是' ? 'strict' : 'range';
    }

    const pillarsStr = `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`;
    
    const tc: TestCase = {
      id, source, yearPillar, monthPillar, dayPillar, hourPillar,
      dayMaster, pattern, isSpecial, favorable, unfavorable,
      acceptance, evidence, subject, confidence, status: 'VALID', rawPillars: pillarsStr
    };

    // 1. INVALID checks
    if (!isValidGanzhi(yearPillar) || !isValidGanzhi(monthPillar) || !isValidGanzhi(dayPillar) || !isValidGanzhi(hourPillar)) {
      tc.status = 'INVALID';
      tc.issue = `四柱格式错误 (${pillarsStr})`;
      invalidCases.push(tc);
      continue;
    }

    // 2. Duplicate checks
    if (pillarSet.has(pillarsStr)) {
      tc.status = 'DUPLICATE';
      tc.issue = `重复的八字 (${pillarsStr})`;
      // We skip duplicate
      continue;
    }
    pillarSet.add(pillarsStr);

    // 3. SUSPECT checks
    let isSuspect = false;
    let suspectReason = '';
    
    if (dayMaster && !dayMaster.startsWith(dayPillar[0])) {
      isSuspect = true;
      suspectReason = `日主(${dayMaster})与日柱天干(${dayPillar[0]})不符`;
    }
    
    if (isSuspect) {
      tc.status = 'SUSPECT';
      tc.issue = suspectReason;
      suspectCases.push(tc);
      continue;
    }

    // 4. INCOMPLETE checks
    if (!pattern || (!favorable && !unfavorable)) {
      tc.status = 'INCOMPLETE';
      tc.issue = '格局或喜忌全空';
      incompleteCases.push(tc);
      continue;
    }

    // Valid
    validCases.push(tc);
  }

  // Create report
  let report = `# 数据集校验报告\n\n`;
  report += `- **总解析条数**: ${rawData.length}\n`;
  report += `- **有效可用条数**: ${validCases.length}\n`;
  report += `- **排重/忽略条数**: ${rawData.length - validCases.length - invalidCases.length - suspectCases.length - incompleteCases.length}\n`;
  report += `- **格式错误 (INVALID)**: ${invalidCases.length}\n`;
  report += `- **内部矛盾 (SUSPECT)**: ${suspectCases.length}\n`;
  report += `- **信息缺失 (INCOMPLETE)**: ${incompleteCases.length}\n\n`;

  if (invalidCases.length > 0) {
    report += `## 格式错误 (INVALID)\n`;
    invalidCases.forEach(c => report += `- 行 ${c.id}: ${c.issue}\n`);
    report += `\n`;
  }

  if (suspectCases.length > 0) {
    report += `## 内部矛盾 (SUSPECT)\n`;
    suspectCases.forEach(c => report += `- 行 ${c.id} [${c.rawPillars}]: ${c.issue}\n`);
    report += `\n`;
  }

  if (incompleteCases.length > 0) {
    report += `## 信息缺失 (INCOMPLETE)\n`;
    incompleteCases.forEach(c => report += `- 行 ${c.id} [${c.rawPillars}]: ${c.issue}\n`);
    report += `\n`;
  }

  fs.writeFileSync('tests/validation_report.md', report);
  fs.writeFileSync('tests/valid_cases.json', JSON.stringify(validCases, null, 2));
  
  console.log(`Validation complete. Found ${validCases.length} valid cases. Report saved.`);
}

validateData();
