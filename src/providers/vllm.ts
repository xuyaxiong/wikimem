import OpenAI from 'openai';
import type { LLMProvider, LLMMessage, LLMResponse, LLMOptions } from './types.js';

export class VLLMProvider implements LLMProvider {
  name = 'vllm';
  private client: OpenAI;
  private defaultModel: string;
  private baseUrl: string;

  constructor(model?: string, baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl ?? process.env['VLLM_BASE_URL'] ?? 'http://localhost:8000';
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env['VLLM_API_KEY'] ?? 'not-required',
      baseURL: `${this.baseUrl}/v1`,
    });
    this.defaultModel = model ?? 'qwen3';
  }

  async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const allMessages = options?.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...messages.filter((m) => m.role !== 'system')]
      : messages;

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model ?? this.defaultModel,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        messages: allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.choices[0]?.message?.content ?? '';

      return {
        content,
        model: response.model,
        tokensUsed: {
          input: response.usage?.prompt_tokens ?? 0,
          output: response.usage?.completion_tokens ?? 0,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
          throw new Error(
            `Could not connect to vLLM at ${this.baseUrl}.\n` +
            'Make sure vLLM is running and accessible.\n' +
            'Install vLLM: https://docs.vllm.ai/en/latest/getting_started/installation.html',
          );
        }
        if (error.message.includes('404')) {
          throw new Error(
            `Model "${options?.model ?? this.defaultModel}" not found in vLLM.\n` +
            'Make sure the model is served with:  vllm serve <model-name>',
          );
        }
      }
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      return (response as { ok: boolean }).ok;
    } catch {
      return false;
    }
  }
}
