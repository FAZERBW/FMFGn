import { useState, useEffect, useCallback } from 'react';
import type { WiperEntry, FavoriteItem } from '../types';

const FAVORITES_STORAGE_KEY = 'wiperFavorites';

// Helper to create a unique ID for a wiper entry
const createFavoriteId = (make: string, entry: WiperEntry): string => {
  return `${make}|${entry.model}|${entry.D}|${entry.P}|${entry.R || ''}`.toLowerCase();
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
      setFavorites([]);
    }
  }, []);

  const saveFavorites = (newFavorites: FavoriteItem[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  };

  const addFavorite = useCallback((make: string, entry: WiperEntry) => {
    const id = createFavoriteId(make, entry);
    const newFavorite: FavoriteItem = { id, make, entry };
    
    setFavorites(prev => {
      // Avoid duplicates
      if (prev.some(fav => fav.id === id)) {
        return prev;
      }
      const updatedFavorites = [...prev, newFavorite];
      saveFavorites(updatedFavorites);
      return updatedFavorites;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updatedFavorites = prev.filter(fav => fav.id !== id);
      saveFavorites(updatedFavorites);
      return updatedFavorites;
    });
  }, []);

  const isFavorite = useCallback((make: string, entry: WiperEntry): boolean => {
    const id = createFavoriteId(make, entry);
    return favorites.some(fav => fav.id === id);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, createFavoriteId };
};