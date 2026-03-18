import OpenAI from 'openai';
import { Plan, PlanStep, AgentMode } from './types';
import { getPlannerPrompt } from '../prompts';
import { getConversationContext } from './memory';
import { v4 as uuidv4 } from 'uuid';

// ─── Planner Agent ──────────────────────────────────────────

function getOpenAI() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
}

export async function createPlan(
    sessionId: string,
    query: string,
    mode: AgentMode
): Promise<{ plan: Plan; followUpQuestion: string | null }> {
    const context = await getConversationContext(sessionId, 5);
    const prompt = getPlannerPrompt(mode, query, context);

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const response = await getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: 'You are a JSON-only planning engine. Return only valid JSON.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    let parsed: { steps?: Array<{ title: string; description: string }>; followUpQuestion?: string | null };

    try {
        parsed = JSON.parse(content);
    } catch {
        // Fallback plan if JSON parsing fails
        parsed = {
            steps: [
                { title: 'Understand your goal', description: 'Let me ask some questions to better understand what you need.' },
                { title: 'Create a strategy', description: 'Based on your answers, I\'ll build a personalized approach.' },
                { title: 'Execute and adapt', description: 'We\'ll work through the plan, adjusting as we go.' },
            ],
            followUpQuestion: 'Could you tell me more about what specific outcome you\'re looking for?',
        };
    }

    const steps: PlanStep[] = (parsed.steps || []).map((s, i) => ({
        id: uuidv4(),
        title: s.title,
        description: s.description,
        status: i === 0 ? 'active' : 'pending',
    }));

    const plan: Plan = {
        id: uuidv4(),
        query,
        mode,
        steps,
        currentStepIndex: 0,
        status: 'executing',
        createdAt: Date.now(),
    };

    return { plan, followUpQuestion: parsed.followUpQuestion || null };
}
