import type { ChartModel } from "./types";

/** 八卦:先天数 1-8、符号、三爻(由下而上,true=阳)、卦象与性情。 */
export interface Trigram {
  name: string;      // 乾兑离震巽坎艮坤
  symbol: string;    // ☰☱☲☳☴☵☶☷
  nature: string;    // 天泽火雷风水山地
  xiantian: number;  // 先天数
  lines: [boolean, boolean, boolean]; // 下→上
  trait: string;
}

// 以先天数为序:乾1 兑2 离3 震4 巽5 坎6 艮7 坤8
export const TRIGRAMS: Record<number, Trigram> = {
  1: { name: "乾", symbol: "☰", nature: "天", xiantian: 1, lines: [true, true, true], trait: "刚健自强、主动开创" },
  2: { name: "兑", symbol: "☱", nature: "泽", xiantian: 2, lines: [true, true, false], trait: "喜悦和顺、善于沟通" },
  3: { name: "离", symbol: "☲", nature: "火", xiantian: 3, lines: [true, false, true], trait: "光明附丽、文明外显" },
  4: { name: "震", symbol: "☳", nature: "雷", xiantian: 4, lines: [false, false, true], trait: "奋动震起、果决行动" },
  5: { name: "巽", symbol: "☴", nature: "风", xiantian: 5, lines: [false, true, true], trait: "谦逊渗透、灵活顺入" },
  6: { name: "坎", symbol: "☵", nature: "水", xiantian: 6, lines: [false, true, false], trait: "险中有信、沉潜智慧" },
  7: { name: "艮", symbol: "☶", nature: "山", xiantian: 7, lines: [true, false, false], trait: "笃实稳重、适可而止" },
  8: { name: "坤", symbol: "☷", nature: "地", xiantian: 8, lines: [false, false, false], trait: "柔顺厚载、包容承托" },
};

export interface Hexagram {
  upper: Trigram;
  lower: Trigram;
  name: string;       // 如 水山蹇
  meaning: string;    // 一句现代释义
  movingLine: number; // 动爻 1-6(由下而上)
  lines: boolean[];   // 六爻 下→上
}

// 64 卦名矩阵:key = `上卦名:下卦名`。
const HEX_NAME: Record<string, string> = {
  "乾:乾": "乾为天", "乾:兑": "天泽履", "乾:离": "天火同人", "乾:震": "天雷无妄", "乾:巽": "天风姤", "乾:坎": "天水讼", "乾:艮": "天山遯", "乾:坤": "天地否",
  "兑:乾": "泽天夬", "兑:兑": "兑为泽", "兑:离": "泽火革", "兑:震": "泽雷随", "兑:巽": "泽风大过", "兑:坎": "泽水困", "兑:艮": "泽山咸", "兑:坤": "泽地萃",
  "离:乾": "火天大有", "离:兑": "火泽睽", "离:离": "离为火", "离:震": "火雷噬嗑", "离:巽": "火风鼎", "离:坎": "火水未济", "离:艮": "火山旅", "离:坤": "火地晋",
  "震:乾": "雷天大壮", "震:兑": "雷泽归妹", "震:离": "雷火丰", "震:震": "震为雷", "震:巽": "雷风恒", "震:坎": "雷水解", "震:艮": "雷山小过", "震:坤": "雷地豫",
  "巽:乾": "风天小畜", "巽:兑": "风泽中孚", "巽:离": "风火家人", "巽:震": "风雷益", "巽:巽": "巽为风", "巽:坎": "风水涣", "巽:艮": "风山渐", "巽:坤": "风地观",
  "坎:乾": "水天需", "坎:兑": "水泽节", "坎:离": "水火既济", "坎:震": "水雷屯", "坎:巽": "水风井", "坎:坎": "坎为水", "坎:艮": "水山蹇", "坎:坤": "水地比",
  "艮:乾": "山天大畜", "艮:兑": "山泽损", "艮:离": "山火贲", "艮:震": "山雷颐", "艮:巽": "山风蛊", "艮:坎": "山水蒙", "艮:艮": "艮为山", "艮:坤": "山地剥",
  "坤:乾": "地天泰", "坤:兑": "地泽临", "坤:离": "地火明夷", "坤:震": "地雷复", "坤:巽": "地风升", "坤:坎": "地水师", "坤:艮": "地山谦", "坤:坤": "坤为地",
};

