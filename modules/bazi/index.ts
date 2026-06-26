import { DivinationModule, DivinationModuleMetadata, ChartJSON, Hook, PromptTemplate, SessionState } from '@/types/module';
import { computeChart } from './computeChart';

export const baziMetadata: DivinationModuleMetadata = {
  id: 'bazi',
  name: '八字',
  description: '生辰八字，探索人生轨迹',
  enabled: true,
  order: 1,
  inputSchema: [
    {
      id: 'name',
      label: '姓名',
      type: 'text',
      required: false,
    },
    {
      id: 'birthDate',
      label: '出生日期',
      type: 'date-select',
      required: true,
    },
    {
      id: 'birthTime',
      label: '出生时间',
      type: 'time-select-24h',
      required: true,
    },
    {
      id: 'gender',
      label: '性别',
      type: 'select',
      required: true,
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
      placeholder: '请选择性别',
    },
    {
      id: 'birthPlace',
      label: '出生地（用于真太阳时校准）',
      type: 'location-cascade',
      required: true,
    }
  ]
};

import { BAZI_SYSTEM_PROMPT, BAZI_VERIFY_SYSTEM_PROMPT } from './prompt';

export const baziModule: DivinationModule = {
  ...baziMetadata,
  computeChart,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hookProfile(_chart: ChartJSON): Hook[] {
    return [
      {
        id: 'hook1',
        domain: '性格特质',
        confidence: 0.9,
        content: '你性子偏急、嘴上不饶人，对吗？'
      },
      {
        id: 'hook2',
        domain: '过去大事件应期',
        confidence: 0.8,
        content: '在过去的某一年你曾经历过较大的工作或生活变动，是这样吗？'
      }
    ];
  },
  buildReadingPrompt(chart: ChartJSON, session: SessionState): PromptTemplate {
    // 组装结构化盘面
    const chartContext = `
【排盘基础信息】
性别：${chart.input?.gender === 'male' ? '乾造（男）' : '坤造（女）'}
公历出生：${chart.input?.solarDatetime}
${chart.input?.timeKnown ? '' : '（注：出生时辰未知）'}

【四柱数据】
年柱：${chart.pillars?.year?.gan}${chart.pillars?.year?.zhi}（十神：${chart.tenGods?.year}，藏干：${chart.hiddenStems?.year?.join('/')}，空亡：${chart.xunKong?.year}，纳音：${chart.naYin?.year}，神煞：${chart.shenSha?.year?.join('/') || '无'}）
月柱：${chart.pillars?.month?.gan}${chart.pillars?.month?.zhi}（十神：${chart.tenGods?.month}，藏干：${chart.hiddenStems?.month?.join('/')}，空亡：${chart.xunKong?.month}，纳音：${chart.naYin?.month}，神煞：${chart.shenSha?.month?.join('/') || '无'}）
日柱：${chart.pillars?.day?.gan}${chart.pillars?.day?.zhi}（十神：日主，藏干：${chart.hiddenStems?.day?.join('/')}，空亡：${chart.xunKong?.day}，纳音：${chart.naYin?.day}，神煞：${chart.shenSha?.day?.join('/') || '无'}）
时柱：${chart.pillars?.hour?.gan}${chart.pillars?.hour?.zhi}（十神：${chart.tenGods?.hour}，藏干：${chart.hiddenStems?.hour?.join('/')}，空亡：${chart.xunKong?.hour}，纳音：${chart.naYin?.hour}，神煞：${chart.shenSha?.hour?.join('/') || '无'}）

【五行分布（原局）】
${JSON.stringify(chart.fiveElements)}

【大运与流年】
起运：${chart.luck?.startDesc || '未知'}
交运：${chart.luck?.startDate || '未知'}
大运步数（起始岁数及干支）：${chart.luck?.steps?.map((s: any) => s.age + '岁(' + s.year + '年)起' + s.gan + s.zhi + '运').join(' -> ')}
当下年份：${chart.currentYear}

（注：神煞为传统神煞表硬性对应，仅供参考，请结合命局整体做主要判断。）
`;

    let userPrompt = `这是经过确定性程序算出的结构化排盘数据，请绝对以此为准进行分析，不得自行篡改：\n${chartContext}`;
    
    if (session.confirmed.length > 0) {
      userPrompt += `\n用户之前已确认的信息：${session.confirmed.join(', ')}。`;
    }

    return {
      system: BAZI_SYSTEM_PROMPT,
      user: userPrompt
    };
  },
  // @ts-ignore
  buildVerificationPrompt(chart: ChartJSON, technique: string): PromptTemplate {
    const birthYear = chart.input?.solarYear || new Date(chart.input?.solarDate || chart.input?.solarDatetime || Date.now()).getFullYear();
    const currentAge = chart.currentYear - birthYear;
    
    // Filter out future breakpoints
    const pastBreakpoints = chart.breakpoints?.filter(bp => {
      if (!bp.timeRange?.ageRange) return true;
      if (bp.timeRange.ageRange[1] <= currentAge) return true;
      if (bp.timeRange.isLifelong && !bp.timeRange.periodType) return true; // Pure lifelong traits pass
      return false;
    }) || [];

    const breakpointsJson = pastBreakpoints.length > 0 ? JSON.stringify(pastBreakpoints, null, 2) : '[]';

    const chartContext = `
性别：${chart.input?.gender === 'male' ? '男' : '女'}
四柱：
年柱：${chart.pillars?.year?.gan}${chart.pillars?.year?.zhi}
月柱：${chart.pillars?.month?.gan}${chart.pillars?.month?.zhi}
日柱：${chart.pillars?.day?.gan}${chart.pillars?.day?.zhi}
时柱：${chart.pillars?.hour?.gan}${chart.pillars?.hour?.zhi}
十神：年(${chart.tenGods?.year}) 月(${chart.tenGods?.month}) 时(${chart.tenGods?.hour})
五行：${JSON.stringify(chart.fiveElements)}
神煞：${JSON.stringify(chart.shenSha)}
大运：${chart.luck?.steps?.map((s: any) => s.age + '岁:' + s.gan + s.zhi).join(', ')}
`;

    return {
      system: BAZI_VERIFY_SYSTEM_PROMPT
        .replace(/\{技法\}/g, technique)
        .replace(/\{breakpoints\}/g, breakpointsJson)
        .replace(/\{chartData\}/g, chartContext)
        .replace(/\{当前年龄\}/g, currentAge.toString()),
      user: `请开始生成 3~5 条大白话断语用于验证。注意只输出合法的 JSON 格式。`
    };
  }
};
