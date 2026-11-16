import { useEffect, useState } from 'react';

export interface DeviceCapabilities {
  isCoarsePointer: boolean;
  isDesktop: boolean;
  isMobileViewport: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>(() => {
    if (typeof window === 'undefined') {
      return { isCoarsePointer: false, isDesktop: true, isMobileViewport: false };
    }
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const width = window.innerWidth;
    return {
      isCoarsePointer: coarse,
      isDesktop: !coarse && width >= 1024,
      isMobileViewport: width < 768,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const width = window.innerWidth;
      setCaps({
        isCoarsePointer: coarse,
        isDesktop: !coarse && width >= 1024,
        isMobileViewport: width < 768,
      });
    };

    const mq = window.matchMedia?.('(pointer: coarse)');
    mq?.addEventListener('change', update);
    window.addEventListener('resize', update, { passive: true });
    return () => {
      mq?.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return caps;
}
