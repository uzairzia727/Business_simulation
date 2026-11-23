"use client";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/sim";

const LINKS = [["/", "Home"], ["/guide", "Guide"], ["/reports", "Reports"]] as const;

export default function Header() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [teams, setTeams] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMenu(false); setTeams(false); }, [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ddRef.current?.contains(e.target as Node)) setTeams(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setTeams(false); };
    document.addEventListener("click", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, []);

  const item = (active: boolean) =>
    `flex min-h-11 items-center rounded-lg px-3.5 text-sm font-medium transition ${active ? "bg-white/15 text-white" : "text-stone-300 hover:bg-white/10 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-dark/95 backdrop-blur">
      <div className="wrap flex min-h-16 flex-wrap items-center justify-between gap-2 py-2">
        <Link href="/" aria-label="StrataSim home" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <Logo />
        </Link>
        <button type="button" className="min-h-11 rounded-lg border border-white/30 px-3 text-sm text-white lg:hidden"
          aria-expanded={menu} aria-controls="nav" onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button>
        <nav id="nav" aria-label="Main" className={`${menu ? "flex" : "hidden"} w-full flex-col gap-1 pb-2 lg:flex lg:w-auto lg:flex-row lg:items-center lg:pb-0`}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={item(path === href)}>{label}</Link>
          ))}
          <div ref={ddRef} className="relative">
            <button type="button" aria-expanded={teams} aria-haspopup="true" onClick={() => setTeams(!teams)}
              className={`${item(path.startsWith("/team"))} w-full cursor-pointer gap-2`}>
              Teams
              <svg aria-hidden="true" className={`size-4 transition ${teams ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" /></svg>
            </button>
            {teams && (
              <div className="z-50 mt-1 grid gap-1 rounded-xl border border-line bg-white p-2 shadow-lg sm:grid-cols-2 lg:absolute lg:right-0 lg:w-[30rem]">
                {ROLES.map((r, i) => (
                  <Link key={r.name} href={`/team/${i + 1}`}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 hover:bg-stone-100 ${path === `/team/${i + 1}` ? "bg-[#eaf0ec]" : ""}`}>
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand text-xs font-bold text-white">{i + 1}</span>
                    <span className="leading-tight"><span className="block text-sm font-semibold text-ink">Team {i + 1}</span>
                      <span className="block text-xs text-mute">{r.name}</span></span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
