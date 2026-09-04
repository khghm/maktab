import { useEffect, useRef, useState, ReactNode } from "react";
import { LEVELS, Level } from "./data";
import { cx, fa } from "./store";

/* ---------- scroll reveal ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (setInView(true), io.disconnect())),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cx("rv", inView && "rv-in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- count up ---------- */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 900;
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {fa(n)}
    </span>
  );
}

/* ---------- section head ---------- */
export function SectionHead({
  kicker,
  title,
  desc,
  center,
}: {
  kicker: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={cx("max-w-2xl", center && "mx-auto text-center")}>
      <div className={cx("flex items-center gap-3", center && "justify-center")}>
        <span className="h-px w-8 bg-gold/70" />
        <span className="text-[13px] font-semibold tracking-wide text-gold">{kicker}</span>
        <span className="h-px w-8 bg-gold/70" />
      </div>
      <h2 className="mt-3 font-display text-3xl leading-[1.25] text-bone md:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-[15px] leading-8 text-dim">{desc}</p>}
    </div>
  );
}

/* ---------- level badge ---------- */
export function LevelBadge({ level, size = "md" }: { level: Level; size?: "sm" | "md" }) {
  const m = LEVELS[level];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      )}
      style={{ color: m.color, background: m.soft, border: `1px solid ${m.color}44` }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.name}
    </span>
  );
}

/* ---------- progress bar ---------- */
export function ProgressBar({
  value,
  color = "#d9a441",
  className = "",
  thin,
}: {
  value: number;
  color?: string;
  className?: string;
  thin?: boolean;
}) {
  return (
    <div className={cx("overflow-hidden rounded-full bg-line/60", thin ? "h-1.5" : "h-2", className)}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.round(value * 100)}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

/* ---------- ornament divider ---------- */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={cx("flex items-center justify-center gap-3 text-gold/70", className)}>
      <span className="h-px w-16 bg-gradient-to-l from-gold/60 to-transparent" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2.5l2.2 6 6 2.2-6 2.2-2.2 6-2.2-6-6-2.2 6-2.2z" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
    </div>
  );
}
