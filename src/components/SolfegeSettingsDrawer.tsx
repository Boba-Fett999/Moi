import React, { useState } from 'react';
import {
  X,
  Palette,
  Sliders,
  Volume2,
  Eye,
  Languages,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react';
import { SolfegeNaming, HandColorsConfig } from '../types/music';

export interface VisualSettings {
  bgTheme: string;
  bgGradientTop: string;
  bgGradientBottom: string;
  showPrompterRibbon: boolean;
  showNoteNames: boolean;
  showKeyLabels: boolean;
  showFingering: boolean;
  showLanes: boolean;
  showRipples: boolean;
  waterfallSpeed: number; // 2.4 | 3.2 | 4.2
  interfaceLanguage: 'fr' | 'en';
}

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  bgTheme: 'midnight',
  bgGradientTop: '#0F172A',
  bgGradientBottom: '#020617',
  showPrompterRibbon: true,
  showNoteNames: true,
  showKeyLabels: true,
  showFingering: true,
  showLanes: true,
  showRipples: true,
  waterfallSpeed: 3.2,
  interfaceLanguage: 'fr',
};

export const BG_THEMES = [
  {
    id: 'midnight',
    name: 'Bleu Nuit (Défaut)',
    top: '#0F172A',
    bottom: '#020617',
    preview: 'linear-gradient(135deg, #0F172A, #020617)',
  },
  {
    id: 'dark',
    name: 'Noir Studio Pur',
    top: '#09090B',
    bottom: '#000000',
    preview: 'linear-gradient(135deg, #18181B, #000000)',
  },
  {
    id: 'nebula',
    name: 'Cosmos & Nébuleuse',
    top: '#24123E',
    bottom: '#080315',
    preview: 'linear-gradient(135deg, #3B0764, #080315)',
  },
  {
    id: 'emerald',
    name: 'Cyber Émeraude',
    top: '#042820',
    bottom: '#010E0B',
    preview: 'linear-gradient(135deg, #064E3B, #010E0B)',
  },
  {
    id: 'amber',
    name: 'Concert & Bois Chaud',
    top: '#281308',
    bottom: '#0C0502',
    preview: 'linear-gradient(135deg, #451A03, #0C0502)',
  },
  {
    id: 'royal',
    name: 'Bleu Saphir Royal',
    top: '#0C2340',
    bottom: '#030B17',
    preview: 'linear-gradient(135deg, #1E3A8A, #030B17)',
  },
  {
    id: 'sunset',
    name: 'Crépuscule Rubis',
    top: '#33101E',
    bottom: '#0F0308',
    preview: 'linear-gradient(135deg, #4C0519, #0F0308)',
  },
];

export const HAND_COLOR_PRESETS = [
  { name: 'Cyan & Violet', right: '#06B6D4', left: '#A855F7' },
  { name: 'Rose & Ambre', right: '#F43F5E', left: '#F59E0B' },
  { name: 'Émeraude & Or', right: '#10B981', left: '#FBBF24' },
  { name: 'Saphir & Rubis', right: '#3B82F6', left: '#EF4444' },
  { name: 'Néon Violet & Vert', right: '#8B5CF6', left: '#10B981' },
  { name: 'Feu & Glace', right: '#38BDF8', left: '#FB923C' },
  { name: 'Monochrome Argent', right: '#F1F5F9', left: '#94A3B8' },
];

interface SolfegeSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VisualSettings;
  onUpdateSettings: (updater: Partial<VisualSettings> | ((prev: VisualSettings) => VisualSettings)) => void;
  naming: SolfegeNaming;
  onUpdateNaming: (naming: SolfegeNaming) => void;
  colors: HandColorsConfig;
  onUpdateColors: (colors: HandColorsConfig) => void;
  solfegeVoiceMode: 'vocal' | 'speech' | 'off';
  onChangeSolfegeVoiceMode: (mode: 'vocal' | 'speech' | 'off') => void;
  onResetDefaults: () => void;
}

