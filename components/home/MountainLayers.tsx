'use client';

import { useEffect, useRef } from 'react';

export function MountainLayers() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const resetParallax = () => {
      root.style.setProperty('--mountain-back-x', '0px');
      root.style.setProperty('--mountain-back-y', '0px');
      root.style.setProperty('--mountain-mid-x', '0px');
      root.style.setProperty('--mountain-mid-y', '0px');
      root.style.setProperty('--mountain-front-x', '0px');
      root.style.setProperty('--mountain-front-y', '0px');
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (reduceMotionQuery.matches) {
        return;
      }

      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      root.style.setProperty('--mountain-back-x', `${(x * -8).toFixed(2)}px`);
      root.style.setProperty('--mountain-back-y', `${(y * 4).toFixed(2)}px`);
      root.style.setProperty('--mountain-mid-x', `${(x * 12).toFixed(2)}px`);
      root.style.setProperty('--mountain-mid-y', `${(y * 6).toFixed(2)}px`);
      root.style.setProperty('--mountain-front-x', `${(x * -18).toFixed(2)}px`);
      root.style.setProperty('--mountain-front-y', `${(y * 8).toFixed(2)}px`);
    };
    const handleMotionChange = () => {
      if (reduceMotionQuery.matches) {
        resetParallax();
      }
    };

    resetParallax();
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    reduceMotionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      reduceMotionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <div ref={rootRef} className="mountain-layers" aria-hidden="true">
      <svg className="mountain-layer mountain-layer-back" viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0 286C121 214 211 181 310 192c92 10 126 65 215 58 106-8 145-102 256-104 115-2 158 96 270 101 103 5 145-70 238-63 63 5 103 44 151 102v92H0Z" />
      </svg>
      <svg className="mountain-layer mountain-layer-mid" viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0 310c88-53 167-73 238-60 83 15 123 70 202 61 99-11 135-105 236-112 114-8 165 95 284 91 114-4 157-102 270-96 78 4 139 57 210 126v58H0Z" />
      </svg>
      <svg className="mountain-layer mountain-layer-front" viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0 334c162-45 294-50 396-16 94 32 152 38 238 16 114-29 185-92 300-88 124 5 188 85 316 86 79 1 138-26 190-58v104H0Z" />
        <path className="mountain-water" d="M170 309c70-14 136-13 198 2 79 19 152 21 219 3M820 302c86-16 165-16 238 1 65 15 131 17 198 5" />
      </svg>
    </div>
  );
}
