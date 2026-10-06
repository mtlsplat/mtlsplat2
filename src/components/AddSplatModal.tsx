import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { SplatItem } from '../types/splat';
import { extractSupersplatId } from '../data/defaultSplats';

interface AddSplatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSplat: SplatItem) => void;
}

export const AddSplatModal: React.FC<AddSplatModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Spatial Capture');
  const [splatCount, setSplatCount] = useState('~1.0M splats');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = extractSupersplatId(inputUrl);
    if (!parsed) {
      setError('Please enter a valid SuperSplat URL (e.g. https://superspl.at/s?id=300fa8ae) or splat ID.');
      return;
    }

    const newSplat: SplatItem = {
      id: `custom-${parsed.id}-${Date.now()}`,
      supersplatId: parsed.id,
      title: title.trim() || `Gaussian Splat ${parsed.id}`,
      description: description.trim() || 'Custom 3D Gaussian Splat reconstruction viewable via SuperSplat WebGL engine.',
      url: parsed.url,
      category: category || 'Spatial Capture',
      splatCount: splatCount || '~1M splats',
      captureNotes: 'User added model',
      createdAt: new Date().toISOString().split('T')[0],
      isUserOriginal: false,
    };

    onAdd(newSplat);
    setInputUrl('');
    setTitle('');
    setDescription('');
    onClose();
  };

  const parsedPreview = inputUrl.trim() ? extractSupersplatId(inputUrl) : null;

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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Add 3D Gaussian Splat</h3>
              <p className="text-xs text-zinc-400">Import any SuperSplat scene or ID to your gallery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              SuperSplat URL, Embed Code, or ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. https://superspl.at/s?id=300fa8ae or 300fa8ae"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (error) setError(null);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
            />
            {error && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {parsedPreview && (
              <p className="mt-1.5 text-[11px] text-emerald-400 font-mono">
                Detected ID: <span className="text-zinc-200 font-semibold">{parsedPreview.id}</span> · Ready to embed
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Scene Title
            </label>
            <input
              type="text"
              placeholder="e.g. Historic Courtyard Radiance Field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Spatial Capture">Spatial Capture</option>
                <option value="Architecture">Architecture</option>
                <option value="Environment">Environment</option>
                <option value="Artifact & Object">Artifact & Object</option>
                <option value="Exterior">Exterior</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                Splat Count (Approx.)
              </label>
              <input
                type="text"
                placeholder="e.g. ~1.2M splats"
                value={splatCount}
                onChange={(e) => setSplatCount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Camera notes, capture hardware, or reconstruction details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold rounded-lg transition-colors shadow-sm"
            >
              Add to Gallery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
