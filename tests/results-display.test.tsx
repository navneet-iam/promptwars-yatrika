import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsDisplay from '../components/results-display';
import type { TripOutput } from '../lib/schemas';
import type { GroundingData } from '../lib/destination-source';

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

function makeItinerary(overrides: Partial<TripOutput> = {}): TripOutput {
  return {
    destinationSummary: 'A historic desert city.',
    tripStyleSummary: 'Tuned for history and architecture lovers.',
    days: [
      {
        dayNumber: 1,
        theme: 'Royal Heritage',
        morning: block('D1 Morning'),
        afternoon: block('D1 Afternoon'),
        evening: block('D1 Evening'),
      },
      {
        dayNumber: 2,
        theme: 'Markets & Craft',
        morning: block('D2 Morning'),
        afternoon: block('D2 Afternoon'),
        evening: block('D2 Evening'),
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
      {
        type: 'do',
        guideline: 'Remove shoes at shrines',
        explanation: 'A sign of respect.',
      },
    ],
    foodHighlights: [
      {
        dishName: 'Dal Baati',
        description: 'A regional staple.',
        culturalSignificance: 'Everyday communal meal.',
        whereToTry: 'Home-style eateries.',
      },
    ],
    localExperiences: [
      {
        title: 'Dussehra',
        type: 'festival',
        description: 'A seasonal celebration.',
        timing: 'Often around October.',
        note: 'Verify dates locally.',
      },
    ],
    storyModeNarrative: 'Imagine the scent of spices drifting through the lanes.',
    ...overrides,
  };
}

const grounding: GroundingData = {
  title: 'Jaipur',
  extract: 'Jaipur is the capital of Rajasthan.',
  url: 'https://en.wikipedia.org/wiki/Jaipur',
  source: 'wikipedia',
};

function makeData(itineraryOverrides: Partial<TripOutput> = {}) {
  return {
    itinerary: makeItinerary(itineraryOverrides),
    grounding,
    timestamp: '2026-07-04T00:00:00.000Z',
    modelUsed: 'gemini-2.5-flash',
  };
}

describe('ResultsDisplay', () => {
  it('renders all core sections from structured data', () => {
    render(<ResultsDisplay data={makeData()} />);

    expect(
      screen.getByRole('heading', { name: /Discovering Jaipur/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/scent of spices/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Day-by-Day Planner/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Hidden Gems/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Cultural Etiquette/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Culinary Delicacies/i }),
    ).toBeInTheDocument();
    // Metadata proves the render is data-driven.
    expect(screen.getByText('gemini-2.5-flash')).toBeInTheDocument();
  });

  it('renders one tab per day and shows the first day panel by default', () => {
    render(<ResultsDisplay data={makeData()} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');

    // The visible panel shows day-1 blocks (morning/afternoon/evening).
    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText('D1 Morning Spot')).toBeInTheDocument();
    expect(within(panel).getByText('D1 Afternoon Spot')).toBeInTheDocument();
    expect(within(panel).getByText('D1 Evening Spot')).toBeInTheDocument();
  });

  it('renders the seasonal experiences section when present', () => {
    render(<ResultsDisplay data={makeData()} />);
    expect(
      screen.getByRole('heading', {
        name: /Seasonal cultural experiences to look out for/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Dussehra')).toBeInTheDocument();
    // The safety disclaimer must be shown.
    expect(screen.getByText(/not a live event feed/i)).toBeInTheDocument();
  });

  it('omits the seasonal section entirely when there are no experiences', () => {
    render(<ResultsDisplay data={makeData({ localExperiences: [] })} />);
    expect(
      screen.queryByRole('heading', {
        name: /Seasonal cultural experiences to look out for/i,
      }),
    ).not.toBeInTheDocument();
  });
});
