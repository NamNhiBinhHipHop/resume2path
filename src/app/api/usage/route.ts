export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    // Demo mode: Return mock usage data
    console.log('Demo mode: Returning mock usage data for email:', email);
    return NextResponse.json({ used: 0, remaining: 5, limit: 5 });
  } catch (e) {
    console.error('Usage error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
