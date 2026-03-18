'use client';

import { AgentMode, MODE_CONFIG } from '@/lib/agents/types';

interface SidebarProps {
    activeMode: AgentMode;
    onModeChange: (mode: AgentMode) => void;
    onNewChat: () => void;
}

export default function Sidebar({ activeMode, onModeChange, onNewChat }: SidebarProps) {
    const modes = Object.entries(MODE_CONFIG) as [AgentMode, typeof MODE_CONFIG[AgentMode]][];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">✦</div>
                    <h1>AURA</h1>
                </div>
                <p className="sidebar-tagline">Agentic Reasoning Assistant</p>
            </div>

            <div className="mode-section">
                <p className="mode-section-title">Assistant Mode</p>
                {modes.map(([key, config]) => (
                    <div
                        key={key}
                        className={`mode-card ${activeMode === key ? 'active' : ''}`}
                        onClick={() => onModeChange(key)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="mode-card-icon">{config.icon}</div>
                        <div className="mode-card-text">
                            <h3>{config.label}</h3>
                            <p>{config.description}</p>
                        </div>
                        <div
                            className="mode-indicator"
                            style={{ background: config.color, color: config.color }}
                        />
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <button
                    onClick={onNewChat}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        marginBottom: '8px',
                    }}
                >
                    + New Conversation
                </button>
                <p className="sidebar-footer-text">Powered by OpenAI • Built for Hackathon</p>
            </div>
        </aside>
    );
}
