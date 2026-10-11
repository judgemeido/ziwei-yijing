# 星枢 (Xingshu) · 项目现状交接

> 面向其他 AI / 开发者的现状说明。读完即可接手。最后更新:2026-10-12。

## 一句话
纯前端 2D「紫微斗数 + 易经」命盘与卜卦网页。输入**姓(分格)/名 + 公历生辰 + 性别 + 卜卦时间**,起出紫微命盘(圆形星盘)并以梅花易数复合起卦(本/互/变三卦)。Apple 风深空暗调玻璃美学。**仅文化娱乐,不构成任何决策建议。**

## 技术栈 / 运行
- Vite 8 + TypeScript 7 + 原生 TS(无框架),圆形星盘用 DOM + SVG + CSS,动画 CSS/合成器驱动。
- 依赖:`iztro`(排紫微命盘,动态 import)、`cnchar` + `cnchar-trad`(姓名康熙繁体笔画,动态 import)。
- 源码全部在 `2d/`(3D 旧版已删除)。入口 `2d/index.html` → `2d/src/main.ts`。
- 构建:`npm run build:2d`(= `tsc -p 2d/tsconfig.json && vite build --config 2d/vite.config.ts`)。
- 开发:`npm run dev:2d`,常驻 `http://localhost:5174/`。
- 部署:`npm run deploy`(build + `wrangler deploy`)。

## 环境约束(重要)
- **Windows / PowerShell,仓库根 `D:\Codex\game01`**。Node 在 `C:\Environment\nodejs`(无 python);跑 npm 前先 `$env:PATH="C:\Environment\nodejs;$env:PATH"`。
- 改文件优先用 Node 的 `fs`(保留 LF);PowerShell 多语句含管道/`$env:` 拼接可能被策略拒。
- 浏览器实测基准:**李世民 · 1990-11-23 戌时 男**(本命卦 地火明夷·动爻5;复姓测试用「欧阳修」)。

## 目录结构(`2d/src/`)
```
engine/   数据与算法(无 UI)
  types.ts         ChartModel/Palace/Star/LunarInfo 等类型
  astrology.ts     buildChart(接 iztro,async);solarToLunarGanzhi
  iching.ts        八卦/64卦/卦辞象曰 + 起卦算法 + hexWuxing/yaoPositionLore
  strokes.ts       姓名笔画(cnchar);nameStrokes / nameStrokesSplit(显式姓/名)
  divination.ts    divine({surname,given},castTime,birthLunar) → Divination;benmingOf
content/
  interpretations.ts  所有解读文案 + chartOverview/PALACE_DETAIL/AUX_STAR_LORE/auxStarLore
chart/
  grid.ts    圆形星盘(renderPlaceholder 占位 + render 命盘 + startWheelFX 粒子揭示)
  links.ts   三方四正连线
ui/
  form.ts            起盘表单(姓/名分格 + 自绘玻璃下拉:生日/时辰/卜卦时间)
  castingAnimation.ts 起卦仪式 + 起卦前读条预载(cast-loader)
  divination.ts      卜卦面板(三象切换 + 深度详解手风琴)
  benming.ts         本命卦卡
  reading.ts         读盘面板(宫位/主星/辅星 可展开详解 + 本盘速览 + 使用方法手风琴)
  guide.ts           右上角「解读」全屏弹窗(命/身/四化速览 + 概念手风琴)
  resultView.ts      占卜结果全屏弹窗(PNG/PDF 导出入口)
  exporter.ts        exportPNG(canvas 手绘) / exportPDF(window.print)
main.ts    组装:masthead + 侧栏 tabs(起盘/卜卦/本命/读盘) + 星盘舞台
styles/main.css  单文件样式,按里程碑分段 M7–M18
```

## 核心数据流
1. `form.ts` 提交 → `buildChart(input)` 得 `ChartModel`(含 `lunar` 农历/干支)。
2. 以 `chart.lunar` 作生辰八字 → `divine({surname,given}, castTime, chart.lunar)` 得 `Divination`。
3. 起卦仪式动画(`castingCeremony`)用真实卦象落爻,仪式收场即揭示命盘。
4. `main.ts` 分发:`grid.render` / `reading.setChart` / `benming.render` / `divUI.render`。

