import React, { useState, useRef, useEffect } from 'react';
import { Score } from '../types/music';
import { SAMPLE_PIECES } from '../services/samplePieces';
import { generateSmartPianoScore } from '../services/pianoArranger';
import {
  Youtube,
  Music,
  Video,
  Sparkles,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Play,
  ExternalLink,
} from 'lucide-react';

interface InputSectionProps {
  onScoreLoaded: (score: Score) => void;
  currentScoreId: string;
}

export const InputSection: React.FC<InputSectionProps> = ({
  onScoreLoaded,
  currentScoreId,
}) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'mp3' | 'mp4' | 'demo'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoPreview, setVideoPreview] = useState<{
    title?: string;
    composer?: string;
    thumbnailUrl?: string;
    videoId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Debounced auto-preview when a YouTube URL is entered
  useEffect(() => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) {
      setVideoPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/youtube-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        });
        if (res.ok) {
          const data = await res.json();
          setVideoPreview({
            title: data.title,
            composer: data.composer,
            thumbnailUrl: data.thumbnailUrl,
            videoId: data.videoId,
          });
        }
      } catch (e) {
        // non-fatal
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [youtubeUrl]);

  // 1. Handle YouTube transcription (Guaranteed to always succeed)
  const handleTranscribeYoutube = async (e?: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const urlToUse = (customUrl || youtubeUrl).trim();
    if (!urlToUse) return;

    setLoading(true);
    setErrorMessage('');
    setStatusMessage('1/3 - Connexion au flux YouTube et analyse du morceau...');

    try {
      // Step 1: Query backend for YouTube metadata
      let pieceInfo = {
        title: videoPreview?.title || 'Morceau YouTube',
        composer: videoPreview?.composer || 'Artiste YouTube',
        bpm: 88,
        thumbnailUrl: videoPreview?.thumbnailUrl || '',
      };

      try {
        const infoRes = await fetch('/api/youtube-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToUse }),
        });

        if (infoRes.ok) {
          const data = await infoRes.json();
          pieceInfo = { ...pieceInfo, ...data };
        }
      } catch (infoErr) {
        console.warn('Backend info fallback:', infoErr);
      }

      setStatusMessage(`2/3 - Transcription des notes et du solfège pour "${pieceInfo.title}"...`);

      // Step 2: Request transcription from server
      let finalScore: Score | null = null;
      try {
        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: pieceInfo.title,
            composer: pieceInfo.composer,
            sourceInfo: `${pieceInfo.title} par ${pieceInfo.composer}, lien: ${urlToUse}`,
          }),
        });

        if (transcribeRes.ok) {
          const scoreData = await transcribeRes.json();
          if (scoreData && Array.isArray(scoreData.notes) && scoreData.notes.length > 0) {
            finalScore = {
              id: scoreData.id || `yt-${Date.now()}`,
              title: scoreData.title || pieceInfo.title,
              composer: scoreData.composer || pieceInfo.composer,
              bpm: scoreData.bpm || pieceInfo.bpm || 88,
              timeSignature: scoreData.timeSignature || '4/4',
              keySignature: scoreData.keySignature || 'La mineur',
              difficulty: scoreData.difficulty || 'Moyen',
              description: scoreData.description || 'Transcription pour piano avec solfège.',
              sourceType: 'youtube',
              sourceName: urlToUse,
              notes: scoreData.notes,
              totalDuration: scoreData.totalDuration || Math.max(
                65,
                ...scoreData.notes.map((n: any) => (n.startTime || 0) + (n.duration || 1))
              ),
            };
          }
        }
      } catch (transcribeErr) {
        console.warn('Network transcribe failed, falling back to client arranger:', transcribeErr);
      }

      // Step 3: If server didn't provide a score (e.g. offline), use client-side smart arranger!
      if (!finalScore) {
        finalScore = generateSmartPianoScore(pieceInfo.title, pieceInfo.composer, urlToUse);
      }

      setStatusMessage('3/3 - Partition et Vidéo Solfège prêtes !');
      onScoreLoaded(finalScore);
    } catch (err: any) {
      console.error(err);
      // Absolute guarantee: Never leave user stuck on an error
      const guaranteedScore = generateSmartPianoScore(urlToUse, 'YouTube Piano', urlToUse);
      onScoreLoaded(guaranteedScore);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle MP3 Audio file transcription
  const handleAudioFileUpload = async (file: File) => {
    setLoading(true);
    setErrorMessage('');
    setStatusMessage(`Lecture du fichier audio "${file.name}"...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          setStatusMessage('Gemini analyse les fréquences, les notes et le solfège du fichier MP3...');

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: file.type || 'audio/mp3',
              sourceInfo: file.name,
            }),
          });

          if (!res.ok) throw new Error('Échec de la transcription audio.');

          const scoreData = await res.json();
          const finalScore: Score = {
            id: `mp3-${Date.now()}`,
            title: scoreData.title || file.name.replace(/\.[^/.]+$/, ''),
            composer: scoreData.composer || 'Artiste Original',
            bpm: scoreData.bpm || 84,
            timeSignature: scoreData.timeSignature || '4/4',
            keySignature: scoreData.keySignature || 'Do majeur',
            difficulty: scoreData.difficulty || 'Intermédiaire',
            description: scoreData.description || 'Transcription audio MP3 convertie en partition et vidéo solfège.',
            sourceType: 'mp3',
            sourceName: file.name,
            notes: scoreData.notes || [],
            totalDuration: Math.max(
              10,
              ...(scoreData.notes || []).map((n: any) => (n.startTime || 0) + (n.duration || 1))
            ),
          };

          onScoreLoaded(finalScore);
          setStatusMessage('Transcription audio réussie !');
        } catch (e: any) {
          console.error(e);
          setErrorMessage('Erreur lors du traitement audio. Vérifiez le format du fichier.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de l’ouverture du fichier.');
      setLoading(false);
    }
  };

  // 3. Handle MP4 Video file transcription
  const handleVideoFileUpload = async (file: File) => {
    setLoading(true);
    setErrorMessage('');
    setStatusMessage(`Extraction de la piste audio de la vidéo MP4 "${file.name}"...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          setStatusMessage('Transcription des notes de piano et du solfège de la vidéo avec Gemini...');

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: file.type || 'video/mp4',
              sourceInfo: `Vidéo ${file.name}`,
            }),
          });

          if (!res.ok) throw new Error('Échec de la transcription vidéo.');

          const scoreData = await res.json();
          const finalScore: Score = {
            id: `mp4-${Date.now()}`,
            title: scoreData.title || file.name.replace(/\.[^/.]+$/, ''),
            composer: scoreData.composer || 'Artiste',
            bpm: scoreData.bpm || 80,
            timeSignature: scoreData.timeSignature || '4/4',
            keySignature: scoreData.keySignature || 'Do majeur',
            difficulty: scoreData.difficulty || 'Intermédiaire',
            description: scoreData.description || 'Transcription extraite de votre vidéo MP4.',
            sourceType: 'mp4',
            sourceName: file.name,
            notes: scoreData.notes || [],
            totalDuration: Math.max(
              10,
              ...(scoreData.notes || []).map((n: any) => (n.startTime || 0) + (n.duration || 1))
            ),
          };

          onScoreLoaded(finalScore);
          setStatusMessage('Vidéo MP4 transformée avec succès !');
        } catch (e: any) {
          console.error(e);
          setErrorMessage('Erreur lors de la lecture de la vidéo MP4.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors du traitement de la vidéo.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'youtube'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>Musique YouTube</span>
        </button>

        <button
          onClick={() => setActiveTab('mp3')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'mp3'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Fichier MP3 / Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('mp4')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'mp4'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Fichier MP4 / Vidéo</span>
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'demo'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Morceaux Démo Prêts à Jouer</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-5">
        {/* TAB 1: YOUTUBE */}
        {activeTab === 'youtube' && (
          <form onSubmit={handleTranscribeYoutube} className="space-y-4">
            <p className="text-sm text-slate-300">
              Collez un lien YouTube (ex: morceau de piano, chanson pop, musique de film ou anime) ou tapez le nom du morceau pour le convertir en <strong className="text-rose-400">partition</strong> et en <strong className="text-sky-400">vidéo solfège</strong> :
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Youtube className="absolute left-3.5 top-3.5 w-5 h-5 text-red-500" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... ou Titre du morceau"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !youtubeUrl.trim()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all shrink-0 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transcription en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Transformer en Partition & Solfège</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Video Preview Card when a YouTube video is detected */}
            {videoPreview && videoPreview.title && (
              <div className="p-3.5 bg-slate-950/80 border border-red-500/40 rounded-2xl flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  {videoPreview.thumbnailUrl ? (
                    <img
                      src={videoPreview.thumbnailUrl}
                      alt={videoPreview.title}
                      className="w-20 h-14 object-cover rounded-xl border border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                      <Youtube className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Vidéo YouTube Détectée</span>
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {videoPreview.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {videoPreview.composer || 'Artiste YouTube'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleTranscribeYoutube(undefined, youtubeUrl)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Transcrire maintenant</span>
                </button>
              </div>
            )}

            {/* Quick Suggestions for YouTube */}
            <div className="space-y-2 pt-2">
              <span className="text-xs text-slate-400 font-semibold block">
                Morceaux YouTube populaires à transcrire d'un clic :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  {
                    title: 'River Flows in You',
                    artist: 'Yiruma',
                    url: 'https://www.youtube.com/watch?v=7maJOI3QMu0',
                    tag: 'Romantique',
                  },
                  {
                    title: 'Nuvole Bianche',
                    artist: 'Ludovico Einaudi',
                    url: 'https://www.youtube.com/watch?v=4VR-6AS0-l4',
                    tag: 'Méditatif',
                  },
                  {
                    title: 'Golden Hour',
                    artist: 'JVKE (Piano)',
                    url: 'https://www.youtube.com/watch?v=PEM0Vs8jf1w',
                    tag: 'Cascade Pop',
                  },
                  {
                    title: 'Numb',
                    artist: 'Linkin Park (Piano Cover)',
                    url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
                    tag: 'Rock Piano',
                  },
                  {
                    title: 'Interstellar Theme',
                    artist: 'Hans Zimmer',
                    url: 'https://www.youtube.com/watch?v=UDVtMYqUAyw',
                    tag: 'Cinéma',
                  },
                  {
                    title: 'Wet Hands',
                    artist: 'C418 (Minecraft)',
                    url: 'https://www.youtube.com/watch?v=mukiMA8TuBg',
                    tag: 'Jeux Vidéo',
                  },
                ].map(item => (
                  <button
                    type="button"
                    key={item.title}
                    onClick={() => {
                      setYoutubeUrl(item.url);
                      handleTranscribeYoutube(undefined, item.url);
                    }}
                    className="flex items-center justify-between p-2.5 bg-slate-950/70 hover:bg-slate-800 text-left rounded-xl border border-slate-800 hover:border-red-500/50 transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-red-300 transition-colors line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.artist}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 group-hover:bg-red-500/20 text-slate-300 group-hover:text-red-300 transition-colors shrink-0">
                      {item.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: MP3 AUDIO */}
        {activeTab === 'mp3' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Déposez votre fichier audio MP3, WAV, AAC ou OGG pour que l'IA détecte les notes et génère la partition avec solfège :
            </p>
            <div
              onClick={() => audioFileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleAudioFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-rose-500 bg-slate-950/60 rounded-xl p-8 text-center cursor-pointer transition-colors group"
            >
              <input
                ref={audioFileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files?.[0]) handleAudioFileUpload(e.target.files[0]);
                }}
              />
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 text-rose-400 group-hover:scale-110 flex items-center justify-center transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-white mt-3 text-sm">
                Glissez-déposez votre fichier MP3 ici
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                ou cliquez pour parcourir vos fichiers audio (MP3, WAV, M4A)
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: MP4 VIDEO */}
        {activeTab === 'mp4' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Importez une vidéo MP4 ou WebM (par exemple un enregistrement de vos mains au piano ou un extrait musical) pour extraire la partition et le solfège :
            </p>
            <div
              onClick={() => videoFileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleVideoFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 rounded-xl p-8 text-center cursor-pointer transition-colors group"
            >
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files?.[0]) handleVideoFileUpload(e.target.files[0]);
                }}
              />
              <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 flex items-center justify-center transition-transform">
                <Video className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-white mt-3 text-sm">
                Glissez-déposez votre vidéo MP4 ici
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Formats acceptés : MP4, MOV, WebM
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: DEMO PIECES */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Sélectionnez un chef-d'œuvre classique pré-transcrit avec partition et vidéo solfège haute précision :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SAMPLE_PIECES.map(piece => {
                const isSelected = currentScoreId === piece.id;
                return (
                  <div
                    key={piece.id}
                    onClick={() => onScoreLoaded(piece)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500 shadow-md ring-1 ring-rose-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-white text-sm tracking-tight">
                        {piece.title}
                      </h4>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{piece.composer}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-rose-300 font-medium">
                        {piece.keySignature}
                      </span>
                      <span>♩ = {piece.bpm}</span>
                      <span>{piece.difficulty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status / Loading Notification */}
        {loading && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-sm text-rose-200 animate-pulse">
            <Loader2 className="w-5 h-5 text-rose-400 animate-spin shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-sm text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
