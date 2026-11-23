// StrataSim mark: three rising strata (layers of strategy) inside a rounded tile; the top layer is the win.
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ss-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="ss-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fcd34d" /><stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#ss-bg)" />
      <rect x=".5" y=".5" width="39" height="39" rx="9.5" fill="none" stroke="#fff" strokeOpacity=".35" />
      <path d="M8 29.5 L22 29.5 L25 25.5 L11 25.5 Z" fill="#dbeafe" fillOpacity=".6" />
      <path d="M11 22.5 L26 22.5 L29 18.5 L14 18.5 Z" fill="#dbeafe" fillOpacity=".9" />
      <path d="M14 15.5 L30 15.5 L33 11.5 L17 11.5 Z" fill="url(#ss-top)" />
    </svg>
  );
}

export default function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-brand-dark"}`}>
          Strata<span className="text-amber-300">Sim</span>
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[.18em] ${dark ? "text-blue-200" : "text-mute"}`}>Business Strategy Simulation</span>
      </span>
    </span>
  );
}
