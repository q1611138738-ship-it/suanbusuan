import { NextResponse } from 'next/server';
import { getSession, saveSession } from '@/lib/session';
import { getServerModuleById } from '@/lib/modules/serverRegistry';
import { streamLLM, askLLM } from '@/lib/llm';
import { v4 as uuidv4 } from 'uuid';
import { SessionState } from '@/types/module';
import { getProviderConfig } from '@/config/providers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { sessionId } = body;
    const { moduleId, input, message } = body;

    if (!moduleId) {
      return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 });
    }

    const divinationModule = getServerModuleById(moduleId);
    if (!divinationModule) {
      return NextResponse.json({ error: 'Module not found or disabled' }, { status: 404 });
    }

    let session: SessionState | null = null;
    if (sessionId) {
      session = await getSession(sessionId);
    } else {
      sessionId = uuidv4();
    }

    if (!session) {
      // Normalize input
      let normalizedInput = input;
      if (moduleId === 'bazi') {
        console.log('Received bazi input:', JSON.stringify(input, null, 2));
        const inputMode = input.inputMode || 'solar';
        const timeKnown = input.timeKnown !== false && input.timeKnown !== 'false';
        const gender = input.gender;
        const longitude = input.birthPlace?.longitude ? Number(input.birthPlace.longitude) : (input.longitude ? Number(input.longitude) : undefined);

        if (inputMode === 'solar') {
          const { solarDate, solarTime } = input;
          const datetimeStr = solarDate ? `${solarDate}T${solarTime || "12:00"}:00` : new Date().toISOString();
          normalizedInput = {
            ...input,
            solarDatetime: datetimeStr,
            timeKnown,
            gender,
            longitude,
          };
        } else if (inputMode === 'lunar') {
          // Convert lunar date to solar using lunar-javascript
          const { Lunar } = await import('lunar-javascript');
          const ld = input.lunarDate;
          if (ld) {
            const lunar = Lunar.fromYmd(ld.year, ld.isLeapMonth ? -ld.month : ld.month, ld.day);
            const tempSolar = lunar.getSolar();
            const solarTime = input.solarTime || '12:00';
            const datetimeStr = `${tempSolar.getYear()}-${String(tempSolar.getMonth()).padStart(2, '0')}-${String(tempSolar.getDay()).padStart(2, '0')}T${solarTime}:00`;
            normalizedInput = {
              ...input,
              solarDatetime: datetimeStr,
              timeKnown,
              gender,
              longitude,
            };
          }
        } else if (inputMode === 'pillars') {
          // It should never reach here because the frontend will transform pillars into solar mode before fetching.
          throw new Error('Pillars input mode is no longer supported directly. Please convert to solar date first.');
        }
      }

      // Create new session
      const chart = divinationModule.computeChart(normalizedInput);
      session = {
        sessionId,
        moduleId,
        chart,
        confirmed: [],
        denied: [],
        confidence: 0,
        timeUncertain: false,
        candidateHours: [],
        triedAngles: [],
        turnCount: 0,
        history: [],
        verificationState: 'init',
        currentTechniqueIndex: 0,
      };
    }

    if (message) {
      session.history.push({ role: 'user', content: message });
    }

    // --- Verification State Machine ---
    if (moduleId === 'qimen') {
      if (session.verificationState === 'init') {
        // Send the chart and verification summary to the client
        session.verificationState = 'verifying';
        await saveSession(sessionId, session);
        
        const responseBody = JSON.stringify({
          type: "qimen_verify",
          chart: session.chart,
          summary: "请确认起局信息无误后，点击“确认排盘”以进行深入解读。"
        });
        return new NextResponse(responseBody, { headers: { 'x-session-id': sessionId, 'Content-Type': 'text/plain; charset=utf-8' } });
      }

      if (session.verificationState === 'verifying') {
        if (message === 'confirm_qimen') {
          session.verificationState = 'reading';
          await saveSession(sessionId, session);
          // 接下来继续执行下方原本的 LLM 对话逻辑
        } else {
          // If the user says something else, just continue to LLM? No, they must confirm.
          // In the UI we'll send 'confirm_qimen'.
        }
      }
    } else {
      const techniques = ['盲派取象', '调候+神煞', '旺衰/十神格局'];

      if (session.verificationState === 'init' || session.verificationState === 'verifying') {
      if (message && message.startsWith('{"type":"verification_feedback"')) {
        const feedback = JSON.parse(message);
        const results = feedback.results; // array of {id, status}
        let hits = 0;
        let consecutiveHits = 0;
        let maxConsecutiveHits = 0;
        let validTotal = 0;
        
        for (const r of results) {
          if (r.status === '准') {
            hits++;
            validTotal++;
            consecutiveHits++;
            maxConsecutiveHits = Math.max(maxConsecutiveHits, consecutiveHits);
          } else if (r.status === '不准') {
            validTotal++;
            consecutiveHits = 0;
          } else {
             // 不确定
            consecutiveHits = 0;
          }
        }

        const pass = maxConsecutiveHits >= 3 || (validTotal > 0 && hits / validTotal >= 0.7);

        if (pass) {
          session.verificationState = 'clarifying';
          session.passedTechnique = techniques[session.currentTechniqueIndex || 0];
          await saveSession(sessionId, session);
          
          // Generate 3 clarification questions (S3)
          const { BAZI_S3_SYSTEM_PROMPT } = await import('@/modules/bazi/prompt');
          const hitStatements = session.currentStatements?.filter((s, i) => results[i]?.status === '准') || [];
          const s3Prompt = BAZI_S3_SYSTEM_PROMPT
            .replace('{技法}', session.passedTechnique)
            .replace('{命中断语列表}', JSON.stringify(hitStatements));
            
          const userPrompt = `【排盘数据】\n${JSON.stringify(session.chart)}\n请输出符合要求的 JSON，不要有多余的话。`;
          
          const resultJsonText = await askLLM(userPrompt, s3Prompt, undefined, { temperature: 0.3 });
          let questions = [];
          try {
            const match = resultJsonText.match(/\[[\s\S]*\]/);
            questions = match ? JSON.parse(match[0]) : JSON.parse(resultJsonText);
          } catch (e) {
            console.error("Failed to parse S3 LLM json", resultJsonText);
            questions = [{ id: 1, 问题: "目前处于人生的什么阶段？", 选项: ["求学", "事业上升", "稳定期", "其他"] }];
          }
          
          session.clarificationQuestions = questions;
          await saveSession(sessionId, session);
          
          const responseBody = JSON.stringify({
            type: "clarification_questions",
            questions: questions
          });
          return new NextResponse(responseBody, { headers: { 'x-session-id': sessionId, 'Content-Type': 'text/plain; charset=utf-8' } });
        } else {
          // Fail, try next technique
          session.currentTechniqueIndex = (session.currentTechniqueIndex || 0) + 1;
          if (session.currentTechniqueIndex >= 3) {
            session.verificationState = 'failed';
            await saveSession(sessionId, session);
            return new NextResponse(JSON.stringify({
              type: "verification_failed",
              message: "这个盘暂时批不准，最常见原因是出生时辰不确定，请核对时辰或真太阳时后再试。"
            }), { headers: { 'x-session-id': sessionId, 'Content-Type': 'text/plain; charset=utf-8' } });
          }
          // Continue to generate next round
        }
      }
      
      // Generate statements round
      session.verificationState = 'verifying';
      const technique = techniques[session.currentTechniqueIndex || 0];
      
      // @ts-ignore
      const userPromptTemplate = divinationModule.buildVerificationPrompt 
        // @ts-ignore
        ? divinationModule.buildVerificationPrompt(session.chart || {}, technique) 
        : null;
      
      let system = '';
      let finalPrompt = '';

      if (userPromptTemplate) {
        system = userPromptTemplate.system;
        finalPrompt = userPromptTemplate.user;
      } else {
        // Fallback
        system = "你是一个命理助手，请验证命盘。";
        finalPrompt = "请给出几个断语。";
      }

      // Call LLM without streaming to get JSON
      const resultJsonText = await askLLM(finalPrompt, system, undefined, { temperature: 0.3 });
      
      // Parse JSON
      let statements = [];
      try {
        const match = resultJsonText.match(/\[[\s\S]*\]/);
        if (match) {
          statements = JSON.parse(match[0]);
        } else {
          statements = JSON.parse(resultJsonText);
        }
      } catch (e) {
        console.error("Failed to parse LLM json", resultJsonText);
        statements = [{id: "1", content: "LLM返回格式错误，请重试"}];
      }

      session.currentStatements = statements;
      await saveSession(sessionId, session);

      const responseBody = JSON.stringify({
        type: "verification_checklist",
        technique: technique,
        statements: statements
      });
      return new NextResponse(responseBody, { headers: { 'x-session-id': sessionId, 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    if (session.verificationState === 'clarifying') {
      if (message && message.startsWith('{"type":"clarification_feedback"')) {
        const feedback = JSON.parse(message);
        session.clarificationAnswers = feedback.answers;
        session.verificationState = 'reading';
        await saveSession(sessionId, session);
        
        // Generate S4
        const birthYear = session.chart?.input?.solarYear || new Date(session.chart?.input?.solarDate || session.chart?.input?.solarDatetime || Date.now()).getFullYear();
        const currentAge = session.chart?.currentYear ? session.chart.currentYear - birthYear : 0;
        const futureBreakpoints = session.chart?.breakpoints?.filter((bp: any) => {
          if (!bp.timeRange?.ageRange) return false;
          if (bp.timeRange.ageRange[1] > currentAge) {
            // Pure lifelong traits pass through verification, so they shouldn't be considered exclusively "future"
            if (bp.timeRange.isLifelong && !bp.timeRange.periodType) return false;
            return true;
          }
          return false;
        }) || [];

        const { BAZI_S4_SYSTEM_PROMPT } = await import('@/modules/bazi/prompt');
        const s4Prompt = BAZI_S4_SYSTEM_PROMPT
          .replace('{技法}', session.passedTechnique || '')
          .replace('{命中断语}', JSON.stringify(session.currentStatements || []))
          .replace('{3问答案}', JSON.stringify(feedback.answers))
          .replace('{未来断点}', JSON.stringify(futureBreakpoints, null, 2));
          
        const userPrompt = `【排盘数据】\n${JSON.stringify(session.chart)}\n请生成最终卡片数据 JSON，不要其他废话。`;
        
        const resultJsonText = await askLLM(userPrompt, s4Prompt, undefined, { temperature: 0.3 });
        let cardData = null;
        try {
          const match = resultJsonText.match(/\{[\s\S]*\}/);
          cardData = match ? JSON.parse(match[0]) : JSON.parse(resultJsonText);
        } catch (e) {
          console.error("Failed to parse S4 LLM json", resultJsonText);
          cardData = { error: "解析失败" };
        }
        
        const responseBody = JSON.stringify({
          type: "reading_card",
          cardData: cardData,
          chart: session.chart
        });
        return new NextResponse(responseBody, { headers: { 'x-session-id': sessionId, 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    }
    }
    // --- End Verification State Machine ---

    // Build prompt using the module logic
    const { system, user } = divinationModule.buildReadingPrompt(session.chart || {}, session);

    // Prepare full prompt. For this basic Phase 0, we'll just send the constructed user prompt + latest history
    let finalPrompt = user;
    if (message) {
      finalPrompt += `\n用户说: ${message}`;
    }

    // Update session
    session.turnCount += 1;
    await saveSession(sessionId, session);

    // Call LLM Gateway
    const result = await streamLLM(finalPrompt, system, undefined, { temperature: 0.3 });

    // FIX: Await the first chunk to catch authentication errors synchronously!
    const reader = result.textStream.getReader();
    let firstChunk;
    try {
      firstChunk = await reader.read();
    } catch (error: any) {
      console.error("Stream API Call Error:", error);
      const errorMsg = error.message || "Unknown error";
      return NextResponse.json({ error: `大模型接口调用失败（${errorMsg}）。请检查 .env.local 中的 API Key。` }, { status: 500 });
    }

    // Return the stream with error handling
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          if (!firstChunk.done) {
            controller.enqueue(new TextEncoder().encode(firstChunk.value));
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(new TextEncoder().encode(value));
            }
          }
        } catch (error: any) {
          console.error("Stream error during iteration:", error);
          controller.enqueue(new TextEncoder().encode(`\n\n[网络中断或生成失败: ${error.message}]`));
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(customStream, {
      headers: {
        'x-session-id': sessionId,
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
