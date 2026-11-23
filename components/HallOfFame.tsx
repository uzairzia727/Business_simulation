"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ROLES, gbp } from "@/lib/sim";
import { GameRecord, loadGames, saveGames } from "@/lib/store";
import RoleIcon from "./RoleIcon";
import Typewriter from "./Typewriter";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function HallOfFame() {
  const [games, setGames] = useState<GameRecord[] | null>(null);
  useEffect(() => setGames(loadGames()), []);
  const update = (g: GameRecord[]) => { saveGames(g); setGames(g); };

  if (!games) return <div className="wrap py-12 text-mute">Loading…</div>;

  // Tally per company: wins, podium finishes, average finishing position, best total profit.
  const tally = ROLES.map((role, i) => {
    const pos = games.map((g) => g.standings.findIndex((s) => s.team === i + 1)).filter((p) => p >= 0);
    const totals = games.map((g) => g.standings.find((s) => s.team === i + 1)?.total ?? -Infinity);
    return { i, role: role.name, wins: pos.filter((p) => p === 0).length, podiums: pos.filter((p) => p < 3).length,
      avg: pos.length ? pos.reduce((a, b) => a + b + 1, 0) / pos.length : 0, best: Math.max(...totals) };
  }).sort((a, b) => b.wins - a.wins || b.podiums - a.podiums || a.avg - b.avg);

  const margin = (g: GameRecord) => g.standings[0].total - (g.standings[1]?.total ?? 0);
  const recordHigh = games.length ? games.reduce((m, g) => (g.standings[0].total > m.standings[0].total ? g : m)) : null;
  const recordMargin = games.length ? games.reduce((m, g) => (margin(g) > margin(m) ? g : m)) : null;
  const closest = games.length ? games.reduce((m, g) => (margin(g) < margin(m) ? g : m)) : null;

  return (
    <div className="wrap py-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">Win record</p>
      <h1 className="text-3xl font-bold text-brand-dark"><Typewriter text="Hall of fame" speed={45} /></h1>
      <p className="mt-1 max-w-2xl text-mute">Every finished game is recorded here with its winner, winning margin and final standings. Use <strong>Finish game</strong> on the League table to record a game. Records are kept in this browser.</p>

      {!games.length ? (
        <div className="card mt-8 text-center">
          <p className="font-semibold">No games recorded yet</p>
          <p className="mt-1 text-sm text-mute">Play one or more quarters, then click Finish game on the League table.</p>
          <Link href="/reports" className="btn btn-accent mt-4">Open the league table</Link>
        </div>
      ) : (
        <>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
            {[
              ["Games played", String(games.length)],
              ["Most successful", `Team ${tally[0].i + 1} · ${tally[0].wins} win${tally[0].wins === 1 ? "" : "s"}`],
              ["Highest winning profit", recordHigh ? `${gbp(recordHigh.standings[0].total)} (Team ${recordHigh.standings[0].team})` : "—"],
              ["Biggest winning margin", recordMargin ? `${gbp(margin(recordMargin))} (Team ${recordMargin.standings[0].team})` : "—"],
            ].map(([k, v]) => <div key={k} className="bg-white p-4"><dt className="text-xs text-mute">{k}</dt><dd className="mt-1 font-serif text-lg font-semibold">{v}</dd></div>)}
          </dl>
          {closest && games.length > 1 && <p className="mt-3 text-sm text-mute">Closest finish: {closest.name}, won by Team {closest.standings[0].team} by {gbp(margin(closest))}.</p>}

          <section className="card mt-6" aria-labelledby="tally-h">
            <h2 id="tally-h" className="font-semibold">Wins by company</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Company</th><th>Wins</th><th>Top-3 finishes</th><th>Average position</th><th>Best total profit</th></tr></thead>
                <tbody>
                  {tally.map((x) => (
                    <tr key={x.i}>
                      <td className="!text-left"><span className="flex items-center gap-3"><RoleIcon i={x.i} size="size-8" /><span><span className="block font-semibold">Team {x.i + 1}</span><span className="block text-xs text-mute">{x.role}</span></span></span></td>
                      <td className="font-semibold">{x.wins}</td><td>{x.podiums}</td><td>{x.avg ? x.avg.toFixed(1) : "—"}</td><td>{Number.isFinite(x.best) ? gbp(x.best) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6" aria-labelledby="games-h">
            <div className="flex items-center justify-between gap-3">
              <h2 id="games-h" className="text-xl">Game history</h2>
              <button className="btn btn-danger" onClick={() => { if (confirm("Delete every recorded game? This cannot be undone.")) update([]); }}>Clear history</button>
            </div>
            <ol className="mt-3 grid gap-3">
              {games.map((g) => (
                <li key={g.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-sm text-mute">{date(g.date)} · {g.quarters} quarter{g.quarters === 1 ? "" : "s"} · {[...new Set(g.economy)].join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm"><span className="font-semibold">Winner: Team {g.standings[0].team}</span> · {g.standings[0].role}{g.standings[0].ai ? " (AI)" : ""}</p>
                      <p className="text-sm text-mute">{gbp(g.standings[0].total)} total profit · won by {gbp(margin(g))}</p>
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-brand">Final standings</summary>
                    <div className="mt-2 overflow-x-auto">
                      <table className="tbl">
                        <thead><tr><th>Position</th><th>Company</th><th>Total profit</th><th>KSF score</th></tr></thead>
                        <tbody>{g.standings.map((s, k) => (
                          <tr key={s.team}><td>{k + 1}</td><td className="!text-left">Team {s.team} · {s.role}{s.ai ? " (AI)" : ""}</td><td>{gbp(s.total)}</td><td>{s.ksf ?? "—"}</td></tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <button className="btn mt-3 text-xs" onClick={() => { if (confirm(`Delete "${g.name}" from the record?`)) update(games.filter((x) => x.id !== g.id)); }}>Delete this game</button>
                  </details>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
