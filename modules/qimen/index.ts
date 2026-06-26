import { DivinationModule, DivinationModuleMetadata, ChartJSON, Hook, PromptTemplate, SessionState } from '@/types/module';
import { buildQimenChart, toInterpretationPayload, selectYongShen, YONGSHEN_PRESETS, QimenChart } from './engine';
import { getTrueSolarTime } from '@/modules/bazi/trueSolarTime';

export const qimenMetadata: DivinationModuleMetadata = {
  id: 'qimen',
  name: '奇门遁甲',
  description: '时空博弈，掌握最佳决策',
  enabled: true,
  order: 3,
  inputSchema: [
    {
      id: 'datetime',
      label: '公历日期',
      type: 'date-select',
      // Bazi uses birthDate (date-select) and birthTime (time-select-24h). We will do the same.
      required: true,
    },
    {
      id: 'time',
      label: '起局时间',
      type: 'time-select-24h',
      required: true,
      unknownTimeLabel: '即时起局'
    },
    {
      id: 'location',
      label: '你现在所在地',
      type: 'location-cascade',
      required: true,
    },
    {
      id: 'category',
      label: '占测类别',
      type: 'select',
      required: true,
      options: [
        ...Object.keys(YONGSHEN_PRESETS).map(k => ({ label: k, value: k })),
        { label: '其他', value: '其他' }
      ],
      placeholder: '请选择占测类别'
    },
    {
      id: 'question',
      label: '所问之事',
      type: 'text',
      required: true,
      placeholder: '请输入您要问的具体事情'
    },
    {
      id: 'isProxy',
      label: '是否替他人测',
      type: 'select', 
      required: true,
      options: [
        { label: '否（自占）', value: '否' },
        { label: '是（代占）', value: '是' }
      ],
      defaultValue: '否'
    }
  ]
};

const QIMEN_SYSTEM_PROMPT = `【你是谁】
你是一位浸淫奇门遁甲数十年的实战派明师，断事以准、狠、稳见长，通《烟波钓叟歌》
《奇门遁甲统宗》等古义，更能把天机说成人话。你不是念说明书的程序，而是一位见过
世面的长者，正当面为眼前这位问事人指点迷津——有底气、有判断、有温度。

【你拿到什么（系统注入，唯一真相源）】
- 盘面事实：确定性引擎排定的整盘结构化数据（四柱、局、值符值使、九宫各宫的
  八神/九星/八门/天地盘干/旺相/空亡/驿马等标记）。
- 所问之事：问事人的原话。
- 占测类别 + 用神取象：已由系统据所问指定。
- 是否代占：代占时用神归于所占对象，而非问事人自身。

【铁律（不可逾越）】
1. 只能依据「盘面事实」解读。盘中没有的星、门、神、干、宫、旺衰、空亡、马星，
   一律不得新增、推断或编造。
2. 不得自行起局或改动任何盘面符号。
3. 用神以系统给定取象为准；代占则归于所占对象。
4. 任何「格局/旺衰/生克」断语，都必须在给定盘面里找得到依据；找不到，宁可不提。

【怎么断（这决定你像不像高手，按心法推演，绝非逐符查字典）】
1. 立用神：先盯用神——落何宫、旺相休囚、临何门何神何星、所携天地盘干、是否
   空亡/入墓/逢冲。用神的强弱与处境，是这一卦的命门。
2. 看生克：再看用神与关键之象（所占之事的宫、财/官/印之象、对方之宫、年命落宫
   若有）之间的生克制化。吉凶之根在关系，不在孤立单符；务必读出彼此的呼应与冲突。
3. 辨格局：盘面的格局、旺衰、生克、用神定位已由确定性代码算定并随盘给出，你必须直接采信，不得推翻、不得新增盘上没有的格局/星/门/神/旺衰；你的职责是用大师之语把这些已验证的结论织成象、断吉凶、推应期、出对策。
4. 定吉凶：综合给出明确倾向（吉 / 凶 / 吉中藏凶 / 先难后易 / 成中有变…），
   不许骑墙和稀泥。
5. 推应期：以驿马、值符值使、旬空填实、月令旺衰、宫位所对地支等综合估时，给
   区间或条件（如「应在某月」「遇某支之日」），不要假装精确到某一天。
6. 出对策：给具体、可落地的趋吉避凶——有利的方位/时机、可调候的五行（颜色、
   物象等）、该规避的人或事。绝不要「谨慎为上、观望为主」这类正确的废话。

【怎么说（语气与文风）】
- 直接落断：第一句就给核心判断。严禁「好的，我将依据您提供的数据为您解读」这类开场。
- 古今交融：可用术语与古意，但每个术语顺势用白话点透，普通人一看就懂。
- 自信而有分寸：有判断、有人情味；像面对面说话，可适度称「你」。
- 把盘织成象：将各符号编织成连贯的画面与故事，读出彼此生克呼应；严禁清单式
  罗列每个符号的字典义（如「惊门主口舌、玄武主暗昧、白虎主竞争…」逐条堆砌，是大忌）。
- 克制有力：不堆砌套话、不故弄玄虚、不滥用神秘辞藻。
- 篇幅适度：结构清晰但不僵硬，不冗长。

【重大事项的分寸（财/投资、健康、官非、婚姻等）】
以命理之象论趋势吉凶，可给方向与趋避，但须点到「天机示象、成事在人」——不承诺
必然结果，不代替现实中的专业判断。收尾处一句得体、合乎语气的轻提醒即可，切忌
长篇免责而跳戏。

【输出结构（顺势而为，不要机械套标题）】
- 开篇定调：一两句直给本事核心判断。
- 详断：用神之态 → 关键生克 → 成立之格局 → 吉凶推演，连贯成文。
- 应期。
- 趋吉避凶：三两条具体可行。
- 收束：一句有温度的话 + 轻提醒。

【风格对照（学其神，勿照抄其文）】
✗ 「好的，我将严格依据您提供的盘面数据为您进行解读。」
✓ 开篇直断：「这桩事，盘上给的是个『心热手空』的局——动念极强，却难落到实处，
   得先把这层看破。」
✗ 「八门为惊门，主惊恐、是非、口舌。」（孤立罗列）
✓ 生克成文：「用神落宫本是得地，偏遇上方来生而临惊门——有人替你壮胆，壮胆的话
   里却掺着虚音；这便是消息撩人、内里掺水之象。」
✗ 「建议以观望为主，不宜轻举妄动。」（正确的废话）
✓ 具体对策：「若非动不可，宜往东南、择木旺之时而行，避开属你所克之人来劝；
   色尚青绿以扶用神。」`;

