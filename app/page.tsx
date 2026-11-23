import Typewriter from "@/components/Typewriter";
import Link from "next/link";
import { ROLES } from "@/lib/sim";
import RoleIcon from "@/components/RoleIcon";
import LeaguePreview from "@/components/LeaguePreview";

const STATS = [["8", "Competing companies"], ["8", "Strategist roles"], ["3", "Products"], ["4", "Markets"]];
const STEPS = [
  ["Pick a team", "Take charge of one of eight companies, each led by a distinct strategist role."],
  ["Decide", "Start from the role's baseline plan and refine pricing, staffing, production and finance."],
  ["Report", "Generate profit and loss, balance sheet, cash flow and resource reports for every company."],
  ["Benchmark", "Compare performance on the league table and identify which strategy created the most value."],
];
const AREAS = [
  ["Marketing", "Prices, advertising, trade press, merchandising and product improvements."],
  ["Operations", "Sales coverage, research, materials, machines, maintenance and deliveries."],
  ["Personnel", "Recruit, dismiss and train staff; set wages, shifts and commission."],
  ["Finance", "Credit policy, dividends, van fleet, management budget and accounts."],
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,.45),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,.35),transparent_50%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="wrap relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">Strategic management simulation</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-balance sm:text-6xl">
              <Typewriter text="Compete on strategy." speed={55} className="inline-grid" /> <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Win on results.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">Lead one of eight competing companies, set quarterly strategy across marketing, operations, people and finance, and measure the impact through full management accounts.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/team/1" className="btn btn-accent px-6">Start the simulation</Link>
              <Link href="/guide" className="btn border-white/30 bg-transparent px-6 text-white hover:bg-white/10">Guide</Link>
            </div>
          </div>
          <LeaguePreview />
        </div>
        <div className="relative border-t border-white/10 bg-white/5">
          <dl className="wrap grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
            {STATS.map(([v, l]) => (
              <div key={l}><dt className="sr-only">{l}</dt><dd className="text-3xl font-extrabold">{v}</dd><dd className="text-sm text-blue-200">{l}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="wrap py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">How each quarter works</p>
        <h2 className="mt-2 text-3xl font-bold text-brand-dark">From strategy to results in four steps</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative">
              <span className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white ring-8 ring-blue-50">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1 text-sm leading-6 text-mute">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-white py-16">
        <div className="wrap">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Meet the strategists</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-dark">The 8 strategist roles</h2>
          <p className="mt-3 max-w-2xl text-mute">Each company pursues a distinct competitive strategy, revealing how positioning choices perform head to head.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r, i) => (
              <Link key={r.name} href={`/team/${i + 1}`} className="group card flex flex-col transition hover:-translate-y-1 hover:border-brand hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <RoleIcon i={i} />
                  <span className="text-xs font-semibold text-mute">Team {i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{r.name}</h3>
                <p className="mt-1 flex-1 text-sm leading-6 text-mute">{r.focus}</p>
                <span className="mt-4 text-sm font-semibold text-brand group-hover:underline">Open decisions →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <h2 className="text-3xl font-bold text-brand-dark">What every team manages</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AREAS.map(([t, d]) => (
            <article key={t} className="rounded-2xl border-l-4 border-brand bg-white p-5 shadow-sm">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm leading-6 text-mute">{d}</p>
            </article>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-brand to-teal-600 p-8 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">See where every company stands</h2>
            <p className="mt-1 text-blue-100">Reports for all eight companies are generated automatically from their current decisions.</p>
          </div>
          <Link href="/reports" className="btn btn-accent px-6">Open the league table</Link>
        </div>
      </section>
    </>
  );
}
