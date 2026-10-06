/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SplatItem, ViewMode } from './types/splat';
import { DEFAULT_SPLATS } from './data/defaultSplats';
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
  Radio, 
  ExternalLink 
} from 'lucide-react';

const STORAGE_KEY = 'gaussian_splats_gallery_data_v2';

export default function App() {
  const [splats, setSplats] = useState<SplatItem[]>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      const savedV1 = localStorage.getItem('gaussian_splats_gallery_data');
      if (savedV1) {
        const parsedV1 = JSON.parse(savedV1);
        if (Array.isArray(parsedV1)) {
          const customOnly = parsedV1.filter((s: SplatItem) => !s.isUserOriginal);
          return [...DEFAULT_SPLATS, ...customOnly];
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

  // Cycle navigation in modal
  const handleModalNext = () => {
    if (!modalSplat || filteredSplats.length <= 1) return;
    const currentIndex = filteredSplats.findIndex((s) => s.id === modalSplat.id);
    const nextIndex = (currentIndex + 1) % filteredSplats.length;
    setModalSplat(filteredSplats[nextIndex]);
  };

  const handleModalPrev = () => {
    if (!modalSplat || filteredSplats.length <= 1) return;
    const currentIndex = filteredSplats.findIndex((s) => s.id === modalSplat.id);
    const prevIndex = (currentIndex - 1 + filteredSplats.length) % filteredSplats.length;
    setModalSplat(filteredSplats[prevIndex]);
  };

  const hasCustomSplats = splats.some((s) => !s.isUserOriginal);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col selection:bg-sky-500/30 selection:text-white w-full max-w-full overflow-x-hidden">
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
      />

      {/* Hero Banner Area */}
      <section className="relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 via-zinc-950/60 to-transparent w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>SuperSplat 3D Engine · WebGL Radiance Fields</span>
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                3D Gaussian Splat Gallery
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Explore photorealistic 3D radiance fields and volumetric splats in real-time 6-DoF. 
                Interact smoothly inside each viewport, compare reconstructions side-by-side, or launch immersive full-screen modals.
              </p>
            </div>

            {/* Quick Stats / Info strip (Zero-pill compliant: unboxed text) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-zinc-400 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="block text-zinc-500 text-[10px] uppercase">Models In Gallery</span>
                <span className="text-zinc-200 font-semibold text-sm">{splats.length} Scenes</span>
              </div>
              <div className="w-[1px] h-6 bg-zinc-800" />
              <div>
                <span className="block text-zinc-500 text-[10px] uppercase">Tracking Support</span>
                <span className="text-emerald-400 font-semibold text-sm">XR Enabled</span>
              </div>
              <div className="w-[1px] h-6 bg-zinc-800" />
              <div>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="text-left group text-sky-400 hover:text-sky-300"
                >
                  <span className="block text-zinc-500 text-[10px] uppercase">Navigation</span>
                  <span className="font-semibold text-sm underline underline-offset-2">Help Guide</span>
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
          />
        )}

        {/* VIEW MODE 3: DUAL SPLIT COMPARE */}
        {viewMode === 'compare' && (
          <DualCompareView
            splats={splats}
            onOpenExplore={(s) => setModalSplat(s)}
            onOpenEmbed={(s) => setEmbedSplat(s)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/80 mt-12 sm:mt-16 py-6 sm:py-8 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <span>3D Gaussian Splat Gallery</span>
            <span aria-hidden="true">·</span>
            <span>SuperSplat WebGL Integration</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">xr-spatial-tracking</span>
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

      {/* MODALS */}
      {/* Fullscreen Interactive 3D Viewer Modal */}
      <FullscreenViewerModal
        splat={modalSplat}
        isOpen={!!modalSplat}
        onClose={() => setModalSplat(null)}
        onNext={handleModalNext}
        onPrev={handleModalPrev}
        onOpenEmbed={(s) => setEmbedSplat(s)}
        onOpenGuide={() => setIsGuideOpen(true)}
        hasMultiple={filteredSplats.length > 1}
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
