import { useState, useEffect, useCallback } from 'react';
import { getBucharestTimeParts, timeToMinutes } from './tvScheduleUtils';

export interface TVReminder {
  id: string; // unique reminder id
  showTitle: string;
  channelId: string;
  channelTitle: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  notified?: boolean;
  createdAt: number;
}

const REMINDERS_KEY = 'savedReminders';
const REMINDERS_EVENT = 'tv-reminders-updated';

export function getStoredReminders(): TVReminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read reminders:', e);
    return [];
  }
}

export function saveStoredReminders(reminders: TVReminder[]) {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    window.dispatchEvent(new CustomEvent(REMINDERS_EVENT, { detail: reminders }));
  } catch (e) {
    console.warn('Failed to save reminders:', e);
  }
}

export function useReminders() {
  const [reminders, setReminders] = useState<TVReminder[]>(getStoredReminders);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [activeAlert, setActiveAlert] = useState<TVReminder | null>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setReminders(e.detail);
      } else {
        setReminders(getStoredReminders());
      }
    };

    window.addEventListener(REMINDERS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(REMINDERS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Periodic check every 25 seconds for starting shows
  useEffect(() => {
    const checkReminders = () => {
      const currentList = getStoredReminders();
      if (currentList.length === 0) return;

      const nowParts = getBucharestTimeParts();
      const currentMinutes = nowParts.hour * 60 + nowParts.minute;
      const todayStr = nowParts.dateString;

      let hasChanges = false;
      const updatedList = currentList.map(item => {
        if (item.notified) return item;

        // Check if matching today
        if (item.date === todayStr) {
          const startM = timeToMinutes(item.startTime);
          // Trigger alert if within 5 minutes of starting or just started (up to 15m after)
          const diff = startM - currentMinutes;
          if (diff <= 5 && diff >= -15) {
            hasChanges = true;
            triggerNotification(item);
            return { ...item, notified: true };
          }
        }
        return item;
      });

      if (hasChanges) {
        saveStoredReminders(updatedList);
        setReminders(updatedList);
      }
    };

    const triggerNotification = (item: TVReminder) => {
      setActiveAlert(item);

      // System notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const notif = new Notification(`📺 Începe: ${item.showTitle}`, {
            body: `Emisiunea începe acum pe ${item.channelTitle} (${item.startTime})!`,
            icon: '/icons/icon-192.png',
            tag: `tv-reminder-${item.id}`
          });
          notif.onclick = () => {
            window.focus();
            window.location.href = `/ro/play/${item.channelId}`;
          };
        } catch (err) {
          console.warn('System notification failed, fallback to in-app alert:', err);
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 25000);
    return () => clearInterval(interval);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
    return 'denied';
  }, []);

  const hasReminder = useCallback((channelId: string, showTitle: string, startTime: string, date: string) => {
    return reminders.some(
      r => r.channelId.toLowerCase() === channelId.toLowerCase() &&
           r.showTitle.toLowerCase() === showTitle.toLowerCase() &&
           r.startTime === startTime &&
           r.date === date
    );
  }, [reminders]);

  const toggleReminder = useCallback(async (params: {
    showTitle: string;
    channelId: string;
    channelTitle: string;
    date: string;
    startTime: string;
  }) => {
    // Request permission if not yet decided
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      await requestPermission();
    }

    const currentList = getStoredReminders();
    const existingIndex = currentList.findIndex(
      r => r.channelId.toLowerCase() === params.channelId.toLowerCase() &&
           r.showTitle.toLowerCase() === params.showTitle.toLowerCase() &&
           r.startTime === params.startTime &&
           r.date === params.date
    );

    let nextList: TVReminder[];
    let added = false;
    if (existingIndex !== -1) {
      nextList = currentList.filter((_, idx) => idx !== existingIndex);
    } else {
      const newReminder: TVReminder = {
        id: `${params.channelId}-${params.date}-${params.startTime}-${Date.now()}`,
        showTitle: params.showTitle,
        channelId: params.channelId,
        channelTitle: params.channelTitle,
        date: params.date,
        startTime: params.startTime,
        notified: false,
        createdAt: Date.now()
      };
      nextList = [...currentList, newReminder];
      added = true;
    }

    saveStoredReminders(nextList);
    setReminders(nextList);
    return added;
  }, [requestPermission]);

  const removeReminder = useCallback((id: string) => {
    const nextList = reminders.filter(r => r.id !== id);
    saveStoredReminders(nextList);
    setReminders(nextList);
  }, [reminders]);

  const clearAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return {
    reminders,
    permission,
    activeAlert,
    hasReminder,
    toggleReminder,
    removeReminder,
    clearAlert,
    requestPermission
  };
}
