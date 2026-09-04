/* تجمیع همهٔ متن‌های خواندنی */
import type { Chapter, Para, ParaInput } from "./readings/_core";
import { ch, extractSummary } from "./readings/_core";
import { R_FIQH } from "./readings/r-fiqh";
import { R_USUL } from "./readings/r-usul";
import { R_FALSAFA } from "./readings/r-falsafa";
import { R_IRFAN } from "./readings/r-irfan";
import { R_KALAM } from "./readings/r-kalam";
import { R_TAFSIR_HADITH } from "./readings/r-tafsir-hadith";
import { R_SIRA_ADYAN_AKHLAQ } from "./readings/r-sira-adyan-akhlaq";
import { R_WPHIL } from "./readings/r-wphil";
import { LIT_HIST } from "./readings/r-lit-hist";
import { R_LIN_PSY } from "./readings/r-lin-psy";
import { R_SOC_EDU } from "./readings/r-soc-edu";
import { R_LAW_ECO_ART } from "./readings/r-law-eco-art";

const ALL_MAPS: Array<Record<string, Chapter[]>> = [
  R_FIQH,
  R_USUL,
  R_FALSAFA,
  R_IRFAN,
  R_KALAM,
  R_TAFSIR_HADITH,
  R_SIRA_ADYAN_AKHLAQ,
  R_WPHIL,
  R_LIN_PSY,
  R_SOC_EDU,
  R_LAW_ECO_ART,
];

const ALL: Chapter[] = [...LIT_HIST];

export const READINGS: Record<string, Chapter[]> = {};
for (const c of ALL) (READINGS[c.bookId] ??= []).push(c);
for (const m of ALL_MAPS)
  for (const id of Object.keys(m)) (READINGS[id] ??= []).push(...m[id]);
for (const id of Object.keys(READINGS))
  READINGS[id].sort((a, z) => a.index - z.index);

export const totalParasOf = (id: string) =>
  (READINGS[id] ?? []).reduce((sum, c) => sum + c.paras.length, 0);

export { ch, extractSummary };
export type { Chapter, Para, ParaInput };
