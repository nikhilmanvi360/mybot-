// ─── Agent Types ────────────────────────────────────────────

export type AgentMode = 'study' | 'career' | 'finance' | 'wellness';

export interface PlanStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'complete' | 'skipped';
    result?: string;
}

export interface Plan {
    id: string;
    query: string;
    mode: AgentMode;
    steps: PlanStep[];
    currentStepIndex: number;
    status: 'planning' | 'executing' | 'complete' | 'error';
    createdAt: number;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    planId?: string;
    stepId?: string;
    isFollowUp?: boolean;
}

export interface SessionState {
    sessionId: string;
    mode: AgentMode;
    messages: Message[];
    activePlan: Plan | null;
    history: Plan[];
    preferences: Record<string, string>;
}

export interface AgentResponse {
    message: string;
    plan?: Plan;
    isFollowUp?: boolean;
    suggestedQuestions?: string[];
}

export const MODE_CONFIG: Record<AgentMode, { label: string; icon: string; color: string; description: string }> = {
    study: {
        label: 'Study Companion',
        icon: '📚',
        color: '#6C63FF',
        description: 'Exam prep, topic breakdowns, adaptive quizzes',
    },
    career: {
        label: 'Career Coach',
        icon: '💼',
        color: '#00C9A7',
        description: 'Resume analysis, job prep, interview coaching',
    },
    finance: {
        label: 'Finance Coach',
        icon: '💰',
        color: '#FFB800',
        description: 'Budgeting, savings goals, expense tracking',
    },
    wellness: {
        label: 'Wellness Guide',
        icon: '🧘',
        color: '#FF6B9D',
        description: 'Routines, habits, fitness & mindfulness',
    },
};
