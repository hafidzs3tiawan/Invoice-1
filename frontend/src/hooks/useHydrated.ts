import { useState, useEffect } from 'react';

// Custom hook to prevent Next.js React hydration mismatch with Zustand persist
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  return hydrated;
}
