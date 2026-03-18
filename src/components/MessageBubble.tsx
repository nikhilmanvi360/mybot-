'use client';

import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
    const time = new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`message ${role}`}>
            <div className="message-avatar">
                {role === 'assistant' ? '✦' : 'U'}
            </div>
            <div>
                <div className="message-bubble">
                    {role === 'assistant' ? (
                        <div className="message-content">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="message-content">{content}</div>
                    )}
                </div>
                <span className="message-time">{time}</span>
            </div>
        </div>
    );
}
