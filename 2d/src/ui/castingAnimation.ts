// 起卦仪式(道学·易经):去除向内辐射线条,改为「主星盘(紫微盘)· 副星盘(卦盘)」双徽凝聚;
// 卦名显现时二徽并发微光,随后以惯性坠入标题「星枢」右侧,长驻闪闪微光。
// 纯 Canvas/CSS/SVG,尊重 reduced-motion。

export interface CastSigilData {
  lines: boolean[];      // 本卦六爻,下→上
  movingLine: number;    // 动爻 1-6
  name: string;          // 卦名
  soulClock: number;     // 命宫地支时钟位 0..11(子=0 置顶,顺时针)
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// 中心小太极
function taijiMini(): string {
  return '<g class="sg-taiji" transform="translate(50 50) scale(0.2)">'
    + '<circle cx="0" cy="0" r="48" fill="#0b0e15"/>'
    + '<path d="M0 -48 a48 48 0 0 1 0 96 a24 24 0 0 1 0 -48 a24 24 0 0 0 0 -48z" fill="#eef0ff"/>'
    + '<circle cx="0" cy="-24" r="7" fill="#0b0e15"/>'
    + '<circle cx="0" cy="24" r="7" fill="#eef0ff"/>'
    + '</g>';
}

// 主星盘:紫微 mini 盘(双环 + 十二地支点 + 命宫高亮 + 中心太极)
export function mainSigilSVG(soulClock: number): string {
  const parts: string[] = [];
  parts.push('<circle class="sg-ring" cx="50" cy="50" r="46" fill="none"/>');
  parts.push('<circle class="sg-ring sg-ring2" cx="50" cy="50" r="31" fill="none"/>');
  for (let c = 0; c < 12; c++) {
    const a = (c * 30 - 90) * Math.PI / 180;
    const x = 50 + 38.5 * Math.cos(a);
    const y = 50 + 38.5 * Math.sin(a);
    const soul = c === soulClock;
    parts.push('<circle class="sg-dot' + (soul ? ' sg-soul' : '') + '" cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + (soul ? 3.6 : 1.9) + '" style="--i:' + c + '"/>');
  }
  return '<svg class="sigil-svg sigil-main" viewBox="0 0 100 100" aria-hidden="true">' + parts.join('') + taijiMini() + '</svg>';
}

// 副星盘:本卦六爻卦象(动爻以青金强调)
export function subSigilSVG(lines: boolean[], movingLine: number): string {
  const bars: string[] = [];
  const barW = 60, cx = 50, h = 7, gap = 7.6, n = 6;
  const total = n * h + (n - 1) * gap;
  const top = (100 - total) / 2;
  for (let i = n; i >= 1; i--) {
    const y = top + (n - i) * (h + gap);
    const yang = lines[i - 1];
    const moving = i === movingLine;
    const cls = 'sg-yao' + (moving ? ' sg-moving' : '');
    const si = ' style="--i:' + (n - i) + '"';
    if (yang) {
      bars.push('<rect class="' + cls + '" x="' + (cx - barW / 2) + '" y="' + y.toFixed(2) + '" width="' + barW + '" height="' + h + '" rx="2.2"' + si + '/>');
    } else {
      const seg = (barW - 12) / 2;
      bars.push('<rect class="' + cls + '" x="' + (cx - barW / 2) + '" y="' + y.toFixed(2) + '" width="' + seg + '" height="' + h + '" rx="2.2"' + si + '/>');
      bars.push('<rect class="' + cls + '" x="' + (cx + barW / 2 - seg) + '" y="' + y.toFixed(2) + '" width="' + seg + '" height="' + h + '" rx="2.2"' + si + '/>');
    }
  }
  return '<svg class="sigil-svg sigil-sub" viewBox="0 0 100 100" aria-hidden="true">' + bars.join('') + '</svg>';
}

function sigilPairHTML(d: CastSigilData): string {
  return '<span class="brand-sigil main" title="紫微命盘">' + mainSigilSVG(d.soulClock) + '</span>'
       + '<span class="brand-sigil sub" title="' + d.name + '卦">' + subSigilSVG(d.lines, d.movingLine) + '</span>';
}

interface Mote { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: string; size: number; }

function startFX(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => { canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; };
  resize();
  window.addEventListener("resize", resize);
  const motes: Mote[] = [];
  let raf = 0;
  let ambient = true;
  const hues = ["rgba(167,172,255,", "rgba(110,123,255,", "rgba(100,210,255,", "rgba(238,240,255,"];
  const pickHue = () => hues[(Math.random() * hues.length) | 0];
  function rise(px: number, py: number, nn: number): void {
    for (let i = 0; i < nn; i++) {
      motes.push({
        x: px * dpr + (Math.random() - 0.5) * 40 * dpr,
        y: py * dpr + (Math.random() - 0.5) * 10 * dpr,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: -(0.12 + Math.random() * 0.4) * dpr,
        life: 0, max: 120 + Math.random() * 120,
        hue: pickHue(), size: (0.8 + Math.random() * 1.8) * dpr,
      });
    }
  }
  function ambientSpawn(): void {
    motes.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 6,
      vx: (Math.random() - 0.5) * 0.18 * dpr,
      vy: -(0.08 + Math.random() * 0.26) * dpr,
      life: 0, max: 220 + Math.random() * 160,
      hue: pickHue(), size: (0.6 + Math.random() * 1.3) * dpr,
    });
  }
  function frame(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ambient && Math.random() < 0.4) ambientSpawn();
    ctx.globalCompositeOperation = "lighter";
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.life++;
      m.x += m.vx; m.y += m.vy; m.vx *= 0.995;
      const pr = m.life / m.max;
      if (pr >= 1) { motes.splice(i, 1); continue; }
      const alpha = Math.sin(Math.min(pr, 1) * Math.PI) * 0.7;
      ctx.fillStyle = m.hue + alpha.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  frame();
  return {
    rise,
    stopAmbient: () => { ambient = false; },
    stop: () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); },
  };
}

