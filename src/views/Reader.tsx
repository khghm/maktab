import { useEffect, useMemo, useRef, useState } from "react";
import { bookById, fieldOfBook, LEVELS } from "../data";
import { READINGS, extractSummary } from "../readings";
import { BANKS } from "../questions";
import { useApp, fa, cx } from "../store";
import { Icon } from "../icons";
import { LevelBadge, ProgressBar } from "../ui";

export interface ReaderProps {
  bookId: string;
  onClose: () => void;
  onAssess: (bookId: string) => void;
}

type Tab = "notes" | "marks" | "summary";

export default function Reader({ bookId, onClose, onAssess }: ReaderProps) {
  const { s, markViewed, setFinished, toggleHighlight, saveNote, deleteNote, toggleBookmark, addEvent } = useApp();
  const book = bookById(bookId);
  const field = fieldOfBook(bookId);
  const chapters = useMemo(() => READINGS[bookId] ?? [], [bookId]);
  const [ci, setCi] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("notes");
  const [noteDraft, setNoteDraft] = useState<{ paraId: string; text: string; id?: string } | null>(null);
  const [summary, setSummary] = useState<string[] | null>(null);
  const [sumLoading, setSumLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const chapter = chapters[ci];
  const allParas = useMemo(() => chapters.flatMap((c) => c.paras), [chapters]);
  const viewedCount = allParas.filter((p) => s.viewed[`${bookId}-${p.id}`]).length;
  const progress = allParas.length ? viewedCount / allParas.length : 0;
  const highlights = s.highlights[bookId] ?? {};
  const notes = s.notes[bookId] ?? [];
  const bookmarks = s.bookmarks[bookId] ?? {};

  /* completion + XP */
  useEffect(() => {
    if (progress >= 0.8 && book && !s.finished[bookId]) {
      setFinished(bookId);
      addEvent(15, `پایان مطالعهٔ «${book.title}»`);
    }
  }, [progress, book, bookId, s.finished, setFinished, addEvent]);

  /* observe paragraphs */
  useEffect(() => {
    const root = paperRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) {
          const pid = (e.target as HTMLElement).dataset.pid;
          if (pid) markViewed(`${bookId}-${pid}`);
        }
      }),
      { root, threshold: 0.55 }
    );
    root.querySelectorAll("[data-pid]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ci, bookId, markViewed, chapters.length]);

  /* esc close */
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  /* scroll to chapter top on change */
  useEffect(() => {
    paperRef.current?.scrollTo({ top: 0 });
    setSel(null);
    setNoteDraft(null);
  }, [ci]);

  if (!book || !chapters.length) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-ink/95 p-6">
        <div className="max-w-md rounded-2xl border border-line bg-panel p-8 text-center">
          <Icon name="bookOpen" size={32} className="mx-auto text-gold" />
          <h2 className="mt-3 font-display text-2xl text-bone">گزیدهٔ مطالعاتی این کتاب در راه است</h2>
          <p className="mt-2 text-[14px] leading-7 text-dim">
            سرفصل، بازهٔ زمانی و مباحث این جلد در نقشهٔ راه آمده است؛ متن کامل آن در کتابخانهٔ مرجع مطالعه می‌شود و گزیدهٔ تعاملی به‌زودی بارگذاری خواهد شد.
          </p>
          <button onClick={onClose} className="mt-5 rounded-lg bg-gold px-5 py-2 font-bold text-ink">بازگشت</button>
        </div>
      </div>
    );
  }

  const paraSnippet = (pid: string) => {
    const p = allParas.find((x) => x.id === pid);
    return p ? (p.text.length > 72 ? p.text.slice(0, 70) + "…" : p.text) : "";
  };

  const jumpTo = (pid: string) => {
    const cIdx = chapters.findIndex((c) => c.paras.some((p) => p.id === pid));
    if (cIdx >= 0 && cIdx !== ci) setCi(cIdx);
    setPanelOpen(false);
    setFlash(pid);
    setTimeout(() => {
      document.getElementById(`p-${pid}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    setTimeout(() => setFlash(null), 1600);
  };

  const runSummary = () => {
    setSumLoading(true);
    setSummary(null);
    setTimeout(() => {
      setSummary(extractSummary(chapter.paras));
      setSumLoading(false);
    }, 900);
  };

  const saveSummaryAsNote = () => {
    if (!summary) return;
    saveNote(bookId, "خلاصهٔ فصل", summary.map((x, i) => `${i + 1}. ${x}`).join("\n"));
    addEvent(2, "ذخیرهٔ خلاصه به‌عنوان یادداشت");
    setTab("notes");
  };

  const wcLeft = chapter ? chapter.paras.filter((p) => !s.viewed[`${bookId}-${p.id}`]).reduce((a, p) => a + p.text.split(/\s+/).length, 0) : 0;
  const minsLeft = Math.max(1, Math.round(wcLeft / 210));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink">
      {/* نوار بالای خواننده */}
      <header className="flex items-center gap-3 border-b border-line bg-ink2 px-4 py-3">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-bold text-dim transition-colors hover:border-lal/60 hover:text-lal"
        >
          <Icon name="x" size={15} />
          بستن
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg leading-6 text-bone">{book.title}</h1>
          <p className="truncate text-[11px] text-faint">{field?.title} · {book.author}</p>
        </div>
        <div className="mr-auto hidden items-center gap-4 sm:flex">
          <div className="w-36">
            <ProgressBar value={progress} color={LEVELS[book.level].color} thin />
            <p className="mt-1 text-center text-[11px] text-faint">{fa(Math.round(progress * 100))}٪ از کتاب</p>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] text-dim">
            <Icon name="clock" size={14} className="text-turq" />
            ≈ {fa(minsLeft)} دقیقه تا پایان فصل
          </span>
          <LevelBadge level={book.level} size="sm" />
        </div>
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="rounded-lg border border-line p-2 text-dim transition-colors hover:border-gold/50 hover:text-gold lg:hidden"
          title="حاشیهٔ مطالعه"
        >
          <Icon name="note" size={17} />
        </button>
      </header>

      {/* تب فصل‌ها */}
      <nav className="flex gap-1 overflow-x-auto border-b border-line bg-ink2/60 px-4 py-2">
        {chapters.map((c, i) => {
          const cp = c.paras.filter((p) => s.viewed[`${bookId}-${p.id}`]).length / c.paras.length;
          return (
            <button
              key={c.id}
              onClick={() => setCi(i)}
              className={cx(
                "relative shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition-all",
                i === ci ? "bg-gold/15 text-goldsoft" : "text-dim hover:text-bone"
              )}
            >
              فصل {fa(i + 1)}: {c.title}
              <span className="absolute bottom-0 right-3 left-3 h-0.5 overflow-hidden rounded-full bg-line/60">
                <span className="block h-full bg-turq transition-all duration-500" style={{ width: `${cp * 100}%` }} />
              </span>
            </button>
          );
        })}
      </nav>

      <div className="relative flex flex-1 overflow-hidden">
        {/* صفحهٔ کاغذی */}
        <div ref={paperRef} className="flex-1 overflow-y-auto" onClick={() => setSel(null)}>
          <div className="paper-tex mx-auto min-h-full max-w-3xl px-6 py-10 shadow-[0_0_60px_rgba(0,0,0,0.55)] md:px-12 md:py-14">
            <p className="text-center font-read text-[15px] text-paperdim">— فصل {fa(ci + 1)} از {fa(chapters.length)} —</p>
            <h2 className="mt-2 text-center font-display text-4xl text-paperink">{chapter.title}</h2>
            <div className="mx-auto mt-3 flex items-center justify-center gap-2 text-gold">
              <span className="h-px w-14 bg-paperdim/50" />
              <Icon name="star8" size={15} />
              <span className="h-px w-14 bg-paperdim/50" />
            </div>

            <div className="mt-8 space-y-7">
              {chapter.paras.map((p) => {
                const hl = !!highlights[p.id];
                const noted = notes.some((n) => n.paraId === p.id);
                const bm = !!bookmarks[p.id];
                const selected = sel === p.id;
                return (
                  <div key={p.id} className="relative">
                    {p.heading && (
                      <h3 className="mb-2 flex items-center gap-2 font-display text-2xl text-paperink">
                        <span className="inline-block h-2.5 w-2.5 rotate-45 bg-gold" />
                        {p.heading}
                      </h3>
                    )}
                    <div
                      id={`p-${p.id}`}
                      data-pid={p.id}
                      onClick={(e) => { e.stopPropagation(); setSel(selected ? null : p.id); }}
                      className={cx(
                        "cursor-text rounded-lg px-3 py-2 -mx-3 transition-all duration-300",
                        selected && "bg-gold/15 ring-1 ring-gold/60",
                        flash === p.id && "bg-turq/20 ring-1 ring-turq",
                        noted && !selected && "border-s-4 border-turq/70 pl-2",
                        bm && "relative"
                      )}
                    >
                      {bm && (
                        <span className="absolute -top-1 left-2 text-gold" title="نشان‌گذاری شده">
                          <Icon name="bookmark" size={16} className="fill-gold/80 stroke-gold" />
                        </span>
                      )}
                      <p className={cx("font-read text-[21px] leading-[2.05] text-paperink md:text-[22px]", hl && "para-mark")}>
                        {p.text}
                      </p>
                    </div>
                    {/* نوار ابزار بند */}
                    {selected && (
                      <div
                        className="absolute -top-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-ink px-2 py-1 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { toggleHighlight(bookId, p.id); if (!hl) addEvent(1, "هایلایت در متن"); }}
                          className={cx("rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors", hl ? "bg-gold text-ink" : "text-goldsoft hover:bg-gold/20")}
                          title="هایلایت"
                        >
                          <Icon name="marker" size={14} className="inline" />
                        </button>
                        <button
                          onClick={() => { setNoteDraft({ paraId: p.id, text: "" }); setTab("notes"); setPanelOpen(true); }}
                          className="rounded-full px-2.5 py-1 text-[12px] font-bold text-turqsoft hover:bg-turq/20"
                          title="یادداشت حاشیه‌ای"
                        >
                          <Icon name="note" size={14} className="inline" />
                        </button>
                        <button
                          onClick={() => { toggleBookmark(bookId, p.id); addEvent(1, "نشان‌گذاری صفحه"); }}
                          className={cx("rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors", bm ? "bg-lal text-bone" : "text-lal hover:bg-lal/20")}
                          title="نشان‌گذاری"
                        >
                          <Icon name="bookmark" size={14} className="inline" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ناوبری فصل‌ها */}
            <div className="mt-12 flex items-center justify-between gap-3 border-t border-paperdim/30 pt-6">
              <button
                onClick={() => setCi((i) => Math.max(0, i - 1))}
                disabled={ci === 0}
                className="rounded-lg border border-paperdim/40 px-4 py-2 text-[13px] font-bold text-paperink transition-all enabled:hover:bg-paper2 disabled:opacity-35"
              >
                ← فصل پیشین
              </button>
              {ci < chapters.length - 1 ? (
                <button
                  onClick={() => setCi((i) => i + 1)}
                  className="rounded-lg bg-paperink px-5 py-2 text-[13px] font-bold text-paper transition-all hover:-translate-y-0.5"
                >
                  فصل بعد →
                </button>
              ) : progress >= 0.8 ? (
                BANKS[bookId] ? (
                  <button
                    onClick={() => onAssess(bookId)}
                    className="inline-flex items-center gap-2 rounded-lg bg-turq px-5 py-2 text-[13px] font-bold text-ink transition-all hover:-translate-y-0.5"
                  >
                    <Icon name="target" size={16} />
                    متن خوانده شد — آزمون درک مطلب
                  </button>
                ) : (
                  <span className="text-[13px] font-bold text-paperdim">این درس خوانده شد ✓ — آزمون به‌زودی</span>
                )
              ) : (
                <span className="text-[13px] text-paperdim">برای پایان درس، {fa(Math.round(progress * 100))}٪ خوانده‌اید (حد نصاب ۸۰٪)</span>
              )}
            </div>
          </div>
        </div>

        {/* حاشیهٔ مطالعه */}
        <aside
          className={cx(
            "absolute inset-y-0 left-0 z-20 w-80 transform border-r border-line bg-ink2 transition-transform duration-300 lg:static lg:translate-x-0 lg:border-l-0 lg:border-r",
            panelOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex border-b border-line">
              {([["notes", "یادداشت‌ها", "note"], ["marks", "نشان‌ها", "bookmark"], ["summary", "خلاصه", "sparkle"]] as const).map(([t, label, ic]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cx(
                    "flex flex-1 items-center justify-center gap-1.5 py-3 text-[13px] font-bold transition-colors",
                    tab === t ? "border-b-2 border-gold text-goldsoft" : "text-faint hover:text-dim"
                  )}
                >
                  <Icon name={ic} size={15} />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {tab === "notes" && (
                <>
                  {noteDraft && (
                    <div className="rounded-xl border border-turq/40 bg-panel p-3">
                      <p className="text-[11px] font-bold text-turq">
                        یادداشت بر: «{paraSnippet(noteDraft.paraId) || "خلاصهٔ فصل"}»
                      </p>
                      <textarea
                        autoFocus
                        value={noteDraft.text}
                        onChange={(e) => setNoteDraft({ ...noteDraft, text: e.target.value })}
                        placeholder="تأمل خود را بنویسید…"
                        className="mt-2 h-24 w-full resize-none rounded-lg border border-line bg-ink2 p-2.5 text-[13px] leading-6 text-bone outline-none focus:border-turq/60"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            if (noteDraft.text.trim()) {
                              saveNote(bookId, noteDraft.paraId, noteDraft.text.trim(), noteDraft.id);
                              if (!noteDraft.id) addEvent(2, "یادداشت حاشیه‌ای");
                            }
                            setNoteDraft(null);
                          }}
                          className="flex-1 rounded-lg bg-turq py-1.5 text-[13px] font-bold text-ink"
                        >
                          ذخیره
                        </button>
                        <button onClick={() => setNoteDraft(null)} className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-dim">
                          انصراف
                        </button>
                      </div>
                    </div>
                  )}
                  {!notes.length && !noteDraft && (
                    <p className="rounded-lg border border-dashed border-line2 p-4 text-center text-[12px] leading-6 text-faint">
                      هنوز یادداشتی ننوشته‌اید. بر بند موردنظر بزنید و آنگاه <b className="text-turq">یادداشت</b> را برگزینید.
                    </p>
                  )}
                  {notes.map((n) => (
                    <div key={n.id} className="group rounded-xl border border-line bg-panel p-3 transition-colors hover:border-turq/50">
                      <button onClick={() => n.paraId !== "خلاصهٔ فصل" && jumpTo(n.paraId)} className="block w-full text-right">
                        <p className="whitespace-pre-line text-[13px] leading-6 text-bone">{n.text}</p>
                      </button>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="truncate text-[10px] text-faint">{n.paraId === "خلاصهٔ فصل" ? "خلاصهٔ فصل" : `«${paraSnippet(n.paraId)}»`}</span>
                        <button onClick={() => deleteNote(bookId, n.id)} className="text-faint opacity-0 transition-opacity hover:text-lal group-hover:opacity-100" title="حذف">
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {tab === "marks" && (
                <>
                  <p className="text-[11px] font-bold text-faint">نشان‌گذاری‌ها ({fa(Object.keys(bookmarks).length)})</p>
                  {Object.keys(bookmarks).length === 0 && (
                    <p className="rounded-lg border border-dashed border-line2 p-4 text-center text-[12px] leading-6 text-faint">
                      صفحه‌های مهم را با ابزار <b className="text-lal">نشان</b> علامت بزنید تا برای مرور سریع اینجا گرد آیند.
                    </p>
                  )}
                  {Object.keys(bookmarks).map((pid) => (
                    <button
                      key={pid}
                      onClick={() => jumpTo(pid)}
                      className="block w-full rounded-xl border border-line bg-panel p-3 text-right transition-colors hover:border-gold/50"
                    >
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-goldsoft">
                        <Icon name="bookmark" size={13} className="fill-gold/60" />
                        بند نشان‌شده
                      </p>
                      <p className="mt-1 text-[12px] leading-6 text-dim">{paraSnippet(pid)}</p>
                    </button>
                  ))}
                  <p className="pt-2 text-[11px] font-bold text-faint">هایلایت‌ها ({fa(Object.keys(highlights).length)})</p>
                  {Object.keys(highlights).map((pid) => (
                    <button
                      key={pid}
                      onClick={() => jumpTo(pid)}
                      className="block w-full rounded-xl border border-line bg-panel p-3 text-right transition-colors hover:border-gold/50"
                    >
                      <p className="para-mark inline text-[12px] leading-6 text-bone">{paraSnippet(pid)}</p>
                    </button>
                  ))}
                </>
              )}
              {tab === "summary" && (
                <>
                  <p className="text-[12px] leading-6 text-dim">
                    خلاصه‌ساز هوشمند، جملات کلیدی فصل «{chapter.title}» را استخراج می‌کند تا برای مرور سریع ذخیره کنید.
                  </p>
                  <button
                    onClick={runSummary}
                    disabled={sumLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-2.5 text-[13px] font-bold text-ink transition-all hover:bg-goldsoft disabled:opacity-60"
                  >
                    <Icon name="sparkle" size={16} className={sumLoading ? "animate-pulse" : ""} />
                    {sumLoading ? "در حال خواندن فصل…" : summary ? "بازسازی خلاصه" : "ساخت خلاصهٔ فصل"}
                  </button>
                  {sumLoading && (
                    <div className="space-y-2">
                      <div className="shimmer-line h-4" />
                      <div className="shimmer-line h-4 w-11/12" />
                      <div className="shimmer-line h-4 w-4/5" />
                      <div className="shimmer-line h-4 w-10/12" />
                    </div>
                  )}
                  {summary && (
                    <div className="rounded-xl border border-gold/35 bg-panel p-4">
                      <p className="text-[11px] font-bold text-gold">عصارهٔ فصل {fa(ci + 1)}</p>
                      <ul className="mt-2 space-y-2.5">
                        {summary.map((x, i) => (
                          <li key={i} className="flex gap-2 text-[13px] leading-6 text-bone">
                            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                            {x}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={saveSummaryAsNote}
                        className="mt-3 w-full rounded-lg border border-gold/40 py-1.5 text-[12px] font-bold text-goldsoft transition-colors hover:bg-gold hover:text-ink"
                      >
                        ذخیره در یادداشت‌های من
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
