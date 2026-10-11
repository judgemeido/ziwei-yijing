import type { ChartModel, Star } from "../engine/types";
import { deriveHexagram, TRIGRAMS, type Hexagram } from "../engine/iching";

const MUT_CLASS: Record<string, string> = { 禄: "mut-lu", 权: "mut-quan", 科: "mut-ke", 忌: "mut-ji" };

// 地支 → 时钟序(子=0 置顶,顺时针)。
const BRANCH_ORDER: Record<string, number> = {
  子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5, 午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
};

// 后天八卦顺时针(自顶/南起):离 坤 兑 乾 坎 艮 震 巽。
const BAGUA_RING = [3, 8, 2, 1, 6, 7, 4, 5]; // 先天数索引进 TRIGRAMS

export interface GridUI {
  render: (chart: ChartModel) => void;
  renderPlaceholder: () => void;
  onPalaceClick: (fn: (index: number) => void) => void;
  setSelected: (index: number | null) => void;
  getCell: (index: number) => HTMLElement | null;
}

export function trineSet(index: number): number[] {
  return [index, (index + 4) % 12, (index + 6) % 12, (index + 8) % 12];
}

function majorTag(s: Star): string {
  const mut = s.mutagen ? ` <i class="mut ${MUT_CLASS[s.mutagen] ?? ""}">${s.mutagen}</i>` : "";
  const bri = s.brightness ? `<i class="bri">${s.brightness}</i>` : "";
  return `<span class="star is-major">${s.name}${bri}${mut}</span>`;
}

function taijiSVG(): string {
  return `
  <svg class="taiji" viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <clipPath id="half"><rect x="0" y="0" width="50" height="100"/></clipPath>
    </defs>
    <circle cx="50" cy="50" r="48" fill="#0b0e15"/>
    <path d="M50 2 a48 48 0 0 1 0 96 a24 24 0 0 1 0 -48 a24 24 0 0 0 0 -48z" fill="#f5f5f7"/>
    <circle cx="50" cy="26" r="7" fill="#0b0e15"/>
    <circle cx="50" cy="74" r="7" fill="#f5f5f7"/>
    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
  </svg>`;
}

function hexLines(hex: Hexagram): string {
  // 由上而下渲染(第6爻在上),标记动爻
  const rows = [];
  for (let i = 6; i >= 1; i--) {
    const yang = hex.lines[i - 1];
    const moving = i === hex.movingLine ? " moving" : "";
    rows.push(`<div class="yao${yang ? " yang" : " yin"}${moving}"><i></i><i></i></div>`);
  }
  return rows.join("");
}

const SVG_NS = "http://www.w3.org/2000/svg";

/** 底层 SVG 内容:同心环 + 24 刻度 + 后天八卦环(与 chart 无关,占位态可复用)。 */
function ringsInner(): string {
  const els: string[] = [];
  [498, 430, 322, 232].forEach((r, i) => {
    els.push('<circle cx="500" cy="500" r="' + r + '" pathLength="1" fill="none" stroke="rgba(255,255,255,' + (i === 0 ? 0.16 : 0.08) + ')" stroke-width="1"/>');
  });
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 - 90) * Math.PI / 180;
    const r1 = 498, r2 = i % 2 === 0 ? 478 : 486;
    els.push('<line x1="' + (500 + r1 * Math.cos(a)) + '" y1="' + (500 + r1 * Math.sin(a)) + '" x2="' + (500 + r2 * Math.cos(a)) + '" y2="' + (500 + r2 * Math.sin(a)) + '" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>');
  }
  BAGUA_RING.forEach((num, j) => {
    const t = TRIGRAMS[num];
    const a = (j * 45 - 90) * Math.PI / 180;
    const rr = 464;
    const x = 500 + rr * Math.cos(a), y = 500 + rr * Math.sin(a);
    els.push('<text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" class="bagua-sym">' + t.symbol + '</text>');
    els.push('<text x="' + x + '" y="' + (y + 34) + '" text-anchor="middle" class="bagua-name">' + t.name + '</text>');
  });
  return els.join("");
}


