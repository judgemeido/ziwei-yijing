import { buildChart, type BirthInput } from "../engine/astrology";
import { divine, type Divination } from "../engine/divination";
import { castingCeremony } from "./castingAnimation";
import type { ChartModel } from "../engine/types";

const SHICHEN: { value: number; label: string }[] = [
  { value: 0, label: "子时 23:00-01:00" },
  { value: 1, label: "丑时 01:00-03:00" },
  { value: 2, label: "寅时 03:00-05:00" },
  { value: 3, label: "卯时 05:00-07:00" },
  { value: 4, label: "辰时 07:00-09:00" },
  { value: 5, label: "巳时 09:00-11:00" },
  { value: 6, label: "午时 11:00-13:00" },
  { value: 7, label: "未时 13:00-15:00" },
  { value: 8, label: "申时 15:00-17:00" },
  { value: 9, label: "酉时 17:00-19:00" },
  { value: 10, label: "戌时 19:00-21:00" },
  { value: 11, label: "亥时 21:00-23:00" },
];

export interface FormResult {
  chart: ChartModel;
  divination: Divination;
}

export interface FormUI {
  onResult: (fn: (r: FormResult) => void) => void;
}

const pad = (n: number): string => String(n).padStart(2, "0");
const daysInMonth = (y: number, m: number): number => new Date(y, m, 0).getDate();

interface Opt { value: number; label: string; }
function range(a: number, b: number, fmt: (n: number) => string): Opt[] {
  const out: Opt[] = [];
  for (let i = a; i <= b; i++) out.push({ value: i, label: fmt(i) });
  return out;
}

// ===== 统一玻璃下拉:弹层单例管理(fixed 定位,逃逸面板滚动裁剪) =====
let activePop: { trigger: HTMLButtonElement; pop: HTMLElement } | null = null;
function closeActive(): void {
  if (!activePop) return;
  stopFollow();
  activePop.pop.hidden = true;
  activePop.trigger.setAttribute("aria-expanded", "false");
  activePop.trigger.classList.remove("open");
  activePop = null;
}
// 任意窗口尺寸下都能定位:优先下方,空间不足翻上方,再不足取较大一侧并整体夹进视口;
// 高度超出视口则限高(弹层内部各列可滚动)。
// 根据触发器矩形与弹层尺寸求落位:优先下方,不足翻上方,再不足取较大一侧并夹进视口。
function computePlacement(r: DOMRect, pw: number, ph: number): { left: number; top: number } {
  const m = 8;
  let left = r.left;
  if (left + pw > window.innerWidth - m) left = window.innerWidth - m - pw;
  if (left < m) left = m;
  const below = window.innerHeight - r.bottom - m;
  const above = r.top - m;
  let top: number;
  if (ph <= below) top = r.bottom + m;
  else if (ph <= above) top = r.top - m - ph;
  else top = below >= above ? window.innerHeight - m - ph : m;
  if (top < m) top = m;
  if (top + ph > window.innerHeight - m) top = window.innerHeight - m - ph;
  return { left: Math.round(left), top: Math.round(top) };
}
// 跟随缓存:仅在打开/缩放时测量弹层尺寸,逐帧只读触发器矩形并在落位变化时才写样式(避免每帧强制重排)。
let followRaf = 0;
let followW = 0, followH = 0, lastL = NaN, lastT = NaN;
function measurePop(trigger: HTMLButtonElement, pop: HTMLElement): void {
  const maxH = window.innerHeight - 16;
  pop.style.position = "fixed";
  pop.style.minWidth = trigger.getBoundingClientRect().width + "px";
  pop.style.maxHeight = maxH + "px";
  followW = pop.offsetWidth;
  followH = Math.min(pop.offsetHeight, maxH);
}
function positionPop(trigger: HTMLButtonElement, pop: HTMLElement): void {
  measurePop(trigger, pop);
  const pl = computePlacement(trigger.getBoundingClientRect(), followW, followH);
  lastL = pl.left; lastT = pl.top;
  pop.style.left = pl.left + "px";
  pop.style.top = pl.top + "px";
}
function stopFollow(): void { if (followRaf) { cancelAnimationFrame(followRaf); followRaf = 0; } }
function startFollow(): void {
  stopFollow();
  const step = (): void => {
    if (!activePop) { followRaf = 0; return; }
    const pl = computePlacement(activePop.trigger.getBoundingClientRect(), followW, followH);
    if (pl.left !== lastL || pl.top !== lastT) {
      lastL = pl.left; lastT = pl.top;
      activePop.pop.style.left = pl.left + "px";
      activePop.pop.style.top = pl.top + "px";
    }
    followRaf = requestAnimationFrame(step);
  };
  followRaf = requestAnimationFrame(step);
}
if (typeof document !== "undefined") {
  document.addEventListener("click", closeActive);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeActive(); });
  window.addEventListener("resize", () => { if (activePop) positionPop(activePop.trigger, activePop.pop); });
}

