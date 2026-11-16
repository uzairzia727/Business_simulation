import Link from "next/link";
import { ROLES } from "@/lib/sim";

const AREAS = [
  ["Marketing", "Prices, advertising, trade press, merchandising and major product improvements for P1–P3."],
  ["Operations", "Sales coverage, research, materials, suppliers, machines, maintenance and deliveries."],
  ["Personnel", "Recruit, dismiss and train sales and assembly staff; set wages, shifts and commission."],
  ["Finance", "Credit policy, dividends, van fleet, management budget and the published accounts."],
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-teal-700 py-16 text-white sm:py-20">
        <div className="wrap">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-300">Team decision &amp; management simulation</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-balance sm:text-5xl">Eight companies. Eight strategies. One market.</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">Each team runs a company with its own strategist role, makes quarterly decisions across three products and four markets, and competes on the league table.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reports" className="btn btn-accent">View league table</Link>
            <Link href="/guide" className="btn border-white/40 bg-transparent text-white hover:bg-white/10">How it works</Link>
          </div>
        </div>
      </section>

      <section className="wrap py-14">
        <h2 className="text-2xl font-bold text-brand-dark">The 8 strategist roles</h2>
        <p className="mt-2 max-w-3xl text-mute">Every company plays a different business strategy. Decisions and reports are pre-filled from each role, so the class can compare strategies straight away — then teams adjust and re-run. Open a team from the <strong>Teams</strong> menu.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <article key={r.name} className="card transition hover:-translate-y-0.5 hover:border-brand">
              <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{r.name}</h3>
              <p className="mt-1 text-sm text-mute">{r.focus}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-white py-14">
        <div className="wrap">
          <h2 className="text-2xl font-bold text-brand-dark">What you manage each quarter</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AREAS.map(([t, d]) => (
              <article key={t} className="rounded-2xl border border-line p-5">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-mute">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
