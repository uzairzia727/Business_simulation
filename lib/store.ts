"use client";
import { useCallback, useEffect, useState } from "react";
import { TEAMS, Team, emptyTeam, autofill, calculateAll } from "./sim";

const KEY = "strataSimTeamsV3";

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
    const next = filled.map((t, i) => ({ ...t, report: reports[i] }));
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

  return { teams, ready, save, generateAll, closeQuarter };
}
