import { CandidateInfo } from './inferTimeUtils';
import { INFER_TIME_THRESHOLDS, INFER_TIME_WEIGHTS, INFER_TIME_TOPICS } from './inferTimeConfig';
import { ChartJSON } from '@/types/module';

export interface ScoreState {
  candidateShichen: string;
  score: number;
  explanation: string[];
}

export function initScores(candidates: CandidateInfo[]): ScoreState[] {
  return candidates.map(c => ({
    candidateShichen: c.shichen,
    score: INFER_TIME_THRESHOLDS.BASE_SCORE,
    explanation: ['初始分数 50'],
  }));
}

/**
 * 确定下一个最有区分度的维度
 */
export function determineNextTopic(candidates: CandidateInfo[], usedTopics: string[]): string | null {
  // 简单策略：按配置顺序依次提问。可以扩展为计算熵增最大化。
  for (const topic of INFER_TIME_TOPICS) {
    if (!usedTopics.includes(topic.id)) {
      // 检查该维度在当前候选中是否有区分度
      if (hasVariance(candidates, topic.id)) {
        return topic.id;
      } else {
        // 如果没有区分度，标记为已用，继续找下一个
        usedTopics.push(topic.id);
      }
    }
  }
  return null;
}

function hasVariance(candidates: CandidateInfo[], topicId: string): boolean {
  if (candidates.length <= 1) return false;
  
  if (topicId === 'children' || topicId === 'junior_relation') {
    // 检查时柱十神是否完全一致
    const firstTenGod = candidates[0].tenGod;
    const allSame = candidates.every(c => c.tenGod === firstTenGod);
    return !allSame;
  }
  
  if (topicId === 'shensha_fact') {
    // 检查是否有羊刃、血刃、桃花等特定神煞的差异
    const hasSpecialShensha = (c: CandidateInfo) => {
      const ss = c.chart.shenSha?.hour?.map((s: any) => s.name) || [];
      return ss.includes('羊刃') || ss.includes('桃花') || ss.includes('孤辰') || ss.includes('寡宿');
    };
    const firstHas = hasSpecialShensha(candidates[0]);
    const allSame = candidates.every(c => hasSpecialShensha(c) === firstHas);
    return !allSame;
  }
  
  return true;
}

/**
 * 根据用户事实更新分数
 */
