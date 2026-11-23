"use client";
import { useIndustry } from "@/lib/useIndustry";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_ECON, Econ, ROLES, Team, gbp } from "@/lib/sim";
import { recordGame, useTeams } from "@/lib/store";
import Competitors from "./Competitors";
import Economy from "./Economy";
import Regulator from "./Regulator";
import RoleIcon from "./RoleIcon";
import Typewriter from "./Typewriter";

// Simple, non-cryptographic hash: the PIN only keeps students out of the panel on a shared screen.
const hash = (s: string) => String([...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7));
const UNLOCK_KEY = "strataSimInstructorOk";

// Message from the instructor, shown on the League table and every team page.
export function Announcement({ econ }: { econ: Econ }) {
  if (!econ.announcement?.trim() && !econ.locked) return null;
  return (
    <div role="status" className="mt-4 rounded-md border border-brand/30 border-l-2 border-l-brand bg-[#eaf0ec] p-4 text-sm">
      {econ.announcement?.trim() && <p><span className="font-semibold">Instructor:</span> {econ.announcement}</p>}
      {econ.locked && <p className={econ.announcement?.trim() ? "mt-1 font-semibold" : "font-semibold"}>Decisions are locked: the instructor is reviewing this quarter.</p>}
    </div>
  );
}

export default function Instructor() {
  const { company } = useIndustry();
  const router = useRouter();
  const { teams, ready, save, generateAll, closeQuarter, runCompetitors, econ, setEcon } = useTeams();
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { try { setOk(sessionStorage.getItem(UNLOCK_KEY) === "1"); } catch {} }, []);
  useEffect(() => { if (ready) setNote(econ.announcement ?? ""); }, [ready, econ.announcement]);
  useEffect(() => { if (ready && teams.some((t) => !t.report)) generateAll(teams); }, [ready, teams, generateAll]);

  if (!ready) return <div className="wrap py-12 text-mute">Loading…</div>;

  // PIN gate (only when a PIN has been set).
  if (econ.pin && !ok) {
    return (
      <div className="wrap max-w-md py-16">
        <h1 className="text-3xl">Instructor controls</h1>
        <form className="card mt-6" onSubmit={(e) => { e.preventDefault(); if (hash(pin) === econ.pin) { setOk(true); try { sessionStorage.setItem(UNLOCK_KEY, "1"); } catch {} } else setMsg("Incorrect PIN."); }}>
          <label htmlFor="pin" className="text-sm font-semibold">Instructor PIN</label>
          <input id="pin" type="password" inputMode="numeric" autoComplete="current-password" className="input mt-1" value={pin} onChange={(e) => setPin(e.target.value)} />
          {msg && <p role="alert" className="mt-2 text-sm text-red-700">{msg}</p>}
          <button className="btn btn-primary mt-4 w-full">Open controls</button>
        </form>
      </div>
    );
  }
  if (teams.some((t) => !t.report)) return <div className="wrap py-12 text-mute">Preparing the game…</div>;

  const now = `Year ${teams[0].year} · Quarter ${teams[0].quarter}`;
  const done = teams[0].history?.length ?? 0;
  const blank = () => teams.map(() => ({ year: "", quarter: "", simCode: "", groupNo: "", d: {}, report: null } as Team));
  const fresh = { ...DEFAULT_ECON, industry: econ.industry, pin: econ.pin };
  const total = (t: Team) => (t.history ?? []).reduce((s, h) => s + h.net, 0) + t.report!.net;

  return (
    <div className="wrap py-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">{now} · {done} quarter{done === 1 ? "" : "s"} completed</p>
      <h1 className="text-3xl font-bold text-brand-dark"><Typewriter text="Instructor controls" speed={45} /></h1>
      <p className="mt-1 max-w-3xl text-mute">Run the game from here: set the industry, economy and regulation, follow each team&apos;s progress, lock decisions while you review, message every team, and move the game from quarter to quarter.</p>

      <section className="card mt-6" aria-labelledby="q-h">
        <h2 id="q-h" className="font-semibold">Quarter controls</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn btn-accent" onClick={() => { if (confirm(`Close ${now} for all 8 companies? Results are locked in and the next quarter starts from each company's closing position.`)) { closeQuarter(teams); setEcon({ ...econ, locked: false }, false); setMsg("Quarter closed. Decisions unlocked for the new quarter."); } }}>Close quarter &amp; start next</button>
          <button className="btn" onClick={() => { generateAll(teams.map((x) => ({ ...x, report: null }))); setMsg("All 8 companies recalculated."); }}>Recalculate all</button>
          <button className="btn" aria-pressed={!!econ.locked} onClick={() => { setEcon({ ...econ, locked: !econ.locked }, false); setMsg(econ.locked ? "Decisions unlocked." : "Decisions locked: teams can view but not change them."); }}>{econ.locked ? "Unlock decisions" : "Lock decisions"}</button>
          <button className="btn" onClick={() => {
            const name = prompt("Finish this game and record the winner in the Hall of fame. Game name (optional):", "");
            if (name === null) return;
            recordGame(teams, name);
            if (confirm("Winner recorded. Start a new game from Quarter 1 now?")) { setEcon(fresh, false); generateAll(blank(), fresh); }
            router.push("/hall-of-fame");
          }}>Finish game</button>
          <button className="btn btn-danger" onClick={() => { if (confirm("Restart the whole simulation from Quarter 1? All quarters and edits will be lost.")) { setEcon(fresh, false); generateAll(blank(), fresh); setMsg("New game started."); } }}>Reset game</button>
        </div>
        <p role="status" aria-live="polite" className="mt-2 text-sm font-medium text-emerald-700">{msg}</p>
      </section>

      <section className="card mt-6" aria-labelledby="t-h">
        <h2 id="t-h" className="font-semibold">Team progress</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Company</th><th>Run by</th><th>Decisions</th><th>Net profit (quarter)</th><th>Total profit</th><th>KSF</th><th>Managers</th><th>Regulator notices</th><th></th></tr></thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={i}>
                  <td className="!text-left"><span className="flex items-center gap-3"><RoleIcon i={i} size="size-8" /><span><span className="block font-semibold">{company(i)}</span><span className="block text-xs text-mute">Team {i + 1} · {ROLES[i].name}</span></span></span></td>
                  <td>{t.aiRun ? "AI" : "Human"}</td>
                  <td>{t.touched ? "Edited" : "Role default"}</td>
                  <td className={t.report!.net < 0 ? "text-red-700" : ""}>{gbp(t.report!.net)}</td>
                  <td className="font-semibold">{gbp(total(t))}</td>
                  <td>{t.ksf?.overall ?? "—"}</td>
                  <td>{Object.keys(t.hr?.managers ?? {}).length}</td>
                  <td className={t.report!.notices.length ? "text-red-700" : ""}>{t.report!.notices.length}</td>
                  <td><Link className="text-sm font-semibold text-brand hover:underline" href={`/team/${i + 1}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mt-6" aria-labelledby="a-h">
        <h2 id="a-h" className="font-semibold">Message to all teams</h2>
        <p className="text-sm text-mute">Shown at the top of the League table and every team page.</p>
        <textarea className="input mt-3 h-24 py-2" maxLength={400} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Decisions for Quarter 2 are due by 3:30 pm." aria-label="Message to all teams" />
        <div className="mt-2 flex gap-2">
          <button className="btn btn-primary" onClick={() => { setEcon({ ...econ, announcement: note.trim() }, false); setMsg(note.trim() ? "Message posted." : "Message cleared."); }}>Post message</button>
          <button className="btn" onClick={() => { setNote(""); setEcon({ ...econ, announcement: "" }, false); setMsg("Message cleared."); }}>Clear</button>
        </div>
      </section>

      <Economy teams={teams} econ={econ} setEcon={setEcon} />
      <Regulator teams={teams} econ={econ} setEcon={setEcon} />
      <Competitors teams={teams} save={save} run={runCompetitors} />

      <section className="card mt-6" aria-labelledby="p-h">
        <h2 id="p-h" className="font-semibold">Instructor PIN</h2>
        <p className="max-w-3xl text-sm text-mute">Optional. Asks for a PIN before this page opens, which stops students changing the game on a shared screen. Game data is kept in this browser, so this is a convenience lock, not real security.</p>
        <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); const v = (e.currentTarget.elements.namedItem("newpin") as HTMLInputElement).value.trim(); if (v.length < 4) { setMsg("Use at least 4 digits."); return; } setEcon({ ...econ, pin: hash(v) }, false); e.currentTarget.reset(); setMsg("PIN set."); }}>
          <label className="text-sm font-medium">New PIN
            <input name="newpin" type="password" inputMode="numeric" autoComplete="new-password" className="input mt-1 w-40" />
          </label>
          <button className="btn">Set PIN</button>
          {econ.pin && <button type="button" className="btn btn-danger" onClick={() => { setEcon({ ...econ, pin: undefined }, false); setMsg("PIN removed."); }}>Remove PIN</button>}
        </form>
      </section>
    </div>
  );
}
