'use client';

import { useState, useCallback } from 'react';
import { AgentMode, Plan } from '@/lib/agents/types';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import PlanPanel from '@/components/PlanPanel';
import WelcomeScreen from '@/components/WelcomeScreen';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function Home() {
    const [activeMode, setActiveMode] = useState<AgentMode>('study');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [sessionId] = useState(() => uuidv4());

    const handleSendMessage = useCallback(async (message: string) => {
        // Add user message
        const userMsg: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content: message,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsStreaming(true);
        setStreamingContent('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    sessionId,
                    mode: activeMode,
                    action: 'chat',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Request failed');
            }

            // Check if it's a JSON response (follow-up question) or SSE stream
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                const data = await response.json();
                if (data.plan) {
                    setPlan(data.plan);
                }
                const assistantMsg: ChatMessage = {
                    id: uuidv4(),
                    role: 'assistant',
                    content: data.message,
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } else {
                // SSE stream
                // Extract plan from header if available
                const planHeader = response.headers.get('X-Plan');
                if (planHeader) {
                    try {
                        const decodedPlan = JSON.parse(decodeURIComponent(planHeader));
                        setPlan(decodedPlan);
                    } catch {
                        // Plan header parse failed, ignore
                    }
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error('No reader');

                const decoder = new TextDecoder();
                let fullContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value, { stream: true });
                    const lines = text.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    setStreamingContent(fullContent);
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }

                // Add final message
                if (fullContent) {
                    const assistantMsg: ChatMessage = {
                        id: uuidv4(),
                        role: 'assistant',
                        content: fullContent,
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, assistantMsg]);
                }
            }
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content:
                    error instanceof Error
                        ? `⚠️ ${error.message}`
                        : '⚠️ Something went wrong. Please try again.',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsStreaming(false);
            setStreamingContent('');
        }
    }, [sessionId, activeMode]);

    const handleNextStep = useCallback(async () => {
        setIsStreaming(true);
        setStreamingContent('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Continue to next step',
                    sessionId,
                    mode: activeMode,
                    action: 'next-step',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Request failed');
            }

            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                const data = await response.json();
                if (data.plan) setPlan(data.plan);
                if (data.message) {
                    const msg: ChatMessage = {
                        id: uuidv4(),
                        role: 'assistant',
                        content: data.message,
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, msg]);
                }
            } else {
                // SSE stream
                const planHeader = response.headers.get('X-Plan');
                if (planHeader) {
                    try {
                        const decodedPlan = JSON.parse(decodeURIComponent(planHeader));
                        setPlan(decodedPlan);
                    } catch {
                        // ignore
                    }
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error('No reader');

                const decoder = new TextDecoder();
                let fullContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value, { stream: true });
                    const lines = text.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    setStreamingContent(fullContent);
                                }
                            } catch {
                                // skip
                            }
                        }
                    }
                }

                if (fullContent) {
                    const msg: ChatMessage = {
                        id: uuidv4(),
                        role: 'assistant',
                        content: fullContent,
                        timestamp: Date.now(),
                    };
                    setMessages((prev) => [...prev, msg]);
                }

                // Refresh plan status
                try {
                    const planRes = await fetch(`/api/plan?sessionId=${sessionId}`);
                    const planData = await planRes.json();
                    if (planData.plan) setPlan(planData.plan);
                } catch {
                    // ignore plan refresh failure
                }
            }
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: '⚠️ Failed to advance to the next step. Please try again.',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsStreaming(false);
            setStreamingContent('');
        }
    }, [sessionId, activeMode]);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setPlan(null);
        setStreamingContent('');
        setIsStreaming(false);
    }, []);

    const hasMessages = messages.length > 0;

    return (
        <div className="app-layout">
            <Sidebar
                activeMode={activeMode}
                onModeChange={setActiveMode}
                onNewChat={handleNewChat}
            />

            <div className="main-content">
                {hasMessages ? (
                    <ChatPanel
                        messages={messages}
                        activeMode={activeMode}
                        isStreaming={isStreaming}
                        streamingContent={streamingContent}
                        onSendMessage={handleSendMessage}
                        onNextStep={handleNextStep}
                        plan={plan}
                    />
                ) : (
                    <>
                        <WelcomeScreen
                            activeMode={activeMode}
                            onSendPrompt={handleSendMessage}
                        />
                        {/* Input area even on welcome screen */}
                        <div className="chat-input-wrapper">
                            <div className="chat-input-container">
                                <textarea
                                    className="chat-input"
                                    placeholder={`Ask AURA anything...`}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            const target = e.target as HTMLTextAreaElement;
                                            if (target.value.trim()) {
                                                handleSendMessage(target.value.trim());
                                                target.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    className="chat-send-btn"
                                    aria-label="Send"
                                    onClick={() => {
                                        const input = document.querySelector('.chat-input') as HTMLTextAreaElement;
                                        if (input?.value.trim()) {
                                            handleSendMessage(input.value.trim());
                                            input.value = '';
                                        }
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </button>
                            </div>
                            <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
                        </div>
                    </>
                )}
            </div>

            <PlanPanel
                plan={plan}
                onNextStep={handleNextStep}
                isExecuting={isStreaming}
            />
        </div>
    );
}
