"use client";
import Link from "next/link";
import { useEffect } from "react";
import { ROLES, gbp } from "@/lib/sim";
import { useTeams } from "@/lib/store";
import RoleIcon from "./RoleIcon";

const MEDAL = ["bg-amber-400 text-amber-950", "bg-slate-300 text-slate-800", "bg-orange-300 text-orange-950"];

export default function LeaguePreview() {
  const { teams, ready, generateAll } = useTeams();
  useEffect(() => { if (ready && teams.some((t) => !t.report)) generateAll(teams); }, [ready, teams, generateAll]);
  const top = ready && teams.every((t) => t.report)
    ? teams.map((t, i) => ({ i, net: t.report!.net })).sort((a, b) => b.net - a.net).slice(0, 3) : [];

  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Live league — top 3</p>
        <span className="flex items-center gap-1.5 text-xs text-emerald-200"><span className="size-2 rounded-full bg-emerald-400" />Updated</span>
      </div>
      <ol className="mt-4 grid gap-2">
        {(top.length ? top : [0, 1, 2].map((i) => ({ i, net: NaN }))).map(({ i, net }, k) => (
          <li key={k} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-ink">
            <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${MEDAL[k]}`}>{k + 1}</span>
            <RoleIcon i={i} size="size-9" />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-sm font-semibold">Team {i + 1}</span>
              <span className="block truncate text-xs text-mute">{ROLES[i].name}</span>
            </span>
            <span className="text-right text-sm font-bold tabular-nums text-emerald-700">{Number.isNaN(net) ? "…" : gbp(net)}</span>
          </li>
        ))}
      </ol>
      <Link href="/reports" className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-white/15 text-sm font-semibold text-white hover:bg-white/25">See all 8 companies →</Link>
    </div>
  );
}
