import KlyphAnimatedSphere from "./KlyphAnimatedSphere";
import KlyphLogoStatic from "./KlyphLogoStatic";

interface KlyphLogoProps {
  size?: number;
  className?: string;
  /** Flowing liquid-metal animation (welcome hero). */
  animated?: boolean;
}

export default function KlyphLogo({
  size = 24,
  className = "",
  animated = false,
}: KlyphLogoProps) {
  if (animated) {
    return <KlyphAnimatedSphere size={size} className={className} />;
  }

  return <KlyphLogoStatic size={size} className={className} />;
}
