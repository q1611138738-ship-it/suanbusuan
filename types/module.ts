export type InputFieldType = 'date' | 'time' | 'select' | 'coin' | 'number' | 'text' | 'geo' | 'date-select' | 'time-select-24h' | 'location-cascade';

export type BreakpointCategory = 'event' | 'pattern' | 'personality';

export interface CandidateBreakpoint {
  id: string;
  category: BreakpointCategory;
  basis: {
    description: string;
    involvedPillars: ('year' | 'month' | 'day' | 'hour')[];
    involvedGods?: string[];
    involvedShensha?: string[];
  };
  timeRange: {
    isLifelong: boolean;
    periodType?: 'early_life' | 'mid_life' | 'late_life' | 'dayun' | 'liunian';
    periodValue?: string;
    ageRange?: [number, number];
    yearRange?: [number, number];
  };
  signalStrength: number;
  isTimeDependent: boolean;
  coreMeaning: {
    domain: 'career' | 'wealth' | 'marriage' | 'health' | 'family' | 'character' | 'general';
    direction: 'positive' | 'negative' | 'neutral';
    template: string;
  };
}

export interface InputField {
  id: string;
  label: string;
  type: InputFieldType;
  required: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  options?: { label: string; value: string | number }[]; // for 'select'
  placeholder?: string;
  unknownTimeLabel?: string;
}

export interface PromptTemplate {
  system: string;
  user: string;
}

export interface Hook {
  id: string;
  domain: string; // e.g., "性格特质", "过去大事件应期", etc.
  confidence: number;
  content: string; // The specific hook question/statement to ask the user
}

export interface ChartJSON {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // A generic representation of the destiny chart
  breakpoints?: CandidateBreakpoint[];
}

export interface SessionState {
  sessionId: string;
  moduleId: string;
  chartId?: string;
  chart?: ChartJSON;
  confirmed: string[];
  denied: string[];
  confidence: number;
  timeUncertain: boolean;
  candidateHours: string[];
  triedAngles: string[];
  turnCount: number;
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
  verificationState?: 'init' | 'verifying' | 'verified' | 'failed' | 'clarifying' | 'reading';
  currentTechniqueIndex?: number;
  currentStatements?: { id: string; content: string }[];
  passedTechnique?: string;
  clarificationQuestions?: { id: number; 问题: string; 选项: string[] }[];
  clarificationAnswers?: { id: number; answer: string }[];
}

export interface DivinationModuleMetadata {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  inputSchema: InputField[];
}

export interface DivinationModule extends DivinationModuleMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  computeChart(input: any): ChartJSON;
  hookProfile(chart: ChartJSON): Hook[];
  buildReadingPrompt(chart: ChartJSON, session: SessionState): PromptTemplate;
}
