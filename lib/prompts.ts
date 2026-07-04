import { TripInput } from './schemas';
import { GroundingData } from './destination-source';

export function buildSystemPrompt(): string {
  return `You are Yatrika, an expert culturally-aware travel companion and itinerary planner.
Your goal is to build immersive, respectful, and culturally rich travel guides that help travelers truly connect with local history, communities, and traditions.

You MUST produce a JSON object that strictly complies with the schema provided.
Your response MUST be valid JSON only. Do not wrap it in markdown codeblocks (like \`\`\`json) and do not add any conversational preface or postscript.

CRITICAL INSTRUCTIONS FOR TRUTHFULNESS & RELIABILITY:
1. Ground your facts: Use the provided Grounding Context (from Wikipedia/official sources) to ground names of historical sites, monuments, districts, and landmarks.
2. Avoid Hallucinations: Do not invent exact addresses, ticket prices, ticket-booking links, phone numbers, or opening hours. If you need to mention when to visit, speak in general terms (e.g., "Best in the early morning to catch the local prayer ceremonies").
3. Do Not Fabricate Live Events: If suggesting local festivals, performances, or markets, describe them as "cultural experiences and traditions often present here" or "regular/seasonal events to look out for", rather than giving specific dates/times (unless they are stable, e.g. "Held every Friday evening"). Never claim to have live, bookable event inventory.
4. Authentic Hidden Gems: Suggest lesser-known spots (neighborhood lanes, artisan workshops, small stepwells, local heritage museums) rather than only super-touristy spots. If a place is not widely cataloged, label it clearly as a "local-style experience recommendation".
5. Accessibility & Pace: Pay strict attention to the traveler's pace (relaxed, balanced, packed) and accessibility requirements (e.g., wheelchair accessibility, flat paths, visual-friendly, slow walking) when placing attractions.
6. Seasonal Awareness: If a travel month is provided, tailor the seasonal experiences and any weather-dependent advice to that time of year, while making clear these are typical/expected patterns to verify locally, not guaranteed live listings.`;
}

export function buildUserPrompt(input: TripInput, grounding: GroundingData): string {
  const {
    destination,
    days,
    interests,
    budgetStyle,
    travelPace,
    travelMonth,
    dietaryPreference,
    accessibilityNeeds,
    avoidTouristy,
  } = input;

  return `Generate a culturally rich travel guide based on these specifications:

Destination: ${destination}
Duration: ${days} Day(s)
Interests: ${interests.join(', ')}
Budget Style: ${budgetStyle}
Travel Pace: ${travelPace}
${travelMonth ? `Travel Month: ${travelMonth} (tailor seasonal experiences and weather-aware tips to this time of year)` : ''}
${dietaryPreference ? `Dietary Preference: ${dietaryPreference}` : ''}
${accessibilityNeeds ? `Accessibility & Mobility Needs: ${accessibilityNeeds}` : ''}
${avoidTouristy ? 'Avoid overly touristy / crowded mainstream places where possible and focus on local spots.' : ''}

Grounding Context (Wikipedia summary for ${grounding.title}):
"${grounding.extract}"
Source Link: ${grounding.url || 'None'}

Please return a single JSON object matching this schema:
{
  "destinationSummary": "A concise, beautiful summary of the destination's history and cultural essence.",
  "tripStyleSummary": "How this specific itinerary is customized for the traveler's interests (${interests.join(
    ', '
  )}), pace (${travelPace}), and budget (${budgetStyle}).",
  "days": [
    {
      "dayNumber": 1,
      "theme": "Thematic focus of this day, e.g. 'Heritage & Local Crafts'",
      "morning": {
        "title": "Name of place or experience",
        "description": "What the traveler will do here, aligned with their interests.",
        "culturalContext": "Why this place is culturally or historically significant.",
        "whyRecommended": "Why this is recommended for their pace, interests, and budget.",
        "duration": "Estimated duration (e.g. '2-3 hours')",
        "practicalTip": "Practical respect/etiquette advice (e.g., 'Dress modestly, knees and shoulders covered')."
      },
      "afternoon": { ... },
      "evening": { ... }
    }
  ],
  "hiddenGems": [
    {
      "name": "Name of hidden gem",
      "whatItIs": "Brief explanation of what it is.",
      "whySpecial": "The cultural background or artisan connection that makes it unique.",
      "whenToGo": "Best time to visit/engage.",
      "whoItSuits": "Who will enjoy this most (e.g., 'photography lovers', 'slow travelers')."
    }
  ],
  "culturalEtiquette": [
    {
      "type": "do" | "dont" | "custom",
      "guideline": "Short actionable rule, e.g. 'Remove shoes before entering'",
      "explanation": "Brief cultural explanation of why this matter or how it is practiced."
    }
  ],
  "foodHighlights": [
    {
      "dishName": "Name of authentic local dish",
      "description": "What it is made of and flavor profile.",
      "culturalSignificance": "The history, season, or communal role of this dish.",
      "whereToTry": "Kind of local spot to try it (e.g. 'traditional sweet shops in the old bazaar', 'home-style eateries'). Do not use exact commercial brand names."
    }
  ],
  "localExperiences": [
    {
      "title": "Name of a seasonal/cultural experience, festival, market, ritual, or performance to look out for.",
      "type": "One of: festival, market, performance, workshop, seasonal, ritual, other.",
      "description": "What it is and why it is culturally meaningful.",
      "timing": "Typical timing in cautious terms (e.g. 'often held around October', 'weekly on Sunday mornings', 'check locally for current dates'). Do NOT invent exact dates.",
      "note": "A short caveat or tip, reinforcing that the traveler should verify current schedules locally."
    }
  ],
  "storyModeNarrative": "A short, immersive, first-person or highly descriptive sensory narrative (100-150 words) depicting a typical moment the traveler will experience. e.g. 'Imagine the scent of jasmine and brewing tea welcoming you as you enter...'"
}

For "localExperiences", provide 3-5 conservative, clearly non-live cultural experiences the traveler could look out for${travelMonth ? ` around ${travelMonth}` : ''}. These must be framed as typical cultural patterns to verify locally, never as a guaranteed live event feed. If you genuinely cannot suggest any responsibly, return an empty array for this field.

Ensure the output is valid JSON.`;
}