function centerRise(el: HTMLElement, fx: { rise: (x: number, y: number, n: number) => void }, n: number): void {
  const r = el.getBoundingClientRect();
  fx.rise(r.left + r.width / 2, r.top + r.height / 2, n);
}

async function flyToDock(overlay: HTMLElement, dock: HTMLElement | null, d: CastSigilData): Promise<void> {
  if (!dock) { overlay.classList.add("flying"); await wait(560); return; }
  dock.innerHTML = sigilPairHTML(d);
  dock.classList.add("arriving");
  const targets = Array.from(dock.querySelectorAll<HTMLElement>(".brand-sigil .sigil-svg"));
  const sources = Array.from(overlay.querySelectorAll<HTMLElement>(".cast-sigil .sigil-box"));
  overlay.classList.add("flying");
  sources.forEach((box, idx) => {
    const tgt = targets[idx];
    if (!tgt) return;
    const s = box.getBoundingClientRect();
    const t = tgt.getBoundingClientRect();
    const dx = (t.left + t.width / 2) - (s.left + s.width / 2);
    const dy = (t.top + t.height / 2) - (s.top + s.height / 2);
    const sc = t.width / s.width;
    const fig = box.closest(".cast-sigil") as HTMLElement;
    fig.style.setProperty("--dx", dx.toFixed(1) + "px");
    fig.style.setProperty("--dy", dy.toFixed(1) + "px");
    fig.style.setProperty("--sc", sc.toFixed(4));
    fig.style.setProperty("--fly-delay", (idx * 80) + "ms");
    fig.classList.add("fly");
  });
  await wait(980);
  dock.classList.remove("arriving");
}

const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()));

function loaderTaijiSVG(): string {
  return '<svg class="cl-taiji" viewBox="0 0 100 100" aria-hidden="true">'
    + '<circle cx="50" cy="50" r="47" fill="none" stroke="rgba(167,172,255,0.35)" stroke-width="1.4"/>'
    + '<path d="M50 4 a46 46 0 0 1 0 92 a23 23 0 0 1 0 -46 a23 23 0 0 0 0 -46z" fill="rgba(238,240,255,0.9)"/>'
    + '<circle cx="50" cy="27" r="6.5" fill="#0b0e15"/>'
    + '<circle cx="50" cy="73" r="6.5" fill="rgba(238,240,255,0.9)"/>'
    + '</svg>';
}

