import React, { useState, useEffect } from 'react';
import { Score, DifficultyLevel } from '../types/music';
import { OfflineStorageManager, OfflinePiece } from '../services/offlineStorage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Search,
  Music,
  Heart,
  Play,
  Sparkles,
  Youtube,
  Upload,
  Filter,
  CheckCircle2,
  TrendingUp,
  Clock,
  User,
  PlusCircle,
  X,
  Layers,
  Users,
  HardDriveDownload,
  WifiOff,
  Check,
} from 'lucide-react';

interface CommunityPiece extends OfflinePiece {}

interface CommunityLibraryMenuProps {
  currentScoreId: string;
  onSelectPiece: (piece: Score) => void;
  onOpenUpload: () => void;
}

export const CommunityLibraryMenu: React.FC<CommunityLibraryMenuProps> = ({
  currentScoreId,
  onSelectPiece,
  onOpenUpload,
}) => {
  // Initialize immediately from offline storage so user has zero waiting time
  const [pieces, setPieces] = useState<CommunityPiece[]>(() => OfflineStorageManager.getOfflinePieces());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'difficulty'>('popular');
  const [onlyOffline, setOnlyOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const isOnline = useOnlineStatus();

  // Fetch community pieces from server and sync with offline storage
  const fetchPieces = async () => {
    // If not online, rely completely on offline storage
    if (!navigator.onLine) {
      const offline = OfflineStorageManager.getOfflinePieces();
      setPieces(offline);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/pieces?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pieces && data.pieces.length > 0) {
          const synced = OfflineStorageManager.syncWithServer(data.pieces);
          setPieces(synced);
        }
      }
    } catch (err) {
      console.warn('Network offline or error, falling back to offline pieces:', err);
      const offline = OfflineStorageManager.getOfflinePieces();
      setPieces(offline);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPieces();
  }, [searchQuery, selectedCategory]);

  // Handle Like
  const handleLike = async (e: React.MouseEvent, pieceId: string) => {
    e.stopPropagation();
    if (likedIds.has(pieceId)) return;

    try {
      if (navigator.onLine) {
        await fetch(`/api/pieces/${pieceId}/like`, { method: 'POST' });
      }
    } catch {}

    setLikedIds(prev => new Set(prev).add(pieceId));
    setPieces(prev =>
      prev.map(p => (p.id === pieceId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
  };

  // Filter by difficulty and offline flag in client
  const filteredPieces = pieces.filter(p => {
    if (onlyOffline && !p.notes?.length) return false;
    if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchComp = p.composer.toLowerCase().includes(q);
      const matchSolfege = p.previewSolfege?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      return matchTitle || matchComp || matchSolfege || matchDesc;
    }
    return true;
  });

  // Sort pieces
  const sortedPieces = [...filteredPieces].sort((a, b) => {
    if (sortBy === 'popular') return (b.likes || 0) - (a.likes || 0);
    if (sortBy === 'recent') return (b.id > a.id ? 1 : -1);
    if (sortBy === 'difficulty') {
      const diffOrder: Record<string, number> = { 'Facile': 1, 'Moyen': 2, 'Compliqué': 3 };
      return (diffOrder[a.difficulty || ''] || 2) - (diffOrder[b.difficulty || ''] || 2);
    }
    return 0;
  });

  const getDifficultyBadge = (diff?: DifficultyLevel | string) => {
    switch (diff) {
      case 'Facile':
        return {
          label: 'Facile',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'Moyen':
        return {
          label: 'Moyen',
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'Compliqué':
      default:
        return {
          label: 'Compliqué',
          classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Offline Mode Banner when offline or always notifying that library is offline-ready */}
      <div className="mb-5 p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <HardDriveDownload className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>{pieces.length} morceaux disponibles hors ligne</span>
              {!isOnline && (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Hors-ligne
                </span>
              )}
            </p>
            <p className="text-slate-400 mt-0.5">
              Toutes les partitions, vidéos solfèges et sons de piano restent jouables même sans connexion internet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setOnlyOffline(prev => !prev)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all ${
              onlyOffline
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${onlyOffline ? 'text-white' : 'text-slate-400'}`} />
            <span>Filtre Hors-ligne</span>
          </button>
        </div>
      </div>

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl text-white shadow-md shadow-rose-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
                <span>Bibliothèque Partagée de la Communauté</span>
                <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  {sortedPieces.length} morceaux
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Toutes les musiques YouTube, MP3 et MP4 converties par les pianistes sont rassemblées ici
              </p>
            </div>
          </div>
        </div>

        {/* Upload / Add Music trigger button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all self-start sm:self-auto active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter une Musique (YouTube / MP3 / MP4)</span>
        </button>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="mt-5 space-y-4">
        {/* Real-time Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un morceau, compositeur, style, Do-Ré-Mi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories, Difficulty Levels & Sorting Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'Toutes les musiques' },
              { id: 'Classique', label: '🎼 Classique' },
              { id: 'Films & Pop', label: '🎬 Films & Pop' },
              { id: 'Virtuose', label: '⚡ Virtuose' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Difficulty Level Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-slate-950 px-2 py-1 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 pl-1 pr-1 font-medium">Difficulté :</span>
            {[
              { id: 'all', label: 'Tous', color: 'text-slate-300' },
              { id: 'Facile', label: '🟢 Facile', color: 'text-emerald-400' },
              { id: 'Moyen', label: '🟡 Moyen', color: 'text-amber-400' },
              { id: 'Compliqué', label: '🔴 Compliqué', color: 'text-rose-400' },
            ].map(diff => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all shrink-0 ${
                  selectedDifficulty === diff.id
                    ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                    : `${diff.color} hover:bg-slate-900`
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start lg:self-auto">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span>Trier :</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-slate-900 text-white">Plus populaires (❤️)</option>
              <option value="recent" className="bg-slate-900 text-white">Récemment ajoutés</option>
              <option value="difficulty" className="bg-slate-900 text-white">Niveau de difficulté (Facile → Compliqué)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Community Pieces Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
        {sortedPieces.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <Music className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-60" />
            <p className="text-sm font-medium">Aucun morceau trouvé pour ces critères de recherche.</p>
            <p className="text-xs text-slate-600 mt-1">
              Vous pouvez ajouter ce morceau avec le bouton ci-dessus via YouTube ou MP3/MP4 !
            </p>
          </div>
        ) : (
          sortedPieces.map(piece => {
            const isSelected = currentScoreId === piece.id;
            const isLiked = likedIds.has(piece.id);
            const diffBadge = getDifficultyBadge(piece.difficulty);

            return (
              <div
                key={piece.id}
                onClick={() => onSelectPiece(piece)}
                className={`relative group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-rose-950/40 to-slate-950 border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500'
                    : 'bg-slate-950/80 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div>
                  {/* Top Bar of card: Source icon + Difficulty badge + Like button */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                        {piece.sourceType === 'youtube' && <Youtube className="w-3 h-3 text-red-500" />}
                        {piece.sourceType === 'mp3' && <Music className="w-3 h-3 text-rose-400" />}
                        {piece.sourceType === 'mp4' && <Sparkles className="w-3 h-3 text-indigo-400" />}
                        <span>{piece.category || 'Piano'}</span>
                      </span>

                      {/* Difficulty Level Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${diffBadge.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diffBadge.dot}`} />
                        <span>{diffBadge.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={e => handleLike(e, piece.id)}
                        className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                          isLiked
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-rose-400'
                        }`}
                        title="Aimer ce morceau"
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{piece.likes || 0}</span>
                      </button>

                      {isSelected && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Actif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Composer */}
                  <h3 className="font-bold text-white text-sm sm:text-base tracking-tight group-hover:text-rose-300 transition-colors line-clamp-1">
                    {piece.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {piece.composer}
                  </p>

                  {/* Solfège Preview Ribbon */}
                  {piece.previewSolfege && (
                    <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-rose-300/90 truncate">
                      <span className="text-slate-500 mr-1.5">Solfège:</span>
                      {piece.previewSolfege}
                    </div>
                  )}
                </div>

                {/* Footer of card */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-medium">{piece.keySignature}</span>
                    <span>•</span>
                    <span>♩ = {piece.bpm}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-mono">
                      {Math.floor((piece.totalDuration || 60) / 60)}:{Math.floor((piece.totalDuration || 60) % 60).toString().padStart(2, '0')}
                    </span>
                    <span>•</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-medium">
                      <HardDriveDownload className="w-2.5 h-2.5" />
                      <span>Hors-ligne</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                    <User className="w-3 h-3" />
                    <span>{piece.addedBy || 'Communauté'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
