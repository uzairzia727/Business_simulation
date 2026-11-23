"use client";
import Typewriter, { RobotWriting } from "./Typewriter";
import { useState } from "react";
import { ROLES, Team } from "@/lib/sim";
import RoleIcon from "./RoleIcon";

// Choose which companies an AI competitor runs, then let them make their decisions.
export default function Competitors({ teams, save, run }: {
  teams: Team[]; save: (t: Team[]) => void;
  run: (base: Team[], onProgress: (m: string) => void) => Promise<string[]>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const aiCount = teams.filter((t) => t.aiRun).length;

  const toggle = (i: number) => save(teams.map((t, k) => (k === i ? { ...t, aiRun: !t.aiRun } : t)));
  const setAll = (v: boolean) => save(teams.map((t) => ({ ...t, aiRun: v })));
  const go = async () => {
    setBusy(true); setErrors([]);
    const errs = await run(teams, setMsg);
    setErrors(errs); setBusy(false);
    setMsg(errs.length ? "" : `${aiCount} AI competitor${aiCount === 1 ? "" : "s"} made their decisions. Results updated.`);
  };

  return (
    <section className="card no-print mt-6" aria-labelledby="comp-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="comp-h" className="font-semibold">AI competitors</h2>
          <p className="max-w-2xl text-sm text-mute">Let AI run any company that has no human team. Each AI reads its own results and its rivals&apos; prices, then sets next quarter&apos;s decisions in line with its strategist role. The simulation engine still calculates every result.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" disabled={busy} onClick={() => setAll(true)}>All AI</button>
          <button className="btn" disabled={busy} onClick={() => setAll(false)}>All human</button>
          <button className="btn btn-primary" disabled={busy || !aiCount} onClick={go}>{busy ? "Deciding…" : "Let AI competitors decide"}</button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {teams.map((t, i) => (
          <button key={i} type="button" disabled={busy} onClick={() => toggle(i)} aria-pressed={!!t.aiRun}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${t.aiRun ? "border-brand bg-[#eaf0ec]" : "border-line hover:bg-stone-50"}`}>
            <RoleIcon i={i} size="size-9" />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-sm font-semibold">Team {i + 1}</span>
              <span className="block truncate text-xs text-mute">{ROLES[i].name}</span>
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${t.aiRun ? "bg-brand text-white" : "bg-stone-100 text-slate-700"}`}>{t.aiRun ? "AI" : "Human"}</span>
          </button>
        ))}
      </div>

      {busy && <div className="scan-line mt-3 rounded-xl bg-stone-50 px-4 py-2"><RobotWriting label="AI competitors are writing their decisions" /></div>}
      <p role="status" aria-live="polite" className="mt-3 text-sm font-medium text-brand">{msg}</p>
      {errors.length > 0 && <ul role="alert" className="mt-2 list-disc pl-5 text-sm text-red-700">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}

      {teams.some((t) => t.aiRun && t.aiNote) && (
        <div className="mt-4 grid gap-2">
          <h3 className="text-sm font-semibold">Latest AI reasoning</h3>
          {teams.map((t, i) => t.aiRun && t.aiNote ? (
            <p key={i} className="rounded-xl bg-stone-50 px-4 py-3 text-sm"><span className="font-semibold">Team {i + 1}:</span> <Typewriter text={t.aiNote} speed={14} className="inline-grid" /></p>
          ) : null)}
        </div>
      )}
    </section>
  );
}
