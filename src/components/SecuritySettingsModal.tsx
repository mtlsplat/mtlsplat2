import React, { useState } from 'react';
import { Shield, KeyRound, Lock, CheckCircle2, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { updateAdminPasscode, getLockoutStatus } from '../constants/auth';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({ isOpen, onClose }) => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const lockout = getLockoutStatus();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newCode.trim() !== confirmCode.trim()) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    if (newCode.trim().length < 4) {
      setError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateAdminPasscode(currentCode, newCode);
      if (res.success) {
        setSuccess(true);
        setCurrentCode('');
        setNewCode('');
        setConfirmCode('');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1800);
      } else {
        setError(res.error || 'Erreur lors du changement de mot de passe.');
      }
    } catch {
      setError('Erreur inattendue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">
                Sécurité Administrateur
              </h3>
              <p className="text-xs font-mono text-black/60">Chiffrement SHA-256 & Passkey</p>
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

        {/* Security Info */}
        <div className="mt-4 p-3 bg-zinc-50 border border-black text-xs font-mono space-y-1">
          <div className="font-bold flex items-center gap-1.5 uppercase">
            <Lock className="w-3.5 h-3.5 text-black" />
            <span>Protection Anti-Piratage Active</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Vos mots de passe sont hachés avec du sel cryptographique (SHA-256). Après 5 tentatives erronées consécutives, le système bloque tout nouvel essai pendant 60 secondes pour contrer les robots et attaques par force brute.
          </p>
        </div>

        {success ? (
          <div className="mt-4 p-4 border border-black bg-black text-white text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mot de passe mis à jour avec succès et chiffré !</span>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="mt-4 space-y-3.5 font-mono">
            <div>
              <label className="block text-[11px] uppercase font-bold text-black mb-1">
                Mot de passe actuel <span className="text-rose-600">*</span>
              </label>
              <input
                type={showCodes ? 'text' : 'password'}
                required
                placeholder="Par défaut: 9210"
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                className="w-full p-2 border border-black bg-white text-xs font-mono focus:outline-none focus:bg-zinc-50"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-black mb-1">
                Nouveau mot de passe sécurisé <span className="text-rose-600">*</span>
              </label>
              <input
                type={showCodes ? 'text' : 'password'}
                required
                minLength={4}
                placeholder="Ex: MonCodeUltraSecurise2026!"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full p-2 border border-black bg-white text-xs font-mono focus:outline-none focus:bg-zinc-50"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-black mb-1">
                Confirmer le nouveau mot de passe <span className="text-rose-600">*</span>
              </label>
              <input
                type={showCodes ? 'text' : 'password'}
                required
                minLength={4}
                placeholder="Répétez le nouveau mot de passe..."
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="w-full p-2 border border-black bg-white text-xs font-mono focus:outline-none focus:bg-zinc-50"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowCodes(!showCodes)}
                className="flex items-center gap-1 text-black/70 hover:text-black uppercase"
              >
                {showCodes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showCodes ? 'Masquer' : 'Afficher'}</span>
              </button>
            </div>

            {error && (
              <div className="p-2.5 border border-rose-600 bg-rose-50 text-rose-700 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-3 border-t border-black flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-black bg-white hover:bg-zinc-100 text-xs uppercase"
              >
                Fermer
              </button>
              <button
                type="submit"
                disabled={isSubmitting || lockout.isLocked || !currentCode || !newCode}
                className="px-4 py-1.5 border border-black bg-black text-white hover:bg-zinc-800 disabled:opacity-40 text-xs uppercase font-bold"
              >
                {isSubmitting ? 'Chiffrement...' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
