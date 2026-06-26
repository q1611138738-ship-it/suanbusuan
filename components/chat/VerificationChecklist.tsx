import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export interface VerificationStatement {
  id: string;
  content: string;
}

interface VerificationChecklistProps {
  technique: string;
  statements: VerificationStatement[];
  onSubmit: (results: { id: string; status: '准' | '不准' | '不确定' }[]) => void;
  disabled?: boolean;
}

export function VerificationChecklist({ technique, statements, onSubmit, disabled }: VerificationChecklistProps) {
  const [answers, setAnswers] = useState<{id: string; status: '准' | '不准' | '不确定'}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && !disabled) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex, disabled]);

  const handleSelect = (id: string, value: '准' | '不准' | '不确定') => {
    if (disabled) return;
    
    if (answers.some(a => a.id === id)) return;
    
    const newAnswers = [...answers, { id, status: value }];
    setAnswers(newAnswers);
    
    let consecutiveHits = 0;
    let consecutiveMisses = 0;
    for (const a of newAnswers) {
      if (a.status === '准') { consecutiveHits++; consecutiveMisses = 0; }
      else if (a.status === '不准') { consecutiveMisses++; consecutiveHits = 0; }
      else { consecutiveHits = 0; consecutiveMisses = 0; }
    }
    
    if (consecutiveHits >= 3 || consecutiveMisses >= 3 || currentIndex >= statements.length - 1) {
      setIsExiting(true);
      setTimeout(() => {
        setIsSubmitted(true);
        onSubmit(newAnswers);
      }, 500);
    } else {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 400);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === '准') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === '不准') return <XCircle className="w-5 h-5 text-red-500" />;
    return <HelpCircle className="w-5 h-5 text-amber-500" />;
  };

  if (isSubmitted || (disabled && !isExiting)) return null;

  return (
    <Card className={`w-full bg-background/40 backdrop-blur-md border border-border/50 my-2 shadow-sm rounded-2xl overflow-hidden transition-all duration-500 ease-in-out ${
      isExiting ? 'opacity-0 -translate-y-3 scale-[0.97] pointer-events-none' : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-4'
    }`}>
      <div className="bg-primary/10 px-4 py-3 border-b border-border/50">
        <h4 className="font-semibold text-foreground flex items-center justify-between text-sm sm:text-base">
          <span>先核对几件过去的事，准了再出详批</span>
        </h4>
        <p className="text-xs text-muted-foreground mt-1">系统正尝试校准您的命盘，请凭直觉反馈。</p>
      </div>
      
      <CardContent className="p-0 flex flex-col gap-1">
        {statements.slice(0, currentIndex + 1).map((stmt, idx) => {
          const isAnswered = idx < currentIndex || disabled;
          const answer = answers.find(a => a.id === stmt.id);
          
          return (
            <div key={stmt.id} className={`p-4 sm:p-5 transition-colors animate-in fade-in slide-in-from-top-4 duration-300 ${isAnswered ? 'bg-transparent' : 'bg-background/20'}`}>
              <div className={`text-sm sm:text-base mb-4 leading-relaxed font-medium flex items-start gap-2 ${isAnswered ? 'text-muted-foreground' : 'text-foreground'}`}>
                <span className={`inline-flex shrink-0 w-6 h-6 text-center items-center justify-center rounded-full text-xs shadow-sm ${isAnswered ? 'bg-border/50 text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {idx + 1}
                </span>
                <span className="flex-1 mt-0.5">{stmt.content}</span>
                {isAnswered && answer && (
                  <span className="shrink-0 mt-0.5 animate-in zoom-in duration-300">
                    {getStatusIcon(answer.status)}
                  </span>
                )}
              </div>
              
              {(!isAnswered || answer) && (
                <RadioGroup
                  className={`flex gap-2 sm:gap-4 transition-all duration-500 ${isAnswered ? 'pointer-events-none' : ''}`}
                  value={answer?.status || ""}
                  onValueChange={(val) => handleSelect(stmt.id, val as any)}
                >
                  <div className={`flex-1 flex items-center transition-all duration-500 ${isAnswered && answer?.status !== '准' ? 'opacity-30 scale-95 grayscale' : ''}`}>
                    <RadioGroupItem value="准" id={`${stmt.id}-yes`} className="peer sr-only" />
                    <Label
                      htmlFor={`${stmt.id}-yes`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl border border-border/50 bg-background/20 hover:bg-background/40 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/20 peer-data-[state=checked]:text-green-600 dark:peer-data-[state=checked]:text-green-400 cursor-pointer transition-all duration-300 active:scale-95"
                    >
                      准
                    </Label>
                  </div>
                  <div className={`flex-1 flex items-center transition-all duration-500 ${isAnswered && answer?.status !== '不准' ? 'opacity-30 scale-95 grayscale' : ''}`}>
                    <RadioGroupItem value="不准" id={`${stmt.id}-no`} className="peer sr-only" />
                    <Label
                      htmlFor={`${stmt.id}-no`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl border border-border/50 bg-background/20 hover:bg-background/40 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-500/20 peer-data-[state=checked]:text-red-600 dark:peer-data-[state=checked]:text-red-400 cursor-pointer transition-all duration-300 active:scale-95"
                    >
                      不准
                    </Label>
                  </div>
                  <div className={`flex-1 flex items-center transition-all duration-500 ${isAnswered && answer?.status !== '不确定' ? 'opacity-30 scale-95 grayscale' : ''}`}>
                    <RadioGroupItem value="不确定" id={`${stmt.id}-unsure`} className="peer sr-only" />
                    <Label
                      htmlFor={`${stmt.id}-unsure`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl border border-border/50 bg-background/20 hover:bg-background/40 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)] peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-500/20 peer-data-[state=checked]:text-amber-600 dark:peer-data-[state=checked]:text-amber-400 cursor-pointer transition-all duration-300 active:scale-95"
                    >
                      不确定
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </CardContent>
    </Card>
  );
}
