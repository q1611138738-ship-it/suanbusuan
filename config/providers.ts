export interface LLMProviderConfig {
  name: string;
  baseURL: string;
  apiKeyEnvName: string;
  defaultModel: string;
}

export const PROVIDERS: Record<string, LLMProviderConfig> = {
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    apiKeyEnvName: 'DEEPSEEK_API_KEY',
    defaultModel: 'deepseek-chat',
  },
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    apiKeyEnvName: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
  },
  zhipu: {
    name: 'Zhipu GLM',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyEnvName: 'ZHIPU_API_KEY',
    defaultModel: 'glm-4',
  },
  moonshot: {
    name: 'Moonshot',
    baseURL: 'https://api.moonshot.cn/v1',
    apiKeyEnvName: 'MOONSHOT_API_KEY',
    defaultModel: 'moonshot-v1-8k',
  },
  qwen: {
    name: 'Qwen',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKeyEnvName: 'DASHSCOPE_API_KEY',
    defaultModel: 'qwen-max',
  },
  openrouter: {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKeyEnvName: 'OPENROUTER_API_KEY',
    defaultModel: 'openai/gpt-4o-mini',
  }
};

export const DEFAULT_PROVIDER = process.env.DEFAULT_LLM_PROVIDER || 'deepseek';

export function getProviderConfig(providerId: string = DEFAULT_PROVIDER): LLMProviderConfig {
  const config = PROVIDERS[providerId];
  if (!config) {
    // Allows custom baseURL using OPENAI_BASE_URL if generic provider is chosen
    return {
      name: 'Custom',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      apiKeyEnvName: 'OPENAI_API_KEY',
      defaultModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    };
  }
  return config;
}
