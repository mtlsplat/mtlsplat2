/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SplatItem, ViewMode } from './types/splat';
import { DEFAULT_SPLATS } from './data/defaultSplats';
import { soundtrack } from './services/soundtrackService';
import { Navbar } from './components/Navbar';
import { SplatCard } from './components/SplatCard';
import { DualCompareView } from './components/DualCompareView';
import { CinemaView } from './components/CinemaView';
import { FullscreenViewerModal } from './components/FullscreenViewerModal';
import { EmbedCodeModal } from './components/EmbedCodeModal';
import { AddSplatModal } from './components/AddSplatModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Plus, 
  Columns, 
  Compass, 
  Eye, 
  EyeOff,
  Radio, 
  ExternalLink 
} from 'lucide-react';

const STORAGE_KEY = 'gaussian_splats_gallery_data_v5';

const restoreLiveAnimation = (item: SplatItem): SplatItem => {
  if (item.url.includes('superspl.at')) {
    const cleanUrl = item.url.replace(/[?&]noanim/g, '').replace(/[?&]noui/g, '');
    return { ...item, url: cleanUrl };
  }
  return item;
};

const mergeWithDefaults = (item: SplatItem): SplatItem => {
  const cleanItem = restoreLiveAnimation(item);
  if (cleanItem.isUserOriginal) {
    const match = DEFAULT_SPLATS.find((d) => d.id === cleanItem.id || d.supersplatId === cleanItem.supersplatId);
    if (match) {
      return { ...match, ...cleanItem, posterUrl: match.posterUrl, splatCount: match.splatCount };
    }
  }
  return cleanItem;
};

