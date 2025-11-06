import React, { useRef } from 'react';
import type { DataType, Entry, WiperEntry, BulbEntry } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import CancelIcon from './icons/CancelIcon';
import StarIcon from './icons/StarIcon';

// html2canvas is loaded globally from a script tag in index.html
declare const html2canvas: any;

interface DetailsPopupProps {
  dataType: DataType;
  make: string;
  entry: Entry;
  allEntries?: Entry[];
  onClose: () => void;
  favorites: {
    isFavorite: (make: string, entry: WiperEntry) => boolean;
    addFavorite: (make: string, entry: WiperEntry) => void;
    removeFavorite: (id: string) => void;
    createFavoriteId: (make: string, entry: WiperEntry) => string;
  };
}


const DetailsPopup: React.FC<DetailsPopupProps> = ({ dataType, make, entry, allEntries, onClose, favorites }) => {
  const popupContentRef = useRef<HTMLDivElement>(null);
  const isWiper = (e: Entry): e is WiperEntry => dataType === 'wipers';

  const handleDownload = () => {
    const contentElement = popupContentRef.current;
    if (contentElement) {
      const isDarkMode = document.documentElement.classList.contains('theme-lunar');
      const bgColor = isDarkMode ? '#192033' : '#FFFFFF';

      html2canvas(contentElement, { 
        useCORS: true, 
        backgroundColor: bgColor,
        scale: 2.5
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `${make}_fitting_guide.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch((err: any) => {
        console.error("html2canvas failed:", err);
      });
    }
  };

  const onToggleFavorite = (targetEntry: WiperEntry) => {
    if (!favorites) return;
    const id = favorites.createFavoriteId(make, targetEntry);
    if (favorites.isFavorite(make, targetEntry)) favorites.removeFavorite(id);
    else favorites.addFavorite(make, targetEntry);
  };
  
  const bulbDetailsConfig = isWiper(entry) ? [] : [
      { label: 'Headlight (H/L)', value: (entry as BulbEntry).H_L },
      { label: 'Low Beam', value: (entry as BulbEntry).LOW },
      { label: 'High Beam', value: (entry as BulbEntry).HIGH },
      { label: 'Fog Light', value: (entry as BulbEntry).FOG_LIGHT },
  ];
  const bulbDetailsToRender = bulbDetailsConfig.filter(detail => detail.value && detail.value.trim() !== '-');
  
  const showMultiModelView = dataType === 'wipers' && allEntries && allEntries.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md" role="dialog" aria-modal="true" onClick={onClose}>
      <div 
        className="relative bg-glass-bg w-full max-w-md rounded-xl shadow-2xl flex flex-col animate-scale-in overflow-hidden border border-white/10" 
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-white/10">
            <div>
                <h2 className="text-2xl font-bold text-app-text-primary leading-tight">{make}</h2>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{showMultiModelView ? 'Wiper Blade Sizes' : entry.model}</p>
            </div>
            <button onClick={onClose} className="p-2 text-app-text-secondary hover:bg-app-surface/20 rounded-full">
                <CancelIcon className="w-6 h-6" />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div ref={popupContentRef} className="p-6 bg-app-surface/80" id="printable-details">
            <div className="text-center mb-6">
                 <h3 className="text-2xl font-extrabold text-app-text-primary tracking-wide">PRINCE AUTO PARTS</h3>
                 <p className="text-md font-semibold text-app-text-secondary">Dhule, Maharashtra</p>
            </div>

            <div className="space-y-4">
              {showMultiModelView ? (
                <div className="bg-app-surface-muted/50 rounded-lg border border-app-border shadow-inner">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-app-text-secondary uppercase bg-app-surface/30">
                            <tr>
                                <th scope="col" className="px-4 py-3">Model</th>
                                <th scope="col" className="px-4 py-3 text-center">Driver</th>
                                <th scope="col" className="px-4 py-3 text-center">Passenger</th>
                                <th scope="col" className="px-4 py-3 text-center">Rear</th>
                                {favorites && <th scope="col" className="px-2 py-3 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody>
                        {(allEntries as WiperEntry[]).map((item, index) => (
                          <tr key={index} className="border-t border-app-border/50">
                            <td className="px-4 py-2 font-medium text-app-text-primary">{item.model}</td>
                            <td className="px-4 py-2 text-center font-mono">{item.D}</td>
                            <td className="px-4 py-2 text-center font-mono">{item.P}</td>
                            <td className="px-4 py-2 text-center font-mono">{item.R || '-'}</td>
                            {favorites && (
                              <td className="px-2 py-2 text-center">
                                <button onClick={() => onToggleFavorite(item)} className="p-1">
                                  <StarIcon className={`w-5 h-5 transition-all ${favorites.isFavorite(make, item) ? 'text-warning fill-current' : 'text-app-text-tertiary/50 hover:text-warning'}`} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
              ) : isWiper(entry) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-app-surface-muted p-4 rounded-lg text-center border border-app-border shadow-inner">
                        <p className="text-sm font-medium text-app-text-secondary uppercase tracking-wider">Driver</p>
                        <p className="text-5xl font-bold text-app-text-primary font-mono">{entry.D}</p>
                    </div>
                    <div className="bg-app-surface-muted p-4 rounded-lg text-center border border-app-border shadow-inner">
                        <p className="text-sm font-medium text-app-text-secondary uppercase tracking-wider">Passenger</p>
                        <p className="text-5xl font-bold text-app-text-primary font-mono">{entry.P}</p>
                    </div>
                    {entry.R && entry.R.trim() !== '-' && (
                    <div className="bg-app-surface-muted p-4 rounded-lg text-center border border-app-border shadow-inner sm:col-span-2">
                        <p className="text-sm font-medium text-app-text-secondary uppercase tracking-wider">Rear</p>
                        <p className="text-4xl font-bold text-app-text-primary font-mono">{entry.R}</p>
                    </div>
                    )}
                </div>
              ) : (
                <div className="space-y-3">
                    {bulbDetailsToRender.map((detail) => (
                        <div key={detail.label} className="flex justify-between items-center bg-app-surface-muted p-4 rounded-lg border border-app-border shadow-inner">
                            <p className="font-semibold text-app-text-secondary text-md">{detail.label}</p>
                            <p className="font-bold text-app-text-primary font-mono text-xl">{detail.value}</p>
                        </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="text-center mt-8 pt-6 border-t-2 border-dashed border-app-border">
                 <p className="text-2xl font-bold text-app-text-primary tracking-wider">9922115982 • 9921226321</p>
                 <p className="text-xs text-app-text-tertiary mt-1">Shop No 4, Naaz Complex, Jai Shankar Colony, Deopur, Dhule</p>
            </div>
          </div>
        </div>
        
        <footer className="p-4 bg-app-surface/20 border-t border-white/10">
            <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-3 p-3 bg-primary text-primary-text rounded-lg hover:bg-primary-hover font-semibold transition-colors"
            >
                <DownloadIcon className="w-5 h-5" />
                Download Image
            </button>
        </footer>
      </div>
    </div>
  );
};

export default DetailsPopup;