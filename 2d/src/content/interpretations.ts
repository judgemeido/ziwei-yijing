// 紫微斗数解读文案(M4:星×宫 细化 + 四化按宫深化)。仅供文化娱乐。

import type { PalaceName, Mutagen, ChartModel } from "../engine/types";

export interface PalaceLore {
  theme: string; // 一词主题
  desc: string;  // 一句话释义
}

export const PALACE_LORE: Record<PalaceName, PalaceLore> = {
  命宫: { theme: "本命", desc: "先天性格、天赋格局与人生总纲,一盘之主。" },
  兄弟: { theme: "手足", desc: "兄弟姐妹缘分、同辈助力与合作默契。" },
  夫妻: { theme: "姻缘", desc: "婚姻感情、配偶特质与两人相处之道。" },
  子女: { theme: "子嗣", desc: "子女缘分、晚辈关系与创造孕育之力。" },
  财帛: { theme: "财富", desc: "财源方式、理财观念与进出财的格局。" },
  疾厄: { theme: "身心", desc: "体质健康、情绪压力与易感之处。" },
  迁移: { theme: "际遇", desc: "外出发展、远行机遇与环境人缘的变化。" },
  仆役: { theme: "人脉", desc: "朋友部属、交际圈层与可借之外力。" },
  官禄: { theme: "事业", desc: "事业官运、成就舞台与社会地位。" },
  田宅: { theme: "家宅", desc: "家庭产业、不动产与居住环境的安稳。" },
  福德: { theme: "福分", desc: "精神享受、兴趣嗜好与内在的福气。" },
  父母: { theme: "庇荫", desc: "双亲缘分、长辈荫护与文书学业。" },
};

// 主星通性(作为无专属组合时的兜底)。
export const STAR_LORE: Record<string, string> = {
  紫微: "帝星,主尊贵与领导,定海安邦,喜百官朝拱、众星拱卫。",
  天机: "智慧星,善谋略机变、思虑周密,心灵手巧而多动。",
  太阳: "贵气星,主光明博爱与事业舞台,热情外放、利男命父运。",
  武曲: "财星,刚毅果决、重行动与实绩,利经商理财开拓。",
  天同: "福星,温和知足、重情享受,逢难呈祥、以柔化刚。",
  廉贞: "次桃花兼权星,善权谋手腕、情感浓烈,刚烈而多变。",
  天府: "库星,稳重保守、善积蓄守成,包容务实、衣食不缺。",
  太阴: "富星,柔情细腻、重田宅积累,内敛洁净、利女命母运。",
  贪狼: "桃花星,欲望旺盛、多才多艺,善应酬交际、充满生命力。",
  巨门: "暗星,主口舌是非兼钻研,利靠口为业、宜专精一门。",
  天相: "印星,辅佐协调、忠厚得人缘,重衣食仪态、乐于助人。",
  天梁: "荫星,老成持重、庇荫解厄,逢凶化吉、好照顾他人。",
  七杀: "将星,冲劲十足、敢于变动开创,独当一面、宜动中求成。",
  破军: "耗星,破旧立新、冲锋在前,先破后立、变革求新。",
};

export const MUTAGEN_LORE: Record<Mutagen, { label: string; desc: string }> = {
  禄: { label: "化禄", desc: "主财禄顺遂与机缘,如虎添翼,增顺势之力。" },
  权: { label: "化权", desc: "主权力掌控与成就,增强担当与魄力。" },
  科: { label: "化科", desc: "主名声文采与贵人,逢凶减灾、锦上添名。" },
  忌: { label: "化忌", desc: "主阻滞执着与变数,宜守成化解、专注取胜。" },
};

// ---- 星×宫 组合:组合引擎(星性能量 + 宫位领域)----
const STAR_ESSENCE: Record<string, string> = {
  紫微: "尊贵自重、善于统御,带来主导与定局之力",
  天机: "心思灵巧、善谋略变通,凡事爱动脑筹划",
  太阳: "光明磊落、热情付出,带来舞台与贵气",
  武曲: "刚毅果决、重实干实绩,行动力与财气兼具",
  天同: "温和知足、以柔化刚,带来福气与情感滋润",
  廉贞: "手腕灵活、情感浓烈,刚烈而富变化",
  天府: "稳重包容、善守成积蓄,带来安定与庇护",
  太阴: "柔情细腻、重积累内蕴,带来财与宅的滋养",
  贪狼: "欲望旺盛、多才多艺,社交与机运都活跃",
  巨门: "口才与钻研兼长,利靠专业与言语立足",
  天相: "辅佐协调、忠厚得体,带来助力与体面",
  天梁: "老成庇荫、逢凶化吉,带来照顾与化解之力",
  七杀: "冲劲十足、敢于开创,主在变动中独当一面",
  破军: "破旧立新、冲锋在前,先破而后能立",
};

