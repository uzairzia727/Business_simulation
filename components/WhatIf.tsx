"use client";
import { useState } from "react";
import { Econ, ROLES, Team, Values, gbp } from "@/lib/sim";
import { MY_RESPONSES, whatIf } from "@/lib/whatif";

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const delta = (x: number) => <span className={x < 0 ? "text-red-700" : x > 0 ? "text-emerald-700" : ""}>{x > 0 ? "+" : ""}{gbp(x)}</span>;

// Competitive scenarios: before submitting, see how this plan holds up if rivals move, and which response works best.
export default function WhatIf({ teams, idx, t, econ, apply }: { teams: Team[]; idx: number; t: Team; econ: Econ; apply: (d: Values, label: string) => void }) {
  const [res, setRes] = useState<ReturnType<typeof whatIf> | null>(null);
  const run = () => setRes(whatIf(teams.map((x, i) => (i === idx ? t : x)), idx, econ));

  return (
    <section className="card no-print mt-6" aria-labelledby="wi-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="wi-h" className="font-semibold">Competitive scenarios: what if rivals move?</h2>
          <p className="max-w-3xl text-sm text-mute">Test your current decisions against likely rival moves before you commit. For each move the preview runs the whole market again, shows your result if you hold your plan, and tests {MY_RESPONSES.length - 1} possible responses to find the best one. Rivals&apos; current plans are the starting point.</p>
        </div>
        <button className="btn btn-primary" onClick={run}>{res ? "Run again with my latest decisions" : "Run what-if preview"}</button>
      </div>

      {res && (
        <>
          <p className="mt-4 text-sm">If nothing changes: net profit <span className="font-semibold">{gbp(res.now.net)}</span>, market share <span className="font-semibold">{pct(res.now.share)}</span>, {res.now.lost.toLocaleString("en-PK")} lost sales, {res.now.unsold.toLocaleString("en-PK")} unsold units. Market leader among rivals: Team {res.leader + 1} ({ROLES[res.leader].name}).</p>
          <div className="mt-3 overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>If rivals…</th><th>Your profit if you hold</th><th>Change</th><th>Your share</th><th>Best response</th><th>Profit with it</th><th></th></tr></thead>
              <tbody>
                {res.rows.map((r) => {
                  const resp = MY_RESPONSES.find((m) => m.id === r.best.id)!;
                  return (
                    <tr key={r.id}>
                      <td className="!text-left font-medium">{r.name}</td>
                      <td>{gbp(r.hold.net)}</td>
                      <td>{delta(r.hold.net - res.now.net)}</td>
                      <td>{pct(r.hold.share)}</td>
                      <td className="!text-left">{resp.name}</td>
                      <td>{gbp(r.best.out.net)} {r.best.id !== "hold" && <span className="block text-xs">{delta(r.best.out.net - r.hold.net)} vs holding</span>}</td>
                      <td>{r.best.id !== "hold" && <button className="btn h-8 min-h-0 px-2 text-xs" onClick={() => { apply(resp.apply(t.d), resp.name); setRes(null); }}>Use this</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-mute">Previews use the current economy and regulator policies. Real rivals may do something else: treat this as a stress test, not a forecast.</p>
        </>
      )}
    </section>
  );
}
