import React from "react";
import { CulturalEtiquette } from "@/lib/schemas";

interface EtiquetteSectionProps {
  rules: CulturalEtiquette[];
}

// Semantic status colours (do = positive, dont = negative, custom = neutral).
// A text label always accompanies the colour, so meaning never relies on colour alone.
const BADGE_STYLES: Record<CulturalEtiquette["type"], string> = {
  do: "bg-green-500/10 text-green-400",
  dont: "bg-rose-500/10 text-rose-400",
  custom: "bg-sky-500/10 text-sky-400",
};

/** Do's, don'ts, and local customs with brief explanations. */
export default function EtiquetteSection({ rules }: EtiquetteSectionProps) {
  return (
    <section
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
      aria-labelledby="etiquette-heading"
    >
      <h2 id="etiquette-heading" className="text-lg font-bold text-slate-100">
        Local Heritage & Cultural Etiquette
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex items-start space-x-3 text-sm leading-relaxed"
          >
            <span
              className={`flex-shrink-0 text-xs font-bold uppercase px-2 py-0.5 rounded text-center min-w-16 ${BADGE_STYLES[rule.type]}`}
            >
              {rule.type}
            </span>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200">{rule.guideline}</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                {rule.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
