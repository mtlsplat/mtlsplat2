import React, { useState, useEffect } from 'react';
import { X, Trash2, Lock, KeyRound, Check, Eye, EyeOff, ShieldAlert, AlertTriangle } from 'lucide-react';
import { SplatItem } from '../types/splat';
import { REQUIRED_SECRET_CODE } from '../constants/auth';

interface DeleteSplatModalProps {
  isOpen: boolean;
  splat: SplatItem | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteSplatModal: React.FC<DeleteSplatModalProps> = ({
  isOpen,
  splat,
  onClose,
  onConfirmDelete,
}) => {
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset inputs when opening/closing or changing target splat
  useEffect(() => {
    if (isOpen) {
      setSecretCode('');
      setShowSecretCode(false);
      setError(null);
    }
  }, [isOpen, splat]);

  if (!isOpen || !splat) return null;

  const isCodeAuthorized = secretCode.trim() === REQUIRED_SECRET_CODE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict validation of shared secret code
    if (secretCode.trim() !== REQUIRED_SECRET_CODE) {
      setError("Code secret invalide. Vous devez saisir le code d'autorisation pour pouvoir supprimer ce splat de l'archive.");
      return;
    }

    onConfirmDelete(splat.id);
    setSecretCode('');
    onClose();
  };

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
            <div className="w-8 h-8 border border-black bg-rose-600 text-white flex items-center justify-center">
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">
                Supprimer le Gaussian Splat
              </h3>
              <p className="text-xs font-mono text-black/60">
                Action sécurisée · Code secret requis
              </p>
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

        {/* Splat Target Summary */}
        <div className="mt-4 p-3.5 border border-black bg-zinc-50">
          <div className="flex items-start gap-3">
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
                  ID: {splat.supersplatId}
                </span>
                <span className="text-[10px] font-mono text-black/60">
                  {splat.splatCount || '1M RADIANCE'}
                </span>
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-black mt-1 truncate">
                {splat.title}
              </h4>
              <p className="text-[11px] text-zinc-600 line-clamp-1 mt-0.5">
                {splat.description}
              </p>
            </div>
          </div>
        </div>

        {/* Warning notification */}
        <div className="mt-3 p-3 border border-rose-300 bg-rose-50 text-rose-900 flex items-start gap-2.5 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold uppercase tracking-wider text-[11px]">
              Attention : suppression irréversible
            </p>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Ce modèle sera définitivement retiré de l'archive et de la base de données cloud Firestore pour tous les utilisateurs.
            </p>
          </div>
        </div>

        {/* Security Notification Banner */}
        <div className="mt-4 p-2.5 border border-black bg-zinc-50 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Accès Restreint</span>
          </div>
          <span className="text-[10px] text-black/70 uppercase">
            Même code d'autorisation requis
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
              Utilisez le même code secret d'autorisation que pour l'ajout de splats.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 border border-rose-500 bg-rose-50 text-rose-700 text-xs font-mono flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black bg-white hover:bg-black hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isCodeAuthorized}
              className={`px-4 py-2 border border-black text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                isCodeAuthorized
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-[2px_2px_0px_#000000] cursor-pointer'
                  : 'bg-zinc-200 text-zinc-500 border-zinc-400 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirmer la suppression</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
