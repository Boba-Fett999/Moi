import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Score, SolfegeNaming, HandFilter, HandColorsConfig, DuoGameState, DifficultyLevel } from './types/music';
import { SAMPLE_PIECES } from './services/samplePieces';
import { OfflineStorageManager } from './services/offlineStorage';
import { pianoEngine } from './services/audioEngine';
import { useMidi } from './hooks/useMidi';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { PianoRollVideo } from './components/PianoRollVideo';
import { SheetMusicView } from './components/SheetMusicView';
import { InputSection } from './components/InputSection';
import { CommunityLibraryMenu } from './components/CommunityLibraryMenu';
import { SolfegeGuideModal } from './components/SolfegeGuideModal';
import { HandColorModal } from './components/HandColorModal';
import { DuoModePanel } from './components/DuoModePanel';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Music,
  Video,
  FileText,
  Sliders,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Keyboard,
  Layers,
  ChevronDown,
  Info,
  Search,
  PlusCircle,
  Library,
  Palette,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();

  // Current active score: initialize from offline storage or sample pieces
  const [currentScore, setCurrentScore] = useState<Score>(() => {
    const offlinePieces = OfflineStorageManager.getOfflinePieces();
    return offlinePieces[0] || SAMPLE_PIECES[0];
  });

  // Difficulty level (Facile, Moyen, Compliqué)
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    currentScore.difficulty || 'Moyen'
  );

  // Custom Hand Colors (Main Droite & Main Gauche)
  const [handColors, setHandColors] = useState<HandColorsConfig>({
    rightHand: '#06B6D4', // Vibrant Cyan (MD)
    leftHand: '#A855F7',  // Rich Purple (MG)
  });
  const [showColorModal, setShowColorModal] = useState(false);

  // Duo / 4 Mains Game State
  const [duoState, setDuoState] = useState<DuoGameState>({
    enabled: false,
    player1Name: 'Joueur 1',
    player2Name: 'Joueur 2',
    player1Score: 0,
    player2Score: 0,
    player1Streak: 0,
    player2Streak: 0,
    player1Hits: 0,
    player2Hits: 0,
    splitMidi: 60, // C4 Middle C / Do central
    filterPlayer: 'both',
  });

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // View mode: 'split' | 'video' | 'sheet'
  const [viewMode, setViewMode] = useState<'split' | 'video' | 'sheet'>('split');

  // Main active tab: 'player' | 'community' | 'transcribe'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'player' | 'community' | 'transcribe'>('player');

  // Musical preferences
  const [naming, setNaming] = useState<SolfegeNaming>('solfege');
  const [handFilter, setHandFilter] = useState<HandFilter>('both');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Web MIDI API connection for physical digital pianos
  const handleMidiNoteOn = useCallback((midi: number, velocity: number) => {
    pianoEngine.playNote(midi, 0.8, velocity);
    if (duoState.enabled) {
      const isPlayer1 = midi >= duoState.splitMidi;
      setDuoState(s => ({
        ...s,
        player1Score: isPlayer1 ? s.player1Score + 10 : s.player1Score,
        player2Score: !isPlayer1 ? s.player2Score + 10 : s.player2Score,
        player1Hits: isPlayer1 ? s.player1Hits + 1 : s.player1Hits,
        player2Hits: !isPlayer1 ? s.player2Hits + 1 : s.player2Hits,
      }));
    }
  }, [duoState.enabled, duoState.splitMidi]);

  const { isSupported: isMidiSupported, devices: midiDevices } = useMidi(handleMidiNoteOn);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev && currentTime >= currentScore.totalDuration) {
        setCurrentTime(0);
      }
      return !prev;
    });
  }, [currentTime, currentScore.totalDuration]);

  // Seek time
  const handleSeek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(currentScore.totalDuration, time)));
  }, [currentScore.totalDuration]);

  // Toggle Duo Mode
  const toggleDuoMode = () => {
    setDuoState(prev => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  // Change Difficulty
  const handleDifficultyChange = (diff: DifficultyLevel) => {
    setCurrentDifficulty(diff);
  };

  // Global keyboard shortcuts (Space = Play/Pause, Left/Right = Seek)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(currentTime - 5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTime + 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSeek, currentTime]);

  // Handle score loaded from input section or community catalog
  const handleScoreLoaded = (score: Score) => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentScore(score);
    if (score.difficulty) {
      setCurrentDifficulty(score.difficulty);
    }
    // Save to offline storage immediately so it remains available offline
    OfflineStorageManager.addPieceToOffline(score);
    setActiveWorkspaceTab('player');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div
            onClick={() => setActiveWorkspaceTab('player')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-lg shadow-rose-600/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Music className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  PianoScribe
                </h1>
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Partition & Solfège
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Convertisseur, Couleurs personnalisées & Mode Duo 4 Mains
              </p>
            </div>
          </div>

          {/* Center Navigation Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveWorkspaceTab('community')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeWorkspaceTab === 'community'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Bibliothèque & Recherche</span>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('player')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeWorkspaceTab === 'player'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Jouer ({currentScore.title.slice(0, 14)}...)</span>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('transcribe')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeWorkspaceTab === 'transcribe'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ajouter YouTube / MP3 / MP4</span>
            </button>
          </div>

          {/* Right Action Tools: Colors & Duo Mode & MIDI & PWA Install */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Network Online / Offline Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
                isOnline
                  ? 'bg-slate-800/80 text-emerald-400 border-slate-700'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
              title={isOnline ? 'Connecté à Internet' : 'Mode Hors-ligne : Toutes les musiques locales restent disponibles'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline text-slate-300 font-normal">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hors-ligne</span>
                </>
              )}
            </div>

            {/* Hand Colors Picker Button */}
            <button
              onClick={() => setShowColorModal(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Changer les couleurs de la main droite et de la main gauche"
            >
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <div className="flex items-center gap-1">
                <span style={{ backgroundColor: handColors.rightHand }} className="w-2.5 h-2.5 rounded-full" />
                <span style={{ backgroundColor: handColors.leftHand }} className="w-2.5 h-2.5 rounded-full" />
              </div>
              <span className="hidden md:inline">Couleurs</span>
            </button>

            {/* Duo Mode (Jouer à 2) Button */}
            <button
              onClick={toggleDuoMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                duoState.enabled
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title="Activer le mode 4 mains pour jouer à 2 au piano"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mode 4 Mains</span>
            </button>

            {/* MIDI piano status */}
            {isMidiSupported && (
              <div
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  midiDevices.length > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={
                  midiDevices.length > 0
                    ? `Clavier MIDI connecté : ${midiDevices[0].name}`
                    : 'Connectez un piano numérique USB/Bluetooth pour vous entraîner'
                }
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>
                  {midiDevices.length > 0 ? midiDevices[0].name.slice(0, 10) + '...' : 'MIDI'}
                </span>
              </div>
            )}

            {/* Solfège guide modal button */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* 1. Community Library Menu with Search Bar & Difficulty Filters */}
        {activeWorkspaceTab === 'community' && (
          <div className="animate-fadeIn">
            <CommunityLibraryMenu
              currentScoreId={currentScore.id}
              onSelectPiece={handleScoreLoaded}
              onOpenUpload={() => setActiveWorkspaceTab('transcribe')}
            />
          </div>
        )}

        {/* 2. Upload / Transcribe Section (YouTube / MP3 / MP4 / Démos) */}
        {activeWorkspaceTab === 'transcribe' && (
          <div className="animate-fadeIn">
            <InputSection
              onScoreLoaded={handleScoreLoaded}
              currentScoreId={currentScore.id}
            />
          </div>
        )}

        {/* 3. Player Workspace (Vidéo Solfège & Partition) */}
        {activeWorkspaceTab === 'player' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Player Control Bar: Current Piece Info + View Mode Selector + Quick Search Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveWorkspaceTab('community')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-rose-400" />
                  <span>Changer de morceau</span>
                </button>
                <div className="text-xs">
                  <span className="font-bold text-white text-sm block sm:inline mr-2">
                    {currentScore.title}
                  </span>
                  <span className="text-slate-400">
                    {currentScore.composer} • {currentScore.notes.length} notes • {currentScore.keySignature}
                  </span>
                </div>
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'split'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Vue Double</span>
                </button>

                <button
                  onClick={() => setViewMode('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'video'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Vidéo Solfège</span>
                </button>

                <button
                  onClick={() => setViewMode('sheet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'sheet'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Partition</span>
                </button>
              </div>
            </div>

            {/* Duo Mode Panel (When 4 Mains / 2 Joueurs is activated) */}
            {duoState.enabled && (
              <DuoModePanel
                duoState={duoState}
                onUpdateDuoState={setDuoState}
                colors={handColors}
              />
            )}

            {/* Vidéo Solfège (Smooth Waterfall & Virtual Keyboard with Custom Colors) */}
            {(viewMode === 'video' || viewMode === 'split') && (
              <div>
                <PianoRollVideo
                  score={currentScore}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onTimeUpdate={setCurrentTime}
                  onTogglePlay={togglePlay}
                  onSeek={handleSeek}
                  handFilter={handFilter}
                  setHandFilter={setHandFilter}
                  naming={naming}
                  setNaming={setNaming}
                  colors={handColors}
                  onOpenColorModal={() => setShowColorModal(true)}
                  onUpdateColors={setHandColors}
                  duoState={duoState}
                  onUpdateDuoState={setDuoState}
                  onToggleDuoMode={toggleDuoMode}
                  currentDifficulty={currentDifficulty}
                  onChangeDifficulty={handleDifficultyChange}
                />
              </div>
            )}

            {/* Partition Interactive (Grand Staff: Clé de Sol & Clé de Fa with Custom Colors) */}
            {(viewMode === 'sheet' || viewMode === 'split') && (
              <div>
                <SheetMusicView
                  score={currentScore}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  naming={naming}
                  handFilter={handFilter}
                  colors={handColors}
                  duoMode={duoState.enabled}
                  difficulty={currentDifficulty}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <p>
          PianoScribe • Niveaux Facile, Moyen, Compliqué • Couleurs des Mains personnalisables • Mode 4 Mains (Jouer à 2)
        </p>
      </footer>

      {/* Hand Color Picker Modal */}
      <HandColorModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        colors={handColors}
        onChangeColors={setHandColors}
      />

      {/* Solfège Quick Reference Modal */}
      <SolfegeGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Offline Status Floating Toast */}
      <OfflineIndicator />
    </div>
  );
}