export function updateScores(
  currentState: ScoreState[], 
  candidates: CandidateInfo[], 
  topicId: string, 
  extractedData: any,
  gender: 'male' | 'female'
): ScoreState[] {
  const newState = currentState.map(s => ({...s}));

  newState.forEach(state => {
    const candidate = candidates.find(c => c.shichen === state.candidateShichen);
    if (!candidate) return;

    const chart = candidate.chart;
    const tenGod = candidate.tenGod;
    const hourShenSha = chart.shenSha?.hour?.map((s: any) => s.name) || [];
    const isXunKong = chart.xunKong?.hour && chart.xunKong.hour.includes(candidate.ganZhi.substring(1));
    const isLuckyGod = chart.pattern?.favorableElements?.includes(chart.fiveElements?.hour?.gan) || chart.pattern?.favorableElements?.includes(chart.fiveElements?.hour?.zhi);

    if (topicId === 'children') {
      // 提取事实：{"hasChildren": boolean, "childrenDesc": "string"}
      if (extractedData.hasChildren === false) {
        if (isXunKong || tenGod === '偏印' || tenGod === '七杀' || hourShenSha.includes('孤辰') || hourShenSha.includes('寡宿')) {
          state.score += INFER_TIME_WEIGHTS.CHILDREN_MATCH;
          state.explanation.push(`无子女，符合时柱空亡或孤寡、偏印七杀克子星 (+${INFER_TIME_WEIGHTS.CHILDREN_MATCH})`);
        } else {
          state.score += INFER_TIME_WEIGHTS.CHILDREN_MISMATCH;
          state.explanation.push(`无子女，但不符合此时辰吉星旺相的特征 (${INFER_TIME_WEIGHTS.CHILDREN_MISMATCH})`);
        }
      } else if (extractedData.hasChildren === true) {
        if (isXunKong) {
          state.score += INFER_TIME_WEIGHTS.CHILDREN_MISMATCH;
          state.explanation.push(`有子女，但此时辰时柱空亡，不符合 (${INFER_TIME_WEIGHTS.CHILDREN_MISMATCH})`);
        } else if (isLuckyGod || ['正官', '正印', '食神', '正财'].includes(tenGod)) {
          state.score += INFER_TIME_WEIGHTS.CHILDREN_MATCH;
          state.explanation.push(`有子女且时柱为吉神/喜用，加分 (+${INFER_TIME_WEIGHTS.CHILDREN_MATCH})`);
        } else {
          state.score += INFER_TIME_WEIGHTS.CHILDREN_PARTIAL;
          state.explanation.push(`有子女，时柱一般 (+${INFER_TIME_WEIGHTS.CHILDREN_PARTIAL})`);
        }
      }
    }

    if (topicId === 'junior_relation') {
      // 提取事实：{"relation": "good" | "bad" | "distant"}
      if (extractedData.relation === 'good') {
        if (isLuckyGod || ['正印', '食神', '正官', '比肩'].includes(tenGod)) {
          state.score += INFER_TIME_WEIGHTS.JUNIOR_RELATION_MATCH;
          state.explanation.push(`晚辈缘分好，符合时柱喜用或吉星 (+${INFER_TIME_WEIGHTS.JUNIOR_RELATION_MATCH})`);
        } else {
          state.score += INFER_TIME_WEIGHTS.JUNIOR_RELATION_MISMATCH;
          state.explanation.push(`晚辈缘分好，但时柱偏凶 (${INFER_TIME_WEIGHTS.JUNIOR_RELATION_MISMATCH})`);
        }
      } else if (extractedData.relation === 'bad' || extractedData.relation === 'distant') {
        if (!isLuckyGod && (['七杀', '伤官', '劫财'].includes(tenGod) || isXunKong)) {
          state.score += INFER_TIME_WEIGHTS.JUNIOR_RELATION_MATCH;
          state.explanation.push(`晚辈缘分差/疏远，符合时柱忌神/空亡/七杀伤官 (+${INFER_TIME_WEIGHTS.JUNIOR_RELATION_MATCH})`);
        } else {
          state.score += INFER_TIME_WEIGHTS.JUNIOR_RELATION_MISMATCH;
          state.explanation.push(`晚辈缘分差，但时柱为吉 (${INFER_TIME_WEIGHTS.JUNIOR_RELATION_MISMATCH})`);
        }
      }
    }

    if (topicId === 'shensha_fact') {
      // 提取事实：{"hasScarOrSurgery": boolean, "hasRomanceDrama": boolean}
      if (extractedData.hasScarOrSurgery) {
        if (hourShenSha.includes('羊刃') || hourShenSha.includes('血刃')) {
          state.score += INFER_TIME_WEIGHTS.SHENSHA_FACT_MATCH;
          state.explanation.push(`有伤疤手术，命中时柱羊刃/血刃 (+${INFER_TIME_WEIGHTS.SHENSHA_FACT_MATCH})`);
        } else {
          state.score += INFER_TIME_WEIGHTS.SHENSHA_FACT_MISMATCH;
          state.explanation.push(`有伤疤，但时柱无相关神煞 (${INFER_TIME_WEIGHTS.SHENSHA_FACT_MISMATCH})`);
        }
      } else if (extractedData.hasRomanceDrama) {
        if (hourShenSha.includes('桃花') || hourShenSha.includes('咸池')) {
          state.score += INFER_TIME_WEIGHTS.SHENSHA_FACT_MATCH;
          state.explanation.push(`有情感风波，命中时柱桃花 (+${INFER_TIME_WEIGHTS.SHENSHA_FACT_MATCH})`);
        }
      }
    }
  });

  return newState;
}

/**
 * 为最高分候选生成验证断点给 LLM 翻译
 */
export function generateVerificationFactBasis(candidate: CandidateInfo): string {
  const chart = candidate.chart;
  const tenGod = candidate.tenGod;
  const shenSha = chart.shenSha?.hour?.map((s: any) => s.name) || [];
  const isXunKong = chart.xunKong?.hour && chart.xunKong.hour.includes(candidate.ganZhi.substring(1));
  const isLuckyGod = chart.pattern?.favorableElements?.includes(chart.fiveElements?.hour?.gan) || chart.pattern?.favorableElements?.includes(chart.fiveElements?.hour?.zhi);

  let fact = `该候选时柱为${candidate.ganZhi}，天干十神为${tenGod}。`;
  if (isXunKong) fact += `时柱落空亡（可能导致晚育、少子或与子女聚少离多）。`;
  if (isLuckyGod) fact += `时柱为喜用神（晚年生活相对顺遂，容易得子孙力）。`;
  else fact += `时柱为忌神（晚年可能多操劳，或为子孙付出较多）。`;
  
  if (shenSha.includes('羊刃')) fact += `时支带羊刃（暗示晚年或生子时可能有开刀、受伤流血事件）。`;
  if (shenSha.includes('桃花')) fact += `时支带桃花（暗示中晚年可能依然风流，或子女长相出众）。`;
  
  return fact;
}
