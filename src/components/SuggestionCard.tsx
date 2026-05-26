import React, { useState, useEffect } from "react";
import { Heart, Copy, Check, Globe, HelpCircle, ArrowUpRight, Download, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { StartupSuggestion } from "../types";

interface SuggestionCardProps {
  suggestion: StartupSuggestion;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  key?: string | number;
}

export default function SuggestionCard({ suggestion, index, isFavorite, onToggleFavorite }: SuggestionCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [domainStatus, setDomainStatus] = useState<"checking" | "available" | "taken" | "error">("checking");
  const [domainReason, setDomainReason] = useState<string>("");

  useEffect(() => {
    let active = true;
    const checkAvailability = async () => {
      setDomainStatus("checking");
      try {
        const res = await fetch(`/api/check-domain?domain=${encodeURIComponent(suggestion.domainIdea)}`);
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          if (data.available) {
            setDomainStatus("available");
          } else {
            setDomainStatus("taken");
          }
          setDomainReason(data.reason || "");
        } else {
          setDomainStatus("error");
        }
      } catch (err) {
        console.error("Domain lookup error on client:", err);
        if (active) setDomainStatus("error");
      }
    };

    checkAvailability();
    return () => {
      active = false;
    };
  }, [suggestion.domainIdea]);

  const handleCopyName = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(suggestion.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleCopyDomain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(suggestion.domainIdea);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } catch (err) {
      console.error("Failed to copy domain idea", err);
    }
  };

  const handleDownloadBrief = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const brandColor = [11, 15, 25]; // #0B0F19 - Midnight color
      const accentColor = [109, 40, 217]; // #6D28D9 - Royal Violet
      const marginX = 20;
      let currentY = 25;

      // Header Banner
      doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.rect(0, 0, 210, 42, "F");

      // Content over Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("VENTURE BRIEF", marginX, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text("CURATED STRATEGIC ENTERPRISE DOSSIER", marginX, 30);

      // Accent border
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 42, 210, 3, "F");

      // Body setup
      currentY = 60;
      doc.setTextColor(55, 65, 81); // Charcoal

      // Section 1: Brand name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(156, 163, 175);
      doc.text("PROPOSED BRAND IDENTITY", marginX, currentY);
      
      currentY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(11, 15, 25);
      doc.text(suggestion.name, marginX, currentY);

      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(109, 40, 217);
      doc.text(`BRANDING CLASSIFICATION: ${suggestion.category.toUpperCase()}`, marginX, currentY);

      // Line
      currentY += 12;
      doc.setDrawColor(229, 231, 235);
      doc.line(marginX, currentY, 210 - marginX, currentY);

      // Section 2: Catchy Slogan
      currentY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(156, 163, 175);
      doc.text("HUMAN-CENTRIC BRAND PROMISE", marginX, currentY);

      currentY += 8;
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(15);
      doc.setTextColor(55, 65, 81);
      doc.text(`"${suggestion.slogan}"`, marginX, currentY);

      // Line
      currentY += 12;
      doc.line(marginX, currentY, 210 - marginX, currentY);

      // Section 3: Brand strategy details
      currentY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(156, 163, 175);
      doc.text("DESIGN & POSITIONING STRATEGY", marginX, currentY);

      currentY += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const splitRationale = doc.splitTextToSize(suggestion.rationale, 170);
      doc.text(splitRationale, marginX, currentY);

      // Line
      currentY += (splitRationale.length * 6) + 10;
      doc.line(marginX, currentY, 210 - marginX, currentY);

      // Section 4: Domain portfolio details as resolved
      currentY += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(156, 163, 175);
      doc.text("DIGITAL LANDING PORTFOLIO", marginX, currentY);

      currentY += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(5, 150, 105); 
      doc.text(suggestion.domainIdea, marginX, currentY);

      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text("Suggested primary host for global digital equity.", marginX, currentY);

      // Footer line
      doc.setDrawColor(229, 231, 235);
      doc.line(marginX, 275, 210 - marginX, 275);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text("Generated via VentureForge Startup Identity Synthesizer • Underwritten by Gemini AI", marginX, 281);

      doc.save(`VentureForge-${suggestion.name}-BrandBrief.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF brief", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-darkslate border border-gray-800 hover:border-indigo-500/30 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/10 hover:shadow-indigo-950/20 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row of Recommendation Card */}
        <div className="flex items-start justify-between gap-4 mb-3.5">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-indigo-950/30 text-indigo-300 border border-indigo-900/40 rounded-md text-[10px] font-semibold tracking-wider uppercase font-mono mb-2">
              {suggestion.category}
            </span>
            <h3 className="text-2xl font-bold font-display tracking-tight text-white group-hover:text-indigo-400">
              {suggestion.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Download Brief Button */}
            <button
              onClick={handleDownloadBrief}
              title="Download beautiful Brand Brief PDF"
              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-50/10 rounded-xl transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleCopyName}
              title="Copy name to clipboard"
              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-50/10 rounded-xl transition cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-green-400 animate-scale" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={onToggleFavorite}
              title={isFavorite ? "Remove from saved" : "Save name"}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isFavorite 
                  ? "text-rose-400 bg-rose-955/20 hover:bg-rose-950/40" 
                  : "text-gray-405 hover:text-rose-400 hover:bg-rose-950/20"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-rose-400" : "text-gray-400"}`} />
            </button>
          </div>
        </div>

        {/* Catchy Slogan */}
        <p className="text-indigo-200/90 font-semibold text-sm leading-relaxed mb-4">
          “{suggestion.slogan}”
        </p>

        {/* Detailed Rationale */}
        <div className="bg-gray-900/30 border border-gray-800/60 rounded-xl p-3.5 mb-4">
          <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">
            <HelpCircle className="h-3 w-3" />
            Brand Strategy
          </span>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {suggestion.rationale}
          </p>
        </div>
      </div>

      {/* Suggested Domain Row */}
      <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-auto">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-gray-400 font-mono">
            <Globe className="h-3.5 w-3.5 text-gray-500" />
            <span>{suggestion.domainIdea}</span>
          </div>

          {/* Real-time Availability status indicator widget */}
          <div className="inline-flex items-center gap-1.5 pl-1">
            {domainStatus === "checking" && (
              <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                <RefreshCw className="h-3 w-3 animate-spin text-gray-500" />
                DNS Lookups...
              </span>
            )}
            {domainStatus === "available" && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 py-0.5 px-1.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-450 animate-pulse inline-block" />
                DNS Inactive / Available
              </span>
            )}
            {domainStatus === "taken" && (
              <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium bg-amber-500/10 border border-amber-500/20 py-0.5 px-1.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                DNS Active / Registered
              </span>
            )}
            {domainStatus === "error" && (
              <span className="flex items-center gap-1 text-[10px] text-rose-450 font-mono" title="DNS error">
                <AlertCircle className="h-3 w-3 text-rose-500" /> Unresolved
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopyDomain}
            className="text-gray-450 hover:text-indigo-400 flex items-center gap-1 hover:underline transition cursor-pointer"
          >
            {copiedDomain ? (
              <span className="text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Copy Link <ArrowUpRight className="h-3 w-3" />
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
