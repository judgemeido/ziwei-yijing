import type { Divination } from "../engine/divination";
import type { Hexagram } from "../engine/iching";
import type { ChartModel } from "../engine/types";

// ---- PNG:手绘 canvas 结果卡(离线,无依赖)----
const W = 1080;
const PAD = 72;
const COL = { bg: "#0b0e15", panel: "#141926", fg: "#f5f5f7", fg2: "#a7acba", fg3: "#6b7180", accent: "#6e7bff", accent2: "#64d2ff", hair: "rgba(255,255,255,0.12)" };

function drawYao(ctx: CanvasRenderingContext2D, hex: Hexagram, x: number, y: number): number {
  const lineW = 120, lineH = 12, gap = 9, gapYin = 20;
  for (let idx = 6; idx >= 1; idx--) {
    const yang = hex.lines[idx - 1];
    const moving = idx === hex.movingLine;
    ctx.fillStyle = moving ? COL.accent2 : (yang ? COL.fg : COL.fg2);
    const yy = y + (6 - idx) * (lineH + gap);
    if (yang) {
      ctx.fillRect(x, yy, lineW, lineH);
    } else {
      const seg = (lineW - gapYin) / 2;
      ctx.fillRect(x, yy, seg, lineH);
      ctx.fillRect(x + seg + gapYin, yy, seg, lineH);
    }
  }
  return 6 * (lineH + gap);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number): number {
  const chars = Array.from(text);
  let line = "", yy = y;
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width > maxW && line) { ctx.fillText(line, x, yy); line = ch; yy += lh; }
    else line += ch;
  }
  if (line) { ctx.fillText(line, x, yy); yy += lh; }
  return yy;
}

function hexSection(ctx: CanvasRenderingContext2D, y: number, tense: string, sub: string, hex: Hexagram, lead: string): number {
  const x = PAD;
  ctx.fillStyle = COL.panel;
  const h = 300;
  roundRect(ctx, x, y, W - PAD * 2, h, 22); ctx.fill();
  ctx.strokeStyle = COL.hair; ctx.lineWidth = 1; roundRect(ctx, x, y, W - PAD * 2, h, 22); ctx.stroke();

  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillStyle = COL.accent2; ctx.font = "600 26px Inter, 'Noto Sans SC', sans-serif";
  ctx.fillText(tense, x + 32, y + 28);
  ctx.fillStyle = COL.fg3; ctx.font = "400 20px Inter, 'Noto Sans SC', sans-serif";
  ctx.fillText(sub, x + 32 + ctx.measureText(tense).width + 16, y + 34);

  drawYao(ctx, hex, x + 32, y + 76);

  ctx.fillStyle = COL.fg; ctx.font = "700 42px 'Noto Sans SC', Inter, sans-serif";
  ctx.fillText(hex.name, x + 200, y + 80);
  ctx.fillStyle = COL.fg2; ctx.font = "400 24px 'Noto Sans SC', sans-serif";
  ctx.fillText(`${hex.upper.symbol}${hex.upper.name} / ${hex.lower.symbol}${hex.lower.name}`, x + 200, y + 134);

  ctx.fillStyle = COL.fg3; ctx.font = "500 20px 'Noto Sans SC', sans-serif";
  ctx.fillText(lead, x + 32, y + 190);
  ctx.fillStyle = COL.fg2; ctx.font = "400 23px 'Noto Sans SC', sans-serif";
  wrap(ctx, hex.meaning, x + 32, y + 222, W - PAD * 2 - 64, 34);
  return h + 24;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function exportPNG(chart: ChartModel, div: Divination): Promise<void> {
  const H = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 背景
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#121633");
  g.addColorStop(1, COL.bg);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillStyle = COL.accent2; ctx.font = "600 24px Inter, sans-serif";
  ctx.fillText("ZI WEI · YI JING", PAD, 56);
  ctx.fillStyle = COL.fg; ctx.font = "800 64px 'Noto Sans SC', Inter, sans-serif";
  ctx.fillText(`${div.name || "无名氏"} 的卜卦`, PAD, 86);

  // 命主摘要
  ctx.fillStyle = COL.fg2; ctx.font = "400 23px 'Noto Sans SC', sans-serif";
  const sum = `命主 ${chart.soul} · 身主 ${chart.body} · ${chart.fiveElementsClass} · 生肖 ${chart.zodiac} · ${chart.sign}`;
  ctx.fillText(sum, PAD, 176);
  const strokeLine = div.nameInfo ? `姓名笔画 ${div.nameInfo.total} · ` : "";
  ctx.fillStyle = COL.fg3; ctx.font = "400 20px 'Noto Sans SC', sans-serif";
  ctx.fillText(`${strokeLine}卜卦 ${div.castSolar} ${String(div.castHour).padStart(2, "0")}:00 · 农历 ${div.castLunarText}`, PAD, 212);

  let y = 268;
  y += hexSection(ctx, y, "过去", "互卦 · 来路", div.hu, "来路与积累:");
  y += hexSection(ctx, y, "当下", "本卦 · 现状", div.ben, "此刻现状:");
  y += hexSection(ctx, y, "未来", "变卦 · 走向", div.bian, "未来走向:");

  ctx.fillStyle = COL.fg3; ctx.font = "400 19px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("仅供文化娱乐,不构成任何决策建议 · 星枢", W / 2, y + 8);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `星枢占卜_${div.name || "无名"}_${div.castSolar}.png`;
  a.click();
}

/** PDF:借浏览器打印(打印样式仅保留结果卡),用户另存为 PDF。离线可用。 */
export function exportPDF(): void {
  window.print();
}

