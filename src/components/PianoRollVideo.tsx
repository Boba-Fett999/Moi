import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Score, Note, SolfegeNaming, HandFilter, HandColorsConfig, DuoGameState, DifficultyLevel } from '../types/music';
import { pianoEngine } from '../services/audioEngine';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Sparkles,
  Download,
  Gauge,
  Mic,
  Palette,
  Users,
  Music2,
  Maximize2,
  Minimize2,
  Settings2,
} from 'lucide-react';
import {
  SolfegeSettingsDrawer,
  VisualSettings,
  DEFAULT_VISUAL_SETTINGS,
} from './SolfegeSettingsDrawer';

interface PianoRollVideoProps {
  score: Score;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  handFilter: HandFilter;
  setHandFilter: (filter: HandFilter) => void;
  naming: SolfegeNaming;
  setNaming: (naming: SolfegeNaming) => void;
  colors: HandColorsConfig;
  onOpenColorModal: () => void;
  onUpdateColors?: (colors: HandColorsConfig) => void;
  duoState: DuoGameState;
  onUpdateDuoState: (updater: (prev: DuoGameState) => DuoGameState) => void;
  onToggleDuoMode: () => void;
  currentDifficulty: DifficultyLevel;
  onChangeDifficulty: (diff: DifficultyLevel) => void;
}

