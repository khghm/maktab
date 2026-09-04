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
import { R_SUPP_ISLAMIC } from "./readings/r-supp-islamic";
import { R_SUPP_1 } from "./readings/r-supp-1";
import { R_SUPP_2 } from "./readings/r-supp-2";
import { R_FAL_EXT1 } from "./readings/r-fal-ext1";
import { R_FAL_EXT2 } from "./readings/r-fal-ext2";
import { R_FAL_EXT3 } from "./readings/r-fal-ext3";
import { R_FAL_EXT4 } from "./readings/r-fal-ext4";
import { R_FAL_EXT5 } from "./readings/r-fal-ext5";
import { R_FAL_EXT7 } from "./readings/r-fal-ext7";
import { R_WPH_EXT1 } from "./readings/r-wph-ext1";
import { R_WPH_EXT2 } from "./readings/r-wph-ext2";
import { R_WPH_EXT3 } from "./readings/r-wph-ext3";
import { R_FAL_EXT8 } from "./readings/r-fal-ext8";
import { R_IRF_EXT1A } from "./readings/r-irfan-ext1a";
import { R_IRF_EXT1B } from "./readings/r-irfan-ext1b";
import { R_IRF_EXT2 } from "./readings/r-irfan-ext2";
import { R_IRF_EXT3 } from "./readings/r-irfan-ext3";
import { R_IRF_EXT4 } from "./readings/r-irfan-ext4";
import { R_TAF_EXT1 } from "./readings/r-taf-ext1";
import { R_HAD_EXT1 } from "./readings/r-had-ext1";
import { R_SIR_EXT1 } from "./readings/r-sir-ext1";
import { R_ADY_EXT1 } from "./readings/r-ady-ext1";
import { R_AKH_EXT1 } from "./readings/r-akh-ext1";
import { R_ISL_EXT2 } from "./readings/r-isl-ext2";
import { R_LIT_EXT } from "./readings/r-lit-ext";
import { R_POL_1 } from "./readings/r-pol-1";
import { R_HIS_EXT } from "./readings/r-his-ext";
import { R_LINPSY_EXT } from "./readings/r-linpsy-ext";
import { R_SOC_EXT } from "./readings/r-soc-ext";
import { R_EDU_EXT } from "./readings/r-edu-ext";
import { R_LAW_EXT } from "./readings/r-law-ext";
import { R_ECO_EXT } from "./readings/r-eco-ext";
import { R_ART_EXT } from "./readings/r-art-ext";
import { R_FIQH_EXT1 } from "./readings/r-fiqh-ext1";
import { R_USUL_EXT1 } from "./readings/r-usul-ext1";
import { R_KAL_EXT1 } from "./readings/r-kalam-ext1";

const ALL_MAPS: Array<Record<string, Chapter[]>> = [
  R_SUPP_ISLAMIC,
  R_SUPP_1,
  R_SUPP_2,
  R_FAL_EXT1,
  R_FAL_EXT2,
  R_FAL_EXT3,
  R_FAL_EXT4,
  R_FAL_EXT5,
  R_FAL_EXT7,
  R_WPH_EXT1,
  R_WPH_EXT2,
  R_WPH_EXT3,
  R_FIQH_EXT1,
  R_USUL_EXT1,
  R_KAL_EXT1,
  R_FAL_EXT8,
  R_IRF_EXT1A,
  R_IRF_EXT1B,
  R_IRF_EXT2,
  R_IRF_EXT3,
  R_IRF_EXT4,
  R_TAF_EXT1,
  R_HAD_EXT1,
  R_SIR_EXT1,
  R_ADY_EXT1,
  R_AKH_EXT1,
  R_ISL_EXT2,
  R_LIT_EXT,
  R_POL_1,
  R_HIS_EXT,
  R_LINPSY_EXT,
  R_SOC_EXT,
  R_EDU_EXT,
  R_LAW_EXT,
  R_ECO_EXT,
  R_ART_EXT,
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

/* اصلاح شناسهٔ گلستان و شاهنامه برای انطباق با فهرست کتابخانه */
const ID_FIX: Record<string, string> = { "b-gol-1": "b-lit-1", "b-sha-1": "b-lit-2" };
const fix = (id: string) => ID_FIX[id] ?? id;

export const READINGS: Record<string, Chapter[]> = {};
for (const c of ALL) (READINGS[fix(c.bookId)] ??= []).push(c);
for (const m of ALL_MAPS)
  for (const id of Object.keys(m)) (READINGS[fix(id)] ??= []).push(...m[id]);
/* شماره‌گذاری پیوستهٔ فصل‌ها و شناسه‌های یکتا پس از ادغام همهٔ منابع */
for (const id of Object.keys(READINGS)) {
  const list = READINGS[id].sort((a, z) => a.index - z.index);
  READINGS[id] = list.map((c, i) => {
    const cid = `${id}-ch${i + 1}`;
    return {
      ...c,
      id: cid,
      bookId: id,
      index: i,
      paras: c.paras.map((p, j) => ({ ...p, id: `${cid}-p${j + 1}` })),
    };
  });
}

export const totalParasOf = (id: string) =>
  (READINGS[id] ?? []).reduce((sum, c) => sum + c.paras.length, 0);

export { ch, extractSummary };
export type { Chapter, Para, ParaInput };
