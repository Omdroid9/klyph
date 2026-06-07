import { useId } from "react";

interface KlyphLogoStaticProps {
  size?: number;
  className?: string;
}

/** Static smoky blue marble sphere for header and settings. */
export default function KlyphLogoStatic({ size = 24, className = "" }: KlyphLogoStaticProps) {
  const id = useId().replace(/:/g, "");
  const base = `kl-${id}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      aria-hidden
      className={`klyph-logo shrink-0 ${className}`.trim()}
    >
      <defs>
        <radialGradient id={`${base}-base`} cx="36%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f8fbff" />
          <stop offset="22%" stopColor="#c8dcff" />
          <stop offset="48%" stopColor="#6b9de8" />
          <stop offset="74%" stopColor="#3d6fb8" />
          <stop offset="100%" stopColor="#1e3358" />
        </radialGradient>
        <radialGradient id={`${base}-depth`} cx="68%" cy="76%" r="50%">
          <stop offset="0%" stopColor="#152a4a" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0c1524" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${base}-spec`} cx="28%" cy="22%" r="24%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${base}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="86%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="94%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8eb8f0" stopOpacity="0.38" />
        </radialGradient>
        <linearGradient id={`${base}-smoke-band`} x1="0" y1="64" x2="128" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="22%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#f0f7ff" stopOpacity="0.2" />
          <stop offset="78%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${base}-orb`}>
          <circle cx="64" cy="64" r="54" />
        </clipPath>
        <filter id={`${base}-wisp`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={`${base}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter
          id={`${base}-smoke-noise`}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.06" numOctaves="3" seed="14" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.98
                    0 0 0 0 0.99
                    0 0 0 0 1
                    0 0 0 0.28 0"
            result="whiteSmoke"
          />
          <feGaussianBlur in="whiteSmoke" stdDeviation="2.2" result="softSmoke" />
          <feBlend in="SourceGraphic" in2="softSmoke" mode="soft-light" />
        </filter>
      </defs>

      <circle cx="64" cy="64" r="56" fill="#ffffff" fillOpacity="0.04" filter={`url(#${base}-soft)`} />

      <g clipPath={`url(#${base}-orb)`}>
        <circle cx="64" cy="64" r="54" fill={`url(#${base}-base)`} />
        <circle cx="64" cy="64" r="54" fill={`url(#${base}-depth)`} />

        <ellipse cx="76" cy="58" rx="24" ry="13" fill="#ffffff" fillOpacity="0.16" filter={`url(#${base}-wisp)`} />
        <ellipse cx="50" cy="68" rx="20" ry="11" fill="#e8f2ff" fillOpacity="0.12" filter={`url(#${base}-wisp)`} />
        <ellipse cx="60" cy="44" rx="16" ry="9" fill="#ffffff" fillOpacity="0.1" filter={`url(#${base}-wisp)`} />

        <rect x="0" y="50" width="128" height="28" fill={`url(#${base}-smoke-band)`} filter={`url(#${base}-wisp)`} />

        <circle cx="64" cy="64" r="54" fill="#dbeafe" fillOpacity="0.1" filter={`url(#${base}-smoke-noise)`} />

        <ellipse cx="44" cy="36" rx="18" ry="13" fill="#ffffff" fillOpacity="0.42" filter={`url(#${base}-soft)`} />
        <circle cx="64" cy="64" r="54" fill={`url(#${base}-spec)`} />
        <circle cx="64" cy="64" r="54" fill={`url(#${base}-rim)`} />
      </g>
    </svg>
  );
}
