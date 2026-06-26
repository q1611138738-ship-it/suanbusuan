"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/40 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* A traditional bagua icon or logo could go here */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            算
          </div>
          <span className="font-semibold text-lg tracking-wide text-foreground">
            算不算
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-border/50 bg-background/25 text-foreground hover:bg-primary/10 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : mounted ? (
              <Moon className="w-5 h-5 text-stone-600" />
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
