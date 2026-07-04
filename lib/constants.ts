/**
 * Central configuration constants.
 *
 * Keeping tunable values (model, cache lifetimes, limits, bounds) in one place
 * avoids "magic numbers" scattered across modules and gives a single, obvious
 * knob for each behaviour.
 */

/** Gemini model that powers itinerary generation. */
export const MODEL_NAME = 'gemini-2.5-flash';

/** Low temperature favours factual coherence over creative embellishment. */
export const GEMINI_TEMPERATURE = 0.2;

/** How many times to attempt generation before surfacing an error. */
export const GEMINI_MAX_ATTEMPTS = 2;

/** Grounding source. */
export const WIKIPEDIA_USER_AGENT =
  'Yatrika-Cultural-Travel-App/1.0 (https://github.com/; travel-companion)';

/** Cache lifetimes (milliseconds). */
export const GROUNDING_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
export const RESPONSE_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

/** Anti-abuse rate limit for the generation endpoint. */
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

/** Input bounds (shared by validation and UI). */
export const MIN_TRIP_DAYS = 1;
export const MAX_TRIP_DAYS = 10;
export const MAX_DESTINATION_LENGTH = 100;
export const MAX_OPTIONAL_TEXT_LENGTH = 100;
