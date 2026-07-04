"use client";

import React, { useState } from "react";
import { GenerationResult } from "@/lib/schemas";
import { formatItineraryAsText } from "@/lib/format-itinerary";

interface ExportToolbarProps {
  data: GenerationResult;
}

/** Copy / Export-TXT / Print actions for the generated itinerary. */
export default function ExportToolbar({ data }: ExportToolbarProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const { grounding } = data;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatItineraryAsText(data));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formatItineraryAsText(data)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Yatrika_${grounding.title.replace(/\s+/g, "_")}_Itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md no-print">
      <h2 className="text-sm font-semibold text-slate-300">
        Your itinerary for{" "}
        <span className="text-slate-100 font-bold">{grounding.title}</span> is
        ready!
      </h2>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleCopy}
          className="bg-slate-950 hover:bg-slate-800 text-slate-100 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition active:scale-[0.98]"
          aria-live="polite"
        >
          {copySuccess ? "✓ Copied to clipboard!" : "🗎 Copy Text"}
        </button>
        <button
          onClick={handleDownload}
          className="bg-slate-950 hover:bg-slate-800 text-slate-100 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition active:scale-[0.98]"
        >
          🔀 Export TXT
        </button>
        <button
          onClick={() => window.print()}
          className="bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition active:scale-[0.98]"
        >
          🖨️ Print / Save PDF
        </button>
      </div>
    </div>
  );
}
