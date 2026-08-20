"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  tags: readonly string[];
  accent: string;
  metric: string;
  metricLabel: string;
}

export interface ProjectCardProps {
  project: Project;
  href?: string;
  featured?: boolean;
  actionLabel?: string;
}

type ProjectAccentStyle = CSSProperties & {
  "--project-accent": string;
};

const CARD_SPRING = {
  stiffness: 190,
  damping: 24,
  mass: 0.48,
} as const;

const PROJECT_ACCENTS: Readonly<Record<string, string>> = {
  cyan: "#00f0ff",
  violet: "#7000ff",
  silver: "#e8fbff",
  acid: "#b6ff4a",
};

function useCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const updatePointerMode = () => setIsCoarse(mediaQuery.matches);

    updatePointerMode();
    mediaQuery.addEventListener("change", updatePointerMode);

    return () => mediaQuery.removeEventListener("change", updatePointerMode);
  }, []);

  return isCoarse;
}

export default function ProjectCard({
  project,
  href = "#contact",
  featured = false,
  actionLabel = "Project file",
}: ProjectCardProps) {
  const articleRef = useRef<HTMLElement>(null);
  const isCoarse = useCoarsePointer();
  const prefersReducedMotion = useReducedMotion() === true;
  const [isInMobileFocus, setIsInMobileFocus] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const highlightX = useMotionValue(50);
  const highlightY = useMotionValue(50);

  const smoothPointerX = useSpring(pointerX, CARD_SPRING);
  const smoothPointerY = useSpring(pointerY, CARD_SPRING);
  const smoothHighlightX = useSpring(highlightX, CARD_SPRING);
  const smoothHighlightY = useSpring(highlightY, CARD_SPRING);

  const rotateX = useTransform(smoothPointerY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smoothPointerX, [-0.5, 0.5], [-9, 9]);
  const highlight = useMotionTemplate`radial-gradient(25rem circle at ${smoothHighlightX}% ${smoothHighlightY}%, color-mix(in srgb, var(--project-accent) 28%, transparent), transparent 64%)`;

  const resetTilt = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
    highlightX.set(50);
    highlightY.set(50);
  }, [highlightX, highlightY, pointerX, pointerY]);

  useEffect(() => {
    if (!isCoarse || prefersReducedMotion) {
      return;
    }

    if (typeof window === "undefined" || !articleRef.current) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const article = articleRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInMobileFocus(
          entry.isIntersecting && entry.intersectionRatio >= 0.45,
        );
      },
      {
        threshold: [0, 0.45, 0.7, 1],
        rootMargin: "-8% 0px -8% 0px",
      },
    );

    observer.observe(article);

    return () => observer.disconnect();
  }, [isCoarse, prefersReducedMotion]);

  useEffect(() => {
    if (isCoarse || prefersReducedMotion) {
      resetTilt();
    }
  }, [isCoarse, prefersReducedMotion, resetTilt]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      if (isCoarse || prefersReducedMotion || !articleRef.current) {
        return;
      }

      const bounds = articleRef.current.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;

      pointerX.set(localX / bounds.width - 0.5);
      pointerY.set(localY / bounds.height - 0.5);
      highlightX.set((localX / bounds.width) * 100);
      highlightY.set((localY / bounds.height) * 100);
    },
    [
      highlightX,
      highlightY,
      isCoarse,
      pointerX,
      pointerY,
      prefersReducedMotion,
    ],
  );

  const triggerBorderSweep = useCallback(() => {
    setSweepKey((currentKey) => currentKey + 1);

    if (
      isCoarse &&
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    ) {
      navigator.vibrate(12);
    }
  }, [isCoarse]);

  const resolvedAccent =
    PROJECT_ACCENTS[project.accent.trim().toLowerCase()] ?? project.accent;

  const accentStyle: ProjectAccentStyle = {
    "--project-accent": resolvedAccent,
  };

  const borderSweepStyle: CSSProperties = {
    padding: "1px",
    background:
      "conic-gradient(from 0deg, transparent 0deg 292deg, color-mix(in srgb, var(--project-accent) 92%, white) 326deg, transparent 360deg)",
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };

  const titleId = `project-${project.id}-title`;
  const showMobileFocus = isCoarse && !prefersReducedMotion && isInMobileFocus;

  return (
    <article
      ref={articleRef}
      className={`project-card relative [perspective:1200px] ${
        featured ? "project-card--featured lg:col-span-2" : ""
      } ${
        showMobileFocus ? "project-card--active" : ""
      }`}
      style={accentStyle}
      aria-labelledby={titleId}
    >
      <motion.div
        className="project-card__surface group relative min-h-[29rem] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:min-h-[32rem]"
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
          willChange: prefersReducedMotion ? "auto" : "transform",
        }}
        animate={{
          scale:
            showMobileFocus ? 1.02 : 1,
        }}
        whileHover={
          !isCoarse && !prefersReducedMotion ? { scale: 1.012 } : undefined
        }
        whileTap={
          isCoarse && !prefersReducedMotion ? { scale: 1.02 } : undefined
        }
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
      >
        <motion.span
          className="project-card__highlight pointer-events-none absolute inset-0 opacity-70"
          style={{ background: highlight }}
          aria-hidden="true"
        />

        {sweepKey > 0 ? (
          <motion.span
            key={sweepKey}
            className="project-card__border-sweep pointer-events-none absolute -inset-px z-20 rounded-2xl"
            style={borderSweepStyle}
            initial={{ rotate: 0, opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: [0, 0.7, 0] }
                : { rotate: 360, opacity: [0, 1, 0] }
            }
            transition={{ duration: prefersReducedMotion ? 0.25 : 0.9, ease: "easeOut" }}
            aria-hidden="true"
          />
        ) : null}

        <a
          className="project-card__link relative z-10 flex min-h-[inherit] flex-col p-6 outline-none focus-visible:ring-2 focus-visible:ring-[var(--project-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#050508] sm:p-8"
          href={href}
          aria-label={`${actionLabel}: ${project.title}`}
          data-cursor="project"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          onPointerDown={triggerBorderSweep}
        >
          <div className="project-card__topline flex items-start justify-between gap-5">
            <span className="font-mono text-[0.68rem] tracking-[0.2em] text-white/42">
              {project.index} / SELECTED WORK
            </span>
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[0_0_18px_var(--project-accent)]"
              style={{ backgroundColor: resolvedAccent }}
              aria-hidden="true"
            />
          </div>

          <div className="project-card__content mt-auto pt-20 [transform:translateZ(34px)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--project-accent)]">
              {project.subtitle}
            </p>
            <h3
              className="max-w-[10ch] text-4xl font-semibold leading-[0.92] tracking-[-0.055em] text-white sm:text-5xl"
              id={titleId}
            >
              {project.title}
            </h3>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/58 sm:text-base sm:leading-7">
              {project.description}
            </p>

            <ul
              className="project-card__tags mt-7 flex flex-wrap gap-2"
              aria-label="Project technologies"
            >
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/60"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="project-card__footer mt-9 flex items-end justify-between gap-5 border-t border-white/10 pt-5 [transform:translateZ(24px)]">
            <div>
              <strong className="block text-2xl font-medium tracking-[-0.04em] text-white">
                {project.metric}
              </strong>
              <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.16em] text-white/38">
                {project.metricLabel}
              </span>
            </div>

            <span className="project-card__cta inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/74 transition-colors group-hover:text-white">
              {actionLabel}
              <ArrowUpRight
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                size={16}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </span>
          </div>
        </a>
      </motion.div>
    </article>
  );
}
