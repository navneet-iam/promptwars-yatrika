import React from "react";
import { ItineraryBlock } from "@/lib/schemas";

interface TimeBlockProps {
  label: string;
  icon: string;
  /** Tailwind text-color class for the slot accent (e.g. "text-amber-400"). */
  accent: string;
  block: ItineraryBlock;
}

/** One morning/afternoon/evening card. Presentational and stateless. */
export default function TimeBlock({ label, icon, accent, block }: TimeBlockProps) {
  return (
    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${accent} flex items-center`}
        >
          {icon} {label} • {block.duration}
        </span>
        <h4 className="text-base font-bold text-slate-200">{block.title}</h4>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{block.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-900">
        <div>
          <span className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">
            Cultural Significance
          </span>
          <p className="text-slate-300">{block.culturalContext}</p>
        </div>
        <div>
          <span className="block font-bold text-slate-400 mb-0.5 uppercase tracking-wide">
            Why Recommended
          </span>
          <p className="text-slate-300">{block.whyRecommended}</p>
        </div>
      </div>
      <div className="bg-orange-500/5 text-orange-300 border border-orange-500/20 p-2.5 rounded-lg text-xs font-medium">
        <span aria-hidden="true">💡</span> <strong>Respect Tip:</strong>{" "}
        {block.practicalTip}
      </div>
    </div>
  );
}
