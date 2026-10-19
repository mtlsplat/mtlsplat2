/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SplatItem, ViewMode } from './types/splat';
import { DEFAULT_SPLATS } from './data/defaultSplats';
import { soundtrack } from './services/soundtrackService';
import { Navbar } from './components/Navbar';
import { SplatCard } from './components/SplatCard';
import { CinemaView } from './components/CinemaView';
import { FullscreenViewerModal } from './components/FullscreenViewerModal';
import { AddSplatModal } from './components/AddSplatModal';
import { DeleteSplatModal } from './components/DeleteSplatModal';
import { EditDescriptionModal } from './components/EditDescriptionModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { SeoHelpModal } from './components/SeoHelpModal';
import { GlbViewer } from './components/GlbViewer';
import { MouseGradient } from './components/MouseGradient';
import { 
  Eye, 
  EyeOff, 
  Compass, 
  ExternalLink 
} from 'lucide-react';
import { 
  subscribeToRemoteSplats, 
  saveSplatToFirestore, 
  deleteSplatFromFirestore,
  updateSplatInFirestore
} from './firebase';

const STORAGE_KEY = 'gaussian_splats_gallery_data_v5';
const DELETED_KEY = 'gaussian_splats_deleted_ids_v1';

const getInitialDeletedIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(DELETED_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
};

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

const sortSplatsRecentFirst = (items: SplatItem[]): SplatItem[] => {
  return [...items].sort((a, b) => {
    const getTimestamp = (item: SplatItem) => {
      const parts = item.id.split('-');
      const lastPart = parts[parts.length - 1];
      const parsedTime = parseInt(lastPart, 10);
      if (!isNaN(parsedTime) && parsedTime > 1000000000) {
        return parsedTime;
      }
      return new Date(item.createdAt || '2026-01-01').getTime();
    };
    return getTimestamp(b) - getTimestamp(a);
  });
};

