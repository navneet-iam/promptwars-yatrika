import React from "react";
import { HiddenGem } from "@/lib/schemas";

interface HiddenGemsSectionProps {
  gems: HiddenGem[];
}

/** Lesser-known, cautiously-labelled local recommendations. */
export default function HiddenGemsSection({ gems }: HiddenGemsSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="gems-heading">
      <h2
        id="gems-heading"
        className="text-lg font-bold text-slate-100 flex items-center space-x-2"
      >
        <span>✨ Authentic local recommendations (Hidden Gems)</span>
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
        {gems.map((gem, idx) => (
          <li
            key={idx}
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col justify-between hover:border-slate-700 transition space-y-4"
          >
            <div className="space-y-2">
              <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block">
                Lesser-Known Cultural Experience
              </span>
              <h3 className="text-base font-bold text-slate-200">{gem.name}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {gem.whatItIs}
              </p>
              <div className="bg-slate-950 p-3 rounded-lg text-xs border border-slate-900 space-y-1 text-slate-300">
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Why it is special:
                </span>
                <p>{gem.whySpecial}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3 mt-4">
              <span>
                🕒 <strong>Best time:</strong> {gem.whenToGo}
              </span>
              <span>
                👤 <strong>Suits:</strong> {gem.whoItSuits}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
