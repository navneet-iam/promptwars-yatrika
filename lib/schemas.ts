import { z } from 'zod';
import {
  MIN_TRIP_DAYS,
  MAX_TRIP_DAYS,
  MAX_DESTINATION_LENGTH,
  MAX_OPTIONAL_TEXT_LENGTH,
} from './constants';

export const VALID_INTERESTS = [
  'history',
  'food',
  'architecture',
  'local-markets',
  'festivals-arts',
  'spirituality',
  'nature',
  'photography',
] as const;

export const VALID_BUDGET_STYLES = ['budget', 'moderate', 'premium'] as const;

export const VALID_TRAVEL_PACES = ['relaxed', 'balanced', 'packed'] as const;

export const VALID_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

// Derived union types — a single source of truth shared by the schema, the API,
// and the UI, so option lists can never drift out of sync.
export type Interest = (typeof VALID_INTERESTS)[number];
export type BudgetStyle = (typeof VALID_BUDGET_STYLES)[number];
export type TravelPace = (typeof VALID_TRAVEL_PACES)[number];
export type Month = (typeof VALID_MONTHS)[number];

export const TripInputSchema = z.object({
  destination: z
    .string()
    .trim()
    .min(1, { message: 'Destination is required' })
    .max(MAX_DESTINATION_LENGTH, {
      message: `Destination must be less than ${MAX_DESTINATION_LENGTH} characters`,
    }),
  days: z
    .number()
    .int({ message: 'Trip duration must be a whole number of days' })
    .min(MIN_TRIP_DAYS, { message: `Trip must be at least ${MIN_TRIP_DAYS} day` })
    .max(MAX_TRIP_DAYS, { message: `Trip must be at most ${MAX_TRIP_DAYS} days` }),
  interests: z
    .array(z.enum(VALID_INTERESTS))
    .min(1, { message: 'Select at least one interest' }),
  budgetStyle: z.enum(VALID_BUDGET_STYLES),
  travelPace: z.enum(VALID_TRAVEL_PACES),
  // Optional context so the guide can reason about seasonal experiences and festivals.
  travelMonth: z.enum(VALID_MONTHS).optional(),
  dietaryPreference: z.string().trim().max(MAX_OPTIONAL_TEXT_LENGTH).optional(),
  accessibilityNeeds: z.string().trim().max(MAX_OPTIONAL_TEXT_LENGTH).optional(),
  avoidTouristy: z.boolean().default(false),
});

export type TripInput = z.infer<typeof TripInputSchema>;

export const ItineraryBlockSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  culturalContext: z.string().min(1),
  whyRecommended: z.string().min(1),
  duration: z.string().min(1),
  practicalTip: z.string().min(1),
});

export type ItineraryBlock = z.infer<typeof ItineraryBlockSchema>;

export const DayPlanSchema = z.object({
  dayNumber: z.number(),
  theme: z.string().min(1),
  morning: ItineraryBlockSchema,
  afternoon: ItineraryBlockSchema,
  evening: ItineraryBlockSchema,
});

export type DayPlan = z.infer<typeof DayPlanSchema>;

export const HiddenGemSchema = z.object({
  name: z.string().min(1),
  whatItIs: z.string().min(1),
  whySpecial: z.string().min(1),
  whenToGo: z.string().min(1),
  whoItSuits: z.string().min(1),
});

export type HiddenGem = z.infer<typeof HiddenGemSchema>;

export const CulturalEtiquetteSchema = z.object({
  type: z.enum(['do', 'dont', 'custom']),
  guideline: z.string().min(1),
  explanation: z.string().min(1),
});

export type CulturalEtiquette = z.infer<typeof CulturalEtiquetteSchema>;

export const FoodHighlightSchema = z.object({
  dishName: z.string().min(1),
  description: z.string().min(1),
  culturalSignificance: z.string().min(1),
  whereToTry: z.string().min(1),
});

export type FoodHighlight = z.infer<typeof FoodHighlightSchema>;

// Seasonal / cultural experiences to "look out for" — deliberately framed as
// AI-suggested cultural context, never as a live, bookable event feed.
export const LocalExperienceSchema = z.object({
  title: z.string().min(1),
  // Kept as a lenient string (not a strict enum) so an unexpected category from
  // the model can never fail validation of the whole itinerary. The UI maps
  // known categories to icons and falls back gracefully for anything else.
  type: z.string().min(1),
  description: z.string().min(1),
  timing: z.string().min(1),
  note: z.string().min(1),
});

export type LocalExperience = z.infer<typeof LocalExperienceSchema>;

export const TripOutputSchema = z.object({
  destinationSummary: z.string().min(1),
  tripStyleSummary: z.string().min(1),
  days: z.array(DayPlanSchema).min(1),
  hiddenGems: z.array(HiddenGemSchema).min(1).max(5),
  culturalEtiquette: z.array(CulturalEtiquetteSchema).min(1),
  foodHighlights: z.array(FoodHighlightSchema).min(1),
  // Optional enrichment. `.catch([])` guarantees a malformed or missing value
  // degrades to an empty list instead of failing the entire generation, so this
  // section can never break the core trip-planning flow.
  localExperiences: z.array(LocalExperienceSchema).catch([]),
  storyModeNarrative: z.string().min(1),
});

export type TripOutput = z.infer<typeof TripOutputSchema>;

/** Concise destination context retrieved from Wikipedia (or a graceful fallback). */
export interface GroundingData {
  title: string;
  extract: string;
  url: string;
  source: 'wikipedia' | 'fallback';
}

/** The full payload returned by the generation API and rendered by the UI. */
export interface GenerationResult {
  itinerary: TripOutput;
  grounding: GroundingData;
  timestamp: string;
  modelUsed: string;
}
