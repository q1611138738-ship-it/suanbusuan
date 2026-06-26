import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { getProviderConfig } from '@/config/providers';

export function getLLMClient(providerId?: string) {
  const config = getProviderConfig(providerId);
  const apiKey = process.env[config.apiKeyEnvName] || process.env.OPENAI_API_KEY || '';

  const ai = createOpenAI({
    baseURL: config.baseURL,
    apiKey: apiKey,
  });

  return {
    model: ai.chat(config.defaultModel),
    config
  };
}

// Wrapper for simple text generation
export async function askLLM(prompt: string, systemPrompt?: string, providerId?: string, options?: { temperature?: number }) {
  const { model } = getLLMClient(providerId);
  const result = await generateText({
    model,
    system: systemPrompt,
    prompt: prompt,
    temperature: options?.temperature,
  });
  return result.text;
}

// Wrapper for streaming text generation
export async function streamLLM(prompt: string, systemPrompt?: string, providerId?: string, options?: { temperature?: number }) {
  const { model } = getLLMClient(providerId);
  const result = streamText({
    model,
    system: systemPrompt,
    prompt: prompt,
    temperature: options?.temperature,
  });
  return result;
}
