"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CircleDot, MoveRight } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import MagneticButton from "@/components/MagneticButton";
import ProjectCard from "@/components/ProjectCard";
import SiteHeader from "@/components/SiteHeader";
import SkillsCloud from "@/components/SkillsCloud";
import { content, type Locale } from "@/lib/content";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export default function Portfolio() {
  const [locale, setLocale] = useState<Locale>("ru");
  const reduceMotion = useReducedMotion();
  const copy = content[locale];

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const viewportAnimation = reduceMotion
    ? undefined
    : { once: true, amount: 0.18, margin: "0px 0px -8% 0px" };

  return (
    <main className="site-shell">
      <SiteHeader locale={locale} setLocale={setLocale} nav={copy.nav} />
      <HeroSection copy={copy.hero} />

      <section className="content-section work-section" id="works" aria-labelledby="work-title">
        <motion.div
          className="section-heading"
          variants={reveal}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewportAnimation}
          transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="section-kicker">
            <CircleDot size={13} aria-hidden="true" /> {copy.work.kicker}
          </div>
          <div className="section-heading-grid">
            <h2 id="work-title">{copy.work.title}</h2>
            <p>{copy.work.body}</p>
          </div>
        </motion.div>

        <div className="project-grid">
          {copy.projects.map((project, index) => (
            <ProjectCard
              key={`${locale}-${project.id}`}
              project={project}
              featured={index === 0 || index === 3}
              actionLabel={copy.work.cardAction}
            />
          ))}
        </div>
      </section>

      <section className="content-section lab-section" id="lab" aria-labelledby="lab-title">
        <div className="lab-light" aria-hidden="true" />
        <motion.div
          className="section-heading lab-heading"
          variants={reveal}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewportAnimation}
          transition={{ duration: 0.72 }}
        >
          <div className="section-kicker">
            <CircleDot size={13} aria-hidden="true" /> {copy.lab.kicker}
          </div>
          <h2 id="lab-title">{copy.lab.title}</h2>
          <p className="lab-lead">{copy.lab.lead}</p>
          <p className="lab-body">{copy.lab.body}</p>
        </motion.div>

        <div className="principle-grid">
          {copy.lab.principles.map((principle, index) => (
            <motion.article
              key={principle.number}
              className="principle-card"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportAnimation}
              transition={{ delay: reduceMotion ? 0 : index * 0.1, duration: 0.6 }}
            >
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
              <MoveRight size={18} aria-hidden="true" />
            </motion.article>
          ))}
        </div>

        <div className="metrics-row" aria-label="Project metrics">
          {copy.lab.metrics.map((metric) => (
            <div className="metric" key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section stack-section" id="stack" aria-labelledby="stack-title">
        <motion.div
          className="section-heading stack-heading"
          variants={reveal}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewportAnimation}
          transition={{ duration: 0.72 }}
        >
          <div className="section-kicker">
            <CircleDot size={13} aria-hidden="true" /> {copy.stack.kicker}
          </div>
          <div className="section-heading-grid">
            <h2 id="stack-title">{copy.stack.title}</h2>
            <div>
              <p>{copy.stack.body}</p>
              <span className="interaction-hint">{copy.stack.hint}</span>
            </div>
          </div>
        </motion.div>
        <SkillsCloud skills={copy.skills} />
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div className="contact-rings" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <motion.div
          className="contact-inner"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportAnimation}
          transition={{ duration: 0.8 }}
        >
          <div className="section-kicker contact-kicker">
            <CircleDot size={13} aria-hidden="true" /> {copy.contact.kicker}
          </div>
          <h2 id="contact-title">{copy.contact.title}</h2>
          <p>{copy.contact.body}</p>
          <MagneticButton
            href={`mailto:${copy.contact.email}`}
            className="magnetic-cta contact-cta"
            aria-label={`${copy.contact.action}: ${copy.contact.email}`}
          >
            {copy.contact.action}
            <ArrowUpRight size={20} aria-hidden="true" />
          </MagneticButton>
          <a className="contact-email" href={`mailto:${copy.contact.email}`} data-cursor="link">
            {copy.contact.email}
          </a>
        </motion.div>
      </section>

    </main>
  );
}