export const SolfegeSettingsDrawer: React.FC<SolfegeSettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  naming,
  onUpdateNaming,
  colors,
  onUpdateColors,
  solfegeVoiceMode,
  onChangeSolfegeVoiceMode,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'language' | 'hands' | 'audio' | 'display'>('theme');

  if (!isOpen) return null;

  const isFr = settings.interfaceLanguage === 'fr';

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] max-w-full bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slideIn">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {isFr ? 'Paramètres & Personnalisation' : 'Settings & Customization'}
            </h2>
            <p className="text-xs text-slate-400">
              {isFr ? 'Fond d’écran, langue, solfège & affichage' : 'Wallpaper, language, solfege & view'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title={isFr ? 'Fermer les paramètres' : 'Close settings'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 p-2 bg-slate-900/80 border-b border-slate-800/80 overflow-x-auto text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'theme' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{isFr ? 'Fond d’écran' : 'Wallpaper'}</span>
        </button>

        <button
          onClick={() => setActiveTab('language')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'language' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{isFr ? 'Langue / Solfège' : 'Language / Notes'}</span>
        </button>

        <button
          onClick={() => setActiveTab('hands')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'hands' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isFr ? 'Couleurs Mains' : 'Hand Colors'}</span>
        </button>

        <button
          onClick={() => setActiveTab('display')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'display' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isFr ? 'Affichage' : 'Display'}</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'audio' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>
      </div>

      {/* Main Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {/* TAB 1: THEME & FOND D'ECRAN */}
        {activeTab === 'theme' && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-400" />
                <span>{isFr ? 'Thèmes d’Ambiance & Fond d’écran' : 'Atmosphere Themes & Wallpaper'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {isFr
                  ? 'Modifie instantanément le dégradé et l’ambiance de la vidéo solfège.'
                  : 'Instantly changes the gradient and backdrop of the solfege video.'}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {BG_THEMES.map(theme => {
                  const isSelected = settings.bgTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() =>
                        onUpdateSettings({
                          bgTheme: theme.id,
                          bgGradientTop: theme.top,
                          bgGradientBottom: theme.bottom,
                        })
                      }
                      className={`group p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-slate-900 shadow-lg ring-1 ring-rose-500'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded-xl mb-2.5 border border-white/10 shadow-inner flex items-center justify-center"
                        style={{ background: theme.preview }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </div>
                      <span className="text-xs font-semibold text-white group-hover:text-rose-300">
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">
                {isFr ? 'Dégradé sur-mesure' : 'Custom Gradient'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    {isFr ? 'Haut du dégradé' : 'Top Color'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={settings.bgGradientTop}
                      onChange={e =>
                        onUpdateSettings({
                          bgTheme: 'custom',
                          bgGradientTop: e.target.value,
                        })
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-slate-300 uppercase">
                      {settings.bgGradientTop}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    {isFr ? 'Bas du dégradé' : 'Bottom Color'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={settings.bgGradientBottom}
                      onChange={e =>
                        onUpdateSettings({
                          bgTheme: 'custom',
                          bgGradientBottom: e.target.value,
                        })
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-slate-300 uppercase">
                      {settings.bgGradientBottom}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LANGUE & SOLFEGE */}
        {activeTab === 'language' && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Languages className="w-4 h-4 text-rose-400" />
                <span>{isFr ? 'Système de Notation Musicale' : 'Musical Naming System'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {isFr
                  ? 'Choisissez comment nommer chaque note sur le piano et dans la partition.'
                  : 'Choose how to name each note on the piano and score.'}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => onUpdateNaming('solfege')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    naming === 'solfege'
                      ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">Do - Ré - Mi - Fa - Sol - La - Si</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFr ? 'Solfège Français / Latin (Idéal chant et conservatoire)' : 'French / Latin Solfege'}
                    </p>
                  </div>
                  {naming === 'solfege' && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>

                <button
                  onClick={() => onUpdateNaming('latin')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    naming === 'latin'
                      ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">C - D - E - F - G - A - B</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFr ? 'Notation Anglo-Saxonne / Allemande' : 'International / Anglo-Saxon notation'}
                    </p>
                  </div>
                  {naming === 'latin' && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>

                <button
                  onClick={() => onUpdateNaming('degres')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    naming === 'degres'
                      ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">1 - 2 - 3 - 4 - 5 - 6 - 7</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFr ? 'Degrés harmoniques de la gamme' : 'Scale harmonic degrees'}
                    </p>
                  </div>
                  {naming === 'degres' && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200">
                {isFr ? 'Langue de l’interface' : 'Interface Language'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ interfaceLanguage: 'fr' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    settings.interfaceLanguage === 'fr'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🇫🇷</span>
                  <span>Français</span>
                </button>

                <button
                  onClick={() => onUpdateSettings({ interfaceLanguage: 'en' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    settings.interfaceLanguage === 'en'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COULEURS DES MAINS */}
        {activeTab === 'hands' && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>{isFr ? 'Couleurs Personnalisées des Mains' : 'Custom Hand Colors'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {isFr
                  ? 'Distinguez instantanément la main droite (mélodie) et la main gauche (basse).'
                  : 'Easily distinguish right hand (melody) from left hand (bass).'}
              </p>

              {/* Hand Color Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-sky-400 block mb-1.5">
                    {isFr ? 'Main Droite (Mélodie)' : 'Right Hand (Melody)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.rightHand}
                      onChange={e => onUpdateColors({ ...colors, rightHand: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-white">{colors.rightHand}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-purple-400 block mb-1.5">
                    {isFr ? 'Main Gauche (Basse)' : 'Left Hand (Bass)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.leftHand}
                      onChange={e => onUpdateColors({ ...colors, leftHand: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-white">{colors.leftHand}</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                {isFr ? 'Palettes Recommandées' : 'Recommended Palettes'}
              </h4>
              <div className="space-y-1.5">
                {HAND_COLOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onUpdateColors({ rightHand: p.right, leftHand: p.left })}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between text-xs font-medium text-slate-200 transition-colors"
                  >
                    <span>{p.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.right }} />
                      <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.left }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DISPLAY & WATERFALL */}
        {activeTab === 'display' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-400" />
                <span>{isFr ? 'Options d’Affichage Vidéo' : 'Video Display Options'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {isFr
                  ? 'Activez ou masquez les indications visuelles à votre convenance.'
                  : 'Toggle visual cues on or off to suit your playing style.'}
              </p>

              <div className="space-y-2">
                {/* Note Names on falling bars */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isFr ? 'Noms de notes sur la cascade' : 'Note names on waterfall'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFr ? 'Affiche Do, Ré, Mi à l’intérieur des notes qui tombent' : 'Display syllables inside falling bars'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showNoteNames}
                    onChange={e => onUpdateSettings({ showNoteNames: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                {/* Piano Key Labels */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isFr ? 'Étiquettes sur le clavier de piano' : 'Labels on piano keyboard'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFr ? 'Affiche les notes et octaves sur chaque touche' : 'Show note names & octaves on piano keys'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showKeyLabels}
                    onChange={e => onUpdateSettings({ showKeyLabels: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                {/* Fingering */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isFr ? 'Doigtés recommandés (1 à 5)' : 'Fingerings (1 to 5)'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFr ? 'Indique quel doigt utiliser pour chaque note' : 'Shows optimal finger number'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showFingering}
                    onChange={e => onUpdateSettings({ showFingering: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                {/* Lane Guides */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isFr ? 'Lignes de repères verticales' : 'Vertical lane guides'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFr ? 'Guides translucides alignés avec les touches blanches' : 'Visual guide lines aligned with keys'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showLanes}
                    onChange={e => onUpdateSettings({ showLanes: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                {/* Ripples */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isFr ? 'Ondes lumineuses d’impact' : 'Luminous impact ripples'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFr ? 'Effet dynamique d’onde lors de la frappe d’une note' : 'Water-like glow pulse on note contact'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showRipples}
                    onChange={e => onUpdateSettings({ showRipples: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>

                {/* Prompter Ribbon */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isFr ? 'Ruban prompteur supérieur' : 'Top solfege prompter ribbon'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isFr ? 'Bandeau supérieur montrant la mélodie en temps réel' : 'Top ticker banner showing upcoming melody'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showPrompterRibbon}
                    onChange={e => onUpdateSettings({ showPrompterRibbon: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Waterfall anticipation window */}
              <div className="mt-4 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-white block mb-1">
                  {isFr ? 'Vitesse de défilement (Anticipation)' : 'Scroll speed (Anticipation)'}
                </span>
                <span className="text-[11px] text-slate-400 block mb-2.5">
                  {isFr
                    ? 'Ajuste le temps d’arrivée des notes avant qu’elles n’atteignent le piano.'
                    : 'Time window for incoming notes before striking keyboard.'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: isFr ? 'Rapide (2.4s)' : 'Fast (2.4s)', value: 2.4 },
                    { label: isFr ? 'Normal (3.2s)' : 'Normal (3.2s)', value: 3.2 },
                    { label: isFr ? 'Lente (4.2s)' : 'Slow (4.2s)', value: 4.2 },
                  ].map(speedOpt => (
                    <button
                      key={speedOpt.value}
                      onClick={() => onUpdateSettings({ waterfallSpeed: speedOpt.value })}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        settings.waterfallSpeed === speedOpt.value
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {speedOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIO & VOIX */}
        {activeTab === 'audio' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span>{isFr ? 'Mode Vocal & Solfège' : 'Vocal Solfege Voice'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {isFr
                  ? 'Le moteur synthétise les notes de solfège (Do-Ré-Mi) à la juste hauteur en direct.'
                  : 'Synthesizes solfege notes in pitch with realistic formants.'}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => onChangeSolfegeVoiceMode('vocal')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    solfegeVoiceMode === 'vocal'
                      ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isFr ? 'Chœur Vocal Solfège (Recommandé)' : 'Vocal Solfege Choir (Recommended)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFr
                        ? 'Chante les voyelles Do, Ré, Mi avec résonance formantique et harmoniques'
                        : 'Sings Do, Re, Mi with resonant vocal formants'}
                    </p>
                  </div>
                  {solfegeVoiceMode === 'vocal' && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>

                <button
                  onClick={() => onChangeSolfegeVoiceMode('speech')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    solfegeVoiceMode === 'speech'
                      ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isFr ? 'Voix Parlée (Prononciation)' : 'Spoken Voice'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFr ? 'Prononce les noms des notes distinctement' : 'Speaks note names clearly'}
                    </p>
                  </div>
                  {solfegeVoiceMode === 'speech' && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>

                <button
                  onClick={() => onChangeSolfegeVoiceMode('off')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    solfegeVoiceMode === 'off'
                      ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isFr ? 'Piano Acoustique Pur' : 'Pure Acoustic Piano'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isFr ? 'Aucune voix synthétisée, uniquement le piano à queue' : 'Piano only without vocal solfege'}
                    </p>
                  </div>
                  {solfegeVoiceMode === 'off' && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Reset Button */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isFr ? 'Réinitialiser' : 'Reset Defaults'}</span>
        </button>

        <button
          onClick={onClose}
          className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
        >
          {isFr ? 'Terminer' : 'Done'}
        </button>
      </div>
    </div>
  );
};
