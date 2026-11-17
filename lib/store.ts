"use client";
import { useCallback, useEffect, useState } from "react";
import { ROLES, TEAMS, Team, emptyTeam, autofill, calculateAll, agentImpact } from "./sim";

const KEY = "strataSimTeamsV3";

// Fresh read of saved data, for components that live across pages (e.g. the floating Advisor).
export function loadTeams(): Team[] | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    return Array.isArray(saved) && saved.length === TEAMS ? saved : null;
  } catch { return null; }
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>(() => Array.from({ length: TEAMS }, emptyTeam));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (Array.isArray(saved) && saved.length === TEAMS) setTeams(saved);
    } catch {}
    setReady(true);
  }, []);

  const save = useCallback((next: Team[]) => {
    setTeams(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  // Preview the current quarter for all 8 companies (they share one market).
  const generateAll = useCallback((base: Team[]) => {
    const filled = base.map((t, i) => autofill(t, i));
    const reports = calculateAll(filled);
    const next = filled.map((t, i) => ({ ...t, report: reports[i], ai: agentImpact(filled, i) }));
    save(next);
    return next;
  }, [save]);

  // Lock in the current quarter: closing positions become next quarter's opening positions.
  // Decisions are kept as the starting point for the next quarter.
  const closeQuarter = useCallback((base: Team[]) => {
    const done = generateAll(base);
    const totalSold = done.reduce((s, t) => s + t.report!.soldU.reduce((a, b) => a + b, 0), 0) || 1;
    const next = done.map((t) => {
      const r = t.report!;
      const q = Number(t.quarter) || 1, y = Number(t.year) || 2026;
      return {
        ...t,
        pos: r.close,
        history: [...(t.history ?? []), {
          label: `Y${y} Q${q}`, revenue: r.revenue, net: r.net, cash: r.cashShown - r.overdraft,
          share: r.soldU.reduce((a, b) => a + b, 0) / totalSold,
        }],
        quarter: String(q === 4 ? 1 : q + 1),
        year: String(q === 4 ? y + 1 : y),
        report: null,
      };
    });
    return generateAll(next);
  }, [generateAll]);

  // Competitor agents: every AI-run company asks the AI for next quarter's decisions, then the market is recalculated.
  const runCompetitors = useCallback(async (base: Team[], onProgress: (msg: string) => void) => {
    const current = base.some((t) => !t.report) ? generateAll(base) : base;
    const next = [...current];
    const errors: string[] = [];
    for (let i = 0; i < next.length; i++) {
      if (!next[i].aiRun) continue;
      try {
        let res: Response, data;
        // On the free tier's per-minute limit, wait as told and retry (up to 3 times).
        for (let attempt = 0; ; attempt++) {
          onProgress(`Team ${i + 1} (${ROLES[i].name}) is deciding…`);
          res = await fetch("/api/competitor", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(competitorBrief(next, i)),
          });
          data = await res.json();
          if (res.status !== 429 || attempt === 3) break;
          for (let s = data.retryAfter ?? 20; s > 0; s--) {
            onProgress(`Free AI limit reached — waiting ${s}s before Team ${i + 1} decides…`);
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
        if (!res.ok) { errors.push(`Team ${i + 1}: ${data.error}`); if (res.status === 503) break; continue; }
        next[i] = { ...next[i], d: { ...next[i].d, ...data.decisions }, aiNote: data.reasoning, touched: true };
      } catch { errors.push(`Team ${i + 1}: could not reach the AI.`); }
    }
    generateAll(next);
    return errors;
  }, [generateAll]);

  return { teams, ready, save, generateAll, closeQuarter, runCompetitors };
}

// What a competitor agent sees: its own decisions and results, plus what rivals are doing (public market info).
function competitorBrief(teams: Team[], i: number) {
  const t = teams[i], r = t.report!, round = Math.round;
  return {
    company: `Team ${i + 1}`, role: ROLES[i].name, focus: ROLES[i].focus, decisions: t.d,
    results: {
      quarter: `Y${t.year} Q${t.quarter}`, revenue: round(r.revenue), netProfit: round(r.net), cash: round(r.cashShown - r.overdraft),
      overtimeHours: round(r.otHours), perProduct: [0, 1, 2].map((p) => ({ product: p + 1, demand: r.demandU[p], delivered: r.u[p], sold: r.soldU[p], unsold: r.unsold[p], lostSales: r.lostSales[p] })),
      history: t.history ?? [],
    },
    market: teams.map((x, k) => k === i || !x.report ? null : {
      company: `Team ${k + 1}`, role: ROLES[k].name, netProfit: round(x.report.net), unitsSold: x.report.soldU.reduce((a, b) => a + b, 0),
      prices: { p1home: x.d.p1home, p1export: x.d.p1export, p2home: x.d.p2home, p2export: x.d.p2export, p3home: x.d.p3home, p3export: x.d.p3export },
    }).filter(Boolean),
  };
}
