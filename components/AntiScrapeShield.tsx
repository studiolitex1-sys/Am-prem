'use client';

import React, { useEffect } from 'react';

export default function AntiScrapeShield() {
  useEffect(() => {
    // Disable common scraping keys and context menus in a user-friendly manner
    const handleContextMenu = (e: MouseEvent) => {
      // Prevent accidental raw source scraping
      if ((e.target as HTMLElement)?.tagName === 'IMG' || (e.target as HTMLElement)?.tagName === 'CANVAS') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept devtool shortcuts if automated scraper
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        // Do not crash, silently prevent inspect scraping
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
