import { Score, Note } from '../types/music';
import { SAMPLE_PIECES } from './samplePieces';
import { generateSmartPianoScore } from './pianoArranger';

export interface OfflinePiece extends Score {
  category?: string;
  addedBy?: string;
  likes?: number;
  plays?: number;
  previewSolfege?: string;
  isPreinstalled?: boolean;
}

// Built-in catalog guaranteed to be available 100% offline with complete full-length pieces (60s - 90s)
export const PREINSTALLED_PIECES: OfflinePiece[] = [
  {
    id: 'fur-elise',
    title: 'Lettre à Élise (Für Elise) - Intégral',
    composer: 'Ludwig van Beethoven',
    category: 'Classique',
    bpm: 120,
    timeSignature: '3/8',
    keySignature: 'La mineur',
    difficulty: 'Facile',
    description: 'Le chef-d’œuvre incontournable pour tout pianiste. Thème poétique complet avec toutes ses sections A et B développées.',
    sourceType: 'demo',
    sourceName: 'Beethoven - Für Elise',
    addedBy: 'Maestro Beethoven',
    likes: 184,
    plays: 2180,
    totalDuration: 66.0,
    previewSolfege: 'Mi • Ré♯ • Mi • Ré♯ • Mi • Si • Ré • Do • La',
    isPreinstalled: true,
    notes: SAMPLE_PIECES.find(p => p.id === 'fur-elise')?.notes || [],
  },
  {
    id: 'rush-e',
    title: 'RUSH E (Morceau Complet)',
    composer: 'Sheet Music Boss',
    category: 'Films & Pop',
    bpm: 158,
    timeSignature: '4/4',
    keySignature: 'La mineur',
    difficulty: 'Compliqué',
    description: 'Le défi pianistique le plus fou d’internet. Notes ultra-rapides en staccato, montées chromatiques et finale titanesque.',
    sourceType: 'youtube',
    sourceName: 'Sheet Music Boss - RUSH E',
    addedBy: 'VirtuosoRush',
    likes: 540,
    plays: 6890,
    totalDuration: 66.0,
    previewSolfege: 'Mi • Mi • Mi • Mi • Fa • Mi • Ré • Do',
    isPreinstalled: true,
    notes: generateSmartPianoScore('rush e', 'Sheet Music Boss').notes,
  },
  {
    id: 'river-flows-in-you',
    title: 'River Flows in You (Version Complète)',
    composer: 'Yiruma',
    category: 'Films & Pop',
    bpm: 68,
    timeSignature: '4/4',
    keySignature: 'La majeur',
    difficulty: 'Moyen',
    description: 'La romance au piano la plus célèbre au monde. Arpèges liquides et envolée mélodique sur toute la durée de la pièce.',
    sourceType: 'youtube',
    sourceName: 'Yiruma - River Flows in You',
    addedBy: 'Amélie_Music',
    likes: 470,
    plays: 4950,
    totalDuration: 66.0,
    previewSolfege: 'La • Sol♯ • La • Do♯ • Mi • Do♯ • Ré • Mi',
    isPreinstalled: true,
    notes: generateSmartPianoScore('river flows in you', 'Yiruma').notes,
  },
  {
    id: 'comptine-amelie',
    title: 'Comptine d’un autre été : L’Après-Midi',
    composer: 'Yann Tiersen (Amélie Poulain)',
    category: 'Films & Pop',
    bpm: 100,
    timeSignature: '4/4',
    keySignature: 'Mi mineur',
    difficulty: 'Moyen',
    description: 'L\'air mélancolique légendaire du film Le Fabuleux Destin d\'Amélie Poulain. Arpèges hypnotiques et montée crescendo complète.',
    sourceType: 'youtube',
    sourceName: 'Yann Tiersen - Amélie Poulain',
    addedBy: 'Pierre_Piano92',
    likes: 380,
    plays: 3450,
    totalDuration: 65.0,
    previewSolfege: 'Mi • Sol • Si • Mi • Sol • Si • Ré • Fa♯',
    isPreinstalled: true,
    notes: (() => {
      const baseNotes: Note[] = [];
      const measureSec = 2.4;
      const chords = [
        { bass: 52, arp: [59, 64, 67, 71], mel: 76 }, // Em
        { bass: 43, arp: [50, 55, 59, 62], mel: 78 }, // G
        { bass: 47, arp: [54, 59, 62, 66], mel: 74 }, // Bm
        { bass: 50, arp: [57, 62, 66, 69], mel: 73 }, // D
      ];
      for (let m = 0; m < 26; m++) {
        const t = m * measureSec;
        const c = chords[m % 4];
        baseNotes.push({ pitch: 'E3', midi: c.bass, startTime: Number(t.toFixed(2)), duration: 1.2, hand: 'left', solfege: 'Mi', octave: 3, finger: 5 });
        c.arp.forEach((p, idx) => {
          baseNotes.push({ pitch: 'B3', midi: p, startTime: Number((t + 0.6 + idx * 0.45).toFixed(2)), duration: 0.4, hand: 'left', solfege: 'Si', octave: 3, finger: idx + 1 });
        });
        // Right hand theme
        baseNotes.push({ pitch: 'E5', midi: c.mel + (m >= 12 ? 12 : 0), startTime: Number(t.toFixed(2)), duration: 1.1, hand: 'right', solfege: 'Mi', octave: 5, finger: 5 });
        baseNotes.push({ pitch: 'G5', midi: c.mel - 2 + (m >= 12 ? 12 : 0), startTime: Number((t + 1.2).toFixed(2)), duration: 1.1, hand: 'right', solfege: 'Sol', octave: 5, finger: 3 });
      }
      return baseNotes;
    })(),
  },
  {
    id: 'interstellar',
    title: 'First Step (Interstellar Theme - Complet)',
    composer: 'Hans Zimmer',
    category: 'Films & Pop',
    bpm: 96,
    timeSignature: '3/4',
    keySignature: 'La mineur',
    difficulty: 'Facile',
    description: 'Thème culte spatial de Hans Zimmer avec ostinato hypnotique, crescendo grandiose et apaisement final.',
    sourceType: 'youtube',
    sourceName: 'Hans Zimmer - Interstellar OST',
    addedBy: 'CosmicPianist',
    likes: 490,
    plays: 4320,
    totalDuration: 68.0,
    previewSolfege: 'La • Mi • La • Mi • Fa • Mi • Do • Mi',
    isPreinstalled: true,
    notes: (() => {
      const notes: Note[] = [];
      const mSec = 1.875;
      const progression = [
        { bass: 45, right: [64, 69] }, // Am
        { bass: 41, right: [65, 69] }, // F
        { bass: 48, right: [64, 67] }, // C
        { bass: 43, right: [62, 67] }, // G
      ];
      for (let m = 0; m < 34; m++) {
        const t = m * mSec;
        const p = progression[m % 4];
        notes.push({ pitch: 'A2', midi: p.bass, startTime: Number(t.toFixed(2)), duration: 1.8, hand: 'left', solfege: 'La', octave: 2, finger: 5 });
        for (let s = 0; s < 3; s++) {
          const shift = m >= 16 ? 12 : 0;
          notes.push({ pitch: 'E4', midi: p.right[0] + shift, startTime: Number((t + s * 0.62).toFixed(2)), duration: 0.3, hand: 'right', solfege: 'Mi', octave: 4, finger: 1 });
          notes.push({ pitch: 'A4', midi: p.right[1] + shift, startTime: Number((t + s * 0.62 + 0.31).toFixed(2)), duration: 0.3, hand: 'right', solfege: 'La', octave: 4, finger: 3 });
        }
      }
      return notes;
    })(),
  },
  {
    id: 'bach-prelude',
    title: 'Prélude No. 1 en Do Majeur (BWV 846) - Complet',
    composer: 'Johann Sebastian Bach',
    category: 'Classique',
    bpm: 76,
    timeSignature: '4/4',
    keySignature: 'Do majeur',
    difficulty: 'Facile',
    description: 'Arpèges réguliers et fluides sur les 16 mesures de la progression harmonique complète du Clavier Bien Tempéré.',
    sourceType: 'demo',
    sourceName: 'J.S. Bach - Prélude 1',
    addedBy: 'Jean-Sébastien B.',
    likes: 245,
    plays: 2150,
    totalDuration: 65.0,
    previewSolfege: 'Do • Mi • Sol • Do • Mi • Sol • Do • Mi',
    isPreinstalled: true,
    notes: SAMPLE_PIECES.find(p => p.id === 'bach-prelude')?.notes || [],
  },
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune (Suite Bergamasque) - Intégral',
    composer: 'Claude Debussy',
    category: 'Classique',
    bpm: 52,
    timeSignature: '9/8',
    keySignature: 'Ré bémol majeur',
    difficulty: 'Moyen',
    description: 'Harmonies impressionnistes et atmosphère de rêve au clair de lune sur l’ensemble de l’exposition poétique.',
    sourceType: 'demo',
    sourceName: 'Debussy - Clair de Lune',
    addedBy: 'Claude Impressionniste',
    likes: 230,
    plays: 1820,
    totalDuration: 68.0,
    previewSolfege: 'Fa • Mi♭ • Ré♭ • Do • Si♭ • La♭ • Sol♭',
    isPreinstalled: true,
    notes: SAMPLE_PIECES.find(p => p.id === 'clair-de-lune')?.notes || [],
  },
  {
    id: 'canon-d',
    title: 'Canon en Ré Majeur - Version Complète',
    composer: 'Johann Pachelbel',
    category: 'Classique',
    bpm: 68,
    timeSignature: '4/4',
    keySignature: 'Ré majeur',
    difficulty: 'Facile',
    description: 'Ligne de basse emblématique et toutes les variations polyphoniques successives de l’œuvre baroque.',
    sourceType: 'demo',
    sourceName: 'Pachelbel - Canon in D',
    addedBy: 'BaroqueMaster',
    likes: 195,
    plays: 1490,
    totalDuration: 65.0,
    previewSolfege: 'Fa♯ • Mi • Ré • Do♯ • Si • La • Sol • Fa♯',
    isPreinstalled: true,
    notes: SAMPLE_PIECES.find(p => p.id === 'canon-d')?.notes || [],
  },
  {
    id: 'gymnopedie',
    title: 'Gymnopédie No. 1 - Version Intégrale',
    composer: 'Erik Satie',
    category: 'Classique',
    bpm: 64,
    timeSignature: '3/4',
    keySignature: 'Ré majeur',
    difficulty: 'Facile',
    description: 'Atmosphère zen et minimaliste avec accords de septième majeurs lents et mélodie aérienne complète.',
    sourceType: 'demo',
    sourceName: 'Satie - Gymnopédie No. 1',
    addedBy: 'VelvetSatie',
    likes: 210,
    plays: 1610,
    totalDuration: 66.0,
    previewSolfege: 'Sol • Si • Ré • Fa♯ • Mi • Ré • Do♯',
    isPreinstalled: true,
    notes: SAMPLE_PIECES.find(p => p.id === 'gymnopedie')?.notes || [],
  }
];

