"use client";

import { useState } from "react";
import { Arrow } from "./Arrow";

const links = [
  ["Focus", "#focus"],
  ["Approach", "#approach"],
  ["Initiatives", "#initiatives"],
  ["Contact", "#contact"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="siteHeader">
      <a className="brand" href="#top" aria-label="I4I Centre home" onClick={() => setOpen(false)}>
        I4I Centre
      </a>
      <button
        className="menuButton"
        type="button"
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{open ? "Close" : "Menu"}</span>
        <span className="menuLines" aria-hidden="true" />
      </button>
      <nav id="site-navigation" className={open ? "siteNav isOpen" : "siteNav"} aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <a className="headerCta" href="#contact">
        Start a conversation <Arrow />
      </a>
    </header>
  );
}
