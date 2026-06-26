import { NextResponse } from 'next/server';
import { askLLM } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { task } = body;

    if (task === 'question') {
      const { topicName, topicDesc } = body;
      const systemPrompt = `你是一个八字命理助手的“提问生成器”。你的任务是根据代码指定的维度，生成一句自然、不带任何命理术语的口语化提问，并提供2-4个合理的选项。
维度名称：${topicName}
维度说明：${topicDesc}
请输出JSON，格式如下：
{"问题": "您好，请问...", "选项": ["选项A", "选项B", "选项C"]}`;

      const res = await askLLM("请生成提问", systemPrompt, undefined, { temperature: 0.3 });
      const match = res.match(/\{[\s\S]*\}/);
      return NextResponse.json(match ? JSON.parse(match[0]) : JSON.parse(res));
    }

    if (task === 'extract') {
      const { topicId, userAnswer } = body;
      let systemPrompt = `你是一个语义信息提取器。用户的回答是自然语言，你需要将其提取为结构化的 JSON 数据。`;
      
      if (topicId === 'children') {
        systemPrompt += `\n需要提取的结构：{"hasChildren": boolean, "childrenDesc": "string"}。如果用户明确说没有孩子，hasChildren为false。如果有孩子，提取相关描述。如果用户没说清楚，hasChildren可为null。`;
      } else if (topicId === 'junior_relation') {
        systemPrompt += `\n需要提取的结构：{"relation": "good" | "bad" | "distant" | "unknown"}。good代表关系好/得力，bad代表叛逆/难管，distant代表聚少离多/疏远。`;
      } else if (topicId === 'shensha_fact') {
        systemPrompt += `\n需要提取的结构：{"hasScarOrSurgery": boolean, "hasRomanceDrama": boolean}。如果提到明显外伤、骨折、手术则hasScarOrSurgery为true。如果提到感情风波较多则hasRomanceDrama为true。`;
      }

      systemPrompt += `\n只输出上述要求的JSON结构，不要输出其他文字。`;

      const res = await askLLM(`用户回答：${userAnswer}`, systemPrompt, undefined, { temperature: 0.1 });
      const match = res.match(/\{[\s\S]*\}/);
      return NextResponse.json(match ? JSON.parse(match[0]) : JSON.parse(res));
    }

    if (task === 'verify') {
      const { factBasis } = body;
      const systemPrompt = `你是一个八字命理助手的“断语翻译器”。代码给出了一段生硬的命理事实，你需要将其翻译成一句极其自然、温和、面对面聊天口吻的确认句。
要求：
- 绝不要带有“伤官”、“七杀”、“喜用神”、“空亡”、“羊刃”等任何命理术语。
- 语气要像是“一眼看透你”的算命先生，比如：“如果是这个时辰，您早年应该...对吗？”
- 只输出这句润色后的话，不要输出任何额外解释。`;

      const res = await askLLM(`代码提供的事实：${factBasis}`, systemPrompt, undefined, { temperature: 0.5 });
      return NextResponse.json({ text: res.trim() });
    }

    return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
  } catch (error) {
    console.error('Infer-time NLP Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
