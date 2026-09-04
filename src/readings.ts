/* تجمیع همهٔ متن‌های مطالعاتی — ساختار فصل‌ها در readings/_core */
export type { Para, Chapter, ParaInput } from "./readings/_core";
export { ch, extractSummary } from "./readings/_core";

import { Chapter } from "./readings/_core";
import { R_FIQH } from "./readings/r-fiqh";
import { R_USUL } from "./readings/r-usul";
import { R_FALSAFA } from "./readings/r-falsafa";
import { R_IRFAN } from "./readings/r-irfan";
import { R_KALAM } from "./readings/r-kalam";
import { R_TAFSIR_HADITH } from "./readings/r-tafsir-hadith";
import { R_SIRA_ADYAN_AKHLAQ } from "./readings/r-sira-adyan-akhlaq";
import { R_WPHIL } from "./readings/r-wphil";
import { R_LIT_HIST } from "./readings/r-lit-hist";
import { R_LIN_PSY } from "./readings/r-lin-psy";
import { R_SOC_EDU } from "./readings/r-soc-edu";
import { R_LAW_ECO_ART } from "./readings/r-law-eco-art";

export const READINGS: Record<string, Chapter[]> = {
  ...R_FIQH,
  ...R_USUL,
  ...R_FALSAFA,
  ...R_IRFAN,
  ...R_KALAM,
  ...R_TAFSIR_HADITH,
  ...R_SIRA_ADYAN_AKHLAQ,
  ...R_WPHIL,
  ...R_LIT_HIST,
  ...R_LIN_PSY,
  ...R_SOC_EDU,
  ...R_LAW_ECO_ART,
};

export const readableBookIds = () => Object.keys(READINGS);