interface Field {
  field: HTMLElement;
  valEl: HTMLElement;
  pop: HTMLElement;
  trigger: HTMLButtonElement;
}
function buildField(labelText: string, popClass: string): Field {
  const field = document.createElement("div");
  field.className = "ui-field";
  const label = document.createElement("span");
  label.className = "ui-label";
  label.textContent = labelText;
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "ui-trigger";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");
  const valEl = document.createElement("span");
  valEl.className = "ui-val";
  const chev = document.createElement("span");
  chev.className = "ui-chev";
  chev.setAttribute("aria-hidden", "true");
  trigger.appendChild(valEl);
  trigger.appendChild(chev);
  const pop = document.createElement("div");
  pop.className = "ui-pop " + popClass;
  pop.setAttribute("role", "dialog");
  pop.hidden = true;
  field.appendChild(label);
  field.appendChild(trigger);
  // 弹层挂到 body:避开 .panel-card 的 backdrop-filter 造成的 fixed 包含块,确保视口级定位
  document.body.appendChild(pop);
  return { field, valEl, pop, trigger };
}
function wireField(f: Field, onOpen?: () => void): void {
  f.trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasOpen = activePop !== null && activePop.pop === f.pop;
    closeActive();
    if (wasOpen) return;
    f.pop.hidden = false;
    f.trigger.setAttribute("aria-expanded", "true");
    f.trigger.classList.add("open");
    activePop = { trigger: f.trigger, pop: f.pop };
    if (onOpen) onOpen();
    positionPop(f.trigger, f.pop);
    f.pop.style.animation = "none";
    f.pop.getBoundingClientRect();
    f.pop.style.animation = "";
    startFollow();
  });
  f.pop.addEventListener("click", (e) => e.stopPropagation());
}

interface Col {
  el: HTMLElement;
  set: (v: number) => void;
  get: () => number;
  setOptions: (opts: Opt[]) => void;
}
function buildCol(cap: string, opts: Opt[], initial: number, onPick: (v: number) => void): Col {
  let value = initial;
  let list = opts.slice();
  const col = document.createElement("div");
  col.className = "ui-col";
  const capEl = document.createElement("div");
  capEl.className = "ui-col-cap";
  capEl.textContent = cap;
  const ul = document.createElement("ul");
  ul.className = "ui-col-list";
  ul.setAttribute("role", "listbox");
  ul.setAttribute("aria-label", cap);
  col.appendChild(capEl);
  col.appendChild(ul);

  function mark(v: number): void {
    const items = Array.from(ul.children) as HTMLElement[];
    items.forEach((li) => {
      const on = Number(li.dataset.v) === v;
      li.classList.toggle("on", on);
      li.setAttribute("aria-selected", String(on));
    });
  }
  function center(): void {
    const sel = ul.querySelector(".ui-opt.on") as HTMLElement | null;
    if (sel) ul.scrollTop = sel.offsetTop - ul.clientHeight / 2 + sel.offsetHeight / 2;
  }
  function render(): void {
    ul.innerHTML = "";
    list.forEach((o) => {
      const li = document.createElement("li");
      li.className = "ui-opt" + (o.value === value ? " on" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(o.value === value));
      li.dataset.v = String(o.value);
      li.textContent = o.label;
      li.addEventListener("click", () => { value = o.value; mark(o.value); onPick(o.value); });
      ul.appendChild(li);
    });
  }
  render();
  return {
    el: col,
    set: (v: number) => { value = v; mark(v); center(); },
    get: () => value,
    setOptions: (next: Opt[]) => {
      list = next.slice();
      if (!list.some((o) => o.value === value)) value = list[list.length - 1].value;
      render();
    },
  };
}

