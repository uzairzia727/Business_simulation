import { Suspense } from "react";
import Reports from "@/components/Reports";

export const metadata = { title: "Reports & league table | Topaz-Vbe" };

export default function Page() {
  return <Suspense fallback={<div className="wrap py-12 text-mute">Loading…</div>}><Reports /></Suspense>;
}
