import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { POST } from '../app/api/generate/route';
import * as planner from '../lib/planner';
import { resetRateLimit } from '../lib/rate-limit';
import { ValidationError } from '../lib/errors';

vi.mock('../lib/planner', () => ({ orchestrateTripPlan: vi.fn() }));

function makeReq(
  body: unknown,
  headers: Record<string, string> = { 'x-forwarded-for': '9.9.9.9' },
): NextRequest {
  return {
    headers: new Headers(headers),
    json: async () => body,
  } as unknown as NextRequest;
}

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit();
  });

  it('returns 200 with the planner result on success', async () => {
    vi.mocked(planner.orchestrateTripPlan).mockResolvedValue({
      itinerary: {} as never,
      grounding: {} as never,
      timestamp: 't',
      modelUsed: 'gemini-2.5-flash',
    });

    const res = await POST(makeReq({ destination: 'Rome' }));
    expect(res.status).toBe(200);
    expect((await res.json()).modelUsed).toBe('gemini-2.5-flash');
  });

  it('maps a validation AppError to its 400 status and code', async () => {
    vi.mocked(planner.orchestrateTripPlan).mockRejectedValue(
      new ValidationError('Invalid inputs: destination: Destination is required'),
    );

    const res = await POST(makeReq({}, { 'x-forwarded-for': '8.8.8.8' }));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('VALIDATION_ERROR');
  });

  it('returns a generic 500 for unexpected errors without leaking internals', async () => {
    vi.mocked(planner.orchestrateTripPlan).mockRejectedValue(
      new Error('secret-db-connection-string'),
    );

    const res = await POST(makeReq({}, { 'x-forwarded-for': '7.7.7.7' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.code).toBe('INTERNAL_SERVER_ERROR');
    expect(JSON.stringify(json)).not.toContain('secret-db-connection-string');
  });

  it('rate-limits a client after the per-window cap (429)', async () => {
    vi.mocked(planner.orchestrateTripPlan).mockResolvedValue({
      itinerary: {} as never,
      grounding: {} as never,
      timestamp: 't',
      modelUsed: 'gemini-2.5-flash',
    });

    const ip = { 'x-forwarded-for': '5.5.5.5' };
    let last = await POST(makeReq({ destination: 'Rome' }, ip));
    for (let i = 0; i < 20; i++) {
      last = await POST(makeReq({ destination: 'Rome' }, ip));
    }

    expect(last.status).toBe(429);
    const json = await last.json();
    expect(json.code).toBe('RATE_LIMITED');
    expect(last.headers.get('Retry-After')).toBeTruthy();
  });
});
