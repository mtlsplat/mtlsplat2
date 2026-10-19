import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  Globe, 
  FileText, 
  X,
  AlertCircle
} from 'lucide-react';

interface SeoHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeoHelpModal: React.FC<SeoHelpModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  if (!isOpen) return null;

  const publicUrl = 'https://ais-pre-na4fmbzt7xgjd6e3prcqqi-99597982363.us-east1.run.app';
  const sitemapUrl = `${publicUrl}/sitemap.xml`;

  const handleCopyUrl = (url: string, type: 'url' | 'sitemap') => {
    navigator.clipboard.writeText(url);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSitemap(true);
      setTimeout(() => setCopiedSitemap(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-black"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-black bg-black text-white flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-black">
                Statut Référencement Google & Indexation
              </h3>
              <p className="text-xs text-black/60">Guide d'indexation accélérée pour MTLSPLAT</p>
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

        {/* CRITICAL DIAGNOSIS BANNER */}
        <div className="mt-4 p-4 border-2 border-rose-600 bg-rose-50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1.5">
            <div className="font-bold uppercase text-rose-900 tracking-wider">
              Diagnostic Clé : Pourquoi la validation Google échoue ou reste invisible
            </div>
            <p className="text-rose-800 leading-relaxed font-sans">
              <strong>1. Vous devez cliquer sur « Share » (Publier) dans AI Studio :</strong> Tant que vous n'avez pas cliqué sur le bouton <em>Share / Partager</em> en haut à droite de Google AI Studio, l'URL publique partagée (<code>ais-pre-...</code>) n'est pas encore déployée et renvoie une erreur <strong>404</strong>. Googlebot ne peut donc pas la lire.
            </p>
            <p className="text-rose-800 leading-relaxed font-sans">
              <strong>2. N'utilisez pas l'URL de développement (<code>ais-dev-...</code>) :</strong> Cette URL est votre espace de travail privé protégé par vos identifiants Google (redirection 302). Les robots de Google Search Console n'y ont pas accès et bloquent la vérification.
            </p>
          </div>
        </div>

        {/* Why Google takes time banner */}
        <div className="mt-3 p-3.5 border border-black bg-amber-50 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold uppercase text-amber-900">
              Délai d'indexation mondial de Google
            </div>
            <p className="text-amber-800 leading-relaxed">
              Une fois le site rendu public et validé dans Search Console, le robot <strong>Googlebot</strong> prend en moyenne entre <strong>2 à 7 jours</strong> pour ajouter les pages dans les résultats de recherche.
            </p>
          </div>
        </div>

        {/* Technical Checklist Done */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b border-black pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tout ce qui a déjà été configuré sur votre site (100% Prêt) :</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 border border-black bg-zinc-50 flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong>robots.txt</strong> configuré pour autoriser tous les robots (Googlebot, Bingbot).
              </div>
            </div>
            <div className="p-2.5 border border-black bg-zinc-50 flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong>sitemap.xml</strong> généré pour cartographier vos pages.
              </div>
            </div>
            <div className="p-2.5 border border-black bg-zinc-50 flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong>Méta-balises SEO</strong> (Titre, description, mots-clés, robots index/follow).
              </div>
            </div>
            <div className="p-2.5 border border-black bg-zinc-50 flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong>Données structurées</strong> Schema.org (JSON-LD WebApplication).
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Steps for the user */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider border-b border-black pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>3 Actions pour forcer l'indexation rapide par Google :</span>
          </h4>

          {/* Step 1 */}
          <div className="p-3 border border-black bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs uppercase flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-white flex items-center justify-center text-[10px] font-black">1</span>
                <span>Déclarer le site sur Google Search Console</span>
              </div>
              <a
                href="https://search.google.com/search-console/about"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold underline hover:text-blue-600 uppercase"
              >
                <span>Ouvrir Search Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-zinc-600">
              C'est l'outil officiel et gratuit de Google. Ajoutez votre URL partagée :
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 p-1.5 border border-black bg-zinc-100 text-[11px] truncate select-all"
              />
              <button
                onClick={() => handleCopyUrl(publicUrl, 'url')}
                className="px-2.5 py-1.5 border border-black bg-black text-white hover:bg-zinc-800 text-[10px] uppercase font-bold flex items-center gap-1 shrink-0"
              >
                {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 border border-black bg-white space-y-2">
            <div className="font-bold text-xs uppercase flex items-center gap-2">
              <span className="w-5 h-5 bg-black text-white flex items-center justify-center text-[10px] font-black">2</span>
              <span>Soumettre le Sitemap XML</span>
            </div>
            <p className="text-[11px] text-zinc-600">
              Dans le menu "Sitemaps" de Google Search Console, soumettez l'adresse :
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sitemapUrl}
                className="flex-1 p-1.5 border border-black bg-zinc-100 text-[11px] truncate select-all"
              />
              <button
                onClick={() => handleCopyUrl(sitemapUrl, 'sitemap')}
                className="px-2.5 py-1.5 border border-black bg-black text-white hover:bg-zinc-800 text-[10px] uppercase font-bold flex items-center gap-1 shrink-0"
              >
                {copiedSitemap ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSitemap ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 border border-black bg-white space-y-1 text-[11px]">
            <div className="font-bold text-xs uppercase flex items-center gap-2 mb-1">
              <span className="w-5 h-5 bg-black text-white flex items-center justify-center text-[10px] font-black">3</span>
              <span>Tester la présence actuelle avec la commande Google</span>
            </div>
            <p className="text-zinc-600">
              Tapez directement dans la barre de recherche Google :
            </p>
            <div className="p-2 border border-black bg-zinc-100 font-bold select-all flex items-center justify-between">
              <code>site:ais-pre-na4fmbzt7xgjd6e3prcqqi-99597982363.us-east1.run.app</code>
              <a
                href={`https://www.google.com/search?q=site%3Aais-pre-na4fmbzt7xgjd6e3prcqqi-99597982363.us-east1.run.app`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] uppercase underline flex items-center gap-1 text-black hover:text-blue-600 ml-2 shrink-0"
              >
                <span>Vérifier sur Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer close */}
        <div className="mt-6 pt-3 border-t border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black bg-black text-white hover:bg-zinc-800 text-xs uppercase font-bold"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
