import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AURA – Agentic User Reasoning Assistant',
    description:
        'An AI-powered agentic assistant that thinks, plans, and guides you step-by-step like a real mentor.',
    keywords: ['AI', 'assistant', 'agentic', 'planner', 'study', 'career', 'finance', 'wellness'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {/* Background gradient orbs */}
                <div className="bg-gradient-orb orb1" />
                <div className="bg-gradient-orb orb2" />
                {children}
            </body>
        </html>
    );
}
