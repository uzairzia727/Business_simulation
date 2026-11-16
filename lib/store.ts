"use client";
import { useCallback, useEffect, useState } from "react";
import { TEAMS, Team, emptyTeam, autofill, calculate } from "./sim";

const KEY = "topazNextTeamsV1";

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

  const generateAll = useCallback((base: Team[]) => {
    const next = base.map((t, i) => { const f = autofill(t, i); return { ...f, report: calculate(f.d, f.quarter) }; });
    save(next);
    return next;
  }, [save]);

  return { teams, ready, save, generateAll };
}
