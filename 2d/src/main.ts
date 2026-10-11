import "./styles/main.css";
import { createForm, type FormResult } from "./ui/form";
import { createGrid } from "./chart/grid";
import { createLinks } from "./chart/links";
import { createReading } from "./ui/reading";
import { createBenming } from "./ui/benming";
import { createDivination } from "./ui/divination";
import { createResultView } from "./ui/resultView";
import { benmingOf } from "./engine/divination";
import type { ChartModel } from "./engine/types";
import type { Divination } from "./engine/divination";

const app = document.getElementById("app");
if (!app) throw new Error("缺少 #app 挂载点");

app.innerHTML = `
  <div class="aurora" aria-hidden="true"><i class="b1"></i><i class="b2"></i></div>
  <header class="masthead">
    <div class="lead">
      <span class="kicker">Zi Wei · Yi Jing</span>
      <div class="brand-row"><h1 class="brand">星枢</h1><span class="brand-sigils" id="brand-sigils" aria-hidden="true"></span></div>
      <p class="sub">紫微斗数 · 易经星盘</p>
    </div>
    <div class="mast-actions">
      <button type="button" class="switch" id="btn-result" hidden>占卜结果 →</button>
    </div>
  </header>
  <div class="stage">
    <aside class="aside" id="aside">
      <div class="side-tabs" role="tablist" aria-label="面板切换">
        <button type="button" class="side-tab on" role="tab" data-tab="form" aria-selected="true">起盘</button>
        <button type="button" class="side-tab" role="tab" data-tab="div" data-locked aria-selected="false">卜卦</button>
        <button type="button" class="side-tab" role="tab" data-tab="benming" data-locked aria-selected="false">本命</button>
        <button type="button" class="side-tab" role="tab" data-tab="reading" data-locked aria-selected="false">读盘</button>
      </div>
      <div class="side-panels">
        <div class="side-panel on" data-panel="form" id="panel-form"></div>
        <div class="side-panel" data-panel="div" id="panel-div"></div>
        <div class="side-panel" data-panel="benming" id="panel-benming"></div>
        <div class="side-panel" data-panel="reading" id="panel-reading"></div>
      </div>
    </aside>
    <div class="main" id="main"></div>
  </div>
  <footer class="foot">仅供文化娱乐,不构成任何决策建议</footer>
`;

const main = document.getElementById("main") as HTMLElement;
const btnResult = document.getElementById("btn-result") as HTMLButtonElement;
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".side-tab"));
const panels = Array.from(document.querySelectorAll<HTMLElement>(".side-panel"));

const panelForm = document.getElementById("panel-form") as HTMLElement;
const panelDiv = document.getElementById("panel-div") as HTMLElement;
const panelBenming = document.getElementById("panel-benming") as HTMLElement;
const panelReading = document.getElementById("panel-reading") as HTMLElement;

function showTab(name: string): void {
  tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle("on", on);
    t.setAttribute("aria-selected", String(on));
  });
  panels.forEach((p) => p.classList.toggle("on", p.dataset.panel === name));
}
function unlock(name: string): void {
  const t = tabs.find((x) => x.dataset.tab === name);
  if (t) t.removeAttribute("data-locked");
}
tabs.forEach((t) => t.addEventListener("click", () => {
  if (t.hasAttribute("data-locked")) return;
  showTab(t.dataset.tab as string);
}));

const form = createForm(panelForm);
const divUI = createDivination(panelDiv);
const benming = createBenming(panelBenming);
const reading = createReading(panelReading);

const grid = createGrid(main);
const boardWrap = main.querySelector(".wheel-wrap") as HTMLElement;
const links = createLinks(boardWrap, grid);
grid.renderPlaceholder(); // 默认即显示卦盘(占位态),起盘后以动画填充

const resultView = createResultView(document.body);

let currentChart: ChartModel | null = null;
let currentDiv: Divination | null = null;
let benmingName = "";

const choose = (index: number): void => {
  grid.setSelected(index);
  links.draw(index);
  if (currentChart) { reading.show(currentChart, index); unlock("reading"); showTab("reading"); }
};

grid.onPalaceClick(choose);
reading.onClose(() => { grid.setSelected(null); links.draw(null); showTab("div"); });

divUI.onExport(() => { if (currentChart && currentDiv) resultView.open(currentChart, currentDiv, benmingName); });
btnResult.addEventListener("click", () => { if (currentChart && currentDiv) resultView.open(currentChart, currentDiv, benmingName); });

form.onResult(({ chart, divination }: FormResult) => {
  currentChart = chart;
  currentDiv = divination;
  benmingName = benmingOf(chart).name;
  (window as unknown as { __chart?: unknown }).__chart = chart;
  grid.render(chart);
  benming.render(chart);
  divUI.render(divination);
  btnResult.hidden = false;
  unlock("div"); unlock("benming"); unlock("reading");
  showTab("div");
  requestAnimationFrame(() => { grid.setSelected(chart.soulIndex); links.draw(chart.soulIndex); reading.clear(); });
});
