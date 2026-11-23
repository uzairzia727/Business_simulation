"use client";
import { useEffect, useRef, useState } from "react";

// "Robot is writing" effect: text types itself in with a blinking cursor when it scrolls into view.
// Full text stays in the DOM (invisible) so the layout never jumps and screen readers read it at once.
// Reduced-motion users get the text instantly.
export default function Typewriter({ text, speed = 28, className = "" }: { text: string; speed?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(text.length); return; }
    setN(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = setInterval(() => setN((k) => { if (k >= text.length) { clearInterval(timer); return k; } return k + 1; }), speed);
    });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); };
  }, [text, speed]);

  const done = n >= text.length;
  return (
    <span ref={ref} className={`grid ${className}`}>
      <span className="invisible col-start-1 row-start-1">{text}</span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {text.slice(0, n)}
        <span className={`type-cursor ${done ? "type-cursor-done" : ""}`} />
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

// Small robot that "writes" while the AI is working.
export function RobotWriting({ label = "AI is writing" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-mute">
      <svg className="robot-bob size-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16h5" /><circle cx="12" cy="3.5" r="1" />
      </svg>
      {label}<span className="type-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>
    </span>
  );
}
