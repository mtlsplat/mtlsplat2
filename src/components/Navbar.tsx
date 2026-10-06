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
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm shrink-0">
              <Box className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight truncate">
                  <span className="hidden sm:inline">Gaussian Splat Gallery</span>
                  <span className="sm:hidden">Splat Gallery</span>
                </h1>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1 sm:px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">
                  3D
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 hidden md:block truncate">
                Interactive SuperSplat Radiance Fields
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
