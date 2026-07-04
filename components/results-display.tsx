import React from "react";
import { GenerationResult } from "@/lib/schemas";
import ExportToolbar from "./results/export-toolbar";
import OverviewSection from "./results/overview-section";
import StorySection from "./results/story-section";
import DayItinerary from "./results/day-itinerary";
import HiddenGemsSection from "./results/hidden-gems-section";
import SeasonalSection from "./results/seasonal-section";
import EtiquetteSection from "./results/etiquette-section";
import FoodSection from "./results/food-section";
import AuditMetadata from "./results/audit-metadata";

interface ResultsDisplayProps {
  data: GenerationResult;
}

/**
 * Composition root for a generated guide. Each section is a focused, independently
 * testable component; this component only arranges them and threads data through.
 */
export default function ResultsDisplay({ data }: ResultsDisplayProps) {
  const { itinerary, grounding, timestamp, modelUsed } = data;

  return (
    <div className="space-y-8 max-w-4xl mx-auto" id="trail-results">
      <ExportToolbar data={data} />

      <OverviewSection
        title={grounding.title}
        tripStyleSummary={itinerary.tripStyleSummary}
        destinationSummary={itinerary.destinationSummary}
      />

      <StorySection narrative={itinerary.storyModeNarrative} />

      <DayItinerary days={itinerary.days} />

      <HiddenGemsSection gems={itinerary.hiddenGems} />

      <SeasonalSection experiences={itinerary.localExperiences ?? []} />

      <EtiquetteSection rules={itinerary.culturalEtiquette} />

      <FoodSection items={itinerary.foodHighlights} />

      <AuditMetadata
        grounding={grounding}
        timestamp={timestamp}
        modelUsed={modelUsed}
      />
    </div>
  );
}
