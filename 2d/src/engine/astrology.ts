import type { ChartModel, Palace, Star, StarType, Mutagen, PalaceName } from "./types";

export interface BirthInput {
  solarDate: string;
  timeIndex: number;
  gender: "male" | "female";
}

type IztroStar = { name: string; type: string; brightness?: string; mutagen?: string };

function toStar(s: IztroStar): Star {
  const mutagen = s.mutagen && s.mutagen.length > 0 ? (s.mutagen as Mutagen) : undefined;
  return {
    name: s.name,
    type: s.type as StarType,
    brightness: s.brightness || undefined,
    mutagen,
  };
}

/** 接入 iztro(动态加载),排出紫微斗数命盘并附带易经起卦所需的农历/干支数值。 */
export async function buildChart(input: BirthInput): Promise<ChartModel> {
  const { solarDate, timeIndex, gender } = input;
  if (!solarDate) throw new Error("请提供公历出生日期");
  if (timeIndex < 0 || timeIndex > 11) throw new Error("时辰序号须在 0-11 之间");

  const { astro } = await import("iztro");
  const genderCn = gender === "male" ? "男" : "女";
  const astrolabe = astro.bySolar(solarDate, timeIndex, genderCn, true, "zh-CN");

  const palaces: Palace[] = astrolabe.palaces.map((p) => ({
    index: p.index,
    name: p.name as PalaceName,
    earthlyBranch: p.earthlyBranch,
    isBodyPalace: p.isBodyPalace,
    stars: [
      ...p.majorStars.map((s) => toStar(s as unknown as IztroStar)),
      ...p.minorStars.map((s) => toStar(s as unknown as IztroStar)),
      ...p.adjectiveStars.map((s) => toStar(s as unknown as IztroStar)),
    ],
  }));

  const soulIndex = palaces.findIndex((p) => p.name === "命宫");
  const bodyIndex = palaces.findIndex((p) => p.isBodyPalace);

  const raw = (astrolabe as unknown as {
    rawDates: {
      lunarDate: { lunarYear: number; lunarMonth: number; lunarDay: number; isLeap: boolean };
      chineseDate: { yearly: string[]; monthly: string[]; daily: string[]; hourly: string[] };
    };
  }).rawDates;

  return {
    palaces,
    soulIndex,
    bodyIndex,
    soul: astrolabe.soul,
    body: astrolabe.body,
    fiveElementsClass: astrolabe.fiveElementsClass,
    zodiac: astrolabe.zodiac,
    sign: astrolabe.sign,
    gender,
    solarDate: astrolabe.solarDate,
    lunarDate: astrolabe.lunarDate,
    lunar: {
      year: raw.lunarDate.lunarYear,
      month: raw.lunarDate.lunarMonth,
      day: raw.lunarDate.lunarDay,
      isLeap: raw.lunarDate.isLeap,
      yearBranch: raw.chineseDate.yearly[1],
      monthBranch: raw.chineseDate.monthly[1],
      hourBranch: raw.chineseDate.hourly[1],
    },
  };
}

export interface LunarGanzhi {
  yearBranch: string;
  month: number;
  day: number;
  hourBranch: string;
  timeIndex: number;
  lunarText: string;
}

/** 把任意公历日期 + 小时转成农历月日与年支/时支(供卜卦起卦)。复用 iztro。 */
export async function solarToLunarGanzhi(solarDate: string, hour: number): Promise<LunarGanzhi> {
  const timeIndex = Math.floor(((hour % 24) + 1) / 2) % 12;
  const { astro } = await import("iztro");
  const a = astro.bySolar(solarDate, timeIndex, "男", true, "zh-CN");
  const raw = (a as unknown as {
    rawDates: {
      lunarDate: { lunarMonth: number; lunarDay: number };
      chineseDate: { yearly: string[]; hourly: string[] };
    };
    lunarDate: string;
  });
  return {
    yearBranch: raw.rawDates.chineseDate.yearly[1],
    month: raw.rawDates.lunarDate.lunarMonth,
    day: raw.rawDates.lunarDate.lunarDay,
    hourBranch: raw.rawDates.chineseDate.hourly[1],
    timeIndex,
    lunarText: raw.lunarDate,
  };
}
