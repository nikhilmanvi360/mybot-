import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/agents/safety';
import { getSession, addMessage, setActivePlan, getActivePlan, advancePlanStep } from '@/lib/agents/memory';
import { createPlan } from '@/lib/agents/planner';
import { executeStep, executeDirectResponse } from '@/lib/agents/executor';
import { AgentMode } from '@/lib/agents/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, sessionId: rawSessionId, mode = 'study', action = 'chat' } = body;

        const sessionId = rawSessionId || uuidv4();

        // Validate input
        const safety = validateInput(message || '');
        if (!safety.safe) {
            return NextResponse.json(
                { error: safety.reason, sessionId },
                { status: 400 }
            );
        }

        const session = getSession(sessionId, mode as AgentMode);

        // Add user message to memory
        addMessage(sessionId, { role: 'user', content: safety.sanitized! });

        // Check if this is a follow-up to an existing plan
        const activePlan = getActivePlan(sessionId);

        if (action === 'next-step' && activePlan) {
            // Advance to next step
            const result = advancePlanStep(sessionId);
            if (result.done) {
                return NextResponse.json({
                    sessionId,
                    plan: result.plan,
                    message: "🎉 Plan complete! All steps have been executed. Feel free to ask anything else!",
                    done: true,
                });
            }

            // Execute the next step
            const stream = await executeStep(
                sessionId,
                mode as AgentMode,
                result.currentStep!,
                ''
            );

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                    'X-Session-Id': sessionId,
                    'X-Plan': JSON.stringify(result.plan),
                },
            });
        }

        // Check if this needs a plan (complex query) or direct response
        const needsPlan = shouldCreatePlan(safety.sanitized!);

        if (needsPlan) {
            // Create a plan
            const { plan, followUpQuestion } = await createPlan(sessionId, safety.sanitized!, mode as AgentMode);
            setActivePlan(sessionId, plan);

            if (followUpQuestion) {
                // Ask clarifying question first
                addMessage(sessionId, { role: 'assistant', content: followUpQuestion, isFollowUp: true });
                return NextResponse.json({
                    sessionId,
                    plan,
                    message: followUpQuestion,
                    isFollowUp: true,
                });
            }

            // Execute first step
            const firstStep = plan.steps[0];
            const stream = await executeStep(sessionId, mode as AgentMode, firstStep, '');

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                    'X-Session-Id': sessionId,
                    'X-Plan': encodeURIComponent(JSON.stringify(plan)),
                },
            });
        }

        // Direct response (simple query)
        const stream = await executeDirectResponse(sessionId, mode as AgentMode, safety.sanitized!);

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                'X-Session-Id': sessionId,
            },
        });
    } catch (error: unknown) {
        console.error('Chat API error:', error);

        // Handle missing API key or parsing errors
        if (error instanceof Error && (error.message?.includes('API key') || error.message?.includes('401'))) {
            return NextResponse.json(
                { error: 'OpenAI API key missing or invalid. Please add a valid OPENAI_API_KEY to your .env.local file.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}

function shouldCreatePlan(message: string): boolean {
    const planTriggers = [
        /\b(help me|guide me|teach me|show me how)\b/i,
        /\b(prepare|plan|create|build|design|learn|study)\b/i,
        /\b(step[- ]by[- ]step|how (do|can|should) I)\b/i,
        /\b(analyze|improve|optimize|track)\b/i,
        /\b(budget|schedule|routine|strategy)\b/i,
    ];

    // Short messages or greetings don't need a plan
    if (message.split(' ').length < 4) return false;
    if (/^(hi|hello|hey|thanks|ok|yes|no|sure)\b/i.test(message)) return false;

    return planTriggers.some((t) => t.test(message));
}
