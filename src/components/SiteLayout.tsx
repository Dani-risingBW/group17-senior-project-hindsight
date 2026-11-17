import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { to: "/", label: "Search" },
  { to: "/ask", label: "Ask the Navigator" },
  { to: "/timeline", label: "Archive Timeline" },
  { to: "/saved", label: "Saved" },
  { to: "/about", label: "About" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-foreground">
        <FlaskConical className="mr-1 inline h-3.5 w-3.5" aria-hidden />
        Prototype - mock data
      </div>
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="font-serif text-lg font-bold">
            Social Media Research Navigator
          </Link>
          <nav aria-label="Main" className="flex flex-wrap gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded px-3 py-1.5 opacity-85 hover:bg-primary-foreground/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-primary-foreground"
                activeProps={{ className: "bg-primary-foreground/15 opacity-100 font-semibold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          Cathy Hughes School of Communications · Howard University · Built by Team HindSight
        </div>
      </footer>
    </div>
  );
}

export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  return (
    <>
      {text.split(re).map((part, i) =>
        terms.includes(part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-highlight px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-3xl font-bold text-primary">{title}</h1>
      {subtitle && <p className="mt-2 max-w-3xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