const PALACE_FOCUS: Record<PalaceName, string> = {
  命宫: "塑造你的性格基调与人生总格",
  兄弟: "影响手足缘分与同辈间的互助",
  夫妻: "影响婚姻感情与配偶的样貌",
  子女: "影响子女缘与创造孕育之事",
  财帛: "影响你赚钱与理财的方式",
  疾厄: "影响体质健康与情绪压力的出口",
  迁移: "影响外出发展与在外的际遇人缘",
  仆役: "影响朋友部属与可借的人脉外力",
  官禄: "影响事业格局与成就的舞台",
  田宅: "影响家宅产业与居住环境的安稳",
  福德: "影响精神享受、兴趣与内在福分",
  父母: "影响双亲缘分、长辈荫护与学业文书",
};

// 经典「星×宫」签名解读(有则优先,无则走组合引擎)。键为 `星:宫`。
const COMBO: Record<string, string> = {
  "紫微:命宫": "紫微坐命,气度雍容、自带主见,天生想站上高位掌全局;若得辅星拱卫则贵显,孤君无辅则易孤高自负。",
  "紫微:官禄": "紫微入官禄,事业格局宏大、宜居领导与决策之位,适合在大机构或自立门户中担纲掌舵。",
  "紫微:田宅": "紫微入田宅,重居住品质与门面,家宅气派、不动产可观,是家中定海之柱。",
  "武曲:财帛": "武曲入财帛,正是财星归位:善以行动与专业赚钱,理财果断、现金观念强,利经商与实业。",
  "武曲:官禄": "武曲入官禄,事业靠硬实力与执行力打拼,适合财经、军警、技术等需果决担当的领域。",
  "太阴:田宅": "太阴入田宅为得位,善置产守成、家宅温润安定,擅长以积累换安稳。",
  "太阴:福德": "太阴入福德,内心细腻、重精神品味,享受安静清雅之乐,夜里思绪尤丰。",
  "太阳:官禄": "太阳入官禄为得位,事业光明磊落、乐于付出与扛责,适合公众、教育、管理等舞台型工作。",
  "太阳:父母": "太阳入父母,与父亲及长辈缘分深、受其荫庇,也主得贵人提携与光明学途。",
  "贪狼:夫妻": "贪狼入夫妻,情感世界丰富、魅力与应酬多,相处精彩却需守界线,忌多头牵绊。",
  "贪狼:福德": "贪狼入福德,兴趣广、懂享受、才艺多,精神生活热闹,宜防欲望过盛而耗神。",
  "天府:财帛": "天府入财帛,财库稳固、善守成积蓄,进财平稳少大起落,是能存住钱的格局。",
  "天机:迁移": "天机入迁移,在外机巧应变、点子多,适合跑动、交涉、规划类的流动发展。",
  "天机:兄弟": "天机入兄弟,与手足同辈多以智巧往来,合作中你常是出谋划策的那一个。",
  "巨门:官禄": "巨门入官禄,靠口与专业立业:适合教学、法律、销售、媒体等以言语深究取胜的行业。",
  "天同:福德": "天同入福德为得位,知足常乐、福气绵长,懂得享受平淡中的小确幸。",
  "天相:官禄": "天相入官禄,善辅佐协调、处事得体,适合参谋、幕僚、管理与需讲究分寸的岗位。",
  "天梁:父母": "天梁入父母,长辈荫护深厚、逢难有人罩,也主你早熟懂事、乐于反哺照顾家人。",
  "七杀:命宫": "七杀坐命,刚烈独立、冲劲十足,敢闯敢拼宜动中求成,忌冲动躁进。",
  "七杀:迁移": "七杀入迁移,出外闯荡最能发挥,离乡背井、独当一面反成大器。",
  "破军:夫妻": "破军入夫妻,感情起伏大、喜破旧立新,关系常经波折后重整,宜求稳定节奏。",
  "廉贞:官禄": "廉贞入官禄,事业手腕灵活、善经营人际与制度,适合需要谋略与交际的岗位。",
};

