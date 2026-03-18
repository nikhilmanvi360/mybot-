import { SessionState, AgentMode, Message, Plan } from './types';
import { v4 as uuidv4 } from 'uuid';

// ─── In-Memory Session Store ────────────────────────────────

const sessions = new Map<string, SessionState>();

export function getSession(sessionId: string, mode: AgentMode = 'study'): SessionState {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            sessionId,
            mode,
            messages: [],
            activePlan: null,
            history: [],
            preferences: {},
        });
    }
    const session = sessions.get(sessionId)!;
    session.mode = mode;
    return session;
}

export function addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const session = getSession(sessionId);
    const fullMessage: Message = {
        ...message,
        id: uuidv4(),
        timestamp: Date.now(),
    };
    session.messages.push(fullMessage);

    // Keep last 50 messages to prevent unbounded growth
    if (session.messages.length > 50) {
        session.messages = session.messages.slice(-50);
    }

    return fullMessage;
}

export function setActivePlan(sessionId: string, plan: Plan): void {
    const session = getSession(sessionId);
    session.activePlan = plan;
}

export function getActivePlan(sessionId: string): Plan | null {
    const session = sessions.get(sessionId);
    return session?.activePlan ?? null;
}

export function advancePlanStep(sessionId: string): PlanStepAdvanceResult {
    const session = getSession(sessionId);
    if (!session.activePlan) return { done: true };

    const plan = session.activePlan;
    const currentStep = plan.steps[plan.currentStepIndex];
    if (currentStep) {
        currentStep.status = 'complete';
    }

    plan.currentStepIndex++;

    if (plan.currentStepIndex >= plan.steps.length) {
        plan.status = 'complete';
        session.history.push({ ...plan });
        return { done: true, plan };
    }

    plan.steps[plan.currentStepIndex].status = 'active';
    return { done: false, plan, currentStep: plan.steps[plan.currentStepIndex] };
}

interface PlanStepAdvanceResult {
    done: boolean;
    plan?: Plan;
    currentStep?: import('./types').PlanStep;
}

export function getConversationContext(sessionId: string, maxMessages: number = 10): string {
    const session = sessions.get(sessionId);
    if (!session) return '';

    const recent = session.messages.slice(-maxMessages);
    return recent
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
}

export function clearSession(sessionId: string): void {
    sessions.delete(sessionId);
}