/** 双星盘起卦仪式:先读条预载(繁重计算在此完成),再播放无停顿的双徽仪式。 */
export async function castingCeremony<T>(dataPromise: Promise<T>, pick: (t: T) => CastSigilData, onReveal?: (t: T) => void): Promise<T> {
  const dock = document.getElementById("brand-sigils");

  if (reduced()) {
    const data = await dataPromise;
    if (dock) dock.innerHTML = sigilPairHTML(pick(data));
    onReveal?.(data);
    return data;
  }

  document.body.style.overflow = "hidden";

  // ---- Phase 0: 读条预载(繁重计算在此完成;进度条/太极由合成器驱动,主线程计算不致顿挫) ----
  const loader = document.createElement("div");
  loader.className = "cast-loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-label", "起卦准备中");
  loader.innerHTML =
    '<div class="cl-backdrop" aria-hidden="true"></div>' +
    '<div class="cl-inner">' +
      '<div class="cl-glyph" aria-hidden="true">' + loaderTaijiSVG() + '</div>' +
      '<div class="cl-label">凝神聚气 · 起卦准备</div>' +
      '<div class="cl-track"><div class="cl-fill"></div></div>' +
    '</div>';
  document.body.appendChild(loader);
  requestAnimationFrame(() => loader.classList.add("show"));
  // 先让读条绘制并在合成器线程起步,再触发可能阻塞主线程的计算
  await nextFrame();
  await nextFrame();

  const t0 = Date.now();
  const data = await dataPromise;
  const minMs = 820;
  const spent = Date.now() - t0;
  if (spent < minMs) await wait(minMs - spent);

  loader.classList.add("done");
  await wait(300);
  loader.classList.add("out");
  await wait(260);
  loader.remove();

  const d = pick(data);

  // ---- Phase 1: 双徽仪式(数据已就绪,全程无 await 停顿) ----
  const overlay = document.createElement("div");
  overlay.className = "cast-overlay";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-label", "起卦中");
  overlay.innerHTML =
    '<div class="cast-backdrop" aria-hidden="true"></div>' +
    '<canvas class="cast-particles"></canvas>' +
    '<div class="cast-halo" aria-hidden="true"></div>' +
    '<div class="cast-stage">' +
      '<div class="cast-sigils">' +
        '<figure class="cast-sigil main"><div class="sigil-box"></div><figcaption>主 · 紫微盘</figcaption></figure>' +
        '<figure class="cast-sigil sub"><div class="sigil-box"></div><figcaption>副 · 卦盘</figcaption></figure>' +
      '</div>' +
      '<div class="cast-caption">凝神 · 起卦</div>' +
      '<div class="cast-name" aria-live="polite"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  const canvas = overlay.querySelector(".cast-particles") as HTMLCanvasElement;
  const fx = startFX(canvas);

  const mainFig = overlay.querySelector(".cast-sigil.main") as HTMLElement;
  const subFig = overlay.querySelector(".cast-sigil.sub") as HTMLElement;
  (mainFig.querySelector(".sigil-box") as HTMLElement).innerHTML = mainSigilSVG(d.soulClock);
  (subFig.querySelector(".sigil-box") as HTMLElement).innerHTML = subSigilSVG(d.lines, d.movingLine);

  requestAnimationFrame(() => overlay.classList.add("show"));
  await wait(300);

  mainFig.classList.add("form");
  centerRise(mainFig, fx, 14);
  await wait(500);
  subFig.classList.add("form");
  centerRise(subFig, fx, 14);
  await wait(560);

  const nameEl = overlay.querySelector(".cast-name") as HTMLElement;
  nameEl.textContent = d.name;
  overlay.classList.add("named");
  fx.rise(window.innerWidth / 2, window.innerHeight / 2, 40);
  await wait(820);

  // 起卦收场:命盘动画即刻启动,与双徽坠入标题并行(消除滞后)
  onReveal?.(data);
  await flyToDock(overlay, dock, d);

  fx.stopAmbient();
  fx.stop();
  overlay.remove();
  document.body.style.overflow = "";
  return data;
}
