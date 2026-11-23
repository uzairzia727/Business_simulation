import Typewriter from "@/components/Typewriter";
import Link from "next/link";

export const metadata = { title: "Guide | StrataSim" };

export default function Guide() {
  return (
    <div className="wrap max-w-3xl py-12 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand-dark [&_p]:mt-3 [&_p]:leading-7 [&_p]:text-slate-700">
      <h1 className="text-3xl font-bold text-brand-dark"><Typewriter text="How the simulation works" speed={35} /></h1>
      <p>Eight competing companies market three products (P1, P2, P3) in Export, South, West and North. Each company is run by a strategist role. Teams enter quarterly decisions; the site produces management accounts and a league table.</p>
      <h2>Getting started</h2>
      <p>1. Assign each team its company from the <strong>Teams</strong> menu. 2. Every form starts pre-filled from the team&apos;s role. 3. Teams change the decisions they disagree with. 4. Open <strong>Reports</strong> to compare all eight companies.</p>
      <h2>The business environment</h2>
      <p><strong>All eight companies share one market.</strong> Customer demand for each product in each region is split between companies by how attractive their offer is: lower price, more marketing, more salespeople in that region, product improvements, research and longer credit all win share. You sell the smaller of what you deliver and what customers want — deliver too little and you lose sales; deliver too much and the rest sits in stock.</p>
      <p><strong>The simulation runs over several quarters.</strong> When everyone is ready, use <strong>Close quarter &amp; start next</strong> on the League table. Each company then starts the next quarter from its closing position: cash, debts, machines, staff, material and unsold stock. Brand strength builds up from marketing, and product quality builds up from research, so investments keep paying back in later quarters. The league ranks companies by total profit across all quarters.</p>
      <p><strong>AI agents.</strong> Each company can switch on up to eight AI agents (market intelligence, sales, demand forecasting, pricing, customer success, procurement, production scheduling and finance). Each one costs Rs 12,000 per quarter and improves one part of the business. The report compares the same quarter with and without your agents, against the same rivals, and shows how much each agent earns back. Some agents only pay off in certain situations.</p>
      <p><strong>AI competitors.</strong> On the League table, any company can be switched from Human to AI. Click <strong>Let AI competitors decide</strong> and each AI-run company reads its own results and its rivals&apos; prices, then sets its next decisions in line with its strategist role. Its reasoning is shown on the League table and on its team page. The simulation engine, not the AI, still calculates every result. With the free AI service a full round takes about two minutes, because of its per-minute limit.</p>
      <p><strong>Economic scenarios.</strong> The organiser sets the economy for each quarter on the League table: stable, boom, recession, high inflation or an interest rate shock. It changes total demand, how price-sensitive customers are, material and wage costs, and the overdraft interest rate for every company. The economic report shows the indicators and how the whole industry performed.</p>
      <p><strong>The regulator.</strong> The Industry Regulatory Authority can put policies in force at any time: a price cap, a minimum wage, an advertising limit, quality standards, a tax rise, import duty, a fair payment rule or an export incentive. Caps and floors are applied automatically, advertising above the limit is fined, and products below the quality standard lose customers. Each team page lists the policies in force and how they affected that company, so teams can change their decisions to comply.</p>
      <p>Demand responds to price, advertising, trade press, merchandising, sales coverage and product improvement. Machine hours and assembly minutes constrain output; overtime is charged when worker hours fall short. Cash is constrained by debtors, creditors, capital spending and dividends.</p>
      <h2>Account identities</h2>
      <p>Revenue = units × regional price. Cost of sales = materials + direct labour + production overheads. Gross profit = revenue − cost of sales. Net profit is after selling costs, administration, interest and tax.</p>
      <h2>FAQs</h2>
      <p><strong>Where is data stored?</strong> In this browser (localStorage). Use a single device for the session, or export reports to PDF.</p>
      <p><strong>Is this a commercial simulation engine?</strong> No — it is a simulated estimate built from the decision inputs.</p>
      <p><Link href="/team/1" className="btn btn-primary mt-4">Open Team 1</Link></p>
    </div>
  );
}
