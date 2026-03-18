'use client';

import { useRef, useEffect, useState } from 'react';
import { AgentMode, MODE_CONFIG, Plan } from '@/lib/agents/types';
import MessageBubble from './MessageBubble';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatPanelProps {
    messages: ChatMessage[];
    activeMode: AgentMode;
    isStreaming: boolean;
    streamingContent: string;
    onSendMessage: (message: string) => void;
    onNextStep: () => void;
    plan: Plan | null;
}

export default function ChatPanel({
    messages,
    activeMode,
    isStreaming,
    streamingContent,
    onSendMessage,
    onNextStep,
    plan,
}: ChatPanelProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const config = MODE_CONFIG[activeMode];

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const handleSend = () => {
        if (!input.trim() || isStreaming) return;
        onSendMessage(input.trim());
        setInput('');
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-mode">
                    <span className="chat-header-mode-icon">{config.icon}</span>
                    <h2>{config.label}</h2>
                </div>
                <div className="chat-header-status">
                    <span className="status-dot" />
                    <span>{isStreaming ? 'Thinking...' : 'Ready'}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        role={msg.role}
                        content={msg.content}
                        timestamp={msg.timestamp}
                    />
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                    <MessageBubble
                        role="assistant"
                        content={streamingContent}
                        timestamp={Date.now()}
                    />
                )}

                {/* Typing indicator */}
                {isStreaming && !streamingContent && (
                    <div className="message assistant">
                        <div className="message-avatar">✦</div>
                        <div className="message-bubble">
                            <div className="typing-indicator">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Next step button */}
                {plan && plan.status !== 'complete' && !isStreaming && messages.length > 0 && (
                    <button className="next-step-btn" onClick={onNextStep}>
                        ▶ Continue to Next Step
                    </button>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-wrapper">
                <div className="chat-input-container">
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask AURA anything about ${config.label.toLowerCase()}...`}
                        rows={1}
                        disabled={isStreaming}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        aria-label="Send message"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
                <p className="chat-hint">
                    Press Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
