"use client";

import type { Dispatch, SetStateAction } from "react";
import type { Locale, SiteCopy } from "@/lib/content";

interface SiteHeaderProps {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
  nav: SiteCopy["nav"];
}

export default function SiteHeader({ locale, setLocale, nav }: SiteHeaderProps) {
  const links = [
    { href: "#works", label: nav.work },
    { href: "#lab", label: nav.lab },
    { href: "#stack", label: nav.stack },
    { href: "#contact", label: nav.contact },
  ];

  return (
    <header className="site-header" data-testid="site-header">
      <a className="site-logo" href="#top" data-cursor="link" aria-label="KINETIC LAB — top">
        KINETIC<span>{"//"}</span>LAB
      </a>

      <nav className="site-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href} data-cursor="link">
            {link.label}
          </a>
        ))}
      </nav>

      <div className="site-header-actions">
        <div className="availability-badge">
          <span aria-hidden="true" />
          <span className="availability-copy">{nav.availability}</span>
        </div>
        <div className="locale-switch" role="group" aria-label={nav.languageLabel}>
          {(["ru", "en"] as const).map((language) => (
            <button
              key={language}
              type="button"
              aria-pressed={locale === language}
              className={locale === language ? "is-active" : undefined}
              onClick={() => setLocale(language)}
              data-cursor="button"
            >
              {language.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
