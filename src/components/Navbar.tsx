import React from 'react';
import { 
  Box, 
  LayoutGrid, 
  Columns, 
  Tv, 
  Plus, 
  HelpCircle, 
  Search,
  RotateCcw
} from 'lucide-react';
import { ViewMode } from '../types/splat';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenGuide: () => void;
  onResetDefaults?: () => void;
  hasCustomSplats: boolean;
}

const MtlSplatEmblem: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mtlBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
      <radialGradient id="mtlGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="18" cy="18" r="16" stroke="url(#mtlBrandGrad)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.35" />
    <circle cx="18" cy="18" r="6" fill="url(#mtlGlow)" />
    <path d="M18 5L29 11.5V24.5L18 31L7 24.5V11.5L18 5Z" stroke="url(#mtlBrandGrad)" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M18 5V18L29 24.5M18 18L7 24.5" stroke="url(#mtlBrandGrad)" strokeWidth="1.4" strokeLinejoin="round" opacity="0.8" />
    <circle cx="18" cy="5" r="1.8" fill="#38bdf8" />
    <circle cx="29" cy="11.5" r="1.8" fill="#818cf8" />
    <circle cx="29" cy="24.5" r="1.8" fill="#c084fc" />
    <circle cx="18" cy="31" r="1.8" fill="#38bdf8" />
    <circle cx="7" cy="24.5" r="1.8" fill="#818cf8" />
    <circle cx="7" cy="11.5" r="1.8" fill="#c084fc" />
    <circle cx="18" cy="18" r="2.2" fill="#ffffff" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenGuide,
  onResetDefaults,
  hasCustomSplats,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-purple-500/15 border border-sky-500/30 flex items-center justify-center shadow-sm shrink-0 shadow-sky-500/10">
              <MtlSplatEmblem />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                  <span className="text-white">MTL</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">SPLAT</span>
                </h1>
                <span className="inline-block text-[9px] sm:text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1 sm:px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">
                  MTL · 3DGS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 hidden md:block truncate">
                Montréal 3D Gaussian Splats & Objets Urbains
              </p>
            </div>
          </div>

          {/* Center: View Tabs & Search */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher (Clean Segmented control) */}
            <div className="flex items-center p-0.5 sm:p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Grid Gallery View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grid</span>
              </button>

              <button
                onClick={() => onViewModeChange('cinema')}
                className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'cinema'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Cinema Hero View"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cinema</span>
              </button>

              <button
                onClick={() => onViewModeChange('compare')}
                className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'compare'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Side-by-Side Dual Compare"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Compare</span>
              </button>
            </div>

            {/* Quick search (Desktop only) */}
            <div className="relative hidden lg:block w-40 xl:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter splats..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenGuide}
              title="Controls & Navigation Guide"
              className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            </button>

            {hasCustomSplats && onResetDefaults && (
              <button
                onClick={onResetDefaults}
                title="Reset to Original Default Models"
                className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors hidden sm:block"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded-lg text-xs font-semibold transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Splat</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
