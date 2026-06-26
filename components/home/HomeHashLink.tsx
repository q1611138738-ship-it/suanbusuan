"use client";

import type { MouseEvent, ReactNode } from "react";

interface HomeHashLinkProps {
  children: ReactNode;
  className?: string;
  hash: string;
}

export function HomeHashLink({ children, className, hash }: HomeHashLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const targetId = hash.replace(/^#/, "");
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = target.getBoundingClientRect().top + window.scrollY - 80;

    window.history.pushState(null, "", hash);
    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <a href={hash} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
