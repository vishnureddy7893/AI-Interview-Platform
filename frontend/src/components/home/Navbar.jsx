import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

/**
 * Site header.
 *
 * One primary action ("Get started"), one secondary ("Sign in"), and section
 * links that actually go somewhere. The mobile menu is a real menu — the
 * previous burger button was decorative and did nothing.
 */

const SECTIONS = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how-it-works" },
  { label: "For candidates", href: "#candidates" },
  { label: "For employers", href: "#employers" },
];

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close the mobile menu when the viewport grows past the breakpoint.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const close = () => setOpen(false);
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);

  const goto = (href) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded bg-primary text-xs font-bold text-primary-foreground"
          >
            AI
          </span>
          Interview Platform
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((section) => (
            <button
              key={section.href}
              type="button"
              onClick={() => goto(section.href)}
              className="rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/candidate/login")}
          >
            Sign in
          </Button>
          <Button size="sm" onClick={() => navigate("/candidate/signup")}>
            Get started
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {SECTIONS.map((section) => (
              <button
                key={section.href}
                type="button"
                onClick={() => goto(section.href)}
                className="rounded px-2 py-2.5 text-left text-sm text-muted-foreground hover:text-foreground"
              >
                {section.label}
              </button>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3 pb-3">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  navigate("/candidate/login");
                }}
              >
                Sign in
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate("/candidate/signup");
                }}
              >
                Get started
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
