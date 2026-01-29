/**
 * GradientBackground - Modern SVG gradient blob background
 */
export default function GradientBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Large vibrant green orb - top right */}
      <svg
        className="absolute -top-10 -right-32 w-[520px] h-[520px] md:w-[100px] md:h-[100px]"
        viewBox="0 0 800 800"
        fill="none"
        style={{ filter: 'blur(60px)' }}
      >
        <defs>
          <radialGradient id="heroGradient1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent-400)" stopOpacity="0.7" />
            <stop offset="40%" stopColor="var(--color-accent-500)" stopOpacity="0.5" />
            <stop offset="70%" stopColor="var(--color-accent-600)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-accent-700)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="400" fill="url(#heroGradient1)" />
      </svg>

      {/* Vibrant terracotta orb - bottom left */}
      <svg
        className="absolute -bottom-40 -left-32 w-[480px] h-[480px] md:w-[800px] md:h-[800px]"
        viewBox="0 0 600 600"
        fill="none"
        style={{ filter: 'blur(55px)' }}
      >
        <defs>
          <radialGradient id="heroGradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary-200)" stopOpacity="0.85" />
            <stop offset="35%" stopColor="var(--color-primary-300)" stopOpacity="0.5" />
            <stop offset="70%" stopColor="var(--color-primary-400)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="300" fill="url(#heroGradient2)" />
      </svg>

      {/* Green orb - left side middle */}
      <svg
        className="absolute top-1/3 -left-40 w-[420px] h-[420px] md:w-[720px] md:h-[720px]"
        viewBox="0 0 500 500"
        fill="none"
        style={{ filter: 'blur(65px)' }}
      >
        <defs>
          <radialGradient id="heroGradient5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary-300)" stopOpacity="0.8" />
            <stop offset="45%" stopColor="var(--color-primary-400)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-primary-600)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="250" fill="url(#heroGradient5)" />
      </svg>

      {/* Extra pop - bottom right */}
      <svg
        className="absolute bottom-10 right-10 w-[280px] h-[280px] md:w-[500px] md:h-[500px]"
        viewBox="0 0 300 300"
        fill="none"
        style={{ filter: 'blur(45px)' }}
      >
        <defs>
          <radialGradient id="heroGradient4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary-300)" stopOpacity="0.75" />
            <stop offset="50%" stopColor="var(--color-accent-400)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-secondary-500)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="150" fill="url(#heroGradient4)" />
      </svg>

      {/* ====== SECOND SCREEN BLOBS ====== */}

      {/* Center wash */}
      <svg
        className="absolute top-[110vh] left-1/2 -translate-x-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px]"
        viewBox="0 0 800 800"
        fill="none"
        style={{ filter: 'blur(80px)' }}
      >
        <defs>
          <radialGradient id="heroGradient6" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary-400)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-primary-700)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="400" fill="url(#heroGradient6)" />
      </svg>

      {/* Offset accent */}
      <svg
        className="absolute top-[130vh] right-[-10%] w-[420px] h-[420px] md:w-[700px] md:h-[700px]"
        viewBox="0 0 600 600"
        fill="none"
        style={{ filter: 'blur(65px)' }}
      >
        <defs>
          <radialGradient id="heroGradient7" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent-400)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-accent-700)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="300" fill="url(#heroGradient7)" />
      </svg>
    </div>
  );
}
