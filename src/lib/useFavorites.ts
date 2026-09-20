import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'savedFavorites';
const EVENT_KEY = 'tv-favorites-updated';

export function getStoredFavorites(): string[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read favorites from localStorage:', e);
    return [];
  }
}

export function saveStoredFavorites(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: favs }));
  } catch (e) {
    console.warn('Failed to save favorites to localStorage:', e);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setFavorites(e.detail);
      } else {
        setFavorites(getStoredFavorites());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(getStoredFavorites());
      }
    };

    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const isFavorite = useCallback((id: string) => {
    if (!id) return false;
    return favorites.includes(id);
  }, [favorites]);

  const toggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!id) return;
    setFavorites(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(f => f !== id) : [...prev, id];
      saveStoredFavorites(next);
      return next;
    });
  }, []);

  const addFavorite = useCallback((id: string) => {
    if (!id) return;
    setFavorites(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveStoredFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    if (!id) return;
    setFavorites(prev => {
      const next = prev.filter(f => f !== id);
      saveStoredFavorites(next);
      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite
  };
}
