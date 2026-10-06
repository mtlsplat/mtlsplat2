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
  
  const responsiveSnippet = `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
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
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Embed 3D Gaussian Splat</h3>
              <p className="text-xs text-zinc-400">{splat.title} (ID: {splat.supersplatId})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Format selection */}
          <div className="flex items-center gap-2 p-1 bg-zinc-950/80 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setEmbedType('fixed')}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all ${
                embedType === 'fixed'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Fixed Size (Standard Iframe)
            </button>
            <button
              onClick={() => setEmbedType('responsive')}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all ${
                embedType === 'responsive'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Responsive 16:9 Wrapper
            </button>
          </div>

          {embedType === 'fixed' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Width (px)</label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Height (px)</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono uppercase text-zinc-400">HTML Embed Code</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to clipboard' : 'Copy HTML'}
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed selection:bg-sky-900/60">
              {currentSnippet}
            </pre>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono truncate max-w-[280px]">Direct: {splat.url}</span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleCopyUrl}
                className="hover:text-zinc-200 transition-colors flex items-center gap-1"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={splat.url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>Open SuperSplat</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