export const qimenModule: DivinationModule = {
  ...qimenMetadata,
  computeChart(input: any): ChartJSON {
    // 1. Parse Datetime
    const dateStr = input.datetime || input.birthDate; // fallback depending on form keys
    let timeStr = '12:00';
    if (typeof input.time === 'string') {
      timeStr = input.time;
    } else if (input.time && typeof input.time === 'object' && input.time.solarTime) {
      timeStr = input.time.solarTime;
    } else if (typeof input.birthTime === 'string') {
      timeStr = input.birthTime;
    } else if (input.birthTime && typeof input.birthTime === 'object' && input.birthTime.solarTime) {
      timeStr = input.birthTime.solarTime;
    }
    let baseDate = new Date();
    
    // Check if it's "instant divination" (timeKnown === false)
    const isInstant = (input.time && typeof input.time === 'object' && input.time.timeKnown === false) || 
                      (input.birthTime && typeof input.birthTime === 'object' && input.birthTime.timeKnown === false);
    
    if (!isInstant && dateStr) {
      baseDate = new Date(`${dateStr}T${timeStr}:00+08:00`);
    }

    let originalTimeStr = baseDate.toISOString();
    
    // 2. True Solar Time Correction
    let timeRule = "真太阳时未校正（输入即所用）";
    const longitude = input.location?.longitude ? Number(input.location.longitude) : undefined;
    if (longitude !== undefined && !isNaN(longitude)) {
      baseDate = getTrueSolarTime(baseDate, longitude);
      timeRule = "已按经度校正真太阳时";
    }

    // 3. Build Chart
    const qimenChart = buildQimenChart(baseDate);
    if (timeRule !== "真太阳时未校正（输入即所用）") {
      qimenChart.rules.timeRule = timeRule as any;
    }

    return {
      _qimenChart: qimenChart,
      _originalTimeStr: originalTimeStr,
      input
    };
  },
  hookProfile(_chart: ChartJSON): Hook[] {
    return []; // 奇门暂不需要反推时辰的 hook
  },
  buildReadingPrompt(chart: ChartJSON, _session: SessionState): PromptTemplate {
    const qimenChart = chart._qimenChart as QimenChart;
    const isProxy = chart.input.isProxy === '是';
    const category = chart.input.category || '其他';
    const question = chart.input.question || '未提供具体问题';
    
    const payload = toInterpretationPayload(qimenChart, { category, isProxy });

    const userPrompt = `
- 盘面事实：${JSON.stringify(payload)}
- 所问之事：${question}
- 是否代占：${isProxy ? '是' : '否'}
`;

    return {
      system: QIMEN_SYSTEM_PROMPT,
      user: userPrompt
    };
  }
};
