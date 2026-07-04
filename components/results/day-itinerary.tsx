"use client";

import React, { useState } from "react";
import { DayPlan } from "@/lib/schemas";
import TimeBlock from "./time-block";

interface DayItineraryProps {
  days: DayPlan[];
}

// The three daily time slots share one card layout; only the label, icon, and
// accent colour differ. Defined once and mapped over to avoid duplication.
const TIME_SLOTS = [
  { key: "morning", label: "Morning", icon: "☀️", accent: "text-amber-400" },
  { key: "afternoon", label: "Afternoon", icon: "🌤️", accent: "text-sky-400" },
  { key: "evening", label: "Evening", icon: "🌙", accent: "text-violet-400" },
] as const;

/** Day-by-day itinerary rendered as a keyboard-accessible WAI-ARIA tabs widget. */
export default function DayItinerary({ days }: DayItineraryProps) {
  const [activeDay, setActiveDay] = useState<number>(days[0]?.dayNumber ?? 1);

  // Roving-tabindex keyboard support for the day tablist.
  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentDayNumber: number,
  ) => {
    const dayNumbers = days.map((d) => d.dayNumber);
    const idx = dayNumbers.indexOf(currentDayNumber);
    let nextIdx: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIdx = (idx + 1) % dayNumbers.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIdx = (idx - 1 + dayNumbers.length) % dayNumbers.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = dayNumbers.length - 1;
    }

    if (nextIdx !== null) {
      e.preventDefault();
      const nextDay = dayNumbers[nextIdx];
      setActiveDay(nextDay);
      document.getElementById(`day-tab-${nextDay}`)?.focus();
    }
  };

  return (
    <section
      className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
      aria-labelledby="itinerary-heading"
    >
      <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <h2 id="itinerary-heading" className="text-lg font-bold text-slate-100">
          Day-by-Day Planner
        </h2>
        <div
          className="flex flex-wrap gap-1"
          role="tablist"
          aria-label="Itinerary Day selection"
        >
          {days.map((day) => (
            <button
              key={day.dayNumber}
              role="tab"
              aria-selected={activeDay === day.dayNumber}
              aria-controls={`day-panel-${day.dayNumber}`}
              id={`day-tab-${day.dayNumber}`}
              tabIndex={activeDay === day.dayNumber ? 0 : -1}
              onClick={() => setActiveDay(day.dayNumber)}
              onKeyDown={(e) => handleTabKeyDown(e, day.dayNumber)}
              className={`px-4 py-2 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                activeDay === day.dayNumber
                  ? "bg-orange-500 text-slate-950"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {days.map((day) => {
        const isCurrent = activeDay === day.dayNumber;
        return (
          <div
            key={day.dayNumber}
            id={`day-panel-${day.dayNumber}`}
            role="tabpanel"
            aria-labelledby={`day-tab-${day.dayNumber}`}
            hidden={!isCurrent}
            className={`p-6 space-y-6 ${isCurrent ? "block" : "hidden"}`}
          >
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-200">
                Theme:{" "}
                <span className="text-orange-400 font-semibold">{day.theme}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {TIME_SLOTS.map((slot) => (
                <TimeBlock
                  key={slot.key}
                  label={slot.label}
                  icon={slot.icon}
                  accent={slot.accent}
                  block={day[slot.key]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
