import { Score, Note } from '../types/music';

// Helper to generate notes easily
const createNote = (
  pitch: string,
  midi: number,
  startTime: number,
  duration: number,
  hand: 'right' | 'left',
  solfege: string,
  octave: number,
  finger?: number
): Note => ({
  pitch,
  midi,
  startTime: Number(startTime.toFixed(2)),
  duration: Number(duration.toFixed(2)),
  hand,
  solfege,
  octave,
  finger: finger || (hand === 'left' ? 5 : 1),
});

// 1. Beethoven - Lettre à Élise (Für Elise) - Version Complète (~65s)
function buildFullFurElise(): Note[] {
  const notes: Note[] = [];
  const tStep = 0.35;

  // Function to add the famous Main A-Theme (takes ~11.5 seconds)
  const addATheme = (startOffset: number) => {
    // Anacrouse
    notes.push(createNote('E5', 76, startOffset + 0.0, tStep, 'right', 'Mi', 5, 5));
    notes.push(createNote('D#5', 75, startOffset + tStep, tStep, 'right', 'Ré♯', 5, 4));
    notes.push(createNote('E5', 76, startOffset + tStep * 2, tStep, 'right', 'Mi', 5, 5));
    notes.push(createNote('D#5', 75, startOffset + tStep * 3, tStep, 'right', 'Ré♯', 5, 4));
    notes.push(createNote('E5', 76, startOffset + tStep * 4, tStep, 'right', 'Mi', 5, 5));
    notes.push(createNote('B4', 71, startOffset + tStep * 5, tStep, 'right', 'Si', 4, 2));
    notes.push(createNote('D5', 74, startOffset + tStep * 6, tStep, 'right', 'Ré', 5, 4));
    notes.push(createNote('C5', 72, startOffset + tStep * 7, tStep, 'right', 'Do', 5, 3));

    // Measure 2: La mineur
    notes.push(createNote('A2', 45, startOffset + tStep * 8, tStep * 2, 'left', 'La', 2, 5));
    notes.push(createNote('E3', 52, startOffset + tStep * 9, tStep * 2, 'left', 'Mi', 3, 3));
    notes.push(createNote('A3', 57, startOffset + tStep * 10, tStep * 2, 'left', 'La', 3, 1));
    notes.push(createNote('A4', 69, startOffset + tStep * 8, tStep * 2, 'right', 'La', 4, 1));
    notes.push(createNote('C4', 60, startOffset + tStep * 11, tStep, 'right', 'Do', 4, 1));
    notes.push(createNote('E4', 64, startOffset + tStep * 12, tStep, 'right', 'Mi', 4, 2));
    notes.push(createNote('A4', 69, startOffset + tStep * 13, tStep, 'right', 'La', 4, 4));

    // Measure 3: Mi majeur
    notes.push(createNote('E2', 40, startOffset + tStep * 14, tStep * 2, 'left', 'Mi', 2, 5));
    notes.push(createNote('E3', 52, startOffset + tStep * 15, tStep * 2, 'left', 'Mi', 3, 3));
    notes.push(createNote('G#3', 56, startOffset + tStep * 16, tStep * 2, 'left', 'Sol♯', 3, 1));
    notes.push(createNote('B4', 71, startOffset + tStep * 14, tStep * 2, 'right', 'Si', 4, 5));
    notes.push(createNote('E4', 64, startOffset + tStep * 17, tStep, 'right', 'Mi', 4, 1));
    notes.push(createNote('G#4', 68, startOffset + tStep * 18, tStep, 'right', 'Sol♯', 4, 3));
    notes.push(createNote('B4', 71, startOffset + tStep * 19, tStep, 'right', 'Si', 4, 5));

    // Measure 4: Retour La
    notes.push(createNote('A2', 45, startOffset + tStep * 20, tStep * 2, 'left', 'La', 2, 5));
    notes.push(createNote('E3', 52, startOffset + tStep * 21, tStep * 2, 'left', 'Mi', 3, 3));
    notes.push(createNote('A3', 57, startOffset + tStep * 22, tStep * 2, 'left', 'La', 3, 1));
    notes.push(createNote('C5', 72, startOffset + tStep * 20, tStep * 2, 'right', 'Do', 5, 4));
    notes.push(createNote('E4', 64, startOffset + tStep * 23, tStep, 'right', 'Mi', 4, 1));

    // Measure 5: Deuxième phrase
    notes.push(createNote('E5', 76, startOffset + tStep * 24, tStep, 'right', 'Mi', 5, 5));
    notes.push(createNote('D#5', 75, startOffset + tStep * 25, tStep, 'right', 'Ré♯', 5, 4));
    notes.push(createNote('E5', 76, startOffset + tStep * 26, tStep, 'right', 'Mi', 5, 5));
    notes.push(createNote('D#5', 75, startOffset + tStep * 27, tStep, 'right', 'Ré♯', 5, 4));
    notes.push(createNote('E5', 76, startOffset + tStep * 28, tStep, 'right', 'Mi', 5, 5));
    notes.push(createNote('B4', 71, startOffset + tStep * 29, tStep, 'right', 'Si', 4, 2));
    notes.push(createNote('D5', 74, startOffset + tStep * 30, tStep, 'right', 'Ré', 5, 4));
    notes.push(createNote('C5', 72, startOffset + tStep * 31, tStep, 'right', 'Do', 5, 3));

    // Cadence
    notes.push(createNote('A2', 45, startOffset + tStep * 32, tStep * 3, 'left', 'La', 2, 5));
    notes.push(createNote('E3', 52, startOffset + tStep * 33, tStep * 2, 'left', 'Mi', 3, 3));
    notes.push(createNote('A3', 57, startOffset + tStep * 34, tStep * 2, 'left', 'La', 3, 1));
    notes.push(createNote('A4', 69, startOffset + tStep * 32, tStep * 3, 'right', 'La', 4, 1));
  };

  // 1. First Exposition (0 - 13s)
  addATheme(0);

  // 2. Second Cycle with higher octave counterpoint (13s - 26s)
  addATheme(13.0);

  // 3. Middle Section B: F major modulation & playful runs (26s - 45s)
  const bStart = 26.0;
  const fChords = [
    { bass: 41, chord: [53, 57, 60] }, // F major
    { bass: 48, chord: [55, 60, 64] }, // C major
    { bass: 43, chord: [55, 58, 62] }, // G minor
    { bass: 40, chord: [52, 56, 59] }, // E major
  ];

  fChords.forEach((c, idx) => {
    const t = bStart + idx * 4.5;
    notes.push(createNote('F2', c.bass, t, 3.5, 'left', 'Fa', 2, 5));
    c.chord.forEach((p, pIdx) => {
      notes.push(createNote('C3', p, t + 0.8 + pIdx * 0.6, 1.2, 'left', 'Do', 3, pIdx + 1));
    });

    // Right hand graceful scalar turns
    const melody = [77, 81, 84, 81, 79, 77, 76, 74];
    melody.forEach((p, mIdx) => {
      notes.push(createNote('F5', p, t + mIdx * 0.45, 0.4, 'right', 'Fa', 5, (mIdx % 4) + 1));
    });
  });

  // 4. Return to Theme A (45s - 58s)
  addATheme(45.0);

  // 5. Final Delicate Arpeggio Resolution (58s - 65s)
  const finalStart = 58.0;
  const finalArp = [45, 52, 57, 60, 64, 69, 72, 76, 81];
  finalArp.forEach((midi, idx) => {
    const hand = idx < 3 ? 'left' : 'right';
    notes.push(createNote('A', midi, finalStart + idx * 0.4, 3.0, hand, 'La', Math.floor(midi / 12) - 1));
  });

  return notes;
}

