import React from 'react';
import { X, MousePointer, Move, ZoomIn, Eye, Sparkles, MonitorSmartphone } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">3D Gaussian Splat Controls</h3>
              <p className="text-xs text-zinc-400">Standard 6-DoF SuperSplat navigation guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <div className="flex items-start gap-3.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <div className="p-2 rounded-md bg-zinc-800 text-sky-400 shrink-0">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">Orbit / Rotate</span>
              <p className="text-xs text-zinc-300 mt-0.5">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[11px] border border-zinc-700">Left Click + Drag</kbd> or single finger touch drag on mobile.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <div className="p-2 rounded-md bg-zinc-800 text-sky-400 shrink-0">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">Pan / Translate</span>
              <p className="text-xs text-zinc-300 mt-0.5">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[11px] border border-zinc-700">Right Click + Drag</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[11px] border border-zinc-700">Shift + Drag</kbd>, or two-finger drag.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <div className="p-2 rounded-md bg-zinc-800 text-sky-400 shrink-0">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">Zoom / Depth</span>
              <p className="text-xs text-zinc-300 mt-0.5">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[11px] border border-zinc-700">Scroll Wheel</kbd> or pinch-to-zoom on touch screens.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <div className="p-2 rounded-md bg-zinc-800 text-emerald-400 shrink-0">
              <MonitorSmartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">XR & Spatial Tracking</span>
              <p className="text-xs text-zinc-300 mt-0.5">
                Enabled via <code className="text-zinc-200 font-mono text-[11px]">allow="xr-spatial-tracking"</code> for WebXR headsets (Meta Quest, Apple Vision Pro via WebXR).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
