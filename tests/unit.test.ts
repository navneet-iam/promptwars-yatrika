import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripInputSchema } from '../lib/schemas';
import {
  fetchDestinationGrounding,
  clearGroundingCache,
} from '../lib/destination-source';

describe('TripInputSchema Validation', () => {
  it('should validate complete, valid input', () => {
    const validData = {
      destination: 'Kyoto',
      days: 3,
      interests: ['history', 'food'],
      budgetStyle: 'moderate',
      travelPace: 'balanced',
      dietaryPreference: 'None',
      accessibilityNeeds: '',
      avoidTouristy: false,
    };

    const parsed = TripInputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('should fail validation when destination is empty', () => {
    const invalidData = {
      destination: '   ',
      days: 3,
      interests: ['history'],
      budgetStyle: 'moderate',
      travelPace: 'balanced',
    };

    const parsed = TripInputSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe('Destination is required');
    }
  });

  it('should fail validation when days exceed maximum bounds', () => {
    const invalidData = {
      destination: 'Kyoto',
      days: 15, // Max is 10
      interests: ['food'],
      budgetStyle: 'moderate',
      travelPace: 'balanced',
    };

    const parsed = TripInputSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe('Trip must be at most 10 days');
    }
  });

  it('should fail validation when no interests are selected', () => {
    const invalidData = {
      destination: 'Kyoto',
      days: 3,
      interests: [], // Min is 1
      budgetStyle: 'moderate',
      travelPace: 'balanced',
    };

    const parsed = TripInputSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe('Select at least one interest');
    }
  });
});

describe('fetchDestinationGrounding (Wikipedia Grounding Layer)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearGroundingCache();
  });

  it('should extract correct page summary on successful Wikipedia retrieval', async () => {
    const mockOpenSearchResponse = [
      'Jaipur',
      ['Jaipur'],
      ['Jaipur is the capital of India\'s Rajasthan state.'],
      ['https://en.wikipedia.org/wiki/Jaipur'],
    ];

    const mockSummaryResponse = {
      title: 'Jaipur',
      extract: 'Jaipur is the capital and largest city of the Indian state of Rajasthan.',
    };

    // Mock fetch twice: first for search, second for summary
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenSearchResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummaryResponse,
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await fetchDestinationGrounding('Jaipur');
    expect(result.source).toBe('wikipedia');
    expect(result.title).toBe('Jaipur');
    expect(result.extract).toBe(mockSummaryResponse.extract);
    expect(result.url).toBe('https://en.wikipedia.org/wiki/Jaipur');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should fall back gracefully if Wikipedia returns no search results', async () => {
    const mockOpenSearchResponse = ['NonExistentCityQuery123', [], [], []];

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenSearchResponse,
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await fetchDestinationGrounding('NonExistentCityQuery123');
    expect(result.source).toBe('fallback');
    expect(result.extract).toContain('Grounding data unavailable');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should fall back gracefully on network or request failure', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('Network error'));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await fetchDestinationGrounding('London');
    expect(result.source).toBe('fallback');
    expect(result.extract).toContain('Grounding data lookup failed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
