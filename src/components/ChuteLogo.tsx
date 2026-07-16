import ChuteAnimatedSphere from "./ChuteAnimatedSphere";
import ChuteLogoStatic from "./ChuteLogoStatic";

interface ChuteLogoProps {
  size?: number;
  className?: string;
  /** Flowing liquid-metal animation (welcome hero). */
  animated?: boolean;
}

export default function ChuteLogo({
  size = 24,
  className = "",
  animated = false,
}: ChuteLogoProps) {
  if (animated) {
    return <ChuteAnimatedSphere size={size} className={className} />;
  }

  return <ChuteLogoStatic size={size} className={className} />;
}
