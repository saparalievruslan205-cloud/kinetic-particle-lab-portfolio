"use client";

import {
  Aperture,
  Asterisk,
  Atom,
  Box,
  BrainCircuit,
  Braces,
  Code2,
  Cpu,
  Database,
  Layers3,
  Move3d,
  Orbit,
  Palette,
  Server,
  Sparkles,
  Triangle,
  Waves,
  Wind,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface Skill {
  name: string;
  category: string;
  icon: string;
}

export interface SkillsCloudProps {
  skills: readonly Skill[];
  className?: string;
}

const SKILL_ICONS: Readonly<Record<string, LucideIcon>> = {
  aperture: Aperture,
  asterisk: Asterisk,
  atom: Atom,
  box: Box,
  brain: BrainCircuit,
  braces: Braces,
  code: Code2,
  "code-2": Code2,
  cpu: Cpu,
  database: Database,
  layers: Layers3,
  "layers-3": Layers3,
  move: Move3d,
  orbit: Orbit,
  palette: Palette,
  server: Server,
  sparkles: Sparkles,
  triangle: Triangle,
  waves: Waves,
  wind: Wind,
  workflow: Workflow,
};

const PROXIMITY_RADIUS = 210;
const SKILL_SPRING = {
  stiffness: 180,
  damping: 18,
  mass: 0.55,
} as const;

interface SkillMotionController {
  element: HTMLButtonElement;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  glow: MotionValue<number>;
}

interface SkillOrbProps {
  skill: Skill;
  index: number;
  isCoarse: boolean;
  prefersReducedMotion: boolean;
  register: (key: string, controller: SkillMotionController | null) => void;
}

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

function SkillOrb({
  skill,
  index,
  isCoarse,
  prefersReducedMotion,
  register,
}: SkillOrbProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const targetScale = useMotionValue(1);
  const targetGlow = useMotionValue(0);

  const smoothX = useSpring(offsetX, SKILL_SPRING);
  const smoothY = useSpring(offsetY, SKILL_SPRING);
  const smoothScale = useSpring(targetScale, SKILL_SPRING);
  const smoothGlow = useSpring(targetGlow, {
    stiffness: 150,
    damping: 20,
    mass: 0.5,
  });

  const registrationKey = `${skill.name}-${index}`;

  useEffect(() => {
    const element = buttonRef.current;

    if (!element) {
      return;
    }

    register(registrationKey, {
      element,
      x: offsetX,
      y: offsetY,
      scale: targetScale,
      glow: targetGlow,
    });

    return () => register(registrationKey, null);
  }, [offsetX, offsetY, register, registrationKey, targetGlow, targetScale]);

  const Icon = SKILL_ICONS[skill.icon.trim().toLowerCase()] ?? Asterisk;
  const direction = index % 2 === 0 ? 1 : -1;
  const floatX = direction * (7 + ((index * 5) % 11));
  const floatY = -8 - ((index * 7) % 15);
  const floatDuration = 4.8 + (index % 5) * 0.72;
  const impulseX = direction * (14 + (index % 3) * 4);
  const impulseY = -11 - (index % 4) * 3;
  const accent = index % 3 === 1 ? "#7000ff" : "#00f0ff";
  const shouldFloat = isCoarse && !prefersReducedMotion;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className="skills-cloud__item relative min-h-28 touch-manipulation rounded-2xl border border-white/15 bg-[#121323]/75 p-4 text-left text-white shadow-xl shadow-black/30 outline-none backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-[#5de8ff] focus-visible:ring-offset-4 focus-visible:ring-offset-[#090914] sm:min-h-32 sm:p-5"
      aria-label={`${skill.name}: ${skill.category}`}
      title={`${skill.name} — ${skill.category}`}
      data-cursor="skill"
      animate={
        shouldFloat
          ? {
              x: [0, floatX, -floatX * 0.55, 0],
              y: [0, floatY, -floatY * 0.35, 0],
              rotate: [0, direction * 1.8, direction * -1.1, 0],
            }
          : { x: 0, y: 0, rotate: 0 }
      }
      whileTap={
        shouldFloat
          ? {
              x: impulseX,
              y: impulseY,
              rotate: direction * 4,
              scale: 1.06,
              transition: { type: "spring", stiffness: 360, damping: 18 },
            }
          : prefersReducedMotion
            ? undefined
            : { scale: 1.03 }
      }
      transition={
        shouldFloat
          ? {
              duration: floatDuration,
              delay: index * 0.07,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
          : { duration: 0.22, ease: "easeOut" }
      }
      style={{
        WebkitTapHighlightColor: "transparent",
        willChange: shouldFloat ? "transform" : "auto",
      }}
    >
      <motion.span
        className="skills-cloud__motion-layer relative flex h-full min-h-20 flex-col justify-between"
        style={{
          x: prefersReducedMotion || isCoarse ? 0 : smoothX,
          y: prefersReducedMotion || isCoarse ? 0 : smoothY,
          scale: prefersReducedMotion || isCoarse ? 1 : smoothScale,
        }}
      >
        <motion.span
          className="skills-cloud__glow pointer-events-none absolute -inset-4 -z-10 rounded-[1.4rem] blur-2xl"
          style={{
            backgroundColor: accent,
            opacity: prefersReducedMotion || isCoarse ? 0 : smoothGlow,
          }}
          aria-hidden="true"
        />

        <span
          className="skills-cloud__icon inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10"
          style={{ color: accent, boxShadow: `0 0 24px ${accent}24` }}
          aria-hidden="true"
        >
          <Icon size={19} strokeWidth={1.55} />
        </span>

        <span className="mt-6 block">
          <strong className="block text-sm font-medium tracking-[-0.02em] text-white sm:text-base">
            {skill.name}
          </strong>
          <span className="mt-1 block font-mono text-[0.58rem] uppercase tracking-[0.15em] text-slate-400 sm:text-[0.62rem]">
            {skill.category}
          </span>
        </span>
      </motion.span>
    </motion.button>
  );
}

export default function SkillsCloud({ skills, className = "" }: SkillsCloudProps) {
  const controllersRef = useRef(new Map<string, SkillMotionController>());
  const pointerRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const isCoarse = useCoarsePointer();
  const prefersReducedMotion = useReducedMotion() === true;

  const register = useCallback(
    (key: string, controller: SkillMotionController | null) => {
      if (controller) {
        controllersRef.current.set(key, controller);
      } else {
        controllersRef.current.delete(key);
      }
    },
    [],
  );

  const resetControllers = useCallback(() => {
    for (const controller of controllersRef.current.values()) {
      controller.x.set(0);
      controller.y.set(0);
      controller.scale.set(1);
      controller.glow.set(0);
    }
  }, []);

  const updateControllers = useCallback(() => {
    animationFrameRef.current = null;
    const pointer = pointerRef.current;

    for (const controller of controllersRef.current.values()) {
      const bounds = controller.element.getBoundingClientRect();
      const deltaX = pointer.x - (bounds.left + bounds.width / 2);
      const deltaY = pointer.y - (bounds.top + bounds.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      const proximity = Math.max(0, 1 - distance / PROXIMITY_RADIUS);
      const safeDistance = Math.max(distance, 1);

      controller.x.set((-deltaX / safeDistance) * proximity * 22);
      controller.y.set((-deltaY / safeDistance) * proximity * 18);
      controller.scale.set(1 + proximity * 0.11);
      controller.glow.set(proximity * 0.48);
    }
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isCoarse || prefersReducedMotion || typeof window === "undefined") {
        return;
      }

      pointerRef.current = { x: event.clientX, y: event.clientY };

      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(updateControllers);
      }
    },
    [isCoarse, prefersReducedMotion, updateControllers],
  );

  const handlePointerLeave = useCallback(() => {
    if (typeof window !== "undefined" && animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    resetControllers();
  }, [resetControllers]);

  useEffect(() => {
    if (isCoarse || prefersReducedMotion) {
      resetControllers();
    }
  }, [isCoarse, prefersReducedMotion, resetControllers]);

  useEffect(
    () => () => {
      if (typeof window !== "undefined" && animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      controllersRef.current.clear();
    },
    [],
  );

  return (
    <div
      className={`skills-cloud grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="group"
      aria-label="Technology skills"
    >
      {skills.map((skill, index) => (
        <SkillOrb
          key={`${skill.name}-${skill.category}`}
          skill={skill}
          index={index}
          isCoarse={isCoarse}
          prefersReducedMotion={prefersReducedMotion}
          register={register}
        />
      ))}
    </div>
  );
}
