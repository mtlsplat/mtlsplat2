import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ExternalLink, 
  Code, 
  HelpCircle,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className="relative w-full h-full md:max-w-6xl md:h-[92vh] bg-white border-2 border-black shadow-[8px_8px_0px_#000000] flex flex-col overflow-hidden text-black z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-black shrink-0 z-20 w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
            <span className="w-2.5 h-2.5 bg-black shrink-0" />
            <div className="flex items-center gap-2 min-w-0 truncate">
              <h2 className="text-sm md:text-base font-black uppercase text-black truncate">
                {splat.title}
              </h2>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-xs text-black/60 font-mono shrink-0">
              <span className="text-black/30">|</span>
              <span>ID: {splat.supersplatId}</span>
              {splat.splatCount && (
                <>
                  <span className="text-black/30">·</span>
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
                  ? "Mettre la caméra en pause (Orbite manuelle)" 
                  : "Relancer l'animation automatique"
              }
              className={`p-1.5 md:px-2.5 md:py-1 text-xs font-mono uppercase tracking-wider border border-black transition-colors flex items-center gap-1.5 ${
                isPlayingAnim
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              {isPlayingAnim ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-white" />
                  <span className="hidden md:inline">PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-black" />
                  <span className="hidden md:inline">PLAY</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowNativeUi((prev) => !prev)}
              title={showNativeUi ? "Masquer UI SuperSplat" : "Afficher UI SuperSplat native"}
              className={`p-1.5 md:px-2.5 md:py-1 text-xs font-mono uppercase tracking-wider border border-black transition-colors flex items-center gap-1.5 ${
                showNativeUi 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{showNativeUi ? 'NATIVE UI' : 'CLEAN VIEW'}</span>
            </button>

            <button
              onClick={onOpenGuide}
              title="Guide des contrôles"
              className="p-1.5 md:px-2.5 md:py-1 text-xs font-mono uppercase tracking-wider border border-black bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">AIDE</span>
            </button>

            <button
              onClick={() => onOpenEmbed(splat)}
              title="Code embed HTML"
              className="p-1.5 md:px-2.5 md:py-1 text-xs font-mono uppercase tracking-wider border border-black bg-white text-black hover:bg-black hover:text-white transition-colors hidden xs:flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden md:inline">CODE</span>
            </button>

            <button
              onClick={handleReload}
              title="Recharger le viewport"
              className="p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <a
              href={splat.url}
              target="_blank"
              rel="noreferrer"
              title="Ouvrir sur superspl.at"
              className="p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={toggleBrowserFullscreen}
              title={isBrowserFullscreen ? 'Quitter plein écran navigateur' : 'Plein écran navigateur'}
              className="p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors hidden sm:block"
            >
              {isBrowserFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              title="Fermer (Échap)"
              className="p-1.5 border border-black bg-black text-white hover:bg-zinc-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Viewport Container */}
        <div 
          className="relative flex-1 w-full bg-zinc-950 flex items-center justify-center overflow-hidden"
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

