import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pencil, 
  Check, 
  Loader2, 
  Lock, 
  KeyRound, 
  ShieldAlert, 
  Eye, 
  EyeOff,
  Cloud
} from 'lucide-react';
import { SplatItem } from '../types/splat';
import { REQUIRED_SECRET_CODE } from '../constants/auth';

interface EditDescriptionModalProps {
  splat: SplatItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (splat: SplatItem, newTitle: string, newDescription: string) => Promise<void> | void;
}

export const EditDescriptionModal: React.FC<EditDescriptionModalProps> = ({
  splat,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && splat) {
      setTitle(splat.title || '');
      setDescription(splat.description || '');
      setSecretCode('');
      setShowSecretCode(false);
      setErrorMessage('');
      setSavedSuccess(false);
    }
  }, [splat, isOpen]);

  if (!isOpen || !splat) return null;

  const isCodeAuthorized = secretCode.trim() === REQUIRED_SECRET_CODE;
  const titleCharCount = title.length;
  const descCharCount = description.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Strict validation of shared secret code
    if (secretCode.trim() !== REQUIRED_SECRET_CODE) {
      setErrorMessage("Code secret invalide. Vous devez saisir le code d'autorisation (9210) pour pouvoir enregistrer les modifications.");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Le titre ne peut pas être vide.');
      return;
    }
    if (trimmedTitle.length > 100) {
      setErrorMessage('Le titre ne doit pas dépasser 100 caractères.');
      return;
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setErrorMessage('La description ne peut pas être vide.');
      return;
    }
    if (trimmedDesc.length > 1000) {
      setErrorMessage('La description ne doit pas dépasser 1000 caractères.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(splat, trimmedTitle, trimmedDesc);
      setSavedSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Erreur lors de la mise à jour et de la synchronisation cloud.');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-splat-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] relative font-sans text-black max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-black mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center shrink-0">
              <Pencil className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2
                id="edit-splat-title"
                className="text-base font-black uppercase tracking-tight text-black font-mono"
              >
                MODIFIER LE MODÈLE 3D
              </h2>
              <p className="text-xs font-mono text-black/60">
                Titre & Description · Synchronisation Cloud active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 border border-black bg-white hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Splat Target Summary */}
        <div className="mb-4 p-3 border border-black bg-zinc-50 flex items-start gap-3">
          <div className="w-12 h-12 border border-black bg-zinc-200 shrink-0 overflow-hidden flex items-center justify-center">
            {splat.posterUrl ? (
              <img
                src={splat.posterUrl}
                alt={splat.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-mono text-[9px] font-bold">3DGS</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-black text-white px-1.5 py-0.5">
                {splat.category || 'Archive'}
              </span>
              <span className="text-[10px] font-mono text-black/60 truncate">
                ID: {splat.supersplatId}
              </span>
            </div>
            <h4 className="text-xs font-bold uppercase truncate mt-1 text-black font-mono">
              {splat.title}
            </h4>
          </div>
        </div>

        {/* Security & Cloud Sync Status */}
        <div className="mb-4 p-2.5 border border-black bg-zinc-50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Accès Restreint</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5">
            <Cloud className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            <span>Cloud Sync Firestore Actif</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="splat-title-input"
                className="block text-xs font-mono uppercase tracking-wider text-black font-bold"
              >
                Titre du modèle 3D <span className="text-rose-600">*</span>
              </label>
              <span
                className={`text-[10px] font-mono ${
                  titleCharCount > 100 ? 'text-red-600 font-bold' : 'text-black/50'
                }`}
              >
                {titleCharCount} / 100 caractères
              </span>
            </div>

            <input
              id="splat-title-input"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              onKeyDown={handleKeyDown}
              maxLength={100}
              placeholder="Ex: MOTO RADIANCE FIELD..."
              className="w-full p-2.5 border border-black bg-white text-black text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-black shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="splat-description-input"
                className="block text-xs font-mono uppercase tracking-wider text-black font-bold"
              >
                Texte de la description <span className="text-rose-600">*</span>
              </label>
              <span
                className={`text-[10px] font-mono ${
                  descCharCount > 1000 ? 'text-red-600 font-bold' : 'text-black/50'
                }`}
              >
                {descCharCount} / 1000 caractères
              </span>
            </div>

            <textarea
              id="splat-description-input"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              onKeyDown={handleKeyDown}
              maxLength={1000}
              placeholder="Décrivez la scène, l'objet, le lieu ou les détails de la capture 3D..."
              className="w-full p-3 border border-black bg-white text-black text-xs font-sans focus:outline-none focus:ring-1 focus:ring-black leading-relaxed shadow-[2px_2px_0px_#000000] resize-y min-h-[90px]"
            />
            <p className="mt-1 text-[11px] text-zinc-500 font-sans">
              Raccourci : <kbd className="px-1 py-0.5 border border-black/30 font-mono text-[10px] bg-zinc-100">Ctrl</kbd> + <kbd className="px-1 py-0.5 border border-black/30 font-mono text-[10px] bg-zinc-100">Entrée</kbd> pour enregistrer.
            </p>
          </div>

          {/* Secret Code Input Section */}
          <div className={`p-3.5 border ${isCodeAuthorized ? 'border-black bg-zinc-50' : 'border-black bg-white'} transition-colors shadow-[2px_2px_0px_#000000]`}>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="edit-secret-code-input"
                className="text-[11px] font-mono uppercase text-black font-black flex items-center gap-1.5 cursor-pointer"
              >
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
                id="edit-secret-code-input"
                type={showSecretCode ? 'text' : 'password'}
                required
                maxLength={20}
                placeholder="Entrez le code secret..."
                value={secretCode}
                onChange={(e) => {
                  setSecretCode(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full bg-white border ${
                  isCodeAuthorized 
                    ? 'border-black ring-1 ring-black' 
                    : secretCode.trim().length > 0 
                      ? 'border-rose-500' 
                      : 'border-black'
                } px-3 py-2 pr-10 text-xs font-mono text-black placeholder:text-black/40 focus:outline-none focus:bg-zinc-50`}
              />
              <button
                type="button"
                onClick={() => setShowSecretCode(!showSecretCode)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-black/60 hover:text-black transition-colors"
                title={showSecretCode ? 'Masquer le code' : 'Afficher le code'}
              >
                {showSecretCode ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] font-mono text-black/60 mt-1.5">
              Le même code confidentiel requis pour ajouter, modifier ou supprimer un splat.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 border border-red-600 bg-red-50 text-red-700 text-xs font-mono flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-black flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-black bg-white hover:bg-zinc-100 text-black text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || titleCharCount === 0 || descCharCount === 0 || titleCharCount > 100 || descCharCount > 1000 || !isCodeAuthorized}
              className="px-4 py-2 border border-black bg-black text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono uppercase tracking-wider transition-colors shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synchronisation Cloud...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span>Synchronisé au Cloud !</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Enregistrer & Synchroniser</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
