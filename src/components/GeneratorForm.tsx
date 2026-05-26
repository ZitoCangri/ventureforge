import React, { useState } from "react";
import { HelpCircle, ChevronRight, RefreshCw, Zap, Tag } from "lucide-react";
import { motion } from "motion/react";
import { GenerationRequest } from "../types";

interface GeneratorFormProps {
  onGenerate: (data: GenerationRequest) => void;
  isLoading: boolean;
}

const INDUSTRY_PRESETS = [
  { label: "🧬 BioGenetics", industry: "Biotechnology & Gene Editing", keywords: "longevity, dna, research, cellular", style: "Classic Metaphor" },
  { label: "💳 DeFi", industry: "Decentralized Finance & Neo Banking", keywords: "ledger, secure, yield, flow, crypto", style: "Bold & High-tech" },
  { label: "🥬 Vertical Farming", industry: "Sustainable Urban Vertical Agriculture", keywords: "leaf, vertical, clean, scale, organic", style: "Friendly & Organic" },
  { label: "📦 Drone Express", industry: "Autonomous Drone Logistics & Delivery", keywords: "sky, express, vector, cargo, lift", style: "Technical / Modern" },
  { label: "🧥 Slow Fashion", industry: "Sustainably Sourced Circular Fashion Retail", keywords: "thread, weave, vintage, kind, earth", style: "Short & Abstract/Neologism" },
];

const STYLE_OPTIONS = [
  { id: "balanced", name: "Balanced Blend", desc: "A smart combination of creativity and professionalism" },
  { id: "neologism", name: "Abstract / Neologism", desc: "Uniquely invented modern words like Aura, Kodak, or Lexigo" },
  { id: "portmanteau", name: "Blended Portmanteau", desc: "Fused concepts like Pinterest, FinTech, or SnapChat" },
  { id: "metaphor", name: "Classic Metaphor", desc: "Inspirational symbols like Amazon, Robinhood, or Falcon" },
  { id: "organic", name: "Friendly & Organic", desc: "Warm, natural-sounding names like Lemonade, Care, or Olive" },
  { id: "tech", name: "Bold & High-tech", desc: "Technical names focused on efficiency like Matrix, Byte, or Cyber" },
];

export default function GeneratorForm({ onGenerate, isLoading }: GeneratorFormProps) {
  const [industry, setIndustry] = useState("");
  const [keywords, setKeywords] = useState("");
  const [nameStyle, setNameStyle] = useState("balanced");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim()) return;

    onGenerate({
      industry: industry.trim(),
      keywords: keywords.trim() || undefined,
      nameStyle: STYLE_OPTIONS.find(o => o.id === nameStyle)?.name || nameStyle,
    });
  };

  const handleApplyPreset = (preset: typeof INDUSTRY_PRESETS[0]) => {
    setIndustry(preset.industry);
    setKeywords(preset.keywords);
    const matchedStyle = STYLE_OPTIONS.find(o => o.name === preset.style || o.desc.includes(preset.style))?.id || "balanced";
    setNameStyle(matchedStyle);
  };

  const isFormValid = industry.trim().length > 0;

  return (
    <div className="bg-darkslate rounded-2xl border border-gray-800/80 p-6 md:p-8 shadow-xl shadow-black/20">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">Interactive Setup</span>
        </div>
        <h2 className="text-xl font-bold font-display text-white">Define Your Enterprise</h2>
        <p className="text-sm text-gray-400">Provide your industry niche and concepts to synthesize target name recommendations.</p>
      </div>

      {/* Preset Chips */}
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">
          Need inspiration? Try a preset
        </label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-gray-800/40 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 rounded-full text-xs font-medium transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Industry Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="industry-input" className="block text-sm font-semibold text-gray-200">
              Industry or Business Niche <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-gray-500 font-mono">Required</span>
          </div>
          <div className="relative">
            <input
              id="industry-input"
              type="text"
              required
              disabled={isLoading}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Next-generation circular battery recycling"
              className="w-full px-4 py-3 bg-gray-900/40 focus:bg-gray-900 border border-gray-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-950/50 rounded-xl text-sm text-white placeholder-gray-600 transition-all outline-none"
            />
          </div>
        </div>

        {/* Keywords Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="keywords-input" className="block text-sm font-semibold text-gray-200 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-gray-500" />
              Keywords & Core Concepts
            </label>
            <span className="text-xs text-gray-500 font-mono">Optional</span>
          </div>
          <input
            id="keywords-input"
            type="text"
            disabled={isLoading}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. green, cobalt, recycle, closed-loop (comma separated)"
            className="w-full px-4 py-3 bg-gray-900/40 focus:bg-gray-900 border border-gray-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-950/50 rounded-xl text-sm text-white placeholder-gray-600 transition-all outline-none"
          />
        </div>

        {/* Name Style Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2.5">
            Creative Branding Style
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((style) => (
              <label
                key={style.id}
                className={`relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  nameStyle === style.id
                    ? "bg-indigo-950/30 border-indigo-500/60 ring-4 ring-indigo-950/40"
                    : "bg-gray-900/20 border-gray-800/85 hover:border-gray-800"
                }`}
              >
                <input
                  type="radio"
                  name="nameStyle"
                  value={style.id}
                  checked={nameStyle === style.id}
                  disabled={isLoading}
                  onChange={() => setNameStyle(style.id)}
                  className="sr-only"
                />
                <span className="text-sm font-bold text-gray-100 font-display">{style.name}</span>
                <span className="text-xs text-gray-400 mt-1 leading-relaxed font-sans">{style.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={isFormValid && !isLoading ? { scale: 1.01 } : {}}
          whileTap={isFormValid && !isLoading ? { scale: 0.99 } : {}}
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            isFormValid && !isLoading
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-950/60 cursor-pointer"
              : "bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-850"
          }`}
          id="generate-names-btn"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Forging Modern Names...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 text-yellow-400 fill-current" />
              <span>Forge Startup Names</span>
              <ChevronRight className="h-4 w-4 font-bold" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
