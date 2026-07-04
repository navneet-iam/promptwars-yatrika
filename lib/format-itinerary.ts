import { GenerationResult, ItineraryBlock } from './schemas';

/** Formats a single morning/afternoon/evening block for the plain-text export. */
function formatBlock(label: string, block: ItineraryBlock): string {
  return (
    `${label}: ${block.title} (${block.duration})\n` +
    `  - What to do: ${block.description}\n` +
    `  - Cultural context: ${block.culturalContext}\n` +
    `  - Why recommended: ${block.whyRecommended}\n` +
    `  - Practical tip: ${block.practicalTip}\n\n`
  );
}

/**
 * Renders a generated itinerary as a shareable plain-text document (used by the
 * Copy and Export-TXT actions). Pure and side-effect free, so it is trivially
 * unit-testable.
 */
export function formatItineraryAsText(data: GenerationResult): string {
  const { itinerary, grounding, timestamp, modelUsed } = data;
  const localExperiences = itinerary.localExperiences ?? [];

  let text = `=========================================\n`;
  text += `YATRIKA CULTURAL ITINERARY: ${grounding.title.toUpperCase()}\n`;
  text += `=========================================\n\n`;
  text += `Overview:\n${itinerary.destinationSummary}\n\n`;
  text += `Trip Customization:\n${itinerary.tripStyleSummary}\n\n`;
  text += `-----------------------------------------\n`;
  text += `IMMERSIVE STORY NARRATIVE\n`;
  text += `-----------------------------------------\n`;
  text += `"${itinerary.storyModeNarrative}"\n\n`;

  itinerary.days.forEach((day) => {
    text += `-----------------------------------------\n`;
    text += `DAY ${day.dayNumber}: ${day.theme}\n`;
    text += `-----------------------------------------\n`;
    text += formatBlock('Morning', day.morning);
    text += formatBlock('Afternoon', day.afternoon);
    text += formatBlock('Evening', day.evening);
  });

  text += `-----------------------------------------\n`;
  text += `AUTHENTIC LOCAL EXPERIENCE SUGGESTIONS\n`;
  text += `-----------------------------------------\n`;
  itinerary.hiddenGems.forEach((gem, idx) => {
    text += `${idx + 1}. ${gem.name}\n`;
    text += `   - Description: ${gem.whatItIs}\n`;
    text += `   - Why special: ${gem.whySpecial}\n`;
    text += `   - When to go: ${gem.whenToGo}\n`;
    text += `   - Who it suits: ${gem.whoItSuits}\n\n`;
  });

  if (localExperiences.length > 0) {
    text += `-----------------------------------------\n`;
    text += `SEASONAL CULTURAL EXPERIENCES TO LOOK OUT FOR\n`;
    text += `(AI-suggested cultural patterns — verify current schedules locally)\n`;
    text += `-----------------------------------------\n`;
    localExperiences.forEach((exp, idx) => {
      text += `${idx + 1}. ${exp.title} [${exp.type}]\n`;
      text += `   - What it is: ${exp.description}\n`;
      text += `   - Typical timing: ${exp.timing}\n`;
      text += `   - Note: ${exp.note}\n\n`;
    });
  }

  text += `-----------------------------------------\n`;
  text += `LOCAL CULTURAL ETIQUETTE & GUIDANCE\n`;
  text += `-----------------------------------------\n`;
  itinerary.culturalEtiquette.forEach((rule, idx) => {
    text += `${idx + 1}. [${rule.type.toUpperCase()}] ${rule.guideline}\n`;
    text += `   - Explanation: ${rule.explanation}\n\n`;
  });

  text += `-----------------------------------------\n`;
  text += `TRADITIONAL FOOD & CULINARY HIGHLIGHTS\n`;
  text += `-----------------------------------------\n`;
  itinerary.foodHighlights.forEach((food, idx) => {
    text += `${idx + 1}. ${food.dishName}\n`;
    text += `   - Description: ${food.description}\n`;
    text += `   - Cultural context: ${food.culturalSignificance}\n`;
    text += `   - Where to find: ${food.whereToTry}\n\n`;
  });

  text += `=========================================\n`;
  text += `Generated with Yatrika (${modelUsed}) on ${new Date(timestamp).toLocaleString()}\n`;
  text += `Grounding details: Wikipedia matched "${grounding.title}" (${grounding.source})\n`;
  text += `=========================================\n`;
  return text;
}
