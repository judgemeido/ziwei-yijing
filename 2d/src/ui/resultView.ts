import type { Divination } from "../engine/divination";
import type { Hexagram } from "../engine/iching";
import type { ChartModel } from "../engine/types";
import { exportPNG, exportPDF } from "./exporter";

function yaoRows(hex: Hexagram): string {
  const rows: string[] = [];
  for (let i = 6; i >= 1; i--) {
    const yang = hex.lines[i - 1];
    const moving = i === hex.movingLine ? " moving" : "";
    rows.push(`<div class="yao${yang ? " yang" : " yin"}${moving}"><i></i><i></i></div>`);
  }
  return rows.join("");
}

function hexBlock(title: string, sub: string, hex: Hexagram, lead: string): string {
  return `
    <div class="rv-hex">
      <div class="rv-hex-head"><span class="rv-hex-tense">${title}</span><small>${sub}</small></div>
      <div class="rv-hex-row">
        <div class="hex-lines big" aria-hidden="true">${yaoRows(hex)}</div>
        <div class="rv-hex-meta">
          <b>${hex.name}</b>
          <span>${hex.upper.symbol}${hex.upper.name} / ${hex.lower.symbol}${hex.lower.name}</span>
        </div>
      </div>
      <p class="rv-hex-lead">${lead}</p>
      <p class="rv-hex-mean">${hex.meaning}</p>
    </div>`;
}

export interface ResultView {
  open: (chart: ChartModel, div: Divination, benmingName: string) => void;
  close: () => void;
}

/** 独立全屏结果视图:直观汇总命盘 + 卜卦过去/当下/未来,支持 PNG / PDF 导出。 */
export function createResultView(root: HTMLElement): ResultView {
  const overlay = document.createElement("div");
  overlay.className = "result-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "占卜结果");
  overlay.hidden = true;
  root.appendChild(overlay);

  let cur: { chart: ChartModel; div: Divination } | null = null;

  function close(): void { overlay.hidden = true; document.body.style.overflow = ""; }

  function open(chart: ChartModel, div: Divination, benmingName: string): void {
    cur = { chart, div };
    const nameLine = div.name ? `${div.name}` : "无名氏";
    const strokeLine = div.nameInfo
      ? `姓名笔画 ${div.nameInfo.total}(${div.nameInfo.perChar.map((p) => `${p.char}${p.strokes}`).join(" ")})`
      : "未填姓名,仅以时间起卦";
    overlay.innerHTML = `
      <div class="rv-scrim" data-close></div>
      <div class="rv-sheet" role="document">
        <header class="rv-head">
          <div>
            <span class="rv-kicker">星枢 · 占卜结果</span>
            <h2 class="rv-title">${nameLine} 的卜卦</h2>
          </div>
          <div class="rv-actions">
            <button type="button" class="rv-btn" data-png>导出 PNG</button>
            <button type="button" class="rv-btn" data-pdf>导出 PDF</button>
            <button type="button" class="rv-btn rv-close" data-close aria-label="关闭">×</button>
          </div>
        </header>
        <div class="rv-print" id="rv-print">
          <div class="rv-summary">
            <div class="rv-sum-item"><dt>命主</dt><dd>${chart.soul}</dd></div>
            <div class="rv-sum-item"><dt>身主</dt><dd>${chart.body}</dd></div>
            <div class="rv-sum-item"><dt>五行局</dt><dd>${chart.fiveElementsClass}</dd></div>
            <div class="rv-sum-item"><dt>生肖</dt><dd>${chart.zodiac}</dd></div>
            <div class="rv-sum-item"><dt>星座</dt><dd>${chart.sign}</dd></div>
            <div class="rv-sum-item"><dt>本命卦</dt><dd>${benmingName}</dd></div>
          </div>
          <p class="rv-castmeta">${strokeLine} · 卜卦 ${div.castSolar} ${String(div.castHour).padStart(2, "0")}:00 · 农历 ${div.castLunarText}</p>
          <div class="rv-hexes">
            ${hexBlock("过去", "互卦 · 来路", div.hu, "来路与积累:")}
            ${hexBlock("当下", "本卦 · 现状", div.ben, "此刻现状:")}
            ${hexBlock("未来", "变卦 · 走向", div.bian, "未来走向:")}
          </div>
          <p class="rv-foot">仅供文化娱乐,不构成任何决策建议 · 星枢</p>
        </div>
      </div>
    `;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  overlay.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-close]")) { close(); return; }
    if (t.closest("[data-png]") && cur) { void exportPNG(cur.chart, cur.div); return; }
    if (t.closest("[data-pdf]")) { exportPDF(); return; }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) close(); });

  return { open, close };
}
