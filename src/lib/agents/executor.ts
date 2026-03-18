import OpenAI from 'openai';
import { AgentMode, PlanStep } from './types';
import { getExecutorPrompt } from '../prompts';
import { getConversationContext } from './memory';

// ─── Executor Agent ─────────────────────────────────────────

function getOpenAI() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
}

export async function executeStep(
    sessionId: string,
    mode: AgentMode,
    step: PlanStep,
    previousResults: string = ''
): Promise<ReadableStream<Uint8Array>> {
    const context = getConversationContext(sessionId, 8);
    const prompt = getExecutorPrompt(mode, step.title, step.description, context, previousResults);
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const response = await getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Execute this step: "${step.title}" — ${step.description}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
    });

    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (error) {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`)
                );
                controller.close();
            }
        },
    });
}

export async function executeDirectResponse(
    sessionId: string,
    mode: AgentMode,
    userMessage: string
): Promise<ReadableStream<Uint8Array>> {
    const context = getConversationContext(sessionId, 8);
    const { getSystemPrompt } = await import('../prompts');
    const systemPrompt = getSystemPrompt(mode);
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const response = await getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            ...(context
                ? [{ role: 'user' as const, content: `Previous context:\n${context}` }]
                : []),
            { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
    });

    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (error) {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`)
                );
                controller.close();
            }
        },
    });
}
