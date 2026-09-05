import { useEffect, useState } from "react";
import { AppProvider, useApp, fa, cx } from "./store";
import { Icon } from "./icons";
import Home from "./views/Home";
import Library from "./views/Library";
import Roadmap from "./views/Roadmap";
import Reader from "./views/Reader";
import Assessment from "./views/Assessment";
import Projects from "./views/Projects";
import Dossier from "./views/Dossier";

type View = "home" | "library" | "roadmap" | "assess" | "research" | "dossier";

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "home", label: "خانه", icon: "lamp" },
  { id: "library", label: "کتابخانه", icon: "bookOpen" },
  { id: "roadmap", label: "نقشهٔ راه", icon: "route" },
  { id: "assess", label: "سنجش", icon: "target" },
  { id: "research", label: "پژوهش و گواهی", icon: "quill" },
  { id: "dossier", label: "کارنامه", icon: "seal" },
];

const DUST = [
  { left: "8%", delay: "0s", dur: "16s" },
  { left: "22%", delay: "4s", dur: "20s" },
  { left: "47%", delay: "9s", dur: "14s" },
  { left: "68%", delay: "2s", dur: "18s" },
  { left: "84%", delay: "7s", dur: "15s" },
  { left: "93%", delay: "12s", dur: "21s" },
];

