import { fetchDestinationGrounding, GroundingData } from './destination-source';
import { generateTripPlan } from './llm';
import { TripInputSchema, TripOutput } from './schemas';
import { ValidationError } from './errors';

export interface PlannerResult {
  itinerary: TripOutput;
  grounding: GroundingData;
  timestamp: string;
  modelUsed: string;
}

export async function orchestrateTripPlan(rawInput: unknown): Promise<PlannerResult> {
  // 1. Validate form input using Zod
  const validationResult = TripInputSchema.safeParse(rawInput);
  if (!validationResult.success) {
    const errorMsg = validationResult.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new ValidationError(`Invalid inputs: ${errorMsg}`);
  }

  const input = validationResult.data;

  // 2. Fetch Wikipedia grounding data
  const grounding = await fetchDestinationGrounding(input.destination);

  // 3. Generate personalized, structured itinerary from Gemini
  const itinerary = await generateTripPlan(input, grounding);

  // 4. Return results with dynamic metadata
  return {
    itinerary,
    grounding,
    timestamp: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
  };
}
