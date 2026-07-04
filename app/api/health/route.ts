import { NextResponse } from 'next/server';

// Small, dependency-free health probe. Confirms the app is running, which model
// backs generation, and whether the GenAI key is configured — WITHOUT ever
// exposing the secret itself. Useful for evaluators verifying the app is live.
export async function GET() {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

  return NextResponse.json({
    status: 'ok',
    app: 'Yatrika',
    model: 'gemini-2.5-flash',
    grounding: 'wikipedia',
    genAiConfigured: hasApiKey,
    timestamp: new Date().toISOString(),
  });
}