// 起盘充能:清气粒子沿命盘环凝聚(reduced-motion 下跳过)。
function startWheelFX(wrap: HTMLElement): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const old = wrap.querySelector(".wheel-fx");
  if (old) old.remove();
  const canvas = document.createElement("canvas");
  canvas.className = "wheel-fx";
  canvas.setAttribute("aria-hidden", "true");
  wrap.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const rect = wrap.getBoundingClientRect();
  if (!ctx || rect.width < 2) { canvas.remove(); return; }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = rect.width, H = rect.height;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const cx = (W / 2) * dpr, cy = (H / 2) * dpr;
  const R = (Math.min(W, H) / 2) * dpr;
  const hues = ["rgba(167,172,255,", "rgba(110,123,255,", "rgba(100,210,255,", "rgba(238,240,255,"];
  interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: string; size: number; }
  const ps: P[] = [];
  const spawnRing = (nn: number): void => {
    for (let i = 0; i < nn; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = R * (0.70 + Math.random() * 0.22);
      const dir = Math.random() < 0.5 ? 1 : -1;
      const tang = dir * (0.18 + Math.random() * 0.30) * dpr;
      ps.push({
        x: cx + rr * Math.cos(a),
        y: cy + rr * Math.sin(a),
        vx: Math.cos(a + Math.PI / 2) * tang - Math.cos(a) * 0.16 * dpr,
        vy: Math.sin(a + Math.PI / 2) * tang - Math.sin(a) * 0.16 * dpr,
        life: 0, max: 70 + Math.random() * 70,
        hue: hues[(Math.random() * hues.length) | 0],
        size: (0.7 + Math.random() * 1.6) * dpr,
      });
    }
  };
  let frames = 0, raf = 0, spawning = true;
  const frame = (): void => {
    frames++;
    if (spawning) { spawnRing(5); if (frames >= 64) spawning = false; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (let i = ps.length - 1; i >= 0; i--) {
      const pt = ps[i];
      pt.life++; pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.99; pt.vy *= 0.99;
      const pr = pt.life / pt.max;
      if (pr >= 1) { ps.splice(i, 1); continue; }
      const alpha = Math.sin(Math.min(pr, 1) * Math.PI) * 0.6;
      ctx.fillStyle = pt.hue + alpha.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!spawning && ps.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(raf);
      canvas.remove();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

/** 渲染圆形星盘:八卦外环 + 十二宫环 + 太极/本命卦中心。 */
export function createGrid(root: HTMLElement): GridUI {
  const wrap = document.createElement("div");
  wrap.className = "board-wrap wheel-wrap";
  root.appendChild(wrap);

  const clickHandlers: ((index: number) => void)[] = [];
  const cells = new Map<number, HTMLElement>();

  function activate(index: number): void {
    setSelected(index);
    clickHandlers.forEach((fn) => fn(index));
  }

  function render(chart: ChartModel): void {
    wrap.innerHTML = "";
    cells.clear();
    wrap.classList.remove("placeholder", "ready");

    const hex = deriveHexagram(chart);

    // --- 底层 SVG:同心环 + 刻度 + 八卦(与占位态复用同一结构) ---
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "wheel-rings");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ringsInner();
    wrap.appendChild(svg);

    // 起卦充能:一道清光绕盘而行,渐次点亮命盘
    const sweep = document.createElement("div");
    sweep.className = "wheel-sweep";
    sweep.setAttribute("aria-hidden", "true");
    wrap.appendChild(sweep);

    // --- 十二宫环(卡片按角度绝对定位)---
    const ring = document.createElement("div");
    ring.className = "wheel-ring";
    wrap.appendChild(ring);

    for (const p of chart.palaces) {
      const clock = BRANCH_ORDER[p.earthlyBranch];
      if (clock === undefined) continue;
      const angle = (clock * 30 - 90) * Math.PI / 180;
      const rPct = 40.5; // 卡片中心半径(相对容器百分比)
      const cx = 50 + rPct * Math.cos(angle);
      const cy = 50 + rPct * Math.sin(angle);

      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = String(p.index);
      cell.dataset.ang = String(angle);
      cell.style.left = `${cx}%`;
      cell.style.top = `${cy}%`;
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", "0");
      cell.setAttribute("aria-pressed", "false");
      cell.setAttribute("aria-label", `${p.earthlyBranch} ${p.name}`);

      const flags: string[] = [];
      if (p.index === chart.soulIndex) flags.push(`<em class="flag soul">命</em>`);
      if (p.isBodyPalace) flags.push(`<em class="flag body">身</em>`);

      const majors = p.stars.filter((s) => s.type === "major");
      const starHtml = majors.length
        ? majors.slice(0, 2).map(majorTag).join("")
        : `<span class="star empty">空宫</span>`;
      const more = "";

      cell.innerHTML = `
        <div class="cell-head">
          <span class="branch">${p.earthlyBranch}</span>
          <span class="pname">${p.name}</span>
          ${flags.join("")}
        </div>
        <div class="cell-stars">${starHtml}${more}</div>
      `;
      ring.appendChild(cell);
      cells.set(p.index, cell);
    }

    // --- 中心:太极 + 命主 + 本命卦 ---
    const center = document.createElement("div");
    center.className = "wheel-center";
    center.innerHTML = `
      ${taijiSVG()}
      <div class="center-inner">
        <div class="seal">星枢</div>
        <dl class="meta">
          <div><dt>命主</dt><dd>${chart.soul}</dd></div>
          <div><dt>身主</dt><dd>${chart.body}</dd></div>
          <div><dt>五行局</dt><dd>${chart.fiveElementsClass}</dd></div>
          <div><dt>生肖</dt><dd>${chart.zodiac}</dd></div>
        </dl>
        <div class="benming">
          <div class="hex-lines" aria-hidden="true">${hexLines(hex)}</div>
          <div class="hex-text">
            <span class="hex-k">本命卦</span>
            <b class="hex-name">${hex.name}</b>
            <span class="hex-tri">${hex.upper.symbol}${hex.lower.symbol} · 动爻 ${hex.movingLine}</span>
          </div>
        </div>
        <div class="dates">${chart.solarDate} · 农历 ${chart.lunarDate}</div>
      </div>
    `;
    wrap.appendChild(center);

    requestAnimationFrame(() => {
      cells.forEach((c) => {
        const angDeg = Number(c.dataset.ang) * 180 / Math.PI;
        const clock = ((Math.round((angDeg + 90) / 30) % 12) + 12) % 12;
        c.style.animationDelay = (160 + clock * 92) + "ms";
      });
      const tj = center.querySelector(".taiji");
      if (tj) tj.classList.add("taiji-reveal");
      wrap.classList.add("ready");
      startWheelFX(wrap);
    });
  }

  wrap.addEventListener("click", (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>(".cell");
    if (!cell || cell.dataset.index === undefined) return;
    activate(Number(cell.dataset.index));
  });
  wrap.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const cell = (e.target as HTMLElement).closest<HTMLElement>(".cell");
    if (!cell || cell.dataset.index === undefined) return;
    e.preventDefault();
    activate(Number(cell.dataset.index));
  });

  function setSelected(index: number | null): void {
    const trine = index === null ? [] : trineSet(index);
    cells.forEach((cell, idx) => {
      const isSel = idx === index;
      const isTrine = trine.includes(idx) && !isSel;
      cell.classList.toggle("is-selected", isSel);
      cell.classList.toggle("is-trine", isTrine);
      cell.setAttribute("aria-pressed", String(isSel));
    });
  }

  function renderPlaceholder(): void {
    wrap.innerHTML = "";
    cells.clear();
    wrap.classList.remove("ready", "settled");
    wrap.classList.add("placeholder");

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "wheel-rings");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ringsInner();
    wrap.appendChild(svg);

    const ring = document.createElement("div");
    ring.className = "wheel-ring";
    wrap.appendChild(ring);

    Object.keys(BRANCH_ORDER).forEach((branch) => {
      const clock = BRANCH_ORDER[branch];
      const angle = (clock * 30 - 90) * Math.PI / 180;
      const cx = 50 + 40.5 * Math.cos(angle);
      const cy = 50 + 40.5 * Math.sin(angle);
      const cell = document.createElement("div");
      cell.className = "cell cell-empty";
      cell.dataset.ang = String(angle);
      cell.style.left = cx + "%";
      cell.style.top = cy + "%";
      cell.setAttribute("aria-hidden", "true");
      cell.innerHTML = '<div class="cell-head"><span class="branch">' + branch + '</span></div><div class="cell-stars"><span class="star empty">—</span></div>';
      ring.appendChild(cell);
    });

    const center = document.createElement("div");
    center.className = "wheel-center";
    center.innerHTML = taijiSVG() + '<div class="center-inner"><div class="seal">星枢</div><p class="ph-hint">填写左侧生辰<br/>起盘 · 观象</p></div>';
    wrap.appendChild(center);

    requestAnimationFrame(() => {
      ring.querySelectorAll<HTMLElement>(".cell").forEach((c) => {
        const angDeg = Number(c.dataset.ang) * 180 / Math.PI;
        const clock = ((Math.round((angDeg + 90) / 30) % 12) + 12) % 12;
        c.style.animationDelay = (160 + clock * 70) + "ms";
      });
      wrap.classList.add("ready");
    });
  }

  return {
    render,
    renderPlaceholder,
    onPalaceClick: (fn) => clickHandlers.push(fn),
    setSelected,
    getCell: (index) => cells.get(index) ?? null,
  };
}


