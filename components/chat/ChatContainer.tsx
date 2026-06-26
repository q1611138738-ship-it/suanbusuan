'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DivinationModuleMetadata } from '@/types/module';
import { DynamicInput } from '@/components/input/DynamicInput';
import { BaziBirthInput } from '@/components/input/BaziBirthInput';
import { BaziChartResult } from '@/components/bazi/BaziChartResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SendHorizontal, Loader2, Info } from 'lucide-react';
import { InferTimeContainer } from '../infer-time/InferTimeContainer';
import { VerificationChecklist } from './VerificationChecklist';
import { ClarificationQuestions } from './ClarificationQuestions';
import { ReadingCard } from './ReadingCard';
import { QimenChartResult } from '@/components/qimen/QimenChartResult';
import ModuleMark from '@/components/ui/ModuleMark';
import PrimaryButton from '@/components/ui/PrimaryButton';
import startStyles from './StartPanel.module.css';
import verifyStyles from './VerifyActions.module.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContainerProps {
  divinationModule: DivinationModuleMetadata;
}

type ChatPhase = 'verify' | 'reading';

export function ChatContainer({ divinationModule }: ChatContainerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initData: Record<string, any> = {};
    divinationModule.inputSchema.forEach(s => {
      if (s.defaultValue !== undefined) {
        initData[s.id] = s.defaultValue;
      }
    });

    if (divinationModule.id === 'bazi') {
      const now = new Date();
      initData.inputMode = 'solar';
      initData.gender = 'male';

      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      const d = now.getDate();

      initData.solarYear = y;
      initData.solarMonth = m;
      initData.solarDay = d;
      initData.solarDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      initData.solarHour = 12;
      initData.solarMinute = 0;
      initData.solarTime = '12:00';

      // Import Lunar and initialize lunarDate too (using approximate lunar equivalent or just same date for defaults)
      // Since it's just defaults, we can just use the solar values and pretend they are lunar month/day. 
      // The user will change them anyway.
      initData.lunarDate = { year: y, month: m, day: d, isLeapMonth: false };
      initData.timeKnown = true;
    }

    return initData;
  });
  const [isStarted, setIsStarted] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>(divinationModule.id === 'qimen' ? 'verify' : 'reading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [isInferringTime, setIsInferringTime] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [qimenChart, setQimenChart] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBazi = divinationModule.id === 'bazi';
  const shouldShowComposer = isBazi || phase === 'reading';

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
  }, [messages]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBazi) {
      const mode = formData.inputMode || 'solar';
      if (mode === 'solar' && !formData.solarDate) {
        alert('请选择出生日期时间');
        return;
      }
      if (mode === 'lunar' && !formData.lunarDate) {
        alert('请选择出生日期时间');
        return;
      }
      if (mode === 'pillars' && !formData.pillars) {
        alert('请选择四柱');
        return;
      }
      if (!formData.gender) {
        alert('请选择性别');
        return;
      }

      if (formData.timeKnown === false) {
        setIsInferringTime(true);
        return;
      }

      const bp = formData.birthPlace;
      const isValidLocation = bp && (
        (bp.country === '中国' && bp.province) ||
        (bp.country !== '中国' && bp.city)
      );

      if (!isValidLocation) {
        setShowLocationAlert(true);
        return;
      }
    } else {
      for (const schema of divinationModule.inputSchema) {
        if (schema.required && !formData[schema.id]) {
          // 奇门遁甲：如果选择了“即时起局”，则允许不填公历日期
          if (divinationModule.id === 'qimen' && schema.id === 'datetime' && formData.time?.timeKnown === false) {
            continue;
          }
          alert(`请填写/选择：${schema.label || schema.id}`);
          return;
        }
      }
    }

    setIsStarted(true);
    setPhase(isBazi ? 'reading' : 'verify');
    await sendMessage('', formData);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBazi && phase !== 'reading') return;
    if (!inputText.trim()) return;
    const msg = inputText;
    setInputText('');

    // Add user message to UI immediately
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);

    await sendMessage(msg, formData);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessage = async (message: string, initialInput: any) => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          moduleId: divinationModule.id,
          input: initialInput,
          message: message
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `请求失败：${res.status}`);
      }

      const newSessionId = res.headers.get('x-session-id');
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
      }

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      const assistantMsgId = Date.now().toString() + 'a';
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        // Since we are using toTextStreamResponse, we just append the raw decoded chunk
        if (chunkValue) {
          setMessages(prev => prev.map(m => {
            if (m.id === assistantMsgId) {
              const newContent = m.content + chunkValue;
              if (newContent.trim().startsWith('{')) {
                try {
                  const pj = JSON.parse(newContent);
                  if (pj.type === 'qimen_verify' && pj.chart) {
                    setQimenChart(pj.chart);
                    setPhase('verify');
                  } else if (pj.type === 'reading_card' && pj.chart) {
                    setQimenChart(pj.chart);
                    setPhase('reading');
                  }
                } catch (e) { }
              }
              return { ...m, content: newContent };
            }
            return m;
          }));
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '抱歉，系统出现了一点小问题，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToEdit = () => {
    setIsStarted(false);
    setPhase('verify');
    setMessages([]);
    setSessionId(null);
    setQimenChart(null);
    setInputText('');
    setIsLoading(false);
  };

  const handleConfirmQimen = async () => {
    setPhase('reading');
    await sendMessage('confirm_qimen', formData);
  };

  if (isInferringTime) {
    return (
      <InferTimeContainer
        baseFormData={formData}
        onComplete={async (inferredData) => {
          const newFormData = { ...formData, ...inferredData };
          setFormData(newFormData);
          setIsInferringTime(false);
          setIsStarted(true);
          setPhase('reading');
          await sendMessage('', newFormData);
        }}
      />
    );
  }

  if (!isStarted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-start min-h-full py-8 pb-12 px-4 sm:px-8 bg-stone-50 dark:bg-stone-950">

        <AlertDialog open={showLocationAlert} onOpenChange={setShowLocationAlert}>
          <AlertDialogContent className="max-w-[400px] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-500" />
                默认使用北京时间排盘？
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-3 text-stone-600 dark:text-stone-400 space-y-3 leading-relaxed">
                <span className="block">您未选择{isBazi ? '出生地' : '起局地点'}，系统将默认使用<strong>北京时间（东八区标准时间）</strong>。</span>
                <span className="block bg-stone-50 dark:bg-stone-900 p-3 rounded-lg border border-stone-100 dark:border-stone-800 text-sm">
                  <span className="block"><span className="text-green-600 dark:text-green-500 font-medium">利：</span> 绝大多数时段{isBazi ? '出生' : '起局'}的用户不受影响。</span>
                  <span className="block mt-2"><span className="text-amber-600 dark:text-amber-500 font-medium">弊：</span> 若{isBazi ? '出生' : '起局'}在时辰交界（如 22:55 或 23:05），不使用当地经纬度校准“真太阳时”，可能导致时柱或起运时间出现偏差。</span>
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="rounded-xl">返回修改</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
                onClick={async () => {
                  setShowLocationAlert(false);
                  setIsStarted(true);
                  setPhase(isBazi ? 'reading' : 'verify');
                  await sendMessage('', formData);
                }}
              >
                确认排盘
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Card className="w-full max-w-[520px] md:max-w-4xl my-auto shadow-2xl shadow-stone-200/50 dark:shadow-black/50 rounded-3xl border-stone-200/60 dark:border-stone-800/60 bg-gradient-to-b from-white to-stone-50/50 dark:from-stone-900 dark:to-stone-950/50 overflow-visible transition-all duration-300">
          <CardHeader className="text-center pb-4 pt-10 px-8">
            <div className={startStyles.headerMark}>
              <ModuleMark kind={isBazi ? 'bazi' : 'qimen'} size={72} />
            </div>
            <CardTitle className={startStyles.moduleTitle}>{divinationModule.name}</CardTitle>
            <CardDescription className="text-stone-500 mt-2">
              {isBazi ? '请输入出生信息，生成专属命盘与 AI 解读' : '以问事时间起局，也可以手动选择具体时间。'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 md:px-10 pb-10 pt-2">
            <form onSubmit={handleStart} className="flex flex-col gap-2">
              {isBazi ? (
                <BaziBirthInput
                  value={formData}
                  onChange={setFormData}
                />
              ) : (
                <div className="flex flex-col gap-6 px-2">
                  {divinationModule.inputSchema.map(schema => (
                    <DynamicInput
                      key={schema.id}
                      schema={schema}
                      value={formData[schema.id]}
                      onChange={(val) => setFormData(prev => ({ ...prev, [schema.id]: val }))}
                      disabled={divinationModule.id === 'qimen' && schema.id === 'datetime' && formData.time?.timeKnown === false}
                    />
                  ))}
                </div>
              )}
              <div className={startStyles.startButtonWrap}>
                <PrimaryButton type="submit">
                  开始解读
                </PrimaryButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto bg-white dark:bg-stone-950 shadow-sm border-x border-stone-200 dark:border-stone-800">
      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
        <div className={`flex flex-col gap-6 ${shouldShowComposer ? 'pb-24' : 'pb-4'}`}>
          {isBazi && (
            <div className="mb-2 mt-4">
              <BaziChartResult input={formData} />
            </div>
          )}
          {divinationModule.id === 'qimen' && qimenChart && (
            <div className="mb-2 mt-4">
              <QimenChartResult chart={qimenChart} />
            </div>
          )}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 my-16 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-stone-300 dark:text-stone-700" />
              <p>排盘中，正在为您深度分析...</p>
            </div>
          )}
          {messages.map((msg) => {
            let isJson = false;
            let parsedJson = null;
            if (msg.role === 'assistant' && msg.content.trim().startsWith('{')) {
              isJson = true;
              try {
                parsedJson = JSON.parse(msg.content);
              } catch (e) {
                // Not fully streaming yet
              }
            }

            const isLastMessage = messages.findIndex(m => m.id === msg.id) === messages.length - 1;
            const isHiddenCard = (parsedJson?.type === 'verification_checklist' || parsedJson?.type === 'clarification_questions' || parsedJson?.type === 'qimen_verify') && !isLastMessage;

            if (isHiddenCard) return null;

            return (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {parsedJson?.type === 'reading_card' ? (
                  <div className="w-full py-4">
                    <ReadingCard data={parsedJson.cardData} chart={parsedJson.chart} />
                  </div>
                ) : parsedJson?.type === 'verification_checklist' ? (
                  messages.findIndex(m => m.id === msg.id) === messages.length - 1 ? (
                    <div className="w-full">
                      <VerificationChecklist
                        technique={parsedJson.technique}
                        statements={parsedJson.statements}
                        onSubmit={async (results) => {
                          const submitMsg = JSON.stringify({ type: 'verification_feedback', results });
                          await sendMessage(submitMsg, null);
                        }}
                        disabled={false}
                      />
                    </div>
                  ) : null
                ) : parsedJson?.type === 'clarification_questions' ? (
                  messages.findIndex(m => m.id === msg.id) === messages.length - 1 ? (
                    <div className="w-full">
                      <ClarificationQuestions
                        questions={parsedJson.questions}
                        onSubmit={async (answers) => {
                          const submitMsg = JSON.stringify({ type: 'clarification_feedback', answers });
                          await sendMessage(submitMsg, null);
                        }}
                        disabled={false}
                      />
                    </div>
                  ) : null
                ) : parsedJson?.type === 'qimen_verify' ? (
                  messages.findIndex(m => m.id === msg.id) === messages.length - 1 && phase === 'verify' ? (
                    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-lg text-stone-800 dark:text-stone-200 mb-4 flex items-center gap-2">
                        排盘确认
                      </h4>
                      <p className="text-stone-600 dark:text-stone-400 mb-6">{parsedJson.summary}</p>
                      <div className={verifyStyles.actionRow}>
                        <button
                          type="button"
                          onClick={handleConfirmQimen}
                          disabled={isLoading}
                          className={verifyStyles.primaryAction}
                        >
                          确认起局信息无误
                        </button>
                        <button
                          type="button"
                          onClick={handleReturnToEdit}
                          disabled={isLoading}
                          className={verifyStyles.secondaryAction}
                        >
                          返回修改
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center text-sm text-stone-500 py-2">已确认排盘信息</div>
                  )
                ) : (
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm backdrop-blur-md border ${msg.role === 'user'
                    ? 'bg-primary/90 text-primary-foreground border-primary/20 rounded-br-sm'
                    : 'bg-background/40 text-foreground border-border/50 rounded-bl-sm'
                    }`}>
                    {isJson ? (
                      !parsedJson ? (
                        <div className="flex items-center gap-2 text-stone-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          分析中...
                        </div>
                      ) : parsedJson.type === 'verification_passed' || parsedJson.type === 'verification_failed' ? (
                        <div className="leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />
                          }}>
                            {parsedJson.message || ''}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />
                          }}>
                            {msg.content || ''}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <div className="leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />
                        }}>
                          {msg.content || ''}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && messages.length > 0 && (
            <div className="flex w-full justify-start">
              <div className="bg-stone-100 text-stone-500 dark:bg-stone-900 dark:text-stone-400 rounded-2xl rounded-bl-sm px-5 py-3 border border-stone-200 dark:border-stone-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce delay-75"></span>
                <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {shouldShowComposer && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 z-10">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleChatSubmit} className="flex gap-3 relative items-center">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="补充信息或回复选择..."
                disabled={isLoading}
                autoComplete="off"
                className="flex-1 rounded-full h-12 px-6 pr-14 bg-background/40 backdrop-blur-md border border-border/50 focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-foreground transition-all duration-300 hover:border-primary/50"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                size="icon"
                className={`absolute right-1 top-1 w-10 h-10 rounded-full transition-all duration-300 ${inputText.trim() && !isLoading
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground hover:-translate-y-0.5 shadow-[0_0_15px_rgba(197,163,101,0.4)]'
                  : 'bg-transparent text-muted-foreground hover:bg-background/20'
                  }`}
              >
                <SendHorizontal className="w-4 h-4" />
              </Button>
            </form>
            <div className="text-center mt-3 text-xs text-stone-400">
              一命二运三风水,四积阴德五读书；六名七相八敬神,九交贵人十养生。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
