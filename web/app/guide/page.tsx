import Link from "next/link";

export const metadata = { title: "Guide | Topaz-Vbe" };

export default function Guide() {
  return (
    <div className="wrap max-w-3xl py-12 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand-dark [&_p]:mt-3 [&_p]:leading-7 [&_p]:text-slate-700">
      <h1 className="text-3xl font-bold text-brand-dark">How the simulation works</h1>
      <p>Eight competing companies market three products (P1, P2, P3) in Export, South, West and North. Each company is run by a strategist role. Teams enter quarterly decisions; the site produces management accounts and a league table.</p>
      <h2>Running a class</h2>
      <p>1. Assign each team its company from the <strong>Teams</strong> menu. 2. Every form starts pre-filled from the team&apos;s role. 3. Teams change the decisions they disagree with. 4. Open <strong>Reports</strong> to compare all eight companies.</p>
      <h2>The business environment</h2>
      <p>Demand responds to price, advertising, trade press, merchandising, sales coverage and product improvement. Machine hours and assembly minutes constrain output; overtime is charged when worker hours fall short. Cash is constrained by debtors, creditors, capital spending and dividends.</p>
      <h2>Account identities</h2>
      <p>Revenue = units × regional price. Cost of sales = materials + direct labour + production overheads. Gross profit = revenue − cost of sales. Net profit is after selling costs, administration, interest and tax.</p>
      <h2>FAQs</h2>
      <p><strong>Where is data stored?</strong> In this browser (localStorage). Use one device for the class, or print reports to PDF.</p>
      <p><strong>Is this the official Topaz engine?</strong> No — it is an educational estimate built from the decision inputs.</p>
      <p><Link href="/team/1" className="btn btn-primary mt-4">Open Team 1</Link></p>
    </div>
  );
}
