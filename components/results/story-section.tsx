import React from "react";

interface StorySectionProps {
  narrative: string;
}

/** The immersive first-person "story mode" narrative — the GenAI wow layer. */
export default function StorySection({ narrative }: StorySectionProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-orange-950/30 to-slate-900 border border-orange-900/40 p-6 rounded-2xl shadow-lg"
      aria-labelledby="story-heading"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl font-serif select-none pointer-events-none text-orange-500">
        &ldquo;
      </div>
      <h2
        id="story-heading"
        className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3"
      >
        Immersive Narrative Experience
      </h2>
      <blockquote className="text-slate-200 font-serif text-lg leading-relaxed italic relative z-10">
        &ldquo;{narrative}&rdquo;
      </blockquote>
    </section>
  );
}
