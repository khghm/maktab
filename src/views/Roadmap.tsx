import { useMemo, useState } from "react";
import { BRANCHES, FIELDS, LEVELS, totalWeeksOfField } from "../data";
import { READINGS } from "../readings";
import { BANKS } from "../questions";
import { useApp, fa, cx, bookProgress } from "../store";
import { Icon } from "../icons";
import { Reveal, LevelBadge, ProgressBar } from "../ui";

export interface RoadmapProps {
  presetField?: string;
  read: (bookId: string) => void;
  assess: (bookId: string) => void;
}

const totalParas = (id: string) => (READINGS[id] ?? []).reduce((s, c) => s + c.paras.length, 0);

export default function Roadmap({ presetField, read, assess }: RoadmapProps) {
  const { s } = useApp();
  const [fid, setFid] = useState(presetField ?? "falsafa");
  const field = FIELDS.find((f) => f.id === fid) ?? FIELDS[0];

  const progressOf = useMemo(() => {
    return field.books.map((b) => {
      if (s.finished[b.id]) return 1;
      return b.readable ? bookProgress(s, b.id, totalParas(b.id)) : 0;
    });
  }, [field, s]);

  const fieldProg = progressOf.length ? progressOf.reduce((a, b) => a + b, 0) / progressOf.length : 0;
  const weeks = totalWeeksOfField(field);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <Reveal>
        <p className="text-[13px] font-semibold text-gold">نقشهٔ راه مطالعه (Syllabus)</p>
        <h1 className="mt-2 font-display text-4xl text-bone">مسیرِ روشن، گام‌به‌گام</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-7 text-dim">
          برای هر زیرشاخه، ترتیب کتاب‌ها، بازهٔ زمانی پیشنهادی و مباحث کلیدی هر جلد مدون است — تا بی‌سردرگمی بدانید کجای راهید و گام بعد کدام است.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* انتخاب رشته */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 space-y-5">
            {(["islamic", "humanities"] as const).map((br) => (
              <div key={br} className="overflow-hidden rounded-xl border border-line bg-panel">
                <p className="border-b border-line bg-ink2 px-4 py-2.5 text-[12px] font-bold text-gold/90">
                  {BRANCHES[br].name}
                </p>
                <ul>
                  {FIELDS.filter((f) => f.branch === br).map((f) => (
                    <li key={f.id}>
                      <button
                        onClick={() => setFid(f.id)}
                        className={cx(
                          "flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-[13px] font-semibold transition-colors",
                          fid === f.id ? "bg-gold/12 text-goldsoft" : "text-dim hover:bg-panel2 hover:text-bone"
                        )}
                        style={fid === f.id ? { boxShadow: "inset 3px 0 0 #d9a441" } : undefined}
                      >
                        <Icon name={f.icon} size={17} className={fid === f.id ? "text-gold" : "text-faint"} />
                        <span className="flex-1 truncate">{f.title}</span>
                        <span className="text-[11px] text-faint">{fa(f.books.length)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* خط زمانی */}
        <div className="lg:col-span-8 xl:col-span-9">
          <Reveal>
            <div className="rounded-2xl border border-line bg-panel p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
                  <Icon name={field.icon} size={26} />
                </span>
                <div>
                  <h2 className="font-display text-2xl text-bone">{field.title}</h2>
                  <p className="text-[13px] text-dim">{field.tagline}</p>
                </div>
                <div className="mr-auto text-left">
                  <p className="font-display text-3xl leading-none text-goldsoft">{fa(Math.round(fieldProg * 100))}٪</p>
                  <p className="text-[11px] text-faint">پیشرفت رشته</p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar value={fieldProg} color="#d9a441" />
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-[12px] text-faint">
                  <span>مجموع بازهٔ پیشنهادی: <b className="text-dim">{fa(weeks)} هفته</b> مطالعهٔ پیوسته</span>
                  <span>{fa(progressOf.filter((p) => p >= 1).length)} از {fa(field.books.length)} جلد تمام شده</span>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="relative mt-8">
            <span className="absolute bottom-4 right-[22px] top-2 w-px bg-gradient-to-b from-gold/50 via-line2 to-line" />
            <div className="space-y-6">
              {field.books.map((b, i) => {
                const p = progressOf[i];
                const c = LEVELS[b.level];
                const prev = field.books[i - 1];
                const newLevel = !prev || prev.level !== b.level;
                const pre = b.prereq ? field.books.find((x) => x.id === b.prereq) ?? FIELDS.flatMap((f) => f.books).find((x) => x.id === b.prereq) : undefined;
                return (
                  <Reveal key={b.id} delay={i * 70}>
                    {newLevel && (
                      <div className="mb-3 flex items-center gap-3 pr-12">
                        <span
                          className="rounded-full px-3 py-1 text-[12px] font-bold"
                          style={{ color: c.color, background: c.soft, border: `1px solid ${c.color}44` }}
                        >
                          پلهٔ {c.name}
                        </span>
                        <span className="h-px flex-1 bg-line/70" />
                      </div>
                    )}
                    <div className="relative flex gap-4">
                      <span
                        className="relative z-10 mt-6 grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 font-display text-lg"
                        style={{
                          borderColor: c.color,
                          color: p >= 1 ? "#0c1120" : c.color,
                          background: p >= 1 ? c.color : "#10172b",
                          boxShadow: `0 0 0 5px rgba(12,17,32,1)`,
                        }}
                      >
                        {p >= 1 ? <Icon name="check" size={18} /> : fa(i + 1)}
                      </span>
                      <div className="flex-1 rounded-xl border border-line bg-panel p-5 transition-all hover:border-gold/40">
                        <div className="flex flex-wrap items-center gap-2">
                          <LevelBadge level={b.level} size="sm" />
                          <span className="flex items-center gap-1 text-[12px] text-faint"><Icon name="clock" size={13} /> {fa(b.weeks)} هفته</span>
                          <span className="text-[12px] text-faint">{fa(b.pages)} صفحه</span>
                          <span className="mr-auto text-[12px] font-bold" style={{ color: p >= 1 ? "#3fb3a3" : p > 0 ? "#d9a441" : "#5d6890" }}>
                            {p >= 1 ? "تمام شد ✓" : p > 0 ? `${fa(Math.round(p * 100))}٪ خوانده شده` : "پیشِ رو"}
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-xl leading-8 text-bone">{b.title}</h3>
                        <p className="text-[12px] text-dim">{b.author}</p>
                        <div className="mt-3">
                          <p className="text-[11px] font-bold text-faint">مباحث کلیدی این جلد:</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {b.topics.map((t) => (
                              <span key={t} className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ color: c.color, background: c.soft }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        {pre && (
                          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-faint">
                            <Icon name="chain" size={14} className="text-gold/70" />
                            پس از اتمامِ <b className="text-dim">{pre.title}</b>
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {b.readable ? (
                            <button
                              onClick={() => read(b.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-[13px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-goldsoft"
                            >
                              <Icon name="bookOpen" size={15} />
                              {p > 0 && p < 1 ? "ادامهٔ مطالعه" : p >= 1 ? "مرور متن" : "مطالعهٔ متن"}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line2 px-4 py-2 text-[12px] text-faint">
                              <Icon name="note" size={15} />
                              متن کامل در کتابخانهٔ مرجع — گزیدهٔ مطالعاتی به‌زودی
                            </span>
                          )}
                          {BANKS[b.id] && (
                            <button
                              onClick={() => assess(b.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-turq/45 px-4 py-2 text-[13px] font-bold text-turqsoft transition-all hover:bg-turq hover:text-ink"
                            >
                              <Icon name="target" size={15} />
                              آزمون درس
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
