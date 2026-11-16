import { notFound } from "next/navigation";
import DecisionForm from "@/components/DecisionForm";
import { ROLES, TEAMS } from "@/lib/sim";

export const generateStaticParams = () => Array.from({ length: TEAMS }, (_, i) => ({ n: String(i + 1) }));

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  return { title: `Team ${n}: ${ROLES[Number(n) - 1]?.name ?? ""} | Topaz-Vbe` };
}

export default async function TeamPage({ params }: { params: Promise<{ n: string }> }) {
  const i = Number((await params).n) - 1;
  if (!(i >= 0 && i < TEAMS)) notFound();
  return <DecisionForm idx={i} />;
}
