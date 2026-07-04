import { GoogleGenAI } from '@google/genai';
import { TripInput, TripOutput, TripOutputSchema } from './schemas';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import { GroundingData } from './destination-source';
import { LLMError } from './errors';

// Initialize the GoogleGenAI client with the server-side API Key
// Fall back to empty string so initialization doesn't throw at start-up if key is set at request-time
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
});

// JSON Schema defined in Gemini API format (uppercase Type strings)
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
          morning: {
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
          },
          afternoon: {
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
          },
          evening: {
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
          },
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
    storyModeNarrative: { type: 'STRING' },
  },
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

  // Use the recommended general model 'gemini-2.5-flash'
  const modelName = 'gemini-2.5-flash';
  const systemInstruction = buildSystemPrompt();
  const prompt = buildUserPrompt(input, grounding);

  let attempts = 2;
  let lastError: Error | null = null;

  while (attempts > 0) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema as any,
          temperature: 0.2, // Lower temperature to prevent creative hallucinating of factual data
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
    } catch (error: any) {
      console.warn(`Gemini generation attempt failed (${attempts} attempts left):`, error);
      lastError = error;
      attempts--;
    }
  }

  throw new LLMError(
    `Failed to generate a valid structured itinerary: ${lastError?.message || 'Unknown error'}`
  );
}