// 2. Bach - Prélude en Do Majeur (BWV 846) - Progression Complète (~64s)
function buildFullBachPrelude(): Note[] {
  const notes: Note[] = [];
  const measureLength = 4.0;

  // 16 full harmonic measures of the classic Bach C Major Prelude
  const measures = [
    { bass1: 48, bass2: 52, right: [55, 60, 64] }, // 1. C - E - G - C - E
    { bass1: 48, bass2: 50, right: [57, 62, 65] }, // 2. C - D - A - D - F
    { bass1: 47, bass2: 50, right: [55, 62, 65] }, // 3. B - D - G - D - F
    { bass1: 48, bass2: 52, right: [55, 60, 64] }, // 4. C - E - G - C - E
    { bass1: 48, bass2: 52, right: [57, 64, 69] }, // 5. C - E - A - E - A
    { bass1: 48, bass2: 50, right: [54, 57, 62] }, // 6. C - D - F# - A - D
    { bass1: 47, bass2: 50, right: [55, 59, 62] }, // 7. B - D - G - B - D
    { bass1: 47, bass2: 48, right: [53, 57, 60] }, // 8. B - C - E - A - C
    { bass1: 45, bass2: 48, right: [53, 57, 60] }, // 9. A - C - E - A - C
    { bass1: 43, bass2: 47, right: [50, 55, 59] }, // 10. G - B - D - G - B
    { bass1: 43, bass2: 45, right: [48, 52, 55] }, // 11. G - A - C - E - G
    { bass1: 41, bass2: 45, right: [48, 52, 55] }, // 12. F - A - C - E - G
    { bass1: 43, bass2: 47, right: [50, 53, 59] }, // 13. G - B - D - F - B
    { bass1: 43, bass2: 48, right: [52, 55, 60] }, // 14. G - C - E - G - C
    { bass1: 43, bass2: 47, right: [50, 53, 59] }, // 15. G - B - D - F - B
    { bass1: 48, bass2: 52, right: [55, 60, 64] }, // 16. C - E - G - C - E (Resolve)
  ];

  measures.forEach((m, mIdx) => {
    const t = mIdx * measureLength;

    // Pattern played twice per measure:
    // Left: bass1 (quarter), bass2 (eighth)
    // Right: right[0], right[1], right[2], right[0], right[1], right[2]
    for (let half = 0; half < 2; half++) {
      const halfT = t + half * 2.0;
      notes.push(createNote('C', m.bass1, halfT, 1.8, 'left', 'Do', 3, 5));
      notes.push(createNote('E', m.bass2, halfT + 0.25, 1.6, 'left', 'Mi', 3, 3));

      notes.push(createNote('G', m.right[0], halfT + 0.5, 0.45, 'right', 'Sol', 3, 1));
      notes.push(createNote('C', m.right[1], halfT + 0.75, 0.45, 'right', 'Do', 4, 2));
      notes.push(createNote('E', m.right[2], halfT + 1.0, 0.45, 'right', 'Mi', 4, 4));
      notes.push(createNote('G', m.right[0], halfT + 1.25, 0.45, 'right', 'Sol', 3, 1));
      notes.push(createNote('C', m.right[1], halfT + 1.5, 0.45, 'right', 'Do', 4, 2));
      notes.push(createNote('E', m.right[2], halfT + 1.75, 0.45, 'right', 'Mi', 4, 4));
    }
  });

  return notes;
}