const MUT_TONE: Record<Mutagen, string> = {
  禄: "多添助力与机缘",
  权: "更能主导与推进",
  科: "易得名声与贵人相助",
  忌: "易生纠结起伏,宜留意化解",
};

const PALACE_DOMAIN_NOUN: Record<PalaceName, string> = {
  命宫: "自身性格与整体格局",
  兄弟: "手足与同辈关系",
  夫妻: "婚姻感情",
  子女: "子女与创造之事",
  财帛: "财运进出",
  疾厄: "健康与情绪",
  迁移: "在外发展与际遇",
  仆役: "人脉与部属",
  官禄: "事业与官运",
  田宅: "家宅与产业",
  福德: "精神享受与福分",
  父母: "长辈缘与学业文书",
};

/** 星×宫 细化解读:优先签名文案,否则由星性能量 + 宫位领域组合而成。 */
export function starInPalace(starName: string, palace: PalaceName): string {
  const key = `${starName}:${palace}`;
  if (COMBO[key]) return COMBO[key];
  const essence = STAR_ESSENCE[starName];
  if (essence) return `${starName}坐${palace}宫,${essence},${PALACE_FOCUS[palace]}。`;
  return STAR_LORE[starName] ?? "辅佐之星,随主星显其性。";
}

/** 四化按宫深化:化禄/权/科/忌落入该宫位的具体影响。 */
export function mutagenInPalace(mutagen: Mutagen, palace: PalaceName): string {
  return `化${mutagen}入${palace}宫,${PALACE_DOMAIN_NOUN[palace]}${MUT_TONE[mutagen]}。`;
}


// ---- 五行局 / 命主 / 身主 释义(M7.4 丰富解读)----
export const WUXING_LORE: Record<string, string> = {
  水二局: "水二局,智谋流动、随势而变,起运较早,宜以柔克刚、顺势蓄势。",
  木三局: "木三局,生发向上、仁厚进取,成长有节,宜稳扎稳打、厚积薄发。",
  金四局: "金四局,刚毅决断、重义守则,格局方正,宜以果断成事、戒过刚。",
  土五局: "土五局,敦厚沉稳、包容承载,根基深厚,宜守成积累、以静制动。",
  火六局: "火六局,热烈外放、动能充沛,起运较晚,宜借势而发、戒急躁。",
};

export const SOUL_BODY_LORE: Record<string, string> = {
  紫微: "尊贵主星,主导与定局之力。",
  天机: "智慧善谋,机变灵巧。",
  太阳: "光明热忱,主事业与贵气。",
  武曲: "刚毅果决,财与行动兼具。",
  天同: "温和知足,逢难呈祥之福。",
  廉贞: "手腕灵活,情感浓烈多变。",
  天府: "稳重包容,善守成积蓄。",
  太阴: "柔情细腻,主财与内蕴。",
  贪狼: "欲望旺盛,多才而善交际。",
  巨门: "口才钻研,宜以专业立身。",
  天相: "辅佐得体,忠厚得人缘。",
  天梁: "老成庇荫,逢凶化吉。",
  七杀: "冲劲开创,独当一面。",
  破军: "破旧立新,先破后立。",
  禄存: "守财纳禄,持重自保。",
  文曲: "文采口才,机巧风雅。",
  文昌: "文章学业,聪明端正。",
  火星: "刚烈急进,爆发之力。",
  铃星: "阴烈沉劲,后发之势。",
};

export function wuxingLore(name: string): string {
  return WUXING_LORE[name] ?? "五行成局,定起运之早晚与性情之刚柔。";
}
export function soulBodyLore(name: string): string {
  return SOUL_BODY_LORE[name] ?? "随主星显其性情。";
}


