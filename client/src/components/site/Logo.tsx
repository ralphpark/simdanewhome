import { useId, type SVGProps } from "react";
import { motion, useReducedMotion } from "framer-motion";
import officialLogo from "@/assets/brand/simda-logo.svg?raw";

const letters = ["letter-s", "letter-i", "letter-m", "letter-d", "letter-a"] as const;
type LogoPart = "bracket" | "emblem" | (typeof letters)[number];

// The supplied SVG is the sole source of the contours. Read its trusted local
// groups without rewriting, normalizing, or injecting SVG markup into the DOM.
const paths = Object.fromEntries(
  Array.from(officialLogo.matchAll(/<g id="([^"]+)">([\s\S]*?)<\/g>/g), ([, id, group]) => [
    id,
    Array.from(group.matchAll(/<path d="([^"]+)"/g), ([, d]) => d),
  ]),
) as Record<LogoPart, string[]>;

function Contours({ part }: { part: LogoPart }) {
  return <>{paths[part].map((d, index) => <path key={index} d={d} />)}</>;
}

type LogoProps = SVGProps<SVGSVGElement> & {
  variant?: "full" | "emblem";
  intro?: boolean;
};

export function Logo({ variant = "full", intro = false, className = "", ...props }: LogoProps) {
  const clipId = `simda-ground-${useId().replace(/:/g, "")}`;
  const reduce = useReducedMotion();
  const animateIntro = intro && !reduce && variant === "full";

  return (
    <svg
      viewBox={variant === "emblem" ? "353 107 24 24" : "122 107 255 87"}
      fill="currentColor"
      role="img"
      aria-label="simda"
      className={`${animateIntro ? "site-logo-intro " : ""}${className}`}
      {...props}
    >
      {variant === "full" && (
        <>
          {animateIntro && (
            <defs>
              {/* 190.078125 is the top edge of the official horizontal bracket.
                  The letters' original cut bottoms (166.46875) stay untouched. */}
              <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                <rect x="122" y="80" width="255" height="110.078125" />
              </clipPath>
            </defs>
          )}
          <g data-logo-part="bracket"><Contours part="bracket" /></g>
          <g clipPath={animateIntro ? `url(#${clipId})` : undefined}>
            {letters.map((part, index) => (
              <motion.g
                key={part}
                data-logo-part={part}
                initial={animateIntro ? { y: 84 } : false}
                animate={{ y: 0 }}
                transition={animateIntro ? { type: "spring", stiffness: 280, damping: 22, mass: 0.65, delay: 0.42 + index * 0.07 } : { duration: 0 }}
              >
                <Contours part={part} />
              </motion.g>
            ))}
          </g>
        </>
      )}
      <motion.g
        data-logo-part="emblem"
        initial={animateIntro ? { rotate: -90, scale: 0.6, opacity: 0 } : false}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: animateIntro ? 0.3 : 0, delay: animateIntro ? 1.05 : 0, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <Contours part="emblem" />
      </motion.g>
    </svg>
  );
}
