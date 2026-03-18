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
    const [attachedFile, setAttachedFile] = useState<{ name: string, content: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            setAttachedFile({ name: data.filename, content: data.text });
        } catch (error) {
            console.error('File extraction failed:', error);
            alert('Failed to extract text from the document. Please try a different file.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSend = () => {
        if ((!input.trim() && !attachedFile) || isStreaming || isUploading) return;

        // Inject the RAG context if a file is attached
        let finalMessage = input.trim();
        if (attachedFile) {
            // Include user prompt if exists, otherwise assume they just want it analyzed
            const userPrompt = finalMessage ? `\n\nUser Question: ${finalMessage}` : `\n\nPlease analyze this document and summarize its contents.`;
            finalMessage = `[Attached Document: ${attachedFile.name}]\n\nDOCUMENT CONTENT START\n${attachedFile.content}\nDOCUMENT CONTENT END${userPrompt}`;
        }

        onSendMessage(finalMessage);

        setInput('');
        setAttachedFile(null);
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
                {attachedFile && (
                    <div className="attachment-preview">
                        <span className="attachment-preview-icon">📄</span>
                        <span className="attachment-preview-name">{attachedFile.name}</span>
                        <button className="attachment-preview-remove" onClick={() => setAttachedFile(null)}>×</button>
                    </div>
                )}
                <div className="chat-input-container">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        hidden
                        accept=".pdf,.txt,.md,.csv,.json"
                    />
                    <button
                        className="attach-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isStreaming || isUploading}
                        title="Upload a PDF or Text Document"
                    >
                        {isUploading ? (
                            <span className="typing-dot" style={{ width: 4, height: 4 }} />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                        )}
                    </button>
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={isUploading ? "Extracting text..." : `Ask AURA anything about ${config.label.toLowerCase()}...`}
                        rows={1}
                        disabled={isStreaming || isUploading}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={(!input.trim() && !attachedFile) || isStreaming || isUploading}
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
