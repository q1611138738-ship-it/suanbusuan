/**
 * 奇门遁甲 · 确定性排盘引擎适配层（算不算 / suanbusuan.com）
 * ---------------------------------------------------------------
 * 设计原则（与产品 verify-first 架构一致）：
 *   1. 排盘 100% 由确定性代码完成（底层用 taobi，节气 VSOP87 精确到分钟）。
 *   2. 本文件不做任何"解读"，只输出结构化事实 + 口径声明，供 LLM 解读层消费。
 *   3. 口径锁死：时家 / 转盘 / 拆补法 / 寄坤二宫（业界最主流组合）。
 *      —— taobi 默认是「均分法」，不显式传 elements:1 会与市面排盘器对不上。
 *
 * 依赖：  npm i taobi
 * 用法：  const chart = buildQimenChart(new Date());
 *        const payload = toInterpretationPayload(chart);  // 喂给 LLM
 *        const summary = toVerifySummary(chart);          // 给用户确认
 */

// taobi 无类型声明，这里给最小 ambient 声明（只声明我们实际调用到的成员）
// @ts-ignore
import taobiPkg from "taobi";
const { TheArtOfBecomingInvisible } = taobiPkg as any;

// ============================ 类型定义 ============================

export type YinYang = "阳遁" | "阴遁";
export type DingJuFa = "拆补法" | "茅山法" | "均分法"; // 定局法
export type Vitality = "旺" | "相" | "休" | "囚" | "死"; // 九星旺相休囚死

