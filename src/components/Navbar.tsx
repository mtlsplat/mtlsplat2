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
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
                  Gaussian Splat Gallery
                </h1>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                  3D WebGL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Interactive SuperSplat Radiance Fields
              </p>
            </div>
          </div>

          {/* Center: Search & View Tabs */}
          <div className="flex items-center gap-3 flex-1 max-w-lg justify-center">
            {/* View Mode Switcher (Clean Segmented control) */}
            <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
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

            {/* Quick search */}
            <div className="relative hidden lg:block w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter splats..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenGuide}
              title="Controls & Navigation Guide"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
            </button>

            {hasCustomSplats && onResetDefaults && (
              <button
                onClick={onResetDefaults}
                title="Reset to Original Default Models"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors hidden sm:block"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Splat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
