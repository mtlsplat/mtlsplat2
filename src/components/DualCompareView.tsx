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
  is3DPreviewEnabled = true,
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
      <div className="text-center py-20 text-zinc-400">
        Requires at least one 3D Gaussian Splat to compare.
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Compare Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 w-full overflow-hidden">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <Columns className="w-4 h-4" />
          </div>
          <div className="min-w-0 truncate">
            <h3 className="text-sm font-semibold text-zinc-100 truncate">Dual Spatial Comparison</h3>
            <p className="text-xs text-zinc-400 hidden sm:block truncate">Inspect two radiance fields side-by-side with independent 6-DoF viewports</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Masquer / Démasquer Preview 3D */}
          <button
            onClick={() => setLocalOverride(!isPreviewActive)}
            title={
              isPreviewActive
                ? 'Masquer les 2 vues 3D pour alléger (Mode Éco · 0% GPU)'
                : 'Démasquer les 2 vues 3D interactives'
            }
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              isPreviewActive
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700/60'
                : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400 font-semibold'
            }`}
          >
            {isPreviewActive ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Masquer 3D</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>Activer 3D</span>
              </>
            )}
          </button>

          <button
            onClick={handleSwap}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors border border-zinc-700/60 shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
            <span>Swap Viewports</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Viewports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* Left Viewport */}
        <div className="flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-950 border-b border-zinc-800 w-full overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
              <select
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 max-w-[140px] sm:max-w-[200px] truncate"
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
                title="Reload Viewport"
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenEmbed(leftSplat)}
                title="Embed Code"
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors hidden xs:block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenExplore(leftSplat)}
                title="Fullscreen View"
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Viewer Frame */}
          <div 
            className="relative w-full h-[300px] sm:h-[450px] bg-black"
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
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-3">
                    <span className="text-xs text-zinc-300 bg-zinc-950/80 px-2.5 py-1 rounded-full border border-zinc-700/80 font-mono">
                      🍃 Vue 3D masquée (0% GPU)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="p-3 text-xs text-zinc-400 flex items-center justify-between bg-zinc-950/60 border-t border-zinc-800/80 font-mono">
            <span className="truncate">{leftSplat.category} · {leftSplat.splatCount || 'N/A'}</span>
            <span className="text-zinc-500 shrink-0 ml-2">ID: {leftSplat.supersplatId}</span>
          </div>
        </div>

        {/* Right Viewport */}
        <div className="flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-950 border-b border-zinc-800 w-full overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <select
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 max-w-[140px] sm:max-w-[200px] truncate"
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
                title="Reload Viewport"
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenEmbed(rightSplat)}
                title="Embed Code"
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors hidden xs:block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenExplore(rightSplat)}
                title="Fullscreen View"
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Viewer Frame */}
          <div 
            className="relative w-full h-[300px] sm:h-[450px] bg-black"
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
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-3">
                    <span className="text-xs text-zinc-300 bg-zinc-950/80 px-2.5 py-1 rounded-full border border-zinc-700/80 font-mono">
                      🍃 Vue 3D masquée (0% GPU)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="p-3 text-xs text-zinc-400 flex items-center justify-between bg-zinc-950/60 border-t border-zinc-800/80 font-mono">
            <span className="truncate">{rightSplat.category} · {rightSplat.splatCount || 'N/A'}</span>
            <span className="text-zinc-500 shrink-0 ml-2">ID: {rightSplat.supersplatId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
