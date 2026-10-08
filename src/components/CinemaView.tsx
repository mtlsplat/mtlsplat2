import React, { useState } from 'react';
import { 
  Maximize2, 
  RotateCcw, 
  ExternalLink, 
  Code, 
  HelpCircle,
  Eye, 
  EyeOff,
  Layers, 
  Sliders
} from 'lucide-react';
import { SplatItem } from '../types/splat';
import { getSplatPosterUrl } from '../data/defaultSplats';

interface CinemaViewProps {
  splats: SplatItem[];
  selectedId: string;
  onSelectSplat: (id: string) => void;
  onOpenExplore: (splat: SplatItem) => void;
  onOpenEmbed: (splat: SplatItem) => void;
  onOpenGuide: () => void;
  isModalOpen?: boolean;
  is3DPreviewEnabled?: boolean;
}

export const CinemaView: React.FC<CinemaViewProps> = ({
  splats,
  selectedId,
  onSelectSplat,
  onOpenExplore,
  onOpenEmbed,
  onOpenGuide,
  isModalOpen = false,
  is3DPreviewEnabled = true,
}) => {
  const currentSplat = splats.find((s) => s.id === selectedId) || splats[0];
  const [iframeKey, setIframeKey] = useState(0);
  const [localOverride, setLocalOverride] = useState<boolean | null>(null);

  React.useEffect(() => {
    setLocalOverride(null);
  }, [is3DPreviewEnabled, selectedId]);

  const isPreviewActive = localOverride !== null ? localOverride : is3DPreviewEnabled;

  // High-res WebP poster
  const posterUrl = currentSplat ? getSplatPosterUrl(currentSplat) : '';

  // Stage preview: clean view without UI clutter, with live animation running
  const stageUrl = React.useMemo(() => {
    if (!currentSplat) return '';
    let url = currentSplat.url.replace(/[?&]noanim/g, '');
    if (!url.includes('noui')) {
      url = url.includes('?') ? `${url}&noui` : `${url}?noui`;
    }
    return url;
  }, [currentSplat]);

  if (!currentSplat) return null;

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Primary Cinema Viewport Stage */}
      <div className="relative w-full rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Cinema Stage Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur z-20 w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
            <div className="min-w-0 truncate">
              <h2 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2 truncate">
                <span className="truncate">{currentSplat.title}</span>
                <span className="text-xs font-mono font-normal text-zinc-400 hidden sm:inline shrink-0">
                  [{currentSplat.supersplatId}]
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Masquer / Démasquer Preview 3D */}
            <button
              onClick={() => setLocalOverride(!isPreviewActive)}
              title={
                isPreviewActive
                  ? 'Masquer le preview 3D pour alléger (Mode Éco)'
                  : 'Démasquer le preview 3D interactif'
              }
              className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 border ${
                isPreviewActive
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border-transparent'
                  : 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-400 text-white font-medium'
              }`}
            >
              {isPreviewActive ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">Masquer 3D</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-white" />
                  <span className="hidden md:inline">Activer 3D</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenGuide}
              title="Camera Navigation Guide"
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Controls</span>
            </button>

            <button
              onClick={() => onOpenEmbed(currentSplat)}
              title="Embed Code"
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <Code className="w-4 h-4" />
              <span className="hidden md:inline">Embed</span>
            </button>

            <button
              onClick={() => setIframeKey((k) => k + 1)}
              title="Reset View"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <a
              href={currentSplat.url}
              target="_blank"
              rel="noreferrer"
              title="Open full scene in SuperSplat"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => onOpenExplore(currentSplat)}
              title="Immersive Modal Fullscreen"
              className="py-1 px-2.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Big Stage Viewer Frame */}
        <div 
          className="relative w-full h-[340px] xs:h-[420px] sm:h-[540px] lg:h-[620px] bg-black"
          style={{ contain: 'strict', isolation: 'isolate', transform: 'translateZ(0)' }}
        >
          {isPreviewActive && !isModalOpen ? (
            <iframe
              key={iframeKey}
              src={stageUrl}
              loading="lazy"
              allow="fullscreen; xr-spatial-tracking"
              title={currentSplat.title}
              className="w-full h-full border-0 select-none block"
              style={{ transform: 'translateZ(0)' }}
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={posterUrl}
                alt={currentSplat.title}
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
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                  <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                    <button
                      onClick={() => setLocalOverride(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Charger la scène 3D temps réel</span>
                    </button>
                    <p className="text-xs text-zinc-300">
                      Prévisualisation masquée pour économiser les ressources (0% GPU).
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Technical Telemetry & Details Strip */}
        <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-zinc-400 font-mono">
            <span className="text-zinc-200">{currentSplat.category}</span>
            <span>·</span>
            <span>{currentSplat.splatCount || '1M splats'}</span>
            <span>·</span>
            <span className="text-emerald-400">XR Spatial Tracking Ready</span>
          </div>

          <div className="text-zinc-400 text-xs max-w-lg">
            {currentSplat.description}
          </div>
        </div>
      </div>

      {/* Filmstrip Carousel to Pick Active Model */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="text-xs font-mono uppercase text-zinc-400 mb-2 px-1 flex items-center justify-between">
          <span>Filmstrip Select ({splats.length} Models)</span>
          <span className="text-[11px] text-zinc-500">Click any card to load into stage</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {splats.map((splat) => {
            const isSelected = splat.id === currentSplat.id;
            return (
              <button
                key={splat.id}
                onClick={() => onSelectSplat(splat.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-zinc-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-sky-400 truncate max-w-[100px]">
                    {splat.supersplatId}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  )}
                </div>
                <h4 className="text-xs font-medium text-zinc-200 truncate">
                  {splat.title}
                </h4>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {splat.category}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
