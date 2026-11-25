"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "ChatGPT Plus" },
  { href: "/spotify", label: "Spotify Premium" },
  { href: "/guarantee", label: "Гарантии" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0f1e]/65"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Sub<span className="text-primary">РФ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden shadow-lg shadow-primary/20 sm:inline-flex" asChild>
            <Link href="/checkout">Оформить</Link>
          </Button>
          {/* Burger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-white/5 bg-[#0a0f1e] px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button size="sm" className="mt-3 w-full shadow-lg shadow-primary/20" asChild>
            <Link href="/checkout" onClick={() => setOpen(false)}>
              Оформить
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}
