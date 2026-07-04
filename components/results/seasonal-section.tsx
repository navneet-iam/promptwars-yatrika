import React from "react";
import { LocalExperience } from "@/lib/schemas";

interface SeasonalSectionProps {
  experiences: LocalExperience[];
}

// Maps a (lenient) experience category to an icon, falling back gracefully for
// any category the model returns outside the expected set.
const EXPERIENCE_ICONS: Record<string, string> = {
  festival: "🎉",
  market: "🛍️",
  performance: "🎭",
  workshop: "🧵",
  seasonal: "🍂",
  ritual: "🛕",
  other: "✨",
};

/**
 * Seasonal cultural experiences to "look out for". Rendered only when the model
 * supplied any; deliberately framed as AI-suggested patterns, not a live feed.
 */
export default function SeasonalSection({ experiences }: SeasonalSectionProps) {
  if (experiences.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="experiences-heading">
      <div className="space-y-1">
        <h2
          id="experiences-heading"
          className="text-lg font-bold text-slate-100 flex items-center space-x-2"
        >
          <span>🗓️ Seasonal cultural experiences to look out for</span>
        </h2>
        <p className="text-xs text-slate-400">
          AI-suggested cultural patterns and traditions — not a live event feed.
          Always verify current dates and schedules locally.
        </p>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
        {experiences.map((exp, idx) => (
          <li
            key={idx}
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <span aria-hidden="true">
                  {EXPERIENCE_ICONS[exp.type.toLowerCase()] ??
                    EXPERIENCE_ICONS.other}
                </span>
                {exp.title}
              </h3>
              <span className="flex-shrink-0 bg-orange-500/10 border border-orange-500/30 text-orange-300 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                {exp.type}
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {exp.description}
            </p>
            <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 space-y-1">
              <p>
                🕒 <strong>Typical timing:</strong> {exp.timing}
              </p>
              <p className="italic">
                <span aria-hidden="true">ℹ️</span> {exp.note}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