function Shell() {
  const { streak, s } = useApp();
  const [view, setView] = useState<View>("home");
  const [readerBook, setReaderBook] = useState<string | null>(null);
  const [assessPreset, setAssessPreset] = useState<string | undefined>(undefined);
  const [libPreset, setLibPreset] = useState<{ branch?: string; field?: string }>({});
  const [roadPreset, setRoadPreset] = useState<string | undefined>(undefined);

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const openRead = (bookId: string) => setReaderBook(bookId);
  const openAssess = (bookId?: string) => {
    setAssessPreset(bookId);
    go("assess");
  };
  const openLibrary = (branch?: string, field?: string) => {
    setLibPreset({ branch, field });
    go("library");
  };
  const openRoadmap = (field?: string) => {
    setRoadPreset(field);
    go("roadmap");
  };

  const notesCount = Object.values(s.notes).reduce((a, l) => a + l.length, 0);
  const badge = view === "dossier" && notesCount > 0;

  return (
    <div className="relative min-h-screen">
      {/* ---------- پس‌زمینهٔ محیطی ---------- */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
        <div className="khatam absolute inset-0 opacity-[0.05]" />
        <div className="anim-glow-a absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-[#1c2f63] blur-[130px]" />
        <div className="anim-glow-b absolute bottom-[-20%] left-[-8%] h-[30rem] w-[30rem] rounded-full bg-[#3d2f14] blur-[130px]" />
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-[#123333] opacity-60 blur-[110px]" />
        {DUST.map((d, i) => (
          <span key={i} className="dust" style={{ left: d.left, animationDelay: d.delay, animationDuration: d.dur }} />
        ))}
      </div>

      {/* ---------- نوار بالا ---------- */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <button onClick={() => go("home")} className="group flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/40 bg-gold/10 text-gold transition-all group-hover:bg-gold group-hover:text-ink">
              <Icon name="star8" size={22} />
            </span>
            <span className="text-right">
              <span className="block font-display text-xl leading-5 text-bone">مکتب‌خانه</span>
              <span className="block text-[10px] text-faint">سیر مطالعاتی · متن‌محور</span>
            </span>
          </button>

          <nav className="mx-auto hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={cx(
                  "relative rounded-lg px-3.5 py-2 text-[13px] font-bold transition-all",
                  view === n.id ? "bg-gold/14 text-goldsoft" : "text-dim hover:bg-panel hover:text-bone"
                )}
              >
                {n.label}
                {view === n.id && <span className="absolute -bottom-[13px] left-3 right-3 h-0.5 rounded-full bg-gold" />}
              </button>
            ))}
          </nav>

          <div className="mr-auto flex items-center gap-2 md:mr-0">
            <span className="flex items-center gap-1.5 rounded-full border border-verm/40 bg-verm/10 px-3 py-1.5 text-[12px] font-bold text-verm" title="روزهای پیوستهٔ مطالعه">
              <Icon name="flame" size={15} />
              {fa(streak)} روز
            </span>
            {badge && (
              <span className="hidden items-center gap-1.5 rounded-full border border-turq/40 bg-turq/10 px-3 py-1.5 text-[12px] font-bold text-turqsoft sm:flex">
                <Icon name="note" size={14} />
                {fa(notesCount)} یادداشت
              </span>
            )}
          </div>
        </div>
        {/* ناوبری موبایل */}
        <nav className="flex gap-1 overflow-x-auto border-t border-line/60 px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={cx(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors",
                view === n.id ? "bg-gold/15 text-goldsoft" : "text-dim"
              )}
            >
              <Icon name={n.icon} size={14} />
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ---------- بدنه ---------- */}
      <main>
        {view === "home" && (
          <Home nav={(v) => go(v as View)} read={openRead} assess={openAssess} filterLibrary={openLibrary} roadmapField={openRoadmap} />
        )}
        {view === "library" && (
          <Library
            key={`${libPreset.branch ?? "all"}-${libPreset.field ?? "all"}`}
            read={openRead}
            roadmapField={openRoadmap}
            assess={openAssess}
            presetBranch={libPreset.branch}
            presetField={libPreset.field}
          />
        )}
        {view === "roadmap" && (
          <Roadmap key={roadPreset ?? "default"} presetField={roadPreset} read={openRead} assess={openAssess} />
        )}
        {view === "assess" && <Assessment key={assessPreset ?? "list"} presetBook={assessPreset} read={openRead} />}
        {view === "research" && <Projects />}
        {view === "dossier" && <Dossier read={openRead} />}
      </main>

      {/* ---------- پانوشت ---------- */}
      <footer className="mt-8 border-t border-line bg-ink2/70">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-gold/40 bg-gold/10 text-gold">
                  <Icon name="star8" size={20} />
                </span>
                <span className="font-display text-2xl text-bone">مکتب‌خانه</span>
              </div>
              <p className="mt-4 max-w-sm text-[13px] leading-7 text-dim">
                سیر مطالعاتی علوم انسانی و معارف اسلامی؛ از سطح مقدماتی تا اجتهادی و پژوهشی. تنها ابزار شما: متن، قلم و اراده.
              </p>
              <p className="mt-4 flex items-center gap-2 text-[12px] text-faint">
                <Icon name="bookOpen" size={15} className="text-gold/70" />
                بدون ویدئو · بدون کلاس · بدون انجمن — فقط مطالعه
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="font-bold text-goldsoft">شاخه‌ها</p>
              <ul className="mt-3 space-y-2 text-[13px] text-dim">
                <li><button onClick={() => openLibrary("islamic")} className="transition-colors hover:text-goldsoft">علوم اسلامی و دروس حوزوی</button></li>
                <li><button onClick={() => openLibrary("humanities")} className="transition-colors hover:text-goldsoft">علوم انسانی رایج</button></li>
                <li><button onClick={() => openRoadmap()} className="transition-colors hover:text-goldsoft">نقشهٔ راه رشته‌ها</button></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <p className="font-bold text-goldsoft">پیمان مکتب‌خانه</p>
              <p className="mt-3 font-read text-lg leading-9 text-bone/80">
                «هر که خواهد که بداند، باید که بخواند؛ و هر که خواند و نیندیشید، چون کتابخانه‌ای است انباشته و بسته.»
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-5 text-[11px] text-faint">
            <span>مکتب‌خانه — سیر مطالعاتی تمام‌متنی</span>
            <span className="flex items-center gap-1.5">
              ساخته‌شده برای خوانندگانِ جدی
              <Icon name="lamp" size={13} className="text-gold/70" />
            </span>
          </div>
        </div>
      </footer>

      {/* ---------- متن‌خوان ---------- */}
      {readerBook && <Reader bookId={readerBook} onClose={() => setReaderBook(null)} onAssess={(id) => { setReaderBook(null); openAssess(id); }} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
