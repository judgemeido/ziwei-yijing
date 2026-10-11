import type { ChartModel } from "../engine/types";
import { chartOverview } from "../content/interpretations";

interface GuideItem {
  key: string;
  term: string;
  tag: string;
  body: string[]; // 每段一行
}

const GLOSSARY: GuideItem[] = [
  {
    key: "soul", term: "命宫", tag: "一盘之主",
    body: [
      "命宫是整张星盘的核心,代表你的先天性格、天赋与人生总纲。看盘先看命宫:它坐在哪个地支、由哪些主星入守,基本定下了你这个人的「底色」。",
      "怎么用:在星盘上找到标着「命」字的宫位,点开读盘,先理解主星的性情,再结合三方四正会照之星综合研判。",
    ],
  },
  {
    key: "body", term: "身宫", tag: "后天着力",
    body: [
      "身宫代表后天的际遇与中晚年着力的方向,是「你会往哪里走」。它可能与命宫同宫(先天后天合一),也可能落在夫妻、财帛、官禄、迁移、福德等宫。",
      "怎么用:对照命宫看身宫落点——若落在官禄,主一生重事业;落在夫妻,主重感情家庭;落在财帛,主重财。身宫与命宫的组合,揭示本性与人生重心的关系。",
    ],
  },
  {
    key: "mutagen", term: "四化(禄权科忌)", tag: "吉凶枢机",
    body: [
      "四化是紫微斗数的「动能」:由你的出生年份,使四颗星分别化为禄、权、科、忌,如同给静态的星盘通上电流,决定吉凶的走向。",
      "化禄——财禄顺遂、增顺势之力;化权——权力掌控、增担当魄力;化科——名声文采、逢凶减灾得贵人;化忌——阻滞执着、宜守成化解。",
      "怎么用:看四化分别落在哪一宫,就知道人生哪些领域得助力(禄权科)、哪些领域要留心(忌)。忌不是凶,而是提醒你在该领域更专注、更谨慎。",
    ],
  },
  {
    key: "palaces", term: "十二宫", tag: "人生十二面",
    body: [
      "十二宫把人生拆成十二个领域:命宫(自身)、兄弟、夫妻、子女、财帛、疾厄、迁移、仆役、官禄、田宅、福德、父母,按地支如时钟般环布。",
      "怎么用:想看某方面运势,就点对应的宫位——看感情点夫妻,看事业点官禄,看财运点财帛。每宫的主星与四化,道出该领域的格局。",
    ],
  },
  {
    key: "trine", term: "三方四正", tag: "合看才全",
    body: [
      "任何一宫都不能孤立地看。本宫、对宫(正对面)、以及两个三合宫,合称「三方四正」,四宫的星曜彼此会照、吉凶相参。",
      "怎么用:读某宫时,一并看它的对宫与两三合宫有哪些星来会照。吉星会照则加分,凶星会照则减分,四宫合参,判断才完整。",
    ],
  },
  {
    key: "hex", term: "本卦 · 互卦 · 变卦", tag: "易经三时",
    body: [
      "卜卦以你的姓名笔画与当下时间起出一卦,再推演出三个时态:本卦看当下现状,互卦看过去的来路与过程,变卦(之卦)看未来的走向。",
      "怎么用:在「卜卦」页起卦后,切换过去 / 当下 / 未来三个标签,对照卦辞与卦义,串起一件事从何而来、此刻如何、将往何处。",
    ],
  },
];

export interface GuideUI {
  open: (chart?: ChartModel | null) => void;
  close: () => void;
}

