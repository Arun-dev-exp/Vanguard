'use client';

import { useState, useCallback } from 'react';

export function useDemoMode() {
  const [demoMode, setDemoMode] = useState(true);

  const toggleDemoMode = useCallback(() => {
    setDemoMode((prev) => !prev);
  }, []);

  return { demoMode, toggleDemoMode };
}
