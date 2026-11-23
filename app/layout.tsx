import { LogoMark } from "@/components/Logo";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Header from "@/components/Header";
import Advisor from "@/components/Advisor";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StrataSim | Business Strategy Simulation",
  description: "Eight competing companies, eight strategist roles, quarterly decisions and management reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} flex min-h-dvh flex-col font-sans antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">Skip to content</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <footer className="bg-ink pb-24 pt-8 text-sm text-slate-300">
          <div className="wrap flex flex-wrap justify-between gap-4">
            <p className="flex items-center gap-2"><LogoMark className="size-6" /> StrataSim — business strategy simulation for 8 companies.</p>
            <nav className="flex gap-4">
              <Link className="hover:text-white" href="/guide">Guide</Link>
              <Link className="hover:text-white" href="/team/1">Decisions</Link>
              <Link className="hover:text-white" href="/reports">Reports</Link>
            </nav>
          </div>
        </footer>
        <Advisor />
      </body>
    </html>
  );
}
