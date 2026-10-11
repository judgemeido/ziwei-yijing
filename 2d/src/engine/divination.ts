import type { ChartModel } from "./types";
import { castByNameTime, nuclearHexagram, changedHexagram, deriveHexagram, castDeriv, branchNum, type Hexagram, type HexDeriv } from "./iching";
import { nameStrokes, type NameStrokeResult } from "./strokes";
import { solarToLunarGanzhi } from "./astrology";

export type DivTense = "past" | "present" | "future";

export interface Divination {
  name: string;
  nameInfo: NameStrokeResult | null;
  castTime: Date;
  castSolar: string;      // YYYY-MM-DD
  castHour: number;
  castLunarText: string;
  ben: Hexagram;          // 本卦 = 当下
  hu: Hexagram;           // 互卦 = 过去/来路
  bian: Hexagram;         // 变卦 = 未来/走向
  deriv: HexDeriv;        // 起卦推导步骤(姓名+时间)
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 以「姓名(康熙笔画)+ 卜卦时间」梅花易数起卦:
 * 本卦=当下、互卦=过去/来路、变卦=未来/走向。
 */
export async function divine(name: string, castTime: Date): Promise<Divination> {
  const nameInfo = name.trim() ? await nameStrokes(name) : null;
  const nameStrokeTotal = nameInfo?.total ?? 0;

  const castSolar = fmtDate(castTime);
  const castHour = castTime.getHours();
  const gz = await solarToLunarGanzhi(castSolar, castHour);

  const ben = castByNameTime({
    nameStrokes: nameStrokeTotal,
    yearBranch: gz.yearBranch,
    month: gz.month,
    day: gz.day,
    hourBranch: gz.hourBranch,
  });
  const hu = nuclearHexagram(ben);
  const bian = changedHexagram(ben);

  const nameParts = nameInfo
    ? nameInfo.perChar.map((c) => ({ label: c.char + "→" + c.trad, value: c.strokes }))
    : [{ label: "未填姓名", value: 0 }];
  const deriv = castDeriv({
    nameStrokes: nameStrokeTotal,
    nameParts,
    yearBranch: gz.yearBranch,
    yearNum: branchNum(gz.yearBranch),
    month: gz.month,
    day: gz.day,
    hourBranch: gz.hourBranch,
    hourNum: branchNum(gz.hourBranch),
  });

  return {
    name: name.trim(),
    nameInfo,
    castTime,
    castSolar,
    castHour,
    castLunarText: gz.lunarText,
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
