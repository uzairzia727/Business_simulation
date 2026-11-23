"use client";
import { useEffect, useState } from "react";
import { industryOf, term } from "./industry";

// Current industry for display components; updates when the organiser changes it.
export function useIndustry() {
  const [id, setId] = useState<string>("manufacturing");
  useEffect(() => {
    const read = () => { try { setId(JSON.parse(localStorage.getItem("strataSimEconomy") || "{}").industry ?? "manufacturing"); } catch {} };
    read();
    window.addEventListener("strata-econ", read);
    return () => window.removeEventListener("strata-econ", read);
  }, []);
  return { id, ind: industryOf(id), t: (s: string) => term(s, id) };
}
