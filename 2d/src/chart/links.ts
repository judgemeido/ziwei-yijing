import { trineSet, type GridUI } from "./grid";

const SVG_NS = "http://www.w3.org/2000/svg";

export interface LinksUI {
  draw: (index: number | null) => void;
}

/**
 * 三方四正星链:在命盘格上以 SVG 连线把选中宫与其对宫、三合宫连起来。
 * 坐标由各宫格 DOM 中心点实时计算,随窗口尺寸自适应。
 */
export function createLinks(boardWrap: HTMLElement, grid: GridUI): LinksUI {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "links");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <defs>
      <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6e7bff" stop-opacity="0.95"/>
        <stop offset="50%" stop-color="#8f9bff" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#64d2ff" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
  `;
  boardWrap.appendChild(svg);

  let current: number | null = null;

  function centerOf(index: number): { x: number; y: number } | null {
    const cell = grid.getCell(index);
    if (!cell) return null;
    const wrapRect = boardWrap.getBoundingClientRect();
    const r = cell.getBoundingClientRect();
    return {
      x: r.left - wrapRect.left + r.width / 2,
      y: r.top - wrapRect.top + r.height / 2,
    };
  }

  function draw(index: number | null): void {
    current = index;
    // 清掉旧线(保留 defs)
    svg.querySelectorAll("line").forEach((l) => l.remove());
    svg.classList.remove("on");
    if (index === null) return;

    const [self, ...rest] = trineSet(index);
    const from = centerOf(self);
    if (!from) return;

    for (const target of rest) {
      const to = centerOf(target);
      if (!to) continue;
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", String(from.x));
      line.setAttribute("y1", String(from.y));
      line.setAttribute("x2", String(to.x));
      line.setAttribute("y2", String(to.y));
      svg.appendChild(line);
    }
    requestAnimationFrame(() => svg.classList.add("on"));
  }

  // 尺寸变化时重绘,保持连线对齐。
  const ro = new ResizeObserver(() => { if (current !== null) draw(current); });
  ro.observe(boardWrap);

  return { draw };
}


