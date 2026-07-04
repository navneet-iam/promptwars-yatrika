import { describe, it, expect } from 'vitest';
import { formatItineraryAsText } from '../lib/format-itinerary';
import type { GenerationResult } from '../lib/schemas';

function block(prefix: string) {
  return {
    title: `${prefix} Spot`,
    description: `${prefix} description.`,
    culturalContext: `${prefix} context.`,
    whyRecommended: `${prefix} reason.`,
    duration: '2 hours',
    practicalTip: `${prefix} tip.`,
  };
}

const data: GenerationResult = {
  itinerary: {
    destinationSummary: 'A historic city.',
    tripStyleSummary: 'For history lovers.',
    days: [
      {
        dayNumber: 1,
        theme: 'Old Town',
        morning: block('Morning'),
        afternoon: block('Afternoon'),
        evening: block('Evening'),
      },
    ],
    hiddenGems: [
      {
        name: 'Quiet Stepwell',
        whatItIs: 'A historic water structure.',
        whySpecial: 'Rarely visited.',
        whenToGo: 'Early morning.',
        whoItSuits: 'Slow travelers.',
      },
    ],
    culturalEtiquette: [
      { type: 'do', guideline: 'Remove shoes', explanation: 'Respect.' },
    ],
    foodHighlights: [
      {
        dishName: 'Local Thali',
        description: 'A platter.',
        culturalSignificance: 'Communal meal.',
        whereToTry: 'Home-style eateries.',
      },
    ],
    localExperiences: [
      {
        title: 'Harvest Festival',
        type: 'festival',
        description: 'A seasonal celebration.',
        timing: 'Often around October.',
        note: 'Verify locally.',
      },
    ],
    storyModeNarrative: 'Imagine the scent of spices.',
  },
  grounding: {
    title: 'Jaipur',
    extract: 'Capital of Rajasthan.',
    url: 'https://en.wikipedia.org/wiki/Jaipur',
    source: 'wikipedia',
  },
  timestamp: '2026-07-04T00:00:00.000Z',
  modelUsed: 'gemini-2.5-flash',
};

describe('formatItineraryAsText', () => {
  it('includes the destination, all day blocks, and every section', () => {
    const text = formatItineraryAsText(data);

    expect(text).toContain('YATRIKA CULTURAL ITINERARY: JAIPUR');
    expect(text).toContain('DAY 1: Old Town');
    expect(text).toContain('Morning: Morning Spot (2 hours)');
    expect(text).toContain('Afternoon: Afternoon Spot');
    expect(text).toContain('Evening: Evening Spot');
    expect(text).toContain('AUTHENTIC LOCAL EXPERIENCE SUGGESTIONS');
    expect(text).toContain('SEASONAL CULTURAL EXPERIENCES TO LOOK OUT FOR');
    expect(text).toContain('Harvest Festival [festival]');
    expect(text).toContain('LOCAL CULTURAL ETIQUETTE & GUIDANCE');
    expect(text).toContain('TRADITIONAL FOOD & CULINARY HIGHLIGHTS');
    expect(text).toContain('Generated with Yatrika (gemini-2.5-flash)');
  });

  it('omits the seasonal section when there are no local experiences', () => {
    const text = formatItineraryAsText({
      ...data,
      itinerary: { ...data.itinerary, localExperiences: [] },
    });

    expect(text).not.toContain('SEASONAL CULTURAL EXPERIENCES');
    // Other sections remain intact.
    expect(text).toContain('DAY 1: Old Town');
  });
});
