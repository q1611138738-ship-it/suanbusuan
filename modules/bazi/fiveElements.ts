import { EightChar } from 'lunar-javascript';
import { STEM_ELEMENTS, BRANCH_HIDDEN, ELEMENT_WEIGHTS } from './constants';

export interface FiveElementsScore {
  '金': number;
  '木': number;
  '水': number;
  '火': number;
  '土': number;
}

export function calculateFiveElements(baZi: typeof EightChar.prototype): FiveElementsScore {
  const scores: FiveElementsScore = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };

  const pillars = [
    { stem: baZi.getYearGan(), branch: baZi.getYearZhi() },
    { stem: baZi.getMonthGan(), branch: baZi.getMonthZhi() },
    { stem: baZi.getDayGan(), branch: baZi.getDayZhi() },
    { stem: baZi.getTimeGan(), branch: baZi.getTimeZhi() }
  ];

  for (const pillar of pillars) {
    const element = STEM_ELEMENTS[pillar.stem];
    if (element) scores[element as keyof FiveElementsScore] += ELEMENT_WEIGHTS.HEAVENLY_STEM;
  }

  for (const pillar of pillars) {
    const hiddens = BRANCH_HIDDEN[pillar.branch];
    if (!hiddens) continue;
    
    if (hiddens.length === 1) {
      scores[STEM_ELEMENTS[hiddens[0]] as keyof FiveElementsScore] += (ELEMENT_WEIGHTS.EARTHLY_BRANCH_MAIN + ELEMENT_WEIGHTS.EARTHLY_BRANCH_MID + ELEMENT_WEIGHTS.EARTHLY_BRANCH_RESIDUAL);
    } else if (hiddens.length === 2) {
      scores[STEM_ELEMENTS[hiddens[0]] as keyof FiveElementsScore] += ELEMENT_WEIGHTS.EARTHLY_BRANCH_MAIN;
      scores[STEM_ELEMENTS[hiddens[1]] as keyof FiveElementsScore] += (ELEMENT_WEIGHTS.EARTHLY_BRANCH_MID + ELEMENT_WEIGHTS.EARTHLY_BRANCH_RESIDUAL);
    } else {
      scores[STEM_ELEMENTS[hiddens[0]] as keyof FiveElementsScore] += ELEMENT_WEIGHTS.EARTHLY_BRANCH_MAIN;
      scores[STEM_ELEMENTS[hiddens[1]] as keyof FiveElementsScore] += ELEMENT_WEIGHTS.EARTHLY_BRANCH_MID;
      scores[STEM_ELEMENTS[hiddens[2]] as keyof FiveElementsScore] += ELEMENT_WEIGHTS.EARTHLY_BRANCH_RESIDUAL;
    }
  }

  return scores;
}
