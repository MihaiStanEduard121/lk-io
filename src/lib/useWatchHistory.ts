import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  channelId: string;
  channelTitle: string;
  logo?: string;
  thumbnail?: string;
  category?: string;
  timestamp: number;
}

const HISTORY_KEY = 'savedWatchHistory';
const HISTORY_EVENT = 'tv-history-updated';

export function getStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredHistory(list: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT, { detail: list }));
  } catch (e) {
    console.warn('Could not save history:', e);
  }
}

export function useWatchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(getStoredHistory);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setHistory(e.detail);
      } else {
        setHistory(getStoredHistory());
      }
    };

    window.addEventListener(HISTORY_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(HISTORY_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addToHistory = useCallback((item: {
    channelId: string;
    channelTitle: string;
    logo?: string;
    thumbnail?: string;
    category?: string;
  }) => {
    if (!item.channelId) return;
    const current = getStoredHistory();
    // Remove existing entry for same channel to push it to the front
    const filtered = current.filter(h => h.channelId.toLowerCase() !== item.channelId.toLowerCase());
    const nextList: HistoryItem[] = [
      {
        ...item,
        timestamp: Date.now()
      },
      ...filtered
    ].slice(0, 20); // keep last 20

    saveStoredHistory(nextList);
    setHistory(nextList);
  }, []);

  const clearHistory = useCallback(() => {
    saveStoredHistory([]);
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    clearHistory
  };
}
