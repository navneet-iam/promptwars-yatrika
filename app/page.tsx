'use client';

import React, { useState } from 'react';
import TripForm from '@/components/trip-form';
import ResultsDisplay from '@/components/results-display';
import { TripInput } from '@/lib/schemas';

interface GenerationResult {
  itinerary: any;
  grounding: any;
  timestamp: string;
  modelUsed: string;
}

export default function Home() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (input: TripInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Fetching grounding context
      setLoadingStatus('Grounding destination information from Wikipedia...');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate itinerary. Please try again.');
      }

      setLoadingStatus('Weaving cultural storytelling narratives with Gemini...');
      const data = await response.json();

      setLoadingStatus('Verifying output schema safety...');
      setResult(data);
    } catch (err: any) {
      console.error('Generation request failed:', err);
      setError(err.message || 'An unexpected API error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" aria-hidden="true">🗺️</span>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-emerald-400">Culture</span>
              <span className="text-lg font-extrabold tracking-tight text-slate-100">Trail</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-950 px-2 py-0.5 rounded-full">
            GenAI Hackathon Submission
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-12 w-full space-y-12">
        {/* Intro Hero Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto no-print" aria-labelledby="main-heading">
          <h1 id="main-heading" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-none">
            Immersive Cultural <span className="text-emerald-400">Travel Companion</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Craft travel experiences grounded in authentic history, local customs, and neighborhood treasures. We combine Wikipedia verification with Gemini personalization to eliminate hallucinations.
          </p>
        </section>

        {/* Form Planner Section */}
        <section aria-label="Travel Planning Form" className="no-print">
          <TripForm onSubmit={handleGenerate} isLoading={isLoading} />
        </section>

        {/* Loading Indicator */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center space-y-4 p-12 bg-slate-900/50 border border-slate-800 rounded-2xl max-w-lg mx-auto shadow-lg"
          >
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-300 font-medium text-sm text-center">
              {loadingStatus || 'Processing itinerary requests...'}
            </p>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-6 rounded-2xl max-w-2xl mx-auto space-y-2 shadow-lg"
          >
            <div className="flex items-center space-x-2 text-rose-400 font-bold">
              <span className="text-lg">⚠</span>
              <span>An Error Occurred</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{error}</p>
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-850">
              Suggestions: Please check your network connection or verify that your GEMINI_API_KEY environment variable is configured correctly.
            </p>
          </div>
        )}

        {/* Result Rendering Area */}
        {result && (
          <section aria-label="Generated Culturally-Aware Trip Itinerary" className="print:p-0">
            <ResultsDisplay data={result} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-455">
          <p>© {new Date().getFullYear()} CultureTrail. Dedicated to ethical, respectful, and localized global travel.</p>
          <div className="flex space-x-4">
            <span className="text-slate-450">Built for PromptWars Challenge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