// 64 卦一句现代释义(仅供文化娱乐)。
const HEX_MEANING: Record<string, string> = {
  "乾为天": "刚健进取,自强不息,利于主动开创、担当大任。",
  "坤为地": "厚德载物,柔顺包容,利于配合承托、积蓄后发。",
  "水雷屯": "万事起头难,如草木初生,宜扎根蓄力、不急冒进。",
  "山水蒙": "蒙昧待启,宜虚心受教、循序求知,终见光明。",
  "水天需": "时机未到需等待,守正养实力,饮食宴乐以待天时。",
  "天水讼": "争讼是非,宜退让化解、慎始息争,不宜缠斗到底。",
  "地水师": "统众如用兵,须名正纪严、择贤任能,以正取胜。",
  "水地比": "亲比相辅,择善而从、以诚结盟,早归者得吉。",
  "风天小畜": "小有积蓄、暂被牵制,宜以柔养刚、积小成大。",
  "天泽履": "如履虎尾而不伤,循礼谨慎而行,危中得安。",
  "地天泰": "天地交泰、上下通达,万物亨通,正是顺势大吉之象。",
  "天地否": "闭塞不通、上下不交,宜守正避难、俭德退藏待转机。",
  "天火同人": "与人同心、广结同道,公正无私则大事可成。",
  "火天大有": "柔居尊位、所有者大,顺天应时、谦和守成则大吉。",
  "地山谦": "谦谦君子、卑以自牧,愈谦愈受益,善始善终。",
  "雷地豫": "顺动和乐、未雨绸缪,利于建侯行师、安排在先。",
  "泽雷随": "随顺时势、择善而从,与时偕行则亨通无咎。",
  "山风蛊": "积弊待整治,敢于拨乱革新、匡正旧弊方见生机。",
  "地泽临": "阳气渐长、以上临下,宜趁势进取,然须防盛极而衰。",
  "风地观": "居高观下、以身作则,观察省思而后动,利于教化。",
  "火雷噬嗑": "如咬合去梗,明断是非、刚柔并用以除障碍。",
  "山火贲": "文饰之美,重修饰仪表章法,然须文质相宜、不尚虚华。",
  "山地剥": "阴盛剥阳、根基受损,宜顺时止损、厚下安宅待来复。",
  "地雷复": "一阳来复、否极泰来,循道而返,前景渐明。",
  "天雷无妄": "无妄而真、不存妄念,守正循理则吉,妄动招灾。",
  "山天大畜": "大有蓄养、积健为雄,止欲养德、厚积而薄发。",
  "山雷颐": "颐养之道,慎言节食、养正养身,自求口实。",
  "泽风大过": "阳刚过盛、负荷过重,非常之时宜用非常之法,独立不惧。",
  "坎为水": "重险当前,心存诚信、沉着应变,习险而出。",
  "离为火": "附丽光明、文明昭著,依正道而行则亨,柔丽中正。",
  "泽山咸": "交感相应、以虚受人,心诚则灵,利于婚恋结合。",
  "雷风恒": "恒久不易、持之以恒,守常道而不穷,利于长久经营。",
  "天山遯": "及时隐退、远小人,见几而退则亨,退中有守。",
  "雷天大壮": "阳刚壮盛,然壮而宜正,非礼勿履、以正制强。",
  "火地晋": "如日东升、顺势上进,光明磊落则昼日三接、步步晋升。",
  "地火明夷": "光明入地、处境晦暗,宜内明外晦、韬光养晦以自保。",
  "风火家人": "各正其位、家道有成,女正位内、男正位外则家兴。",
  "火泽睽": "乖离背违、同中有异,求同存异、小事可成,大合需时。",
  "水山蹇": "行路艰难、险阻在前,宜见险而止、反身修德、借助贤助。",
  "雷水解": "险难消解、万物舒展,宜趁势解困、宽赦旧过、及时而动。",
  "山泽损": "损下益上、惩忿窒欲,损之有道、以诚相损终得益。",
  "风雷益": "损上益下、见善则迁,利于兴利除弊、乘时进取。",
  "泽天夬": "决而能和、果断除弊,以刚决柔须光明正大、慎防反噬。",
  "天风姤": "不期而遇、阴长之始,宜防微杜渐、择善相遇。",
  "泽地萃": "荟萃聚合、人心归聚,宜以诚聚众、顺势成势。",
  "地风升": "柔顺上升、积小成高,循序渐进、顺势而上则亨。",
  "泽水困": "困顿受阻、处境艰难,宜守正自乐、以德处困、静待亨通。",
  "水风井": "井养不穷、惠泽于人,修德养民、革故鼎新则源源不竭。",
  "泽火革": "变革除旧、顺天应人,时至而革则悔亡,革之须孚信。",
  "火风鼎": "鼎新纳贤、调和致养,去故取新、虚心纳才则大亨。",
  "震为雷": "震动奋起、临危不乱,恐惧修省则笑言哑哑、处变不惊。",
  "艮为山": "适可而止、动静得宜,止其所当止、安其所居则无咎。",
  "风山渐": "循序渐进、如木渐长,按部就班、守正不躁则吉。",
  "雷泽归妹": "归合有道、情浓宜正,须守正名分、慎始善终。",
  "雷火丰": "丰盛盈大、如日中天,宜持盈保泰、明察决断、防盛极转衰。",
  "火山旅": "行旅在外、漂泊不定,宜柔顺谨慎、守礼寡过以求安。",
  "巽为风": "谦顺渗透、申命行事,以柔入微、反复申令则小亨利行。",
  "兑为泽": "和悦相感、以说化人,内刚外和、诚信待人则亨。",
  "风水涣": "涣散离析待凝聚,宜聚人心、涣其险难、重整人心。",
  "水泽节": "节制有度、量入为出,守中有节则亨,过苦之节不可久。",
  "风泽中孚": "中心诚信、以诚感物,信及豚鱼则吉,利涉大川。",
  "雷山小过": "小有过越、宜守小节,可小事不可大事,过恭过俭以守正。",
  "水火既济": "事已成就、守成防变,居安思危、慎终如始方免由盛转衰。",
  "火水未济": "事未竟成、慎终可济,审慎辨物居方、持正续进终能成。",
};

