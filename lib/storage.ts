'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('valzz_store_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('valzz_store_change', callback);
  };
}

export function notifyStoreChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('valzz_store_change'));
  }
}

export function useStorageItem(key: string, defaultValue: string = ''): string {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        if (typeof window === 'undefined') return defaultValue;
        return localStorage.getItem(key) ?? defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    () => defaultValue
  );
}
