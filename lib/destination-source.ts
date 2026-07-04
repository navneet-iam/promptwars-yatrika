import { GroundingError } from './errors';

export interface GroundingData {
  title: string;
  extract: string;
  url: string;
  source: 'wikipedia' | 'fallback';
}

export async function fetchDestinationGrounding(destination: string): Promise<GroundingData> {
  if (!destination || destination.trim() === '') {
    throw new GroundingError('Destination parameter is empty');
  }

  try {
    // 1. Search for matching page using Wikipedia OpenSearch API
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      destination.trim()
    )}&limit=1&namespace=0&format=json&origin=*`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CultureTrail-Agentic-App/1.0 (contact@culturetrail.app)',
      },
    });

    if (!searchResponse.ok) {
      throw new Error(`Wikipedia search failed with status ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const titles = searchData[1] || [];
    const urls = searchData[3] || [];

    if (titles.length === 0 || !titles[0]) {
      return {
        title: destination,
        extract: 'Grounding data unavailable. Proceeding with general cultural knowledge.',
        url: '',
        source: 'fallback',
      };
    }

    const matchedTitle = titles[0];
    const pageUrl = urls[0] || '';

    // 2. Fetch page summary extract
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      matchedTitle.replace(/ /g, '_')
    )}`;

    const summaryResponse = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'CultureTrail-Agentic-App/1.0 (contact@culturetrail.app)',
      },
    });

    if (!summaryResponse.ok) {
      // Fallback if summary endpoint fails but search worked
      return {
        title: matchedTitle,
        extract: `Information about ${matchedTitle} is present but detailed extract could not be retrieved.`,
        url: pageUrl,
        source: 'wikipedia',
      };
    }

    const summaryData = await summaryResponse.json();
    return {
      title: summaryData.title || matchedTitle,
      extract: summaryData.extract || 'No extract content found.',
      url: pageUrl,
      source: 'wikipedia',
    };
  } catch (error) {
    console.error('Wikipedia grounding lookup failed:', error);
    // Graceful fallback to avoid stopping generation
    return {
      title: destination,
      extract: 'Grounding data lookup failed due to network or API issues. Proceeding with fallback model knowledge.',
      url: '',
      source: 'fallback',
    };
  }
}