// 时支/年支 → 地支序号(子1…亥12)
const BRANCH_NUM: Record<string, number> = {
  子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12,
};

function trigramByRemainder(n: number): Trigram {
  const r = n % 8;
  return TRIGRAMS[r === 0 ? 8 : r];
}

/**
 * 梅花易数「时间起卦」:以农历年支数 + 月 + 日起上卦,再加时支数起下卦,
 * 总和取余定动爻。得本命卦,仅供文化娱乐。
 */
export interface HexDeriv {
  method: string;
  parts: { label: string; value: number }[];
  base: number;
  baseMod: number;
  upperName: string;
  hourLabel: string;
  hourNum: number;
  total: number;
  totalMod: number;
  lowerName: string;
  movingLine: number;
}

function mod8(n: number): number { return n % 8 === 0 ? 8 : n % 8; }
function mod6(n: number): number { return n % 6 === 0 ? 6 : n % 6; }

export function deriveHexagramDetailed(chart: ChartModel): { hex: Hexagram; deriv: HexDeriv } {
  const { lunar } = chart;
  const yearNum = BRANCH_NUM[lunar.yearBranch] ?? 1;
  const hourNum = BRANCH_NUM[lunar.hourBranch] ?? 1;
  const base = yearNum + lunar.month + lunar.day;
  const total = base + hourNum;
  const upper = trigramByRemainder(base);
  const lower = trigramByRemainder(total);
  const movingLine = mod6(total);
  const name = HEX_NAME[upper.name + ":" + lower.name] ?? (upper.nature + lower.nature);
  const meaning = HEX_MEANING[name] ?? "随缘而化,顺势而行。";
  const lines = [...lower.lines, ...upper.lines];
  const hex: Hexagram = { upper, lower, name, meaning, movingLine, lines };
  const deriv: HexDeriv = {
    method: "梅花易数 · 农历生辰起卦",
    parts: [
      { label: "年支 " + lunar.yearBranch, value: yearNum },
      { label: "农历月", value: lunar.month },
      { label: "农历日", value: lunar.day },
    ],
    base, baseMod: mod8(base), upperName: upper.name,
    hourLabel: "时支 " + lunar.hourBranch, hourNum,
    total, totalMod: mod8(total), lowerName: lower.name,
    movingLine,
  };
  return { hex, deriv };
}

