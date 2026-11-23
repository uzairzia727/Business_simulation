// StrataSim mark: three rising strata (layers of strategy) inside a rounded tile; the top layer is the win.
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ss-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f6b52" /><stop offset="1" stopColor="#1f4d3a" />
        </linearGradient>
        <linearGradient id="ss-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d9e8df" />
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

// caption: the small line under the name (e.g. the industry); defaults to the product tagline.
export default function Logo({ dark = true, caption = "Strategy simulation" }: { dark?: boolean; caption?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="min-w-0 leading-tight">
        <span className={`block font-serif text-lg font-semibold ${dark ? "text-white" : "text-brand-dark"}`}>
          Strata<span className="text-[#a9c8b8]">Sim</span>
        </span>
        <span className={`block truncate whitespace-nowrap text-xs ${dark ? "text-stone-400" : "text-mute"}`}>{caption}</span>
      </span>
    </span>
  );
}