export function createForm(root: HTMLElement): FormUI {
  let handler: ((r: FormResult) => void) | null = null;

  const form = document.createElement("form");
  form.id = "birth-form";
  form.className = "panel-card";
  form.setAttribute("aria-label", "起盘与起卦");

  const title = document.createElement("h2");
  title.className = "panel-title";
  title.textContent = "起盘 · 起卦";
  const sub = document.createElement("p");
  sub.className = "panel-sub";
  sub.textContent = "姓名与生辰定命盘,卜卦时间定卦象";
  form.appendChild(title);
  form.appendChild(sub);

  // 姓名(中文):姓 / 名 分格,复姓亦可准确识别
  const nameField = document.createElement("div");
  nameField.className = "ui-field";
  const nameLabel = document.createElement("span");
  nameLabel.className = "ui-label";
  nameLabel.textContent = "姓名(中文)";
  const nameGrid = document.createElement("div");
  nameGrid.className = "ui-name-grid";
  const surnameInput = document.createElement("input");
  surnameInput.type = "text";
  surnameInput.name = "surname";
  surnameInput.className = "ui-input ui-name-part";
  surnameInput.maxLength = 4;
  surnameInput.placeholder = "姓 · 如 欧阳";
  surnameInput.autocomplete = "off";
  surnameInput.setAttribute("aria-label", "姓");
  const givenInput = document.createElement("input");
  givenInput.type = "text";
  givenInput.name = "given";
  givenInput.className = "ui-input ui-name-part";
  givenInput.maxLength = 6;
  givenInput.placeholder = "名 · 如 修";
  givenInput.autocomplete = "off";
  givenInput.setAttribute("aria-label", "名");
  nameGrid.appendChild(surnameInput);
  nameGrid.appendChild(givenInput);
  nameField.appendChild(nameLabel);
  nameField.appendChild(nameGrid);
  form.appendChild(nameField);

  // 公历生日(年/月/日)
  let by = 1990, bm = 11, bd = 23;
  const birth = buildField("公历生日", "ui-pop-date");
  const bCols = document.createElement("div");
  bCols.className = "ui-cols";
  const colBy = buildCol("年", range(1900, 2099, (n) => n + ""), by, (v) => { by = v; syncBirthDays(); updateBirth(); });
  const colBm = buildCol("月", range(1, 12, (n) => n + ""), bm, (v) => { bm = v; syncBirthDays(); updateBirth(); });
  const colBd = buildCol("日", range(1, daysInMonth(by, bm), (n) => n + ""), bd, (v) => { bd = v; updateBirth(); });
  function syncBirthDays(): void {
    const dmax = daysInMonth(by, bm);
    colBd.setOptions(range(1, dmax, (n) => n + ""));
    if (bd > dmax) { bd = dmax; colBd.set(bd); }
  }
  function updateBirth(): void { birth.valEl.textContent = by + "年" + bm + "月" + bd + "日"; }
  bCols.appendChild(colBy.el);
  bCols.appendChild(colBm.el);
  bCols.appendChild(colBd.el);
  birth.pop.appendChild(bCols);
  updateBirth();
  wireField(birth, () => { colBy.set(by); colBm.set(bm); colBd.set(bd); });
  form.appendChild(birth.field);

  // 出生时辰(单列)
  let timeIndex = 10;
  const shi = buildField("出生时辰", "ui-pop-single");
  const colShi = buildCol("时辰", SHICHEN.map((o) => ({ value: o.value, label: o.label })), timeIndex, (v) => {
    timeIndex = v;
    shi.valEl.textContent = labelOfShi(v);
    closeActive();
  });
  function labelOfShi(v: number): string {
    const hit = SHICHEN.find((o) => o.value === v);
    return hit ? hit.label : "";
  }
  shi.pop.appendChild(colShi.el);
  shi.valEl.textContent = labelOfShi(timeIndex);
  wireField(shi, () => colShi.set(timeIndex));
  form.appendChild(shi.field);

  // 性别
  const genderField = document.createElement("div");
  genderField.className = "ui-field";
  const genderLabel = document.createElement("span");
  genderLabel.className = "ui-label";
  genderLabel.textContent = "性别";
  const seg = document.createElement("div");
  seg.className = "seg";
  seg.setAttribute("role", "radiogroup");
  seg.setAttribute("aria-label", "性别");
  seg.innerHTML = '<label><input type="radio" name="gender" value="male" checked /><span>男</span></label><label><input type="radio" name="gender" value="female" /><span>女</span></label>';
  genderField.appendChild(genderLabel);
  genderField.appendChild(seg);
  form.appendChild(genderField);

  // 卜卦时间(年/月/日 时/分 + 回到此刻)
  const now = new Date();
  let cy = now.getFullYear(), cmo = now.getMonth() + 1, cd = now.getDate(), ch = now.getHours(), cmi = now.getMinutes();
  const cast = buildField("卜卦时间", "ui-pop-datetime");
  const cCols = document.createElement("div");
  cCols.className = "ui-cols";
  const colCy = buildCol("年", range(1900, 2099, (n) => n + ""), cy, (v) => { cy = v; syncCastDays(); updateCast(); });
  const colCmo = buildCol("月", range(1, 12, (n) => n + ""), cmo, (v) => { cmo = v; syncCastDays(); updateCast(); });
  const colCd = buildCol("日", range(1, daysInMonth(cy, cmo), (n) => n + ""), cd, (v) => { cd = v; updateCast(); });
  const colCh = buildCol("时", range(0, 23, pad), ch, (v) => { ch = v; updateCast(); });
  const colCmi = buildCol("分", range(0, 59, pad), cmi, (v) => { cmi = v; updateCast(); });
  function syncCastDays(): void {
    const dmax = daysInMonth(cy, cmo);
    colCd.setOptions(range(1, dmax, (n) => n + ""));
    if (cd > dmax) { cd = dmax; colCd.set(cd); }
  }
  function updateCast(): void {
    cast.valEl.textContent = cy + "-" + pad(cmo) + "-" + pad(cd) + " " + pad(ch) + ":" + pad(cmi);
  }
  cCols.appendChild(colCy.el);
  cCols.appendChild(colCmo.el);
  cCols.appendChild(colCd.el);
  cCols.appendChild(colCh.el);
  cCols.appendChild(colCmi.el);
  cast.pop.appendChild(cCols);
  const nowBtn = document.createElement("button");
  nowBtn.type = "button";
  nowBtn.className = "ui-nowbtn";
  nowBtn.textContent = "回到此刻";
  nowBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const d = new Date();
    cy = d.getFullYear(); cmo = d.getMonth() + 1; cd = d.getDate(); ch = d.getHours(); cmi = d.getMinutes();
    syncCastDays();
    colCy.set(cy); colCmo.set(cmo); colCd.set(cd); colCh.set(ch); colCmi.set(cmi);
    updateCast();
  });
  cast.pop.appendChild(nowBtn);
  updateCast();
  wireField(cast, () => { colCy.set(cy); colCmo.set(cmo); colCd.set(cd); colCh.set(ch); colCmi.set(cmi); });
  form.appendChild(cast.field);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn-primary";
  submitBtn.textContent = "起 盘 起 卦";
  form.appendChild(submitBtn);

  const errorEl = document.createElement("p");
  errorEl.className = "form-error";
  errorEl.setAttribute("role", "alert");
  errorEl.hidden = true;
  form.appendChild(errorEl);

  root.appendChild(form);

  const BRANCH_CLOCK: Record<string, number> = {
    子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5, 午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const surname = surnameInput.value.trim();
    const given = givenInput.value.trim();
    const genderInput = form.querySelector("input[name=\"gender\"]:checked") as HTMLInputElement | null;
    const gender = (genderInput ? genderInput.value : "male") as "male" | "female";
    const input: BirthInput = {
      solarDate: by + "-" + pad(bm) + "-" + pad(bd),
      timeIndex,
      gender,
    };
    const castTime = new Date(cy, cmo - 1, cd, ch, cmi);

    closeActive();
    const prev = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "起 卦 中…";

    const dataPromise = buildChart(input).then(async (chart) => {
      const divination = await divine({ surname, given }, castTime, chart.lunar);
      return [chart, divination] as const;
    });
    // 起卦仪式动画:等待数据就绪并以真实卦象落爻,仪式收场即揭示命盘(消除滞后)。
    castingCeremony(dataPromise, ([chart, divination]) => {
      const soulBranch = chart.palaces.find((pp) => pp.index === chart.soulIndex)?.earthlyBranch ?? "子";
      return {
        lines: divination.ben.lines,
        movingLine: divination.ben.movingLine,
        name: divination.ben.name,
        soulClock: BRANCH_CLOCK[soulBranch] ?? 0,
      };
    }, ([chart, divination]) => {
      errorEl.hidden = true;
      handler?.({ chart, divination });
    })
      .then(() => undefined)
      .catch((err: unknown) => {
        errorEl.textContent = err instanceof Error ? err.message : "起盘失败";
        errorEl.hidden = false;
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = prev;
      });
  });

  return { onResult: (fn) => { handler = fn; } };
}
