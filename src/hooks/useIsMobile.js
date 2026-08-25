import { useState, useEffect } from 'react';

// Matches the breakpoint used by <picture>'s mobile <source> for banners,
// so images and video switch to the mobile asset at the same viewport width.
export const MOBILE_BREAKPOINT = 767;

export const useIsMobile = (breakpoint = MOBILE_BREAKPOINT) => {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${breakpoint}px)`).matches
    );

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [breakpoint]);

    return isMobile;
};
