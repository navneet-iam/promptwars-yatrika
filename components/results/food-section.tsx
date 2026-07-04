import React from "react";
import { FoodHighlight } from "@/lib/schemas";

interface FoodSectionProps {
  items: FoodHighlight[];
}

/** Must-try local dishes, their significance, and the kind of place to try them. */
export default function FoodSection({ items }: FoodSectionProps) {
  return (
    <section
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
      aria-labelledby="food-heading"
    >
      <h2 id="food-heading" className="text-lg font-bold text-slate-100">
        Traditional Culinary Delicacies to Try
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((food, idx) => (
          <div
            key={idx}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <h3 className="font-bold text-orange-400 text-sm">
                {food.dishName}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                {food.description}
              </p>
              <div className="pt-2 text-[11px] text-slate-300 italic border-t border-slate-900 mt-2">
                🍲 {food.culturalSignificance}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900">
              📍 <strong>Try at:</strong> {food.whereToTry}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
