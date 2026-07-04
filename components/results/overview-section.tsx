import React from "react";

interface OverviewSectionProps {
  title: string;
  tripStyleSummary: string;
  destinationSummary: string;
}

/** Destination overview: title, how the trip was tailored, and a summary. */
export default function OverviewSection({
  title,
  tripStyleSummary,
  destinationSummary,
}: OverviewSectionProps) {
  return (
    <section
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
      aria-labelledby="overview-heading"
    >
      <div className="border-l-4 border-orange-500 pl-4 space-y-2">
        <h2
          id="overview-heading"
          className="text-2xl font-bold text-slate-100 tracking-tight"
        >
          Discovering {title}
        </h2>
        <p className="text-slate-300 text-sm italic">{tripStyleSummary}</p>
      </div>
      <p className="text-slate-300 text-base leading-7">{destinationSummary}</p>
    </section>
  );
}
