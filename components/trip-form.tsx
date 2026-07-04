'use client';

import React, { useState } from 'react';
import { TripInput, VALID_INTERESTS } from '@/lib/schemas';

interface TripFormProps {
  onSubmit: (input: TripInput) => void;
  isLoading: boolean;
}

const INTEREST_LABELS: Record<(typeof VALID_INTERESTS)[number], string> = {
  history: '🏛️ History & Heritage',
  food: '🍲 Culinary & Street Food',
  architecture: '🕌 Architecture & Monuments',
  'local-markets': '🛍️ Local Bazaars & Markets',
  'festivals-arts': '🎨 Festivals & Performing Arts',
  spirituality: '🙏 Spirituality & Temples',
  nature: '🌳 Nature & Ecotourism',
  photography: '📷 Scenic Spot Photography',
};

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [budgetStyle, setBudgetStyle] = useState<'budget' | 'moderate' | 'premium'>('moderate');
  const [travelPace, setTravelPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [avoidTouristy, setAvoidTouristy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!destination.trim()) {
      setError('Please specify a destination.');
      return;
    }

    if (selectedInterests.length === 0) {
      setError('Please select at least one cultural interest.');
      return;
    }

    const payload: TripInput = {
      destination: destination.trim(),
      days,
      interests: selectedInterests as any,
      budgetStyle,
      travelPace,
      dietaryPreference: dietaryPreference.trim() || undefined,
      accessibilityNeeds: accessibilityNeeds.trim() || undefined,
      avoidTouristy,
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl max-w-2xl mx-auto"
      aria-label="Cultural Travel Planner Form"
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="destination" className="block text-sm font-semibold text-slate-200">
          Where are you traveling to? <span className="text-emerald-400">*</span>
        </label>
        <input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Kyoto, Jaipur, Cusco, Rome"
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          required
          aria-required="true"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="days" className="block text-sm font-semibold text-slate-200">
            Trip Duration: <span className="font-bold text-emerald-400">{days}</span> day(s) <span className="text-emerald-400">*</span>
          </label>
          <input
            type="range"
            id="days"
            min="1"
            max="10"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-slate-400 px-1">
            <span>1 day</span>
            <span>5 days</span>
            <span>10 days</span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="budgetStyle" className="block text-sm font-semibold text-slate-200">
            Budget Style <span className="text-emerald-400">*</span>
          </label>
          <select
            id="budgetStyle"
            value={budgetStyle}
            onChange={(e) => setBudgetStyle(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            disabled={isLoading}
          >
            <option value="budget">Budget (Local-style, authentic cost-effective options)</option>
            <option value="moderate">Moderate (Balanced experiences & comfort)</option>
            <option value="premium">Premium (Immersive heritage stays & private curations)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <span id="interests-legend" className="block text-sm font-semibold text-slate-200">
          What cultural interests fit your style? <span className="text-emerald-400">*</span>
        </span>
        <div
          role="group"
          aria-labelledby="interests-legend"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {VALID_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleInterestToggle(interest)}
                disabled={isLoading}
                className={`flex items-center text-left px-4 py-3 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-medium'
                    : 'bg-slate-950 border-slate-850 text-slate-350 hover:border-slate-800'
                }`}
              >
                <span className="mr-2" aria-hidden="true">
                  {isSelected ? '✓' : '○'}
                </span>
                {INTEREST_LABELS[interest]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span id="pace-legend" className="block text-sm font-semibold text-slate-200">
          Travel Pace <span className="text-emerald-400">*</span>
        </span>
        <div
          role="radiogroup"
          aria-labelledby="pace-legend"
          className="grid grid-cols-3 gap-2"
        >
          {(['relaxed', 'balanced', 'packed'] as const).map((pace) => {
            const isSelected = travelPace === pace;
            return (
              <button
                key={pace}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTravelPace(pace)}
                disabled={isLoading}
                className={`py-3 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalise ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-850 text-slate-350 hover:border-slate-800'
                }`}
              >
                {pace.charAt(0).toUpperCase() + pace.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-850 my-6"></div>

      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Optional Personalization</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="dietaryPreference" className="block text-sm font-semibold text-slate-200">
            Dietary Preferences / Restrictions
          </label>
          <input
            type="text"
            id="dietaryPreference"
            value={dietaryPreference}
            onChange={(e) => setDietaryPreference(e.target.value)}
            placeholder="e.g. Vegetarian, Halal, Gluten-free"
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="accessibilityNeeds" className="block text-sm font-semibold text-slate-200">
            Accessibility / Mobility Needs
          </label>
          <input
            type="text"
            id="accessibilityNeeds"
            value={accessibilityNeeds}
            onChange={(e) => setAccessibilityNeeds(e.target.value)}
            placeholder="e.g. Wheelchair access, minimal walking, flat surfaces"
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="avoidTouristy"
          checked={avoidTouristy}
          onChange={(e) => setAvoidTouristy(e.target.checked)}
          className="w-5 h-5 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:ring-offset-2 accent-emerald-500 cursor-pointer"
          disabled={isLoading}
        />
        <label htmlFor="avoidTouristy" className="text-sm text-slate-350 cursor-pointer">
          Avoid overly touristy / crowded mainstream places
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm"
        >
          <strong>Validation Error:</strong> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold py-4 rounded-xl transition duration-150 transform active:scale-98 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {isLoading ? 'Generating Culture Trail...' : 'Generate Immersive Guide'}
      </button>
    </form>
  );
}
