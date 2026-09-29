export type DifficultyLevel = 'Facile' | 'Moyen' | 'Compliqué';

export interface Note {
  pitch: string;       // e.g. "C4", "G#4", "Eb3"
  midi: number;        // MIDI note number 21 to 108
  startTime: number;   // In seconds
  duration: number;    // In seconds
  hand: 'right' | 'left';
  solfege: string;     // "Do", "Ré", "Mi", "Fa", "Sol", "La", "Si", etc.
  octave: number;      // 1 to 7
  finger?: number;     // 1 to 5
}

export interface Score {
  id: string;
  title: string;
  composer: string;
  bpm: number;
  timeSignature: string; // "4/4", "3/4", etc.
  keySignature: string;  // "Do majeur", "La mineur", etc.
  difficulty?: DifficultyLevel;
  description?: string;
  sourceType: 'youtube' | 'mp3' | 'mp4' | 'demo';
  sourceName?: string;
  notes: Note[];
  totalDuration: number;
  category?: string;
  addedBy?: string;
  likes?: number;
  plays?: number;
  previewSolfege?: string;
}

export type SolfegeNaming = 'solfege' | 'latin' | 'degres'; // Do-Ré-Mi vs C-D-E vs 1-2-3
export type HandFilter = 'both' | 'right' | 'left';
export type VisualTheme = 'synthesia' | 'neon' | 'classique' | 'pastel';

export interface HandColorsConfig {
  rightHand: string; // Hex color for Main Droite (Joueur 1 Primo)
  leftHand: string;  // Hex color for Main Gauche (Joueur 2 Secondo)
}

export interface DuoGameState {
  enabled: boolean;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  player1Streak: number;
  player2Streak: number;
  player1Hits: number;
  player2Hits: number;
  splitMidi: number; // default 60 (Middle C / Do central)
  filterPlayer: 'both' | 'player1' | 'player2';
}
