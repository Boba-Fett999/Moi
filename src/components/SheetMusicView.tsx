import React, { useRef, useState, useMemo } from 'react';
import { Score, Note, SolfegeNaming, HandFilter, HandColorsConfig, DifficultyLevel } from '../types/music';
import {
  Printer,
  FileDown,
  ZoomIn,
  ZoomOut,
  Sliders,
  Eye,
  EyeOff,
  MoveHorizontal,
  Music,
  Check,
  Users,
} from 'lucide-react';

interface SheetMusicViewProps {
  score: Score;
  currentTime: number;
  onSeek: (time: number) => void;
  naming: SolfegeNaming;
  handFilter: HandFilter;
  colors?: HandColorsConfig;
  duoMode?: boolean;
  difficulty?: DifficultyLevel;
}

export const SheetMusicView: React.FC<SheetMusicViewProps> = ({
  score,
  currentTime,
  onSeek,
  naming,
  handFilter,
  colors = { rightHand: '#06B6D4', leftHand: '#A855F7' },
  duoMode = false,
  difficulty = 'Moyen',
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [showSolfegeLabels, setShowSolfegeLabels] = useState(true);
  const [showFingering, setShowFingering] = useState(true);
  const [transposeSemitones, setTransposeSemitones] = useState(0);

  // Transpose notes if requested
  const processedNotes = useMemo(() => {
    return score.notes.map(note => {
      if (transposeSemitones === 0) return note;
      const newMidi = note.midi + transposeSemitones;
      const pitchNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const solfegeNames = ['Do', 'Do♯', 'Ré', 'Ré♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
      const semitone = newMidi % 12;
      const oct = Math.floor(newMidi / 12) - 1;
      return {
        ...note,
        midi: newMidi,
        pitch: `${pitchNames[semitone]}${oct}`,
        solfege: solfegeNames[semitone],
        octave: oct,
      };
    });
  }, [score.notes, transposeSemitones]);

  // Compute measures based on BPM and Time Signature
  const beatsPerMeasure = parseInt(score.timeSignature.split('/')[0] || '4', 10);
  const secondsPerMeasure = (60 / score.bpm) * beatsPerMeasure;
  const totalMeasures = Math.max(4, Math.ceil(score.totalDuration / secondsPerMeasure));

  // Partition geometry constants
  const measureWidth = 190 * zoom;
  const trebleTop = 50;
  const bassTop = 150;
  const staffLineSpacing = 10;
  const systemHeight = 240;
  const measuresPerSystem = 3;
  const totalSystems = Math.ceil(totalMeasures / measuresPerSystem);

  // Vertical staff pitch offset calculation
  const getNoteY = (note: Note) => {
    const isTreble = note.hand === 'right' || note.midi >= 60;
    const midiToDiatonic: Record<number, number> = {
      36: -14, 38: -13, 40: -12, 41: -11, 43: -10, 45: -9, 47: -8,
      48: -7, 50: -6, 52: -5, 53: -4, 55: -3, 57: -2, 59: -1,
      60: 0, 62: 1, 64: 2, 65: 3, 67: 4, 69: 5, 71: 6,
      72: 7, 74: 8, 76: 9, 77: 10, 79: 11, 81: 12, 83: 13,
      84: 14, 86: 15, 88: 16, 89: 17, 91: 18, 93: 19, 95: 20,
    };

    const dStep = midiToDiatonic[note.midi] ?? Math.round((note.midi - 60) * (7 / 12));

    if (isTreble) {
      return trebleTop + 50 - dStep * (staffLineSpacing / 2);
    } else {
      return bassTop - 10 - dStep * (staffLineSpacing / 2);
    }
  };

  const handleDownloadMusicXML = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>${score.title}</work-title></work>
  <identification><creator type="composer">${score.composer}</creator></identification>
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
`;
    for (let m = 0; m < totalMeasures; m++) {
      xml += `    <measure number="${m + 1}">\n`;
      if (m === 0) {
        xml += `      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>${beatsPerMeasure}</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>\n`;
      }
      xml += `    </measure>\n`;
    }
    xml += `  </part>\n</score-partwise>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${score.title.replace(/\s+/g, '_')}.musicxml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Partition Toolbar */}
      <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Score Title & Metadata */}
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-white tracking-wide">{score.title}</h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {score.keySignature}
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
              {score.timeSignature}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-rose-300">
              Niveau : {difficulty}
            </span>
            {duoMode && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Users className="w-3 h-3" />
                4 Mains (Duo)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {score.composer} • Tempo: ♩ = {score.bpm}
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Solfège names on sheet music toggle */}
          <button
            onClick={() => setShowSolfegeLabels(!showSolfegeLabels)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showSolfegeLabels
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Afficher le nom des notes en solfège (Do, Ré, Mi...) sur la partition"
          >
            {showSolfegeLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Solfège sur Partition</span>
          </button>

          {/* Fingering toggle */}
          <button
            onClick={() => setShowFingering(!showFingering)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              showFingering
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Afficher les doigtés recommandés (1=pouce, 5=auriculaire)"
          >
            <span>Doigtés (1-5)</span>
          </button>

          {/* Transpose */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Transposer :</span>
            <button
              onClick={() => setTransposeSemitones(prev => Math.max(-6, prev - 1))}
              className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-mono"
            >
              -
            </button>
            <span className="font-mono px-1 font-bold text-white">
              {transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones}
            </span>
            <button
              onClick={() => setTransposeSemitones(prev => Math.min(6, prev + 1))}
              className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-mono"
            >
              +
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export PDF / Print */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Imprimer ou enregistrer en PDF la partition pour piano"
          >
            <Printer className="w-3.5 h-3.5 text-rose-400" />
            <span>Imprimer / PDF</span>
          </button>

          {/* Export MusicXML */}
          <button
            onClick={handleDownloadMusicXML}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Télécharger la partition au format MusicXML"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-400" />
            <span>MusicXML</span>
          </button>
        </div>
      </div>

      {/* Sheet Music Score Paper */}
      <div className="overflow-x-auto p-6 bg-amber-50/5 flex justify-center">
        <div
          id="printable-sheet-music"
          style={{ width: `${measuresPerSystem * measureWidth + 80}px` }}
          className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl transition-all select-none"
        >
          {/* Header of paper */}
          <div className="text-center pb-6 border-b border-slate-200 mb-6">
            <h1 className="text-2xl font-serif font-bold tracking-tight text-slate-900">
              {score.title}
            </h1>
            <p className="text-sm font-serif italic text-slate-600 mt-1">
              {score.composer}
            </p>
            <div className="flex items-center justify-between text-xs font-sans text-slate-500 mt-3 px-2">
              <span className="font-semibold">♩ = {score.bpm}</span>
              <span>{duoMode ? 'Piano 4 Mains (Duo)' : 'Piano solo'}</span>
              <span>Tonalité : {score.keySignature}</span>
            </div>
          </div>

          {/* Grand Staff Systems */}
          {Array.from({ length: totalSystems }).map((_, systemIdx) => {
            const systemStartMeasure = systemIdx * measuresPerSystem;
            const systemMeasures = Array.from(
              { length: Math.min(measuresPerSystem, totalMeasures - systemStartMeasure) },
              (_, i) => systemStartMeasure + i
            );

            return (
              <div
                key={`system-${systemIdx}`}
                className="relative mb-8"
                style={{ height: `${systemHeight * zoom}px` }}
              >
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${measuresPerSystem * measureWidth + 70} ${systemHeight}`}
                >
                  {/* Piano Bracket / Accolade */}
                  <path
                    d={`M 25 ${trebleTop} C 15 ${trebleTop + 20}, 15 ${bassTop + 20}, 5 ${(trebleTop + bassTop + 40) / 2} C 15 ${(trebleTop + bassTop + 40) / 2 + 10}, 15 ${bassTop + 20}, 25 ${bassTop + 40}`}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="3"
                  />
                  <line
                    x1="25"
                    y1={trebleTop}
                    x2="25"
                    y2={bassTop + 40}
                    stroke="#1E293B"
                    strokeWidth="2"
                  />

                  {/* Treble Clef 5 lines */}
                  {[0, 1, 2, 3, 4].map(lineIdx => (
                    <line
                      key={`treble-line-${lineIdx}`}
                      x1="25"
                      y1={trebleTop + lineIdx * staffLineSpacing}
                      x2={measuresPerSystem * measureWidth + 60}
                      y2={trebleTop + lineIdx * staffLineSpacing}
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Bass Clef 5 lines */}
                  {[0, 1, 2, 3, 4].map(lineIdx => (
                    <line
                      key={`bass-line-${lineIdx}`}
                      x1="25"
                      y1={bassTop + lineIdx * staffLineSpacing}
                      x2={measuresPerSystem * measureWidth + 60}
                      y2={bassTop + lineIdx * staffLineSpacing}
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Clef Symbols */}
                  <text
                    x="30"
                    y={trebleTop + 33}
                    fontFamily="serif"
                    fontSize="42"
                    fontWeight="bold"
                    fill="#0F172A"
                  >
                    𝄞
                  </text>

                  <text
                    x="30"
                    y={bassTop + 30}
                    fontFamily="serif"
                    fontSize="32"
                    fontWeight="bold"
                    fill="#0F172A"
                  >
                    𝄢
                  </text>

                  {/* In Duo mode, render tags for Primo and Secondo */}
                  {duoMode && (
                    <>
                      <text
                        x="32"
                        y={trebleTop - 8}
                        fontFamily="sans-serif"
                        fontSize="9"
                        fontWeight="bold"
                        fill={colors.rightHand}
                      >
                        Primo (J1)
                      </text>
                      <text
                        x="32"
                        y={bassTop - 8}
                        fontFamily="sans-serif"
                        fontSize="9"
                        fontWeight="bold"
                        fill={colors.leftHand}
                      >
                        Secondo (J2)
                      </text>
                    </>
                  )}

                  {/* Time Signature */}
                  {systemIdx === 0 && (
                    <>
                      <text
                        x="55"
                        y={trebleTop + 18}
                        fontFamily="serif"
                        fontSize="18"
                        fontWeight="bold"
                        fill="#0F172A"
                      >
                        {score.timeSignature.split('/')[0]}
                      </text>
                      <text
                        x="55"
                        y={trebleTop + 36}
                        fontFamily="serif"
                        fontSize="18"
                        fontWeight="bold"
                        fill="#0F172A"
                      >
                        {score.timeSignature.split('/')[1] || '4'}
                      </text>

                      <text
                        x="55"
                        y={bassTop + 18}
                        fontFamily="serif"
                        fontSize="18"
                        fontWeight="bold"
                        fill="#0F172A"
                      >
                        {score.timeSignature.split('/')[0]}
                      </text>
                      <text
                        x="55"
                        y={bassTop + 36}
                        fontFamily="serif"
                        fontSize="18"
                        fontWeight="bold"
                        fill="#0F172A"
                      >
                        {score.timeSignature.split('/')[1] || '4'}
                      </text>
                    </>
                  )}

                  {/* Measures */}
                  {systemMeasures.map((measureNum, mIdx) => {
                    const startX = 70 + mIdx * measureWidth;
                    const endX = startX + measureWidth;
                    const measureStartTime = measureNum * secondsPerMeasure;
                    const measureEndTime = (measureNum + 1) * secondsPerMeasure;

                    const isCurrentMeasure =
                      currentTime >= measureStartTime && currentTime < measureEndTime;

                    const measureNotes = processedNotes.filter(
                      n => n.startTime >= measureStartTime && n.startTime < measureEndTime
                    );

                    return (
                      <g
                        key={`measure-${measureNum}`}
                        onClick={() => onSeek(measureStartTime)}
                        className="cursor-pointer group"
                      >
                        {isCurrentMeasure && (
                          <>
                            <rect
                              x={startX}
                              y={trebleTop - 10}
                              width={measureWidth}
                              height={bassTop + 60 - trebleTop}
                              fill="rgba(244, 63, 94, 0.06)"
                              rx="4"
                            />
                            {/* Smooth moving Playhead Cursor */}
                            <line
                              x1={startX + 18 + Math.max(0, Math.min(1, (currentTime - measureStartTime) / secondsPerMeasure)) * (measureWidth - 36)}
                              y1={trebleTop - 12}
                              x2={startX + 18 + Math.max(0, Math.min(1, (currentTime - measureStartTime) / secondsPerMeasure)) * (measureWidth - 36)}
                              y2={bassTop + 48}
                              stroke="#F43F5E"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              filter="drop-shadow(0 0 4px rgba(244, 63, 94, 0.6))"
                            />
                          </>
                        )}

                        <text
                          x={startX + 4}
                          y={trebleTop - 6}
                          fontFamily="sans-serif"
                          fontSize="9"
                          fill="#64748B"
                          fontWeight="bold"
                        >
                          {measureNum + 1}
                        </text>

                        <line
                          x1={endX}
                          y1={trebleTop}
                          x2={endX}
                          y2={bassTop + 40}
                          stroke="#334155"
                          strokeWidth="1.5"
                        />

                        {measureNotes.map((note, nIdx) => {
                          const noteTimeOffset = note.startTime - measureStartTime;
                          const noteX = startX + 18 + (noteTimeOffset / secondsPerMeasure) * (measureWidth - 36);
                          const noteY = getNoteY(note);
                          const isPlayingThisNote =
                            currentTime >= note.startTime &&
                            currentTime <= note.startTime + note.duration;

                          const handColor = note.hand === 'right' ? colors.rightHand : colors.leftHand;

                          return (
                            <g key={`note-${measureNum}-${nIdx}`}>
                              {noteY >= trebleTop + 50 && (
                                <line
                                  x1={noteX - 9}
                                  y1={trebleTop + 50}
                                  x2={noteX + 9}
                                  y2={trebleTop + 50}
                                  stroke="#334155"
                                  strokeWidth="1.5"
                                />
                              )}
                              {noteY <= trebleTop - 10 && (
                                <line
                                  x1={noteX - 9}
                                  y1={trebleTop - 10}
                                  x2={noteX + 9}
                                  y2={trebleTop - 10}
                                  stroke="#334155"
                                  strokeWidth="1.5"
                                />
                              )}

                              <ellipse
                                cx={noteX}
                                cy={noteY}
                                rx="5.5"
                                ry="4.2"
                                transform={`rotate(-20, ${noteX}, ${noteY})`}
                                fill={isPlayingThisNote ? handColor : '#0F172A'}
                              />

                              <line
                                x1={noteX + 5}
                                y1={noteY}
                                x2={noteX + 5}
                                y2={noteY - 26}
                                stroke={isPlayingThisNote ? handColor : '#0F172A'}
                                strokeWidth="1.5"
                              />

                              {showSolfegeLabels && (
                                <g transform={`translate(${noteX}, ${noteY + (note.hand === 'left' ? 14 : -12)})`}>
                                  <rect
                                    x="-12"
                                    y="-7"
                                    width="24"
                                    height="13"
                                    rx="3"
                                    fill={handColor}
                                    opacity={isPlayingThisNote ? 1 : 0.9}
                                  />
                                  <text
                                    x="0"
                                    y="3"
                                    textAnchor="middle"
                                    fontFamily="sans-serif"
                                    fontSize="8"
                                    fontWeight="bold"
                                    fill="#FFFFFF"
                                  >
                                    {note.solfege}
                                  </text>
                                </g>
                              )}

                              {showFingering && note.finger && (
                                <text
                                  x={noteX + 8}
                                  y={noteY - 28}
                                  fontFamily="sans-serif"
                                  fontSize="9"
                                  fontWeight="bold"
                                  fill="#475569"
                                >
                                  {note.finger}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
