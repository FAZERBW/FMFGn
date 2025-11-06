import React, { useMemo, useState } from 'react';
import type { FavoriteItem, WiperEntry } from '../types';
import BackIcon from './icons/BackIcon';
import DeleteIcon from './icons/DeleteIcon';
import DetailsPopup from './DetailsPopup';
import FavoritesIcon from './icons/FavoritesIcon';

interface FavoritesScreenProps {
  favorites: FavoriteItem[];
  onBack: () => void;
  removeFavorite: (id: string) => void;
  isFavorite: (make: string, entry: WiperEntry) => boolean;
  addFavorite: (make: string, entry: WiperEntry) => void;
  createFavoriteId: (make: string, entry: WiperEntry) => string;
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ favorites, onBack, removeFavorite, isFavorite, addFavorite, createFavoriteId }) => {
  const [selectedItem, setSelectedItem] = useState<FavoriteItem | null>(null);

  const favoritesByMake = useMemo(() => {
    const grouped: Record<string, FavoriteItem[]> = {};
    const sortedFavorites = [...favorites].sort((a, b) => a.entry.model.localeCompare(b.entry.model));
    for (const item of sortedFavorites) {
      if (!grouped[item.make]) {
        grouped[item.make] = [];
      }
      grouped[item.make].push(item);
    }
    return grouped;
  }, [favorites]);
  
  const sortedMakes = useMemo(() => Object.keys(favoritesByMake).sort((a, b) => a.localeCompare(b)), [favoritesByMake]);

  const handleToggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.make, item.entry)) {
        removeFavorite(item.id);
    } else {
        addFavorite(item.make, item.entry);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-app-bg/50 backdrop-blur-xl border-b border-white/10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-app-surface-muted transition-colors">
          <BackIcon className="w-6 h-6 text-app-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-app-text-primary">Favorite Wiper Blades</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 pt-4 px-4">
        <div className="max-w-3xl mx-auto">
            {favorites.length > 0 ? (
              sortedMakes.map(make => (
                <div key={make} className="mb-4 bg-app-surface/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-app-border">
                  <div className="p-4 bg-app-surface-muted/60 border-b border-app-border">
                    <h2 className="text-xl font-bold text-app-text-primary">{make}</h2>
                  </div>
                  <ul className="divide-y divide-app-border">
                    {favoritesByMake[make].map(item => (
                      <li key={item.id} className="flex items-center px-4 py-3 hover:bg-primary-light/50 transition-colors">
                        <div className="flex-1 flex items-center min-w-0">
                          <button onClick={() => setSelectedItem(item)} className="text-left hover:text-primary focus:text-primary focus:outline-none w-full truncate">
                            <span className="font-medium text-app-text-primary">{item.entry.model}</span>
                          </button>
                          <div className="hidden sm:flex flex-1 justify-around text-center ml-4">
                            <span className="font-mono text-app-text-secondary">{item.entry.D}</span>
                            <span className="font-mono text-app-text-secondary">{item.entry.P}</span>
                            <span className="font-mono text-app-text-secondary">{item.entry.R || '-'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFavorite(item.id)} 
                          title="Remove from favorites"
                          className="p-2 text-app-text-secondary hover:text-danger hover:bg-danger-light rounded-full ml-4"
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="text-center mt-16 text-app-text-secondary animate-fade-in">
                <div className="inline-block p-4 bg-app-surface-muted rounded-full">
                  <FavoritesIcon className="w-12 h-12 text-app-text-tertiary" />
                </div>
                <p className="text-xl font-semibold mt-4">No Favorites Yet</p>
                <p className="mt-1">You can add favorites from the Wiper Blade Guide.</p>
              </div>
            )}
        </div>
      </main>

      {selectedItem && (
        <DetailsPopup
          dataType="wipers"
          make={selectedItem.make}
          entry={selectedItem.entry}
          onClose={() => setSelectedItem(null)}
          favorites={{ isFavorite, addFavorite, removeFavorite, createFavoriteId }}
        />
      )}
    </div>
  );
};

export default FavoritesScreen;