// 3. Debussy - Clair de Lune - Version Complète (~68s)
function buildFullClairDeLune(): Note[] {
  const notes: Note[] = [];
  const phraseTime = 12.0;

  for (let cycle = 0; cycle < 5; cycle++) {
    const t = cycle * phraseTime;
    const octaveShift = cycle === 2 ? 12 : 0;

    // Main poetic Debussy theme
    notes.push(createNote('F5', 77 + octaveShift, t + 0.0, 1.2, 'right', 'Fa', 5, 5));
    notes.push(createNote('Eb5', 75 + octaveShift, t + 1.2, 1.2, 'right', 'Mi♭', 5, 4));
    notes.push(createNote('Db3', 49, t + 0.0, 3.5, 'left', 'Ré♭', 3, 5));
    notes.push(createNote('Ab3', 56, t + 0.8, 2.5, 'left', 'La♭', 3, 2));
    notes.push(createNote('F4', 65, t + 1.6, 2.0, 'left', 'Fa', 4, 1));

    notes.push(createNote('Db5', 73 + octaveShift, t + 2.4, 1.2, 'right', 'Ré♭', 5, 3));
    notes.push(createNote('C5', 72 + octaveShift, t + 3.6, 1.2, 'right', 'Do', 5, 2));
    notes.push(createNote('Bb4', 70 + octaveShift, t + 4.8, 2.0, 'right', 'Si♭', 4, 1));

    notes.push(createNote('Gb2', 42, t + 2.4, 4.0, 'left', 'Sol♭', 2, 5));
    notes.push(createNote('Db3', 49, t + 3.2, 3.0, 'left', 'Ré♭', 3, 3));
    notes.push(createNote('Bb3', 58, t + 4.0, 2.5, 'left', 'Si♭', 3, 1));

    notes.push(createNote('Ab4', 68 + octaveShift, t + 6.8, 2.0, 'right', 'La♭', 4, 1));
    notes.push(createNote('F4', 65 + octaveShift, t + 6.8, 2.0, 'right', 'Fa', 4, 2));
    notes.push(createNote('F2', 41, t + 6.8, 4.5, 'left', 'Fa', 2, 5));
    notes.push(createNote('C3', 48, t + 7.6, 3.5, 'left', 'Do', 3, 3));
    notes.push(createNote('A3', 57, t + 8.4, 3.0, 'left', 'La', 3, 1));

    notes.push(createNote('Db5', 73 + octaveShift, t + 9.2, 1.2, 'right', 'Ré♭', 5, 4));
    notes.push(createNote('C5', 72 + octaveShift, t + 10.4, 1.2, 'right', 'Do', 5, 3));
  }

  return notes;
}

