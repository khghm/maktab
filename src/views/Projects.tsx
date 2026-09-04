import { useState } from "react";
import { PROJECTS, Project, LEVELS } from "../data";
import { useApp, fa, cx, wordCount, faDate } from "../store";
import { Icon } from "../icons";
import { Reveal, LevelBadge, ProgressBar, SectionHead, Ornament } from "../ui";

export default function Projects() {
  const { s, saveProject, addEvent } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [rubricOpen, setRubricOpen] = useState<string | null>(null);
  const [rubric, setRubric] = useState<number[]>([0, 0, 0, 0]);

  const st = (pid: string) => s.projects[pid];

  const update = (pid: string, patch: Partial<ReturnType<typeof st>>) => {
    const cur = st(pid) ?? { draft: "", checklist: {} };
    saveProject(pid, { ...cur, ...patch });
  };

  const submitRubric = (p: Project) => {
    const score = rubric.reduce((a, b) => a + b, 0);
    const cur = st(p.id) ?? { draft: "", checklist: {} };
    saveProject(p.id, { ...cur, rubric: [...rubric], score, submittedAt: Date.now() });
    if (score >= 70) addEvent(50, `گواهی مهارت سطح ${LEVELS[p.level].name}`);
    else addEvent(5, "ثبت پژوهش برای بازبینی");
    setRubricOpen(null);
  };

  const earned = PROJECTS.filter((p) => (st(p.id)?.score ?? 0) >= 70 && st(p.id)?.submittedAt);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <SectionHead
        kicker="پروژه‌های پایانی تحقیقاتی"
        title="بنویسید؛ نوشتن، عیارِ خواندن است"
        desc="در پایان هر مقطع، یک اثر پژوهشیِ متن‌محور — مقالهٔ تحلیلی یا گزارش مطالعهٔ تطبیقی دو متن. ارزیابی با معیارهای روشن انجام می‌شود و در صورت کسب حد نصاب، گواهی مهارت همان سطح صادر می‌گردد."
      />

      <div className="mt-10 space-y-5">
        {PROJECTS.map((p, i) => {
          const cur = st(p.id);
          const wc = wordCount(cur?.draft ?? "");
          const done = (cur?.score ?? 0) >= 70 && !!cur?.submittedAt;
          const failed = !!cur?.submittedAt && (cur?.score ?? 0) < 70;
          const isOpen = open === p.id;
          const c = LEVELS[p.level];
          return (
            <Reveal key={p.id} delay={Math.min(i * 70, 280)}>
              <article className="overflow-hidden rounded-2xl border bg-panel transition-colors" style={{ borderColor: done ? "#3fb3a366" : "#27315a" }}>
                <button onClick={() => setOpen(isOpen ? null : p.id)} className="flex w-full flex-wrap items-center gap-3 px-6 py-5 text-right">
                  <LevelBadge level={p.level} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl leading-8 text-bone">{p.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-6 text-dim">{p.desc}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {done && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-turq/15 px-2.5 py-1 text-[11px] font-bold text-turqsoft">
                        <Icon name="seal" size={13} /> گواهی صادر شد
                      </span>
                    )}
                    {failed && !done && (
                      <span className="rounded-full bg-lal/15 px-2.5 py-1 text-[11px] font-bold text-lal">نیازمند بازنویسی — نمرهٔ {fa(cur?.score ?? 0)}</span>
                    )}
                    {!cur?.submittedAt && (
                      <span className="text-[11px] text-faint">حداقل {fa(p.minWords)} واژه · ≈ {fa(p.hours)} ساعت کار</span>
                    )}
                    <Icon name="chev" size={17} className={cx("text-faint transition-transform", isOpen ? "rotate-90" : "-rotate-90")} />
                  </div>
                </button>

                {isOpen && (
                  <div className="grid gap-6 border-t border-line px-6 py-6 lg:grid-cols-12">
                    {/* ویرایشگر */}
                    <div className="lg:col-span-8">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold text-bone">پیش‌نویس شما <span className="mr-2 text-[11px] font-normal text-faint">(به‌طور خودکار ذخیره می‌شود)</span></p>
                        <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", wc >= p.minWords ? "bg-turq/15 text-turqsoft" : "bg-gold/15 text-goldsoft")}>
                          {fa(wc)} از {fa(p.minWords)} واژه
                        </span>
                      </div>
                      <ProgressBar value={Math.min(1, wc / p.minWords)} color={wc >= p.minWords ? "#3fb3a3" : "#d9a441"} thin className="mt-2" />
                      <textarea
                        value={cur?.draft ?? ""}
                        onChange={(e) => update(p.id, { draft: e.target.value })}
                        placeholder={"طرح مسئله را بنویسید؛ سپس تقریر دیدگاه متون، تحلیل تطبیقی و سرانجام نتیجه‌گیری…\nهر جا به متنی که خوانده‌اید استناد می‌کنید، نشانی فصل و بند را بیاورید."}
                        className="mt-3 h-72 w-full resize-y rounded-xl border border-line bg-ink2 p-4 font-read text-[19px] leading-[1.9] text-bone outline-none transition-colors focus:border-gold/60"
                      />
                    </div>
                    {/* ساختار و داوری */}
                    <div className="lg:col-span-4">
                      <p className="text-[13px] font-bold text-bone">ساختار پژوهش</p>
                      <ul className="mt-2 space-y-1.5">
                        {p.checklist.map((item) => {
                          const on = !!cur?.checklist?.[item];
                          return (
                            <li key={item}>
                              <button
                                onClick={() => update(p.id, { checklist: { ...cur?.checklist, [item]: !on } })}
                                className={cx(
                                  "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-right text-[13px] transition-all",
                                  on ? "border-turq/50 bg-turq/10 text-turqsoft" : "border-line text-dim hover:border-line2"
                                )}
                              >
                                <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded border", on ? "border-turq bg-turq text-ink" : "border-line2")}>
                                  {on && <Icon name="check" size={12} />}
                                </span>
                                {item}
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      {rubricOpen === p.id ? (
                        <div className="mt-4 rounded-xl border border-gold/35 bg-ink2 p-4">
                          <p className="text-[12px] font-bold text-goldsoft">ارزیابی بر اساس معیارها (هر مورد تا ۲۵ امتیاز)</p>
                          {p.rubric.map((r, ri) => (
                            <div key={r} className="mt-3">
                              <div className="flex justify-between text-[12px]">
                                <span className="text-dim">{r}</span>
                                <span className="font-bold text-goldsoft">{fa(rubric[ri])}</span>
                              </div>
                              <input
                                type="range" min={0} max={25} value={rubric[ri]}
                                onChange={(e) => setRubric((rv) => rv.map((x, xi) => (xi === ri ? +e.target.value : x)))}
                                className="mt-1 w-full"
                              />
                            </div>
                          ))}
                          <p className="mt-3 text-center text-[13px] font-bold text-bone">
                            مجموع: <span className={rubric.reduce((a, b) => a + b, 0) >= 70 ? "text-turqsoft" : "text-lal"}>{fa(rubric.reduce((a, b) => a + b, 0))}</span> از ۱۰۰
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => submitRubric(p)} className="flex-1 rounded-lg bg-gold py-2 text-[13px] font-bold text-ink hover:bg-goldsoft">
                              ثبت داوری نهایی
                            </button>
                            <button onClick={() => setRubricOpen(null)} className="rounded-lg border border-line px-3 text-[13px] text-dim">انصراف</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setRubric([15, 15, 15, 15]); setRubricOpen(p.id); }}
                          disabled={wc < p.minWords}
                          className="mt-4 w-full rounded-xl bg-gold py-2.5 text-[13px] font-bold text-ink transition-all hover:bg-goldsoft disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          {cur?.submittedAt ? "داوری و ثبت دوباره" : "داوری نهایی و صدور گواهی"}
                        </button>
                      )}
                      {wc < p.minWords && !cur?.submittedAt && (
                        <p className="mt-2 text-center text-[11px] text-faint">برای داوری، نخست حداقل واژه‌ها را بنویسید.</p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* گواهی‌های صادرشده */}
      {earned.length > 0 && (
        <section className="mt-16">
          <Ornament />
          <h2 className="mt-6 text-center font-display text-3xl text-bone">گواهی‌های مهارت شما</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {earned.map((p) => (
              <Certificate key={p.id} project={p} score={st(p.id)?.score ?? 0} date={st(p.id)?.submittedAt ?? Date.now()} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- گواهی ---------- */
export function Certificate({ project, score, date }: { project: Project; score: number; date: number }) {
  const { s, setName } = useApp();
  return (
    <div className="cert-print group relative rounded-xl border-2 border-gold/70 bg-ink2 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
      <div className="anim-seal absolute -left-3 -top-3 grid h-14 w-14 place-items-center rounded-full border-2 border-gold bg-ink text-gold shadow-lg">
        <Icon name="seal" size={28} />
      </div>
      <div className="rounded-lg border border-gold/30 p-5 text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-gold/80">مکتب‌خانه</p>
        <h3 className="mt-2 font-display text-2xl text-goldsoft">گواهی مهارت</h3>
        <p className="mt-3 font-read text-lg text-dim">بدین‌وسیله گواهی می‌شود که</p>
        <input
          value={s.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام پژوهشگر را بنویسید…"
          className="mx-auto mt-1 block w-56 border-b border-dashed border-line2 bg-transparent text-center font-display text-2xl text-turqsoft outline-none placeholder:text-faint"
        />
        <p className="mt-3 text-[13px] leading-7 text-dim">
          پژوهش پایانیِ سطح <b style={{ color: LEVELS[project.level].color }}>{LEVELS[project.level].name}</b> را با عنوان
        </p>
        <p className="mt-1 font-bold leading-7 text-bone">«{project.title}»</p>
        <p className="mt-2 text-[13px] text-dim">
          با نمرهٔ <b className="text-goldsoft">{fa(score)}</b> از ۱۰۰ به انجام رسانده است.
        </p>
        <div className="mt-4 flex items-center justify-between text-[11px] text-faint">
          <span>{faDate(date)}</span>
          <Icon name="star8" size={16} className="text-gold/70" />
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-faint transition-colors hover:border-gold/50 hover:text-goldsoft">
            <Icon name="print" size={13} />
            چاپ
          </button>
        </div>
      </div>
    </div>
  );
}
