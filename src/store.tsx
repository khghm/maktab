import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { rankOf, nextRankOf, RANKS } from "./data";

/* ---------- helpers ---------- */
export const fa = (n: number | string) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const faDate = (ts: number) => {
  try {
    return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(ts));
  } catch {
    return "";
  }
};
export const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");
export const dayKey = (ts: number) => new Date(ts).toDateString();

/* ---------- types ---------- */
export interface Note {
  id: string;
  paraId: string;
  text: string;
  ts: number;
}
export interface QuizResult {
  score: number;
  total: number;
  pct: number;
  topics: Record<string, { right: number; all: number }>;
  ts: number;
}
export interface ProjectState {
  draft: string;
  checklist: Record<string, boolean>;
  rubric?: number[];
  score?: number;
  submittedAt?: number;
}
export interface Event {
  ts: number;
  xp: number;
  label: string;
}

export interface AppState {
  name: string;
  joined: number;
  viewed: Record<string, true>;
  finished: Record<string, number>;
  highlights: Record<string, Record<string, true>>;
  notes: Record<string, Note[]>;
  bookmarks: Record<string, Record<string, true>>;
  quizzes: Record<string, QuizResult>;
  projects: Record<string, ProjectState>;
  events: Event[];
}

const EMPTY: AppState = {
  name: "",
  joined: Date.now(),
  viewed: {},
  finished: {},
  highlights: {},
  notes: {},
  bookmarks: {},
  quizzes: {},
  projects: {},
  events: [],
};

const KEY = "maktabkhaneh-v1";

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as AppState) };
  } catch {
    return EMPTY;
  }
}

/* ---------- context ---------- */
interface Ctx {
  s: AppState;
  setName: (n: string) => void;
  markViewed: (key: string) => void;
  setFinished: (bookId: string) => void;
  toggleHighlight: (bookId: string, paraId: string) => void;
  saveNote: (bookId: string, paraId: string, text: string, noteId?: string) => void;
  deleteNote: (bookId: string, noteId: string) => void;
  toggleBookmark: (bookId: string, paraId: string) => void;
  saveQuiz: (bookId: string, r: QuizResult) => void;
  saveProject: (pid: string, p: ProjectState) => void;
  addEvent: (xp: number, label: string) => void;
  resetAll: () => void;
  xp: number;
  streak: number;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage full — ignore */
    }
  }, [s]);

  const value = useMemo<Ctx>(() => {
    const push = (fn: (p: AppState) => AppState) => setS((p) => fn(p));
    return {
      s,
      setName: (n) => push((p) => ({ ...p, name: n })),
      markViewed: (key) =>
        push((p) => (p.viewed[key] ? p : { ...p, viewed: { ...p.viewed, [key]: true } })),
      setFinished: (bookId) =>
        push((p) =>
          p.finished[bookId] ? p : { ...p, finished: { ...p.finished, [bookId]: Date.now() } }
        ),
      toggleHighlight: (bookId, paraId) =>
        push((p) => {
          const h = p.highlights[bookId] ?? {};
          const on = !h[paraId];
          return {
            ...p,
            highlights: { ...p.highlights, [bookId]: on ? { ...h, [paraId]: true } : Object.fromEntries(Object.entries(h).filter(([k]) => k !== paraId)) },
          };
        }),
      saveNote: (bookId, paraId, text, noteId) =>
        push((p) => {
          const list = p.notes[bookId] ?? [];
          const notes = noteId
            ? list.map((n) => (n.id === noteId ? { ...n, text, ts: Date.now() } : n))
            : [...list, { id: `n${Date.now()}`, paraId, text, ts: Date.now() }];
          return { ...p, notes: { ...p.notes, [bookId]: notes } };
        }),
      deleteNote: (bookId, noteId) =>
        push((p) => ({
          ...p,
          notes: { ...p.notes, [bookId]: (p.notes[bookId] ?? []).filter((n) => n.id !== noteId) },
        })),
      toggleBookmark: (bookId, paraId) =>
        push((p) => {
          const b = p.bookmarks[bookId] ?? {};
          const on = !b[paraId];
          return {
            ...p,
            bookmarks: { ...p.bookmarks, [bookId]: on ? { ...b, [paraId]: true } : Object.fromEntries(Object.entries(b).filter(([k]) => k !== paraId)) },
          };
        }),
      saveQuiz: (bookId, r) => push((p) => ({ ...p, quizzes: { ...p.quizzes, [bookId]: r } })),
      saveProject: (pid, ps) => push((p) => ({ ...p, projects: { ...p.projects, [pid]: ps } })),
      addEvent: (xp, label) =>
        push((p) => ({ ...p, events: [...p.events, { ts: Date.now(), xp, label }] })),
      resetAll: () => setS({ ...EMPTY, joined: Date.now() }),
      xp: s.events.reduce((a, e) => a + e.xp, 0),
      streak: (() => {
        const days = new Set(s.events.map((e) => dayKey(e.ts)));
        let n = 0;
        const d = new Date();
        if (!days.has(dayKey(d.getTime())) && days.size > 0) d.setDate(d.getDate() - 1);
        while (days.has(dayKey(d.getTime()))) {
          n++;
          d.setDate(d.getDate() - 1);
        }
        return n;
      })(),
    };
  }, [s]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}

export { rankOf, nextRankOf, RANKS };

/* ---------- derived helpers ---------- */
export const bookProgress = (s: AppState, bookId: string, totalParas: number) => {
  const keys = Object.keys(s.viewed).filter((k) => k.startsWith(bookId + "-"));
  return totalParas ? Math.min(1, keys.length / totalParas) : 0;
};
