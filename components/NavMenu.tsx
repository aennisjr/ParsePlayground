"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Main navigation links with a menu button below Bootstrap's lg breakpoint.
 * The links are always in the HTML (hidden with Bootstrap's .collapse until
 * opened), so scrapers see them without clicking the button.
 */
export default function NavMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating, and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="navbar-toggler"
        aria-controls="main-nav-links"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        data-testid="nav-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className={`collapse navbar-collapse${open ? " show" : ""}`} id="main-nav-links">
        <ul className="navbar-nav ms-auto column-gap-1 py-2 py-lg-0">
          {items.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <li className="nav-item" key={n.href}>
                <Link className={`nav-link${active ? " active" : ""}`} href={n.href} aria-current={active ? "page" : undefined}>
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
