'use client';

import { AgentMode, MODE_CONFIG } from '@/lib/agents/types';

interface WelcomeScreenProps {
    activeMode: AgentMode;
    onSendPrompt: (prompt: string) => void;
}

const EXAMPLE_PROMPTS: Record<AgentMode, Array<{ icon: string; text: string; prompt: string }>> = {
    study: [
        { icon: '📖', text: 'Help me prepare for my DBMS exam next week', prompt: 'Help me prepare for my DBMS exam next week' },
        { icon: '🧪', text: 'Explain machine learning concepts step by step', prompt: 'Teach me machine learning concepts step by step' },
        { icon: '📝', text: 'Create a revision plan for my semester finals', prompt: 'Create a revision plan for my semester finals' },
        { icon: '🎯', text: 'Quiz me on data structures and algorithms', prompt: 'Quiz me on data structures and algorithms' },
    ],
    career: [
        { icon: '📄', text: 'Review my resume for a software developer role', prompt: 'Help me improve my resume for a software developer role' },
        { icon: '💡', text: 'Prepare me for a frontend developer interview', prompt: 'Prepare me for a frontend developer interview with mock questions' },
        { icon: '🗺️', text: 'Create a career roadmap for data science', prompt: 'Create a career roadmap for becoming a data scientist' },
        { icon: '✅', text: 'Build a job application tracking checklist', prompt: 'Help me create a job application tracking system' },
    ],
    finance: [
        { icon: '💳', text: 'Help me create a monthly budget plan', prompt: 'Help me create a monthly budget plan for a college student' },
        { icon: '📊', text: 'Analyze my spending habits and find savings', prompt: 'Analyze my spending habits and suggest where I can save money' },
        { icon: '🏦', text: 'Set up an emergency fund strategy', prompt: 'Help me build an emergency fund with a step-by-step plan' },
        { icon: '🎯', text: 'Create a savings plan for a specific goal', prompt: 'Create a savings plan for buying a laptop in 6 months' },
    ],
    wellness: [
        { icon: '🌅', text: 'Design a productive morning routine for me', prompt: 'Design a productive morning routine for a student' },
        { icon: '💪', text: 'Create a beginner workout plan', prompt: 'Create a beginner workout plan I can do at home' },
        { icon: '🧠', text: 'Help me build better study-life balance habits', prompt: 'Help me build better habits for study-life balance' },
        { icon: '😴', text: 'Improve my sleep schedule step by step', prompt: 'Help me fix my sleep schedule with a step-by-step plan' },
    ],
};

export default function WelcomeScreen({ activeMode, onSendPrompt }: WelcomeScreenProps) {
    const config = MODE_CONFIG[activeMode];
    const prompts = EXAMPLE_PROMPTS[activeMode];

    return (
        <div className="welcome-screen">
            <div className="welcome-logo">✦</div>
            <h2 className="welcome-title">Welcome to AURA</h2>
            <p className="welcome-subtitle">
                Your agentic AI assistant that <strong>thinks</strong>, <strong>plans</strong>, and{' '}
                <strong>guides</strong> you step-by-step. Select a mode and ask anything.
            </p>

            <p style={{
                fontSize: '12px',
                color: config.color,
                fontWeight: 600,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
            }}>
                {config.icon} {config.label} Mode
            </p>

            <div className="welcome-prompts">
                {prompts.map((p, i) => (
                    <div
                        key={i}
                        className="welcome-prompt-card"
                        onClick={() => onSendPrompt(p.prompt)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="welcome-prompt-icon">{p.icon}</div>
                        <div className="welcome-prompt-text">{p.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
