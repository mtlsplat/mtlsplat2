import React from 'react';
import { 
  LayoutGrid, 
  Columns, 
  Tv, 
  Plus, 
  HelpCircle, 
  Search,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
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
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
  is3DPreviewEnabled: boolean;
  onToggle3DPreview: () => void;
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
  isPlayingAudio,
  onToggleAudio,
  is3DPreviewEnabled,
  onToggle3DPreview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Logo / Brand Wordmark */}
          <div className="flex items-center gap-3 shrink min-w-0">
            {/* Minimalist Brutalist Logo Mark */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black text-white flex items-center justify-center font-black text-xs sm:text-sm tracking-tighter shrink-0 border border-black select-none">
              MTL
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-black uppercase">
                  MTLSPLAT
                </span>
                <span className="text-[10px] font-mono tracking-widest text-black/60 hidden sm:inline border-l border-black pl-2">
                  GAUSSIAN RADIANCE ARCHIVE
                </span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-black/50 hidden md:block truncate">
                Montréal · Captures 3D & Artefacts Urbains (6-DoF)
              </p>
            </div>
          </div>

          {/* Center: View Tabs & Search */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher */}
            <nav className="flex items-center border border-black bg-white" aria-label="View Modes">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors border-r border-black ${
                  viewMode === 'grid'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black/5'
                }`}
                title="Grid Gallery View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grille</span>
              </button>

              <button
                onClick={() => onViewModeChange('cinema')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors border-r border-black ${
                  viewMode === 'cinema'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black/5'
                }`}
                title="Cinema Hero View"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cinéma</span>
              </button>

              <button
                onClick={() => onViewModeChange('compare')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  viewMode === 'compare'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black/5'
                }`}
                title="Side-by-Side Dual Compare"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Comparer</span>
              </button>
            </nav>

            {/* Quick Search */}
            <div className="relative hidden lg:block w-36 xl:w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                type="text"
                placeholder="RECHERCHER..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white border border-black pl-8 pr-2.5 py-1 text-xs font-mono text-black placeholder:text-black/40 focus:outline-none focus:bg-zinc-50"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 3D Previews Toggle */}
            <button
              onClick={onToggle3DPreview}
              title={
                is3DPreviewEnabled
                  ? 'Désactiver les previews 3D (Mode Éco / 0% GPU)'
                  : 'Activer les previews 3D temps réel'
              }
              className={`p-1.5 sm:px-2.5 sm:py-1.5 border border-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                is3DPreviewEnabled
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              {is3DPreviewEnabled ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span className="hidden md:inline text-[11px]">3D: ON</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-black" />
                  <span className="hidden md:inline text-[11px]">3D: OFF</span>
                </>
              )}
            </button>

            {/* Ambient Soundtrack Toggle Button */}
            <button
              onClick={onToggleAudio}
              title={isPlayingAudio ? 'Couper la musique ambiante de Montréal' : 'Activer la bande-son ambiante'}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 border border-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                isPlayingAudio
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                  <span className="hidden md:inline text-[11px]">SON: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-black" />
                  <span className="hidden md:inline text-[11px]">SON: OFF</span>
                </>
              )}
            </button>

            {/* Controls Guide */}
            <button
              onClick={onOpenGuide}
              title="Guide des contrôles caméra"
              className="p-1.5 sm:px-2.5 sm:py-1.5 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-xs font-mono uppercase tracking-wider flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">AIDE</span>
            </button>

            {/* Reset Defaults */}
            {hasCustomSplats && onResetDefaults && (
              <button
                onClick={onResetDefaults}
                title="Réinitialiser la galerie par défaut"
                className="p-1.5 sm:px-2.5 sm:py-1.5 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-xs font-mono hidden sm:flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">RESET</span>
              </button>
            )}

            {/* Add Splat CTA */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-black text-white border border-black hover:bg-zinc-800 text-xs font-mono uppercase tracking-wider transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">AJOUTER</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