export function deriveHexagram(chart: ChartModel): Hexagram {
  return deriveHexagramDetailed(chart).hex;
}


// ---- 由爻象反查卦 + 互卦/变卦 + 姓名·时间起卦(M7)----

const BRANCH_NUM2: Record<string, number> = {
  子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6, 午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12,
};

function linesToTrigram(lines: [boolean, boolean, boolean]): Trigram {
  for (const key of Object.keys(TRIGRAMS)) {
    const t = TRIGRAMS[Number(key)];
    if (t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2]) return t;
  }
  return TRIGRAMS[1];
}

/** 由六爻(下→上)与动爻组装一卦。 */
export function hexagramFromLines(lines: boolean[], movingLine: number): Hexagram {
  const lower = linesToTrigram([lines[0], lines[1], lines[2]]);
  const upper = linesToTrigram([lines[3], lines[4], lines[5]]);
  const name = HEX_NAME[`${upper.name}:${lower.name}`] ?? `${upper.nature}${lower.nature}`;
  const meaning = HEX_MEANING[name] ?? "随缘而化,顺势而行。";
  return { upper, lower, name, meaning, movingLine, lines: [...lines] };
}

/** 互卦:取二三四爻为下卦、三四五爻为上卦,主事情的发展过程/来路。 */
export function nuclearHexagram(hex: Hexagram): Hexagram {
  const l = hex.lines;
  const lines: boolean[] = [l[1], l[2], l[3], l[2], l[3], l[4]];
  return hexagramFromLines(lines, 0);
}

/** 变卦(之卦):动爻阴阳互变,主事情的结果/未来走向。 */
export function changedHexagram(hex: Hexagram): Hexagram {
  const lines = [...hex.lines];
  const i = hex.movingLine - 1;
  if (i >= 0 && i < 6) lines[i] = !lines[i];
  return hexagramFromLines(lines, hex.movingLine);
}

export interface CastInput {
  nameStrokes: number;   // 姓名(繁体/康熙)总笔画
  yearBranch: string;    // 卜卦时间 年支
  month: number;         // 卜卦 农历月
  day: number;           // 卜卦 农历日
  hourBranch: string;    // 卜卦 时支
}