export default function App() {
  const [splats, setSplats] = useState<SplatItem[]>(() => {
    try {
      const savedV5 = localStorage.getItem(STORAGE_KEY);
      if (savedV5) {
        const parsed = JSON.parse(savedV5);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(mergeWithDefaults);
        }
      }

      const savedV4 = localStorage.getItem('gaussian_splats_gallery_data_v4');
      if (savedV4) {
        const parsedV4 = JSON.parse(savedV4);
        if (Array.isArray(parsedV4) && parsedV4.length > 0) {
          return parsedV4.map(mergeWithDefaults);
        }
      }

      const savedV3 = localStorage.getItem('gaussian_splats_gallery_data_v3');
      if (savedV3) {
        const parsedV3 = JSON.parse(savedV3);
        if (Array.isArray(parsedV3) && parsedV3.length > 0) {
          return parsedV3.map(mergeWithDefaults);
        }
      }

      const savedV2 = localStorage.getItem('gaussian_splats_gallery_data_v2');
      if (savedV2) {
        const parsedV2 = JSON.parse(savedV2);
        if (Array.isArray(parsedV2) && parsedV2.length > 0) {
          return parsedV2.map(mergeWithDefaults);
        }
      }

      const savedV1 = localStorage.getItem('gaussian_splats_gallery_data');
      if (savedV1) {
        const parsedV1 = JSON.parse(savedV1);
        if (Array.isArray(parsedV1)) {
          const customOnly = parsedV1.filter((s: SplatItem) => !s.isUserOriginal);
          return [...DEFAULT_SPLATS, ...customOnly.map(mergeWithDefaults)];
        }
      }
    } catch (e) {
      console.error('Failed to load saved splats from storage', e);
    }
    return DEFAULT_SPLATS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modals state
  const [modalSplat, setModalSplat] = useState<SplatItem | null>(null);
  const [embedSplat, setEmbedSplat] = useState<SplatItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Cinema view selected ID
  const [cinemaId, setCinemaId] = useState<string>(splats[0]?.id || '');

  // Ambient soundtrack state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 3D Preview Active State (User can toggle off to reduce GPU load on low-spec PCs)
  const [is3DPreviewEnabled, setIs3DPreviewEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mtlsplat_preview_enabled');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // default
    }
    return true;
  });

  const handleToggle3DPreview = () => {
    setIs3DPreviewEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mtlsplat_preview_enabled', String(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  const handleToggleAudio = () => {
    const next = soundtrack.toggle();
    setIsPlayingAudio(next);
  };

  // Attempt auto-start ambient music on first user gesture (satisfying browser autoplay policy)
  useEffect(() => {
    const handleFirstGesture = () => {
      soundtrack.start().then((started) => {
        if (started) setIsPlayingAudio(true);
      });
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Save to localStorage whenever splats change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(splats));
    } catch (e) {
      console.error('Failed to save splats to storage', e);
    }
  }, [splats]);

  const handleAddSplat = (newSplat: SplatItem) => {
    setSplats((prev) => [newSplat, ...prev]);
    setCinemaId(newSplat.id);
  };

  const handleDeleteSplat = (id: string) => {
    setSplats((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset gallery to the original 3D Gaussian Splats?')) {
      setSplats(DEFAULT_SPLATS);
      setCinemaId(DEFAULT_SPLATS[0].id);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Categories list
  const categories = ['All', ...Array.from(new Set(splats.map((s) => s.category)))];

  // Filtered splats
  const filteredSplats = splats.filter((splat) => {
    const matchesSearch = 
      splat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      splat.supersplatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      splat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      splat.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || splat.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const hasCustomSplats = splats.some((s) => !s.isUserOriginal);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col selection:bg-sky-500/30 selection:text-white w-full max-w-full overflow-x-hidden relative">
      {/* Underlying Page Content (Automatically blurred when fullscreen modal is in foreground) */}
      <div className={`flex flex-col flex-1 w-full transition-all duration-300 ${
        modalSplat ? 'filter blur-md brightness-75 scale-[0.99] origin-center pointer-events-none select-none' : ''
      }`}>
        {/* Top Navbar */}
        <Navbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => setIsAddOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onResetDefaults={hasCustomSplats ? handleResetDefaults : undefined}
          hasCustomSplats={hasCustomSplats}
          isPlayingAudio={isPlayingAudio}
          onToggleAudio={handleToggleAudio}
          is3DPreviewEnabled={is3DPreviewEnabled}
          onToggle3DPreview={handleToggle3DPreview}
        />

        {/* Hero Banner Area */}
        <section className="relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 via-zinc-950/60 to-transparent w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Montréal · Captures Spatiales 3D & Objets Urbains</span>
                </div>
                
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-2 sm:gap-3">
                  <span>MTL</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">SPLAT</span>
                </h2>
                
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  <strong className="text-zinc-100 font-semibold">MTLSPLAT</strong> est une archive 3D dédiée à la capture volumétrique des objets, machines et reliques emblématiques de Montréal. Motos urbaines sur le bitume, vélos de montagne taillés pour les sentiers du Mont-Royal ou artefacts des ruelles : chaque scène est immortalisée en Gaussian Splats photoréalistes avec reflets et profondeur en 6-DoF temps réel.
                </p>

                {/* Cultural badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-sky-300">
                    📍 Montréal, QC
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    🔬 Gaussian Splats (3DGS)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                    ⚡ WebGL 6-DoF
                  </span>
                </div>
              </div>

              {/* Quick Stats / Info strip */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-zinc-400 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-6">
                <div>
                  <span className="block text-zinc-500 text-[10px] uppercase">Archives MTL</span>
                  <span className="text-zinc-200 font-semibold text-sm">{splats.length} Scènes 3D</span>
                </div>
                <div className="w-[1px] h-6 bg-zinc-800" />
                <div>
                  <span className="block text-zinc-500 text-[10px] uppercase">Immersion XR</span>
                  <span className="text-emerald-400 font-semibold text-sm">Prêt pour VR</span>
                </div>
                <div className="w-[1px] h-6 bg-zinc-800" />
                <div>
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="text-left group text-sky-400 hover:text-sky-300"
                  >
                    <span className="block text-zinc-500 text-[10px] uppercase">Navigation</span>
                    <span className="font-semibold text-sm underline underline-offset-2">Guide Caméra</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Category Filter Bar */}
            {categories.length > 2 && (
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs text-zinc-500 font-mono mr-1 shrink-0">Filter:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-hidden">
          {/* VIEW MODE 1: GRID VIEW */}
          {viewMode === 'grid' && (
            <div>
              {/* Performance & Eco Mode Control Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 sm:px-4 sm:py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    is3DPreviewEnabled ? 'bg-sky-400' : 'bg-emerald-400'
                  }`} />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0 truncate">
                    <span className="font-semibold text-zinc-100 truncate">
                      {is3DPreviewEnabled ? 'Previews 3D Temps Réel Actives' : 'Mode Léger Actif (Previews Masquées)'}
                    </span>
                    <span className="text-zinc-400 text-[11px] truncate">
                      {is3DPreviewEnabled 
                        ? '6-DoF WebGL · Consomme des ressources GPU' 
                        : '0% de charge GPU · Idéal pour alléger les ordinateurs plus lents'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggle3DPreview}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border shrink-0 ${
                    is3DPreviewEnabled
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 font-semibold'
                  }`}
                  title={
                    is3DPreviewEnabled 
                      ? 'Masquer les previews 3D pour alléger votre machine' 
                      : 'Démasquer les previews 3D interactives'
                  }
                >
                  {is3DPreviewEnabled ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Masquer les previews (Alléger)</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-white" />
                      <span>Démasquer les previews 3D</span>
                    </>
                  )}
                </button>
              </div>

              {filteredSplats.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
                  <Compass className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-zinc-300">No Gaussian Splats found</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your search query or clear the active category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {filteredSplats.map((splat) => (
                    <SplatCard
                      key={splat.id}
                      splat={splat}
                      isModalOpen={!!modalSplat}
                      globalPreviewEnabled={is3DPreviewEnabled}
                      onExplore={(s) => setModalSplat(s)}
                      onEmbed={(s) => setEmbedSplat(s)}
                      onCompareSelect={(s) => {
                        setViewMode('compare');
                      }}
                      onDelete={handleDeleteSplat}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: CINEMA FOCUS VIEW */}
          {viewMode === 'cinema' && (
            <CinemaView
              splats={splats}
              selectedId={cinemaId}
              onSelectSplat={setCinemaId}
              onOpenExplore={(s) => setModalSplat(s)}
              onOpenEmbed={(s) => setEmbedSplat(s)}
              onOpenGuide={() => setIsGuideOpen(true)}
              isModalOpen={!!modalSplat}
              is3DPreviewEnabled={is3DPreviewEnabled}
            />
          )}

          {/* VIEW MODE 3: DUAL SPLIT COMPARE */}
          {viewMode === 'compare' && (
            <DualCompareView
              splats={splats}
              onOpenExplore={(s) => setModalSplat(s)}
              onOpenEmbed={(s) => setEmbedSplat(s)}
              isModalOpen={!!modalSplat}
              is3DPreviewEnabled={is3DPreviewEnabled}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/80 bg-zinc-950/80 mt-12 sm:mt-16 py-6 sm:py-8 w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 w-full overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-bold text-white tracking-tight">MTLSPLAT</span>
              <span aria-hidden="true">·</span>
              <span>Archive Spatiale des Objets Urbains de Montréal</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="font-mono text-zinc-600 hidden sm:inline">SuperSplat 6-DoF</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="hover:text-zinc-300 transition-colors"
              >
                Controls
              </button>
              <button
                onClick={() => setIsAddOpen(true)}
                className="hover:text-zinc-300 transition-colors"
              >
                Add Splat
              </button>
              <a
                href="https://superspl.at"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                <span>superspl.at</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {/* Fullscreen Interactive 3D Viewer Modal */}
      <FullscreenViewerModal
        splat={modalSplat}
        isOpen={!!modalSplat}
        onClose={() => setModalSplat(null)}
        onOpenEmbed={(s) => setEmbedSplat(s)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Embed Code Modal */}
      <EmbedCodeModal
        splat={embedSplat}
        isOpen={!!embedSplat}
        onClose={() => setEmbedSplat(null)}
      />

      {/* Add Splat Modal */}
      <AddSplatModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSplat}
      />

      {/* Controls & Spatial Navigation Guide Modal */}
      <ControlsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
