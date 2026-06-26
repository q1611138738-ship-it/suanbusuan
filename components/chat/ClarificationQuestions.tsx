import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ClarificationQuestion {
  id: number;
  问题: string;
  选项: string[];
}

interface Props {
  questions: ClarificationQuestion[];
  onSubmit: (answers: { id: number; answer: string }[]) => void;
  disabled?: boolean;
}

export function ClarificationQuestions({ questions, onSubmit, disabled }: Props) {
  const [answers, setAnswers] = useState<{ id: number; answer: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && !disabled) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex, disabled]);

  const handleSelect = (id: number, answer: string) => {
    if (disabled) return;
    if (answers.some(a => a.id === id)) return;
    
    const newAnswers = [...answers, { id, answer }];
    setAnswers(newAnswers);
    
    if (currentIndex >= questions.length - 1) {
      setIsExiting(true);
      setTimeout(() => {
        setIsSubmitted(true);
        onSubmit(newAnswers);
      }, 500);
    } else {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  if (isSubmitted || (disabled && !isExiting)) return null;

  return (
    <Card className={`w-full bg-background/40 backdrop-blur-md border border-border/50 my-2 shadow-sm rounded-2xl overflow-hidden transition-all duration-500 ease-in-out ${
      isExiting ? 'opacity-0 -translate-y-3 scale-[0.97] pointer-events-none' : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-4'
    }`}>
      <div className="bg-primary/10 px-4 py-3 border-b border-border/50">
        <h4 className="font-semibold text-foreground flex items-center justify-between text-sm sm:text-base">
          <span>核对通过！为了给您更精准的详批，请补充几点信息</span>
        </h4>
      </div>
      
      <CardContent className="p-0 flex flex-col gap-1">
        {questions.slice(0, currentIndex + 1).map((q, idx) => {
          const isAnswered = idx < currentIndex || disabled;
          const answer = answers.find(a => a.id === q.id);
          
          return (
            <div key={q.id} className={`p-4 sm:p-5 transition-colors animate-in fade-in slide-in-from-top-4 duration-300 ${isAnswered ? 'bg-transparent' : 'bg-background/20'}`}>
              <div className={`text-sm sm:text-base mb-4 leading-relaxed font-medium flex items-start gap-2 ${isAnswered ? 'text-muted-foreground' : 'text-foreground'}`}>
                <span className={`inline-flex shrink-0 w-6 h-6 text-center items-center justify-center rounded-full text-xs shadow-sm ${isAnswered ? 'bg-border/50 text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {idx + 1}
                </span>
                <span className="flex-1 mt-0.5">{q.问题}</span>
                {isAnswered && answer && (
                  <span className="shrink-0 mt-0.5 animate-in zoom-in duration-300 text-sm font-normal text-muted-foreground bg-background/50 px-2.5 py-0.5 rounded-full border border-border/50">
                    {answer.answer}
                  </span>
                )}
              </div>
              
              {!isAnswered && (
                <div className="flex flex-col gap-2 sm:gap-3">
                  {q.选项.map((opt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 rounded-xl text-left font-normal whitespace-normal transition-all duration-300 active:scale-95 border border-border/50 bg-background/20 hover:bg-background/40 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(197,163,101,0.3)] hover:border-primary/50"
                      onClick={() => handleSelect(q.id, opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </CardContent>
    </Card>
  );
}
