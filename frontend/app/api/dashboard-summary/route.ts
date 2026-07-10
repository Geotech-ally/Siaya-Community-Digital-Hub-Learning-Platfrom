import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function getJson(path: string, authHeader?: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const [platform, trainer] = await Promise.all([
      getJson('/analytics/platform', authHeader),
      getJson('/analytics/trainer', authHeader),
    ]);

    return NextResponse.json({ platform, trainer });
  } catch {
    return NextResponse.json({ platform: null, trainer: null }, { status: 500 });
  }
}
