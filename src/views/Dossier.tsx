import { useState } from "react";
import { FIELDS, RANKS, PROJECTS, bookById } from "../data";
import { READINGS } from "../readings";
import { useApp, fa, cx, rankOf, nextRankOf, bookProgress, faDate, dayKey } from "../store";
import { Icon } from "../icons";
import { Reveal, ProgressBar, LevelBadge } from "../ui";
import { Certificate } from "./Projects";

const totalParas = (id: string) => (READINGS[id] ?? []).reduce((s, c) => s + c.paras.length, 0);

export default function Dossier({ read }: { read: (bookId: string) => void }) {
  const { s, xp, streak, setName, resetAll } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const rank = rankOf(xp);
  const next = nextRankOf(xp);
  const rankIdx = RANKS.findIndex((r) => r.name === rank.name);

  /* پیشرفت رشته‌ها */
  const fieldRows = FIELDS.map((f) => {
    const readableBooks = f.books.filter((b) => b.readable || s.finished[b.id]);
    if (!readableBooks.length) return null;
    const avg =
      readableBooks.reduce((a, b) => {
        if (s.finished[b.id]) return a + 1;
        return b.readable ? a + bookProgress(s, b.id, totalParas(b.id)) : a;
      }, 0) / readableBooks.length;
    return { f, avg };
  }).filter(Boolean) as { f: (typeof FIELDS)[number]; avg: number }[];
  const activeFields = fieldRows.filter((r) => r.avg > 0);

  /* صف مرور */
  const reviewItems: { bookId: string; pid: string; kind: "bookmark" | "highlight" }[] = [
    ...Object.entries(s.bookmarks).flatMap(([bookId, marks]) =>
      Object.keys(marks).map((pid) => ({ bookId, pid, kind: "bookmark" as const }))
    ),
    ...Object.entries(s.highlights).flatMap(([bookId, hls]) =>
      Object.keys(hls)
        .filter((pid) => !(s.bookmarks[bookId] ?? {})[pid])
        .slice(0, 4)
        .map((pid) => ({ bookId, pid, kind: "highlight" as const }))
    ),
  ].slice(0, 8);

  const weakTopics = Object.entries(s.quizzes).flatMap(([bookId, r]) =>
    Object.entries(r.topics)
      .filter(([, v]) => v.all > 0 && v.right / v.all < 0.5)
      .map(([t]) => ({ bookId, topic: t }))
  );

  const earned = PROJECTS.filter((p) => {
    const ps = s.projects[p.id];
    return ps?.submittedAt && (ps.score ?? 0) >= 70;
  });

  const days = new Set(s.events.map((e) => dayKey(e.ts))).size;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {/* شناسنامه */}
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="khatam border-b border-line bg-ink2/80 px-6 py-8">
            <div className="flex flex-wrap items-center gap-6">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-gold bg-ink font-display text-4xl text-gold">
                {(s.name || "م").trim()[0]}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  value={s.name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام خود را بنویسید…"
                  className="w-full max-w-sm bg-transparent font-display text-3xl text-bone outline-none placeholder:text-faint"
                />
                <p className="mt-1 text-[13px] text-dim">
                  عضویت از {faDate(s.joined)} · {fa(days)} روزِ فعال · {fa(streak)} روز پیوسته
                </p>
              </div>
              <div className="text-left">
                <p className="font-display text-4xl text-goldsoft">{fa(xp)}</p>
                <p className="text-[12px] text-faint">امتیاز مطالعه (XP)</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-bold text-goldsoft">
                  <Icon name="seal" size={16} />
                  مرتبه: {rank.name}
                </span>
                {next ? (
                  <span className="text-dim">
                    تا مرتبهٔ <b className="text-turqsoft">{next.name}</b>: {fa(next.xp - xp)} امتیاز مانده
                  </span>
                ) : (
                  <span className="text-turqsoft">به قلهٔ استادی رسیده‌اید</span>
                )}
              </div>
              {next && (
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold to-turq transition-all duration-1000"
                    style={{ width: `${Math.min(100, ((xp - rank.xp) / (next.xp - rank.xp)) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* نردبان مراتب */}
          <div className="grid grid-cols-5 divide-x divide-x-reverse divide-line">
            {RANKS.map((r, i) => (
              <div key={r.name} className={cx("px-2 py-4 text-center", i <= rankIdx ? "bg-gold/8" : "opacity-45")}>
                <span className={cx("mx-auto grid h-9 w-9 place-items-center rounded-full border-2 font-display", i === rankIdx ? "anim-blink border-gold text-gold" : i < rankIdx ? "border-turq text-turq" : "border-line2 text-faint")}>
                  {i < rankIdx ? <Icon name="check" size={15} /> : fa(i + 1)}
                </span>
                <p className={cx("mt-1.5 text-[12px] font-bold", i === rankIdx ? "text-goldsoft" : "text-dim")}>{r.name}</p>
                <p className="hidden text-[10px] text-faint md:block">{fa(r.xp)} XP</p>
              </div>
            ))}
          </div>
          <p className="border-t border-line bg-ink2/60 px-6 py-3 text-[13px] text-dim">{rank.desc}</p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* پیشرفت رشته‌ها */}
        <Reveal className="lg:col-span-5">
          <h2 className="flex items-center gap-2 font-display text-2xl text-bone">
            <Icon name="route" size={22} className="text-gold" /> پیشرفت سیر مطالعاتی
          </h2>
          {activeFields.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-line2 p-5 text-center text-[13px] leading-7 text-faint">
              هنوز متنی نخوانده‌اید. از <b className="text-goldsoft">خانه</b> یا <b className="text-goldsoft">کتابخانه</b> نخستین متن را بگشایید.
            </p>
          )}
          <div className="mt-4 space-y-4">
            {activeFields.map(({ f, avg }) => (
              <div key={f.id} className="rounded-xl border border-line bg-panel p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[14px] font-bold text-bone">
                    <Icon name={f.icon} size={17} className="text-turq" />
                    {f.title}
                  </span>
                  <span className="font-display text-lg text-goldsoft">{fa(Math.round(avg * 100))}٪</span>
                </div>
                <ProgressBar value={avg} color="#3fb3a3" thin className="mt-2" />
              </div>
            ))}
          </div>
        </Reveal>

        {/* صف مرور */}
        <Reveal delay={100} className="lg:col-span-4">
          <h2 className="flex items-center gap-2 font-display text-2xl text-bone">
            <Icon name="bookmark" size={22} className="text-lal" /> صف مرور سریع
          </h2>
          <p className="mt-1 text-[12px] text-faint">نشان‌ها و هایلایت‌های شما برای مرور شب امتحان</p>
          <div className="mt-4 space-y-2.5">
            {reviewItems.length === 0 && (
              <p className="rounded-xl border border-dashed border-line2 p-5 text-center text-[13px] leading-7 text-faint">
                چیزی نشان نگذاشته‌اید. در متن‌خوان، بندهای مهم را <b className="text-lal">نشان</b> یا <b className="text-goldsoft">هایلایت</b> کنید.
              </p>
            )}
            {reviewItems.map((it, i) => {
              const b = bookById(it.bookId);
              return (
                <button
                  key={it.bookId + it.pid + i}
                  onClick={() => read(it.bookId)}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-panel p-3 text-right transition-all hover:-translate-y-0.5 hover:border-gold/45"
                >
                  <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-lg", it.kind === "bookmark" ? "bg-lal/15 text-lal" : "bg-gold/15 text-gold")}>
                    <Icon name={it.kind === "bookmark" ? "bookmark" : "marker"} size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-bone">{b?.title}</span>
                    <span className="block text-[11px] text-faint">{it.kind === "bookmark" ? "بند نشان‌شده" : "بند هایلایت‌شده"} — مرور در متن‌خوان</span>
                  </span>
                  <Icon name="chev" size={15} className="mr-auto rotate-180 shrink-0 text-faint" />
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* نقاط ضعف */}
        <Reveal delay={180} className="lg:col-span-3">
          <h2 className="flex items-center gap-2 font-display text-2xl text-bone">
            <Icon name="target" size={22} className="text-verm" /> نقاط ضعف
          </h2>
          <div className="mt-4 space-y-2.5">
            {weakTopics.length === 0 && (
              <p className="rounded-xl border border-dashed border-line2 p-5 text-center text-[13px] leading-7 text-faint">
                {Object.keys(s.quizzes).length ? "نقطهٔ ضعفی ثبت نشده — آفرین!" : "با شرکت در آزمون‌ها، ضعف‌های موضوعی‌تان اینجا نمایان می‌شود."}
              </p>
            )}
            {weakTopics.map(({ bookId, topic }, i) => {
              const b = bookById(bookId);
              return (
                <div key={i} className="rounded-xl border border-lal/35 bg-lal/8 p-3">
                  <p className="text-[13px] font-bold text-lal">{topic}</p>
                  <p className="mt-0.5 text-[11px] text-dim">{b?.title} — فصل مربوط را دوباره بخوانید</p>
                  <button onClick={() => read(bookId)} className="mt-2 rounded-md border border-lal/40 px-2.5 py-1 text-[11px] font-bold text-lal transition-colors hover:bg-lal hover:text-bone">
                    مرور درس
                  </button>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* تاریخچهٔ آزمون‌ها */}
      <Reveal delay={80}>
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-2xl text-bone">
            <Icon name="note" size={22} className="text-turq" /> کارنامهٔ آزمون‌ها
          </h2>
          {Object.keys(s.quizzes).length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-line2 p-5 text-center text-[13px] text-faint">هنوز آزمونی نداده‌اید.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[560px] text-right text-[13px]">
                <thead>
                  <tr className="bg-ink2 text-faint">
                    <th className="px-4 py-3 font-semibold">درس</th>
                    <th className="px-4 py-3 font-semibold">سطح</th>
                    <th className="px-4 py-3 font-semibold">نمره</th>
                    <th className="px-4 py-3 font-semibold">وضعیت</th>
                    <th className="px-4 py-3 font-semibold">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(s.quizzes).map(([bookId, r]) => {
                    const b = bookById(bookId);
                    return (
                      <tr key={bookId} className="border-t border-line transition-colors hover:bg-panel2">
                        <td className="px-4 py-3 font-bold text-bone">{b?.title}</td>
                        <td className="px-4 py-3">{b && <LevelBadge level={b.level} size="sm" />}</td>
                        <td className="px-4 py-3 font-display text-lg text-goldsoft">{fa(r.pct)}٪</td>
                        <td className="px-4 py-3">
                          <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", r.pct >= 70 ? "bg-turq/15 text-turqsoft" : "bg-lal/15 text-lal")}>
                            {r.pct >= 70 ? "قبول" : "نیازمند مرور"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-dim">{faDate(r.ts)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Reveal>

      {/* گواهی‌ها */}
      {earned.length > 0 && (
        <Reveal delay={120}>
          <section className="mt-12">
            <h2 className="flex items-center gap-2 font-display text-2xl text-bone">
              <Icon name="seal" size={22} className="text-gold" /> گواهی‌های صادرشده
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {earned.map((p) => (
                <Certificate key={p.id} project={p} score={s.projects[p.id]?.score ?? 0} date={s.projects[p.id]?.submittedAt ?? Date.now()} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* رویدادها */}
      <Reveal delay={140}>
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-2xl text-bone">
            <Icon name="flame" size={22} className="text-verm" /> دفتر رویدادهای مطالعه
          </h2>
          {s.events.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-line2 p-5 text-center text-[13px] text-faint">هنوز رویدادی ثبت نشده است.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {[...s.events].reverse().slice(0, 10).map((e, i) => (
                <li key={e.ts + i} className="flex items-center gap-3 rounded-lg border border-line bg-panel px-4 py-2.5 text-[13px]">
                  <span className="rounded-md bg-gold/15 px-2 py-0.5 font-display text-sm text-goldsoft">+{fa(e.xp)}</span>
                  <span className="flex-1 text-bone/90">{e.label}</span>
                  <span className="text-[11px] text-faint">{faDate(e.ts)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>

      <div className="mt-12 text-center">
        {confirmReset ? (
          <div className="inline-flex items-center gap-3 rounded-xl border border-lal/40 bg-lal/10 px-5 py-3">
            <span className="text-[13px] font-bold text-lal">همهٔ پیشرفت شما پاک شود؟</span>
            <button onClick={() => { resetAll(); setConfirmReset(false); }} className="rounded-lg bg-lal px-4 py-1.5 text-[13px] font-bold text-bone">بله، پاک شود</button>
            <button onClick={() => setConfirmReset(false)} className="rounded-lg border border-line px-4 py-1.5 text-[13px] text-dim">خیر</button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="text-[12px] text-faint underline-offset-4 transition-colors hover:text-lal hover:underline">
            بازنشانی کامل کارنامه
          </button>
        )}
      </div>
    </div>
  );
}
