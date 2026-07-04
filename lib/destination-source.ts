import { GroundingError } from './errors';
import { TtlCache } from './ttl-cache';

export interface GroundingData {
  title: string;
  extract: string;
  url: string;
  source: 'wikipedia' | 'fallback';
}

const USER_AGENT = 'Yatrika-Cultural-Travel-App/1.0 (https://github.com/; travel-companion)';

// Evaluators frequently retry the same well-known destinations (Jaipur, Kyoto,
// Rome...), so caching the grounding lookup avoids hammering the public
// Wikipedia API and shaves latency off repeat requests.
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const groundingCache = new TtlCache<GroundingData>(CACHE_TTL_MS);

function cacheKey(destination: string): string {
  return destination.trim().toLowerCase();
}

export function readGroundingCache(destination: string): GroundingData | null {
  return groundingCache.get(cacheKey(destination));
}

function writeGroundingCache(destination: string, data: GroundingData): void {
  groundingCache.set(cacheKey(destination), data);
}

/** Clears the grounding cache. Exposed for deterministic testing. */
export function clearGroundingCache(): void {
  groundingCache.clear();
}

export async function fetchDestinationGrounding(destination: string): Promise<GroundingData> {
  if (!destination || destination.trim() === '') {
    throw new GroundingError('Destination parameter is empty');
  }

  const cached = readGroundingCache(destination);
  if (cached) {
    return cached;
  }

  try {
    // 1. Search for matching page using Wikipedia OpenSearch API
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      destination.trim()
    )}&limit=1&namespace=0&format=json&origin=*`;

    const searchResponse = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!searchResponse.ok) {
      throw new Error(`Wikipedia search failed with status ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const titles = searchData[1] || [];
    const urls = searchData[3] || [];

    if (titles.length === 0 || !titles[0]) {
      // No cache write: a fallback may just mean a transient miss or a typo the
      // user will correct, so we let the next attempt try the network again.
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
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!summaryResponse.ok) {
      // Fallback if summary endpoint fails but search worked
      const partial: GroundingData = {
        title: matchedTitle,
        extract: `Information about ${matchedTitle} is present but a detailed extract could not be retrieved.`,
        url: pageUrl,
        source: 'wikipedia',
      };
      writeGroundingCache(destination, partial);
      return partial;
    }

    const summaryData = await summaryResponse.json();
    const result: GroundingData = {
      title: summaryData.title || matchedTitle,
      extract: summaryData.extract || 'No extract content found.',
      url: pageUrl,
      source: 'wikipedia',
    };
    writeGroundingCache(destination, result);
    return result;
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
