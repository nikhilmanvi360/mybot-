'use client';

import React, { useState } from 'react';

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardWidgetProps {
    cards: Flashcard[];
}

export default function FlashcardWidget({ cards }: FlashcardWidgetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) return null;

    const currentCard = cards[currentIndex];

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    return (
        <div className="flashcard-widget-container">
            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
                <div className="flashcard-inner">
                    <div className="flashcard-front">
                        <div className="flashcard-label">Question</div>
                        <div className="flashcard-text">{currentCard.front}</div>
                        <div className="flashcard-hint">Click to flip</div>
                    </div>
                    <div className="flashcard-back">
                        <div className="flashcard-label">Answer</div>
                        <div className="flashcard-text">{currentCard.back}</div>
                        <div className="flashcard-hint">Click to flip back</div>
                    </div>
                </div>
            </div>

            <div className="flashcard-controls">
                <button onClick={handlePrev} disabled={cards.length <= 1}>←</button>
                <span className="flashcard-counter">
                    {currentIndex + 1} / {cards.length}
                </span>
                <button onClick={handleNext} disabled={cards.length <= 1}>→</button>
            </div>

            <style jsx>{`
                .flashcard-widget-container {
                    margin: 20px 0;
                    width: 100%;
                    max-width: 400px;
                }
                .flashcard {
                    height: 200px;
                    perspective: 1000px;
                    cursor: pointer;
                }
                .flashcard-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                }
                .flashcard.flipped .flashcard-inner {
                    transform: rotateY(180deg);
                }
                .flashcard-front, .flashcard-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid rgba(124, 92, 252, 0.3);
                    background: rgba(26, 26, 40, 0.9);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .flashcard-back {
                    transform: rotateY(180deg);
                    background: linear-gradient(135deg, rgba(26, 26, 40, 0.95) 0%, rgba(40, 30, 80, 0.95) 100%);
                }
                .flashcard-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #7c5cfc;
                    margin-bottom: 12px;
                }
                .flashcard-text {
                    font-size: 18px;
                    font-weight: 500;
                    color: #e8e8f0;
                }
                .flashcard-hint {
                    position: absolute;
                    bottom: 12px;
                    font-size: 10px;
                    color: #6b6a85;
                }
                .flashcard-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin-top: 16px;
                }
                .flashcard-controls button {
                    background: rgba(124, 92, 252, 0.1);
                    border: 1px solid rgba(124, 92, 252, 0.3);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .flashcard-controls button:hover:not(:disabled) {
                    background: rgba(124, 92, 252, 0.3);
                }
                .flashcard-controls button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .flashcard-counter {
                    font-size: 12px;
                    color: #9998b3;
                }
            `}</style>
        </div>
    );
}
