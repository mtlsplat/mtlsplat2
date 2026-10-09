import React, { useState } from 'react';
import { 
  Maximize2, 
  RotateCcw, 
  ExternalLink, 
  Code, 
  HelpCircle,
  Eye, 
  EyeOff
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
  is3DPreviewEnabled = false,
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

  // Stage preview: clean view without SuperSplat UI clutter (&noui), live turntable animation
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
    <div className="relative z-10 space-y-4 w-full max-w-full overflow-hidden text-black">
      {/* Primary Cinema Viewport Stage (Black Border, Brutalist Header) */}
      <div className="relative w-full bg-white border border-black shadow-[4px_4px_0px_#000000] overflow-hidden flex flex-col">
        {/* Cinema Stage Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-black z-20 w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            <span className="w-2.5 h-2.5 bg-black shrink-0" />
            <div className="min-w-0 truncate">
              <h2 className="text-sm sm:text-base font-black uppercase text-black flex items-center gap-2 truncate">
                <span className="truncate">{currentSplat.title}</span>
                <span className="text-xs font-mono font-normal text-black/60 hidden sm:inline shrink-0">
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
              className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-black ${
                isPreviewActive
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              {isPreviewActive ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-white" />
                  <span className="hidden md:inline">3D: ACTIF</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-black" />
                  <span className="hidden md:inline">3D: MASQUÉ</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenGuide}
              title="Guide navigation caméra"
              className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-mono uppercase text-black hover:bg-black hover:text-white border border-black transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">AIDE</span>
            </button>

            <button
              onClick={() => onOpenEmbed(currentSplat)}
              title="Obtenir le code HTML Iframe"
              className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-mono uppercase text-black hover:bg-black hover:text-white border border-black transition-colors flex items-center gap-1"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden md:inline">CODE</span>
            </button>

            <button
              onClick={() => setIframeKey((k) => k + 1)}
              title="Recharger le viewport"
              className="p-1.5 text-black hover:bg-black hover:text-white border border-black transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <a
              href={currentSplat.url}
              target="_blank"
              rel="noreferrer"
              title="Ouvrir la scène sur superspl.at"
              className="p-1.5 text-black hover:bg-black hover:text-white border border-black transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* FULLSCREEN BUTTON: ONLY SHOWN WHEN PREVIEW IS ACTIVE! */}
            {isPreviewActive && (
              <button
                onClick={() => onOpenExplore(currentSplat)}
                title="Afficher en plein écran immersif"
                className="py-1 px-2.5 sm:px-3 bg-black hover:bg-zinc-800 text-white border border-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PLEIN ÉCRAN</span>
              </button>
            )}
          </div>
        </div>

        {/* Big Stage Viewer Frame */}
        <div 
          className="relative w-full h-[340px] xs:h-[420px] sm:h-[540px] lg:h-[620px] bg-zinc-950"
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
                <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center p-4">
                  <div className="flex flex-col items-center gap-3 text-center max-w-sm border border-black bg-white p-5 shadow-[4px_4px_0px_#000000]">
                    <span className="text-xs font-mono uppercase tracking-widest text-black font-bold">
                      MODE ÉCO · PRÉVIEW 3D EN PAUSE
                    </span>
                    <p className="text-xs text-zinc-700 font-sans">
                      Le moteur 3D WebGL est mis en pause pour éviter de charger le processeur graphique (0% GPU).
                    </p>
                    <button
                      onClick={() => setLocalOverride(true)}
                      className="px-4 py-2 bg-black hover:bg-zinc-800 text-white border border-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>ACTIVER LE MODÈLE 3D</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Technical Details Strip */}
        <div className="p-3 sm:p-4 bg-white border-t border-black flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-black font-mono">
            <span className="font-bold border border-black px-1.5 py-0.5">ARCHIVE 3DGS</span>
            <span>·</span>
            <span>{currentSplat.splatCount || '1M splats'}</span>
            <span>·</span>
            <span className="text-black/70">{currentSplat.captureNotes || 'Volumetric Radiance Field'}</span>
          </div>

          <div className="text-zinc-700 text-xs max-w-lg">
            {currentSplat.description}
          </div>
        </div>
      </div>

      {/* Filmstrip Grid to Pick Active Model */}
      <div className="p-3 sm:p-4 bg-white border border-black">
        <div className="text-xs font-mono uppercase tracking-wider text-black font-bold mb-3 flex items-center justify-between border-b border-black pb-2">
          <span>CATALOGUE DES MODÈLES ({splats.length} SCÈNES)</span>
          <span className="text-[10px] text-black/60 font-mono">CLIQUER POUR CHARGER DANS LA SCÈNE</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {splats.map((splat) => {
            const isSelected = splat.id === currentSplat.id;
            return (
              <button
                key={splat.id}
                onClick={() => onSelectSplat(splat.id)}
                className={`p-2.5 border text-left transition-all ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-black border-black hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono uppercase truncate max-w-[100px] ${
                    isSelected ? 'text-white/80' : 'text-black/60'
                  }`}>
                    {splat.supersplatId}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 bg-white shrink-0" />
                  )}
                </div>
                <h4 className="text-xs font-black uppercase truncate">
                  {splat.title}
                </h4>
                <p className={`text-[10px] font-mono uppercase truncate mt-0.5 ${
                  isSelected ? 'text-white/70' : 'text-black/50'
                }`}>
                  {splat.splatCount || '1M RADIANCE'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

