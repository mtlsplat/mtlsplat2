import React, { useState } from 'react';
import { Columns, ArrowLeftRight, Maximize2, ExternalLink, Code, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { SplatItem } from '../types/splat';
import { getSplatPosterUrl } from '../data/defaultSplats';

interface DualCompareViewProps {
  splats: SplatItem[];
  onOpenExplore: (splat: SplatItem) => void;
  onOpenEmbed: (splat: SplatItem) => void;
  isModalOpen?: boolean;
  is3DPreviewEnabled?: boolean;
}

export const DualCompareView: React.FC<DualCompareViewProps> = ({
  splats,
  onOpenExplore,
  onOpenEmbed,
  isModalOpen = false,
  is3DPreviewEnabled = false,
}) => {
  const [leftId, setLeftId] = useState<string>(splats[0]?.id || '');
  const [rightId, setRightId] = useState<string>(splats[1]?.id || splats[0]?.id || '');
  const [leftKey, setLeftKey] = useState(0);
  const [rightKey, setRightKey] = useState(0);
  const [localOverride, setLocalOverride] = useState<boolean | null>(null);

  React.useEffect(() => {
    setLocalOverride(null);
  }, [is3DPreviewEnabled]);

  const isPreviewActive = localOverride !== null ? localOverride : is3DPreviewEnabled;

  const leftSplat = splats.find((s) => s.id === leftId) || splats[0];
  const rightSplat = splats.find((s) => s.id === rightId) || splats[1] || splats[0];

  const leftPosterUrl = leftSplat ? getSplatPosterUrl(leftSplat) : '';
  const rightPosterUrl = rightSplat ? getSplatPosterUrl(rightSplat) : '';

  const handleSwap = () => {
    const temp = leftId;
    setLeftId(rightId);
    setRightId(temp);
  };

  const getCleanPreviewUrl = (rawUrl: string) => {
    let url = rawUrl.replace(/[?&]noanim/g, '');
    if (!url.includes('noui')) {
      url = url.includes('?') ? `${url}&noui` : `${url}?noui`;
    }
    return url;
  };

  if (!leftSplat || !rightSplat) {
    return (
      <div className="text-center py-20 text-black font-mono text-xs uppercase border border-black p-8 bg-white">
        Nécessite au moins un modèle 3D Gaussian Splat pour la comparaison.
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-4 w-full max-w-full overflow-hidden text-black">
      {/* Compare Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-white border border-black shadow-[4px_4px_0px_#000000] w-full overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 border border-black bg-black text-white shrink-0">
            <Columns className="w-4 h-4" />
          </div>
          <div className="min-w-0 truncate">
            <h3 className="text-sm font-black uppercase text-black truncate">Comparaison Spatiale Double (Side-by-Side)</h3>
            <p className="text-xs font-mono text-black/60 hidden sm:block truncate">Inspecter 2 champs de radiance en simultané avec viewports 6-DoF indépendants</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Masquer / Démasquer Preview 3D */}
          <button
            onClick={() => setLocalOverride(!isPreviewActive)}
            title={
              isPreviewActive
                ? 'Masquer les 2 vues 3D pour alléger (Mode Éco · 0% GPU)'
                : 'Activer les 2 prévisualisations 3D interactives'
            }
            className={`px-3 py-1.5 border border-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              isPreviewActive
                ? 'bg-black text-white hover:bg-zinc-800'
                : 'bg-white text-black hover:bg-black/5'
            }`}
          >
            {isPreviewActive ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">3D: ACTIF</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-black" />
                <span>ACTIVER 3D</span>
              </>
            )}
          </button>

          <button
            onClick={handleSwap}
            className="px-3 py-1.5 border border-black bg-white hover:bg-black hover:text-white text-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>INTERVERTIR</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Viewports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* Left Viewport */}
        <div className="flex flex-col bg-white border border-black shadow-[4px_4px_0px_#000000] overflow-hidden w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-black w-full overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 bg-black shrink-0" />
              <select
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className="bg-white border border-black px-2 py-1 text-xs font-mono uppercase text-black focus:outline-none max-w-[140px] sm:max-w-[220px] truncate"
              >
                {splats.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.supersplatId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setLeftKey((k) => k + 1)}
                title="Recharger le viewport gauche"
                className="p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenEmbed(leftSplat)}
                title="Obtenir le code HTML"
                className="p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors hidden xs:block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              {/* FULLSCREEN BUTTON ONLY WHEN PREVIEW IS ACTIVE */}
              {isPreviewActive && (
                <button
                  onClick={() => onOpenExplore(leftSplat)}
                  title="Afficher en plein écran"
                  className="p-1.5 border border-black bg-black text-white hover:bg-zinc-800 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Viewer Frame */}
          <div 
            className="relative w-full h-[300px] sm:h-[450px] bg-zinc-950"
            style={{ contain: 'strict', isolation: 'isolate', transform: 'translateZ(0)' }}
          >
            {isPreviewActive && !isModalOpen ? (
              <iframe
                key={leftKey}
                src={getCleanPreviewUrl(leftSplat.url)}
                loading="lazy"
                allow="fullscreen; xr-spatial-tracking"
                title={leftSplat.title}
                className="w-full h-full border-0 block"
                style={{ transform: 'translateZ(0)' }}
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={leftPosterUrl}
                  alt={leftSplat.title}
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('/v1/')) {
                      target.src = target.src.replace('/v1/', '/v2/');
                    } else if (target.src.includes('/v2/')) {
                      target.src = target.src.replace('/v2/', '/v1/');
                    }
                  }}
                />
                {!isModalOpen && (
                  <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center p-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-black bg-white px-3 py-1.5 border border-black shadow-[2px_2px_0px_#000000]">
                      PRÉVIEW 3D DÉSACTIVÉE (0% GPU)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="p-3 text-xs text-black flex items-center justify-between bg-white border-t border-black font-mono">
            <span className="truncate">{leftSplat.splatCount || '1M RADIANCE'} · 6-DOF</span>
            <span className="text-black/60 shrink-0 ml-2">ID: {leftSplat.supersplatId}</span>
          </div>
        </div>

        {/* Right Viewport */}
        <div className="flex flex-col bg-white border border-black shadow-[4px_4px_0px_#000000] overflow-hidden w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-black w-full overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 bg-black shrink-0" />
              <select
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className="bg-white border border-black px-2 py-1 text-xs font-mono uppercase text-black focus:outline-none max-w-[140px] sm:max-w-[220px] truncate"
              >
                {splats.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.supersplatId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setRightKey((k) => k + 1)}
                title="Recharger le viewport droit"
                className="p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenEmbed(rightSplat)}
                title="Obtenir le code HTML"
                className="p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors hidden xs:block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              {/* FULLSCREEN BUTTON ONLY WHEN PREVIEW IS ACTIVE */}
              {isPreviewActive && (
                <button
                  onClick={() => onOpenExplore(rightSplat)}
                  title="Afficher en plein écran"
                  className="p-1.5 border border-black bg-black text-white hover:bg-zinc-800 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Viewer Frame */}
          <div 
            className="relative w-full h-[300px] sm:h-[450px] bg-zinc-950"
            style={{ contain: 'strict', isolation: 'isolate', transform: 'translateZ(0)' }}
          >
            {isPreviewActive && !isModalOpen ? (
              <iframe
                key={rightKey}
                src={getCleanPreviewUrl(rightSplat.url)}
                loading="lazy"
                allow="fullscreen; xr-spatial-tracking"
                title={rightSplat.title}
                className="w-full h-full border-0 block"
                style={{ transform: 'translateZ(0)' }}
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={rightPosterUrl}
                  alt={rightSplat.title}
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('/v1/')) {
                      target.src = target.src.replace('/v1/', '/v2/');
                    } else if (target.src.includes('/v2/')) {
                      target.src = target.src.replace('/v2/', '/v1/');
                    }
                  }}
                />
                {!isModalOpen && (
                  <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center p-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-black bg-white px-3 py-1.5 border border-black shadow-[2px_2px_0px_#000000]">
                      PRÉVIEW 3D DÉSACTIVÉE (0% GPU)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="p-3 text-xs text-black flex items-center justify-between bg-white border-t border-black font-mono">
            <span className="truncate">{rightSplat.splatCount || '1M RADIANCE'} · 6-DOF</span>
            <span className="text-black/60 shrink-0 ml-2">ID: {rightSplat.supersplatId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

