import React from "react";
import { GroundingData } from "@/lib/schemas";

interface AuditMetadataProps {
  grounding: GroundingData;
  timestamp: string;
  modelUsed: string;
}

/** Dynamically-generated audit block that proves the result is live, not static. */
export default function AuditMetadata({
  grounding,
  timestamp,
  modelUsed,
}: AuditMetadataProps) {
  return (
    <section
      className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2 text-slate-400 max-w-full overflow-x-auto"
      aria-label="System Metadata Information"
    >
      <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
        Evaluation Audit Logs (Dynamically Generated)
      </h3>
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
          <span
            className={
              grounding.source === "wikipedia"
                ? "text-green-400"
                : "text-amber-400"
            }
          >
            {grounding.source === "wikipedia"
              ? "✓ Successful"
              : "⚠ Failed (Graceful Fallback)"}
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
            className="text-orange-400 hover:underline"
          >
            {grounding.url}
          </a>
        </div>
      )}
    </section>
  );
}
