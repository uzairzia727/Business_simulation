"use client";
import { useIndustry } from "@/lib/useIndustry";
import { Econ, POLICIES, PolicyId, REGULATOR, Team, gbp } from "@/lib/sim";

const IDS = Object.keys(POLICIES) as PolicyId[];

// The regulator: the organiser switches policies on or off; every company must comply from the current quarter.
export default function Regulator({ teams, econ, setEcon, readOnly }: { teams: Team[]; econ: Econ; setEcon: (e: Econ) => void; readOnly?: boolean }) {
  const { t: w } = useIndustry();
  const active = econ.policies ?? [];
  const set = (p: PolicyId[]) => setEcon({ ...econ, policies: p });
  const toggle = (id: PolicyId) => set(active.includes(id) ? active.filter((x) => x !== id) : [...active, id]);
  const announce = () => { const pool = IDS.filter((id) => !active.includes(id)); if (pool.length) set([...active, pool[Math.floor(Math.random() * pool.length)]]); };
  const affected = teams.map((t, i) => ({ i, notices: t.report?.notices ?? [], fines: t.report?.fines ?? 0 })).filter((x) => x.notices.length);

  return (
    <section className="card mt-6" aria-labelledby="reg-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="reg-h" className="font-semibold">Regulator: {w(REGULATOR)}</h2>
          <p className="max-w-2xl text-sm text-mute">Switch policies on to change the rules for every company. Caps and floors are applied automatically; breaches are fined. Teams should adapt their decisions to each new policy.</p>
        </div>
        {!readOnly && <div className="no-print flex flex-wrap gap-2">
          <button className="btn" onClick={announce} disabled={active.length === IDS.length}>Announce a new policy</button>
          <button className="btn" onClick={() => set([])} disabled={!active.length}>Lift all policies</button>
        </div>}
      </div>

      <div className="no-print mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {IDS.filter((id) => !readOnly || active.includes(id)).map((id) => {
          const on = active.includes(id);
          return (
            <button key={id} type="button" aria-pressed={on} disabled={readOnly} onClick={() => toggle(id)}
              className={`rounded-md border p-3 text-left transition ${on ? "border-brand bg-[#eaf0ec]" : "border-line hover:bg-stone-50"}`}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{w(POLICIES[id].name)}</span>
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${on ? "bg-brand text-white" : "bg-stone-100 text-mute"}`}>{on ? "IN FORCE" : "OFF"}</span>
              </span>
              <span className="mt-1 block text-xs leading-5 text-mute">{w(POLICIES[id].rule)}</span>
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 font-serif text-lg font-semibold">Compliance this quarter</h3>
      {!active.length ? <p className="mt-2 text-sm text-mute">No policies in force.</p>
        : !affected.length ? <p className="mt-2 text-sm text-mute">All 8 companies comply with every policy in force.</p>
        : (
          <ul className="mt-2 grid gap-2">
            {affected.map(({ i, notices, fines }) => (
              <li key={i} className="rounded-md border border-line px-4 py-3 text-sm">
                <span className="font-semibold">Team {i + 1}</span>{fines ? <span className="ml-2 text-red-700">fined {gbp(fines)}</span> : null}
                <ul className="mt-1 list-disc pl-5 text-mute">{notices.map((n) => <li key={n}>{w(n)}</li>)}</ul>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}

// Short notice for a team page: which policies are in force and how this team is affected.
export function PolicyNotice({ team, econ }: { team: Team; econ: Econ }) {
  const { t: w } = useIndustry();
  const active = econ.policies ?? [];
  if (!active.length) return null;
  const notices = team.report?.notices ?? [];
  return (
    <div className="mt-4 rounded-md border border-line border-l-2 border-l-brand bg-white p-4 text-sm">
      <p className="font-semibold">Regulator notice: {active.length} polic{active.length === 1 ? "y" : "ies"} in force</p>
      <ul className="mt-1 list-disc pl-5 text-mute">{active.map((id) => <li key={id}><span className="font-medium text-ink">{w(POLICIES[id].name)}:</span> {w(POLICIES[id].rule)}</li>)}</ul>
      {notices.length > 0 && (
        <>
          <p className="mt-3 font-semibold text-red-800">Your company&apos;s latest report</p>
          <ul className="mt-1 list-disc pl-5 text-red-800">{notices.map((n) => <li key={n}>{w(n)}</li>)}</ul>
        </>
      )}
    </div>
  );
}
