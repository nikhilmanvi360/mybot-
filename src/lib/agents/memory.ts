import { SessionState, AgentMode, Message, Plan, PlanStep } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase';

// ─── Supabase Session Store ────────────────────────────────

export async function getSession(sessionId: string, mode: AgentMode = 'study'): Promise<SessionState> {
    const { data: sessionDoc, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

    if (error || !sessionDoc) {
        // Create new session
        await supabase.from('sessions').insert({
            session_id: sessionId,
            mode: mode,
        });
        return {
            sessionId,
            mode,
            messages: [],
            activePlan: null,
            history: [],
            preferences: {},
        };
    }

    const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    const messages = (msgs || []).map(m => ({
        id: m.message_id,
        role: m.role as any,
        content: m.content,
        timestamp: new Date(m.created_at).getTime(),
        planId: m.plan_id,
        stepId: m.step_id,
        isFollowUp: m.is_follow_up
    }));

    // Check if mode needs update
    if (sessionDoc.mode !== mode) {
        await supabase.from('sessions').update({ mode }).eq('session_id', sessionId);
    }

    return {
        sessionId,
        mode: mode,
        messages,
        activePlan: await getActivePlan(sessionId),
        history: [],
        preferences: sessionDoc.preferences || {},
    };
}

export async function addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    // Ensure session exists
    await getSession(sessionId);

    const fullMessage: Message = {
        ...message,
        id: uuidv4(),
        timestamp: Date.now(),
    };

    await supabase.from('messages').insert({
        session_id: sessionId,
        message_id: fullMessage.id,
        role: fullMessage.role,
        content: fullMessage.content,
        plan_id: fullMessage.planId,
        step_id: fullMessage.stepId,
        is_follow_up: fullMessage.isFollowUp,
    });

    return fullMessage;
}

export async function setActivePlan(sessionId: string, plan: Plan): Promise<void> {
    await supabase.from('plans').insert({
        session_id: sessionId,
        plan_id: plan.id,
        query: plan.query,
        mode: plan.mode,
        steps: plan.steps,
        current_step_index: plan.currentStepIndex,
        status: plan.status,
    });
}

export async function getActivePlan(sessionId: string): Promise<Plan | null> {
    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('session_id', sessionId)
        .neq('status', 'complete')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;

    return {
        id: data.plan_id,
        query: data.query,
        mode: data.mode as AgentMode,
        steps: data.steps,
        currentStepIndex: data.current_step_index,
        status: data.status as any,
        createdAt: new Date(data.created_at).getTime(),
    };
}

export async function advancePlanStep(sessionId: string): Promise<PlanStepAdvanceResult> {
    const plan = await getActivePlan(sessionId);
    if (!plan) return { done: true };

    const currentStep = plan.steps[plan.currentStepIndex];
    if (currentStep) {
        currentStep.status = 'complete';
    }

    plan.currentStepIndex++;

    if (plan.currentStepIndex >= plan.steps.length) {
        plan.status = 'complete';
        await supabase.from('plans')
            .update({ status: 'complete', current_step_index: plan.currentStepIndex, steps: plan.steps })
            .eq('plan_id', plan.id);

        return { done: true, plan };
    }

    plan.steps[plan.currentStepIndex].status = 'active';

    await supabase.from('plans')
        .update({ current_step_index: plan.currentStepIndex, steps: plan.steps })
        .eq('plan_id', plan.id);

    return { done: false, plan, currentStep: plan.steps[plan.currentStepIndex] };
}

interface PlanStepAdvanceResult {
    done: boolean;
    plan?: Plan;
    currentStep?: PlanStep;
}

export async function getConversationContext(sessionId: string, maxMessages: number = 10): Promise<string> {
    const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(maxMessages);

    if (!msgs || msgs.length === 0) return '';

    return msgs.reverse()
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
}

export async function clearSession(sessionId: string): Promise<void> {
    await supabase.from('sessions').delete().eq('session_id', sessionId);
}