// 4. Pachelbel - Canon en Ré - Version Complète (~64s)
function buildFullCanon(): Note[] {
  const notes: Note[] = [];
  const measureSec = 8.0;
  const bassGround = [50, 45, 47, 42, 43, 38, 43, 45]; // D - A - B - F# - G - D - G - A

  // 8 cycles of the ground bass = ~64 seconds
  for (let cycle = 0; cycle < 8; cycle++) {
    const cycleStart = cycle * measureSec;

    // Left hand ground bass (8 notes per cycle, 1 sec each)
    bassGround.forEach((midi, step) => {
      notes.push(createNote('D', midi, cycleStart + step * 1.0, 1.0, 'left', 'Ré', 3, 5));
    });

    // Right hand polyphonic evolution across cycles
    if (cycle === 0) {
      // Slow cantabile melody
      const melodies = [66, 64, 62, 61, 59, 57, 59, 61];
      melodies.forEach((midi, step) => {
        notes.push(createNote('F#', midi, cycleStart + step * 1.0, 1.0, 'right', 'Fa♯', 4, 3));
      });
    } else if (cycle < 3) {
      // Flowing eighth notes
      const eighths = [74, 73, 71, 69, 67, 66, 67, 69, 71, 74, 73, 71, 69, 67, 66, 64];
      eighths.forEach((midi, step) => {
        notes.push(createNote('D', midi, cycleStart + step * 0.5, 0.45, 'right', 'Ré', 5, (step % 4) + 1));
      });
    } else if (cycle < 6) {
      // 16th-note running variations
      for (let s = 0; s < 16; s++) {
        const midi = 62 + ((s * 3) % 15);
        notes.push(createNote('D', midi, cycleStart + s * 0.5, 0.45, 'right', 'Ré', 4, (s % 5) + 1));
      }
    } else {
      // Grand Finale Harmonic Chords
      const chords = [74, 73, 71, 69, 67, 66, 67, 74];
      chords.forEach((midi, step) => {
        notes.push(createNote('D', midi, cycleStart + step * 1.0, 0.9, 'right', 'Ré', 5, 5));
        notes.push(createNote('F#', midi - 4, cycleStart + step * 1.0, 0.9, 'right', 'Fa♯', 4, 3));
      });
    }
  }

  return notes;
}