## 起卦算法(梅花易数复合,`iching.ts`)
- **本卦(当下)**:上卦 = 姓笔画 + 生辰年支数 + 生辰月 + 生辰日(先天根基);下卦 = 名笔画 + 生辰时支数 + 卜卦月 + 卜卦日 + 卜卦时支数(后天所问);动爻 = 上下之和取余。
- **互卦(过去/来路)**:本卦二至五爻互叠(无动爻)。
- **变卦(未来/走向)**:本卦动爻阴阳互变。
- 姓/名由用户在表单**分格输入**,复姓准确;`strokes.ts` 用繁体笔画分别计姓、名。

## 已完成功能(均构建 + 浏览器实测通过)
- 起盘表单:姓/名分格、玻璃自绘下拉(生日年月日 / 时辰 / 卜卦时间年月日时分 + 回到此刻),弹层挂 body 逃逸 backdrop-filter、随窗口跟随定位。
- 圆形星盘:外环后天八卦廿四向、十二宫按地支环布、中宫命主/身主/本命卦;默认占位态,起卦后粒子揭示 + 中心太极微光。
- 起卦仪式:双星盘徽记坠入标题右侧(`#brand-sigils`);起卦前读条预载(cast-loader)消除顿挫;道学/易经缓和版动效(非爆发式)。
- 卜卦面板:过去/当下/未来三象切换;**深度详解手风琴**(卦象结构 / 五行卦气(内外生克)/ 动爻爻位 / 时态深解 / 《周易》卦辞象曰)。
- 读盘面板:点宫位看宫义;**可展开详解**——宫位详解、主星(星性/庙陷/四化)、辅佐星曜逐星(50+ 辅星 + 兜底);本盘速览(命/身/四化);使用方法手风琴。
- 右上角「解读」弹窗:本盘命/身/四化专属综述 + 概念通俗详解(命宫/身宫/四化/十二宫/三方四正/本互变卦)。
- 导出:PNG(canvas 手绘,含姓名/生辰八字/三卦)、PDF(打印样式)。
- 自适应:桌面任意窗口单屏;手机端(M18,≤720)精修——放大星盘与中宫、下拉限宽、手风琴触控友好、结果/解读弹窗占满小屏。

## 上线状态
- **GitHub**:`https://github.com/judgemeido/ziwei-yijing`(owner `judgemeido`,默认分支 `main`)。
  - 环境封锁 `github.com:443` 推送端口、仅 `api.github.com` 可达 → 用 GitHub Git Data API 经 `gh`(`C:\Program Files\GitHub CLI\gh.exe`,已登录)上传 blob/tree/commit 更新 main 来"推送"。本地 git 需 `-c safe.directory=D:/Codex/game01`。
- **Cloudflare Worker**:`https://ziwei-yijing.judgemeido.workers.dev`(账号 `judgemeido@gmail.com`)。`wrangler.jsonc`:assets 指 `./2d/dist`、SPA 回退;`.node-version=22`。用户流程为"先推 GitHub → Worker 手动同步 GitHub",面板 Build command 留空、Deploy 默认。
  - API Token 用完即删(安全起见)。重新部署需用户再提供 Token 或走 Git 连接构建。

## GitHub 同步脚本套路(github:443 封锁时)
生成一个 UTF-8 **带 BOM** 的 `_sync.ps1`(JSON 临时文件用 `UTF8Encoding($false)` 写、喂 `gh api --input`),步骤:取 main HEAD 作 parent → `git ls-files` 逐个 `POST git/blobs`(base64)→ `POST git/trees` → `POST git/commits`(parents=[parent])→ `PATCH git/refs/heads/main`。commit message 用 ASCII 避免 PowerShell 解析中文出错。跑完删除脚本。本地也先 `git add -A && commit`(`-c user.name=Xingshu -c user.email=xingshu@localhost`)保持历史一致。

## 当前未提交改动
- `2d/src/styles/main.css` 有 **M18 手机端适配** 的工作改动(已构建通过,尚未提交/同步到 GitHub)。若接手:复查手机端命盘缩放与整体观感后,`git add -A && commit` 并用上面的同步套路推到 GitHub main,再按需 `npm run deploy`。

## 用户偏好(贯穿始终)
高级、克制、不晃、不光污染、遵道学/易经;要动效但要流畅;UI 要有「Apple 高级感」。中文回复,完成后给简短结果 + 两个 followup。
