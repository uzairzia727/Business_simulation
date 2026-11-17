import { Suspense } from "react";
import Reports from "@/components/Reports";

export const metadata = { title: "League table | StrataSim" };

export default function Page() {
  return <Suspense fallback={<div className="wrap py-12 text-mute">Loading…</div>}><Reports /></Suspense>;
}
