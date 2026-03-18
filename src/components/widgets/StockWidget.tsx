import React, { useEffect, useState } from 'react';

export default function StockWidget({ symbol }: { symbol: string }) {
    const [loading, setLoading] = useState(true);
    const [price, setPrice] = useState<number | null>(null);
    const [change, setChange] = useState<number | null>(null);

    useEffect(() => {
        // Mock stock API fetch for hackathon demo
        setLoading(true);
        const timer = setTimeout(() => {
            setPrice(+(Math.random() * 400 + 50).toFixed(2));
            setChange(+(Math.random() * 10 - 5).toFixed(2));
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [symbol]);

    if (loading) {
        return (
            <div className="custom-widget loading-widget">
                <span className="typing-dot" style={{ width: 6, height: 6 }} />
                <span className="typing-dot" style={{ width: 6, height: 6 }} />
                <span className="typing-dot" style={{ width: 6, height: 6 }} />
            </div>
        );
    }

    const isPositive = change! >= 0;

    return (
        <div className="custom-widget stock-widget">
            <div className="widget-header">
                📈 <strong>{symbol.toUpperCase()}</strong>
            </div>
            <div className="widget-body">
                <div className="stock-price">${price}</div>
                <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '▲ +' : '▼ '}{change}%
                </div>
            </div>
        </div>
    );
}
