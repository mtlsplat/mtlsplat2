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

const MtlSplatEmblem: React.FC = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mtlBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
      <radialGradient id="mtlGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="18" cy="18" r="16" stroke="url(#mtlBrandGrad)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.35" />
    <circle cx="18" cy="18" r="6" fill="url(#mtlGlow)" />
    <path d="M18 5L29 11.5V24.5L18 31L7 24.5V11.5L18 5Z" stroke="url(#mtlBrandGrad)" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M18 5V18L29 24.5M18 18L7 24.5" stroke="url(#mtlBrandGrad)" strokeWidth="1.4" strokeLinejoin="round" opacity="0.8" />
    <circle cx="18" cy="5" r="1.8" fill="#0284c7" />
    <circle cx="29" cy="11.5" r="1.8" fill="#6366f1" />
    <circle cx="29" cy="24.5" r="1.8" fill="#9333ea" />
    <circle cx="18" cy="31" r="1.8" fill="#0284c7" />
    <circle cx="7" cy="24.5" r="1.8" fill="#6366f1" />
    <circle cx="7" cy="11.5" r="1.8" fill="#9333ea" />
    <circle cx="18" cy="18" r="2.2" fill="#0f172a" />
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
  isPlayingAudio,
  onToggleAudio,
  is3DPreviewEnabled,
  onToggle3DPreview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 border border-sky-200 flex items-center justify-center shadow-xs shrink-0">
              <MtlSplatEmblem />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                  <span className="text-zinc-950">MTL</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">SPLAT</span>
                </h1>
                <span className="inline-block text-[9px] sm:text-[10px] font-mono text-sky-700 bg-sky-50 px-1 sm:px-1.5 py-0.5 rounded border border-sky-200 shrink-0 font-medium">
                  MTL · 3DGS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 hidden md:block truncate">
                Montréal 3D Gaussian Splats & Objets Urbains
              </p>
            </div>
          </div>

          {/* Center: View Tabs & Search */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 sm:p-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80'
                    : 'text-zinc-600 hover:text-zinc-900'
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
                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80'
                    : 'text-zinc-600 hover:text-zinc-900'
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
                    ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Side-by-Side Dual Compare"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Compare</span>
              </button>
            </div>

            {/* Quick search (Desktop only) */}
            <div className="relative hidden lg:block w-40 xl:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filtrer les scènes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-zinc-100 border border-zinc-200 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 3D Previews Toggle (Masquer / Démasquer Preview) */}
            <button
              onClick={onToggle3DPreview}
              title={
                is3DPreviewEnabled
                  ? 'Masquer les previews 3D pour alléger (Mode Éco / Images statiques)'
                  : 'Démasquer les previews 3D animées'
              }
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                is3DPreviewEnabled
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800 shadow-xs font-semibold'
              }`}
            >
              {is3DPreviewEnabled ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  <span className="hidden md:inline font-mono text-[11px]">3D Live</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline font-mono text-[11px]">Mode Léger</span>
                </>
              )}
            </button>

            {/* Ambient Soundtrack Toggle Button */}
            <button
              onClick={onToggleAudio}
              title={isPlayingAudio ? 'Mettre la musique en sourdine (Soundtrack)' : 'Activer la bande-son ambiante de Montréal'}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isPlayingAudio
                  ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  <span className="hidden md:inline font-mono text-[11px]">Musique</span>
                  <span className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-2.5 bg-sky-500 rounded-full animate-pulse" />
                    <span className="w-0.5 h-1.5 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-0.5 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden md:inline font-mono text-[11px]">Son OFF</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenGuide}
              title="Guide des contrôles"
              className="p-1.5 sm:p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
            </button>

            {hasCustomSplats && onResetDefaults && (
              <button
                onClick={onResetDefaults}
                title="Réinitialiser les modèles originaux"
                className="p-1.5 sm:p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200 transition-colors hidden sm:block"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Ajouter Splat</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
