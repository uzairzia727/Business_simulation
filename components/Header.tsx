"use client";
import { useIndustry } from "@/lib/useIndustry";
import { SECTIONS, SectionId, sectionName } from "@/lib/sections";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const I = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z",
  league: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
  fame: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3Z",
  guide: "M4 4h6a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4V4Zm16 0h-6a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h7V4Z",
  instructor: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
};
const Icon = ({ d, className = "size-5" }: { d: string; className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

// Portal navigation: fixed left sidebar on large screens, slide-in drawer on phones and tablets.
export default function Header() {
  const { company, ind } = useIndustry();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const m = path.match(/^\/team\/(\d)(?:\/(\w+))?/);
  const teamNo = Number(m?.[1] ?? 0);
  const current = (m?.[2] ?? "dashboard") as SectionId;

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const link = (active: boolean) => `flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition ${active ? "bg-white/15 font-semibold text-white" : "text-stone-300 hover:bg-white/10 hover:text-white"}`;
  const Group = ({ title }: { title: string }) => <p className="mt-5 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-stone-500">{title}</p>;

  const nav = (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-6">
      <Group title="Overview" />
      <Link href="/" className={link(path === "/")}><Icon d={I.home} />Home</Link>
      <Link href="/reports" className={link(path === "/reports")}><Icon d={I.league} />League table</Link>
      <Link href="/hall-of-fame" className={link(path === "/hall-of-fame")}><Icon d={I.fame} />Hall of fame</Link>

      <Group title="Companies" />
      <ul>
        {Array.from({ length: 8 }, (_, i) => {
          const active = teamNo === i + 1;
          return (
            <li key={i}>
              <Link href={`/team/${i + 1}`} aria-current={active && current === "dashboard" ? "page" : undefined} className={link(active)}>
                <span className={`grid size-6 shrink-0 place-items-center rounded text-[11px] font-bold ${active ? "bg-white text-brand-dark" : "bg-white/10"}`}>{i + 1}</span>
                <span className="truncate">{company(i)}</span>
              </Link>
              {active && (
                // The open company's departments, each its own page.
                <ul className="mb-2 ml-5 mt-1 border-l border-white/15 pl-2">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <Link href={`/team/${i + 1}${s.id === "dashboard" ? "" : `/${s.id}`}`} aria-current={current === s.id ? "page" : undefined}
                        className={`flex min-h-9 items-center gap-2.5 rounded-md px-2 text-[13px] transition ${current === s.id ? "bg-white/15 font-semibold text-white" : "text-stone-400 hover:bg-white/10 hover:text-white"}`}>
                        <Icon d={s.icon} className="size-4" />{sectionName(s.id, ind.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <Group title="Organiser" />
      <Link href="/instructor" className={link(path === "/instructor")}><Icon d={I.instructor} />Instructor</Link>
      <Link href="/guide" className={link(path === "/guide")}><Icon d={I.guide} />Guide</Link>
    </nav>
  );

  return (
    <>
      {/* Phone / tablet top bar */}
      <div className="no-print sticky top-0 z-40 flex min-h-14 items-center justify-between border-b border-white/10 bg-brand-dark px-4 lg:hidden">
        <Link href="/" aria-label="StrataSim home"><Logo /></Link>
        <button type="button" className="min-h-11 rounded-md border border-white/30 px-3 text-sm text-white" aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(true)}>Menu</button>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-hidden="true" onClick={() => setOpen(false)} />}

      <aside id="sidebar" aria-label="Sidebar" data-open={open}
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand-dark transition-transform duration-200 lg:w-64 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex min-h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/" aria-label="StrataSim home"><Logo caption={`${ind.name} · Strategy simulation`} /></Link>
          <button type="button" className="grid size-10 place-items-center rounded-md text-white hover:bg-white/10 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>✕</button>
        </div>
        {nav}
      </aside>
    </>
  );
}
