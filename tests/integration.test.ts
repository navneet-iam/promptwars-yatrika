import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orchestrateTripPlan } from '../lib/planner';
import * as llm from '../lib/llm';
import * as groundingSource from '../lib/destination-source';

vi.mock('../lib/llm', () => ({
  generateTripPlan: vi.fn(),
}));

vi.mock('../lib/destination-source', () => ({
  fetchDestinationGrounding: vi.fn(),
}));

describe('Orchestration Layer Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validFormInput = {
    destination: 'Kyoto',
    days: 1,
    interests: ['history'],
    budgetStyle: 'moderate',
    travelPace: 'balanced',
  };

  const mockGroundingData: groundingSource.GroundingData = {
    title: 'Kyoto',
    extract: 'Kyoto is the former imperial capital of Japan.',
    url: 'https://en.wikipedia.org/wiki/Kyoto',
    source: 'wikipedia',
  };

  const mockItineraryResult = {
    destinationSummary: 'Kyoto is an ancient city known for its thousands of classical Buddhist temples.',
    tripStyleSummary: 'Customized history-focused tour of Kyoto.',
    days: [
      {
        dayNumber: 1,
        theme: 'Historical temples tour',
        morning: {
          title: 'Kinkaku-ji temple visit',
          description: 'Explore the golden pavilion.',
          culturalContext: 'A Zen Buddhist temple built in the late 14th century.',
          whyRecommended: 'Fits the historical interests.',
          duration: '2 hours',
          practicalTip: 'Go early to avoid queues.',
        },
        afternoon: {
          title: 'Ryoan-ji rock garden',
          description: 'Meditate by the famous rock gardens.',
          culturalContext: 'A key example of Zen design.',
          whyRecommended: 'Near Kinkaku-ji.',
          duration: '1.5 hours',
          practicalTip: 'Avoid stepping on the gravel.',
        },
        evening: {
          title: 'Gion district stroll',
          description: 'Walk through historical wooden streets.',
          culturalContext: 'Kyoto\'s traditional geisha district.',
          whyRecommended: 'Beautiful evening lighting.',
          duration: '2 hours',
          practicalTip: 'Do not approach working geishas.',
        },
      },
    ],
    hiddenGems: [
      {
        name: 'Gio-ji Temple',
        whatItIs: 'A small, quiet temple in Arashiyama.',
        whySpecial: 'Famous for its lush moss garden.',
        whenToGo: 'Mid-afternoon.',
        whoItSuits: 'Slow travelers.',
      },
    ],
    culturalEtiquette: [
      {
        type: 'do' as const,
        guideline: 'Remove shoes when entering temple interiors',
        explanation: 'Maintains cleanliness and sacred spaces.',
      },
    ],
    foodHighlights: [
      {
        dishName: 'Yudofu (Simmered Tofu)',
        description: 'Tofu simmered in a light broth.',
        culturalSignificance: 'Traditional Shojin ryori (Buddhist vegetarian cuisine).',
        whereToTry: 'Specialized restaurants near temples.',
      },
    ],
    localExperiences: [
      {
        title: 'Gion Matsuri',
        type: 'festival',
        description: 'A major traditional summer festival with grand processions.',
        timing: 'Typically throughout July — verify exact dates locally.',
        note: 'Crowds are large; plan viewing spots ahead.',
      },
    ],
    storyModeNarrative: 'Imagine the scent of moss and cedar welcoming you as the garden mist sets...',
  };

  it('should successfully orchestrate grounding retrieval and AI generation', async () => {
    vi.mocked(groundingSource.fetchDestinationGrounding).mockResolvedValue(mockGroundingData);
    vi.mocked(llm.generateTripPlan).mockResolvedValue(mockItineraryResult);

    const result = await orchestrateTripPlan(validFormInput);

    expect(result.itinerary).toEqual(mockItineraryResult);
    expect(result.grounding).toEqual(mockGroundingData);
    expect(result.modelUsed).toBe('gemini-2.5-flash');
    expect(result.timestamp).toBeDefined();

    expect(groundingSource.fetchDestinationGrounding).toHaveBeenCalledWith('Kyoto');
    expect(llm.generateTripPlan).toHaveBeenCalledWith(
      expect.objectContaining({ destination: 'Kyoto' }),
      mockGroundingData
    );
  });

  it('should propagate validation errors without calling external APIs', async () => {
    const invalidFormInput = {
      destination: '', // Invalid
      days: 3,
      interests: [], // Invalid
    };

    await expect(orchestrateTripPlan(invalidFormInput)).rejects.toThrow(
      /Invalid inputs:/
    );

    expect(groundingSource.fetchDestinationGrounding).not.toHaveBeenCalled();
    expect(llm.generateTripPlan).not.toHaveBeenCalled();
  });
});
