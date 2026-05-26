import { X, Trash2, Copy, Check, ExternalLink, Download } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StartupSuggestion } from "../types";

interface FavoritesSidebarProps {
  favorites: StartupSuggestion[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveFavorite: (name: string) => void;
  onClearAll: () => void;
}

export default function FavoritesSidebar({
  favorites,
  isOpen,
  onClose,
  onRemoveFavorite,
  onClearAll,
}: FavoritesSidebarProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    if (favorites.length === 0) return;
    
    const textToCopy = favorites
      .map(
        (f, idx) =>
          `${idx + 1}. ${f.name} - "${f.slogan}" [${f.category}]\n   Domain suggestion: ${f.domainIdea}\n   Strategy: ${f.rationale}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error("Failed to copy all", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay background for closing drawer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-45"
            id="favorites-overlay"
          />

          {/* Slide-over Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-darkslate shadow-2xl border-l border-gray-800/80 z-50 flex flex-col"
            id="favorites-sidebar"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  Saved Forges
                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-950/30 text-indigo-300 border border-indigo-900/40 rounded-full">
                    {favorites.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-400">Your curated list of venture opportunities</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {favorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="h-16 w-16 bg-gray-900/60 rounded-full flex items-center justify-center text-gray-500 mb-4 border border-gray-800/40">
                    <Trash2 className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-300">No saved names yet</h3>
                  <p className="text-xs text-gray-500 max-w-[240px] mt-1.5 leading-relaxed">
                    Brainstorm ideas or click the heart icon on suggestions to curate them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4.5">
                  <AnimatePresence initial={false}>
                    {favorites.map((fav) => (
                      <motion.div
                        key={fav.name}
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-4 flex items-start gap-3 relative group">
                          <div className="flex-1 min-w-0">
                            <span className="inline-block text-[9px] font-mono tracking-wider font-semibold text-indigo-400 uppercase mb-1">
                              {fav.category}
                            </span>
                            <h4 className="text-md font-bold text-white font-display truncate">
                              {fav.name}
                            </h4>
                            <p className="text-xs text-gray-350 font-medium truncate mt-0.5 mb-2">
                              “{fav.slogan}”
                            </p>
                            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono font-medium">
                              <span>{fav.domainIdea}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => onRemoveFavorite(fav.name)}
                            title="Remove from favorites"
                            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow-sm md:shadow-none cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer buttons when list exists */}
            {favorites.length > 0 && (
              <div className="p-6 border-t border-gray-800 bg-gray-950/30 space-y-3">
                <button
                  onClick={handleCopyAll}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-950/50 cursor-pointer"
                >
                  {copiedAll ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied Curated List!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Export All (Copy to Clipboard)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClearAll}
                  className="w-full py-2.5 px-4 bg-gray-900/40 hover:bg-rose-950/25 border border-gray-800 hover:border-rose-900/30 text-gray-400 hover:text-rose-400 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Saved Curations</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
