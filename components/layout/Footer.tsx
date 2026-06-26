"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Footer() {
  const [modalType, setModalType] = useState<'disclaimer' | 'privacy' | null>(null);

  return (
    <>
      <footer className="w-full border-t border-border/50 bg-background/20 mt-auto shrink-0">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/80 font-medium">
          <div>
            Copyright © 2026 算不算. All rights reserved.
          </div>
          <div className="flex items-center gap-x-6 gap-y-2">
            <button 
              onClick={() => setModalType('disclaimer')} 
              className="hover:text-primary transition-colors focus:outline-none"
            >
              免责声明
            </button>
            <button 
              onClick={() => setModalType('privacy')} 
              className="hover:text-primary transition-colors focus:outline-none"
            >
              隐私政策
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setModalType(null)} 
          />
          
          {/* Modal Content */}
          <div className="relative bg-card border border-border/50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="text-lg font-bold text-foreground">
                {modalType === 'disclaimer' ? '免责声明' : '隐私政策'}
              </h2>
              <button 
                onClick={() => setModalType(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="text-sm text-foreground leading-relaxed space-y-4">
                {modalType === 'disclaimer' ? (
                  <>
                    <p>欢迎使用“算不算”（以下简称“本平台”）。在您使用本平台提供的各项服务之前，请您务必仔细阅读并理解本免责声明。</p>
                    <p><strong>1. 娱乐与文化研究性质</strong><br/>本平台提供的所有排盘、命理解读、运势测算等内容，均基于中国传统易学理论及算法生成。相关结果仅供娱乐、参考及文化学术交流之用，绝不构成任何科学意义上的绝对事实或专业指导。</p>
                    <p><strong>2. 非专业性建议</strong><br/>本平台的测试结果及AI解读不能替代专业的医疗、法律、财务、心理咨询等领域的专业建议。用户在面临健康、法律、投资、婚姻等重大决策时，请务必咨询相关领域的专业人士，切勿依赖本平台的测算结果。</p>
                    <p><strong>3. 免责条款</strong><br/>用户因相信、采纳本平台测算结果而做出的任何行为，或因此导致的直接或间接损失，本平台及其开发者均不承担任何法律责任。</p>
                    <p><strong>4. 服务变更与中断</strong><br/>本平台保留在不事先通知的情况下，随时修改、中断或终止部分或全部服务的权利。</p>
                    <p>当您继续使用本平台，即视为您已完全知晓并同意本免责声明的全部内容。</p>
                  </>
                ) : (
                  <>
                    <p>“算不算”非常重视您的隐私。本隐私政策旨在说明我们如何收集、使用和保护您的个人信息。</p>
                    <p><strong>1. 我们收集的信息</strong><br/>在使用我们的排盘及测算服务时，您可能需要提供出生日期、时间、性别及出生地点等基本信息。这些信息仅用于核心排盘引擎的运算和 AI 模型的分析反馈。</p>
                    <p><strong>2. 信息的存储与使用</strong><br/>为了保护您的隐私，我们不会强制要求您进行实名注册。我们不会将您的生辰八字信息用于任何广告推销，也不会将您的数据出售给第三方。</p>
                    <p><strong>3. AI 对话与分析</strong><br/>本平台集成了大型语言模型（LLM）来辅助命理解读。在您与 AI 助手对话的过程中，对话上下文可能会被发送至第三方模型接口进行处理。系统会对敏感标识进行脱敏，但仍建议您在对话中避免提供真实的姓名、身份证号或银行卡等敏感信息。</p>
                    <p><strong>4. 数据安全</strong><br/>我们采用业界标准的安全措施来保护您的数据不被未授权访问。由于互联网环境的复杂性，我们无法保证信息传输绝对 100% 的安全，但我们将尽商业上的合理努力确保您数据的安全性。</p>
                    <p>如果您对我们的隐私政策有任何疑问，请通过其他渠道与我们联系。</p>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
}
