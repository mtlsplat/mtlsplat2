import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ExternalLink, 
  Code, 
  HelpCircle,
  Sparkles,
  SlidersHorizontal,
  Play,
  Pause
} from 'lucide-react';
import { SplatItem } from '../types/splat';
import { getSplatPosterUrl } from '../data/defaultSplats';

interface FullscreenViewerModalProps {
  splat: SplatItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEmbed: (splat: SplatItem) => void;
  onOpenGuide: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasMultiple?: boolean;
}

export const FullscreenViewerModal: React.FC<FullscreenViewerModalProps> = ({
  splat,
  isOpen,
  onClose,
  onOpenEmbed,
  onOpenGuide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Track browser native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleBrowserFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Fullscreen view: hide internal SuperSplat UI / "Play animation" button with &noui by default
  const [showNativeUi, setShowNativeUi] = useState(false);
  const [isPlayingAnim, setIsPlayingAnim] = useState(true);

  const fullscreenUrl = React.useMemo(() => {
    if (!splat) return '';
    let url = splat.url;
    if (!isPlayingAnim) {
      if (!url.includes('noanim')) {
        url = url.includes('?') ? `${url}&noanim` : `${url}?noanim`;
      }
    } else {
      url = url.replace(/[?&]noanim/g, '');
    }

    if (!showNativeUi) {
      if (!url.includes('noui')) {
        url = url.includes('?') ? `${url}&noui` : `${url}?noui`;
      }
    } else {
      url = url.replace(/[?&]noui/g, '');
    }
    return url;
  }, [splat, showNativeUi, isPlayingAnim]);

  if (!isOpen || !splat) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-2 sm:p-4 md:p-6 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className="relative w-full h-full md:max-w-6xl md:h-[92vh] md:rounded-2xl bg-zinc-950 border border-zinc-700/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col overflow-hidden text-zinc-100 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-2.5 sm:px-4 py-2.5 sm:py-3 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur shrink-0 z-20 w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <h2 className="text-sm md:text-base font-semibold text-zinc-100 truncate">
                {splat.title}
              </h2>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-mono shrink-0">
              <span className="text-zinc-600">|</span>
              <span>ID: {splat.supersplatId}</span>
              {splat.splatCount && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span>{splat.splatCount}</span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Camera Animation Play/Pause Toggle */}
            <button
              onClick={() => setIsPlayingAnim((prev) => !prev)}
              title={
                isPlayingAnim 
                  ? "Mettre l'animation caméra en pause (Orbite libre à la souris, sans à-coups)" 
                  : "Relancer l'animation automatique de la caméra"
              }
              className={`p-1.5 md:px-2.5 md:py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                isPlayingAnim
                  ? 'text-sky-300 hover:text-sky-200 bg-sky-500/10 border border-sky-500/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent'
              }`}
            >
              {isPlayingAnim ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden md:inline">Pause Caméra</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Play Caméra</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowNativeUi((prev) => !prev)}
              title={showNativeUi ? "Clean View: Hide SuperSplat internal UI & Play button" : "Show SuperSplat native UI overlay"}
              className={`p-1.5 md:px-2.5 md:py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                showNativeUi 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="hidden md:inline">{showNativeUi ? 'Native UI' : 'Clean View'}</span>
            </button>

            <button
              onClick={onOpenGuide}
              title="Controls Guide"
              className="p-1.5 md:px-2.5 md:py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Controls</span>
            </button>

            <button
              onClick={() => onOpenEmbed(splat)}
              title="Copy Embed Code"
              className="p-1.5 md:px-2.5 md:py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors hidden xs:flex items-center gap-1.5"
            >
              <Code className="w-4 h-4" />
              <span className="hidden md:inline">Embed</span>
            </button>

            <button
              onClick={handleReload}
              title="Reset / Reload Viewport"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <a
              href={splat.url}
              target="_blank"
              rel="noreferrer"
              title="Open full scene directly on SuperSplat"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>

            <button
              onClick={toggleBrowserFullscreen}
              title={isBrowserFullscreen ? 'Exit Fullscreen' : 'Native Fullscreen'}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors hidden sm:block"
            >
              {isBrowserFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <div className="w-[1px] h-4 bg-zinc-800 mx-0.5 sm:mx-1" />

            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Viewport Container */}
        <div 
          className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden"
          style={{ contain: 'strict', isolation: 'isolate', transform: 'translateZ(0)' }}
        >
          {/* Background poster while 3D engine loads */}
          <div 
            className="absolute inset-0 bg-cover bg-center -z-10 bg-zinc-950"
            style={{ backgroundImage: `url(${getSplatPosterUrl(splat)})` }}
          />

          <iframe
            key={iframeKey}
            id="viewer"
            src={fullscreenUrl}
            allow="fullscreen; xr-spatial-tracking"
            title={splat.title}
            className="w-full h-full border-0 select-none block"
            style={{ transform: 'translateZ(0)' }}
          />
        </div>
      </div>
    </div>
  );
};
