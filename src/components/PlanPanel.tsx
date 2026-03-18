'use client';

import { Plan } from '@/lib/agents/types';

interface PlanPanelProps {
    plan: Plan | null;
    onNextStep: () => void;
    isExecuting: boolean;
}

export default function PlanPanel({ plan, onNextStep, isExecuting }: PlanPanelProps) {
    if (!plan) {
        return (
            <div className="plan-panel collapsed" />
        );
    }

    const completedSteps = plan.steps.filter((s) => s.status === 'complete').length;
    const totalSteps = plan.steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return (
        <div className="plan-panel">
            <div className="plan-header">
                <h3>
                    <span style={{ fontSize: '16px' }}>📋</span>
                    Execution Plan
                </h3>
                <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-tertiary)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                }}>
                    {plan.status === 'complete' ? '✅ Done' : '⚡ Active'}
                </span>
            </div>

            <div className="plan-progress">
                <div className="plan-progress-bar">
                    <div
                        className="plan-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="plan-progress-text">
                    <span>{completedSteps} of {totalSteps} steps</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            </div>

            <div className="plan-steps">
                {plan.steps.map((step, index) => (
                    <div key={step.id} className={`plan-step ${step.status}`}>
                        <div className="plan-step-icon">
                            {step.status === 'complete' ? '✓' :
                                step.status === 'active' ? (index + 1) :
                                    (index + 1)}
                        </div>
                        <div className="plan-step-content">
                            <div className="plan-step-title">{step.title}</div>
                            <div className="plan-step-description">{step.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {plan.status !== 'complete' && completedSteps < totalSteps && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                        className="next-step-btn"
                        onClick={onNextStep}
                        disabled={isExecuting}
                    >
                        {isExecuting ? (
                            <>
                                <span className="typing-dot" style={{ width: 4, height: 4 }} />
                                <span className="typing-dot" style={{ width: 4, height: 4 }} />
                                <span className="typing-dot" style={{ width: 4, height: 4 }} />
                                Executing...
                            </>
                        ) : (
                            <>▶ Next Step</>
                        )}
                    </button>
                </div>
            )}

            {plan.status === 'complete' && (
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: 'var(--accent-green)',
                    fontWeight: 500,
                }}>
                    🎉 All steps completed!
                </div>
            )}
        </div>
    );
}
