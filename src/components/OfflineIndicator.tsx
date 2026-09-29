import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, HardDriveDownload } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-500/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-2xl border border-amber-300 animate-bounce">
      <div className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
      <WifiOff className="w-4 h-4 text-slate-950" />
      <div>
        <p className="font-bold">Mode Hors-Ligne Actif</p>
        <p className="text-[11px] font-medium text-slate-900 opacity-90">
          Les musiques enregistrées et le piano fonctionnent sans internet.
        </p>
      </div>
    </div>
  );
};