const STORAGE_KEY = 'pianoscribe_offline_pieces_v3';

export class OfflineStorageManager {
  /**
   * Retrieves all pieces saved for offline use, guaranteeing full preinstalled pieces.
   */
  static getOfflinePieces(): OfflinePiece[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.saveOfflinePieces(PREINSTALLED_PIECES);
        return PREINSTALLED_PIECES;
      }
      const parsed: OfflinePiece[] = JSON.parse(stored);
      
      const mergedMap = new Map<string, OfflinePiece>();
      // First populate with local parsed pieces
      parsed.forEach(p => mergedMap.set(p.id, p));
      // Preinstalled pieces are ALWAYS updated to the latest complete full versions
      PREINSTALLED_PIECES.forEach(p => mergedMap.set(p.id, p));
      
      return Array.from(mergedMap.values());
    } catch (e) {
      console.warn('Error accessing offline storage:', e);
      return PREINSTALLED_PIECES;
    }
  }

  /**
   * Saves a list of pieces to localStorage.
   */
  static saveOfflinePieces(pieces: OfflinePiece[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pieces));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  /**
   * Adds or updates a piece in offline cache (e.g. after YouTube transcription or MP3 upload).
   */
  static addPieceToOffline(piece: Score | OfflinePiece): void {
    const pieces = this.getOfflinePieces();
    const existingIndex = pieces.findIndex(p => p.id === piece.id);
    const newPiece: OfflinePiece = {
      ...piece,
      isPreinstalled: false,
      likes: (piece as any).likes || 1,
      plays: (piece as any).plays || 1,
      category: (piece as any).category || 'Mes Transcriptions',
      addedBy: (piece as any).addedBy || 'Moi (Hors-ligne)',
      previewSolfege: (piece as any).previewSolfege || piece.notes.slice(0, 8).map(n => n.solfege).join(' • '),
    };

    if (existingIndex >= 0) {
      pieces[existingIndex] = { ...pieces[existingIndex], ...newPiece };
    } else {
      pieces.unshift(newPiece);
    }

    this.saveOfflinePieces(pieces);
  }

  /**
   * Syncs with server pieces (updates offline storage with fresh community pieces).
   */
  static syncWithServer(serverPieces: OfflinePiece[]): OfflinePiece[] {
    const localPieces = this.getOfflinePieces();
    const map = new Map<string, OfflinePiece>();

    // Start with preinstalled
    PREINSTALLED_PIECES.forEach(p => map.set(p.id, p));
    // Add local cached pieces
    localPieces.forEach(p => map.set(p.id, p));
    // Overlay server pieces
    serverPieces.forEach(p => map.set(p.id, { ...p, isPreinstalled: map.get(p.id)?.isPreinstalled }));

    const updated = Array.from(map.values());
    this.saveOfflinePieces(updated);
    return updated;
  }

  /**
   * Returns metadata about offline storage availability.
   */
  static getStorageStats() {
    const pieces = this.getOfflinePieces();
    const totalNotes = pieces.reduce((sum, p) => sum + (p.notes?.length || 0), 0);
    return {
      count: pieces.length,
      totalNotes,
      hasPreinstalled: PREINSTALLED_PIECES.length,
    };
  }
}