export interface Pillar {
  gan: string; // 天干
  zhi: string; // 地支
  ganzhi: string; // 干支
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface Palace {
  gongName: string; // 宫名（坎坤震巽中乾兑艮离）
  gongNumber: number; // 宫数 1-9（洛书）
  divinity: string; // 八神（值符/螣蛇/太阴/六合/白虎/玄武/九地/九天）
  heavenStar: string[]; // 天盘九星（中五寄宫可能含天禽）
  earthStar: string; // 地盘九星（原始固定星）
  door: string; // 八门（中五宫无门 -> ""）
  heavenStems: string[]; // 天盘干
  earthStems: string[]; // 地盘干（三奇六仪）
  branches: string[]; // 本宫所主地支
  starVitality: Vitality | null; // 天盘星旺相休囚死（按月令）
  // —— 解盘标记 ——
  isZhiFuGong: boolean; // 是否值符宫（八神值符所在）
  isZhiShiGong: boolean; // 是否值使宫（值使门所在）
  isKongWang: boolean; // 是否旬空（含空亡地支）
  isYiMa: boolean; // 是否驿马星所在
}

export interface JuInfo {
  yinYang: YinYang;
  ju: number; // 局数 1-9
  label: string; // "阳遁三局"
  dingJuFa: DingJuFa;
}

export interface QimenChart {
  // 口径声明（展示给用户做 verify-first 确认）
  rules: {
    school: "时家奇门";
    plate: "转盘";
    dingJuFa: DingJuFa;
    jiGong: "寄坤二宫";
    timeRule: "真太阳时未校正（输入即所用）"; // 如需真太阳时校正，在入参前处理
  };
  time: string; // ISO 输入时间
  solarTerm: string; // 节气
  fourPillars: FourPillars;
  ju: JuInfo;
  monthCommander: string; // 月令五行（旺相计算基准）
  zhiFu: { star: string; gong: string }; // 值符（星 + 落宫）
  zhiShi: { door: string; gong: string }; // 值使（门 + 落宫）
  kongWang: string[]; // 空亡地支（两个）
  yiMa: string; // 驿马地支
  palaces: Palace[]; // 九宫，按宫数 1..9 排序
}

// ============================ 常量表 ============================

const GONG_ORDER = [
  "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine",
] as const;

// 九星五行（用于旺相休囚死）
const STAR_WUXING: Record<string, string> = {
  天蓬星: "水", 天芮星: "土", 天冲星: "木", 天辅星: "木", 天禽星: "土",
  天心星: "金", 天柱星: "金", 天任星: "土", 天英星: "火",
};

// 地支五行 / 地支 -> 落宫
const ZHI_WUXING: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

// 五行生克：用于旺相休囚死（以月令为令神）
// 同令=旺，令生我=相，生令者=休，克令者=囚，令克我=死
const SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

function vitality(starWuxing: string, commander: string): Vitality {
  if (starWuxing === commander) return "旺";
  if (SHENG[commander] === starWuxing) return "相"; // 令生星
  if (SHENG[starWuxing] === commander) return "休"; // 星生令
  if (KE[starWuxing] === commander) return "囚"; // 星克令
  if (KE[commander] === starWuxing) return "死"; // 令克星
  return "旺";
}

// 月支 -> 月令五行（标准四时令；四季土月按本气取土）
const MONTH_COMMANDER: Record<string, string> = {
  寅: "木", 卯: "木", 巳: "火", 午: "火",
  申: "金", 酉: "金", 亥: "水", 子: "水",
  辰: "土", 戌: "土", 丑: "土", 未: "土",
};

// 驿马：三合局取马星地支
const YIMA: Record<string, string> = {
  申: "寅", 子: "寅", 辰: "寅",
  寅: "申", 午: "申", 戌: "申",
  巳: "亥", 酉: "亥", 丑: "亥",
  亥: "巳", 卯: "巳", 未: "巳",
};

const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

// ============================ 核心排盘 ============================

export interface BuildOptions {
  /** 定局法：默认拆补法（业界通用）。0=均分 1=拆补 2=茅山 —— 这里用语义枚举 */
  dingJuFa?: DingJuFa;
}

const DINGJU_CODE: Record<DingJuFa, number> = { 均分法: 0, 拆补法: 1, 茅山法: 2 };

/**
 * 时区守卫：taobi 依进程本地时区读取时辰/干支与节气，必须运行在 UTC+8。
 * 非 UTC+8 会静默排出错误盘面（对本产品是最严重的错误），故此处主动抛错而非放行。
 * 部署须设 TZ=Asia/Shanghai（或确保宿主机为 UTC+8，如台湾/中国 VPS）。
 */
function assertChinaTimezone(date: Date): void {
  if (date.getTimezoneOffset() !== -480) {
    throw new Error(
      `[qimen] 排盘要求进程时区为 UTC+8（北京/台北时间），当前偏移=${-date.getTimezoneOffset()}分钟。` +
        `请在应用启动前设置 TZ=Asia/Shanghai（或确保宿主机时区为 UTC+8），否则盘面会全错。`
    );
  }
}

export function buildQimenChart(date: Date, opts: BuildOptions = {}): QimenChart {
  assertChinaTimezone(date);
  const dingJuFa = opts.dingJuFa ?? "拆补法";
  // 第4参 0 = 寄坤二宫；第5参 elements 指定定局法
  const t = new TheArtOfBecomingInvisible(date, null, null, 0, {
    elements: DINGJU_CODE[dingJuFa],
  });

  const cal = t.calendar;
  const mkPillar = (sc: any): Pillar => {
    const ganzhi: string = sc.cstb(true);
    return { gan: ganzhi[0], zhi: ganzhi[1], ganzhi };
  };
  const fourPillars: FourPillars = {
    year: mkPillar(cal.year),
    month: mkPillar(cal.month),
    day: mkPillar(cal.date),
    hour: mkPillar(cal.hour),
  };

  const yinYang: YinYang = t.round < 0 ? "阴遁" : "阳遁";
  const ju = Math.abs(t.round);
  const NUM_CN = ["零","一","二","三","四","五","六","七","八","九"];
  const juInfo: JuInfo = {
    yinYang, ju, dingJuFa,
    label: `${yinYang}${NUM_CN[ju]}局`,
  };

  const commander = MONTH_COMMANDER[fourPillars.month.zhi] ?? "土";

  // 空亡（旬空）：由时柱旬首推两位空亡地支
  const hourIndex: number = cal.hour.cstb(); // 0-59
  const xunHeadBranch = (Math.floor(hourIndex / 10) * 10) % 12; // 旬首地支序
  const kongWang = [
    ZHI[(xunHeadBranch - 2 + 12) % 12],
    ZHI[(xunHeadBranch - 1 + 12) % 12],
  ];

  // 驿马：以时支取（时家奇门常用时支起马；可按需改日支）
  const yiMa = YIMA[fourPillars.hour.zhi] ?? "";

  // 遍历九宫
  const rawPalaces = GONG_ORDER.map((k) => (t as any)[k]);
  let zhiFu = { star: t.getSymbol(true), gong: "" };
  let zhiShi = { door: "", gong: "" };

  const palaces: Palace[] = rawPalaces.map((p: any) => {
    const gongName: string = p.getPalace(true);
    const gongNumber: number = p.getPalace() + 1;
    const divinity: string = p.getDivinity(true) || "";
    const heavenStar: string[] = ([] as string[]).concat(p.getStar(true)).filter(Boolean);
    const earthStar: string = p.getOStar ? p.getOStar(true) : "";
    const door: string = p.getDoor(true) || "";
    const heavenStems: string[] = ([] as string[]).concat(p.getHCS(true)).filter(Boolean);
    const earthStems: string[] = ([] as string[]).concat(p.getECS(true)).filter(Boolean);
    const branches: string[] = ([] as string[]).concat(p.getOTB ? p.getOTB(true) : []).filter(Boolean);

    // 天盘主星旺相（取第一颗主星；中五宫无星）
    const mainStar = heavenStar[0];
    const starVitality = mainStar && STAR_WUXING[mainStar]
      ? vitality(STAR_WUXING[mainStar], commander)
      : null;

    const isZhiFuGong = divinity === "值符";
    const isKongWang = branches.some((b) => kongWang.includes(b));
    const isYiMa = !!yiMa && branches.includes(yiMa);

    if (isZhiFuGong) zhiFu.gong = gongName + gongNumber;

    return {
      gongName, gongNumber, divinity, heavenStar, earthStar, door,
      heavenStems, earthStems, branches, starVitality,
      isZhiFuGong, isZhiShiGong: false, isKongWang, isYiMa,
    };
  });

  // 值使 = 旬首遁干所在宫的"原始门"移动后所在宫。
  // 关键：当值符星=天禽（中五宫）时，中宫无门，须借寄宫（坤2）之门。
  // taobi 的 t.mandate 即"已做中五寄坤校正的值使基准宫"index，直接取其原始门最稳。
  const zhiShiDoorName: string = (() => {
    const mp = rawPalaces[(t as any).mandate];
    return mp && mp.getODoor ? mp.getODoor(true) : "";
  })();
  if (zhiShiDoorName) {
    const dg = palaces.find((p) => p.door === zhiShiDoorName);
    if (dg) {
      dg.isZhiShiGong = true;
      zhiShi = { door: zhiShiDoorName, gong: dg.gongName + dg.gongNumber };
    }
  }

  palaces.sort((a, b) => a.gongNumber - b.gongNumber);

  return {
    rules: {
      school: "时家奇门",
      plate: "转盘",
      dingJuFa,
      jiGong: "寄坤二宫",
      timeRule: "真太阳时未校正（输入即所用）",
    },
    time: date.toISOString(),
    solarTerm: t.getSolarTerms(true),
    fourPillars,
    ju: juInfo,
    monthCommander: commander,
    zhiFu,
    zhiShi,
    kongWang,
    yiMa,
    palaces,
  };
}

// ============================ 用神选取（解读层用） ============================
// 用神是"占什么看什么"的入口。排盘层不替解读层下结论，只提供标准锚点 + 可配置映射。
// 通用锚点：日干=求测人本身；时干=所占之事 / 所问对象。
// 当求测人 ≠ 所占对象时（替人测），日干让位给对应人元，用神需重指派。

export interface YongShenMap {
  primary: string; // 主用神说明
  symbols: string[]; // 相关取象（八门/八神/天干）
}

/** 常见占类 -> 用神取象（标准配置，可按门派覆盖） */
export const YONGSHEN_PRESETS: Record<string, YongShenMap> = {
  求财: { primary: "日干为我，生门+生我之干为财", symbols: ["生门", "日干", "财爻天干"] },
  事业: { primary: "日干为我，开门为事业门户", symbols: ["开门", "日干", "值符"] },
  婚恋: { primary: "男看庚为妻、女看乙为夫；六合为媒", symbols: ["六合", "乙", "庚", "天后类神"] },
  出行: { primary: "驿马为动象，开门为通达", symbols: ["驿马", "开门", "日干"] },
  疾病: { primary: "天芮为病星，死门为凶；日干为病人", symbols: ["天芮星", "死门", "日干"] },
  失物寻人: { primary: "日干为求测人，所寻为时干/玄武主盗", symbols: ["时干", "玄武", "驿马"] },
  官司: { primary: "日干为我、时干为对方；白虎/惊门主讼", symbols: ["白虎", "惊门", "日干", "时干"] },
  考试: { primary: "日干为考生，景门主文书、天辅主文", symbols: ["景门", "天辅星", "日干"] },
};

export function selectYongShen(category: string, isProxy = false): YongShenMap & { note: string } {
  const base = YONGSHEN_PRESETS[category] ?? {
    primary: "日干为求测人，时干为所占之事",
    symbols: ["日干", "时干"],
  };
  return {
    ...base,
    note: isProxy
      ? "替人测：日干让位给对应人元，用神按所占对象重新指派"
      : "本人测：日干即用神主体",
  };
}

// ============================ 输出格式化 ============================

/** 给 LLM 解读层的结构化 payload（纯事实 + 确定性解读辅助，无主观解读） */
export function toInterpretationPayload(
  chart: QimenChart,
  opts: { category?: string; isProxy?: boolean } = {}
) {
  return {
    口径: chart.rules,
    // 确定性算定的格局/旺衰/生克/用神定位：LLM 只能据此发挥，不得新增或推翻
    分析: analyzeQimenChart(chart, opts.category, opts.isProxy),
    起局时间: chart.time,
    节气: chart.solarTerm,
    四柱: {
      年: chart.fourPillars.year.ganzhi,
      月: chart.fourPillars.month.ganzhi,
      日: chart.fourPillars.day.ganzhi,
      时: chart.fourPillars.hour.ganzhi,
    },
    局: chart.ju.label,
    月令: chart.monthCommander,
    值符: chart.zhiFu,
    值使: chart.zhiShi,
    空亡: chart.kongWang,
    驿马: chart.yiMa,
    九宫: chart.palaces.map((p) => ({
      宫: `${p.gongName}${p.gongNumber}`,
      八神: p.divinity,
      天盘星: p.heavenStar.join("/"),
      地盘星: p.earthStar,
      八门: p.door || "（中宫无门）",
      天盘干: p.heavenStems.join(""),
      地盘干: p.earthStems.join(""),
      旺相: p.starVitality,
      标记: [
        p.isZhiFuGong && "值符宫",
        p.isZhiShiGong && "值使宫",
        p.isKongWang && "空亡",
        p.isYiMa && "驿马",
      ].filter(Boolean),
    })),
  };
}

/** 给用户做 verify-first 确认的人类可读摘要 */
export function toVerifySummary(chart: QimenChart): string {
  const fp = chart.fourPillars;
  const r = chart.rules;
  return [
    `起局口径：${r.school} · ${r.plate} · ${r.dingJuFa} · ${r.jiGong}`,
    `四柱：${fp.year.ganzhi} ${fp.month.ganzhi} ${fp.day.ganzhi} ${fp.hour.ganzhi}（${chart.solarTerm}）`,
    `用局：${chart.ju.label}`,
    `值符：${chart.zhiFu.star} 落 ${chart.zhiFu.gong}　值使：${chart.zhiShi.door} 落 ${chart.zhiShi.gong}`,
    `空亡：${chart.kongWang.join("")}　驿马：${chart.yiMa}`,
    `请确认起局时间与上述四柱无误，再进入解读。`,
  ].join("\n");
}

// ============================================================
// 解读辅助层（确定性，新增；不改动任何排盘逻辑）
// 目标：把"格局/旺衰/生克"算成结构化事实，喂给 LLM，杜绝其在这部分幻觉。
// 分层口径：
//   Tier1 可直接算（共识）：五行生克、旺衰、空亡、驿马、伏吟、门迫、三奇临吉门
//   Tier2 十干克应表（常见定义，可覆盖；流派或有出入）
//   Tier3 分歧大（入墓具体库/击刑具体宫）—— 不硬判，仅做提示，不下结论
// ============================================================

type WX = "木" | "火" | "土" | "金" | "水";

const WX_GAN: Record<string, WX> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const WX_MEN: Record<string, WX> = {
  休门: "水", 生门: "土", 伤门: "木", 杜门: "木",
  景门: "火", 死门: "土", 惊门: "金", 开门: "金",
};
const WX_STAR: Record<string, WX> = {
  天蓬星: "水", 天芮星: "土", 天冲星: "木", 天辅星: "木", 天禽星: "土",
  天心星: "金", 天柱星: "金", 天任星: "土", 天英星: "火",
};
const WX_GONG: Record<number, WX> = {
  1: "水", 2: "土", 3: "木", 4: "木", 5: "土",
  6: "金", 7: "金", 8: "土", 9: "火",
};
const JI_MEN = ["开门", "休门", "生门"]; // 三吉门
const XIONG_MEN = ["死门", "惊门"]; // 二大凶门（伤杜景为中性偏凶，按生克另判）
const SAN_QI = ["乙", "丙", "丁"]; // 三奇

export type WuXingRel = "比和" | "我生" | "我克" | "生我" | "克我";
/** a 相对 b 的五行关系 */
function wxRel(a: WX, b: WX): WuXingRel {
  if (a === b) return "比和";
  if (SHENG[a] === b) return "我生"; // a 生 b（泄）
  if (KE[a] === b) return "我克"; // a 克 b
  if (SHENG[b] === a) return "生我"; // b 生 a（得助）
  if (KE[b] === a) return "克我"; // b 克 a（受制）
  return "比和";
}

/** 旺衰：某五行在月令下的状态 */
function vitalityOfWX(wx: WX, commander: string): Vitality {
  return vitality(wx, commander);
}

// ---- Tier2：十干克应表（天盘干 + 地盘干）。流派或有出入，可整体覆盖 ----
export interface KeYingEntry { name: string; nature: "吉" | "凶" | "平" | "吉中凶"; desc: string; }
export const SHI_GAN_KE_YING: Record<string, Record<string, KeYingEntry>> = {
  戊: {
    戊: { name: "青龙伏吟", nature: "平", desc: "凡事宜静守，动则迟滞" },
    乙: { name: "青龙合灵", nature: "吉", desc: "喜事临门，谋事可成" },
    丙: { name: "青龙返首", nature: "吉", desc: "大吉，谋为称意；惟戊落空亡或入墓则不应" },
    丁: { name: "青龙耀明", nature: "吉", desc: "贵人扶持，名利皆遂" },
    己: { name: "贵人入狱", nature: "平", desc: "吉凶皆不能施为，事多牵绊" },
    庚: { name: "值符飞宫", nature: "凶", desc: "事多反复，财物耗散" },
    辛: { name: "青龙折足", nature: "凶", desc: "吉事少成，凶事愈凶，有损伤" },
    壬: { name: "青龙入天牢", nature: "凶", desc: "公讼牢狱，凡事不利" },
    癸: { name: "青龙华盖", nature: "平", desc: "吉中藏隐，宜守不宜进" },
  },
  己: {
    己: { name: "地网", nature: "凶", desc: "阴私牵连，重重牢笼" },
    乙: { name: "墓神不明", nature: "吉", desc: "利隐遁藏匿，守静则安" },
    丙: { name: "火悖地户", nature: "平", desc: "凡事多阻，文书反复" },
    丁: { name: "朱雀入墓", nature: "吉", desc: "文书印信事吉，词讼自消" },
    戊: { name: "犬遇青龙", nature: "吉", desc: "谋望遂意，贵人相助" },
    庚: { name: "刑格", nature: "凶", desc: "词讼是非，强为则祸" },
    辛: { name: "游魂入墓", nature: "凶", desc: "病讼缠身，旧事重提" },
    壬: { name: "地网高张", nature: "凶", desc: "行人滞留，谋事难成" },
    癸: { name: "地刑玄武", nature: "凶", desc: "男女疾病，阴私暗昧" },
  },
  庚: {
    庚: { name: "太白同宫(战格)", nature: "凶", desc: "道路阻隔，斗讼相争，大凶" },
    乙: { name: "太白逢星(退格)", nature: "平", desc: "宜退守不宜进取" },
    丙: { name: "太白入荧", nature: "凶", desc: "盗贼临门，破耗失财（一说客胜）" },
    丁: { name: "亭亭之格", nature: "凶", desc: "争讼亡失，文书阻隔" },
    戊: { name: "伏宫格", nature: "凶", desc: "百事不利，经商失财" },
    己: { name: "刑格", nature: "凶", desc: "官非牢狱，强求生祸" },
    辛: { name: "白虎干格", nature: "凶", desc: "道路损折，刀刃之伤" },
    壬: { name: "小格", nature: "凶", desc: "远行失财，车马受阻" },
    癸: { name: "大格", nature: "凶", desc: "远行不利，官非死丧，大凶" },
  },
  辛: {
    辛: { name: "伏吟天庭", nature: "凶", desc: "自罹其灾，旧祸重来" },
    乙: { name: "白虎猖狂", nature: "凶", desc: "远行多殃，人亡财破" },
    丙: { name: "干合悖师", nature: "凶", desc: "弄巧成拙，谋为反复" },
    丁: { name: "狱神得奇", nature: "吉", desc: "囚人遇赦，讼事可解" },
    戊: { name: "困龙被伤", nature: "凶", desc: "屈抑难伸，事多阻滞" },
    己: { name: "入狱自刑", nature: "凶", desc: "自招其咎，病讼牵连" },
    庚: { name: "白虎出力", nature: "凶", desc: "刀兵相争，凡事见血光" },
    壬: { name: "凶蛇入狱", nature: "凶", desc: "牢狱口舌，凡事不顺" },
    癸: { name: "天牢华盖", nature: "凶", desc: "阴人遭难，谋事不成" },
  },
  壬: {
    壬: { name: "蛇入地罗", nature: "凶", desc: "外人缠绕，自相迷惑" },
    乙: { name: "小蛇得势", nature: "吉", desc: "渐入佳境，谋望有成" },
    丙: { name: "水蛇入火", nature: "凶", desc: "水火相战，吉凶反复" },
    丁: { name: "干合蛇刑", nature: "吉中凶", desc: "婚喜可成，惟防文书反复" },
    戊: { name: "小蛇化龙", nature: "平", desc: "得势则吉，失时则平" },
    己: { name: "反吟蛇刑", nature: "凶", desc: "事多反复，刑伤是非" },
    庚: { name: "太白擒蛇", nature: "吉", desc: "利于争讼诉理，先动者胜" },
    辛: { name: "腾蛇相缠", nature: "凶", desc: "词讼牵连，纠缠难解" },
    癸: { name: "幼女奸淫", nature: "凶", desc: "玄武当权，盗贼暗昧之事" },
  },
  癸: {
    癸: { name: "天网四张", nature: "凶", desc: "行人失伴，百事不顺" },
    乙: { name: "华盖逢星", nature: "吉", desc: "贵人禄位，谋事得助" },
    丙: { name: "华盖悖师", nature: "凶", desc: "谋为不成，反复无凭" },
    丁: { name: "螣蛇夭矫", nature: "凶", desc: "文书牵连，谨防火惊" },
    戊: { name: "天乙会合", nature: "吉", desc: "婚姻财喜，凡事和合" },
    己: { name: "华盖地户", nature: "吉", desc: "利于遁迹藏形，守静则安" },
    庚: { name: "太白入网", nature: "凶", desc: "行人不至，凡事阻滞" },
    辛: { name: "网盖天牢", nature: "凶", desc: "罪人遭刑，凡事见凶" },
  },
  乙: {
    乙: { name: "日奇伏吟", nature: "平", desc: "宜守旧，不宜谋望" },
    丙: { name: "奇仪顺遂(日月并行)", nature: "吉", desc: "公私两便，百事皆吉" },
    丁: { name: "奇仪相佐(玉女奇生)", nature: "吉", desc: "百事顺遂，贵人提携" },
    戊: { name: "日奇得佐", nature: "平", desc: "小有所成，宜稳进" },
    己: { name: "日奇入墓", nature: "凶", desc: "暗昧不明，病讼之忧" },
    庚: { name: "日奇被刑", nature: "凶", desc: "争讼是非，夫妻不和" },
    辛: { name: "青龙逃走", nature: "凶", desc: "失财人逃，财去不返" },
    壬: { name: "日奇入地", nature: "吉", desc: "尊卑和睦，凡事顺遂" },
    癸: { name: "华盖逢星", nature: "吉", desc: "贵人成事，柳暗花明" },
  },
  丙: {
    丙: { name: "月奇悖师", nature: "凶", desc: "文书阻隔，谋望多乖" },
    乙: { name: "日月并行(帘幕贵人)", nature: "吉", desc: "贵人提携，大利公门" },
    丁: { name: "星随月转", nature: "吉", desc: "贵人接引，名利双收" },
    戊: { name: "飞鸟跌穴", nature: "吉", desc: "大吉，谋为洞彻，百事可成" },
    己: { name: "火悖入刑", nature: "凶", desc: "文书阻滞，词讼是非" },
    庚: { name: "荧入太白", nature: "凶", desc: "门户破败，财物耗散" },
    辛: { name: "丙辛干合", nature: "吉", desc: "婚姻喜事，谋望成就" },
    壬: { name: "火入天罗", nature: "凶", desc: "官司缠身，弄巧成拙" },
    癸: { name: "华盖悖师", nature: "凶", desc: "阴人害事，谋为不成" },
  },
  丁: {
    丁: { name: "星奇伏吟", nature: "平", desc: "文书未动，宜守候" },
    乙: { name: "人遁吉格", nature: "吉", desc: "贵人禄马，利于隐显" },
    丙: { name: "星随月转", nature: "吉", desc: "贵人提携，事业升迁" },
    戊: { name: "青龙转光", nature: "吉", desc: "官人升迁，谋望得遂" },
    己: { name: "火入勾陈", nature: "凶", desc: "文书阻滞，词讼牵连" },
    庚: { name: "文书阻隔", nature: "凶", desc: "亭亭格，凡事多阻" },
    辛: { name: "朱雀入狱", nature: "吉", desc: "罪人释放，讼事消散" },
    壬: { name: "五神互合(丁壬干合)", nature: "吉", desc: "婚姻和合，贵人相助" },
    癸: { name: "朱雀投江", nature: "凶", desc: "文书口舌，词讼是非" },
  },
};

/** 查天地盘干象：先查克应表；无则回退到五行生克描述 */
function ganPattern(tian: string, di: string): KeYingEntry {
  const hit = SHI_GAN_KE_YING[tian]?.[di];
  if (hit) return hit;
  const rel = wxRel(WX_GAN[tian], WX_GAN[di]);
  const map: Record<WuXingRel, KeYingEntry> = {
    比和: { name: "天地比和", nature: "吉", desc: `${tian}${di}同气，得助有力` },
    生我: { name: "地生天", nature: "吉", desc: `地盘${di}生天盘${tian}，得地之助` },
    我克: { name: "天克地", nature: "平", desc: `天盘${tian}克地盘${di}，可制而费力` },
    我生: { name: "天泄地", nature: "平", desc: `天盘${tian}生地盘${di}，主泄耗` },
    克我: { name: "地克天", nature: "凶", desc: `地盘${di}克天盘${tian}，受制不利` },
  };
  return map[rel];
}

// ---- 用神定位 ----
export type SymbolType = "干" | "门" | "星" | "神" | "其他";
export interface YongShenLocation {
  symbol: string;
  type: SymbolType;
  found: boolean;
  positions: Array<{
    plane: "天盘" | "地盘" | "—";
    gong: string;
    door: string;
    divinity: string;
    heavenStar: string;
    vitality: Vitality | null;
    isKongWang: boolean;
    isYiMa: boolean;
    ganPattern: KeYingEntry | null; // 该宫天地盘干象
  }>;
}

const BA_SHEN = ["值符", "螣蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];
const GAN_CHARS = "甲乙丙丁戊己庚辛壬癸";

function classifySymbol(sym: string): SymbolType {
  if (sym.endsWith("门")) return "门";
  if (sym.endsWith("星")) return "星";
  if (BA_SHEN.includes(sym)) return "神";
  if (sym.length === 1 && GAN_CHARS.includes(sym)) return "干";
  return "其他";
}

function locateSymbol(chart: QimenChart, sym: string, dayGan: string, hourGan: string): YongShenLocation {
  // 解析"日干/时干"
  let resolved = sym;
  if (sym === "日干") resolved = dayGan;
  else if (sym === "时干") resolved = hourGan;
  const type = classifySymbol(resolved);
  const positions: YongShenLocation["positions"] = [];
  const pack = (p: Palace, plane: "天盘" | "地盘" | "—") => ({
    plane,
    gong: `${p.gongName}${p.gongNumber}`,
    door: p.door || "（无门）",
    divinity: p.divinity || "—",
    heavenStar: p.heavenStar.join("/") || "—",
    vitality: p.starVitality,
    isKongWang: p.isKongWang,
    isYiMa: p.isYiMa,
    ganPattern:
      p.heavenStems[0] && p.earthStems[0] ? ganPattern(p.heavenStems[0], p.earthStems[0]) : null,
  });
  for (const p of chart.palaces) {
    if (type === "门" && p.door === resolved) positions.push(pack(p, "—"));
    else if (type === "星" && (p.heavenStar.includes(resolved) || p.earthStar === resolved))
      positions.push(pack(p, p.heavenStar.includes(resolved) ? "天盘" : "地盘"));
    else if (type === "神" && p.divinity === resolved) positions.push(pack(p, "—"));
    else if (type === "干") {
      if (p.heavenStems.includes(resolved)) positions.push(pack(p, "天盘"));
      if (p.earthStems.includes(resolved)) positions.push(pack(p, "地盘"));
    }
  }
  return { symbol: sym === resolved ? sym : `${sym}(${resolved})`, type, found: positions.length > 0, positions };
}

// ---- 格局检测（仅纳入确定+共识者；分歧大者不下结论）----
export interface Geju { name: string; nature: "吉" | "凶" | "平"; gong: string; desc: string; }

function detectGeju(chart: QimenChart): Geju[] {
  const out: Geju[] = [];
  for (const p of chart.palaces) {
    const tag = `${p.gongName}${p.gongNumber}`;
    // 干伏吟（同干）
    if (p.heavenStems[0] && p.heavenStems[0] === p.earthStems[0])
      out.push({ name: "干伏吟", nature: "平", gong: tag, desc: `${p.heavenStems[0]}加${p.heavenStems[0]}，主静守迟滞、旧事重现` });
    // 星伏吟
    if (p.heavenStar[0] && p.earthStar && p.heavenStar[0] === p.earthStar)
      out.push({ name: "星伏吟", nature: "平", gong: tag, desc: `${p.heavenStar[0]}临本位，事多停滞、宜守` });
    // 三奇临吉门
    const tg = p.heavenStems[0];
    if (tg && SAN_QI.includes(tg) && p.door && JI_MEN.includes(p.door))
      out.push({ name: "三奇临吉门", nature: "吉", gong: tag, desc: `${tg}奇临${p.door}，得地利人和，宜主动` });
    // 门迫（门克宫）/ 门制（宫克门）
    if (p.door) {
      const rel = wxRel(WX_MEN[p.door], WX_GONG[p.gongNumber]);
      if (rel === "我克") out.push({ name: "门迫", nature: "凶", gong: tag, desc: `${p.door}克本宫，强为之则受损（门迫）` });
      else if (rel === "克我") out.push({ name: "门受制", nature: "凶", gong: tag, desc: `本宫克${p.door}，门无力、办事受阻` });
    }
    // 值符宫旺衰
    if (p.isZhiFuGong && p.starVitality)
      out.push({ name: "值符宫旺衰", nature: p.starVitality === "旺" || p.starVitality === "相" ? "吉" : "平", gong: tag, desc: `值符星${p.heavenStar.join("/")}处${p.starVitality}，主导之气${p.starVitality === "旺" || p.starVitality === "相" ? "有力" : "偏弱"}` });
    // 空亡宫
    if (p.isKongWang)
      out.push({ name: "空亡", nature: "平", gong: tag, desc: `本宫值空亡，所主之事虚而不实、宜填实之时再动` });
  }
  return out;
}

export interface QimenAnalysis {
  口径说明: string;
  月令: string;
  用神: { 类别: string; 取象: string[]; 说明: string; 定位: YongShenLocation[] };
  天地盘干象: Array<{ 宫: string; 天盘干: string; 地盘干: string; 象: string; 性质: string; 释义: string; 标记: string[] }>;
  格局: Geju[];
  待定提示: string[];
}

/** 确定性解读辅助：算出可验证的格局/旺衰/生克，供 LLM 据实发挥 */
export function analyzeQimenChart(chart: QimenChart, category = "", isProxy = false): QimenAnalysis {
  const dayGan = chart.fourPillars.day.gan;
  const hourGan = chart.fourPillars.hour.gan;
  const ys = selectYongShen(category, isProxy);
  const 定位 = ys.symbols.map((s) => locateSymbol(chart, s, dayGan, hourGan));

  const 天地盘干象 = chart.palaces
    .filter((p) => p.heavenStems[0] && p.earthStems[0])
    .map((p) => {
      const e = ganPattern(p.heavenStems[0], p.earthStems[0]);
      return {
        宫: `${p.gongName}${p.gongNumber}`,
        天盘干: p.heavenStems.join(""),
        地盘干: p.earthStems.join(""),
        象: e.name,
        性质: e.nature,
        释义: e.desc,
        标记: [
          p.isZhiFuGong && "值符宫",
          p.isZhiShiGong && "值使宫",
          p.isKongWang && "空亡",
          p.isYiMa && "驿马",
        ].filter(Boolean) as string[],
      };
    });

  return {
    口径说明: "格局/旺衰/生克均由确定性代码算定；其中十干克应为常见定义、流派或有出入。入墓具体库与击刑具体宫因分歧较大，未做硬判，仅列待定提示。",
    月令: chart.monthCommander,
    用神: { 类别: category || "（未指定，按日干为人、时干为事）", 取象: ys.symbols, 说明: `${ys.primary}；${ys.note}`, 定位 },
    天地盘干象,
    格局: detectGeju(chart),
    待定提示: [
      "入墓（三奇六仪入墓之具体库位）流派分歧大，未自动判定，如需请按贵方口径补充。",
      "击刑（门临受刑之宫）判法不一，未自动判定。",
      "吉凶最终须结合用神与所问之事权衡，本层只提供结构事实与常规吉凶倾向。",
    ],
  };
}
