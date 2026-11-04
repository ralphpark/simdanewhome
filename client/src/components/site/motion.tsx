import { createContext, useContext, useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from "framer-motion";

export const siteEase = [0.25, 0.1, 0.25, 1] as const;
const StaggerContext = createContext(false);

export function Reveal({ children, delay = 0, ...props }: HTMLMotionProps<"div"> & { delay?: number }) {
  const reduce = useReducedMotion();
  const staggered = useContext(StaggerContext);
  return (
    <motion.div
      initial={reduce ? false : staggered ? undefined : "hidden"}
      whileInView={staggered ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease: siteEase } } }}
      {...props}
    >{children}</motion.div>
  );
}

/** Wrap Reveal children to stagger their entrance by the design system's 80ms. */
export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <StaggerContext.Provider value={true}>
      <motion.div initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }} {...props}>
        {children}
      </motion.div>
    </StaggerContext.Provider>
  );
}

type ParallaxImageProps = ImgHTMLAttributes<HTMLImageElement> & { containerClassName?: string; strength?: number };
export function ParallaxImage({ containerClassName = "", className = "", strength = 8, alt, ...props }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const distance = Math.min(Math.max(strength, 0), 20);
  const y = useTransform(scrollYProgress, [0, 1], [`-${distance}%`, `${distance}%`]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${containerClassName}`}>
      <motion.div className="h-full w-full" style={reduce ? undefined : { y, scale: 1 + distance / 50 }}>
        <img loading="lazy" decoding="async" {...props} alt={alt ?? ""} className={`h-full w-full object-cover ${className}`} />
      </motion.div>
    </div>
  );
}

type ScaleOnScrollProps = { children: ReactNode; className?: string; contentClassName?: string };
export function ScaleOnScroll({ children, className = "", contentClassName = "" }: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  // Only the single clipping layer changes radius; image movement uses transforms.
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 28]);
  return (
    <div ref={ref} className={className}>
      <motion.div className={`overflow-hidden ${contentClassName}`} style={reduce ? { borderRadius: 28 } : { scale, borderRadius }}>
        {children}
      </motion.div>
    </div>
  );
}

export function CountUp({ value, suffix = "", prefix = "", decimals = 0, duration = 1.6, className = "" }: { value: number; suffix?: string; prefix?: string; decimals?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration, ease: siteEase, onUpdate: setCount });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);
  const format = (n: number) => n.toLocaleString("ko-KR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{prefix}{format(value)}{suffix}</span>
      <span aria-hidden="true">{prefix}{format(reduce ? value : count)}{suffix}</span>
    </span>
  );
}
