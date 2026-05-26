import { Sparkles, Heart } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  favoritesCount: number;
  onToggleFavorites: () => void;
  showFavorites: boolean;
}

export default function Header({ favoritesCount, onToggleFavorites, showFavorites }: HeaderProps) {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-gray-800/80 bg-darkslate sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-2.5 bg-indigo-50/10 text-indigo-400 rounded-xl"
            id="app-logo-container"
          >
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white">
              Venture<span className="text-indigo-400">Forge</span>
            </h1>
            <p className="text-xs text-gray-400 font-medium">Startup Name Generator</p>
          </div>
        </div>

        <motion.button
          whileHover={{ translateY: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleFavorites}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showFavorites 
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/40" 
              : "bg-gray-800/85 hover:bg-gray-800 text-gray-200 border border-gray-700/60"
          }`}
          id="toggle-favorites-btn"
        >
          <Heart className={`h-4 w-4 ${showFavorites ? "fill-current text-white" : "text-gray-400"}`} />
          <span>Saved Names</span>
          {favoritesCount > 0 && (
            <span className={`flex items-center justify-center text-xs font-bold leading-none h-5 px-1.5 rounded-full ${
              showFavorites ? "bg-white text-indigo-700" : "bg-indigo-500/20 text-indigo-300"
            }`}>
              {favoritesCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
}
