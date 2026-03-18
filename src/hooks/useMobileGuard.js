// ═══════════════════════════════════════════════════
// useMobileGuard — enforces mobile-only UI
// Blocks app on screens wider than 768px
// Runs on initial load AND on every resize event
// ═══════════════════════════════════════════════════
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useMobileGuard() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth > MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > MOBILE_BREAKPOINT);
    check(); // immediate check on mount
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return { isDesktop, isMobile: !isDesktop };
}
