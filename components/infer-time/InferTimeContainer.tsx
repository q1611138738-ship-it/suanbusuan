'use client';

import { useState, useEffect, useRef } from 'react';
import { generateCandidateCharts, CandidateInfo } from '@/modules/bazi/inferTimeUtils';
import { ScoreState, initScores, determineNextTopic, updateScores, generateVerificationFactBasis } from '@/modules/bazi/inferTimeRuleEngine';
import { INFER_TIME_THRESHOLDS, INFER_TIME_TOPICS } from '@/modules/bazi/inferTimeConfig';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface InferTimeContainerProps {
  baseFormData: any;
  onComplete: (inferredData: any) => void;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const ROUGH_PERIODS = [
  { label: '半夜/凌晨 (23:00-05:00)', hours: [23, 0, 1, 2, 3, 4] },
  { label: '清晨/早饭前后 (05:00-09:00)', hours: [5, 6, 7, 8] },
  { label: '上午/午饭前 (09:00-13:00)', hours: [9, 10, 11, 12] },
  { label: '下午/晚饭前 (13:00-17:00)', hours: [13, 14, 15, 16] },
  { label: '傍晚/入夜 (17:00-23:00)', hours: [17, 18, 19, 20, 21, 22] },
  { label: '完全不知道', hours: [] }
];

export function InferTimeContainer({ baseFormData, onComplete }: InferTimeContainerProps) {
  const [candidates, setCandidates] = useState<CandidateInfo[]>([]);
  const [scores, setScores] = useState<ScoreState[]>([]);
  const [usedTopics, setUsedTopics] = useState<string[]>([]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{ topicId: string, text: string, options: string[] } | null>(null);
  
  const [stage, setStage] = useState<'rough' | 'inferring' | 'verify' | 'fallback'>('rough');
  const [verifyCandidate, setVerifyCandidate] = useState<CandidateInfo | null>(null);
  const [verifyText, setVerifyText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentQuestion, stage, isLoading]);

  const handleRoughSelect = (periodIndex: number) => {
    const allCandidates = generateCandidateCharts(baseFormData).candidates;
    const period = ROUGH_PERIODS[periodIndex];
    
    let filtered = allCandidates;
    if (period.hours.length > 0) {
      filtered = allCandidates.filter(c => {
        const hour = parseInt(c.time.split(':')[0], 10);
        return period.hours.includes(hour);
      });
    }

    setCandidates(filtered);
    setScores(initScores(filtered));
    setStage('inferring');
    runNextLoop(filtered, initScores(filtered), []);
  };

  const runNextLoop = async (currentCandidates: CandidateInfo[], currentScores: ScoreState[], currentUsedTopics: string[]) => {
    if (currentCandidates.length === 0) {
      setStage('fallback');
      return;
    }

    const sortedScores = [...currentScores].sort((a, b) => b.score - a.score);
    
    // Check termination conditions
    if (currentCandidates.length === 1) {
      await startVerification(currentCandidates[0], currentCandidates, sortedScores);
      return;
    }

    const scoreDiff = sortedScores[0].score - sortedScores[1].score;
    if (scoreDiff >= INFER_TIME_THRESHOLDS.CONFIDENT_SCORE_DIFF) {
      await startVerification(currentCandidates.find(c => c.shichen === sortedScores[0].candidateShichen)!, currentCandidates, sortedScores);
      return;
    }

    const nextTopicId = determineNextTopic(currentCandidates, currentUsedTopics);
    
    if (!nextTopicId) {
      // Exhausted all topics
      if (scoreDiff < INFER_TIME_THRESHOLDS.AMBIGUOUS_SCORE_DIFF) {
        setStage('fallback');
      } else {
        await startVerification(currentCandidates.find(c => c.shichen === sortedScores[0].candidateShichen)!, currentCandidates, sortedScores);
      }
      return;
    }

    // Ask LLM to generate the question
    setIsLoading(true);
    try {
      const topic = INFER_TIME_TOPICS.find(t => t.id === nextTopicId)!;
      const res = await fetch('/api/infer-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'question', topicName: topic.name, topicDesc: topic.promptContext }),
      });
      const data = await res.json();
      setCurrentQuestion({ topicId: nextTopicId, text: data.问题, options: data.选项 });
      setMessages(prev => [...prev, { role: 'assistant', content: data.问题 }]);
    } catch (err) {
      console.error(err);
      setStage('fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    
    const newMessages: Message[] = [...messages, { role: 'user', content: answer }];
    setMessages(newMessages);
    setCurrentQuestion(null);
    setIsLoading(true);

    try {
      // 1. Extract fact via NLP
      const res = await fetch('/api/infer-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'extract', topicId: currentQuestion.topicId, userAnswer: answer }),
      });
      const extractedFact = await res.json();

      // 2. Code scores candidates
      const newScores = updateScores(scores, candidates, currentQuestion.topicId, extractedFact, baseFormData.gender);
      setScores(newScores);

      const newUsedTopics = [...usedTopics, currentQuestion.topicId];
      setUsedTopics(newUsedTopics);

      // 3. Next loop
      await runNextLoop(candidates, newScores, newUsedTopics);
    } catch (err) {
      console.error(err);
      setStage('fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const startVerification = async (candidate: CandidateInfo, currentCandidates: CandidateInfo[], currentScores: ScoreState[]) => {
    setIsLoading(true);
    setVerifyCandidate(candidate);
    
    try {
      const factBasis = generateVerificationFactBasis(candidate);
      const res = await fetch('/api/infer-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'verify', factBasis }),
      });
      const data = await res.json();
      setVerifyText(data.text);
      setStage('verify');
    } catch (err) {
      console.error(err);
      setStage('fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResult = async (isCorrect: boolean) => {
    // 埋点记录
    await fetch('/api/infer-time-log', {
      method: 'POST',
      body: JSON.stringify({ scores, selected: isCorrect ? verifyCandidate?.shichen : 'REJECTED' })
    }).catch(() => {});

    if (isCorrect && verifyCandidate) {
      onComplete({
        solarTime: verifyCandidate.time,
        timeKnown: true
      });
    } else {
      // 否定该候选，继续考察下一个
      const newCandidates = candidates.filter(c => c.shichen !== verifyCandidate?.shichen);
      const newScores = scores.filter(s => s.candidateShichen !== verifyCandidate?.shichen);
      setCandidates(newCandidates);
      setScores(newScores);
      setStage('inferring');
      await runNextLoop(newCandidates, newScores, usedTopics);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto bg-background/40 backdrop-blur-md shadow-sm border-x border-border/50">
      <div className="p-4 border-b border-border/50 bg-primary/10">
        <h2 className="text-lg font-bold text-center text-primary">逆推时辰向导</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">通过确定性排除与精准评分，找出最可能的出生时辰</p>
      </div>
      
      {/* 概率展示条 */}
      {stage !== 'rough' && candidates.length > 1 && (
        <div className="px-6 py-2 border-b border-border/50 bg-background/20 flex gap-4 overflow-x-auto hide-scrollbar">
          {scores.sort((a,b) => b.score - a.score).map((s, idx) => (
            <div key={s.candidateShichen} className={`flex flex-col items-center min-w-[80px] p-2 rounded-lg ${idx === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-background/40'}`}>
              <span className="text-xs text-foreground font-medium">{s.candidateShichen.split(' ')[0]}</span>
              <span className="text-[10px] text-muted-foreground">{s.score}分</span>
            </div>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
        <div className="flex flex-col gap-6 pb-24">
          
          {stage === 'rough' && (
            <div className="bg-background/20 rounded-2xl p-6 flex flex-col items-center border border-border/50">
              <h3 className="font-medium mb-6 text-foreground">第一步：您能确定大概的时段吗？</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {ROUGH_PERIODS.map((opt, idx) => (
                  <Button 
                    key={idx} 
                    variant="outline" 
                    onClick={() => handleRoughSelect(idx)}
                    className="h-14 rounded-xl border border-border/50 bg-background/20 hover:bg-background/40 hover:-translate-y-0.5 transition-all text-sm font-normal"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {stage !== 'rough' && messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm border border-border/50 ${
                msg.role === 'user' 
                  ? 'bg-primary/20 text-foreground rounded-br-sm' 
                  : 'bg-background/40 text-foreground rounded-bl-sm'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="bg-background/40 text-muted-foreground rounded-2xl rounded-bl-sm px-5 py-3 border border-border/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                正在进行命理计算与分析...
              </div>
            </div>
          )}

          {!isLoading && stage === 'inferring' && currentQuestion && (
            <div className="flex flex-col items-center mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap justify-center gap-3">
                {currentQuestion.options.map((opt, i) => (
                  <Button 
                    key={i} 
                    onClick={() => handleUserAnswer(opt)}
                    className="rounded-full px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(197,163,101,0.2)]"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {stage === 'verify' && verifyCandidate && !isLoading && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mt-4 shadow-[0_0_20px_rgba(197,163,101,0.1)] animate-in fade-in zoom-in duration-500">
              <h3 className="text-primary font-bold mb-4 text-lg">结论验证</h3>
              <p className="text-foreground leading-relaxed mb-6 font-medium">经过分析，最可能是 <span className="font-bold text-primary">{verifyCandidate.shichen}</span>。<br/><br/>如果确实是此时辰：<br/>{verifyText}<br/><br/>这符合您的实际情况吗？</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => handleVerifyResult(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 rounded-xl py-6">
                  ✅ 是的，完全符合 (使用此时辰)
                </Button>
                <Button onClick={() => handleVerifyResult(false)} variant="outline" className="border border-border/50 hover:bg-background/40 flex-1 rounded-xl py-6">
                  ❌ 不太符合 (排除此时辰)
                </Button>
              </div>
            </div>
          )}

          {stage === 'fallback' && (
            <div className="bg-background/40 border border-border/50 rounded-2xl p-6 mt-4 animate-in fade-in zoom-in duration-500">
              <h3 className="text-foreground font-bold mb-4 text-lg">无法确切区分时辰</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                由于您排除了所有的最可能选项，或者剩余命盘在可验证维度上的表现极其接近，系统无法负责任地为您断定某一个时辰。
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="text-sm text-foreground mb-2">您可以选择：</div>
                <Button onClick={() => onComplete({ timeKnown: false })} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6">
                  跳过时辰，按三柱(仅年月日)解读
                </Button>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {candidates.map(c => (
                    <Button key={c.shichen} variant="outline" onClick={() => onComplete({ solarTime: c.time, timeKnown: true })} className="rounded-xl border border-border/50 hover:bg-background/40">
                      凭感觉选 {c.shichen.split(' ')[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
