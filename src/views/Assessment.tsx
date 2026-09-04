import { useMemo, useState } from "react";
import { BANKS, Q } from "../questions";
import { bookById, fieldOfBook } from "../data";
import { useApp, fa, cx, faDate } from "../store";
import { Icon } from "../icons";
import { Reveal, LevelBadge, ProgressBar } from "../ui";

export interface AssessmentProps {
  presetBook?: string;
  read: (bookId: string) => void;
}

export default function Assessment({ presetBook, read }: AssessmentProps) {
  const { s, saveQuiz, addEvent } = useApp();
  const [bookId, setBookId] = useState<string | null>(presetBook ?? null);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [submitted, setSubmitted] = useState(false);

  const book = bookId ? bookById(bookId) : null;
  const questions = useMemo(() => (bookId ? BANKS[bookId] ?? [] : []), [bookId]);

  const mcqs = questions.filter((q) => q.type === "mcq");
  const essays = questions.filter((q) => q.type === "essay");

  const submit = () => {
    if (!bookId) return;
    let right = 0;
    const topics: Record<string, { right: number; all: number }> = {};
    for (const q of mcqs) {
      topics[q.topic] = topics[q.topic] ?? { right: 0, all: 0 };
      topics[q.topic].all++;
      if (answers[q.id] === q.answer) {
        right++;
        topics[q.topic].right++;
      }
    }
    const score = mcqs.length ? Math.round((right / mcqs.length) * 100) : 0;
    saveQuiz(bookId, { score, total: mcqs.length, pct: score, topics, ts: Date.now() });
    if (right > 0) addEvent(right * 2, `${fa(right)} پاسخ درست در آزمون «${book?.title ?? ""}»`);
    if (score >= 70) addEvent(20, "قبولی در آزمون درس");
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  /* ---------- فهرست اوراق ---------- */
  if (!bookId || !book) {
    const keys = Object.keys(BANKS);
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <p className="text-[13px] font-semibold text-gold">سنجشِ درکِ مطلب</p>
          <h1 className="mt-2 font-display text-4xl text-bone">امتحانِ خواندن</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-7 text-dim">
            پس از پایان هر درس، با تست‌های چهارگزینه‌ای و سوالات تشریحیِ تحلیلی، عیارِ فهم خود را بسنجید. پاسخ‌نامه‌ها تشریح دارند و ضعف‌های موضوعی‌تان در کارنامه می‌نشیند.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {keys.map((id, i) => {
            const b = bookById(id)!;
            const f = fieldOfBook(id);
            const prev = s.quizzes[id];
            const bank = BANKS[id];
            return (
              <Reveal key={id} delay={Math.min(i * 70, 350)}>
                <div className="group flex h-full flex-col rounded-xl border border-line bg-panel p-5 transition-all hover:-translate-y-1 hover:border-gold/45">
                  <div className="flex items-center justify-between">
                    <LevelBadge level={b.level} size="sm" />
                    {prev ? (
                      <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", prev.pct >= 70 ? "bg-turq/15 text-turqsoft" : "bg-lal/15 text-lal")}>
                        آخرین نمره: {fa(prev.pct)}٪
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink2 px-2.5 py-1 text-[11px] text-faint">هنوز داده نشده</span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl leading-8 text-bone transition-colors group-hover:text-goldsoft">{b.title}</h3>
                  <p className="text-[12px] text-dim">{b.author}</p>
                  <p className="mt-1 text-[11px] text-faint">{f?.title}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {bank.filter((q) => q.type === "mcq").length > 0 && (
                      <span className="rounded-md bg-ink2 px-2 py-0.5 text-[11px] text-dim">
                        {fa(bank.filter((q) => q.type === "mcq").length)} تست چهارگزینه‌ای
                      </span>
                    )}
                    <span className="rounded-md bg-ink2 px-2 py-0.5 text-[11px] text-dim">
                      {fa(bank.filter((q) => q.type === "essay").length)} سوال تشریحی
                    </span>
                    {Array.from(new Set(bank.map((q) => q.topic))).slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] text-gold/90">{t}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      onClick={() => { setBookId(id); reset(); }}
                      className="flex-1 rounded-lg bg-gold/15 border border-gold/40 py-2 text-[13px] font-bold text-goldsoft transition-all hover:bg-gold hover:text-ink"
                    >
                      {prev ? "آزمون دوباره" : "شروع آزمون"}
                    </button>
                    {b.readable && (
                      <button
                        onClick={() => read(id)}
                        className="rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-dim transition-colors hover:border-turq/50 hover:text-turqsoft"
                      >
                        <Icon name="bookOpen" size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={200}>
          <p className="mt-8 flex items-center gap-2 rounded-xl border border-dashed border-line2 p-4 text-[13px] text-faint">
            <Icon name="note" size={17} className="shrink-0 text-gold/70" />
            بانک سوالات دیگر دروس در حال تألیف است و همگام با بارگذاری گزیده‌های مطالعاتی، منتشر می‌شود.
          </p>
        </Reveal>
      </div>
    );
  }

  /* ---------- برگهٔ آزمون ---------- */
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return q.type === "mcq" ? a !== undefined : typeof a === "string" && a.trim().length > 0;
  }).length;
  const result = submitted ? s.quizzes[bookId] : undefined;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <Reveal>
        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { setBookId(null); reset(); }} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-bold text-dim hover:border-lal/50 hover:text-lal">
              <Icon name="chev" size={15} />
              اوراق امتحانی
            </button>
            <LevelBadge level={book.level} size="sm" />
            <div>
              <h1 className="font-display text-2xl text-bone">برگهٔ سنجش: {book.title}</h1>
              <p className="text-[12px] text-dim">{book.author} · {fieldOfBook(book.id)?.title}</p>
            </div>
            {!submitted && (
              <span className="mr-auto text-[12px] text-faint">{fa(answeredCount)} از {fa(questions.length)} پاسخ داده شد</span>
            )}
          </div>

          {/* نتیجه */}
          {submitted && result && (
            <div className="mt-6 rounded-xl border border-gold/30 bg-ink2 p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative h-28 w-28">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#27315a" strokeWidth="9" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={result.pct >= 70 ? "#3fb3a3" : "#c94f5f"} strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={`${(result.pct / 100) * 264} 264`}
                      style={{ transition: "stroke-dasharray 1s cubic-bezier(0.2,0.8,0.3,1)" }}
                    />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center font-display text-2xl text-bone">{fa(result.pct)}٪</span>
                </div>
                <div className="flex-1">
                  <p className={cx("font-display text-2xl", result.pct >= 70 ? "text-turqsoft" : "text-lal")}>
                    {result.pct >= 90 ? "درخشان — در تراز استادی" : result.pct >= 70 ? "قبول — تسلط قابل قبول" : "نیازمند مرور — متن را دوباره بخوانید"}
                  </p>
                  <p className="mt-1 text-[13px] text-dim">{fa(result.score >= 0 ? Math.round((result.pct / 100) * result.total) : 0)} پاسخ درست از {fa(result.total)} تست</p>
                  <div className="mt-3 space-y-2">
                    {Object.entries(result.topics).map(([t, v]) => (
                      <div key={t}>
                        <div className="flex justify-between text-[12px]">
                          <span className="text-dim">{t}</span>
                          <span className={v.right === v.all ? "text-turqsoft" : v.right === 0 ? "text-lal" : "text-goldsoft"}>
                            {fa(v.right)}/{fa(v.all)} {v.right === 0 && "— نقطهٔ ضعف"}
                          </span>
                        </div>
                        <ProgressBar value={v.all ? v.right / v.all : 0} color={v.right === v.all ? "#3fb3a3" : v.right === 0 ? "#c94f5f" : "#d9a441"} thin />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {read && book.readable && (
                      <button onClick={() => read(book.id)} className="rounded-lg border border-gold/40 px-4 py-2 text-[13px] font-bold text-goldsoft hover:bg-gold hover:text-ink">
                        مرور متن درس
                      </button>
                    )}
                    <button onClick={reset} className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-dim hover:border-turq/50 hover:text-turqsoft">
                      آزمون دوباره
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* تست‌ها */}
      <div className="mt-8 space-y-5">
        {mcqs.map((q, qi) => (
          <Reveal key={q.id} delay={Math.min(qi * 50, 250)}>
            <QuestionCard q={q} index={qi + 1} submitted={submitted} value={answers[q.id] as number | undefined} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
          </Reveal>
        ))}
        {essays.map((q, qi) => (
          <Reveal key={q.id} delay={Math.min(qi * 50, 250)}>
            <div className="rounded-xl border border-line bg-panel p-5">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-turq/15 px-2 py-0.5 text-[11px] font-bold text-turqsoft">تشریحی {fa(qi + 1)}</span>
                <span className="text-[11px] text-faint">مبحث: {q.topic}</span>
              </div>
              <p className="mt-3 font-bold leading-8 text-bone">{q.text}</p>
              <textarea
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                disabled={submitted}
                placeholder="پاسخ تحلیلی خود را با استناد به متن خوانده‌شده بنویسید…"
                className="mt-3 h-36 w-full resize-y rounded-lg border border-line bg-ink2 p-3.5 text-[14px] leading-8 text-bone outline-none transition-colors focus:border-turq/60 disabled:opacity-70"
              />
              {submitted && q.criteria && (
                <div className="mt-3 rounded-lg border border-turq/30 bg-turq/8 p-4">
                  <p className="text-[12px] font-bold text-turqsoft">ملاک‌های ارزیابی — پاسخ خود را با این معیارها بسنجید:</p>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {q.criteria.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-[13px] text-bone">
                        <Icon name="check" size={14} className="text-turq" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {!submitted && (
        <div className="sticky bottom-4 mt-8">
          <button
            onClick={submit}
            disabled={answeredCount === 0}
            className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-gold py-3.5 font-bold text-ink shadow-[0_12px_36px_-10px_rgba(217,164,65,0.6)] transition-all hover:-translate-y-0.5 hover:bg-goldsoft disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Icon name="seal" size={19} />
            ثبت پاسخ‌نامه و مشاهدهٔ نتیجه
          </button>
        </div>
      )}

      {submitted && result && (
        <p className="mt-6 text-center text-[12px] text-faint">نتیجه در کارنامهٔ شما ثبت شد — {faDate(result.ts)}</p>
      )}
    </div>
  );
}

/* ---------- کارت سوال تستی ---------- */
function QuestionCard({
  q, index, submitted, value, onChange,
}: {
  q: Q; index: number; submitted: boolean; value?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-goldsoft">تست {fa(index)}</span>
        <span className="text-[11px] text-faint">مبحث: {q.topic}</span>
      </div>
      <p className="mt-3 font-bold leading-8 text-bone">{q.text}</p>
      <div className="mt-3 grid gap-2">
        {q.options!.map((op, oi) => {
          const chosen = value === oi;
          const correct = submitted && oi === q.answer;
          const wrong = submitted && chosen && oi !== q.answer;
          return (
            <button
              key={oi}
              disabled={submitted}
              onClick={() => onChange(oi)}
              className={cx(
                "flex items-center gap-3 rounded-lg border px-4 py-2.5 text-right text-[14px] transition-all",
                !submitted && chosen && "border-gold bg-gold/12 text-goldsoft",
                !submitted && !chosen && "border-line text-dim hover:border-gold/40 hover:text-bone",
                correct && "border-turq bg-turq/12 text-turqsoft",
                wrong && "border-lal bg-lal/12 text-lal",
                submitted && !correct && !wrong && "border-line/50 text-faint"
              )}
            >
              <span className={cx(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[12px] font-bold",
                correct ? "border-turq text-turq" : wrong ? "border-lal text-lal" : chosen ? "border-gold text-gold" : "border-line2 text-faint"
              )}>
                {correct ? <Icon name="check" size={13} /> : wrong ? <Icon name="x" size={13} /> : fa(oi + 1)}
              </span>
              {op}
            </button>
          );
        })}
      </div>
      {submitted && q.explain && (
        <div className={cx("mt-3 rounded-lg border p-3.5 text-[13px] leading-7", value === q.answer ? "border-turq/35 bg-turq/8 text-turqsoft" : "border-gold/35 bg-gold/8 text-goldsoft")}>
          <b>{value === q.answer ? "درست است؛ " : "توضیح: "}</b>
          <span className="text-bone/85">{q.explain}</span>
        </div>
      )}
    </div>
  );
}