export default function App() {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => getInitialDeletedIds());
  const deletedIdsRef = useRef<Set<string>>(deletedIds);
  deletedIdsRef.current = deletedIds;

  const [splats, setSplats] = useState<SplatItem[]>(() => {
    const initialDeleted = getInitialDeletedIds();
    let initialList = DEFAULT_SPLATS;
    try {
      const savedV5 = localStorage.getItem(STORAGE_KEY);
      if (savedV5) {
        const parsed = JSON.parse(savedV5);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialList = parsed.map(mergeWithDefaults);
        }
      } else {
        const savedV4 = localStorage.getItem('gaussian_splats_gallery_data_v4');
        if (savedV4) {
          const parsedV4 = JSON.parse(savedV4);
          if (Array.isArray(parsedV4) && parsedV4.length > 0) {
            initialList = parsedV4.map(mergeWithDefaults);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load saved splats from storage', e);
    }

    return sortSplatsRecentFirst(initialList.filter((s) => !initialDeleted.has(s.id)));
  });

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [modalSplat, setModalSplat] = useState<SplatItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [splatToDelete, setSplatToDelete] = useState<SplatItem | null>(null);
  const [splatToEdit, setSplatToEdit] = useState<SplatItem | null>(null);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSeoHelpOpen, setIsSeoHelpOpen] = useState(false);
  
  // Cinema view selected ID
  const [cinemaId, setCinemaId] = useState<string>(splats[0]?.id || '');

  // Ambient soundtrack state (ON by default on page open)
  const [isPlayingAudio, setIsPlayingAudio] = useState(() => soundtrack.getIsDesiredPlaying());

  // 3D Preview Active State: OFF BY DEFAULT as explicitly requested
  const [is3DPreviewEnabled, setIs3DPreviewEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mtlsplat_preview_enabled');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // default
    }
    return false; // Previews OFF by default!
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
    soundtrack.toggle();
  };

  // Auto-start ambient soundtrack on page open and synchronize state
  useEffect(() => {
    const unsubscribe = soundtrack.subscribe((playing) => {
      setIsPlayingAudio(playing);
    });

    // Attempt to play music immediately when page opens
    soundtrack.start();

    return () => {
      unsubscribe();
    };
  }, []);

  const [cloudSynced, setCloudSynced] = useState(false);

  // Synchronize with Firestore real-time community collection
  useEffect(() => {
    const unsubscribe = subscribeToRemoteSplats(
      (remoteSplats) => {
        setCloudSynced(true);
        setSplats((prev) => {
          const currentDeleted = deletedIdsRef.current;
          const merged = DEFAULT_SPLATS.filter((d) => !currentDeleted.has(d.id)).map((d) => {
            const local = prev.find((p) => p.id === d.id);
            return local ? { ...d, ...local } : d;
          });
          const seen = new Set(merged.map((m) => m.id));

          // 1. Add or update remote splats from Firestore
          for (const remote of remoteSplats) {
            if (!currentDeleted.has(remote.id)) {
              if (seen.has(remote.id)) {
                const idx = merged.findIndex((m) => m.id === remote.id);
                if (idx !== -1) {
                  merged[idx] = { ...merged[idx], ...mergeWithDefaults(remote) };
                }
              } else {
                merged.push(mergeWithDefaults(remote));
                seen.add(remote.id);
              }
            }
          }

          // 2. Keep and auto-sync any local custom splats not yet present in Firestore
          for (const local of prev) {
            if (!currentDeleted.has(local.id) && !local.isUserOriginal && !seen.has(local.id)) {
              merged.push(local);
              seen.add(local.id);
              saveSplatToFirestore(local).catch(() => {});
            }
          }

          return sortSplatsRecentFirst(merged);
        });
      },
      (error) => {
        console.warn('Real-time sync error (falling back to local cache):', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Save to localStorage whenever splats change (offline & instant cache)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(splats));
    } catch (e) {
      console.error('Failed to save splats to storage', e);
    }
  }, [splats]);

  const handleAddSplat = async (newSplat: SplatItem) => {
    try {
      await saveSplatToFirestore(newSplat);
      setSplats((prev) => sortSplatsRecentFirst([newSplat, ...prev.filter((s) => s.id !== newSplat.id)]));
      setCinemaId(newSplat.id);
    } catch (err) {
      console.error('Failed to sync to Firestore:', err);
      setSplats((prev) => sortSplatsRecentFirst([newSplat, ...prev.filter((s) => s.id !== newSplat.id)]));
      setCinemaId(newSplat.id);
      throw err;
    }
  };

  const handleDeleteSplat = async (id: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {}
      deletedIdsRef.current = next;
      return next;
    });

    setSplats((prev) => {
      const remaining = sortSplatsRecentFirst(prev.filter((s) => s.id !== id));
      setCinemaId((currentCinemaId) => {
        if (currentCinemaId === id) {
          return remaining[0]?.id || '';
        }
        return currentCinemaId;
      });
      return remaining;
    });

    try {
      await deleteSplatFromFirestore(id);
    } catch (err) {
      console.warn('Failed to delete from Firestore:', err);
    }
  };

  const handleRequestDelete = (id: string) => {
    const target = splats.find((s) => s.id === id);
    if (target) {
      setSplatToDelete(target);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    await handleDeleteSplat(id);
    setSplatToDelete(null);
  };

  const handleUpdateSplat = async (splat: SplatItem, newTitle: string, newDescription: string) => {
    // 1. Immediate optimistic UI update
    setSplats((prev) =>
      sortSplatsRecentFirst(
        prev.map((s) => (s.id === splat.id ? { ...s, title: newTitle, description: newDescription } : s))
      )
    );

    if (modalSplat && modalSplat.id === splat.id) {
      setModalSplat((prev) => (prev ? { ...prev, title: newTitle, description: newDescription } : null));
    }

    // 2. Cloud sync: persist updated title and description to Firestore
    try {
      await updateSplatInFirestore(splat, newTitle, newDescription);
    } catch (err) {
      console.error('Failed to sync updated splat to Firestore:', err);
      throw err;
    }
  };

  // Filtered splats based on search query
  const filteredSplats = sortSplatsRecentFirst(
    splats.filter((splat) => {
      return (
        splat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        splat.supersplatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        splat.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
  );

  return (
    <div className="min-h-screen bg-white text-black flex flex-col selection:bg-black selection:text-white w-full max-w-full overflow-x-hidden relative font-sans">
      {/* Round Black Gradient Effect tracking mouse cursor across the page canvas (z-0, never over UI boxes or splat previews) */}
      <MouseGradient />

      {/* Underlying Page Content (Automatically blurred when fullscreen modal is in foreground) */}
      <div className={`flex flex-col flex-1 w-full transition-all duration-300 relative z-10 ${
        modalSplat ? 'filter blur-md brightness-75 scale-[0.99] origin-center pointer-events-none select-none' : ''
      }`}>
        {/* Top Navbar */}
        <Navbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => setIsAddOpen(true)}
          onOpenSecurityModal={() => setIsSecurityOpen(true)}
          isPlayingAudio={isPlayingAudio}
          onToggleAudio={handleToggleAudio}
          is3DPreviewEnabled={is3DPreviewEnabled}
          onToggle3DPreview={handleToggle3DPreview}
        />

        {/* Hero Banner: Minimalist Brutalist Typography & Montreal Spatial Archive Context */}
        <section className="relative border-b border-black bg-transparent w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full overflow-hidden">
            {/* Top Technical Kicker */}
            <div className="flex items-center justify-between border-b border-black pb-3 mb-6 text-xs font-mono uppercase tracking-widest text-black/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black shrink-0" />
                <span>MONTRÉAL · QC · 45.5017° N, 73.5673° W</span>
              </div>
              <span className="hidden sm:inline">SUPERSPATIAL ENGINE 6-DOF</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              {/* Massive Brutalist Headline & Editorial Body */}
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-black leading-none">
                  MTLSPLAT
                </h1>

                <p className="text-base sm:text-lg font-mono uppercase tracking-tight text-black font-bold">
                  Archive 3D des Objets Urbains, Motos & Artefacts de la Métropole
                </p>

                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal max-w-2xl">
                  <strong>MTLSPLAT</strong> documente l'écosystème matériel et urbain de Montréal grâce au Gaussian Splatting 3D (3DGS). Motocyclettes customisées stationnées sur l'asphalte du Mile-End, vélos de montagne (MTB) forgés pour les sous-bois du Mont-Royal ou artefacts des ruelles industrielles : chaque sujet est figé en champ de radiance photoréaliste volumétrique, navigable en 6 degrés de liberté (6-DoF) temps réel.
                </p>

                {/* Technical Meta Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono uppercase">
                  <span className="border border-black px-2.5 py-1 text-black font-bold bg-white relative z-10">
                    📍 MONTRÉAL (QC)
                  </span>
                  <span className="border border-black px-2.5 py-1 text-black bg-white relative z-10">
                    🔬 3D GAUSSIAN SPLATTING
                  </span>
                  <span className="border border-black px-2.5 py-1 text-black bg-white relative z-10">
                    ⚡ WEBGL 6-DOF STREAMING
                  </span>
                  <span className="border border-black px-2.5 py-1 text-black bg-white relative z-10">
                    🍃 PRÉVIEWS ALLÉGÉES PAR DÉFAUT
                  </span>
                  <span className="border border-black px-2.5 py-1 text-black bg-white relative z-10 flex items-center gap-1.5 font-bold">
                    <span className={`w-2 h-2 rounded-full ${cloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                    <span>CLOUD SYNC {cloudSynced ? 'ACTIF' : 'CONNECTÉ'}</span>
                  </span>
                </div>
              </div>

              {/* Brutalist KPI / Metrics Block */}
              <div className="border border-black p-4 sm:p-5 bg-zinc-50 flex flex-col justify-between gap-4 shrink-0 lg:w-72 shadow-[4px_4px_0px_#000000] relative z-10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-black/60 block">SCÈNES NUMÉRISÉES</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-black">{splats.length}</span>
                </div>

                <div className="border-t border-black pt-3">
                  <span className="text-[10px] font-mono uppercase text-black/60 block">ACCÉLÉRATION GPU</span>
                  <span className="text-xs font-mono font-bold uppercase text-black">
                    {is3DPreviewEnabled ? 'LIVE 3D ACTIF' : 'ÉCO ACTIF (0% GPU)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
          {/* VIEW MODE 1: GRID VIEW */}
          {viewMode === 'grid' && (
            <div>
              {/* Performance / Eco Mode Control Banner (Brutalist style) */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-3.5 sm:px-5 sm:py-3.5 bg-white border border-black shadow-[3px_3px_0px_#000000]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-3 h-3 border border-black shrink-0 ${
                    is3DPreviewEnabled ? 'bg-black' : 'bg-white'
                  }`} />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 min-w-0 truncate">
                    <span className="font-mono text-xs uppercase font-bold text-black truncate">
                      {is3DPreviewEnabled ? 'PRÉVIEWS 3D TEMPS RÉEL ACTIVÉES' : 'PRÉVIEWS 3D MASQUÉES PAR DÉFAUT (MODE LÉGER)'}
                    </span>
                    <span className="text-black/60 text-[11px] font-mono uppercase hidden md:inline truncate">
                      {is3DPreviewEnabled 
                        ? 'Consomme des ressources WebGL' 
                        : '0% de charge GPU · Idéal pour alléger la machine'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggle3DPreview}
                  className={`px-3 py-1.5 border border-black text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0 ${
                    is3DPreviewEnabled
                      ? 'bg-white hover:bg-black hover:text-white text-black'
                      : 'bg-black hover:bg-zinc-800 text-white font-bold'
                  }`}
                  title={
                    is3DPreviewEnabled 
                      ? 'Masquer toutes les previews 3D pour alléger votre machine' 
                      : 'Démasquer toutes les previews 3D interactives'
                  }
                >
                  {is3DPreviewEnabled ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>MASQUER TOUTES LES PRÉVIEWS</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>ACTIVER TOUTES LES PRÉVIEWS 3D</span>
                    </>
                  )}
                </button>
              </div>

              {filteredSplats.length === 0 ? (
                <div className="text-center py-20 border border-black bg-white p-8">
                  <Compass className="w-10 h-10 text-black mx-auto mb-3" />
                  <h3 className="text-sm font-black uppercase text-black font-mono">Aucun Gaussian Splat trouvé</h3>
                  <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto font-sans">
                    Modifiez vos termes de recherche pour afficher les captures 3D.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-black hover:bg-zinc-800 text-white border border-black transition-colors"
                  >
                    Effacer la recherche
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
                      onEdit={(s) => setSplatToEdit(s)}
                      onDelete={handleRequestDelete}
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
              onEdit={(s) => setSplatToEdit(s)}
              onDelete={handleRequestDelete}
              isModalOpen={!!modalSplat}
              is3DPreviewEnabled={is3DPreviewEnabled}
            />
          )}

          {/* VIEW MODE 3: GLB 3D MODEL VIEWER */}
          {viewMode === 'glb' && (
            <GlbViewer />
          )}
        </main>

        {/* Minimalist Brutalist Footer */}
        <footer className="border-t border-black bg-white mt-16 py-8 w-full overflow-hidden text-black font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs w-full overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-black uppercase tracking-tight text-sm">MTLSPLAT</span>
              <span aria-hidden="true">/</span>
              <span className="uppercase text-black/70">Archive Spatiale des Objets Urbains de Montréal</span>
              <span aria-hidden="true" className="hidden sm:inline">/</span>
              <span className="text-black/50 hidden sm:inline">SuperSplat 6-DoF</span>
            </div>

            <div className="flex items-center gap-4 uppercase font-bold text-[11px]">
              <button
                onClick={() => setIsSeoHelpOpen(true)}
                className="hover:underline transition-all flex items-center gap-1 text-black"
                title="Consulter le guide et le statut d'indexation Google"
              >
                <span>Google SEO</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </button>
              <button
                onClick={() => setIsAddOpen(true)}
                className="hover:underline transition-all"
              >
                Ajouter Splat
              </button>
              <a
                href="https://superspl.at"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 transition-all"
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
      />

      {/* Add Splat Modal */}
      <AddSplatModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSplat}
      />

      {/* Delete Splat Authorization Modal */}
      <DeleteSplatModal
        isOpen={!!splatToDelete}
        splat={splatToDelete}
        onClose={() => setSplatToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Edit Title & Description Modal */}
      <EditDescriptionModal
        isOpen={!!splatToEdit}
        splat={splatToEdit}
        onClose={() => setSplatToEdit(null)}
        onSave={handleUpdateSplat}
      />

      {/* Security Admin Password Settings Modal */}
      <SecuritySettingsModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      {/* Google SEO Indexing Guide Modal */}
      <SeoHelpModal
        isOpen={isSeoHelpOpen}
        onClose={() => setIsSeoHelpOpen(false)}
      />
    </div>
  );
}
