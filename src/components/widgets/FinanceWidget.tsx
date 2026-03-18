'use client';

import React from 'react';

interface FinanceItem {
    label: string;
    amount: number;
    color?: string;
}

interface FinanceWidgetProps {
    title: string;
    items: FinanceItem[];
    total?: number;
}

export default function FinanceWidget({ title, items, total }: FinanceWidgetProps) {
    const computedTotal = total || items.reduce((acc, item) => acc + item.amount, 0);

    const colors = ['#7c5cfc', '#00d4ff', '#ff6b9d', '#00c9a7', '#ffb800'];

    return (
        <div className="finance-widget">
            <div className="widget-header">
                💰 <strong>{title}</strong>
            </div>
            <div className="finance-total">
                Total: <span>${computedTotal.toLocaleString()}</span>
            </div>
            <div className="finance-items">
                {items.map((item, index) => {
                    const percentage = (item.amount / computedTotal) * 100;
                    const color = item.color || colors[index % colors.length];

                    return (
                        <div key={item.label} className="finance-item">
                            <div className="finance-item-info">
                                <span>{item.label}</span>
                                <span>${item.amount.toLocaleString()}</span>
                            </div>
                            <div className="finance-progress-bg">
                                <div
                                    className="finance-progress-fill"
                                    style={{
                                        width: `${percentage}%`,
                                        background: color,
                                        boxShadow: `0 0 10px ${color}44`
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .finance-widget {
                    background: rgba(26, 26, 40, 0.7);
                    border: 1px solid rgba(124, 92, 252, 0.2);
                    border-radius: 16px;
                    padding: 20px;
                    margin: 16px 0;
                    width: 100%;
                    max-width: 350px;
                    animation: slideFadeIn 0.4s ease-out;
                }
                .finance-total {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: #e8e8f0;
                }
                .finance-total span {
                    color: #00d4ff;
                }
                .finance-items {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .finance-item-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    margin-bottom: 6px;
                    color: #9998b3;
                }
                .finance-progress-bg {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .finance-progress-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 1s ease-out;
                }
                @keyframes slideFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
