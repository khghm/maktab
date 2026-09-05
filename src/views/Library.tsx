import { useMemo, useState } from "react";
import { BRANCHES, FIELDS, LEVELS, Level, Book } from "../data";
import { READINGS } from "../readings";
import { BANKS } from "../questions";
import { useApp, fa, cx, bookProgress } from "../store";
import { Icon } from "../icons";
import { Reveal, LevelBadge, ProgressBar } from "../ui";

export interface LibraryProps {
  read: (bookId: string) => void;
  roadmapField: (field: string) => void;
  assess: (bookId: string) => void;
  presetBranch?: string;
  presetField?: string;
}

const totalParas = (id: string) => (READINGS[id] ?? []).reduce((s, c) => s + c.paras.length, 0);

export default function Library({ read, roadmapField, assess, presetBranch, presetField }: LibraryProps) {
  const { s } = useApp();
  const [branch, setBranch] = useState<string>(presetBranch ?? "all");
  const [field, setField] = useState<string>(presetField ?? "all");
  const [level, setLevel] = useState<Level | 0>(0);
  const [q, setQ] = useState("");

  const fields = useMemo(
    () => FIELDS.filter((f) => (branch === "all" || f.branch === branch) && (field === "all" || f.id === field)),
    [branch, field]
  );

  const books = useMemo(() => {
    const term = q.trim();
    return fields.flatMap((f) =>
      f.books
        .filter((b) => level === 0 || b.level === level)
        .filter((b) => !term || (b.title + b.author + b.topics.join(" ")).includes(term))
        .map((b) => ({ b, f }))
    );
  }, [fields, level, q]);

  const statusOf = (b: Book) => {
    if (s.finished[b.id]) return { label: "تمام‌شده", color: "#3fb3a3" };
    const p = b.readable ? bookProgress(s, b.id, totalParas(b.id)) : 0;
    if (p > 0) return { label: "در حال مطالعه", color: "#d9a441" };
    return { label: "ناخوانده", color: "#5d6890" };
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-gold">کتابخانهٔ جامع و سلسله‌مراتبی</p>
            <h1 className="mt-2 font-display text-4xl text-bone">قفسه‌های مکتب‌خانه</h1>
            <p className="mt-2 text-[14px] text-dim">
              {fa(books.length)} اثر در {fa(fields.length)} زیرشاخه — هر کتاب با سطح، بازهٔ زمانی و مباحث کلیدی.
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <Icon name="search" size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جست‌وجوی کتاب، مؤلف یا مبحث…"
              className="w-full rounded-lg border border-line bg-panel py-2.5 pr-10 pl-3 text-sm text-bone outline-none transition-colors placeholder:text-faint focus:border-gold/60"
            />
          </label>
        </div>
      </Reveal>

      {/* فیلترها */}
      <Reveal delay={80}>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {[{ id: "all", name: "هر دو شاخه" }, { id: "islamic", name: BRANCHES.islamic.name }, { id: "humanities", name: BRANCHES.humanities.name }].map(
            (b) => (
              <button
                key={b.id}
                onClick={() => { setBranch(b.id); setField("all"); }}
                className={cx(
                  "rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-all",
                  branch === b.id ? "border-gold bg-gold/15 text-goldsoft" : "border-line text-dim hover:border-gold/40 hover:text-bone"
                )}
              >
                {b.name}
              </button>
            )
          )}
          <span className="mx-2 hidden h-5 w-px bg-line2 sm:block" />
          {([0, 1, 2, 3, 4] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={cx(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all",
                level === l ? "text-ink" : "text-dim hover:text-bone"
              )}
              style={level === l ? { background: l === 0 ? "#94a0c2" : LEVELS[l].color, borderColor: "transparent" } : { borderColor: "#27315a" }}
            >
              {l === 0 ? "همهٔ سطوح" : LEVELS[l].name}
            </button>
          ))}
        </div>
      </Reveal>

      {/* فهرست */}
      <div className="mt-10 space-y-12">
        {fields.map((f, fi) => {
          const fb = books.filter((x) => x.f.id === f.id);
          if (!fb.length) return null;
          return (
            <section key={f.id}>
              <Reveal>
                <div className="flex flex-wrap items-center gap-3 border-b border-line pb-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-turq/40 bg-turq/10 text-turq">
                    <Icon name={f.icon} size={21} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl text-bone">{f.title}</h2>
                    <p className="text-[12px] text-faint">{f.tagline}</p>
                  </div>
                  <button
                    onClick={() => roadmapField(f.id)}
                    className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-dim transition-colors hover:border-gold/50 hover:text-goldsoft"
                  >
                    <Icon name="route" size={15} />
                    سرفصل این رشته
                  </button>
                </div>
              </Reveal>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fb.map(({ b }, bi) => {
                  const st = statusOf(b);
                  const p = b.readable ? bookProgress(s, b.id, totalParas(b.id)) : 0;
                  const pre = b.prereq ? FIELDS.flatMap((x) => x.books).find((x) => x.id === b.prereq) : undefined;
                  return (
                    <Reveal key={b.id} delay={Math.min(bi * 60, 300)}>
                      <article className="group flex h-full flex-col rounded-xl border border-line bg-panel p-5 transition-all hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]">
                        <div className="flex items-start justify-between gap-2">
                          <LevelBadge level={b.level} size="sm" />
                          <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: st.color }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} />
                            {st.label}
                          </span>
                        </div>
                        <h3 className="mt-3 font-display text-xl leading-8 text-bone transition-colors group-hover:text-goldsoft">{b.title}</h3>
                        <p className="mt-0.5 text-[12px] text-dim">{b.author}</p>
                        <p className="mt-3 flex-1 text-[13px] leading-6 text-dim">{b.desc}</p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {b.topics.map((t) => (
                            <span key={t} className="rounded-md bg-ink2 px-2 py-0.5 text-[11px] text-dim">{t}</span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center gap-4 border-t border-line/70 pt-3 text-[12px] text-faint">
                          <span className="flex items-center gap-1"><Icon name="clock" size={14} /> {fa(b.weeks)} هفته</span>
                          <span>{fa(b.pages)} صفحه</span>
                          {BANKS[b.id] && (
                            <span className="flex items-center gap-1 text-turq"><Icon name="target" size={14} /> {fa(BANKS[b.id].length)} سوال</span>
                          )}
                        </div>
                        {pre && (
                          <p className="mt-2 text-[11px] text-faint">پیش‌نیاز: <span className="text-dim">{pre.title}</span></p>
                        )}
                        {b.readable && p > 0 && <ProgressBar value={p} color={LEVELS[b.level].color} thin className="mt-3" />}

                        <div className="mt-4 flex gap-2">
                          {b.readable ? (
                            <button
                              onClick={() => read(b.id)}
                              className="flex-1 rounded-lg bg-gold/15 border border-gold/40 py-2 text-[13px] font-bold text-goldsoft transition-all hover:bg-gold hover:text-ink"
                            >
                              {p > 0 ? "ادامهٔ مطالعه" : "مطالعهٔ متن"}
                            </button>
                          ) : (
                            <button
                              onClick={() => roadmapField(f.id)}
                              className="flex-1 rounded-lg border border-line py-2 text-[13px] font-semibold text-dim transition-colors hover:border-gold/40 hover:text-goldsoft"
                            >
                              در سرفصل رشته
                            </button>
                          )}
                          {BANKS[b.id] && (
                            <button
                              onClick={() => assess(b.id)}
                              className="rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-dim transition-colors hover:border-turq/60 hover:text-turqsoft"
                              title="آزمون درک مطلب"
                            >
                              <Icon name="target" size={16} />
                            </button>
                          )}
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          );
        })}
        {!books.length && (
          <div className="rounded-xl border border-dashed border-line2 p-12 text-center">
            <Icon name="search" size={30} className="mx-auto text-faint" />
            <p className="mt-3 font-bold text-bone">اثری با این مشخصات یافت نشد</p>
            <p className="mt-1 text-[13px] text-dim">فیلترها را ساده‌تر کنید یا عبارت دیگری بیازمایید.</p>
          </div>
        )}
      </div>
    </div>
  );
}
