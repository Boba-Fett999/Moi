import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { HandColorsConfig } from '../types/music';

interface HandColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: HandColorsConfig;
  onChangeColors: (colors: HandColorsConfig) => void;
}

const PRESET_PALETTES = [
  {
    name: 'Cyan & Améthyste (Défaut)',
    right: '#06B6D4',
    left: '#A855F7',
  },
  {
    name: 'Corail & Azur',
    right: '#F43F5E',
    left: '#3B82F6',
  },
  {
    name: 'Émeraude & Or',
    right: '#10B981',
    left: '#F59E0B',
  },
  {
    name: 'Néon Cyberpunk',
    right: '#EC4899',
    left: '#06B6D4',
  },
  {
    name: 'Feu & Glace',
    right: '#F97316',
    left: '#38BDF8',
  },
  {
    name: 'Lavande & Menthe',
    right: '#C084FC',
    left: '#34D399',
  },
];

const SWATCHES = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#FFFFFF', // White
];

export const HandColorModal: React.FC<HandColorModalProps> = ({
  isOpen,
  onClose,
  colors,
  onChangeColors,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Couleurs des Mains & Joueurs</h3>
              <p className="text-xs text-slate-400">Personnalisez les teintes de la Main Droite et Main Gauche</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Visual Preview */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-around gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-300">Main Droite (MD / Joueur 1)</span>
            <div
              style={{ backgroundColor: colors.rightHand, boxShadow: `0 0 16px ${colors.rightHand}66` }}
              className="w-20 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg border border-white/30"
            >
              Do 5 (MD)
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-300">Main Gauche (MG / Joueur 2)</span>
            <div
              style={{ backgroundColor: colors.leftHand, boxShadow: `0 0 16px ${colors.leftHand}66` }}
              className="w-20 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg border border-white/30"
            >
              Do 3 (MG)
            </div>
          </div>
        </div>

        {/* Quick Palette Presets */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Palettes Recommandées
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_PALETTES.map(p => {
              const isActive = colors.rightHand === p.right && colors.leftHand === p.left;
              return (
                <button
                  key={p.name}
                  onClick={() => onChangeColors({ rightHand: p.right, leftHand: p.left })}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-rose-500/10 border-rose-500 text-white shadow-sm ring-1 ring-rose-500'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-xs font-medium truncate">{p.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span style={{ backgroundColor: p.right }} className="w-3.5 h-3.5 rounded-full shadow-sm" />
                    <span style={{ backgroundColor: p.left }} className="w-3.5 h-3.5 rounded-full shadow-sm" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Pickers for Each Hand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Right Hand Picker */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">Main Droite</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={colors.rightHand}
                  onChange={e => onChangeColors({ ...colors, rightHand: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-[10px] font-mono text-slate-400 uppercase">{colors.rightHand}</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {SWATCHES.map(color => (
                <button
                  key={`rh-${color}`}
                  onClick={() => onChangeColors({ ...colors, rightHand: color })}
                  style={{ backgroundColor: color }}
                  className={`h-6 rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${
                    colors.rightHand === color ? 'ring-2 ring-white scale-105' : 'opacity-85'
                  }`}
                >
                  {colors.rightHand === color && <Check className="w-3 h-3 text-slate-900" />}
                </button>
              ))}
            </div>
          </div>

          {/* Left Hand Picker */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">Main Gauche</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={colors.leftHand}
                  onChange={e => onChangeColors({ ...colors, leftHand: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-[10px] font-mono text-slate-400 uppercase">{colors.leftHand}</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {SWATCHES.map(color => (
                <button
                  key={`lh-${color}`}
                  onClick={() => onChangeColors({ ...colors, leftHand: color })}
                  style={{ backgroundColor: color }}
                  className={`h-6 rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${
                    colors.leftHand === color ? 'ring-2 ring-white scale-105' : 'opacity-85'
                  }`}
                >
                  {colors.leftHand === color && <Check className="w-3 h-3 text-slate-900" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all"
          >
            Appliquer les couleurs
          </button>
        </div>
      </div>
    </div>
  );
};
