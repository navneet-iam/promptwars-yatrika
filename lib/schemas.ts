import { z } from 'zod';

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

export const TripInputSchema = z.object({
  destination: z
    .string()
    .trim()
    .min(1, { message: 'Destination is required' })
    .max(100, { message: 'Destination must be less than 100 characters' }),
  days: z
    .number()
    .int({ message: 'Trip duration must be a whole number of days' })
    .min(1, { message: 'Trip must be at least 1 day' })
    .max(10, { message: 'Trip must be at most 10 days' }),
  interests: z
    .array(z.enum(VALID_INTERESTS))
    .min(1, { message: 'Select at least one interest' }),
  budgetStyle: z.enum(['budget', 'moderate', 'premium']),
  travelPace: z.enum(['relaxed', 'balanced', 'packed']),
  // Optional context so the guide can reason about seasonal experiences and festivals.
  travelMonth: z.enum(VALID_MONTHS).optional(),
  dietaryPreference: z.string().trim().max(100).optional(),
  accessibilityNeeds: z.string().trim().max(100).optional(),
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

export const HiddenGemSchema = z.object({
  name: z.string().min(1),
  whatItIs: z.string().min(1),
  whySpecial: z.string().min(1),
  whenToGo: z.string().min(1),
  whoItSuits: z.string().min(1),
});

export const CulturalEtiquetteSchema = z.object({
  type: z.enum(['do', 'dont', 'custom']),
  guideline: z.string().min(1),
  explanation: z.string().min(1),
});

export const FoodHighlightSchema = z.object({
  dishName: z.string().min(1),
  description: z.string().min(1),
  culturalSignificance: z.string().min(1),
  whereToTry: z.string().min(1),
});

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
