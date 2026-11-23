import { notFound } from "next/navigation";
import DecisionForm from "@/components/DecisionForm";
import { ROLES, TEAMS } from "@/lib/sim";
import { SECTIONS, SectionId } from "@/lib/sections";

// One real page per company department: /team/2/sales, /team/2/people, …
export const generateStaticParams = () =>
  Array.from({ length: TEAMS }, (_, i) => SECTIONS.filter((s) => s.id !== "dashboard").map((s) => ({ n: String(i + 1), section: s.id }))).flat();

type P = { params: Promise<{ n: string; section: string }> };

export async function generateMetadata({ params }: P) {
  const { n, section } = await params;
  const s = SECTIONS.find((x) => x.id === section);
  return { title: `${s?.name ?? ""} · Team ${n}: ${ROLES[Number(n) - 1]?.name ?? ""} | StrataSim` };
}

export default async function SectionPage({ params }: P) {
  const { n, section } = await params;
  const i = Number(n) - 1;
  if (!(i >= 0 && i < TEAMS) || !SECTIONS.some((s) => s.id === section && s.id !== "dashboard")) notFound();
  return <DecisionForm idx={i} section={section as SectionId} />;
}
