import { describe, it, expect } from 'vitest';
import { TripInputSchema, TripOutputSchema } from '../lib/schemas';

// A minimal, valid AI output used as a base for parsing tests.
function validOutput() {
  return {
    destinationSummary: 'A historic city.',
    tripStyleSummary: 'Tuned for history lovers.',
    days: [
      {
        dayNumber: 1,
        theme: 'Old town',
        morning: {
          title: 'Fort',
          description: 'Walk the ramparts.',
          culturalContext: 'Built in the 16th century.',
          whyRecommended: 'Matches your history interest.',
          duration: '2 hours',
          practicalTip: 'Wear comfortable shoes.',
        },
        afternoon: {
          title: 'Museum',
          description: 'See local artifacts.',
          culturalContext: 'Regional heritage collection.',
          whyRecommended: 'Indoor and relaxed.',
          duration: '1.5 hours',
          practicalTip: 'Photography may be restricted.',
        },
        evening: {
          title: 'Bazaar',
          description: 'Stroll the lanes.',
          culturalContext: 'A centuries-old trading street.',
          whyRecommended: 'Great for evening ambience.',
          duration: '2 hours',
          practicalTip: 'Bargain respectfully.',
        },
      },
    ],
    hiddenGems: [
      {
        name: 'Quiet stepwell',
        whatItIs: 'A small historic water structure.',
        whySpecial: 'Rarely visited by tourists.',
        whenToGo: 'Early morning.',
        whoItSuits: 'Slow travelers.',
      },
    ],
    culturalEtiquette: [
      {
        type: 'do' as const,
        guideline: 'Remove shoes before entering shrines',
        explanation: 'A sign of respect.',
      },
    ],
    foodHighlights: [
      {
        dishName: 'Local thali',
        description: 'A platter of regional dishes.',
        culturalSignificance: 'Everyday communal meal.',
        whereToTry: 'Home-style eateries.',
      },
    ],
    localExperiences: [
      {
        title: 'Harvest festival',
        type: 'festival',
        description: 'A seasonal community celebration.',
        timing: 'Often around October — verify locally.',
        note: 'Dates shift with the lunar calendar.',
      },
    ],
    storyModeNarrative: 'Imagine the scent of spices drifting through the lanes...',
  };
}

describe('TripOutputSchema', () => {
  it('parses a complete, valid AI output', () => {
    const parsed = TripOutputSchema.safeParse(validOutput());
    expect(parsed.success).toBe(true);
  });

  it('defaults localExperiences to an empty array when the field is absent', () => {
    const output = validOutput();
    // Simulate the model omitting the optional enrichment field entirely.
    delete (output as Record<string, unknown>).localExperiences;

    const parsed = TripOutputSchema.parse(output);
    expect(parsed.localExperiences).toEqual([]);
  });

  it('degrades a malformed localExperiences to an empty array instead of failing', () => {
    const output = validOutput();
    // A single malformed item must not break the whole itinerary.
    (output as Record<string, unknown>).localExperiences = [
      { title: 'Missing required fields' },
    ];

    const parsed = TripOutputSchema.parse(output);
    expect(parsed.localExperiences).toEqual([]);
    // The rest of the itinerary is still intact.
    expect(parsed.days).toHaveLength(1);
  });

  it('rejects output missing a required field', () => {
    const output = validOutput();
    delete (output as Record<string, unknown>).storyModeNarrative;

    const parsed = TripOutputSchema.safeParse(output);
    expect(parsed.success).toBe(false);
  });

  it('rejects an itinerary with no days', () => {
    const output = validOutput();
    output.days = [];

    const parsed = TripOutputSchema.safeParse(output);
    expect(parsed.success).toBe(false);
  });
});

describe('TripInputSchema travelMonth', () => {
  const base = {
    destination: 'Jaipur',
    days: 3,
    interests: ['history'],
    budgetStyle: 'moderate',
    travelPace: 'balanced',
  };

  it('accepts a valid month', () => {
    const parsed = TripInputSchema.safeParse({ ...base, travelMonth: 'October' });
    expect(parsed.success).toBe(true);
  });

  it('accepts input without a month (optional)', () => {
    const parsed = TripInputSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid month value', () => {
    const parsed = TripInputSchema.safeParse({ ...base, travelMonth: 'Smarch' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a non-integer day count', () => {
    const parsed = TripInputSchema.safeParse({ ...base, days: 2.5 });
    expect(parsed.success).toBe(false);
  });
});
