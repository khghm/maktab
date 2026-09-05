/* ساختار مشترک فصل‌ها و بندهای متن‌خوان */

/** بند متن: شناسه، متن اصلی و (به‌اختیار) عنوان زیربخش */
export interface Para {
  id: string;
  text: string;
  heading?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  index: number;
  title: string;
  paras: Para[];
}

/** قالب نوشتار محتوا: بند ساده یا [عنوان زیربخش، متن] */
export type ParaInput = string | [title: string, body: string];

export const ch = (bookId: string, index: number, title: string, inputs: ParaInput[]): Chapter => {
  const chId = `${bookId}-ch${index + 1}`;
  return {
    id: chId,
    bookId,
    index,
    title,
    paras: inputs.map((p, i): Para =>
      typeof p === "string"
        ? { id: `${chId}-p${i + 1}`, text: p }
        : { id: `${chId}-p${i + 1}`, heading: p[0], text: p[1] }
    ),
  };
};

/* خلاصه‌ساز استخراجی: جملات کلیدی هر فصل را برمی‌گرداند */
export const extractSummary = (paras: Para[]): string[] => {
  const chosen = paras.filter((p) => p.heading);
  const base = chosen.length ? chosen : paras.slice(0, 4);
  return base.slice(0, 6).map((p, i) => {
    let t = p.text;
    if (t.length > 190) {
      const cut = t.indexOf("؛", 120);
      t = (cut > 0 && cut < 240 ? t.slice(0, cut) : t.slice(0, 188).trimEnd()) + "…";
    }
    return `${i + 1}. ${p.heading ? p.heading + ": " : ""}${t}`;
  });
};
