import { NextRequest, NextResponse } from 'next/server';
import { orchestrateTripPlan } from '@/lib/planner';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await orchestrateTripPlan(body);
    return NextResponse.json(result);
  } catch (error: any) {
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
