"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, Asterisk } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import HeroVideo from "@/components/HeroVideo";
import type { SiteCopy } from "@/lib/content";

interface HeroSectionProps {
  copy: SiteCopy["hero"];
}

function AnimatedLine({ text, outlined = false }: { text: string; outlined?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className={outlined ? "hero-line hero-line-outline" : "hero-line"} aria-hidden="true">
      {Array.from(text).map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          initial={reduceMotion ? false : { opacity: 0, y: 52, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: reduceMotion ? 0 : 0.72,
            delay: reduceMotion ? 0 : 0.18 + index * 0.028,
            ease: [0.2, 0.8, 0.2, 1],
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}

export default function HeroSection({ copy }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <HeroVideo />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-content">
        <motion.div
          className="hero-eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Asterisk size={15} aria-hidden="true" />
          {copy.eyebrow}
        </motion.div>

        <h1 className="hero-title" id="hero-title" aria-label={`${copy.lineOne} ${copy.lineTwo}`}>
          <AnimatedLine text={copy.lineOne} />
          <AnimatedLine text={copy.lineTwo} outlined />
        </h1>

        <motion.p
          className="hero-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.68 }}
        >
          {copy.body}
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.78 }}
        >
          <MagneticButton href="#works" className="magnetic-cta magnetic-cta-primary">
            {copy.primary}
            <ArrowDownRight size={18} aria-hidden="true" />
          </MagneticButton>
          <MagneticButton href="#contact" className="magnetic-cta magnetic-cta-ghost">
            {copy.secondary}
          </MagneticButton>
        </motion.div>
      </div>

    </section>
  );
}
