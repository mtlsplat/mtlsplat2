import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
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
      setError('Veuillez entrer une URL valide SuperSplat (ex: https://superspl.at/s?id=300fa8ae) ou un identifiant.');
      return;
    }

    const newSplat: SplatItem = {
      id: `custom-${parsed.id}-${Date.now()}`,
      supersplatId: parsed.id,
      title: title.trim() || `Gaussian Splat ${parsed.id}`,
      description: description.trim() || 'Capture spatiale 3D Gaussian Splat archivée dans MTLSPLAT.',
      url: parsed.url,
      category: category || 'Spatial Capture',
      splatCount: splatCount || '~1M splats',
      captureNotes: 'Capture ajoutée manuellement',
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
        className="relative w-full max-w-lg bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">Ajouter un Gaussian Splat</h3>
              <p className="text-xs font-mono text-black/60">Importer une capture ou un identifiant SuperSplat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-black bg-white hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1.5">
              URL SuperSplat, Iframe, ou ID <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: https://superspl.at/s?id=300fa8ae ou 300fa8ae"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (error) setError(null);
              }}
              className="w-full bg-white border border-black px-3 py-2 text-xs text-black placeholder:text-black/40 focus:outline-none font-mono"
            />
            {error && (
              <div className="mt-1.5 flex items-center gap-1 text-xs font-mono text-rose-600 font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {parsedPreview && (
              <p className="mt-1.5 text-[11px] text-black font-mono font-bold">
                ID Détecté: <span className="underline">{parsedPreview.id}</span> · Prêt pour intégration
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1.5">
              Titre de la Scène
            </label>
            <input
              type="text"
              placeholder="ex: Moto Vintage Mile-End Radiance Field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-black px-3 py-2 text-xs text-black placeholder:text-black/40 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1.5">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-black px-3 py-2 text-xs text-black font-mono focus:outline-none uppercase"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Mountain Bike">Mountain Bike</option>
                <option value="Architecture">Architecture</option>
                <option value="Environment">Environment</option>
                <option value="Artifact & Object">Artifact & Object</option>
                <option value="Spatial Capture">Spatial Capture</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1.5">
                Nombre de Splats
              </label>
              <input
                type="text"
                placeholder="ex: ~1.2M splats"
                value={splatCount}
                onChange={(e) => setSplatCount(e.target.value)}
                className="w-full bg-white border border-black px-3 py-2 text-xs text-black placeholder:text-black/40 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1.5">
              Description / Notes de Capture
            </label>
            <textarea
              rows={2}
              placeholder="Détails du lieu, conditions d'éclairage ou matériel de scan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-black px-3 py-2 text-xs text-black placeholder:text-black/40 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-black flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-black border border-black hover:bg-black hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-black hover:bg-zinc-800 text-white border border-black font-bold transition-colors"
            >
              Ajouter à l'Archive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

