import React, { useState } from 'react';
import { Columns, ArrowLeftRight, Maximize2, ExternalLink, Code, RotateCcw } from 'lucide-react';
import { SplatItem } from '../types/splat';

interface DualCompareViewProps {
  splats: SplatItem[];
  onOpenExplore: (splat: SplatItem) => void;
  onOpenEmbed: (splat: SplatItem) => void;
}

export const DualCompareView: React.FC<DualCompareViewProps> = ({
  splats,
  onOpenExplore,
  onOpenEmbed,
}) => {
  const [leftId, setLeftId] = useState<string>(splats[0]?.id || '');
  const [rightId, setRightId] = useState<string>(splats[1]?.id || splats[0]?.id || '');
  const [leftKey, setLeftKey] = useState(0);
  const [rightKey, setRightKey] = useState(0);

  const leftSplat = splats.find((s) => s.id === leftId) || splats[0];
  const rightSplat = splats.find((s) => s.id === rightId) || splats[1] || splats[0];

  const handleSwap = () => {
    const temp = leftId;
    setLeftId(rightId);
    setRightId(temp);
  };

  if (!leftSplat || !rightSplat) {
    return (
      <div className="text-center py-20 text-zinc-400">
        Requires at least one 3D Gaussian Splat to compare.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compare Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Dual Spatial Comparison</h3>
            <p className="text-xs text-zinc-400">Inspect two radiance fields side-by-side with independent 6-DoF viewports</p>
          </div>
        </div>

        <button
          onClick={handleSwap}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors border border-zinc-700/60"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
          <span>Swap Viewports</span>
        </button>
      </div>

      {/* Side-by-side Viewports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Viewport */}
        <div className="flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <select
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 max-w-[200px] truncate"
              >
                {splats.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.supersplatId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
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
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
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
          <div className="relative w-full h-[450px] bg-black">
            <iframe
              key={leftKey}
              src={leftSplat.url}
              allow="fullscreen; xr-spatial-tracking"
              title={leftSplat.title}
              className="w-full h-full border-0"
            />
          </div>

          {/* Footer Metadata */}
          <div className="p-3 text-xs text-zinc-400 flex items-center justify-between bg-zinc-950/60 border-t border-zinc-800/80 font-mono">
            <span>{leftSplat.category} · {leftSplat.splatCount || 'N/A'}</span>
            <span className="text-zinc-500">ID: {leftSplat.supersplatId}</span>
          </div>
        </div>

        {/* Right Viewport */}
        <div className="flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <select
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 max-w-[200px] truncate"
              >
                {splats.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.supersplatId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
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
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
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
          <div className="relative w-full h-[450px] bg-black">
            <iframe
              key={rightKey}
              src={rightSplat.url}
              allow="fullscreen; xr-spatial-tracking"
              title={rightSplat.title}
              className="w-full h-full border-0"
            />
          </div>

          {/* Footer Metadata */}
          <div className="p-3 text-xs text-zinc-400 flex items-center justify-between bg-zinc-950/60 border-t border-zinc-800/80 font-mono">
            <span>{rightSplat.category} · {rightSplat.splatCount || 'N/A'}</span>
            <span className="text-zinc-500">ID: {rightSplat.supersplatId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