/** 梅花易数「姓名 + 时间」起卦:姓名笔画并入年月日起上卦、再加时辰起下卦。 */
export function castByNameTime(input: CastInput): Hexagram {
  const yearNum = BRANCH_NUM2[input.yearBranch] ?? 1;
  const hourNum = BRANCH_NUM2[input.hourBranch] ?? 1;
  const base = input.nameStrokes + yearNum + input.month + input.day;
  const total = base + hourNum;
  const upper = trigramByRemainder(base);
  const lower = trigramByRemainder(total);
  const movingLine = (total % 6) === 0 ? 6 : total % 6;
  const lines = [...lower.lines, ...upper.lines];
  const name = HEX_NAME[`${upper.name}:${lower.name}`] ?? `${upper.nature}${lower.nature}`;
  const meaning = HEX_MEANING[name] ?? "随缘而化,顺势而行。";
  return { upper, lower, name, meaning, movingLine, lines };
}


// ---- 推导步骤:供 UI 展示「如何得出此卦」----
export function branchNum(branch: string): number { return BRANCH_NUM[branch] ?? 1; }

export interface CastDerivInput {
  nameStrokes: number;
  nameParts: { label: string; value: number }[];
  yearBranch: string; yearNum: number;
  month: number; day: number;
  hourBranch: string; hourNum: number;
}

/** 由「姓名 + 时间」梅花起卦的推导步骤(与 castByNameTime 同式)。 */
export function castDeriv(input: CastDerivInput): HexDeriv {
  const base = input.nameStrokes + input.yearNum + input.month + input.day;
  const total = base + input.hourNum;
  const upper = trigramByRemainder(base);
  const lower = trigramByRemainder(total);
  const movingLine = mod6(total);
  return {
    method: "梅花易数 · 姓名并时间起卦",
    parts: [
      ...input.nameParts,
      { label: "年支 " + input.yearBranch, value: input.yearNum },
      { label: "农历月", value: input.month },
      { label: "农历日", value: input.day },
    ],
    base, baseMod: mod8(base), upperName: upper.name,
    hourLabel: "时支 " + input.hourBranch, hourNum: input.hourNum,
    total, totalMod: mod8(total), lowerName: lower.name,
    movingLine,
  };
}


