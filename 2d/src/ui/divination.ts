import type { Divination, DivTense } from "../engine/divination";
import { hexClassic, hexWuxing, yaoPositionLore, type Hexagram } from "../engine/iching";

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

// 时态深解:对「互/本/变」三卦更长的研判,点击展开。
const TENSE_DETAIL: Record<DivTense, string> = {
  past: "互卦取本卦第二至第五爻互叠而成,是潜藏于事件内部的脉络,代表「来路」——此事如何一步步走到今天。它常显你过去的作为、累积的因缘与尚未了结的旧情;看懂互卦,便能明白当下格局的由来,也能从旧经验里取出可用的教训。互卦无动爻,因它所述已成定局、不复变动。",
  present: "本卦是以姓名、生辰八字与卜卦之时复合起出的主卦,直指你此刻真实的处境与心境。上卦为外、主环境与他人,下卦为内、主自身与本心;两者相叠之象,即是你当下所面对的全局。读本卦当先认清现状、不加粉饰,这是一切判断与抉择的根本起点。",
  future: "变卦(之卦)由本卦的动爻阴阳互变而来,是顺着当下这股势头推演出的走向。它不是已被注定的命运,而是「若循此理、顺此势而行,事情大体会往何处去」的提示。动爻是变化的枢机:看本卦与变卦之间卦义的转移,便知此事将由何种状态,转入何种新的局面。",
};

export interface DivUI {
  render: (div: Divination) => void;
  onExport: (fn: () => void) => void;
}

interface AccItem { title: string; tag: string; body: string; }
function accordion(items: AccItem[]): string {
  const html = items.map((it, i) => {
    const on = i === 0 ? " on" : "";
    const exp = i === 0 ? "true" : "false";
    return '<div class="div-acc' + on + '">' +
      '<button type="button" class="div-acc-head" aria-expanded="' + exp + '">' +
        '<span class="div-acc-title">' + it.title + "</span>" +
        '<span class="div-acc-tag">' + it.tag + "</span>" +
        '<span class="div-acc-chev" aria-hidden="true"></span>' +
      "</button>" +
      '<div class="div-acc-body"><div class="div-acc-inner">' + it.body + "</div></div>" +
    "</div>";
  }).join("");
  return '<div class="div-accordion"><span class="rk-label">深度详解 · 点击展开</span>' + html + "</div>";
}

/** 卜卦面板:核心(卦象/卦名)与解读(卦义/上下卦/动爻/指引)分区,三象切换 + 可展开深度详解 + 导出。 */
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

  function detailItems(hex: Hexagram, t: DivTense): AccItem[] {
    const items: AccItem[] = [];
    const wx = hexWuxing(hex);
    items.push({
      title: "卦象结构", tag: "上下相叠",
      body: "<p>上卦" + hex.upper.name + "(" + hex.upper.nature + ")主外、主环境与他人,其性" + hex.upper.trait + ";"
        + "下卦" + hex.lower.name + "(" + hex.lower.nature + ")主内、主自身与本心,其性" + hex.lower.trait + "。</p>"
        + "<p>两卦相叠而成「" + hex.name + "」:" + hex.meaning + "</p>",
    });
    items.push({
      title: "五行卦气", tag: wx.lowerWx + " / " + wx.upperWx,
      body: "<p>下卦(内)属" + wx.lowerWx + "、上卦(外)属" + wx.upperWx + "。</p><p>" + wx.relation + "</p>",
    });
    const yao = yaoPositionLore(hex.movingLine);
    if (t !== "past" && yao) {
      items.push({
        title: "动爻 · 变化之机", tag: "第 " + hex.movingLine + " 爻",
        body: "<p><b>" + yao.name + "</b>" + yao.lore + "</p>"
          + "<p>动爻是本卦转为变卦的枢机;阴阳一变,事势即由此转入新的局面,故看动爻可知变化从何处发动。</p>",
      });
    }
    items.push({ title: TENSE[["past","present","future"].indexOf(t)].label + "之卦 · 深解", tag: TENSE[["past","present","future"].indexOf(t)].sub, body: "<p>" + TENSE_DETAIL[t] + "</p>" });
    const classic = hexClassic(hex.name);
    if (classic) {
      items.push({
        title: "典籍 · 《周易》", tag: "卦辞 · 象曰",
        body: '<div class="div-classic-inner"><p class="cq"><span class="cl-src">卦辞</span>' + classic.tuan + "</p>"
          + '<p class="cq xiang"><span class="cl-src">象曰</span>' + classic.xiang + "</p></div>",
      });
    }
    return items;
  }

  function paint(): void {
    if (!current) return;
    const d = current;
    const hex = hexOf(d, tense);
    const ni = d.nameInfo;
    const nameLine = ni
      ? `${d.name} · 姓 ${ni.surname || "—"}(${ni.surnameStrokes}) 名 ${ni.given || "—"}(${ni.givenStrokes})`
      : "未填姓名 · 仅以生辰八字与时间起卦";
    const bl = d.birthLunar;
    const baziLine = `生辰八字 ${bl.yearBranch}年 农历${bl.month}月${bl.day}日 ${bl.hourBranch}时`;
    const castLine = `卜于 ${d.castSolar} ${String(d.castHour).padStart(2, "0")}:00 · 农历 ${d.castLunarText}`;
    const moveLine = tense !== "past"
      ? `第 ${hex.movingLine} 爻为动爻,主变化之机`
      : `由本卦二至五爻互出,主其中过程`;

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

      ${accordion(detailItems(hex, tense))}

      <div class="div-foot">${nameLine}<br>${baziLine} · ${castLine}</div>
    `;
    el.hidden = false;
  }

  el.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const t = target.closest<HTMLElement>(".tense-tab");
    if (t?.dataset.tense) { tense = t.dataset.tense as DivTense; paint(); return; }
    if (target.closest(".div-export")) { exportHandler?.(); return; }
    const accHead = target.closest(".div-acc-head") as HTMLElement | null;
    if (accHead) {
      const item = accHead.closest(".div-acc") as HTMLElement;
      const on = item.classList.toggle("on");
      accHead.setAttribute("aria-expanded", String(on));
    }
  });

  function render(div: Divination): void { current = div; tense = "present"; paint(); }
  return { render, onExport: (fn) => { exportHandler = fn; } };
}
