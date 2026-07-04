import { fetchDestinationGrounding, GroundingData } from './destination-source';
import { generateTripPlan } from './llm';
import { TripInput, TripInputSchema, TripOutput } from './schemas';
import { ValidationError } from './errors';
import { TtlCache } from './ttl-cache';

export interface PlannerResult {
  itinerary: TripOutput;
  grounding: GroundingData;
  timestamp: string;
  modelUsed: string;
}

const MODEL_NAME = 'gemini-2.5-flash';

// Cache the expensive part of a generation (grounding + itinerary) keyed by the
// normalized request. An identical repeat submission then skips BOTH the
// Wikipedia lookup and the Gemini call. The timestamp is always regenerated so
// the on-page audit log still reflects the actual query time.
const RESPONSE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const responseCache = new TtlCache<{ itinerary: TripOutput; grounding: GroundingData }>(
  RESPONSE_TTL_MS,
);

/** Order-independent, canonical cache key for a validated trip request. */
function requestKey(input: TripInput): string {
  return JSON.stringify({
    destination: input.destination.trim().toLowerCase(),
    days: input.days,
    interests: [...input.interests].sort(),
    budgetStyle: input.budgetStyle,
    travelPace: input.travelPace,
    travelMonth: input.travelMonth ?? null,
    dietaryPreference: input.dietaryPreference?.trim().toLowerCase() ?? null,
    accessibilityNeeds: input.accessibilityNeeds?.trim().toLowerCase() ?? null,
    avoidTouristy: input.avoidTouristy,
  });
}

/** Clears the response cache. Exposed for deterministic testing. */
export function clearResponseCache(): void {
  responseCache.clear();
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
  const key = requestKey(input);

  // 2. Serve identical repeat requests from cache (fresh timestamp each time).
  const cached = responseCache.get(key);
  if (cached) {
    return {
      ...cached,
      timestamp: new Date().toISOString(),
      modelUsed: MODEL_NAME,
    };
  }

  // 3. Fetch Wikipedia grounding data (itself cached per destination).
  const grounding = await fetchDestinationGrounding(input.destination);

  // 4. Generate personalized, structured itinerary from Gemini.
  const itinerary = await generateTripPlan(input, grounding);

  responseCache.set(key, { itinerary, grounding });

  // 5. Return results with dynamic metadata.
  return {
    itinerary,
    grounding,
    timestamp: new Date().toISOString(),
    modelUsed: MODEL_NAME,
  };
}
