import { NextRequest, NextResponse } from 'next/server';
import { getActivePlan } from '@/lib/agents/memory';

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const plan = await getActivePlan(sessionId);

    return NextResponse.json({ plan });
}