// ---- 读盘推导:综合研判(宫位领域 + 主星星性 + 四化基调)----
export function palaceSynthesis(
  palace: PalaceName,
  majorNames: string[],
  mutList: { name: string; mutagen: Mutagen }[],
  isSoul: boolean,
  isBody: boolean,
): string {
  const domain = PALACE_DOMAIN_NOUN[palace];
  const segs: string[] = [];
  if (isSoul) segs.push("此为命宫、一盘之主,统摄全局");
  else if (isBody) segs.push("此宫兼坐身宫,主后天际遇与中晚年着力处");
  segs.push("主司" + domain);

  if (majorNames.length) {
    const ess = majorNames.map((n) => STAR_ESSENCE[n] ?? STAR_LORE[n] ?? "").filter(Boolean);
    segs.push("由" + majorNames.join("、") + "入守," + (ess[0] ?? "随星性而显"));
    if (majorNames.length > 1) segs.push("数星同宫、力量交织,宜取其长而调其冲");
  } else {
    segs.push("本宫空而无主星,吉凶多借对宫及三方会照之星,性情较随境流转");
  }

  if (mutList.length) {
    const m = mutList[0];
    segs.push(m.name + "化" + m.mutagen + "坐守," + MUT_TONE[m.mutagen]);
  }

  segs.push(isSoul
    ? "综观:立定本心、顺性而为,乃全盘吉凶之根本"
    : "综观:于" + domain + "一事,顺其星性之长、避其所忌,则事半而功倍");
  return segs.join(",") + "。";
}


// ---- 全盘速览:命宫 / 身宫 / 四化 总结(面向当前命盘)----
export interface OverviewMutagen {
  mutagen: Mutagen;
  label: string;
  star: string;
  palace: PalaceName;
  branch: string;
  text: string;
}
export interface SoulBodyOverview {
  palace: PalaceName;
  branch: string;
  majors: string[];
  summary: string;
}
export interface ChartOverview {
  soul: SoulBodyOverview;
  body: SoulBodyOverview & { same: boolean };
  mutagens: OverviewMutagen[];
}

/** 由当前命盘生成命宫 / 身宫 / 四化的综述文案。 */
export function chartOverview(chart: ChartModel): ChartOverview {
  const soulP = chart.palaces.find((p) => p.index === chart.soulIndex) ?? chart.palaces[0];
  const bodyP = chart.palaces.find((p) => p.isBodyPalace) ?? soulP;
  const majorsOf = (p: typeof soulP): string[] => p.stars.filter((s) => s.type === "major").map((s) => s.name);

  const soulMajors = majorsOf(soulP);
  const soulSummary = soulMajors.length
    ? "命宫在" + soulP.earthlyBranch + "宫,由" + soulMajors.join("、") + "入守," + (STAR_ESSENCE[soulMajors[0]] ?? "随星性而显") + ";此乃一盘之主,奠定你的性格基调与人生总格。"
    : "命宫在" + soulP.earthlyBranch + "宫,无主星坐守(空宫),性情多随对宫与三方会照之星而显,立身宜借势、守中而行。";

  const same = bodyP.index === soulP.index;
  const bodyMajors = majorsOf(bodyP);
  const bodySummary = same
    ? "身宫与命宫同宫,先天与后天合一;一生着力处与本性相合,性格贯彻始终、少有分歧。"
    : (bodyMajors.length
        ? "身宫在" + bodyP.earthlyBranch + "宫(" + bodyP.name + "),由" + bodyMajors.join("、") + "入守," + (STAR_ESSENCE[bodyMajors[0]] ?? "随星性而显") + ";主后天际遇与中晚年的着力方向。"
        : "身宫在" + bodyP.earthlyBranch + "宫(" + bodyP.name + "),无主星坐守;后天作为多随环境流转,中晚年宜顺势借力。");

  const order: Record<Mutagen, number> = { 禄: 0, 权: 1, 科: 2, 忌: 3 };
  const mutagens: OverviewMutagen[] = [];
  for (const pal of chart.palaces) {
    for (const st of pal.stars) {
      if (!st.mutagen) continue;
      const info = MUTAGEN_LORE[st.mutagen];
      mutagens.push({
        mutagen: st.mutagen,
        label: info.label,
        star: st.name,
        palace: pal.name,
        branch: pal.earthlyBranch,
        text: st.name + "星" + info.label + ",落于" + pal.name + "宫:" + PALACE_DOMAIN_NOUN[pal.name] + MUT_TONE[st.mutagen] + "。",
      });
    }
  }
  mutagens.sort((a, b) => order[a.mutagen] - order[b.mutagen]);

  return {
    soul: { palace: soulP.name, branch: soulP.earthlyBranch, majors: soulMajors, summary: soulSummary },
    body: { palace: bodyP.name, branch: bodyP.earthlyBranch, majors: bodyMajors, same, summary: bodySummary },
    mutagens,
  };
}
