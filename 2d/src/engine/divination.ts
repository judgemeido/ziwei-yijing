import type { ChartModel, LunarInfo } from "./types";
import { castByNameTime, nuclearHexagram, changedHexagram, deriveHexagram, castDeriv, branchNum, type Hexagram, type HexDeriv } from "./iching";
import { nameStrokesSplit, type NameStrokeResult } from "./strokes";
import { solarToLunarGanzhi } from "./astrology";

export type DivTense = "past" | "present" | "future";

export interface Divination {
  name: string;
  nameInfo: NameStrokeResult | null;
  castTime: Date;
  castSolar: string;      // YYYY-MM-DD
  castHour: number;
  castLunarText: string;
  birthLunar: LunarInfo;  // 生辰八字(农历/干支)
  ben: Hexagram;          // 本卦 = 当下
  hu: Hexagram;           // 互卦 = 过去/来路
  bian: Hexagram;         // 变卦 = 未来/走向
  deriv: HexDeriv;        // 起卦推导步骤(姓名+生辰八字+卜时)
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 以「姓名(姓/名分列)+ 生辰八字 + 卜卦时间」梅花易数复合起卦:
 * 本卦=当下、互卦=过去/来路、变卦=未来/走向。
 * 生辰八字(出生年支/月/日/时支)并入起卦,姓定上卦根基、名并卜时定下卦。
 */
export interface NameParts { surname: string; given: string; }

export async function divine(nameParts: NameParts, castTime: Date, birthLunar: LunarInfo): Promise<Divination> {
  const surname = (nameParts.surname || "").trim();
  const given = (nameParts.given || "").trim();
  const fullName = (surname + given).trim();
  const nameInfo = fullName ? await nameStrokesSplit(surname, given) : null;
  const surnameStrokes = nameInfo?.surnameStrokes ?? 0;
  const givenStrokes = nameInfo?.givenStrokes ?? 0;

  const castSolar = fmtDate(castTime);
  const castHour = castTime.getHours();
  const gz = await solarToLunarGanzhi(castSolar, castHour);

  const ben = castByNameTime({
    surnameStrokes,
    givenStrokes,
    birthYearBranch: birthLunar.yearBranch,
    birthMonth: birthLunar.month,
    birthDay: birthLunar.day,
    birthHourBranch: birthLunar.hourBranch,
    castYearBranch: gz.yearBranch,
    castMonth: gz.month,
    castDay: gz.day,
    castHourBranch: gz.hourBranch,
  });
  const hu = nuclearHexagram(ben);
  const bian = changedHexagram(ben);

  const surnameLabel = nameInfo && nameInfo.surname
    ? nameInfo.surname + "(" + surnameStrokes + ")"
    : "未填";
  const givenLabel = nameInfo && nameInfo.given
    ? nameInfo.given + "(" + givenStrokes + ")"
    : "未填";
  const deriv = castDeriv({
    surnameStrokes,
    givenStrokes,
    surnameLabel,
    givenLabel,
    birthYearBranch: birthLunar.yearBranch,
    birthYearNum: branchNum(birthLunar.yearBranch),
    birthMonth: birthLunar.month,
    birthDay: birthLunar.day,
    birthHourBranch: birthLunar.hourBranch,
    birthHourNum: branchNum(birthLunar.hourBranch),
    castYearBranch: gz.yearBranch,
    castMonth: gz.month,
    castDay: gz.day,
    castHourBranch: gz.hourBranch,
    castHourNum: branchNum(gz.hourBranch),
  });

  return {
    name: fullName,
    nameInfo,
    castTime,
    castSolar,
    castHour,
    castLunarText: gz.lunarText,
    birthLunar,
    ben,
    hu,
    bian,
    deriv,
  };
}

/** 命盘自带的本命卦(出生起卦),与卜卦分开。 */
export function benmingOf(chart: ChartModel): Hexagram {
  return deriveHexagram(chart);
}
