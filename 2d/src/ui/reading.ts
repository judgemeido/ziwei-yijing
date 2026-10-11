import type { ChartModel } from "../engine/types";
import {
  PALACE_LORE,
  STAR_LORE,
  MUTAGEN_LORE,
  starInPalace,
  mutagenInPalace,
  palaceSynthesis,
} from "../content/interpretations";

const MUT_CLASS: Record<string, string> = {
  禄: "mut-lu", 权: "mut-quan", 科: "mut-ke", 忌: "mut-ji",
};

export interface ReadingUI {
  show: (chart: ChartModel, index: number) => void;
  clear: () => void;
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

  el.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".reading-close")) {
      hint();
      closeHandler?.();
    }
  });

  function hint(): void {
    el.innerHTML = [
      '<div class="reading-guide">',
        '<h3 class="guide-title">命盘使用方法</h3>',
        '<ol class="guide-steps">',
          '<li><b>起盘</b>:填入姓名、公历生辰与性别,点「起盘起卦」生成圆形星盘。</li>',
          '<li><b>看盘</b>:外环为后天八卦与廿四向,十二宫按地支时钟分布,中宫为命主与本命卦。</li>',
          '<li><b>读盘</b>:点任一宫位,查看宫义、主星「星×宫」、四化、三方四正与推导综论。</li>',
          '<li><b>卜卦</b>:在「卜卦」页以姓名并当下时间起卦,切换过去(互卦)·当下(本卦)·未来(变卦)。</li>',
          '<li><b>本命</b>:在「本命」页看由出生起出的本命卦及其推导。</li>',
        '</ol>',
        '<div class="guide-legend">',
          '<span class="rk-label">图例</span>',
          '<div class="legend-row">',
            '<span class="lg"><em class="flag soul">命</em>命宫</span>',
            '<span class="lg"><em class="flag body">身</em>身宫</span>',
            '<span class="lg"><i class="mut mut-lu">禄</i><i class="mut mut-quan">权</i><i class="mut mut-ke">科</i><i class="mut mut-ji">忌</i>四化</span>',
          '</div>',
          '<p class="guide-hint-sm">点击任意宫位,开始读盘。</p>',
        '</div>',
      '</div>',
    ].join("");
  }

  function clear(): void { hint(); }

  function show(chart: ChartModel, index: number): void {
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
    onClose: (fn) => { closeHandler = fn; },
  };
}
