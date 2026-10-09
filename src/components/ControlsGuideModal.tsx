import React from 'react';
import { X, MousePointer, Move, ZoomIn, MonitorSmartphone } from 'lucide-react';

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
        className="relative w-full max-w-lg bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
              6D
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">Guide des Contrôles 3D (6-DoF)</h3>
              <p className="text-xs font-mono text-black/60">Navigation spatiale standard SuperSplat / WebGL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-black bg-white hover:bg-black hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-3.5 p-3 bg-zinc-50 border border-black">
            <div className="p-2 border border-black bg-black text-white shrink-0">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-black font-mono">Orbite / Rotation</span>
              <p className="text-xs text-zinc-700 mt-1 font-sans">
                <kbd className="px-1.5 py-0.5 border border-black bg-white text-black font-mono text-[11px]">Clic Gauche + Glisser</kbd> ou glissement à un doigt sur écran tactile.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 bg-zinc-50 border border-black">
            <div className="p-2 border border-black bg-black text-white shrink-0">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-black font-mono">Pan / Translation</span>
              <p className="text-xs text-zinc-700 mt-1 font-sans">
                <kbd className="px-1.5 py-0.5 border border-black bg-white text-black font-mono text-[11px]">Clic Droit + Glisser</kbd> ou <kbd className="px-1.5 py-0.5 border border-black bg-white text-black font-mono text-[11px]">Shift + Glisser</kbd>, ou glissement à deux doigts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 bg-zinc-50 border border-black">
            <div className="p-2 border border-black bg-black text-white shrink-0">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-black font-mono">Zoom / Profondeur</span>
              <p className="text-xs text-zinc-700 mt-1 font-sans">
                <kbd className="px-1.5 py-0.5 border border-black bg-white text-black font-mono text-[11px]">Molette de Défilement</kbd> ou pincement tactile (pinch-to-zoom).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 bg-zinc-50 border border-black">
            <div className="p-2 border border-black bg-black text-white shrink-0">
              <MonitorSmartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-black font-mono">Immersion XR & Casques VR</span>
              <p className="text-xs text-zinc-700 mt-1 font-sans">
                Prise en charge native WebXR via <code className="font-mono text-[11px] border border-black px-1 bg-white">xr-spatial-tracking</code> (Meta Quest, Apple Vision Pro, etc.).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-black hover:bg-zinc-800 text-white border border-black font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

