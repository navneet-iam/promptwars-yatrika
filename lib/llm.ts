import { GoogleGenAI } from '@google/genai';
import { GroundingData, TripInput, TripOutput, TripOutputSchema } from './schemas';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import { LLMError } from './errors';
import { GEMINI_MAX_ATTEMPTS, GEMINI_TEMPERATURE, MODEL_NAME } from './constants';

// Initialize the GoogleGenAI client with the server-side API Key.
// Fall back to empty string so initialization doesn't throw at start-up if the
// key is only present at request time.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
});

// We keep two complementary representations of the output shape, each serving a
// distinct purpose:
//   1. `geminiResponseSchema` below — the Gemini-native schema (uppercase Type
//      strings) that *constrains generation*.
//   2. `TripOutputSchema` (Zod) — which *validates* the model's response at
//      runtime before we trust it.
// The morning/afternoon/evening blocks share one shape, defined once here and
// reused for all three time slots.
const itineraryBlockSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    description: { type: 'STRING' },
    culturalContext: { type: 'STRING' },
    whyRecommended: { type: 'STRING' },
    duration: { type: 'STRING' },
    practicalTip: { type: 'STRING' },
  },
  required: ['title', 'description', 'culturalContext', 'whyRecommended', 'duration', 'practicalTip'],
};

const geminiResponseSchema = {
  type: 'OBJECT',
  properties: {
    destinationSummary: { type: 'STRING' },
    tripStyleSummary: { type: 'STRING' },
    days: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          dayNumber: { type: 'INTEGER' },
          theme: { type: 'STRING' },
          morning: itineraryBlockSchema,
          afternoon: itineraryBlockSchema,
          evening: itineraryBlockSchema,
        },
        required: ['dayNumber', 'theme', 'morning', 'afternoon', 'evening'],
      },
    },
    hiddenGems: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          whatItIs: { type: 'STRING' },
          whySpecial: { type: 'STRING' },
          whenToGo: { type: 'STRING' },
          whoItSuits: { type: 'STRING' },
        },
        required: ['name', 'whatItIs', 'whySpecial', 'whenToGo', 'whoItSuits'],
      },
    },
    culturalEtiquette: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING', enum: ['do', 'dont', 'custom'] },
          guideline: { type: 'STRING' },
          explanation: { type: 'STRING' },
        },
        required: ['type', 'guideline', 'explanation'],
      },
    },
    foodHighlights: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          dishName: { type: 'STRING' },
          description: { type: 'STRING' },
          culturalSignificance: { type: 'STRING' },
          whereToTry: { type: 'STRING' },
        },
        required: ['dishName', 'description', 'culturalSignificance', 'whereToTry'],
      },
    },
    localExperiences: {
      type: 'ARRAY',
      description:
        'Seasonal/cultural experiences to look out for. Framed as typical patterns to verify locally, never a live event feed. May be empty.',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          type: {
            type: 'STRING',
            description: 'One of: festival, market, performance, workshop, seasonal, ritual, other.',
          },
          description: { type: 'STRING' },
          timing: { type: 'STRING' },
          note: { type: 'STRING' },
        },
        required: ['title', 'type', 'description', 'timing', 'note'],
      },
    },
    storyModeNarrative: { type: 'STRING' },
  },
  // localExperiences is intentionally omitted from `required`: it is an optional
  // enrichment and its absence must never fail the core itinerary generation.
  required: [
    'destinationSummary',
    'tripStyleSummary',
    'days',
    'hiddenGems',
    'culturalEtiquette',
    'foodHighlights',
    'storyModeNarrative',
  ],
};

export async function generateTripPlan(
  input: TripInput,
  grounding: GroundingData
): Promise<TripOutput> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new LLMError('GEMINI_API_KEY is not configured in the server environment.');
  }

  const systemInstruction = buildSystemPrompt();
  const prompt = buildUserPrompt(input, grounding);

  let attempts = GEMINI_MAX_ATTEMPTS;
  let lastError: Error | null = null;

  while (attempts > 0) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema,
          temperature: GEMINI_TEMPERATURE,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Received empty text response from Gemini API.');
      }

      // Parse JSON response
      const parsedData = JSON.parse(responseText);

      // Validate JSON response against our schema using Zod
      const validatedData = TripOutputSchema.parse(parsedData);
      return validatedData;
    } catch (error: unknown) {
      console.warn(`Gemini generation attempt failed (${attempts} attempts left):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      attempts--;
    }
  }

  throw new LLMError(
    `Failed to generate a valid structured itinerary: ${lastError?.message || 'Unknown error'}`
  );
}