/** 全屏「解读」弹窗:当前命盘速览 + 概念手风琴详解。 */
export function createGuide(root: HTMLElement): GuideUI {
  const overlay = document.createElement("div");
  overlay.className = "guide-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "星盘解读");
  overlay.hidden = true;
  root.appendChild(overlay);

  function close(): void { overlay.hidden = true; document.body.style.overflow = ""; }

  function overviewHtml(chart: ChartModel): string {
    const o = chartOverview(chart);
    const chip = (t: string) => '<span class="gv-chip">' + t + "</span>";
    const majChips = (arr: string[]) => arr.length ? arr.map(chip).join("") : '<span class="gv-chip gv-empty">空宫</span>';
    const mutClass: Record<string, string> = { 禄: "mut-lu", 权: "mut-quan", 科: "mut-ke", 忌: "mut-ji" };
    const mutRows = o.mutagens.length
      ? o.mutagens.map((m) =>
          '<li><i class="mut ' + (mutClass[m.mutagen] ?? "") + '">' + m.label + "</i>" +
          '<div class="gv-mut-body"><b>' + m.star + "·" + m.palace + "宫</b><span>" + m.text + "</span></div></li>"
        ).join("")
      : '<li class="gv-none">本盘无四化落点</li>';
    return [
      '<section class="gv-card">',
        '<header class="gv-card-head"><span class="gv-dot soul"></span><h3>命宫 · ' + o.soul.branch + "宫</h3>" +
          '<div class="gv-chips">' + majChips(o.soul.majors) + "</div></header>",
        "<p>" + o.soul.summary + "</p>",
      "</section>",
      '<section class="gv-card">',
        '<header class="gv-card-head"><span class="gv-dot body"></span><h3>身宫 · ' + o.body.branch + "宫</h3>" +
          '<div class="gv-chips">' + (o.body.same ? chip("与命宫同宫") : majChips(o.body.majors)) + "</div></header>",
        "<p>" + o.body.summary + "</p>",
      "</section>",
      '<section class="gv-card">',
        '<header class="gv-card-head"><span class="gv-dot mut"></span><h3>四化 · 吉凶枢机</h3></header>',
        '<ul class="gv-mut">' + mutRows + "</ul>",
      "</section>",
    ].join("");
  }

  function accordionHtml(): string {
    const items = GLOSSARY.map((it, i) => {
      const open = i === 0 ? " on" : "";
      const expanded = i === 0 ? "true" : "false";
      const body = it.body.map((pp) => "<p>" + pp + "</p>").join("");
      return '<div class="acc-item' + open + '" data-acc="' + it.key + '">' +
        '<button type="button" class="acc-head" aria-expanded="' + expanded + '">' +
          '<span class="acc-term">' + it.term + "</span>" +
          '<span class="acc-tag">' + it.tag + "</span>" +
          '<span class="acc-chev" aria-hidden="true"></span>' +
        "</button>" +
        '<div class="acc-body"><div class="acc-inner">' + body + "</div></div>" +
      "</div>";
    }).join("");
    return '<div class="guide-accordion">' + items + "</div>";
  }

  function open(chart?: ChartModel | null): void {
    const hasChart = !!chart;
    overlay.innerHTML = [
      '<div class="gd-scrim" data-close></div>',
      '<div class="gd-sheet" role="document">',
        '<header class="gd-head">',
          "<div><span class=\"gd-kicker\">星枢 · 新手指南</span>" +
            '<h2 class="gd-title">星盘解读</h2></div>',
          '<button type="button" class="gd-close" data-close aria-label="关闭">×</button>',
        "</header>",
        '<div class="gd-scroll">',
          hasChart
            ? '<div class="gd-section"><span class="gd-label">本盘速览</span><div class="gv-grid">' + overviewHtml(chart as ChartModel) + "</div></div>"
            : '<div class="gd-section"><p class="gd-empty">尚未起盘。先在「起盘」页生成星盘,这里会显示命宫、身宫与四化的专属综述。</p></div>',
          '<div class="gd-section"><span class="gd-label">概念详解 · 点击展开</span>' + accordionHtml() + "</div>",
        "</div>",
      "</div>",
    ].join("");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  overlay.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-close]")) { close(); return; }
    const head = t.closest(".acc-head") as HTMLElement | null;
    if (head) {
      const item = head.closest(".acc-item") as HTMLElement;
      const on = item.classList.toggle("on");
      head.setAttribute("aria-expanded", String(on));
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) close(); });

  return { open, close };
}
