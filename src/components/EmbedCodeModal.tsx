import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink } from 'lucide-react';
import { SplatItem } from '../types/splat';

interface EmbedCodeModalProps {
  splat: SplatItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ splat, isOpen, onClose }) => {
  const [embedType, setEmbedType] = useState<'fixed' | 'responsive'>('fixed');
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('500');
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen || !splat) return null;

  const fixedSnippet = `<iframe id="viewer" width="${width}" height="${height}" allow="fullscreen; xr-spatial-tracking" src="${splat.url}"></iframe>`;
  
  const responsiveSnippet = `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border: 1px solid black;">
  <iframe src="${splat.url}" allow="fullscreen; xr-spatial-tracking" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
</div>`;

  const currentSnippet = embedType === 'fixed' ? fixedSnippet : responsiveSnippet;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(splat.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">Code Embed 3D Gaussian Splat</h3>
              <p className="text-xs font-mono text-black/60">{splat.title} (ID: {splat.supersplatId})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-black bg-white hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Format selection */}
          <div className="flex items-center border border-black bg-white text-xs font-mono uppercase">
            <button
              onClick={() => setEmbedType('fixed')}
              className={`flex-1 py-1.5 px-3 transition-colors ${
                embedType === 'fixed'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              Taille Fixe (Iframe)
            </button>
            <button
              onClick={() => setEmbedType('responsive')}
              className={`flex-1 py-1.5 px-3 transition-colors border-l border-black ${
                embedType === 'responsive'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black/5'
              }`}
            >
              Responsive 16:9
            </button>
          </div>

          {embedType === 'fixed' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1">Largeur (px)</label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-white border border-black px-3 py-1.5 text-xs text-black focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1">Hauteur (px)</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-white border border-black px-3 py-1.5 text-xs text-black focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-black font-bold">Code HTML</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-black hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié' : 'Copier le code'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-50 border border-black text-xs font-mono text-black overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {currentSnippet}
            </pre>
          </div>

          <div className="pt-3 border-t border-black flex items-center justify-between text-xs font-mono text-black">
            <span className="truncate max-w-[260px] text-black/70">URL: {splat.url}</span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleCopyUrl}
                className="hover:underline flex items-center gap-1 font-bold"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copié' : 'Copier URL'}</span>
              </button>
              <a
                href={splat.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 font-bold"
              >
                <span>SuperSplat</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

