// TODO: 待真实数据校准
// 反推时辰相关的配置常量

export const INFER_TIME_THRESHOLDS = {
  // 当第一名分数超过第二名多少分时，视为“差距拉开”，直接终止提问并输出结果
  CONFIDENT_SCORE_DIFF: 40,
  
  // 当第一名和第二名分数差距小于多少分时，视为“无法区分”，触发兜底(三柱或查证)
  AMBIGUOUS_SCORE_DIFF: 15,

  // 基础起评分
  BASE_SCORE: 50,
};

export const INFER_TIME_WEIGHTS = {
  // 子女宫强弱与子女情况对应
  CHILDREN_MATCH: 30,      // 极度吻合（例如时柱食神透出且旺，确有优秀女儿）
  CHILDREN_PARTIAL: 15,    // 部分吻合
  CHILDREN_MISMATCH: -20,  // 完全不吻合（例如时柱空亡无子星，但实际有众多子女）
  
  // 晚辈缘分/下属关系
  JUNIOR_RELATION_MATCH: 20,
  JUNIOR_RELATION_MISMATCH: -15,

  // 特定神煞造成的具体已发生事件
  SHENSHA_FACT_MATCH: 35,   // 神煞事实命中（如羊刃致伤，确实有伤疤）
  SHENSHA_FACT_MISMATCH: -10, // 神煞未命中（不扣太多，因为神煞可能不显现）
};

// 预定义的提问维度
export const INFER_TIME_TOPICS = [
  {
    id: 'children',
    name: '子女情况',
    promptContext: '询问用户的子女情况：有无子女、子女的性别、生育早晚。'
  },
  {
    id: 'junior_relation',
    name: '晚辈缘分',
    promptContext: '询问用户与晚辈、下属、或者小孩子的缘分和亲密程度（是否容易得到晚辈喜爱，或下属是否得力）。'
  },
  {
    id: 'shensha_fact',
    name: '具体伤病与特质',
    promptContext: '询问用户早年是否有过严重外伤、明显疤痕，或者极其特殊且具体的健康问题。'
  }
];
