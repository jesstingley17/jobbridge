import { streamText, generateText } from 'ai';
import OpenAI from 'openai';

/**
 * AI Gateway client setup
 * Uses Vercel AI Gateway when available, falls back to direct OpenAI
 */
export function getAIClient() {
  const hasAIGateway = !!process.env.AI_GATEWAY_API_KEY;
  const hasDirectOpenAI = !!(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
  
  if (hasAIGateway) {
    // Use Vercel AI Gateway
    return {
      type: 'gateway' as const,
      apiKey: process.env.AI_GATEWAY_API_KEY!,
      baseURL: 'https://ai-gateway.vercel.sh/v1',
    };
  } else if (hasDirectOpenAI) {
    // Use direct OpenAI
    return {
      type: 'openai' as const,
      client: new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      }),
    };
  }
  
  return null;
}

/**
 * Generate text using AI Gateway or OpenAI
 * @param model - Model identifier (e.g., 'openai/gpt-4o', 'xai/grok-4')
 * @param messages - Chat messages
 * @param options - Additional options (temperature, max_tokens, etc.)
 */
export async function generateAIText(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
) {
  const aiClient = getAIClient();
  
  if (!aiClient) {
    throw new Error('No AI client configured. Set AI_GATEWAY_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY');
  }

  if (aiClient.type === 'gateway') {
    // Use Vercel AI SDK with AI Gateway
    const result = await generateText({
      model: model as any,
      messages: messages as any,
      apiKey: aiClient.apiKey,
      baseURL: aiClient.baseURL,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    });

    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    };
  } else {
    // Use direct OpenAI SDK
    const response = await aiClient.client.chat.completions.create({
      model: model.replace('openai/', ''), // Remove prefix if present
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      usage: response.usage,
      finishReason: response.choices[0]?.finish_reason || 'stop',
    };
  }
}

/**
 * Stream text using AI Gateway or OpenAI
 * @param model - Model identifier
 * @param messages - Chat messages
 * @param options - Additional options
 */
export async function streamAIText(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
) {
  const aiClient = getAIClient();
  
  if (!aiClient) {
    throw new Error('No AI client configured');
  }

  if (aiClient.type === 'gateway') {
    // Use Vercel AI SDK with AI Gateway
    return streamText({
      model: model as any,
      messages: messages as any,
      apiKey: aiClient.apiKey,
      baseURL: aiClient.baseURL,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    });
  } else {
    // For direct OpenAI, we'd need to use OpenAI's streaming
    // For now, fall back to non-streaming
    const result = await generateAIText(model, messages, options);
    return {
      textStream: (async function* () {
        yield result.text;
      })(),
      usage: Promise.resolve(result.usage),
      finishReason: Promise.resolve(result.finishReason),
    };
  }
}

