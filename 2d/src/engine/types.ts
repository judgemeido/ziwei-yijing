// 紫微斗数命盘数据模型(M1 由 iztro 填充;新增易经所需的农历/干支数值)。

export type PalaceName =
  | "命宫" | "兄弟" | "夫妻" | "子女" | "财帛" | "疾厄"
  | "迁移" | "仆役" | "官禄" | "田宅" | "福德" | "父母";

export type Mutagen = "禄" | "权" | "科" | "忌";

export type StarType =
  | "major" | "soft" | "tough" | "adjective"
  | "lucun" | "tianma" | "helper" | "flower";

export interface Star {
  name: string;
  type: StarType;
  brightness?: string;
  mutagen?: Mutagen;
}

export interface Palace {
  index: number;
  name: PalaceName;
  earthlyBranch: string;
  isBodyPalace: boolean;
  stars: Star[];
}

export interface LunarInfo {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  yearBranch: string;   // 年支(如 午)
  monthBranch: string;  // 月支
  hourBranch: string;   // 时支(如 戌)
}

export interface ChartModel {
  palaces: Palace[];
  soulIndex: number;
  bodyIndex: number;
  soul: string;
  body: string;
  fiveElementsClass: string;
  zodiac: string;
  sign: string;
  gender: "male" | "female";
  solarDate: string;
  lunarDate: string;
  lunar: LunarInfo;        // 新增:易经起卦所需
}
