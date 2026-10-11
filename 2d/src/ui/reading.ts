import type { ChartModel } from "../engine/types";
import {
  PALACE_LORE,
  STAR_LORE,
  MUTAGEN_LORE,
  starInPalace,
  mutagenInPalace,
  palaceSynthesis,
  chartOverview,
} from "../content/interpretations";

const MUT_CLASS: Record<string, string> = {
  禄: "mut-lu", 权: "mut-quan", 科: "mut-ke", 忌: "mut-ji",
};

export interface ReadingUI {
  show: (chart: ChartModel, index: number) => void;
  clear: () => void;
  setChart: (chart: ChartModel | null) => void;
  onClose: (fn: () => void) => void;
}

/** 读盘面板:使用方法指引 + 宫义 + 星×宫 + 四化 + 三方四正 + 推导综论。 */
export function createReading(root: HTMLElement): ReadingUI {
  const el = document.createElement("section");
  el.id = "reading-panel";
  el.className = "panel-card reading";
  el.setAttribute("role", "region");
  el.setAttribute("aria-label", "读盘解读");
  el.setAttribute("aria-live", "polite");
  root.appendChild(el);

  let closeHandler: (() => void) | null = null;
  let cachedChart: ChartModel | null = null;

  el.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(".reading-close")) {
      hint();
      closeHandler?.();
      return;
    }
    const accHead = target.closest(".how-head") as HTMLElement | null;
    if (accHead) {
      const item = accHead.closest(".how-item") as HTMLElement;
      const on = item.classList.toggle("on");
      accHead.setAttribute("aria-expanded", String(on));
    }
  });

  const HOWTO = [
    { k: "起盘", d: "填入姓名(中文汉字,参与起卦)、公历生辰与性别,点「起盘起卦」。姓名笔画会并入卜卦,生辰则定出紫微命盘。" },
    { k: "看盘", d: "外环是后天八卦与廿四向,十二宫按地支如时钟环布,中宫为命主、身主与本命卦。标「命」为命宫、标「身」为身宫。" },
    { k: "读盘", d: "点任一宫位,查看宫义、主星「星×宫」解读、四化重点、三方四正会照与推导综论——这是逐宫深读的入口。" },
    { k: "卜卦", d: "切到「卜卦」页,以姓名并当下时间起卦,再切换过去(互卦)·当下(本卦)·未来(变卦)三时态对照。" },
    { k: "本命", d: "切到「本命」页,看由出生时刻起出的本命卦及其推演,可与紫微命盘互为参照。" },
    { k: "解读", d: "点右上角「解读」按钮,查看本盘命宫 / 身宫 / 四化的专属综述,以及各核心概念的通俗详解。" },
  ];

  function overviewBlock(): string {
    if (!cachedChart) return "";
    const o = chartOverview(cachedChart);
    const mutClass: Record<string, string> = { 禄: "mut-lu", 权: "mut-quan", 科: "mut-ke", 忌: "mut-ji" };
    const mutChips = o.mutagens.length
      ? o.mutagens.map((m) => '<span class="chip"><i class="mut ' + (mutClass[m.mutagen] ?? "") + '">' + m.label + "</i>" + m.star + "·" + m.palace + "</span>").join("")
      : '<span class="chip rk-empty-chip">本盘无四化落点</span>';
    return [
      '<div class="rk-overview"><span class="rk-label">本盘速览 · 命 / 身 / 四化</span>',
        '<div class="ov-line"><em class="flag soul">命</em><p><b>命宫在' + o.soul.branch + "宫</b>" + "·" + (o.soul.majors.length ? o.soul.majors.join("、") : "空宫") + "</p></div>",
        '<div class="ov-line"><em class="flag body">身</em><p><b>身宫在' + o.body.branch + "宫</b>" + "·" + (o.body.same ? "与命宫同宫" : (o.body.majors.length ? o.body.majors.join("、") : "空宫")) + "</p></div>",
        '<div class="ov-muts">' + mutChips + "</div>",
        '<p class="ov-more">更详尽的综述,点右上角「解读」。</p>',
      "</div>",
    ].join("");
  }

  function howtoBlock(): string {
    const items = HOWTO.map((it, i) => {
      const on = i === 0 ? " on" : "";
      const exp = i === 0 ? "true" : "false";
      return '<div class="how-item' + on + '">' +
        '<button type="button" class="how-head" aria-expanded="' + exp + '"><span class="how-k">' + it.k + '</span><span class="how-chev" aria-hidden="true"></span></button>' +
        '<div class="how-body"><div class="how-inner"><p>' + it.d + "</p></div></div>" +
      "</div>";
    }).join("");
    return '<div class="how-accordion">' + items + "</div>";
  }

  function hint(): void {
    el.innerHTML = [
      '<div class="reading-guide">',
        overviewBlock(),
        '<h3 class="guide-title">命盘使用方法</h3>',
        '<p class="guide-hint-sm howtop">点标题展开每一步的详细用法。</p>',
        howtoBlock(),
        '<div class="guide-legend">',
          '<span class="rk-label">图例</span>',
          '<div class="legend-row">',
            '<span class="lg"><em class="flag soul">命</em>命宫</span>',
            '<span class="lg"><em class="flag body">身</em>身宫</span>',
            '<span class="lg"><i class="mut mut-lu">禄</i><i class="mut mut-quan">权</i><i class="mut mut-ke">科</i><i class="mut mut-ji">忌</i>四化</span>',
          "</div>",
          '<p class="guide-hint-sm">点击任意宫位,开始读盘。',
        "</div>",
      "</div>",
    ].join("");
  }

  function clear(): void { hint(); }

  function show(chart: ChartModel, index: number): void {
    cachedChart = chart;
    const p = chart.palaces.find((x) => x.index === index);
    if (!p) { hint(); return; }
    const lore = PALACE_LORE[p.name];
    const isSoul = p.index === chart.soulIndex;

    const flags: string[] = [];
    if (isSoul) flags.push('<em class="flag soul">命宫</em>');
    if (p.isBodyPalace) flags.push('<em class="flag body">身宫</em>');

    const majors = p.stars.filter((s) => s.type === "major");
    const minors = p.stars.filter((s) => s.type !== "major");

    const majorHtml = majors.length
      ? majors.map((s) => {
          const lede = starInPalace(s.name, p.name);
          const base = STAR_LORE[s.name];
          const bri = s.brightness ? '<span class="rk-bri">' + s.brightness + "</span>" : "";
          const mut = s.mutagen ? '<i class="mut ' + (MUT_CLASS[s.mutagen] ?? "") + '">' + s.mutagen + "</i>" : "";
          const baseLine = base ? '<p class="rk-star-base">' + base + "</p>" : "";
          return '<li class="rk-star"><div class="rk-star-head"><b>' + s.name + "</b>" + bri + mut + '</div><p class="rk-star-desc">' + lede + "</p>" + baseLine + "</li>";
        }).join("")
      : '<li class="rk-star rk-empty"><p class="rk-star-desc">此宫无主星(空宫),吉凶多借对宫与三方会照之星,性情较随环境流转。</p></li>';

    const minorHtml = minors.length
      ? '<div class="rk-minor"><span class="rk-label">辅佐星曜</span><div class="rk-chips">' + minors.map((s) => {
          const mut = s.mutagen ? '<i class="mut ' + (MUT_CLASS[s.mutagen] ?? "") + '">' + s.mutagen + "</i>" : "";
          return '<span class="chip">' + s.name + mut + "</span>";
        }).join("") + "</div></div>"
      : "";

    const mutStars = p.stars.filter((s) => s.mutagen);
    const mutHtml = mutStars.length
      ? '<div class="rk-mut"><span class="rk-label">四化重点</span><ul>' + mutStars.map((s) => {
          const info = MUTAGEN_LORE[s.mutagen!];
          const line = mutagenInPalace(s.mutagen!, p.name);
          return '<li><i class="mut ' + MUT_CLASS[s.mutagen!] + '">' + info.label + '</i><div class="rk-mut-body"><b>' + s.name + "</b><span>" + line + "</span></div></li>";
        }).join("") + "</ul></div>"
      : "";

    const byIdx = (i: number) => chart.palaces.find((x) => x.index === i);
    const oppo = byIdx((p.index + 6) % 12);
    const a = byIdx((p.index + 4) % 12);
    const b = byIdx((p.index + 8) % 12);
    const triCell = (rel: string, pal: typeof oppo) => pal
      ? '<div class="tri-cell"><span class="tri-rel">' + rel + '</span><b>' + pal.name + '</b><small>' + pal.earthlyBranch + " · " + PALACE_LORE[pal.name].theme + "</small></div>"
      : "";
    const trineHtml = (oppo && a && b)
      ? '<div class="rk-trine"><span class="rk-label">三方四正 · 会照</span><div class="rk-trine-grid">'
          + triCell("对宫", oppo) + triCell("三合", a) + triCell("三合", b)
          + '</div><p class="rk-trine-note">本宫与对宫、两三合宫互为「三方四正」,星曜彼此会照、吉凶相参,须合看方全。</p></div>'
      : "";

    const majorNames = majors.map((s) => s.name);
    const mutList = mutStars.map((s) => ({ name: s.name, mutagen: s.mutagen! }));
    const synthHtml = '<div class="rk-synth"><span class="rk-label">推导 · 综论</span><p>'
      + palaceSynthesis(p.name, majorNames, mutList, isSoul, p.isBodyPalace) + "</p></div>";

    el.innerHTML = [
      '<button type="button" class="reading-close" aria-label="关闭">×</button>',
      '<div class="rk-top"><span class="rk-branch">' + p.earthlyBranch + '</span>',
        '<div class="rk-title"><h3>' + p.name + "<small>" + lore.theme + '</small></h3><div class="rk-flags">' + flags.join("") + "</div></div></div>",
      '<p class="rk-desc">' + lore.desc + "</p>",
      '<ul class="rk-stars">' + majorHtml + "</ul>",
      minorHtml,
      mutHtml,
      trineHtml,
      synthHtml,
    ].join("");
  }

  hint();

  return {
    show,
    clear,
    setChart: (chart) => { cachedChart = chart; },
    onClose: (fn) => { closeHandler = fn; },
  };
}
