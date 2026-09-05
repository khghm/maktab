import { useEffect, useState } from "react";
import { BRANCHES, FIELDS, LEVELS, QUOTES, Book } from "../data";
import { READINGS } from "../readings";
import { useApp, fa, bookProgress, cx } from "../store";
import { Icon } from "../icons";
import { Reveal, CountUp, SectionHead, LevelBadge, ProgressBar, Ornament } from "../ui";

export type Nav = (v: string) => void;
export interface HomeProps {
  nav: Nav;
  read: (bookId: string) => void;
  assess: (bookId?: string) => void;
  filterLibrary: (branch?: string, field?: string) => void;
  roadmapField: (field?: string) => void;
}

const totalParas = (bookId: string) =>
  (READINGS[bookId] ?? []).reduce((s, c) => s + c.paras.length, 0);

export default function Home({ nav, read, assess, filterLibrary, roadmapField }: HomeProps) {
  const { s, streak } = useApp();
  const [qi, setQi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 5200);
    return () => clearInterval(t);
  }, []);

  const viewed = Object.keys(s.viewed).length;
  const notes = Object.values(s.notes).reduce((a, l) => a + l.length, 0);
  const quizzes = Object.keys(s.quizzes).length;
  const highlights = Object.values(s.highlights).reduce((a, h) => a + Object.keys(h).length, 0);

  /* current book on the desk */
  const readable = FIELDS.flatMap((f) => f.books.filter((b) => b.readable));
  const withProg = readable
    .map((b) => ({ b, p: bookProgress(s, b.id, totalParas(b.id)) }))
    .sort((a, z) => (z.p > 0 && z.p < 1 ? 1 : 0) - (a.p > 0 && a.p < 1 ? 1 : 0) || z.p - a.p);
  const current: { b: Book; p: number } =
    withProg.find((x) => x.p > 0 && x.p < 1) ?? withProg.find((x) => x.p === 0) ?? withProg[0];

  const shelf = readable.slice(0, 9);
  const q = QUOTES[qi];

  return (
    <div>
      {/* ========== سرلوح ========== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-14 lg:grid-cols-12 lg:gap-8 lg:pt-20">
          {/* متن سرلوح */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-read text-lg text-gold/90">به نام آن که جان را نور بخشید</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 font-display text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.95] text-bone">
                مکتب<span className="text-gold">‌خانه</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 max-w-xl text-lg font-medium leading-9 text-dim">
                سیرِ مطالعاتیِ علوم انسانی و معارف اسلامی — از سطح یک دانش‌آموز تا مرتبهٔ
                <span className="text-goldsoft"> استادیِ علمی</span>؛ تنها با خواندنِ نظام‌مند متون.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-7 border-r-2 border-gold/50 pr-4">
                <p key={qi} className="font-read text-xl leading-9 text-bone/90 md:text-2xl" style={{ animation: "fadeSwap 5.2s ease both" }}>
                  «{q.text}»
                </p>
                <p className="mt-1 text-sm text-faint">— {q.by}</p>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => roadmapField()}
                  className="group inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-bold text-ink shadow-[0_8px_30px_-8px_rgba(217,164,65,0.55)] transition-all hover:-translate-y-0.5 hover:bg-goldsoft active:translate-y-0"
                >
                  آغاز سیر مطالعاتی
                  <Icon name="arrow" size={18} className="transition-transform group-hover:-translate-x-1" />
                </button>
                <button
                  onClick={() => filterLibrary()}
                  className="inline-flex items-center gap-2 rounded-lg border border-line2 bg-panel px-6 py-3 font-semibold text-bone transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:text-goldsoft"
                >
                  <Icon name="bookOpen" size={18} />
                  ورود به کتابخانه
                </button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/50 sm:grid-cols-4">
                {[
                  { icon: "flame", label: "روزهای پیوسته", v: streak, color: "#d97b4a" },
                  { icon: "bookOpen", label: "بندِ خوانده‌شده", v: viewed, color: "#3fb3a3" },
                  { icon: "marker", label: "هایلایت و یادداشت", v: highlights + notes, color: "#d9a441" },
                  { icon: "target", label: "آزمونِ گرفته‌شده", v: quizzes, color: "#c94f5f" },
                ].map((st) => (
                  <div key={st.label} className="bg-ink2 px-4 py-4">
                    <div className="flex items-center gap-2" style={{ color: st.color }}>
                      <Icon name={st.icon} size={17} />
                      <span className="font-display text-3xl leading-none text-bone">
                        <CountUp value={st.v} />
                      </span>
                    </div>
                    <dt className="mt-1.5 text-[12px] text-faint">{st.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* میز مطالعه */}
          <div className="lg:col-span-5">
            <Reveal delay={200} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-line bg-panel p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-xl text-bone">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-turq" />
                    میز مطالعهٔ شما
                  </h2>
                  <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-dim">
                    {current?.p > 0 && current.p < 1 ? "در حال مطالعه" : "آغاز نکرده"}
                  </span>
                </div>

                {current && (
                  <button
                    onClick={() => read(current.b.id)}
                    className="group mt-5 rounded-xl border border-line bg-ink2 p-5 text-right transition-all hover:border-gold/50 hover:bg-panel2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl leading-8 text-goldsoft">{current.b.title}</p>
                        <p className="mt-1 text-[13px] text-dim">{current.b.author}</p>
                      </div>
                      <LevelBadge level={current.b.level} size="sm" />
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={current.p} color={LEVELS[current.b.level].color} />
                      <div className="mt-2 flex items-center justify-between text-[12px] text-faint">
                        <span>{fa(Math.round(current.p * 100))}٪ از متن خوانده شده</span>
                        <span className="font-semibold text-gold transition-transform group-hover:-translate-x-1">
                          {current.p > 0 && current.p < 1 ? "ادامهٔ مطالعه ←" : current.p >= 1 ? "مرور دوباره ←" : "گشودن صفحهٔ نخست ←"}
                        </span>
                      </div>
                    </div>
                  </button>
                )}

                {/* طاقچهٔ کتاب‌ها */}
                <div className="mt-6 flex-1">
                  <p className="mb-3 text-[12px] font-semibold text-faint">طاقچهٔ متون برگزیده</p>
                  <div className="flex h-40 items-end justify-center gap-1.5 border-b-4 border-line2 pb-0">
                    {shelf.map((b, i) => {
                      const c = LEVELS[b.level].color;
                      const read01 = bookProgress(s, b.id, totalParas(b.id));
                      return (
                        <button
                          key={b.id}
                          onClick={() => read(b.id)}
                          title={b.title}
                          className="group relative w-8 overflow-hidden rounded-t-[4px] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_24px_-8px_rgba(217,164,65,0.5)] md:w-9"
                          style={{ height: `${58 + ((i * 37) % 38)}%`, background: `linear-gradient(180deg, ${c}e6, ${c}99)`, borderInlineStart: "2px solid rgba(12,17,32,0.35)" }}
                        >
                          <span className="absolute inset-x-0 top-2 mx-auto flex justify-center">
                            <span className="text-[9px] font-bold text-ink/80" style={{ writingMode: "vertical-rl" }}>
                              {b.title.split(" ")[0].slice(0, 10)}
                            </span>
                          </span>
                          {read01 > 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-ink/70" style={{ height: `${read01 * 100}%` }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-center text-[11px] text-faint">برای گشودن متن، بر عطفِ کتاب بزنید</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== مرام‌نامهٔ «فقط متن» ========== */}
      <section className="relative border-y border-line bg-ink2/60">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <Reveal>
            <div className="flex flex-col items-start gap-2">
              <span className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-tight text-bone">
                اینجا <span className="text-gold">فقط متن</span> است — و شما.
              </span>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "۰۱", t: "نه ویدئو، نه کلاس زنده", d: "هیچ ویدئویی پخش نمی‌شود و هیچ کلاسی برگزار نمی‌گردد. ابزار پیشرفت شما فقط خواندنِ مستمر و هدفمند متون درسی است." },
              { n: "۰۲", t: "نه منتور، نه انجمن", d: "مسیر از پیش ترسیم شده است: سرفصل، بازهٔ زمانی و پیش‌نیازها. شما با ارادهٔ شخصی، گام‌به‌گام جلو می‌روید." },
              { n: "۰۳", t: "بله، عمقِ مطالعه", d: "هایلایت، یادداشت حاشیه‌ای، خلاصه‌نویسی و نشان‌گذاری؛ و سنجشِ جدیِ درک مطلب تا راهِ استادی گشوده بماند." },
            ].map((x, i) => (
              <Reveal key={x.n} delay={i * 120}>
                <div className="group flex gap-4 rounded-xl border border-line/60 bg-panel/60 p-5 transition-colors hover:border-gold/40">
                  <span className="font-display text-3xl text-gold/50 transition-colors group-hover:text-gold">{x.n}</span>
                  <div>
                    <h3 className="font-bold text-bone">{x.t}</h3>
                    <p className="mt-2 text-[14px] leading-7 text-dim">{x.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== دو شاخه ========== */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionHead
          kicker="پوشش رشته‌ها"
          title="دو شاخه، بیست زیرشاخه، یک مسیر"
          desc="هر زیرشاخه سرفصل مدون خود را دارد؛ کتاب‌ها از مقدماتی تا اجتهادی چیده شده‌اند و پیش‌نیازها راه را روشن می‌کنند."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {(Object.keys(BRANCHES) as Array<keyof typeof BRANCHES>).map((br, bi) => (
            <Reveal key={br} delay={bi * 120}>
              <div className="overflow-hidden rounded-2xl border border-line bg-panel">
                <div className="flex items-center justify-between border-b border-line px-6 py-5">
                  <div>
                    <h3 className="font-display text-2xl text-bone">{BRANCHES[br].name}</h3>
                    <p className="mt-1 text-[13px] text-dim">{BRANCHES[br].tagline}</p>
                  </div>
                  <Icon name={br === "islamic" ? "quran" : "laurel"} size={34} className="text-gold/70" />
                </div>
                <ul>
                  {FIELDS.filter((f) => f.branch === br).map((f, i) => (
                    <li key={f.id} style={{ borderTop: i ? "1px solid rgba(39,49,90,0.6)" : undefined }}>
                      <button
                        onClick={() => filterLibrary(br, f.id)}
                        className="group flex w-full items-center gap-4 px-6 py-3.5 text-right transition-colors hover:bg-panel2"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-turq transition-colors group-hover:border-turq/60 group-hover:text-turqsoft">
                          <Icon name={f.icon} size={19} />
                        </span>
                        <span className="flex-1">
                          <span className="block font-bold text-bone/90 transition-colors group-hover:text-goldsoft">{f.title}</span>
                          <span className="mt-0.5 block text-[12px] text-faint">{f.tagline}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-ink2 px-2.5 py-1 text-[11px] font-semibold text-dim">
                          {fa(f.books.length)} اثر
                        </span>
                        <Icon name="chev" size={16} className="rotate-180 text-faint transition-all group-hover:-translate-x-1 group-hover:text-gold" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ========== چهار ستون سکو ========== */}
      <section className="border-y border-line bg-ink2/50">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <SectionHead
            kicker="ساختار سکو"
            title="چهار ستونِ یک آموزشِ تمام‌متنی"
            desc="هرچه در یک حوزهٔ علمیه یا دانشکدهٔ جدی می‌گذرد — اما روی کاغذ و در سکوت."
          />
          <div className="mt-12 space-y-6">
            {[
              {
                n: "ستون یک",
                t: "کتابخانهٔ جامع و سلسله‌مراتبی",
                d: "متون اصلی، ترجمه‌های معتبر و شروح روان — هر اثر با برچسب سطح، بازهٔ زمانی پیشنهادی و مباحث کلیدی؛ تا بدانید امروز کجای مسیرید و فردا کدام جلد را بگشایید.",
                visual: (
                  <div className="flex flex-wrap gap-2">
                    {([1, 2, 3, 4] as const).map((l) => (
                      <LevelBadge key={l} level={l} />
                    ))}
                  </div>
                ),
                go: () => filterLibrary(),
                cta: "دیدن کتابخانه",
                icon: "bookOpen",
              },
              {
                n: "ستون دوم",
                t: "نقشهٔ راهِ مطالعه برای هر رشته",
                d: "ترتیب کتاب‌ها، هفته‌های پیشنهادی و پیش‌نیازها در یک خط زمانی روشن؛ بدون سردرگمی می‌دانید پس از مظفر به کفایه می‌رسید، پس از راسل به جمهور.",
                visual: (
                  <div className="flex items-center gap-2">
                    {["آموزش فلسفه", "بدایة الحکمة", "نهایة الحکمة"].map((x, i) => (
                      <span key={x} className="flex items-center gap-2">
                        <span className={cx("rounded-md border px-2 py-1 text-[11px]", i === 0 ? "border-turq/50 text-turqsoft" : "border-line text-dim")}>{x}</span>
                        {i < 2 && <Icon name="chev" size={13} className="rotate-180 text-faint" />}
                      </span>
                    ))}
                  </div>
                ),
                go: () => roadmapField(),
                cta: "دیدن نقشهٔ راه",
                icon: "route",
              },
              {
                n: "ستون سوم",
                t: "سنجشِ درکِ مطلب، نه حفظِ مطلب",
                d: "پس از خواندن هر درس، بانکِ سوالات تشریحی، تحلیلی و تست‌های چهارگزینه‌ای منتظر شماست؛ با تحلیل موضوعی پاسخ‌ها، نقاط ضعف‌تان را دقیق می‌بینید.",
                visual: (
                  <div className="space-y-1.5 text-[12px]">
                    <div className="rounded-md border border-line px-3 py-1.5 text-dim">۱) شاخه‌ای از علوم تجربی</div>
                    <div className="rounded-md border border-turq/60 bg-turq/10 px-3 py-1.5 font-semibold text-turqsoft">۲) موجود بما هو موجود ✓</div>
                    <div className="rounded-md border border-line px-3 py-1.5 text-dim">۳) رویدادهای تاریخی</div>
                  </div>
                ),
                go: () => assess(),
                cta: "ورود به آزمون‌ها",
                icon: "target",
              },
              {
                n: "ستون چهارم",
                t: "ابزارهای مطالعهٔ عمیق",
                d: "هر بندِ متن را هایلایت کنید، در حاشیه یادداشت بنویسید، صفحه‌های مهم را نشان بگذارید و با خلاصه‌ساز هوشمند، عصارهٔ فصل را برای مرور بردارید.",
                visual: (
                  <div className="rounded-lg bg-paper p-3 text-paperink shadow-inner">
                    <p className="font-read text-[15px] leading-6">
                      فلسفه دانشی است که از <span className="para-mark px-1">کلی‌ترین پرسش‌ها دربارهٔ هستی</span> سخن می‌گوید…
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <span className="rounded bg-gold/25 px-1.5 py-0.5 text-[10px] font-bold text-[#8a6420]">هایلایت</span>
                      <span className="rounded bg-turq/20 px-1.5 py-0.5 text-[10px] font-bold text-[#1f6e62]">یادداشت حاشیه</span>
                      <span className="rounded bg-lal/15 px-1.5 py-0.5 text-[10px] font-bold text-[#a03a49]">نشان</span>
                    </div>
                  </div>
                ),
                go: () => read("b-fal-1"),
                cta: "گشودن متن نمونه",
                icon: "marker",
              },
            ].map((row, i) => (
              <Reveal key={row.n} delay={i * 60}>
                <div className="group grid items-center gap-6 rounded-2xl border border-line bg-panel/70 p-6 transition-all hover:border-gold/40 md:grid-cols-12 md:p-8">
                  <div className="md:col-span-1">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                      <Icon name={row.icon} size={24} />
                    </span>
                  </div>
                  <div className="md:col-span-5">
                    <p className="text-[12px] font-semibold tracking-wide text-gold/80">{row.n}</p>
                    <h3 className="mt-1 font-display text-2xl text-bone">{row.t}</h3>
                    <p className="mt-2 text-[14px] leading-7 text-dim">{row.d}</p>
                  </div>
                  <div className="md:col-span-4">
                    <div className="rounded-xl border border-line bg-ink2 p-4">{row.visual}</div>
                  </div>
                  <div className="md:col-span-2 md:text-left">
                    <button
                      onClick={row.go}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 px-4 py-2 text-sm font-bold text-goldsoft transition-all hover:bg-gold hover:text-ink"
                    >
                      {row.cta}
                      <Icon name="chev" size={15} className="rotate-180" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== پروژه و گواهی ========== */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="cert-preview relative mx-auto max-w-sm rotate-[-3deg] rounded-xl border-2 border-gold/70 bg-ink2 p-6 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:rotate-0">
              <div className="rounded-lg border border-gold/30 p-5 text-center">
                <Icon name="seal" size={34} className="mx-auto text-gold" />
                <p className="mt-2 font-display text-xl text-goldsoft">گواهی مهارت مکتب‌خانه</p>
                <p className="mt-3 font-read text-2xl text-bone">بدین‌وسیله گواهی می‌شود</p>
                <p className="mt-1 border-b border-dashed border-line2 pb-1 font-display text-2xl text-turqsoft">
                  {s.name || "………………"}
                </p>
                <p className="mt-3 text-[12px] leading-6 text-dim">
                  پژوهش پایانیِ سطح میانی را با موفقیت به انجام رسانده و به مرتبهٔ پژوهشگر نائل آمده است.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <SectionHead
              kicker="پروژه‌های پژوهشی"
              title="در پایان هر مقطع، بنویسید تا استاد شوید"
              desc="چهار پروژهٔ تحقیقاتیِ متن‌محور — از گزارش تحلیلی تا مقالهٔ پژوهشی — در انتظار شماست. نوشتنِ تطبیقی بر اساس متون خوانده‌شده، معیار صدور گواهی مهارت هر سطح است."
            />
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => nav("research")}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-goldsoft"
              >
                <Icon name="quill" size={18} />
                دیدن پروژه‌ها
              </button>
              <button
                onClick={() => nav("dossier")}
                className="inline-flex items-center gap-2 rounded-lg border border-line2 px-5 py-2.5 font-semibold text-bone transition-all hover:border-turq/60 hover:text-turqsoft"
              >
                <Icon name="seal" size={18} />
                کارنامه و گواهی‌ها
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== نردبان استادی ========== */}
      <section className="border-t border-line bg-ink2/60">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <Ornament />
          <div className="mt-6 text-center">
            <h2 className="font-display text-3xl text-bone md:text-4xl">از آماتوری تا استادی — چهار پلهٔ خواندن</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {([1, 2, 3, 4] as const).map((l, i) => (
              <Reveal key={l} delay={i * 100}>
                <button
                  onClick={() => roadmapField()}
                  className="group flex h-full w-full flex-col items-start rounded-xl border p-5 text-right transition-all hover:-translate-y-1"
                  style={{ borderColor: `${LEVELS[l].color}55`, background: LEVELS[l].soft, marginTop: `${(3 - i) * 8}px` }}
                >
                  <LevelBadge level={l} size="sm" />
                  <p className="mt-3 font-display text-lg leading-7 text-bone">
                    {l === 1 ? "تسلط بر مقدمات" : l === 2 ? "دست‌یابی به تحلیل" : l === 3 ? "قدرت استنباط و نقد" : "تدریس و نگارش پژوهشی"}
                  </p>
                  <span className="mt-auto pt-3 text-[12px] font-semibold transition-colors group-hover:text-goldsoft" style={{ color: LEVELS[l].color }}>
                    {l === 4 ? "قلهٔ مسیر" : `پلهٔ ${fa(i + 1)}`}
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
