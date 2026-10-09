import React, { useState } from 'react';
import { X, Plus, AlertCircle, Lock, KeyRound, Check, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { SplatItem } from '../types/splat';
import { extractSupersplatId } from '../data/defaultSplats';

interface AddSplatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSplat: SplatItem) => void;
}

const REQUIRED_SECRET_CODE = '9210';

export const AddSplatModal: React.FC<AddSplatModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [splatCount, setSplatCount] = useState('~1.0M splats');
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCodeAuthorized = secretCode.trim() === REQUIRED_SECRET_CODE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict validation of secret code
    if (secretCode.trim() !== REQUIRED_SECRET_CODE) {
      setError('Code secret invalide. Vous devez saisir le code d\'autorisation pour pouvoir ajouter un splat à la galerie.');
      return;
    }

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
      category: 'Archive 3D',
      splatCount: splatCount || '~1M splats',
      captureNotes: 'Capture ajoutée manuellement (Autorisation confirmée)',
      createdAt: new Date().toISOString().split('T')[0],
      isUserOriginal: false,
    };

    onAdd(newSplat);
    setInputUrl('');
    setTitle('');
    setDescription('');
    setSecretCode('');
    onClose();
  };

  const parsedPreview = inputUrl.trim() ? extractSupersplatId(inputUrl) : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] text-black max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notification Banner */}
        <div className="mt-4 p-2.5 border border-black bg-zinc-50 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Accès Restreint</span>
          </div>
          <span className="text-[10px] text-black/70 uppercase">
            Code d'autorisation secret requis
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Secret Code Input Section */}
          <div className={`p-3.5 border ${isCodeAuthorized ? 'border-black bg-zinc-50' : 'border-black bg-white'} transition-colors`}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase text-black font-black flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-black" />
                <span>Code Secret d'Autorisation <span className="text-rose-600">*</span></span>
              </label>

              {isCodeAuthorized ? (
                <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  AUTORISÉ
                </span>
              ) : secretCode.trim().length > 0 ? (
                <span className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  CODE INCORRECT
                </span>
              ) : (
                <span className="text-[10px] font-mono text-black/60 uppercase">
                  Requis
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showSecretCode ? 'text' : 'password'}
                required
                maxLength={20}
                placeholder="Entrez le code secret..."
                value={secretCode}
                onChange={(e) => {
                  setSecretCode(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full bg-white border ${
                  isCodeAuthorized 
                    ? 'border-black' 
                    : secretCode.trim().length > 0 
                      ? 'border-rose-600' 
                      : 'border-black'
                } pl-3 pr-10 py-2 text-xs font-mono tracking-widest text-black placeholder:tracking-normal placeholder:text-black/40 focus:outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowSecretCode(!showSecretCode)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors"
                title={showSecretCode ? "Masquer le code" : "Afficher le code"}
              >
                {showSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="mt-1.5 text-[10px] font-mono text-black/60">
              {isCodeAuthorized 
                ? '✓ Code validé. Accès autorisé pour soumettre votre modèle.' 
                : 'Saisissez le code secret pour autoriser l\'injection du modèle dans la galerie.'}
            </p>
          </div>

          {/* SuperSplat URL Input */}
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
            {parsedPreview && (
              <p className="mt-1.5 text-[11px] text-black font-mono font-bold">
                ID Détecté: <span className="underline">{parsedPreview.id}</span> · Prêt pour intégration
              </p>
            )}
          </div>

          {/* Title */}
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

          {/* Splat Count / Density */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-black font-bold mb-1.5">
              Nombre de Splats / Résolution Radiance
            </label>
            <input
              type="text"
              placeholder="ex: ~1.2M splats"
              value={splatCount}
              onChange={(e) => setSplatCount(e.target.value)}
              className="w-full bg-white border border-black px-3 py-2 text-xs text-black placeholder:text-black/40 font-mono focus:outline-none"
            />
          </div>

          {/* Description */}
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

          {/* Error Message */}
          {error && (
            <div className="p-2.5 border border-rose-600 bg-rose-50 flex items-center gap-2 text-xs font-mono text-rose-700 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
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
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider text-white border border-black font-bold transition-colors flex items-center gap-1.5 ${
                isCodeAuthorized 
                  ? 'bg-black hover:bg-zinc-800' 
                  : 'bg-black/90 hover:bg-black'
              }`}
            >
              {isCodeAuthorized ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouter à l'Archive</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ajouter à l'Archive</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

