import React from 'react';
import { X, BookOpen, Music, Check, Sparkles } from 'lucide-react';

interface SolfegeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SolfegeGuideModal: React.FC<SolfegeGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notesList = [
    { solfege: 'Do', latin: 'C', color: '#EF4444', desc: 'Note fondamentale, repère à gauche des 2 touches noires' },
    { solfege: 'Ré', latin: 'D', color: '#F97316', desc: 'Située exactement entre les 2 touches noires' },
    { solfege: 'Mi', latin: 'E', color: '#EAB308', desc: 'Située à droite des 2 touches noires' },
    { solfege: 'Fa', latin: 'F', color: '#10B981', desc: 'Située à gauche des 3 touches noires' },
    { solfege: 'Sol', latin: 'G', color: '#06B6D4', desc: 'Première note entre les 3 touches noires' },
    { solfege: 'La', latin: 'A', color: '#3B82F6', desc: 'Deuxième note entre les 3 touches noires (440 Hz)' },
    { solfege: 'Si', latin: 'B', color: '#A855F7', desc: 'Située à droite des 3 touches noires' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Guide Rapide de Solfège pour Pianistes</h3>
              <p className="text-xs text-slate-400">Correspondances notes, couleurs et touches de piano</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6">
          {/* Notes table */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Les 7 Notes Fondamentales & Couleurs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {notesList.map(n => (
                <div
                  key={n.solfege}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div
                    style={{ backgroundColor: n.color }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0"
                  >
                    {n.solfege}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{n.solfege}</span>
                      <span className="text-xs font-mono text-slate-400">({n.latin})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clefs explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h5 className="font-bold text-sm text-sky-400 flex items-center gap-2">
                <span>𝄞 Clé de Sol</span>
                <span className="text-xs font-normal text-slate-400">(Main Droite)</span>
              </h5>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Utilisée pour les sons aigus et la mélodie du piano. La boucle de la clé entoure la 2ème ligne du bas, indiquant la note <strong>Sol 4</strong>. Le Do central (C4) se place sur la 1ère ligne en dessous de la portée.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <h5 className="font-bold text-sm text-purple-400 flex items-center gap-2">
                <span>𝄢 Clé de Fa</span>
                <span className="text-xs font-normal text-slate-400">(Main Gauche)</span>
              </h5>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Utilisée pour les sons graves et l'harmonie / accords de basse. Les deux points encadrent la 4ème ligne, indiquant la note <strong>Fa 3</strong>.
              </p>
            </div>
          </div>

          {/* Fingering */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h5 className="font-bold text-sm text-slate-200 mb-2">
              Doigtés au Piano (Numérotation de 1 à 5)
            </h5>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-rose-400 block text-base">1</span>
                <span className="text-slate-300 text-[11px]">Pouce</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-rose-400 block text-base">2</span>
                <span className="text-slate-300 text-[11px]">Index</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-rose-400 block text-base">3</span>
                <span className="text-slate-300 text-[11px]">Majeur</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-rose-400 block text-base">4</span>
                <span className="text-slate-300 text-[11px]">Annulaire</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-rose-400 block text-base">5</span>
                <span className="text-slate-300 text-[11px]">Auriculaire</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
