"use client";
import { useIndustry } from "@/lib/useIndustry";
import Link from "next/link";
import { useEffect } from "react";
import { ROLES, gbp } from "@/lib/sim";
import { useTeams } from "@/lib/store";
import RoleIcon from "./RoleIcon";

const MEDAL = ["bg-brand text-white", "bg-stone-200 text-ink", "bg-stone-200 text-ink"];

export default function LeaguePreview() {
  const { company } = useIndustry();
  const { teams, ready, generateAll } = useTeams();
  useEffect(() => { if (ready && teams.some((t) => !t.report)) generateAll(teams); }, [ready, teams, generateAll]);
  const top = ready && teams.every((t) => t.report)
    ? teams.map((t, i) => ({ i, net: t.report!.net })).sort((a, b) => b.net - a.net).slice(0, 3) : [];

  return (
    <div className="rounded-md border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Live league — top 3</p>
        <span className="flex items-center gap-1.5 text-xs text-mute"><span className="size-2 rounded-full bg-brand" />Updated</span>
      </div>
      <ol className="mt-4 grid gap-2">
        {(top.length ? top : [0, 1, 2].map((i) => ({ i, net: NaN }))).map(({ i, net }, k) => (
          <li key={k} className="flex items-center gap-3 rounded-md border border-line bg-white p-3 text-ink">
            <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${MEDAL[k]}`}>{k + 1}</span>
            <RoleIcon i={i} size="size-9" />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-semibold">{company(i)}</span>
              <span className="block truncate text-xs text-mute">Team {i + 1} · {ROLES[i].name}</span>
            </span>
            <span className="text-right text-sm font-bold tabular-nums text-brand">{Number.isNaN(net) ? "…" : gbp(net)}</span>
          </li>
        ))}
      </ol>
      <Link href="/reports" className="mt-4 flex min-h-11 items-center justify-center rounded-md border border-line bg-white text-sm font-semibold text-brand hover:bg-stone-50">See all 8 companies →</Link>
    </div>
  );
}
