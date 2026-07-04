'use client';

import React, { useState } from 'react';
import { TripOutput } from '@/lib/schemas';
import { GroundingData } from '@/lib/destination-source';

interface ResultsDisplayProps {
  data: {
    itinerary: TripOutput;
    grounding: GroundingData;
    timestamp: string;
    modelUsed: string;
  };
}

export default function ResultsDisplay({ data }: ResultsDisplayProps) {
  const { itinerary, grounding, timestamp, modelUsed } = data;
  const [activeDay, setActiveDay] = useState<number>(1);
  const [copySuccess, setCopySuccess] = useState(false);

  const formatItineraryToText = (): string => {
    let text = `=========================================\n`;
    text += `CULTURE TRAIL ITINERARY: ${grounding.title.toUpperCase()}\n`;
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
      text += `Morning: ${day.morning.title} (${day.morning.duration})\n`;
      text += `  - What to do: ${day.morning.description}\n`;
      text += `  - Cultural context: ${day.morning.culturalContext}\n`;
      text += `  - Why recommended: ${day.morning.whyRecommended}\n`;
      text += `  - Practical tip: ${day.morning.practicalTip}\n\n`;

      text += `Afternoon: ${day.afternoon.title} (${day.afternoon.duration})\n`;
      text += `  - What to do: ${day.afternoon.description}\n`;
      text += `  - Cultural context: ${day.afternoon.culturalContext}\n`;
      text += `  - Why recommended: ${day.afternoon.whyRecommended}\n`;
      text += `  - Practical tip: ${day.afternoon.practicalTip}\n\n`;

      text += `Evening: ${day.evening.title} (${day.evening.duration})\n`;
      text += `  - What to do: ${day.evening.description}\n`;
      text += `  - Cultural context: ${day.evening.culturalContext}\n`;
      text += `  - Why recommended: ${day.evening.whyRecommended}\n`;
      text += `  - Practical tip: ${day.evening.practicalTip}\n\n`;
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
    text += `Generated with CultureTrail (Gemini 2.5) on ${new Date(timestamp).toLocaleString()}\n`;
    text += `Grounding details: Wikipedia matched "${grounding.title}" (${grounding.source})\n`;
    text += `=========================================\n`;
    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatItineraryToText());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDownload = () => {
    const textContent = formatItineraryToText();
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CultureTrail_${grounding.title.replace(/\s+/g, '_')}_Itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" id="trail-results">
      {/* 1. Print & Export Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md no-print">
        <h2 className="text-sm font-semibold text-slate-350">
          Your itinerary for <span className="text-slate-100 font-bold">{grounding.title}</span> is ready!
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="bg-slate-950 hover:bg-slate-850 text-slate-100 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition active:scale-98"
            aria-live="polite"
          >
            {copySuccess ? '✓ Copied to clipboard!' : '🗎 Copy Text'}
          </button>
          <button
            onClick={handleDownload}
            className="bg-slate-950 hover:bg-slate-850 text-slate-100 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition active:scale-98"
          >
            🔀 Export TXT
          </button>
          <button
            onClick={() => window.print()}
            className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition active:scale-98"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* 2. Destination Overview */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4" aria-labelledby="overview-heading">
        <div className="border-l-4 border-emerald-500 pl-4 space-y-2">
          <h2 id="overview-heading" className="text-2xl font-bold text-slate-100 tracking-tight">
            Discovering {grounding.title}
          </h2>
          <p className="text-slate-350 text-sm italic">{itinerary.tripStyleSummary}</p>
        </div>
        <p className="text-slate-300 text-base leading-relaxed leading-7">
          {itinerary.destinationSummary}
        </p>
      </section>

      {/* 3. Story Mode Narrative (The Wow Layer) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950/20 to-slate-900 border border-emerald-900/30 p-6 rounded-2xl shadow-lg" aria-labelledby="story-heading">
        <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl font-serif select-none pointer-events-none text-emerald-500">“</div>
        <h2 id="story-heading" className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Immersive Narrative Experience</h2>
        <blockquote className="text-slate-200 font-serif text-lg leading-relaxed italic relative z-10">
          “{itinerary.storyModeNarrative}”
        </blockquote>
      </section>

      {/* 4. Day-by-Day Itinerary Planner */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden" aria-labelledby="itinerary-heading">
        <div className="p-6 bg-slate-900 border-b border-slate-850 flex items-center justify-between flex-wrap gap-4">
          <h2 id="itinerary-heading" className="text-lg font-bold text-slate-100">Day-by-Day Planner</h2>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Itinerary Day selection">
            {itinerary.days.map((day) => (
              <button
                key={day.dayNumber}
                role="tab"
                aria-selected={activeDay === day.dayNumber}
                aria-controls={`day-panel-${day.dayNumber}`}
                id={`day-tab-${day.dayNumber}`}
                onClick={() => setActiveDay(day.dayNumber)}
                className={`px-4 py-2 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  activeDay === day.dayNumber
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-250 border border-slate-850'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {itinerary.days.map((day) => {
          const isCurrent = activeDay === day.dayNumber;
          return (
            <div
              key={day.dayNumber}
              id={`day-panel-${day.dayNumber}`}
              role="tabpanel"
              aria-labelledby={`day-tab-${day.dayNumber}`}
              hidden={!isCurrent}
              className={`p-6 space-y-6 ${isCurrent ? 'block' : 'hidden'}`}
            >
              <div className="border-b border-slate-850 pb-4">
                <h3 className="text-base font-bold text-slate-200">
                  Theme: <span className="text-emerald-400 font-semibold">{day.theme}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Morning */}
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 hover:border-slate-800 transition space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                      ☀️ Morning • {day.morning.duration}
                    </span>
                    <h4 className="text-base font-bold text-slate-200">{day.morning.title}</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{day.morning.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-900">
                    <div>
                      <span className="block font-bold text-slate-450 mb-0.5 uppercase tracking-wide">Cultural Significance</span>
                      <p className="text-slate-350">{day.morning.culturalContext}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-450 mb-0.5 uppercase tracking-wide">Why Recommended</span>
                      <p className="text-slate-350">{day.morning.whyRecommended}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 text-emerald-400 border border-emerald-950 p-2.5 rounded-lg text-xs font-medium">
                    ⚠️ <strong>Respect Tip:</strong> {day.morning.practicalTip}
                  </div>
                </div>

                {/* Afternoon */}
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 hover:border-slate-800 transition space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center">
                      🌤️ Afternoon • {day.afternoon.duration}
                    </span>
                    <h4 className="text-base font-bold text-slate-200">{day.afternoon.title}</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{day.afternoon.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-900">
                    <div>
                      <span className="block font-bold text-slate-450 mb-0.5 uppercase tracking-wide">Cultural Significance</span>
                      <p className="text-slate-350">{day.afternoon.culturalContext}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-450 mb-0.5 uppercase tracking-wide">Why Recommended</span>
                      <p className="text-slate-350">{day.afternoon.whyRecommended}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 text-emerald-400 border border-emerald-950 p-2.5 rounded-lg text-xs font-medium">
                    ⚠️ <strong>Respect Tip:</strong> {day.afternoon.practicalTip}
                  </div>
                </div>

                {/* Evening */}
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 hover:border-slate-800 transition space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center">
                      🌙 Evening • {day.evening.duration}
                    </span>
                    <h4 className="text-base font-bold text-slate-200">{day.evening.title}</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{day.evening.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-900">
                    <div>
                      <span className="block font-bold text-slate-450 mb-0.5 uppercase tracking-wide">Cultural Significance</span>
                      <p className="text-slate-350">{day.evening.culturalContext}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-450 mb-0.5 uppercase tracking-wide">Why Recommended</span>
                      <p className="text-slate-350">{day.evening.whyRecommended}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 text-emerald-400 border border-emerald-950 p-2.5 rounded-lg text-xs font-medium">
                    ⚠️ <strong>Respect Tip:</strong> {day.evening.practicalTip}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. Hidden Gems & Authentic Experiences */}
      <section className="space-y-4" aria-labelledby="gems-heading">
        <h2 id="gems-heading" className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <span>✨ Authentic local recommendations (Hidden Gems)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itinerary.hiddenGems.map((gem, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col justify-between hover:border-slate-750 transition space-y-4"
            >
              <div className="space-y-2">
                <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block">
                  Lesser-Known Cultural Experience
                </span>
                <h3 className="text-base font-bold text-slate-200">{gem.name}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{gem.whatItIs}</p>
                <div className="bg-slate-950 p-3 rounded-lg text-xs border border-slate-900 space-y-1 text-slate-350">
                  <span className="block text-[10px] uppercase font-bold text-slate-450">Why it is special:</span>
                  <p>{gem.whySpecial}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-850 pt-3 mt-4">
                <span>🕒 <strong>Best time:</strong> {gem.whenToGo}</span>
                <span>👤 <strong>Suits:</strong> {gem.whoItSuits}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Cultural Etiquette & Dress Guide */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4" aria-labelledby="etiquette-heading">
        <h2 id="etiquette-heading" className="text-lg font-bold text-slate-100">
          Local Heritage & Cultural Etiquette
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {itinerary.culturalEtiquette.map((rule, idx) => {
            const isDo = rule.type === 'do';
            const isDont = rule.type === 'dont';
            return (
              <div
                key={idx}
                className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-start space-x-3 text-sm leading-relaxed"
              >
                <span
                  className={`flex-shrink-0 text-xs font-bold uppercase px-2 py-0.5 rounded text-center min-w-16 ${
                    isDo
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : isDont
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {rule.type}
                </span>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-200">{rule.guideline}</h3>
                  <p className="text-slate-350 text-xs leading-relaxed">{rule.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Local Food & Culture */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4" aria-labelledby="food-heading">
        <h2 id="food-heading" className="text-lg font-bold text-slate-100">
          Traditional Culinary Delicacies to Try
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {itinerary.foodHighlights.map((food, idx) => (
            <div
              key={idx}
              className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <h3 className="font-bold text-emerald-400 text-sm">{food.dishName}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{food.description}</p>
                <div className="pt-2 text-[11px] text-slate-350 italic border-t border-slate-900 mt-2">
                  🍲 {food.culturalSignificance}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                📍 <strong>Try at:</strong> {food.whereToTry}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Technical Evaluator Metadata (Audit Log proof) */}
      <section className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs space-y-2 text-slate-450 max-w-full overflow-x-auto select-all" aria-label="System Metadata Information">
        <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evaluation Audit Logs (Dynamically Generated)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div>
            <span className="block font-bold">Query Timestamp</span>
            <span>{new Date(timestamp).toLocaleString()}</span>
          </div>
          <div>
            <span className="block font-bold">Destination Sourced</span>
            <span>{grounding.title}</span>
          </div>
          <div>
            <span className="block font-bold">Wikipedia Sourced</span>
            <span className={grounding.source === 'wikipedia' ? 'text-emerald-400' : 'text-amber-400'}>
              {grounding.source === 'wikipedia' ? '✓ Successful' : '⚠ Failed (Graceful Fallback)'}
            </span>
          </div>
          <div>
            <span className="block font-bold">Model Engine</span>
            <span>{modelUsed}</span>
          </div>
        </div>
        {grounding.url && (
          <div className="pt-2 border-t border-slate-900 text-[10px]">
            <span className="font-bold">Grounding Source URL: </span>
            <a
              href={grounding.url}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-500 hover:underline"
            >
              {grounding.url}
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
