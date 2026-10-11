import type { ChartModel } from "../engine/types";
import { deriveHexagram, hexClassic, type Hexagram } from "../engine/iching";
import { wuxingLore, soulBodyLore } from "../content/interpretations";

function yaoRows(hex: Hexagram): string {
  const rows: string[] = [];
  for (let i = 6; i >= 1; i--) {
    const yang = hex.lines[i - 1];
    const moving = i === hex.movingLine ? " moving" : "";
    rows.push(`<div class="yao${yang ? " yang" : " yin"}${moving}"><i></i><i></i></div>`);
  }
  return rows.join("");
}

export interface BenmingUI {
  render: (chart: ChartModel) => void;
}

/** 本命卦卡:核心卦象 + 分区解读(卦义/上下卦/命主/身主/五行局)。 */
export function createBenming(root: HTMLElement): BenmingUI {
  const el = document.createElement("section");
  el.className = "panel-card benming-card";
  el.setAttribute("aria-label", "本命卦");
  el.hidden = true;
  root.appendChild(el);

  function render(chart: ChartModel): void {
    const hex = deriveHexagram(chart);
    const classic = hexClassic(hex.name);
    const classicHtml = classic
      ? '<div class="div-classic"><span class="deriv-k">典籍 · 《周易》</span>'
        + '<blockquote class="classic-q tuan"><span class="cl-src">卦辞</span><p>' + classic.tuan + '</p></blockquote>'
        + '<blockquote class="classic-q xiang"><span class="cl-src">象曰</span><p>' + classic.xiang + '</p></blockquote></div>'
      : "";
    const heXiang = "上卦" + hex.upper.name + "(" + hex.upper.nature + ")" + hex.upper.trait
      + ",下卦" + hex.lower.name + "(" + hex.lower.nature + ")" + hex.lower.trait
      + ";上下相叠而成「" + hex.name + "」之象,乃先天禀赋之写照。";
    el.innerHTML = `
      <div class="div-top"><span class="panel-sub-k">本命卦 · 出生起卦</span></div>

      <div class="div-core">
        <div class="hex-lines big" aria-hidden="true">${yaoRows(hex)}</div>
        <div class="div-core-info">
          <b class="div-hex-name">${hex.name}</b>
          <span class="div-hex-tri">${hex.upper.symbol} ${hex.upper.name}·${hex.upper.nature} / ${hex.lower.symbol} ${hex.lower.name}·${hex.lower.nature}</span>
          <span class="div-hex-move">动爻第 ${hex.movingLine} 爻</span>
        </div>
      </div>

      <div class="div-read">
        <div class="read-row read-lead"><span class="rl-k">本命之象</span><p>本命卦由出生之时的天地之数起出,是一生禀赋与性情的底色、行事的本然倾向。观其象、体其德,可作修身立命之参照。</p></div>
        <div class="read-row"><span class="rl-k">卦义</span><p>${hex.meaning}</p></div>
        <div class="read-row two">
          <div><span class="rl-k">上卦 ${hex.upper.name}</span><p>${hex.upper.trait}</p></div>
          <div><span class="rl-k">下卦 ${hex.lower.name}</span><p>${hex.lower.trait}</p></div>
        </div>
        <div class="read-row"><span class="rl-k">合象</span><p>${heXiang}</p></div>
        <div class="read-row"><span class="rl-k">命主 ${chart.soul}</span><p>${soulBodyLore(chart.soul)}</p></div>
        <div class="read-row"><span class="rl-k">身主 ${chart.body}</span><p>${soulBodyLore(chart.body)}</p></div>
        <div class="read-row"><span class="rl-k">${chart.fiveElementsClass}</span><p>${wuxingLore(chart.fiveElementsClass)}</p></div>
      </div>

      ${classicHtml}

      <div class="div-foot">生肖 ${chart.zodiac} · 星座 ${chart.sign} · ${chart.solarDate}</div>
    `;
    el.hidden = false;
  }

  return { render };
}
