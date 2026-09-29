import React from 'react';
import { DuoGameState, HandColorsConfig } from '../types/music';
import {
  Users,
  Trophy,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  Award,
  Zap,
} from 'lucide-react';

interface DuoModePanelProps {
  duoState: DuoGameState;
  onUpdateDuoState: (updater: (prev: DuoGameState) => DuoGameState) => void;
  colors: HandColorsConfig;
}

export const DuoModePanel: React.FC<DuoModePanelProps> = ({
  duoState,
  onUpdateDuoState,
  colors,
}) => {
  if (!duoState.enabled) return null;

  const totalHits = duoState.player1Hits + duoState.player2Hits;
  const harmonyPercent = totalHits > 0
    ? Math.min(100, Math.round(90 + (Math.min(duoState.player1Hits, duoState.player2Hits) / (Math.max(1, totalHits) / 2)) * 10))
    : 100;

  return (
    <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-fadeIn">
      {/* Top Banner: Mode 4 Mains / 2 Joueurs Active */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl text-white shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base tracking-tight">
                Mode 4 Mains (Jouer à 2 Pianistes)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Actif
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Partagez le clavier de piano en deux zones et jouez en duo synchronisé
            </p>
          </div>
        </div>

        {/* Duo Listening / Practice Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => onUpdateDuoState(s => ({ ...s, filterPlayer: 'both' }))}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              duoState.filterPlayer === 'both'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Duo (2 Joueurs)
          </button>
          <button
            onClick={() => onUpdateDuoState(s => ({ ...s, filterPlayer: 'player1' }))}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              duoState.filterPlayer === 'player1'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {duoState.player1Name} seul
          </button>
          <button
            onClick={() => onUpdateDuoState(s => ({ ...s, filterPlayer: 'player2' }))}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              duoState.filterPlayer === 'player2'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {duoState.player2Name} seul
          </button>
        </div>
      </div>

      {/* Players Split & Live Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player 2 (Secondo - Basse & Main Gauche) */}
        <div
          style={{ borderColor: `${colors.leftHand}55` }}
          className="p-4 rounded-2xl bg-slate-950 border relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: colors.leftHand }}
                className="w-3.5 h-3.5 rounded-full shadow-sm"
              />
              <input
                type="text"
                value={duoState.player2Name}
                onChange={e => {
                  const val = e.target.value;
                  onUpdateDuoState(s => ({ ...s, player2Name: val }));
                }}
                className="bg-transparent font-bold text-white text-sm focus:outline-none focus:border-b border-purple-500 w-32"
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              Secondo • Partie Grave 𝄢
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Score Joueur 2 :</span>
            <span className="font-mono font-extrabold text-xl text-white">
              {duoState.player2Score} pts
            </span>
          </div>

          {/* Computer keyboard helper */}
          <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Raccourcis Clavier :</span>
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-purple-300 font-bold border border-slate-800">
              Touches Q - S - D - F - G (Gauche)
            </span>
          </div>
        </div>

        {/* Player 1 (Primo - Mélodie & Main Droite) */}
        <div
          style={{ borderColor: `${colors.rightHand}55` }}
          className="p-4 rounded-2xl bg-slate-950 border relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: colors.rightHand }}
                className="w-3.5 h-3.5 rounded-full shadow-sm"
              />
              <input
                type="text"
                value={duoState.player1Name}
                onChange={e => {
                  const val = e.target.value;
                  onUpdateDuoState(s => ({ ...s, player1Name: val }));
                }}
                className="bg-transparent font-bold text-white text-sm focus:outline-none focus:border-b border-sky-500 w-32"
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              Primo • Partie Aiguë 𝄞
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Score Joueur 1 :</span>
            <span className="font-mono font-extrabold text-xl text-white">
              {duoState.player1Score} pts
            </span>
          </div>

          {/* Computer keyboard helper */}
          <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Raccourcis Clavier :</span>
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-sky-300 font-bold border border-slate-800">
              Touches J - K - L - M - U (Droite)
            </span>
          </div>
        </div>
      </div>

      {/* Duo Harmony Bar */}
      <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Synchronisation & Harmonie du Duo :</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${harmonyPercent}%` }}
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 h-full rounded-full transition-all duration-300"
            />
          </div>
          <span className="text-xs font-mono font-bold text-white w-10 text-right">
            {harmonyPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
