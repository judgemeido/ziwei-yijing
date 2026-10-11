import type { Divination, DivTense } from "../engine/divination";
import { hexClassic, type Hexagram } from "../engine/iching";

function yaoRows(hex: Hexagram, showMoving = true): string {
  const rows: string[] = [];
  for (let i = 6; i >= 1; i--) {
    const yang = hex.lines[i - 1];
    const moving = showMoving && i === hex.movingLine ? " moving" : "";
    rows.push(`<div class="yao${yang ? " yang" : " yin"}${moving}"><i></i><i></i></div>`);
  }
  return rows.join("");
}

const TENSE: { key: DivTense; label: string; sub: string }[] = [
  { key: "past", label: "过去", sub: "互卦 · 来路" },
  { key: "present", label: "当下", sub: "本卦 · 现状" },
  { key: "future", label: "未来", sub: "变卦 · 走向" },
];

const TENSE_LEAD: Record<DivTense, string> = {
  past: "过去 · 互卦藏于本卦之中,是事情一路行来的根由与积累。回望来路,方能明白当下何以如此:今日之结,多由昨日之因层层叠成。",
  present: "当下 · 本卦直指此刻所处的格局与态势。卦象所显,是你眼前真实的处境与心境;认清现状、不自欺,正是一切择路的起点。",
  future: "未来 · 变卦由动爻之变而生,是顺此势头推演而出的走向。非宿命已定,而是循当下之理、顺势而行所可期的转机。",
};
const TENSE_TIP: Record<DivTense, string> = {
  past: "借鉴 · 过往之因已成今日之果,得失皆在其中;取其经验、放下执念,来路便成助力而非包袱。",
  present: "持守 · 守住本心、看清格局,先立于不败而后谋进;分辨可为与不可为,再定进退缓急。",
  future: "顺势 · 顺卦象之势而动,不强求、不躁进;时未至则养晦蓄力,机既显则果决而行,静待其成。",
};

export interface DivUI {
  render: (div: Divination) => void;
  onExport: (fn: () => void) => void;
}

/** 卜卦面板:核心(卦象/卦名)与解读(卦义/上下卦/动爻/指引)分区,三象切换 + 导出。 */
export function createDivination(root: HTMLElement): DivUI {
  const el = document.createElement("section");
  el.className = "panel-card div-card";
  el.setAttribute("aria-label", "卜卦推演");
  el.hidden = true;
  root.appendChild(el);

  let current: Divination | null = null;
  let tense: DivTense = "present";
  let exportHandler: (() => void) | null = null;

  function hexOf(d: Divination, t: DivTense): Hexagram {
    return t === "past" ? d.hu : t === "future" ? d.bian : d.ben;
  }

  function paint(): void {
    if (!current) return;
    const d = current;
    const hex = hexOf(d, tense);
    const nameLine = d.name ? `${d.name} · 姓名笔画 ${d.nameInfo?.total ?? 0}` : "未填姓名 · 仅以时间起卦";
    const castLine = `卜于 ${d.castSolar} ${String(d.castHour).padStart(2, "0")}:00 · 农历 ${d.castLunarText}`;
    const moveLine = tense !== "past"
      ? `第 ${hex.movingLine} 爻为动爻,主变化之机`
      : `由本卦二至五爻互出,主其中过程`;

    const classic = hexClassic(hex.name);
    const classicHtml = classic
      ? '<div class="div-classic"><span class="deriv-k">典籍 · 《周易》</span>'
        + '<blockquote class="classic-q tuan"><span class="cl-src">卦辞</span><p>' + classic.tuan + '</p></blockquote>'
        + '<blockquote class="classic-q xiang"><span class="cl-src">象曰</span><p>' + classic.xiang + '</p></blockquote></div>'
      : "";
    const heXiang = "上卦" + hex.upper.name + "(" + hex.upper.nature + ")" + hex.upper.trait
      + ",下卦" + hex.lower.name + "(" + hex.lower.nature + ")" + hex.lower.trait
      + ";上下相叠而成「" + hex.name + "」之象。";

    el.innerHTML = `
      <div class="div-top">
        <span class="panel-sub-k">卜卦推演</span>
        <button type="button" class="div-export" aria-label="导出占卜">导出结果</button>
      </div>
      <div class="div-tense" role="tablist" aria-label="过去当下未来">
        ${TENSE.map((t) => `
          <button type="button" role="tab" class="tense-tab${t.key === tense ? " on" : ""}" data-tense="${t.key}" aria-selected="${t.key === tense}">
            <b>${t.label}</b><small>${t.sub}</small>
          </button>`).join("")}
      </div>

      <div class="div-core">
        <div class="hex-lines big" aria-hidden="true">${yaoRows(hex, tense !== "past")}</div>
        <div class="div-core-info">
          <b class="div-hex-name">${hex.name}</b>
          <span class="div-hex-tri">${hex.upper.symbol} ${hex.upper.name}·${hex.upper.nature} / ${hex.lower.symbol} ${hex.lower.name}·${hex.lower.nature}</span>
          <span class="div-hex-move">${moveLine}</span>
        </div>
      </div>

      <div class="div-read">
        <div class="read-row read-lead"><span class="rl-k">${TENSE[["past","present","future"].indexOf(tense)].label}之象</span><p>${TENSE_LEAD[tense]}</p></div>
        <div class="read-row"><span class="rl-k">卦义</span><p>${hex.meaning}</p></div>
        <div class="read-row two">
          <div><span class="rl-k">上卦 ${hex.upper.name}</span><p>${hex.upper.trait}</p></div>
          <div><span class="rl-k">下卦 ${hex.lower.name}</span><p>${hex.lower.trait}</p></div>
        </div>
        <div class="read-row"><span class="rl-k">合象</span><p>${heXiang}</p></div>
        <div class="read-row tip"><span class="rl-k">指引</span><p>${TENSE_TIP[tense]}</p></div>
      </div>

      ${classicHtml}

      <div class="div-foot">${nameLine} · ${castLine}</div>
    `;
    el.hidden = false;
  }

  el.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>(".tense-tab");
    if (t?.dataset.tense) { tense = t.dataset.tense as DivTense; paint(); return; }
    if ((e.target as HTMLElement).closest(".div-export")) { exportHandler?.(); }
  });

  function render(div: Divination): void { current = div; tense = "present"; paint(); }
  return { render, onExport: (fn) => { exportHandler = fn; } };
}