interface ImpactRipple {
  x: number;
  y: number;
  color: string;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const PianoRollVideo: React.FC<PianoRollVideoProps> = ({
  score,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  onSeek,
  handFilter,
  setHandFilter,
  naming,
  setNaming,
  colors,
  onOpenColorModal,
  onUpdateColors,
  duoState,
  onUpdateDuoState,
  onToggleDuoMode,
  currentDifficulty,
  onChangeDifficulty,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-performance clock reference
  const internalTimeRef = useRef<number>(currentTime);
  const lastRafTimestampRef = useRef<number | null>(null);
  const playedNoteIdsRef = useRef<Set<number>>(new Set());
  const lastStateSyncTimeRef = useRef<number>(0);

  // Active impact ripples for visual fluid feedback
  const ripplesRef = useRef<ImpactRipple[]>([]);

  // Video recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Practice & audio settings
  const [speed, setSpeed] = useState<number>(1.0);
  const [metronome, setMetronome] = useState(false);
  const [solfegeVoiceMode, setSolfegeVoiceMode] = useState<'vocal' | 'speech' | 'off'>('vocal');
  const [practiceMode, setPracticeMode] = useState(false);

  // Visual & Wallpaper Customization Settings (Saved in LocalStorage)
  const [visualSettings, setVisualSettings] = useState<VisualSettings>(() => {
    try {
      const saved = localStorage.getItem('pianoscribe_visual_settings_v1');
      if (saved) return { ...DEFAULT_VISUAL_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_VISUAL_SETTINGS;
  });

  const handleUpdateVisualSettings = useCallback((
    updater: Partial<VisualSettings> | ((prev: VisualSettings) => VisualSettings)
  ) => {
    setVisualSettings(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem('pianoscribe_visual_settings_v1', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const handleResetVisualDefaults = useCallback(() => {
    setVisualSettings(DEFAULT_VISUAL_SETTINGS);
    try {
      localStorage.setItem('pianoscribe_visual_settings_v1', JSON.stringify(DEFAULT_VISUAL_SETTINGS));
    } catch (e) {}
  }, []);

  // Settings Drawer Toggle
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Fullscreen / Grand Écran State
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Active key presses with decay
  const activeMidiKeysRef = useRef<Map<number, { hand: 'right' | 'left'; intensity: number }>>(new Map());
  const [userPressedKeys, setUserPressedKeys] = useState<Map<number, 'right' | 'left'>>(new Map());

  // Loop section A-B
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopA, setLoopA] = useState<number>(0);
  const [loopB, setLoopB] = useState<number>(score.totalDuration);

  const lastBeatRef = useRef<number>(-1);
  const lastSungNoteRef = useRef<string>('');

  // Keep internalTimeRef in sync with external currentTime
  useEffect(() => {
    internalTimeRef.current = currentTime;
    playedNoteIdsRef.current.clear();
  }, [currentTime]);

  // Relative Seek (-5s / +5s)
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);

  const handleSeekRelative = useCallback((delta: number) => {
    const newTime = Math.max(0, Math.min(score.totalDuration, internalTimeRef.current + delta));
    internalTimeRef.current = newTime;
    playedNoteIdsRef.current.clear();
    onSeek(newTime);
    setSeekFeedback(delta > 0 ? `+${delta}s ⏩` : `${delta}s ⏪`);
    setTimeout(() => setSeekFeedback(null), 700);
  }, [score.totalDuration, onSeek]);

  // Adjust notes based on difficulty & duo
  const filteredNotes = score.notes.filter(n => {
    if (duoState.enabled) {
      if (duoState.filterPlayer === 'player1') return n.hand === 'right' || n.midi >= duoState.splitMidi;
      if (duoState.filterPlayer === 'player2') return n.hand === 'left' || n.midi < duoState.splitMidi;
      return true;
    }

    if (currentDifficulty === 'Facile') {
      return n.hand === 'right'; // Focus on melody for beginners
    }

    if (handFilter === 'right') return n.hand === 'right';
    if (handFilter === 'left') return n.hand === 'left';
    return true;
  });

  const minMidi = Math.max(21, Math.min(...score.notes.map(n => n.midi), 48) - 2);
  const maxMidi = Math.min(108, Math.max(...score.notes.map(n => n.midi), 72) + 2);

  const isBlackKey = (midi: number) => {
    const semitone = midi % 12;
    return [1, 3, 6, 8, 10].includes(semitone);
  };

  const getNoteLabel = useCallback((note: { pitch: string; solfege: string; midi: number }) => {
    if (naming === 'solfege') return note.solfege;
    if (naming === 'latin') return note.pitch;
    const degreeMap: Record<number, string> = { 0: '1', 2: '2', 4: '3', 5: '4', 7: '5', 9: '6', 11: '7' };
    return degreeMap[note.midi % 12] || note.solfege;
  }, [naming]);

  // Handle User virtual piano play (mouse or keyboard)
  const handleUserPlayKey = useCallback((midi: number, playerHand: 'right' | 'left' = 'right') => {
    pianoEngine.playNote(midi, 0.7);

    // Sing solfege if vocal mode is active
    if (solfegeVoiceMode === 'vocal') {
      const rootNoteNames = ['Do', 'Do♯', 'Ré', 'Ré♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
      const solfegeName = rootNoteNames[midi % 12];
      pianoEngine.singSolfegeVocal(solfegeName, midi, 0.4);
    }

    setUserPressedKeys(prev => {
      const next = new Map(prev);
      next.set(midi, playerHand);
      return next;
    });

    setTimeout(() => {
      setUserPressedKeys(prev => {
        const next = new Map(prev);
        next.delete(midi);
        return next;
      });
    }, 400);

    // Duo mode score increment
    if (duoState.enabled) {
      const isPlayer1 = playerHand === 'right' || midi >= duoState.splitMidi;
      onUpdateDuoState(s => ({
        ...s,
        player1Score: isPlayer1 ? s.player1Score + 10 : s.player1Score,
        player2Score: !isPlayer1 ? s.player2Score + 10 : s.player2Score,
        player1Hits: isPlayer1 ? s.player1Hits + 1 : s.player1Hits,
        player2Hits: !isPlayer1 ? s.player2Hits + 1 : s.player2Hits,
      }));
    }

    // Practice mode note hit
    if (practiceMode && !isPlaying) {
      const cur = internalTimeRef.current;
      const pendingNotes = filteredNotes.filter(
        n => n.startTime >= cur - 0.1 && n.startTime <= cur + 0.35
      );
      if (pendingNotes.some(n => n.midi === midi)) {
        const nextTime = Math.min(score.totalDuration, cur + 0.35);
        internalTimeRef.current = nextTime;
        onTimeUpdate(nextTime);
      }
    }
  }, [duoState.enabled, duoState.splitMidi, solfegeVoiceMode, practiceMode, isPlaying, filteredNotes, onTimeUpdate, onUpdateDuoState, score.totalDuration]);

  // 2-Player simultaneous keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      const key = e.key.toLowerCase();

      // PLAYER 2 (Left side of keyboard - Bass & Secondo)
      const p2Map: Record<string, number> = {
        'q': 48, 'w': 48, 'a': 48,
        'z': 49,
        's': 50,
        'e': 51,
        'd': 52,
        'f': 53,
        't': 54,
        'g': 55,
        'r': 56,
        'c': 57,
        'v': 59,
      };

      // PLAYER 1 (Right side of keyboard - Treble & Primo)
      const p1Map: Record<string, number> = {
        'j': 60,
        'i': 61,
        'k': 62,
        'o': 63,
        'l': 64,
        'm': 65,
        'p': 66,
        ';': 67,
        'ù': 69,
      };

      if (p2Map[key]) {
        handleUserPlayKey(p2Map[key], 'left');
      } else if (p1Map[key]) {
        handleUserPlayKey(p1Map[key], 'right');
      } else if (key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUserPlayKey, toggleFullscreen, isFullscreen]);

  // High-performance 60-120 FPS animation loop
  useEffect(() => {
    let animId: number;

    const renderFrame = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(renderFrame);
        return;
      }

      // 1. Advance internal clock smoothly
      if (isPlaying) {
        if (lastRafTimestampRef.current !== null) {
          const delta = ((timestamp - lastRafTimestampRef.current) / 1000) * speed;
          internalTimeRef.current += delta;

          if (internalTimeRef.current >= score.totalDuration) {
            internalTimeRef.current = 0;
            playedNoteIdsRef.current.clear();
            onTimeUpdate(0);
            onTogglePlay();
          }

          if (loopEnabled && internalTimeRef.current >= loopB) {
            internalTimeRef.current = loopA;
            playedNoteIdsRef.current.clear();
          }

          if (timestamp - lastStateSyncTimeRef.current > 80) {
            lastStateSyncTimeRef.current = timestamp;
            onTimeUpdate(internalTimeRef.current);
          }
        }
        lastRafTimestampRef.current = timestamp;
      } else {
        lastRafTimestampRef.current = null;
      }

      const curTime = internalTimeRef.current;

      // 2. High-precision Audio & Solfège Triggering
      if (isPlaying) {
        const active = new Map<number, { hand: 'right' | 'left'; intensity: number }>();

        filteredNotes.forEach((n, idx) => {
          if (curTime >= n.startTime && curTime <= n.startTime + n.duration) {
            active.set(n.midi, { hand: n.hand, intensity: 1.0 });
          }

          // Exact onset trigger with zero jitter
          if (curTime >= n.startTime && !playedNoteIdsRef.current.has(idx)) {
            if (curTime - n.startTime < 0.22) {
              // Acoustic Piano
              pianoEngine.playNote(n.midi, n.duration);

              // Fluid Vocal Solfège Choir
              if (solfegeVoiceMode === 'vocal') {
                pianoEngine.singSolfegeVocal(n.solfege, n.midi, Math.min(0.8, n.duration));
              } else if (solfegeVoiceMode === 'speech' && lastSungNoteRef.current !== n.solfege) {
                lastSungNoteRef.current = n.solfege;
                pianoEngine.speakSolfege(n.solfege, n.midi);
              }

              // Spawn dynamic visual ripple
              const handColor = n.hand === 'right' ? colors.rightHand : colors.leftHand;
              ripplesRef.current.push({
                x: 0, // calculated in canvas space below
                y: 0,
                color: handColor,
                radius: 4,
                maxRadius: 36,
                alpha: 0.85,
              });
            }
            playedNoteIdsRef.current.add(idx);
          }
        });

        activeMidiKeysRef.current = active;

        // Metronome sync
        if (metronome) {
          const beatDuration = 60 / score.bpm;
          const currentBeat = Math.floor(curTime / beatDuration);
          if (currentBeat !== lastBeatRef.current) {
            lastBeatRef.current = currentBeat;
            const beatsPerMeasure = parseInt(score.timeSignature.split('/')[0] || '4', 10);
            pianoEngine.playMetronomeTick(currentBeat % beatsPerMeasure === 0);
          }
        }
      } else {
        activeMidiKeysRef.current.clear();
      }

      // 3. Draw Canvas Frame
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
        }
        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);

        const prompterHeight = visualSettings.showPrompterRibbon ? 44 : 0;
        const keyboardHeight = Math.max(90, Math.min(145, height * 0.25));
        const waterfallHeight = height - keyboardHeight;
        const visibleTimeWindow = visualSettings.waterfallSpeed || 3.2;

        const whiteKeys: number[] = [];
        const blackKeys: number[] = [];
        for (let m = minMidi; m <= maxMidi; m++) {
          if (isBlackKey(m)) blackKeys.push(m);
          else whiteKeys.push(m);
        }

        const whiteKeyWidth = width / (whiteKeys.length || 1);
        const blackKeyWidth = whiteKeyWidth * 0.65;
        const blackKeyHeight = keyboardHeight * 0.62;

        const getNoteX = (midi: number) => {
          if (isBlackKey(midi)) {
            const prevWhiteIdx = whiteKeys.indexOf(midi - 1);
            if (prevWhiteIdx !== -1) {
              return prevWhiteIdx * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2;
            }
            return 0;
          } else {
            return whiteKeys.indexOf(midi) * whiteKeyWidth;
          }
        };

        const getNoteWidth = (midi: number) => {
          return isBlackKey(midi) ? blackKeyWidth : whiteKeyWidth;
        };

        // A. Background Gradient (Customizable via Settings Drawer)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, waterfallHeight);
        bgGrad.addColorStop(0, visualSettings.bgGradientTop || '#0F172A');
        bgGrad.addColorStop(1, visualSettings.bgGradientBottom || '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, waterfallHeight);

        // In Duo Mode: subtle vertical background tint for Player 2 (left) and Player 1 (right)
        if (duoState.enabled) {
          const splitX = getNoteX(duoState.splitMidi);
          ctx.fillStyle = `${colors.leftHand}09`;
          ctx.fillRect(0, prompterHeight, splitX, waterfallHeight - prompterHeight);
          ctx.fillStyle = `${colors.rightHand}09`;
          ctx.fillRect(splitX, prompterHeight, width - splitX, waterfallHeight - prompterHeight);

          // Duo Split Line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(splitX, prompterHeight);
          ctx.lineTo(splitX, waterfallHeight);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // B. Vertical Lane Guides
        if (visualSettings.showLanes) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
          ctx.lineWidth = 1;
          whiteKeys.forEach((_, idx) => {
            const x = idx * whiteKeyWidth;
            ctx.beginPath();
            ctx.moveTo(x, prompterHeight);
            ctx.lineTo(x, waterfallHeight);
            ctx.stroke();
          });
        }

        // C. Falling Notes (Solfège Waterfall with Sub-Pixel Smoothness)
        filteredNotes.forEach(note => {
          const timeUntilHit = note.startTime - curTime;
          const durationY = (note.duration / visibleTimeWindow) * (waterfallHeight - prompterHeight);
          const noteTopTime = timeUntilHit + note.duration;

          if (noteTopTime >= 0 && timeUntilHit <= visibleTimeWindow) {
            const bottomY = waterfallHeight - (timeUntilHit / visibleTimeWindow) * (waterfallHeight - prompterHeight);
            const topY = bottomY - durationY;
            const noteY = Math.max(prompterHeight, topY);
            const noteH = Math.max(12, bottomY - noteY);

            const x = getNoteX(note.midi) + 1.5;
            const w = Math.max(6, getNoteWidth(note.midi) - 3);

            const isRightHand = note.hand === 'right';
            const handColor = isRightHand ? colors.rightHand : colors.leftHand;
            const isActive = activeMidiKeysRef.current.has(note.midi);

            ctx.save();
            ctx.shadowColor = handColor;
            ctx.shadowBlur = isActive ? 18 : 6;

            // Note Capsule Fill
            ctx.fillStyle = handColor;
            ctx.beginPath();
            ctx.roundRect(x, noteY, w, noteH, Math.min(6, w / 2, noteH / 2));
            ctx.fill();

            // Contrast Rim
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Solfège Syllable Inside Note Bar (Smooth, Crisp Typography)
            if (visualSettings.showNoteNames && noteH >= 15 && w >= 13) {
              ctx.fillStyle = '#FFFFFF';
              ctx.font = `bold ${Math.min(13, w * 0.44)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(getNoteLabel(note), x + w / 2, noteY + Math.min(noteH / 2, 18));

              // If Duo Mode: show J1 or J2 tag
              if (duoState.enabled && noteH >= 32) {
                ctx.font = '8px sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(isRightHand ? 'J1' : 'J2', x + w / 2, noteY + noteH - 7);
              }
            }

            // Fingering number (1 to 5)
            if (visualSettings.showFingering && note.finger && noteH >= 24 && w >= 13) {
              ctx.font = 'bold 9px sans-serif';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.textAlign = 'center';
              ctx.fillText(`•${note.finger}•`, x + w / 2, noteY + noteH - 7);
            }
            ctx.restore();
          }
        });

        // D. Keyboard Strike Line (Glowing Horizon)
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, waterfallHeight);
        ctx.lineTo(width, waterfallHeight);
        ctx.stroke();
        ctx.restore();

        // E. Expanding Impact Ripples
        if (visualSettings.showRipples) {
          ripplesRef.current = ripplesRef.current.filter(r => r.alpha > 0.05);
          ripplesRef.current.forEach(r => {
            ctx.save();
            ctx.strokeStyle = r.color;
            ctx.globalAlpha = r.alpha;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(r.x, waterfallHeight, r.radius, Math.PI, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();

            r.radius += 1.8;
            r.alpha *= 0.88;
          });
        }

        // F. White Keys with Custom Right/Left Hand Colors
        const keyboardY = waterfallHeight;
        whiteKeys.forEach((midi, idx) => {
          const x = idx * whiteKeyWidth;
          const activeInfo = activeMidiKeysRef.current.get(midi);
          const userHand = userPressedKeys.get(midi);
          const activeHand = activeInfo ? activeInfo.hand : userHand;
          const isDown = Boolean(activeHand);

          ctx.save();
          if (isDown) {
            const pressColor = activeHand === 'right' ? colors.rightHand : colors.leftHand;
            ctx.fillStyle = pressColor;
            ctx.shadowColor = pressColor;
            ctx.shadowBlur = 16;
          } else {
            const keyGrad = ctx.createLinearGradient(x, keyboardY, x, keyboardY + keyboardHeight);
            keyGrad.addColorStop(0, '#F8FAFC');
            keyGrad.addColorStop(0.85, '#E2E8F0');
            keyGrad.addColorStop(1, '#CBD5E1');
            ctx.fillStyle = keyGrad;
          }

          ctx.beginPath();
          ctx.roundRect(x + 0.5, keyboardY, whiteKeyWidth - 1, keyboardHeight - 1, [0, 0, 3, 3]);
          ctx.fill();

          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1;
          ctx.stroke();

          if (visualSettings.showKeyLabels && whiteKeyWidth >= 16) {
            const rootNote = ['Do', '', 'Ré', '', 'Mi', 'Fa', '', 'Sol', '', 'La', '', 'Si'][midi % 12];
            const octave = Math.floor(midi / 12) - 1;
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = isDown ? '#FFFFFF' : '#334155';
            ctx.textAlign = 'center';
            ctx.fillText(rootNote, x + whiteKeyWidth / 2, keyboardY + keyboardHeight - 18);
            ctx.font = '9px sans-serif';
            ctx.fillStyle = isDown ? '#FFFFFF' : '#64748B';
            ctx.fillText(`${octave}`, x + whiteKeyWidth / 2, keyboardY + keyboardHeight - 6);
          }
          ctx.restore();
        });

        // G. Black Keys
        blackKeys.forEach(midi => {
          const x = getNoteX(midi);
          const activeInfo = activeMidiKeysRef.current.get(midi);
          const userHand = userPressedKeys.get(midi);
          const activeHand = activeInfo ? activeInfo.hand : userHand;
          const isDown = Boolean(activeHand);

          ctx.save();
          if (isDown) {
            const pressColor = activeHand === 'right' ? colors.rightHand : colors.leftHand;
            ctx.fillStyle = pressColor;
            ctx.shadowColor = pressColor;
            ctx.shadowBlur = 16;
          } else {
            const bGrad = ctx.createLinearGradient(x, keyboardY, x, keyboardY + blackKeyHeight);
            bGrad.addColorStop(0, '#334155');
            bGrad.addColorStop(0.7, '#1E293B');
            bGrad.addColorStop(1, '#0F172A');
            ctx.fillStyle = bGrad;
          }

          ctx.beginPath();
          ctx.roundRect(x, keyboardY, blackKeyWidth, blackKeyHeight, [0, 0, 2, 2]);
          ctx.fill();

          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1;
          ctx.stroke();

          if (visualSettings.showKeyLabels && blackKeyWidth >= 14) {
            const blackNoteNames: Record<number, string> = {
              1: 'Do♯', 3: 'Ré♯', 6: 'Fa♯', 8: 'Sol♯', 10: 'La♯'
            };
            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(blackNoteNames[midi % 12] || '', x + blackKeyWidth / 2, keyboardY + blackKeyHeight - 7);
          }
          ctx.restore();
        });

        // H. Duo Mode Keyboard Split Labels
        if (duoState.enabled) {
          const splitX = getNoteX(duoState.splitMidi);
          ctx.save();
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = colors.leftHand;
          ctx.fillText(`👥 ${duoState.player2Name} (Secondo - Basse)`, 15, keyboardY + 16);

          ctx.fillStyle = colors.rightHand;
          ctx.fillText(`👥 ${duoState.player1Name} (Primo - Mélodie)`, splitX + 10, keyboardY + 16);
          ctx.restore();
        }

        // I. TOP CANVAS SOLFÈGE MELODY RIBBON (Ultra-Fluid 60FPS)
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(0, 0, width, prompterHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, prompterHeight);
        ctx.lineTo(width, prompterHeight);
        ctx.stroke();

        // Find active note & upcoming notes for the singing ribbon
        const ribbonNotes = filteredNotes.filter(
          n => n.startTime >= curTime - 0.25 && n.startTime <= curTime + 2.8
        );

        if (ribbonNotes.length === 0) {
          ctx.fillStyle = '#64748B';
          ctx.font = 'italic 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('♪ En attente de lecture solfège...', width / 2, 26);
        } else {
          // Draw smooth melodic contour line connecting notes
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ribbonNotes.forEach((n, idx) => {
            const timeDiff = n.startTime - curTime;
            const rx = 100 + (timeDiff / 2.8) * (width - 150);
            const ry = 22 - ((n.midi - 60) / 36) * 12;
            if (idx === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          });
          ctx.stroke();

          // Draw note pills on ribbon
          ribbonNotes.forEach(n => {
            const timeDiff = n.startTime - curTime;
            const rx = 100 + (timeDiff / 2.8) * (width - 150);
            const ry = 22;
            const isCurrent = Math.abs(timeDiff) < 0.18;
            const handColor = n.hand === 'right' ? colors.rightHand : colors.leftHand;

            ctx.save();
            if (isCurrent) {
              ctx.shadowColor = handColor;
              ctx.shadowBlur = 12;
              ctx.fillStyle = handColor;
              ctx.beginPath();
              ctx.roundRect(rx - 26, ry - 14, 52, 26, 13);
              ctx.fill();

              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 12px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`♪ ${n.solfege}`, rx, ry);
            } else {
              ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
              ctx.beginPath();
              ctx.roundRect(rx - 20, ry - 11, 40, 22, 10);
              ctx.fill();

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
              ctx.stroke();

              ctx.fillStyle = '#CBD5E1';
              ctx.font = '11px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(n.solfege, rx, ry);
            }
            ctx.restore();
          });
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [
    isPlaying,
    speed,
    filteredNotes,
    minMidi,
    maxMidi,
    naming,
    visualSettings,
    getNoteLabel,
    userPressedKeys,
    metronome,
    solfegeVoiceMode,
    loopEnabled,
    loopA,
    loopB,
    score.bpm,
    score.timeSignature,
    score.totalDuration,
    colors,
    duoState,
    onTimeUpdate,
    onTogglePlay,
  ]);

  // Video recording
  const handleToggleRecord = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const videoStream = canvas.captureStream(60);
      const audioTrack = pianoEngine.getAudioStream();
      if (audioTrack) {
        videoStream.addTrack(audioTrack);
      }

      try {
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
        const recorder = new MediaRecorder(videoStream, { mimeType });
        recordedChunksRef.current = [];

        recorder.ondataavailable = e => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Solfège_Video_${score.title.replace(/\s+/g, '_')}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        if (!isPlaying) onTogglePlay();
      } catch (err) {
        console.error('Failed to start video recording:', err);
      }
    }
  };

  // Keyboard click detection on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const keyboardHeight = Math.max(90, Math.min(135, canvas.clientHeight * 0.26));
    const keyboardY = canvas.clientHeight - keyboardHeight;

    if (y < keyboardY) {
      const visibleTimeWindow = 3.2;
      const clickedTime = internalTimeRef.current + ((keyboardY - y) / keyboardY) * visibleTimeWindow;
      const targetTime = Math.max(0, Math.min(score.totalDuration, clickedTime));
      internalTimeRef.current = targetTime;
      onSeek(targetTime);
      return;
    }

    const whiteKeys: number[] = [];
    const blackKeys: number[] = [];
    for (let m = minMidi; m <= maxMidi; m++) {
      if (isBlackKey(m)) blackKeys.push(m);
      else whiteKeys.push(m);
    }

    const whiteKeyWidth = canvas.clientWidth / (whiteKeys.length || 1);
    const blackKeyWidth = whiteKeyWidth * 0.65;
    const blackKeyHeight = keyboardHeight * 0.62;

    if (y <= keyboardY + blackKeyHeight) {
      for (const m of blackKeys) {
        const prevWhiteIdx = whiteKeys.indexOf(m - 1);
        const bx = prevWhiteIdx * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2;
        if (x >= bx && x <= bx + blackKeyWidth) {
          handleUserPlayKey(m, m >= duoState.splitMidi ? 'right' : 'left');
          return;
        }
      }
    }

    const whiteIdx = Math.floor(x / whiteKeyWidth);
    if (whiteIdx >= 0 && whiteIdx < whiteKeys.length) {
      const m = whiteKeys[whiteIdx];
      handleUserPlayKey(m, m >= duoState.splitMidi ? 'right' : 'left');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col w-full bg-slate-950 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none overflow-hidden'
          : 'rounded-3xl overflow-hidden border border-slate-800 shadow-2xl'
      }`}
    >
      {/* Top Banner: Real-time Controls & Solfège Voice Mode */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Niveau :</span>
          {(['Facile', 'Moyen', 'Compliqué'] as DifficultyLevel[]).map(diff => (
            <button
              key={diff}
              onClick={() => onChangeDifficulty(diff)}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                currentDifficulty === diff
                  ? diff === 'Facile'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : diff === 'Moyen'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Fluid Solfège Voice Toggle: Chœur Vocal (Formants) vs Parole vs Off */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <Mic className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
          <span className="text-slate-400 font-medium hidden sm:inline">Solfège Vocal :</span>
          <button
            onClick={() => setSolfegeVoiceMode('vocal')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              solfegeVoiceMode === 'vocal'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Chante les notes en solfège avec formants vocaux fluides"
          >
            Chant Fluide (Do-Ré-Mi)
          </button>
          <button
            onClick={() => setSolfegeVoiceMode('speech')}
            className={`px-2 py-1 rounded-lg font-medium transition-all ${
              solfegeVoiceMode === 'speech'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Voix parlée"
          >
            Parole
          </button>
          <button
            onClick={() => setSolfegeVoiceMode('off')}
            className={`px-2 py-1 rounded-lg font-medium transition-all ${
              solfegeVoiceMode === 'off'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Piano seul
          </button>
        </div>

        {/* Hand Colors & 2-Player Duo & Settings & Fullscreen tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Settings Button (Side Drawer) */}
          <button
            onClick={() => setShowSettingsDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all hover:border-rose-500/50 shadow-sm"
            title="Personnaliser : fond d’écran, langue, solfège, affichage"
          >
            <Settings2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Paramètres</span>
          </button>

          {/* Fullscreen / Grand Écran Button */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
              isFullscreen
                ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/25'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700 hover:border-rose-500/50'
            }`}
            title={isFullscreen ? 'Quitter le grand écran (Échap)' : 'Passer en grand écran / plein écran (Touche F)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isFullscreen ? 'Réduire' : 'Grand Écran'}</span>
          </button>

          {/* Mode 2 Joueurs / 4 Mains Toggle */}
          <button
            onClick={onToggleDuoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all ${
              duoState.enabled
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
            title="Activer le mode 4 mains pour jouer à deux au piano"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">4 Mains</span>
          </button>

          {/* Naming toggle */}
          <div className="flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setNaming('solfege')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                naming === 'solfege'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Do-Ré-Mi
            </button>
            <button
              onClick={() => setNaming('latin')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                naming === 'latin'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C-D-E
            </button>
          </div>
        </div>
      </div>

      {/* Main Waterfall & Piano Canvas */}
      <div className={`relative w-full bg-slate-950 cursor-pointer select-none ${
        isFullscreen ? 'flex-1 min-h-0' : 'h-[390px] md:h-[490px]'
      }`}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Fullscreen Floating Header Bar */}
        {isFullscreen && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <span className="font-bold text-white text-xs mr-2">{score.title}</span>
                <span className="text-slate-400 text-xs hidden sm:inline">{score.composer} • {score.keySignature}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setShowSettingsDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 shadow-xl transition-all"
                title="Modifier fond d’écran, langue, solfège"
              >
                <Settings2 className="w-4 h-4 text-rose-400" />
                <span>Paramètres</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xl shadow-rose-600/30 transition-all active:scale-95"
                title="Quitter le plein écran (Touche Échap)"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Quitter Plein Écran</span>
              </button>
            </div>
          </div>
        )}

        {/* Duo Mode Overlay Helper */}
        {duoState.enabled && (
          <div className="absolute top-14 left-4 bg-indigo-950/90 border border-indigo-500/40 text-white px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xl backdrop-blur">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Mode 2 Joueurs : {duoState.player2Name} (Gauche) & {duoState.player1Name} (Droite)</span>
          </div>
        )}

        {/* Recording active indicator */}
        {isRecording && (
          <div className="absolute top-14 right-4 bg-red-600/90 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold animate-pulse shadow-lg backdrop-blur">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
            Enregistrement Vidéo en cours...
          </div>
        )}

        {/* Practice mode badge */}
        {practiceMode && (
          <div className="absolute bottom-36 left-4 bg-amber-500/90 text-slate-950 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            Mode Pratique : Jouez la note !
          </div>
        )}

        {/* Seek feedback toast indicator (-5s / +5s) */}
        {seekFeedback && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 border border-rose-500/60 text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 text-base font-bold shadow-2xl backdrop-blur z-30 pointer-events-none transition-all">
            <span className="text-rose-400 font-mono text-lg">{seekFeedback}</span>
          </div>
        )}
      </div>

      {/* Timeline Scrub Bar */}
      <div className="px-4 pt-3 pb-1 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400 w-12 text-right">
          {Math.floor(currentTime / 60)}:
          {Math.floor(currentTime % 60)
            .toString()
            .padStart(2, '0')}
        </span>
        <div className="relative flex-1 group">
          <input
            type="range"
            min={0}
            max={score.totalDuration || 60}
            step={0.05}
            value={currentTime}
            onChange={e => {
              const val = parseFloat(e.target.value);
              internalTimeRef.current = val;
              onSeek(val);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:h-2.5 transition-all"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 w-12">
          {Math.floor(score.totalDuration / 60)}:
          {Math.floor(score.totalDuration % 60)
            .toString()
            .padStart(2, '0')}
        </span>
      </div>

      {/* Primary Video Player Controls */}
      <div className="p-4 bg-slate-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls with -5s and +5s */}
        <div className="flex items-center gap-2">
          {/* Revenir au début (0:00) */}
          <button
            onClick={() => {
              internalTimeRef.current = 0;
              playedNoteIdsRef.current.clear();
              onSeek(0);
              setSeekFeedback('0:00 ↺');
              setTimeout(() => setSeekFeedback(null), 700);
            }}
            title="Revenir au tout début (0:00)"
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 rounded-xl transition-all border border-transparent hover:border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Reculer de 5 secondes (-5s) */}
          <button
            onClick={() => handleSeekRelative(-5)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/90 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-rose-500/40 transition-all shadow-sm group"
            title="Reculer de 5 secondes (Touche Flèche Gauche ←)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400 group-hover:-rotate-45 transition-transform" />
            <span>-5s</span>
          </button>

          {/* Lecture / Pause */}
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 transition-transform active:scale-95"
            title={isPlaying ? 'Pause (Barre Espace)' : 'Lecture (Barre Espace)'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Avancer de 5 secondes (+5s) */}
          <button
            onClick={() => handleSeekRelative(5)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/90 active:scale-95 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-rose-500/40 transition-all shadow-sm group"
            title="Avancer de 5 secondes (Touche Flèche Droite →)"
          >
            <span>+5s</span>
            <RotateCw className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-45 transition-transform" />
          </button>

          {/* Hands Filter */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setHandFilter('both')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                handFilter === 'both' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              2 Mains
            </button>
            <button
              onClick={() => setHandFilter('right')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                handFilter === 'right' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Main Droite
            </button>
            <button
              onClick={() => setHandFilter('left')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                handFilter === 'left' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Main Gauche
            </button>
          </div>
        </div>

        {/* Speed & Practice Tools */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Speed selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Vitesse :</span>
            {[0.5, 0.75, 1.0, 1.25].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`text-xs px-2 py-0.5 rounded font-mono transition-all ${
                  speed === s ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Metronome */}
          <button
            onClick={() => setMetronome(!metronome)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              metronome
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Métronome synchronisé"
          >
            <span>♩ Métronome</span>
          </button>

          {/* Practice Mode */}
          <button
            onClick={() => setPracticeMode(!practiceMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              practiceMode
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Mode entraînement: attend que vous jouiez la touche"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mode Attente</span>
          </button>

          {/* Record Video */}
          <button
            onClick={handleToggleRecord}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isRecording
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-gradient-to-r from-rose-600 to-orange-600 text-white border-rose-500 hover:brightness-110 shadow-md'
            }`}
            title="Télécharger la vidéo solfège animée (WebM/MP4)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isRecording ? 'Arrêter' : 'Exporter Vidéo'}</span>
          </button>
        </div>
      </div>

      {/* Settings Drawer (Fond d’écran, langue, solfège, couleurs & affichage) */}
      <SolfegeSettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        settings={visualSettings}
        onUpdateSettings={handleUpdateVisualSettings}
        naming={naming}
        onUpdateNaming={setNaming}
        colors={colors}
        onUpdateColors={onUpdateColors || (() => {})}
        solfegeVoiceMode={solfegeVoiceMode}
        onChangeSolfegeVoiceMode={setSolfegeVoiceMode}
        onResetDefaults={handleResetVisualDefaults}
      />
    </div>
  );
};