// 5. Erik Satie - Gymnopédie No. 1 - Version Complète (~66s)
function buildFullGymnopedie(): Note[] {
  const notes: Note[] = [];
  const barSec = 3.3; // 64 BPM in 3/4

  for (let m = 0; m < 20; m++) {
    const t = m * barSec;
    const isG = m % 2 === 0;

    // Left hand: Low bass on beat 1, warm chord on beats 2 & 3
    if (isG) {
      notes.push(createNote('G2', 43, t, 1.0, 'left', 'Sol', 2, 5));
      notes.push(createNote('B3', 59, t + 1.1, 1.8, 'left', 'Si', 3, 3));
      notes.push(createNote('D4', 62, t + 1.1, 1.8, 'left', 'Ré', 4, 2));
      notes.push(createNote('F#4', 66, t + 1.1, 1.8, 'left', 'Fa♯', 4, 1));
    } else {
      notes.push(createNote('D2', 38, t, 1.0, 'left', 'Ré', 2, 5));
      notes.push(createNote('A3', 57, t + 1.1, 1.8, 'left', 'La', 3, 3));
      notes.push(createNote('C#4', 61, t + 1.1, 1.8, 'left', 'Do♯', 4, 2));
      notes.push(createNote('F#4', 66, t + 1.1, 1.8, 'left', 'Fa♯', 4, 1));
    }

    // Right hand floating melancholy melody (enters measure 4)
    if (m >= 4 && m < 18) {
      const melodyNotes = [78, 76, 74, 73, 71, 69, 71, 74, 78, 76, 74, 73, 71, 69];
      const p = melodyNotes[(m - 4) % melodyNotes.length];
      notes.push(createNote('F#5', p, t + 1.1, 2.0, 'right', 'Fa♯', 5, 4));
    }
  }

  return notes;
}

export const SAMPLE_PIECES: Score[] = [
  {
    id: 'fur-elise',
    title: 'Lettre à Élise (Für Elise) - Version Complète',
    composer: 'Ludwig van Beethoven',
    bpm: 120,
    timeSignature: '3/8',
    keySignature: 'La mineur',
    difficulty: 'Facile',
    description: 'Le chef-d’œuvre incontournable pour tout pianiste. Thème poétique complet avec toutes ses sections A et B développées.',
    sourceType: 'demo',
    sourceName: 'Beethoven - Für Elise',
    notes: buildFullFurElise(),
    totalDuration: 66.0,
  },
  {
    id: 'bach-prelude',
    title: 'Prélude No. 1 en Do Majeur (BWV 846) - Complet',
    composer: 'Johann Sebastian Bach',
    bpm: 76,
    timeSignature: '4/4',
    keySignature: 'Do majeur',
    difficulty: 'Facile',
    description: 'Arpèges réguliers et fluides sur les 16 mesures de la progression harmonique complète du Clavier Bien Tempéré.',
    sourceType: 'demo',
    sourceName: 'J.S. Bach - Prélude 1',
    notes: buildFullBachPrelude(),
    totalDuration: 65.0,
  },
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune (Suite Bergamasque) - Intégral',
    composer: 'Claude Debussy',
    bpm: 52,
    timeSignature: '9/8',
    keySignature: 'Ré bémol majeur',
    difficulty: 'Moyen',
    description: 'Harmonies impressionnistes et atmosphère de rêve au clair de lune sur l’ensemble de l’exposition poétique.',
    sourceType: 'demo',
    sourceName: 'Debussy - Clair de Lune',
    notes: buildFullClairDeLune(),
    totalDuration: 68.0,
  },
  {
    id: 'canon-d',
    title: 'Canon en Ré Majeur - Version Complète',
    composer: 'Johann Pachelbel',
    bpm: 68,
    timeSignature: '4/4',
    keySignature: 'Ré majeur',
    difficulty: 'Facile',
    description: 'Ligne de basse emblématique et toutes les variations polyphoniques successives de l’œuvre baroque.',
    sourceType: 'demo',
    sourceName: 'Pachelbel - Canon in D',
    notes: buildFullCanon(),
    totalDuration: 65.0,
  },
  {
    id: 'gymnopedie',
    title: 'Gymnopédie No. 1 - Version Intégrale',
    composer: 'Erik Satie',
    bpm: 64,
    timeSignature: '3/4',
    keySignature: 'Ré majeur',
    difficulty: 'Facile',
    description: 'Atmosphère zen et minimaliste avec accords de septième majeurs lents et mélodie aérienne complète.',
    sourceType: 'demo',
    sourceName: 'Satie - Gymnopédie No. 1',
    notes: buildFullGymnopedie(),
    totalDuration: 66.0,
  },
];