// ---- 典籍:《周易》卦辞(彖)与《象传》大象(象曰)。供文化展示,原文校以通行本。----
export interface HexClassic { tuan: string; xiang: string; }
export const HEX_CLASSIC: Record<string, HexClassic> = {
  "乾为天": { tuan: "元,亨,利,贞。", xiang: "天行健,君子以自强不息。" },
  "坤为地": { tuan: "元亨,利牝马之贞。君子有攸往,先迷后得主,利。", xiang: "地势坤,君子以厚德载物。" },
  "水雷屯": { tuan: "元亨利贞。勿用有攸往,利建侯。", xiang: "云,雷,屯;君子以经纶。" },
  "山水蒙": { tuan: "亨。匪我求童蒙,童蒙求我。初筮告,再三渎,渎则不告。利贞。", xiang: "山下出泉,蒙;君子以果行育德。" },
  "水天需": { tuan: "有孚,光亨,贞吉。利涉大川。", xiang: "云上于天,需;君子以饮食宴乐。" },
  "天水讼": { tuan: "有孚窒惕,中吉,终凶。利见大人,不利涉大川。", xiang: "天与水违行,讼;君子以作事谋始。" },
  "地水师": { tuan: "贞,丈人吉,无咎。", xiang: "地中有水,师;君子以容民畜众。" },
  "水地比": { tuan: "吉。原筮元永贞,无咎。不宁方来,后夫凶。", xiang: "地上有水,比;先王以建万国,亲诸侯。" },
  "风天小畜": { tuan: "亨。密云不雨,自我西郊。", xiang: "风行天上,小畜;君子以懿文德。" },
  "天泽履": { tuan: "履虎尾,不咥人,亨。", xiang: "上天下泽,履;君子以辨上下,定民志。" },
  "地天泰": { tuan: "小往大来,吉亨。", xiang: "天地交,泰;后以财成天地之道,辅相天地之宜,以左右民。" },
  "天地否": { tuan: "否之匪人,不利君子贞,大往小来。", xiang: "天地不交,否;君子以俭德辟难,不可荣以禄。" },
  "天火同人": { tuan: "同人于野,亨。利涉大川,利君子贞。", xiang: "天与火,同人;君子以类族辨物。" },
  "火天大有": { tuan: "元亨。", xiang: "火在天上,大有;君子以遏恶扬善,顺天休命。" },
  "地山谦": { tuan: "亨,君子有终。", xiang: "地中有山,谦;君子以裒多益寡,称物平施。" },
  "雷地豫": { tuan: "利建侯行师。", xiang: "雷出地奋,豫;先王以作乐崇德,殷荐之上帝,以配祖考。" },
  "泽雷随": { tuan: "元亨利贞,无咎。", xiang: "泽中有雷,随;君子以向晦入宴息。" },
  "山风蛊": { tuan: "元亨,利涉大川。先甲三日,后甲三日。", xiang: "山下有风,蛊;君子以振民育德。" },
  "地泽临": { tuan: "元亨利贞。至于八月有凶。", xiang: "泽上有地,临;君子以教思无穷,容保民无疆。" },
  "风地观": { tuan: "盥而不荐,有孚颙若。", xiang: "风行地上,观;先王以省方观民设教。" },
  "火雷噬嗑": { tuan: "亨。利用狱。", xiang: "雷电,噬嗑;先王以明罚敕法。" },
  "山火贲": { tuan: "亨。小利有攸往。", xiang: "山下有火,贲;君子以明庶政,无敢折狱。" },
  "山地剥": { tuan: "不利有攸往。", xiang: "山附于地,剥;上以厚下安宅。" },
  "地雷复": { tuan: "亨。出入无疾,朋来无咎。反复其道,七日来复,利有攸往。", xiang: "雷在地中,复;先王以至日闭关,商旅不行,后不省方。" },
  "天雷无妄": { tuan: "元亨利贞。其匪正有眚,不利有攸往。", xiang: "天下雷行,物与无妄;先王以茂对时,育万物。" },
  "山天大畜": { tuan: "利贞。不家食吉,利涉大川。", xiang: "天在山中,大畜;君子以多识前言往行,以畜其德。" },
  "山雷颐": { tuan: "贞吉。观颐,自求口实。", xiang: "山下有雷,颐;君子以慎言语,节饮食。" },
  "泽风大过": { tuan: "栋桡。利有攸往,亨。", xiang: "泽灭木,大过;君子以独立不惧,遁世无闷。" },
  "坎为水": { tuan: "习坎,有孚,维心亨,行有尚。", xiang: "水洊至,习坎;君子以常德行,习教事。" },
  "离为火": { tuan: "利贞,亨。畜牝牛,吉。", xiang: "明两作,离;大人以继明照于四方。" },
  "泽山咸": { tuan: "亨,利贞,取女吉。", xiang: "山上有泽,咸;君子以虚受人。" },
  "雷风恒": { tuan: "亨,无咎,利贞,利有攸往。", xiang: "雷风,恒;君子以立不易方。" },
  "天山遯": { tuan: "亨,小利贞。", xiang: "天下有山,遯;君子以远小人,不恶而严。" },
  "雷天大壮": { tuan: "利贞。", xiang: "雷在天上,大壮;君子以非礼勿履。" },
  "火地晋": { tuan: "康侯用锡马蕃庶,昼日三接。", xiang: "明出地上,晋;君子以自昭明德。" },
  "地火明夷": { tuan: "利艰贞。", xiang: "明入地中,明夷;君子以莅众,用晦而明。" },
  "风火家人": { tuan: "利女贞。", xiang: "风自火出,家人;君子以言有物而行有恒。" },
  "火泽睽": { tuan: "小事吉。", xiang: "上火下泽,睽;君子以同而异。" },
  "水山蹇": { tuan: "利西南,不利东北。利见大人,贞吉。", xiang: "山上有水,蹇;君子以反身修德。" },
  "雷水解": { tuan: "利西南。无所往,其来复吉。有攸往,夙吉。", xiang: "雷雨作,解;君子以赦过宥罪。" },
  "山泽损": { tuan: "有孚,元吉,无咎,可贞,利有攸往。", xiang: "山下有泽,损;君子以惩忿窒欲。" },
  "风雷益": { tuan: "利有攸往,利涉大川。", xiang: "风雷,益;君子以见善则迁,有过则改。" },
  "泽天夬": { tuan: "扬于王庭,孚号有厉。告自邑,不利即戎,利有攸往。", xiang: "泽上于天,夬;君子以施禄及下,居德则忌。" },
  "天风姤": { tuan: "女壮,勿用取女。", xiang: "天下有风,姤;后以施命诰四方。" },
  "泽地萃": { tuan: "亨。王假有庙,利见大人,亨,利贞。用大牲吉,利有攸往。", xiang: "泽上于地,萃;君子以除戎器,戒不虞。" },
  "地风升": { tuan: "元亨,用见大人,勿恤,南征吉。", xiang: "地中生木,升;君子以顺德,积小以高大。" },
  "泽水困": { tuan: "亨,贞,大人吉,无咎。有言不信。", xiang: "泽无水,困;君子以致命遂志。" },
  "水风井": { tuan: "改邑不改井,无丧无得,往来井井。", xiang: "木上有水,井;君子以劳民劝相。" },
  "泽火革": { tuan: "己日乃孚,元亨利贞,悔亡。", xiang: "泽中有火,革;君子以治历明时。" },
  "火风鼎": { tuan: "元吉,亨。", xiang: "木上有火,鼎;君子以正位凝命。" },
  "震为雷": { tuan: "亨。震来虩虩,笑言哑哑。震惊百里,不丧匕鬯。", xiang: "洊雷,震;君子以恐惧修省。" },
  "艮为山": { tuan: "艮其背,不获其身,行其庭,不见其人,无咎。", xiang: "兼山,艮;君子以思不出其位。" },
  "风山渐": { tuan: "女归吉,利贞。", xiang: "山上有木,渐;君子以居贤德,善俗。" },
  "雷泽归妹": { tuan: "征凶,无攸利。", xiang: "泽上有雷,归妹;君子以永终知敝。" },
  "雷火丰": { tuan: "亨,王假之,勿忧,宜日中。", xiang: "雷电皆至,丰;君子以折狱致刑。" },
  "火山旅": { tuan: "小亨,旅贞吉。", xiang: "山上有火,旅;君子以明慎用刑,而不留狱。" },
  "巽为风": { tuan: "小亨,利有攸往,利见大人。", xiang: "随风,巽;君子以申命行事。" },
  "兑为泽": { tuan: "亨,利贞。", xiang: "丽泽,兑;君子以朋友讲习。" },
  "风水涣": { tuan: "亨。王假有庙,利涉大川,利贞。", xiang: "风行水上,涣;先王以享于帝立庙。" },
  "水泽节": { tuan: "亨。苦节不可贞。", xiang: "泽上有水,节;君子以制数度,议德行。" },
  "风泽中孚": { tuan: "豚鱼吉,利涉大川,利贞。", xiang: "泽上有风,中孚;君子以议狱缓死。" },
  "雷山小过": { tuan: "亨,利贞。可小事,不可大事。飞鸟遗之音,不宜上宜下,大吉。", xiang: "山上有雷,小过;君子以行过乎恭,丧过乎哀,用过乎俭。" },
  "水火既济": { tuan: "亨,小利贞,初吉终乱。", xiang: "水在火上,既济;君子以思患而豫防之。" },
  "火水未济": { tuan: "亨。小狐汔济,濡其尾,无攸利。", xiang: "火在水上,未济;君子以慎辨物居方。" },
};

export function hexClassic(name: string): HexClassic | null {
  return HEX_CLASSIC[name] ?? null;
}
