interface BrandMarkProps {
  size?: 'sm' | 'lg';
  className?: string;
}

export function BrandMark({ size = 'sm', className = '' }: BrandMarkProps) {
  const sizeClass = size === 'lg' ? 'brand-mark-lg' : 'brand-mark-sm';

  return (
    <div className={`brand-mark ${sizeClass} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="brand-ring brand-ring-outer" cx="32" cy="32" r="27" />
        <circle className="brand-ring brand-ring-mid" cx="32" cy="32" r="21.5" />
        <circle className="brand-disc" cx="32" cy="32" r="15" />

        <g className="brand-compass">
          <path d="M32 5.5v6" />
          <path d="M32 52.5v6" />
          <path d="M5.5 32h6" />
          <path d="M52.5 32h6" />
          <path d="m13.3 13.3 4.2 4.2" />
          <path d="m46.5 46.5 4.2 4.2" />
          <path d="m50.7 13.3-4.2 4.2" />
          <path d="m17.5 46.5-4.2 4.2" />
        </g>

        <g className="brand-trigrams">
          <path d="M24.6 10.2h3.5M35.9 10.2h3.5" />
          <path d="M24.6 53.8h3.5M35.9 53.8h3.5" />
          <path d="M10.2 24.6v3.5M10.2 35.9v3.5" />
          <path d="M53.8 24.6v3.5M53.8 35.9v3.5" />
        </g>

        <path className="brand-yang" d="M32 17a7.5 7.5 0 0 1 0 15 7.5 7.5 0 0 0 0 15 15 15 0 0 0 0-30Z" />
        <circle className="brand-dot brand-dot-dark" cx="32" cy="24.5" r="2.25" />
        <circle className="brand-dot brand-dot-light" cx="32" cy="39.5" r="2.25" />

        <path className="brand-mountain" d="M18.5 38.5c4.2-5.4 7.6-8.1 11-8.1 2.6 0 4.6 1.6 6.6 3.9 1.5 1.7 3.1 3.4 5.4 4.2" />
        <path className="brand-water" d="M18.5 43.5c4.1-1.8 7.9-2.7 11.5-2.7 4.7 0 9.4 1.1 15.5 2.7" />
      </svg>
    </div>
  );
}
