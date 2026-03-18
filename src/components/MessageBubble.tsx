'use client';

import ReactMarkdown from 'react-markdown';
import WeatherWidget from './widgets/WeatherWidget';
import StockWidget from './widgets/StockWidget';
import FlashcardWidget from './widgets/FlashcardWidget';
import FinanceWidget from './widgets/FinanceWidget';


interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

function parseWidgets(content: string) {
    const WIDGET_REGEX = /\[WIDGET:\s*([A-Z]+)\s*:\s*([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = WIDGET_REGEX.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(<ReactMarkdown key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</ReactMarkdown>);
        }

        const type = match[1];
        const arg = match[2].replace(/^["']|["']$/g, '').trim();

        if (type === 'WEATHER') {
            parts.push(<WeatherWidget key={`widget-${match.index}`} location={arg} />);
        } else if (type === 'STOCK') {
            parts.push(<StockWidget key={`widget-${match.index}`} symbol={arg} />);
        } else if (type === 'FLASHCARDS') {
            try {
                const cards = JSON.parse(arg);
                parts.push(<FlashcardWidget key={`widget-${match.index}`} cards={cards} />);
            } catch (e) {
                parts.push(<span key={`error-${match.index}`}>[Error parsing cards]</span>);
            }
        } else if (type === 'FINANCE_CHART') {
            try {
                const data = JSON.parse(arg);
                parts.push(<FinanceWidget key={`widget-${match.index}`} title={data.title} items={data.items} total={data.total} />);
            } catch (e) {
                parts.push(<span key={`error-${match.index}`}>[Error parsing finance data]</span>);
            }
        } else {

            // Unrecognized widget, render as text
            parts.push(<span key={`unrecognized-${match.index}`}>{match[0]}</span>);
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push(<ReactMarkdown key={`text-${lastIndex}`}>{content.slice(lastIndex)}</ReactMarkdown>);
    }

    if (parts.length === 0) {
        return <ReactMarkdown>{content}</ReactMarkdown>;
    }

    return <div className="parsed-widgets-container">{parts}</div>;
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
                            {parseWidgets(content)}
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
