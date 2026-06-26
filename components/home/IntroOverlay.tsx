interface IntroOverlayProps {
  text: string;
}

export function IntroOverlay({ text }: IntroOverlayProps) {
  return (
    <div
      className="intro-overlay pointer-events-none fixed inset-0 z-[9999] grid h-dvh min-h-[100dvh] w-screen place-items-center overflow-hidden"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        height: '100dvh',
        minHeight: '100dvh',
        width: '100vw',
        maxWidth: '100vw',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <div className="intro-ink" />
      <p className="intro-quote" aria-label={text}>
        {Array.from(text).map((char, index) => (
          <span key={`${char}-${index}`} style={{ animationDelay: `${index * 55}ms` }}>
            {char}
          </span>
        ))}
      </p>
    </div>
  );
}
