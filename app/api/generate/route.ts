import { NextRequest, NextResponse } from 'next/server';
import { orchestrateTripPlan } from '@/lib/planner';
import { AppError } from '@/lib/errors';
import { rateLimit, clientKeyFromHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Lightweight anti-abuse guard: cap generations per client per minute.
  const key = clientKeyFromHeaders(request.headers);
  const limit = rateLimit(`generate:${key}`);
  if (!limit.allowed) {
    const retryAfterSec = limit.retryAt
      ? Math.max(1, Math.ceil((limit.retryAt - Date.now()) / 1000))
      : 60;
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait a moment before generating another guide.',
        code: 'RATE_LIMITED',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      }
    );
  }

  try {
    const body = await request.json();
    const result = await orchestrateTripPlan(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('API Generation failure:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    // Generic error fallback to hide internal stack trace leaks
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during trip planning. Please try again.',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
