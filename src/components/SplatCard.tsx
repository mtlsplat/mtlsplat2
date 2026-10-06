import React, { useState } from 'react';
import { 
  Maximize2, 
  ExternalLink, 
  Code, 
  Columns, 
  Trash2, 
  MousePointer 
} from 'lucide-react';
import { SplatItem } from '../types/splat';

interface SplatCardProps {
  splat: SplatItem;
  onExplore: (splat: SplatItem) => void;
  onEmbed: (splat: SplatItem) => void;
  onCompareSelect?: (splat: SplatItem) => void;
  onDelete?: (id: string) => void;
}

export const SplatCard: React.FC<SplatCardProps> = ({
  splat,
  onExplore,
  onEmbed,
  onCompareSelect,
  onDelete,
}) => {
  const [isInteractive, setIsInteractive] = useState(false);

  // Small card preview: no UI controls cluttering the card, with live turntable animation running
  const cardUrl = React.useMemo(() => {
    let url = splat.url.replace(/[?&]noanim/g, '');
    if (!url.includes('noui')) {
      url = url.includes('?') ? `${url}&noui` : `${url}?noui`;
    }
    return url;
  }, [splat.url]);

  return (
    <div className="group relative bg-zinc-900/90 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 flex flex-col shadow-lg shadow-black/30 hover:shadow-sky-950/10 w-full max-w-full">
      {/* 3D Viewport Box with Live Iframe Visible */}
      <div className="relative w-full h-[260px] xs:h-[280px] sm:h-[320px] bg-black overflow-hidden">
        {/* The Live 3D Gaussian Splat Iframe */}
        <iframe
          src={cardUrl}
          allow="fullscreen; xr-spatial-tracking"
          title={splat.title}
          className={`w-full h-full border-0 transition-opacity duration-300 ${
            isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        />

        {/* Overlay when NOT in direct card-interaction mode */}
        {!isInteractive && (
          <div 
            onClick={() => onExplore(splat)}
            className="absolute inset-0 bg-transparent cursor-pointer z-10"
            title="Click to view fullscreen"
          />
        )}

        {/* Top Floating Controls on Card Viewport */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
          {/* Card Direct Interactive Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsInteractive(!isInteractive);
            }}
            title={isInteractive ? 'Lock scroll (Exit card controls)' : 'Enable direct 3D interaction in card'}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium backdrop-blur transition-all flex items-center gap-1.5 border shadow-sm ${
              isInteractive 
                ? 'bg-sky-500/25 border-sky-500 text-sky-200'
                : 'bg-zinc-950/85 border-zinc-700/80 text-zinc-200 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <MousePointer className="w-3 h-3 text-sky-400" />
            <span>{isInteractive ? 'Active' : 'Orbit'}</span>
          </button>

          {/* Direct External Link */}
          <a
            href={splat.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open directly in SuperSplat"
            className="p-1 rounded-md bg-zinc-950/85 border border-zinc-700/80 text-zinc-400 hover:text-white backdrop-blur transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
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

          {/* Title */}
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-sky-400 transition-colors">
            {splat.title}
          </h3>

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
