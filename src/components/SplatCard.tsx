import React, { useState } from 'react';
import { 
  Maximize2, 
  ExternalLink, 
  Code, 
  Columns, 
  Trash2, 
  Play, 
  X, 
  Box, 
  Eye, 
  Sparkles,
  Layers,
  Pencil
} from 'lucide-react';
import { SplatItem } from '../types/splat';

interface SplatCardProps {
  splat: SplatItem;
  onExplore: (splat: SplatItem) => void;
  onEmbed: (splat: SplatItem) => void;
  onEdit?: (splat: SplatItem) => void;
  onCompareSelect?: (splat: SplatItem) => void;
  onDelete?: (id: string) => void;
}

export const SplatCard: React.FC<SplatCardProps> = ({
  splat,
  onExplore,
  onEmbed,
  onEdit,
  onCompareSelect,
  onDelete,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="group relative bg-zinc-900/90 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 flex flex-col shadow-lg shadow-black/30 hover:shadow-sky-950/10">
      {/* 3D Viewport Box */}
      <div className="relative w-full h-[280px] bg-zinc-950 overflow-hidden flex items-center justify-center">
        {isLoaded ? (
          <>
            {/* The Live 3D Gaussian Splat Iframe (Only loads when explicitly requested) */}
            <iframe
              src={splat.url}
              allow="fullscreen; xr-spatial-tracking"
              title={splat.title}
              className="w-full h-full border-0"
            />

            {/* Top controls while loaded */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
              <button
                onClick={() => setIsLoaded(false)}
                title="Stop & Unload 3D Viewer"
                className="px-2 py-1 rounded-md text-[11px] font-mono font-medium bg-zinc-950/90 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 backdrop-blur transition-all flex items-center gap-1 shadow-sm"
              >
                <X className="w-3 h-3 text-rose-400" />
                <span>Stop 3D</span>
              </button>
            </div>
          </>
        ) : (
          /* Static Non-Distracting Spatial Poster Preview */
          <div 
            onClick={() => onExplore(splat)}
            className="w-full h-full cursor-pointer relative flex flex-col items-center justify-center p-6 text-center select-none bg-radial from-zinc-900 to-zinc-950 group/preview transition-colors hover:from-zinc-900/80 hover:to-black"
          >
            {/* Background spatial grid dots pattern */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Spatial Center Graphic */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 flex items-center justify-center text-sky-400 shadow-xl group-hover/preview:scale-105 group-hover/preview:border-sky-500/60 group-hover/preview:text-sky-300 transition-all duration-300">
                <Box className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="mt-3.5 flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-zinc-300 font-semibold">{splat.title}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-sky-400 font-mono text-[11px]">{splat.supersplatId}</span>
              </div>

              <p className="mt-1 text-[11px] text-zinc-500 max-w-xs line-clamp-1 font-mono">
                {splat.splatCount || '1M splats'} · 6-DoF WebGL Scene
              </p>

              {/* Action Buttons on Poster */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplore(splat);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Explore Fullscreen</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLoaded(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Load interactive viewer directly inside this card"
                >
                  <Play className="w-3 h-3 text-sky-400 fill-sky-400" />
                  <span>Play In Card</span>
                </button>
              </div>
            </div>

            {/* Corner ID Tag */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                Ready to stream
              </span>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <a
                href={splat.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open directly in SuperSplat"
                className="p-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors block"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Card Content & Details (Zero-pill compliant) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Quiet Unboxed Metadata Line */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mb-1.5">
            <span className="text-sky-400 font-medium">{splat.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{splat.splatCount || 'Gaussian Splats'}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{splat.createdAt}</span>
          </div>

          {/* Title and quick edit */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-zinc-100 group-hover:text-sky-400 transition-colors">
              {splat.title}
            </h3>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(splat);
                }}
                title="Edit name and details"
                className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Description */}
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {splat.description}
          </p>
        </div>

        {/* Card Footer & Action Buttons */}
        <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          {/* Primary Action Button */}
          <button
            onClick={() => onExplore(splat)}
            className="flex-1 py-2 px-3 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Explore 3D Scene</span>
          </button>

          {/* Secondary Action Buttons */}
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(splat)}
                title="Edit Name & Details"
                className="p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onEmbed(splat)}
              title="Get Embed Code"
              className="p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            {onCompareSelect && (
              <button
                onClick={() => onCompareSelect(splat)}
                title="Compare in Split-Screen"
                className="p-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            )}

            {!splat.isUserOriginal && onDelete && (
              <button
                onClick={() => onDelete(splat.id)}
                title="Remove Splat"
                className="p-2 rounded-lg bg-zinc-800/70 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-700/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
