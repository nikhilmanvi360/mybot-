import React, { useEffect, useState } from 'react';

export default function WeatherWidget({ location }: { location: string }) {
    const [loading, setLoading] = useState(true);
    const [temp, setTemp] = useState<number | null>(null);
    const [condition, setCondition] = useState('Sunny');

    useEffect(() => {
        // Mock weather data fetch for hackathon demo
        setLoading(true);
        const timer = setTimeout(() => {
            setTemp(Math.floor(Math.random() * 35) + 45); // Random temp between 45-80°F
            const conditions = ['🌤️ Sunny', '☁️ Cloudy', '🌧️ Raining', '⛅ Partly Cloudy'];
            setCondition(conditions[Math.floor(Math.random() * conditions.length)]);
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [location]);

    if (loading) {
        return (
            <div className="custom-widget loading-widget">
                <span className="typing-dot" style={{ width: 6, height: 6 }} />
                <span className="typing-dot" style={{ width: 6, height: 6 }} />
                <span className="typing-dot" style={{ width: 6, height: 6 }} />
            </div>
        );
    }

    return (
        <div className="custom-widget weather-widget">
            <div className="widget-header">
                <strong>Current Weather</strong> in {location}
            </div>
            <div className="widget-body">
                <div className="weather-temp">{temp}°F</div>
                <div className="weather-cond">{condition}</div>
            </div>
        </div>
    );
}
