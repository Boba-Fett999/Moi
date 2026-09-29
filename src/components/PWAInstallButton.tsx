import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopInfo, setShowDesktopInfo] = useState(false);

  // If already running as an installed PWA, show a discreet status pill or hide
  if (isInstalled) {
    return (
      <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-[11px] font-medium text-emerald-400">
        <Check className="w-3 h-3 text-emerald-400" />
        <span>App Installée</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all active:scale-95"
        title="Installer PianoScribe sur votre ordinateur ou smartphone pour l'utiliser sans internet"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installer l'app (Hors-ligne)</span>
        <span className="sm:hidden">Installer</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium hover:bg-slate-700 transition"
          title="Installer l'application sur iPhone ou iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">Installer sur iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Profitez de PianoScribe en mode plein écran et hors ligne sans connexion internet :
              </p>

              <ol className="text-xs text-slate-300 space-y-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-5">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-400 bg-rose-500/20 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Touchez le bouton <strong>Partager</strong> <span className="text-slate-400">(icône carré avec flèche vers le haut dans Safari)</span>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-400 bg-rose-500/20 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Faites défiler vers le bas et appuyez sur <strong>« Sur l'écran d'accueil »</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-400 bg-rose-500/20 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Appuyez sur <strong>Ajouter</strong> en haut à droite.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-white transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / browser info button
  return (
    <>
      <button
        onClick={() => setShowDesktopInfo(true)}
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 text-xs font-medium transition"
        title="PianoScribe fonctionne hors-ligne avec toutes les musiques"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Laptop className="w-3.5 h-3.5 text-emerald-400" />
        <span>Prêt Hors-ligne</span>
      </button>

      {showDesktopInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Mode Hors-Ligne & Installation</h3>
              </div>
              <button
                onClick={() => setShowDesktopInfo(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed mb-5">
              <p className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200">
                ✅ <strong>Toutes les musiques de l'application sont enregistrées localement !</strong> Même en coupant votre connexion Wi-Fi ou sans réseau, les partitions, les vidéos de solfège et le synthétiseur de piano restent 100% opérationnels.
              </p>
              <p>
                Pour installer l'application sur votre écran d'ordinateur comme un vrai logiciel :
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                <li>Dans Chrome / Edge : cliquez sur l'icône <strong>« Installer l'application »</strong> à droite dans la barre d'adresse URL.</li>
                <li>L'application s'ouvrira alors dans sa propre fenêtre indépendante, fluide et instantanée.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowDesktopInfo(false)}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
