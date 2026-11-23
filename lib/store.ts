"use client";
import { useCallback, useEffect, useState } from "react";
import { ROLES, TEAMS, Team, emptyTeam, autofill, calculateAll, agentImpact, ksfAll, Econ, DEFAULT_ECON, SCENARIOS, POLICIES } from "./sim";

const KEY = "strataSimTeamsV3";
const ECON_KEY = "strataSimEconomy";

export function loadEcon(): Econ {
  try { const e = JSON.parse(localStorage.getItem(ECON_KEY) || "null"); return e && e.scenario in SCENARIOS ? e : DEFAULT_ECON; } catch { return DEFAULT_ECON; }
}

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
  const [econ, setEconState] = useState<Econ>(DEFAULT_ECON);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (Array.isArray(saved) && saved.length === TEAMS) setTeams(saved);
    } catch {}
    setEconState(loadEcon());
    setReady(true);
  }, []);

  const save = useCallback((next: Team[]) => {
    setTeams(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  // Preview the current quarter for all 8 companies (they share one market and one economy).
  const generateAll = useCallback((base: Team[], e: Econ = loadEcon()) => {
    const filled = base.map((t, i) => autofill(t, i));
    const reports = calculateAll(filled, e);
    const ksf = ksfAll(reports);
    const next = filled.map((t, i) => ({ ...t, report: reports[i], ai: agentImpact(filled, i, e), ksf: ksf[i] }));
    save(next);
    return next;
  }, [save]);

  // Lock in the current quarter: closing positions become next quarter's opening positions.
  // Decisions are kept as the starting point for the next quarter.
  const closeQuarter = useCallback((base: Team[]) => {
    const e = loadEcon();
    const done = generateAll(base, e);
    const totalSold = done.reduce((s, t) => s + t.report!.soldU.reduce((a, b) => a + b, 0), 0) || 1;
    const next = done.map((t) => {
      const r = t.report!;
      const q = Number(t.quarter) || 1, y = Number(t.year) || 2026;
      return {
        ...t,
        pos: r.close,
        history: [...(t.history ?? []), {
          label: `Y${y} Q${q}`, revenue: r.revenue, net: r.net, cash: r.cashShown - r.overdraft,
          share: r.soldU.reduce((a, b) => a + b, 0) / totalSold, scenario: SCENARIOS[e.scenario].name, ksf: t.ksf?.overall,
        }],
        quarter: String(q === 4 ? 1 : q + 1),
        year: String(q === 4 ? y + 1 : y),
        report: null,
      };
    });
    // The economy grows (or shrinks) by the scenario's rate; the scenario stays until changed.
    const nextEcon = { ...e, gdp: Math.round(e.gdp * (1 + SCENARIOS[e.scenario].growth) * 10) / 10 };
    setEconState(nextEcon);
    try { localStorage.setItem(ECON_KEY, JSON.stringify(nextEcon)); } catch {}
    return generateAll(next, nextEcon);
  }, [generateAll]);

  // Change the economic scenario; by default every company's results are recalculated under it.
  function setEcon(e: Econ, recalc = true) {
    setEconState(e);
    try { localStorage.setItem(ECON_KEY, JSON.stringify(e)); } catch {}
    if (recalc) { try { const t = JSON.parse(localStorage.getItem(KEY) || "null"); if (Array.isArray(t)) generateAll(t, e); } catch {} }
  }

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

  return { teams, ready, save, generateAll, closeQuarter, runCompetitors, econ, setEcon };
}

// What a competitor agent sees: its own decisions and results, plus what rivals are doing (public market info).
function competitorBrief(teams: Team[], i: number) {
  const t = teams[i], r = t.report!, round = Math.round;
  return {
    company: `Team ${i + 1}`, role: ROLES[i].name, focus: ROLES[i].focus, decisions: t.d,
    economy: economyBrief(),
    results: {
      quarter: `Y${t.year} Q${t.quarter}`, revenue: round(r.revenue), netProfit: round(r.net), cash: round(r.cashShown - r.overdraft),
      overtimeHours: round(r.otHours), regulatorNotices: r.notices, ksfScore: t.ksf?.overall, perProduct: [0, 1, 2].map((p) => ({ product: p + 1, demand: r.demandU[p], delivered: r.u[p], sold: r.soldU[p], unsold: r.unsold[p], lostSales: r.lostSales[p] })),
      history: t.history ?? [],
    },
    market: teams.map((x, k) => k === i || !x.report ? null : {
      company: `Team ${k + 1}`, role: ROLES[k].name, netProfit: round(x.report.net), unitsSold: x.report.soldU.reduce((a, b) => a + b, 0),
      prices: { p1home: x.d.p1home, p1export: x.d.p1export, p2home: x.d.p2home, p2export: x.d.p2export, p3home: x.d.p3home, p3export: x.d.p3export },
    }).filter(Boolean),
  };
}

// Plain summary of the economy for the AI agents.
export function economyBrief() {
  const e = loadEcon(), s = SCENARIOS[e.scenario];
  return { scenario: s.name, meaning: s.desc, gdpIndex: e.gdp, interestRate: `${s.rate * 100}%`, inflation: `${s.inflation * 100}%`, demandVsNormal: `${Math.round((s.demand - 1) * 100)}%`,
    regulatorPoliciesInForce: (e.policies ?? []).map((p) => `${POLICIES[p].name}: ${POLICIES[p].rule}`) };
}
