/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sparkles, Compass, Search, Copy, Check, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import GeneratorForm from "./components/GeneratorForm";
import SuggestionCard from "./components/SuggestionCard";
import FavoritesSidebar from "./components/FavoritesSidebar";
import { StartupSuggestion, GenerationRequest, GenerationResponse } from "./types";

const LOADING_MESSAGES = [
  "Parsing industry dynamics and category trends...",
  "Forging brand combinations and structural neologisms...",
  "Evaluating linguistic cohesion and pronunciation flow...",
  "Formulating viable domain portfolio options..."
];

export default function App() {
  const [suggestions, setSuggestions] = useState<StartupSuggestion[]>([]);
  const [favorites, setFavorites] = useState<StartupSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentQuery, setCurrentQuery] = useState<GenerationRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter/Search states
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Drawer toggles
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Clipboard copies
  const [copiedBatch, setCopiedBatch] = useState(false);

  // Hook to retrieve and set favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("venture_forges_favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to read favorites from localStorage", e);
    }
  }, []);

  // Hook to manage simulated loading state message updates
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async (request: GenerationRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentQuery(request);

    try {
      const response = await fetch("/api/generate-names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate names from backend endpoint.");
      }

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error("Invalid structure returned from Gemini response. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected issue occurred while requesting suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (suggestion: StartupSuggestion) => {
    let updated: StartupSuggestion[];
    const exists = favorites.some((f) => f.name.toLowerCase() === suggestion.name.toLowerCase());

    if (exists) {
      updated = favorites.filter((f) => f.name.toLowerCase() !== suggestion.name.toLowerCase());
    } else {
      updated = [...favorites, suggestion];
    }

    setFavorites(updated);
    try {
      localStorage.setItem("venture_forges_favorites", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist favorites to localStorage", e);
    }
  };

  const handleRemoveFavoriteByName = (name: string) => {
    const updated = favorites.filter((f) => f.name.toLowerCase() !== name.toLowerCase());
    setFavorites(updated);
    try {
      localStorage.setItem("venture_forges_favorites", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist favorites to localStorage", e);
    }
  };

  const handleClearAllFavorites = () => {
    if (window.confirm("Are you sure you want to discard your saved name selections?")) {
      setFavorites([]);
      try {
        localStorage.removeItem("venture_forges_favorites");
      } catch (e) {
        console.error("Failed to clear favorites from localStorage", e);
      }
    }
  };

  const handleCopyAllGenerated = async () => {
    if (suggestions.length === 0) return;
    const bulletList = suggestions
      .map((s, idx) => `${idx + 1}. ${s.name} - "${s.slogan}" [${s.category}] | Domain: ${s.domainIdea}`)
      .join("\n");

    const header = `VENTURE BRAINSTORM: ${currentQuery?.industry}\nTheme Prefered: ${currentQuery?.nameStyle || "Default"}\n\n`;
    try {
      await navigator.clipboard.writeText(header + bulletList);
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2500);
    } catch (err) {
      console.error("Error copying session results", err);
    }
  };

  // Sifting & Filtration computation
  const filteredSuggestions = suggestions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.slogan.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.rationale.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || s.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filtration chips
  const originalCategories = Array.from(new Set(suggestions.map((s) => s.category)));

  return (
    <div className="min-h-screen bg-midnight text-gray-100 flex flex-col font-sans selection:bg-indigo-900/60 selection:text-indigo-200 overflow-x-hidden">
      {/* Sleek App Sticky Header */}
      <Header
        favoritesCount={favorites.length}
        onToggleFavorites={() => setIsFavoritesOpen(true)}
        showFavorites={isFavoritesOpen}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Hero Presentation Line */}
        <div className="mb-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-darkslate/60 border border-gray-800 rounded-full text-[10px] font-bold text-gray-450 font-mono shadow-md tracking-wider uppercase mb-3.5"
          >
            <Sparkles className="h-3 w-3 text-yellow-500 fill-current" />
            Empowered by Gemini AI
          </motion.div>
          
          <h1 className="text-3xl md:text-4.5xl font-bold font-display tracking-tight text-white mb-3 leading-tight">
            Forge the Perfect Brand Identity
          </h1>
          <p className="text-md text-gray-400 max-w-2xl font-normal leading-relaxed font-sans">
            Translate concepts and industries into memorable, brandable, and targeted startup names, slogans, and portfolios instantly.
          </p>
        </div>

        {/* Form and Results Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Block - Builder controls */}
          <div className="lg:col-span-5 space-y-6">
            <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />

            {/* Error Message Box */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-rose-950/20 border border-rose-900/50 text-rose-200 p-4.5 rounded-xl flex items-start gap-3 shadow-md"
                >
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold font-display text-rose-100">API Generation Error</h4>
                    <p className="text-xs text-rose-350 leading-relaxed mt-1">
                      {errorMessage}
                    </p>
                    <p className="text-[10px] text-rose-400/80 mt-2 font-mono">
                      Check your Settings {`>`} Secrets configs for GEMINI_API_KEY.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Block - Response and suggestions */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                /* LOADING PANEL STYLE */
                <motion.div
                  key="loading-box"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-darkslate border border-gray-800/80 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-black/30 flex flex-col items-center justify-center min-h-[460px]"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-indigo-950/40 animate-ping opacity-60 scale-110" />
                    <div className="h-16 w-16 bg-indigo-950/60 rounded-full flex items-center justify-center text-indigo-400 relative border border-indigo-900/30">
                      <RefreshCw className="h-7 w-7 animate-spin duration-3000" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white max-w-sm mb-2.5">
                    Forging Brand Identities
                  </h3>

                  <div className="min-h-[44px] flex items-center justify-center">
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-indigo-300 font-bold px-4 py-1.5 bg-indigo-950/40 rounded-full inline-block border border-indigo-900/30 font-mono"
                    >
                      {LOADING_MESSAGES[loadingStep]}
                    </motion.p>
                  </div>

                  <p className="text-xs text-gray-500 mt-12 max-w-xs leading-relaxed font-sans">
                    Analyzing semantic values, core phonetics, and dictionary trends to draft custom brand portfolios.
                  </p>
                </motion.div>
              ) : suggestions.length > 0 ? (
                /* SUGGESTIONS LIST PANEL */
                <motion.div
                  key="results-box"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Results Sub-header and Search, Filtration bar */}
                  <div className="bg-darkslate border border-gray-800/80 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/15 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-md font-bold font-display text-white flex items-center gap-2">
                          Brand Portfolios Synthesized
                          <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-950/40 text-indigo-300 border border-indigo-900/20 rounded-md">
                            {suggestions.length}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-400 font-sans">Target matches for: <span className="text-indigo-455 font-semibold italic text-indigo-400">"{currentQuery?.industry}"</span></p>
                      </div>

                      <button
                        onClick={handleCopyAllGenerated}
                        className="self-start sm:self-center py-2 px-3 bg-indigo-950/40 hover:bg-indigo-900/40 hover:text-indigo-300 text-indigo-450 border border-indigo-900/40 font-medium text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer text-indigo-405"
                      >
                        {copiedBatch ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-400 animate-pulse" />
                            <span>Copied Session!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy All Suggestions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Sifting search and dynamic filters */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-800/80">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          placeholder="Search generated names, slogans..."
                          className="w-full pl-9 pr-4 py-1.5 bg-gray-955/40 focus:bg-gray-900 border border-gray-820 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-950/40 rounded-lg text-xs text-white placeholder-gray-500 outline-none transition"
                        />
                      </div>

                      {/* category select list */}
                      <div className="flex items-center gap-1.5 min-w-[140px]">
                        <label htmlFor="cat-filter" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                          Style
                        </label>
                        <select
                          id="cat-filter"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full bg-gray-955/40 border border-gray-820 focus:border-indigo-500 rounded-lg py-1.5 px-2.5 text-xs outline-none text-gray-300 transition cursor-pointer"
                        >
                          <option value="all">All Styles</option>
                          {originalCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations Cards Map */}
                  {filteredSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSuggestions.map((item, idx) => {
                        const isFav = favorites.some((f) => f.name.toLowerCase() === item.name.toLowerCase());
                        return (
                          <SuggestionCard
                            key={item.name}
                            suggestion={item}
                            index={idx}
                            isFavorite={isFav}
                            onToggleFavorite={() => handleToggleFavorite(item)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-darkslate border border-gray-800 rounded-2xl p-12 text-center shadow-lg shadow-black/10">
                      <p className="text-sm font-semibold text-white">No suggestions match filters</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto font-sans">
                        Try clearing search patterns or filter inputs.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* INSTRUCTIONAL EMPTY SCREEN PANEL */
                <motion.div
                  key="empty-box"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-darkslate border border-gray-800/80 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-black/25 flex flex-col items-center justify-center min-h-[460px]"
                >
                  <div className="h-16 w-16 bg-indigo-950/40 text-indigo-400 rounded-full flex items-center justify-center mb-6 border border-indigo-900/30 shadow-md">
                    <Compass className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-white mb-2">
                    Enter details to begin
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6 font-sans">
                    Configure your business focus, concept words, and preferred style on the left, and watch the synthesizer forge creative ventures instantly.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-mono text-gray-500">
                    <span className="flex items-center gap-1.5 border border-dashed border-gray-800 rounded-lg py-1 px-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" /> 10 names generated
                    </span>
                    <span className="flex items-center gap-1.5 border border-dashed border-gray-800 rounded-lg py-1 px-2.5">
                      ⚡ Fully brandable domain suggestions
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Persistent Saved Drawer Sidebar component */}
      <FavoritesSidebar
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavoriteByName}
        onClearAll={handleClearAllFavorites}
      />
    </div>
  );
}
