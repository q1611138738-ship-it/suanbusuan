export function InkLandscape() {
  return (
    <div className="ink-landscape" aria-hidden="true">
      <svg className="ink-landscape-svg" viewBox="0 0 1440 860" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leftInk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="0.58" stopColor="currentColor" stopOpacity="0.17" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rightInk" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="0.6" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bottomMist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.46" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.26" />
          </linearGradient>
          <filter id="softInk" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="mistBlur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
        </defs>

        <g className="ink-left-ridge">
          <path d="M-50 650C35 565 76 472 140 430c49-32 80-10 123-60 40-47 61-130 116-152 69-28 123 66 174 150 45 75 83 143 170 180 46 20 82 49 111 102H-50Z" fill="url(#leftInk)" filter="url(#softInk)" />
          <path d="M0 682c90-72 147-144 205-154 51-9 77 28 126 0 48-28 63-93 114-102 63-11 103 71 157 117 42 36 91 48 151 58 43 7 77 35 101 81H0Z" fill="currentColor" opacity="0.13" />
          <path d="M87 556c62-38 107-56 135-54 30 2 45 22 75 17 36-5 53-39 86-45 49-9 90 36 132 77" stroke="currentColor" strokeWidth="2" opacity="0.18" strokeLinecap="round" fill="none" />
        </g>

        <g className="ink-right-ridge">
          <path d="M1490 650c-84-88-133-190-206-217-54-21-84 18-127-22-44-42-56-123-116-145-75-27-134 71-188 154-48 73-85 111-163 144-61 26-97 42-124 86h924Z" fill="url(#rightInk)" filter="url(#softInk)" />
          <path d="M1440 690c-92-70-151-130-214-139-49-7-83 25-129 4-53-24-66-82-115-90-62-10-102 60-157 103-43 34-96 44-158 56-45 9-82 34-108 66h881Z" fill="currentColor" opacity="0.12" />
          <path d="M1352 559c-56-36-99-53-130-51-33 2-53 23-86 18-37-6-54-37-89-42-50-7-92 35-135 74" stroke="currentColor" strokeWidth="2" opacity="0.17" strokeLinecap="round" fill="none" />
        </g>

        <g className="ink-bottom-ridge">
          <path d="M-40 724c110-58 210-80 298-70 104 12 162 82 274 70 100-11 171-84 282-87 125-4 190 80 313 73 99-5 154-64 252-62 66 1 111 25 161 58v190H-40Z" fill="url(#bottomMist)" filter="url(#mistBlur)" />
          <path d="M-20 778c175-32 331-38 468-15 120 20 191 57 326 43 124-13 195-61 324-59 113 2 220 43 362 35v98H-20Z" fill="currentColor" opacity="0.1" filter="url(#mistBlur)" />
          <path d="M0 805c196-28 361-30 493-5 127 24 202 30 324 8 160-29 302-30 623-1v58H0Z" fill="currentColor" opacity="0.08" />
        </g>
      </svg>

      <div className="ink-paper-grain" />
      <div className="ink-center-light" />
      <div className="ink-side-orbit ink-side-orbit-left" />
      <div className="ink-side-orbit ink-side-orbit-right" />
    </div>
  );
}
