"use client";

import Link from 'next/link';
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from '@/components/home/BrandMark';

const navItems = [
  { label: '首页', href: '/#top' },
  { label: '工具', href: '/#entry-methods' },
  { label: '科普', href: '/#metaphysics-education' },
  { label: '关于', href: '/#about' },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="site-nav sticky top-0 z-50 w-full shrink-0 border-b px-4 backdrop-blur-2xl transition sm:px-6">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
          <BrandMark />
          <span className="site-nav-brand truncate font-serif text-xl font-semibold">
            算不算
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav-link rounded-full px-4 py-2 text-sm transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="site-nav-icon-button flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2"
            aria-label="切换深浅色"
            type="button"
          >
            <Sun className="hidden h-5 w-5 dark:block" />
            <Moon className="h-5 w-5 dark:hidden" />
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="site-nav-icon-button flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 md:hidden"
            aria-expanded={menuOpen}
            aria-label="打开导航菜单"
            type="button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto max-w-6xl pb-4 md:hidden">
          <div className="site-nav-mobile-panel rounded-3xl border p-2 shadow-xl backdrop-blur-2xl">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="site-nav-mobile-link block rounded-2xl px-4 py-3 text-sm transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
