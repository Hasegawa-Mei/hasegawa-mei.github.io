# 之间 BETWEEN 项目交接说明

交接日期：2026 年 11 月 15 日。

最新进度：2026-11-16 已新增失星/保星全屏播报，播报期间场景停留、结束后再更新，并已同步发布到两个站点（Site 第 37 版）。加载优化与机器人对战继续保留；详细文件和验证见 CODEX_TODO.md 文末，发布版本见 RELEASE.md。

后续状态：Claude 第一轮白色棋盘美化已由 Codex 接手验证；按用户最新要求，电脑与手机对局已恢复全屏场景与贴边悬浮 HUD，提示卡采用圆角半透明磨砂玻璃，哲学概念手牌保留原有雕饰边框和底图；不要改回侧栏。最新文件、44 项测试结果和同步状态见 [CODEX_TODO.md](CODEX_TODO.md) 文末「Codex 接手结果」。下文的基础提交与原始交接基线保留为历史记录。

本项目把阿伦特的概念转化为三维场景、阅读选择和同屏双人对局。作品完整名称是《灯塔、飞鸟与王座的游戏》，品牌名称是「之间 BETWEEN」。目前已经具备完整的页面流程和主要功能，下一阶段是在现有实现上做视觉包装、前端美化及简单 UI 调整。

**先读 [CLAUDE.md](CLAUDE.md) 的工作边界。Claude 做视觉和简单局部交互；正式检查、复杂逻辑和底层工作交给 Codex。** 复杂需求统一写入 [CODEX_TODO.md](CODEX_TODO.md)，不用在本轮强行解决。

## 一 快速接手

1. 以本文件所在的 `github-pages` 为项目根目录。
2. 阅读本文的当前进度、文件地图和美化注意事项。
3. 启动预览，观看封面、一个章节、终章和对局的现有视觉。目录菜单及下文的地址锚点可帮助定位。
4. 开始用户指定的美化。用户尚未指定具体风格时，从现有群青蓝、白色纸面、印刷拼贴与三维展陈风格出发。
5. 简单 UI 改动直接完成；复杂部分登记到 `CODEX_TODO.md`，保留接入说明，再由用户转交 Codex。

### 本地与仓库位置

| 项目 | 位置或说明 |
| --- | --- |
| 完整本地工作文件夹 | `C:\Users\Lenovo\Documents\ChatGPT\阿伦特` |
| 当前网页项目根目录 | `C:\Users\Lenovo\Documents\ChatGPT\阿伦特\github-pages` |
| GitHub 仓库 | https://github.com/Hasegawa-Mei/hasegawa-mei.github.io |
| README 指定的发布方式 | GitHub Pages，`main` 分支的 `docs/` 目录 |
| 对应站点地址 | https://hasegawa-mei.github.io/ |
| 网页实际入口 | `docs/index.html` |
| 交接时的基础代码提交 | `c85507c5c1715e8f2a496cb79408e7aabf05bf74` |

整理交接文件前，工作区没有未提交改动，本地 `main` 与远端 `main` 的提交一致。这个基线仅说明原有代码已经同步：本次新增的交接文档先保存在本地，尚未提交或推送。若改用 Claude 云端通过 GitHub 接手，应另行同步交接文档。上面的站点地址是发布目标，本次没有重新检查线上页面。

这是独立的 GitHub Pages 版本；README 中提到的原 ChatGPT Site 是另一份站点，修改本仓库不会自动修改它。本地外层的旧版本压缩包也不是当前工作的源代码入口。

### 启动预览与呈现修改

以下命令都在 `github-pages` 根目录执行。当前本机已具备 Node.js、pnpm 和开发依赖；换电脑或全新克隆时先安装依赖。

```powershell
pnpm install --frozen-lockfile
```

直接查看现有版本：

```powershell
node scripts/preview.mjs
```

在浏览器打开 http://127.0.0.1:8787/ 。结束预览服务可在启动它的终端按 `Ctrl+C`。

修改源文件或运行素材后，执行以下命令更新预览所用的生成文件，然后刷新浏览器：

```powershell
node scripts/build.mjs
```

项目没有配置 `dev` 脚本或热更新；保存源码并不保证已打开的页面立即变化。不要直接双击 HTML 作为主要预览方式。当前核验环境为 Node.js `v24.22.1`、pnpm `11.25.0`；这是本机版本记录，不是新增的强制版本要求。

## 二 现在已经做到哪里

### 当前页面流程

封面 → 第二页开场 → 序章影像 → 交互教程 → 七个主题单元 → 终章牌阵与阅读身份 → 同屏双人对局 → 必要时进入终局设计挑战。

章节内通常包含「初印象 → 探索情境 → 最终想法」，部分章节还插入 AI 情境及「我们的提案」。章节页同时有阅读文字、三维场景、操作控件、目录、批注与来源说明。

### 七个主题单元

以下顺序来自当前运行数据，不能仅凭源文件开头的初始数组或旧截图判断顺序。

| 顺序 | 主题 | 当前单元名称 | 已有交互内容 |
| --- | --- | --- | --- |
| 01 | 工具性 | 一道边界 三种语气 | 围栏材质、入口、轮椅通行、施工情境；AI 情境「被折叠的过程」「原本打不开的门」 |
| 02 | 公共 | 长椅与议事幕 | 长椅结构、卡姆登长椅对照、展开议事幕、不同人群逐步进入 |
| 03 | 权力 | 按钮背后的人 | 发出命令、支持与执行的区别；AI 情境「重新分配的工作台」；提案「共同分配台」 |
| 04 | 私人领域 | 天气之外的位置 | 定位与广告用途、逐渐熟悉日常的服务；提案「有门的助手」 |
| 05 | 异化 | 袋子用完以后 | 领取、购物、丢弃或归还；提案「街角续用站」 |
| 06 | 异化二 | 一条街，三种购买 | 交换、按需购买、身份消费；AI 情境「围着光说话的人」；提案「七日借用柜」 |
| 07 | 暴力 | 工具与它的后果 | 工具、可见性与关系的变化；提案「暂停台」 |

五个「我们的提案」已经接入第 03 至 07 单元，位于各单元最终想法之前。它们的探索状态与最终回答、身份映射分开管理，视觉调整应保持这种区分。

### 阅读记录与终章

- 已有最初回答、最终回答、自定义答案和理由输入；批注可以导出。
- 终章会依据本轮最终想法整理阅读结果，并呈现身份卡与阅读回顾。
- 六种身份是守界者、共议者、续物者、追问者、辨识者、观照者；另有「未定之页」作为尚未形成身份的结果。
- 终章选牌支持鼠标、触控及可选摄像头手势；未启用摄像头也可操作。
- 当前实际使用 `assets/identity-studies/` 中的 B 方向人物图；观照者使用 `b-witness-v2.webp`。不要把旧候选人物图当作当前正式图。

### 双人对局与终局

- 已有同屏双人身份选择、骰子决定先手、三维对局场景、情境与概念卡、理由提交、反馈、双方认可其他解释及结果页。
- 当前每位玩家获得相同的五种概念，顺序分别打乱；普通对局最多八回合。
- 已有一星救援和平局触发的终局设计挑战，包括共同思考、分别写方案、分别评分和揭晓。
- 现有存档版本是 `MATCH_VERSION = 3`，包含旧存档升级逻辑。牌数、计分、阶段转换、隐藏方案与评分的规则均由 Codex 负责维护。

### 媒体与开场稳定性

- 四组背景音乐已接入：日常、序章、终章和终局。
- 序章已有灯塔及 AI 相关影像、人物卡和文字段落；主剪辑配置在 `prologue-media.js`。
- 开场采用分阶段加载，封面所列图片约 1.13 MiB；可选媒体等待预算为 4.5 秒，提供先进入与重试。
- 后续素材按阶段准备，摄像头识别运行库只在需要时加载。手机已有横屏提示与手动旋转回退。
- 最近的代码工作集中在修复开场等待、入场动画卡住及发布 HTML 没有真正加载新入口的问题。这些机制已存在，视觉调整不要重新把全站素材塞进首屏等待。

### 本次交接基线

2026 年 11 月 15 日，Codex 在编写本文前运行了现有检查：40 项自动测试全部通过；发布入口的模拟运行检查到达封面并恢复了控件。当前入口包为 `built-app-6GEIUF6J.js`，以后重新构建会改变文件名，以 HTML 和构建结果为准。

这份基线覆盖已有自动检查，不等于所有视觉、真实 WebGL、摄像头、手机和线上环境均已验收。本次没有重新做完整浏览器体验回归。Claude 美化后，正式验证仍交给 Codex。

## 三 文件在哪里以及各自负责什么

下文路径均相对于 `github-pages`。注意：本项目的 `docs/` 同时放源文件和发布产物，并不是普通的说明文档目录。项目采用原生 HTML、CSS、JavaScript 模块、Three.js 和 esbuild，没有 React 或服务端应用；用户所说的「底层」在这里主要包括状态、存档、加载、渲染、音视频、识别及构建逻辑。

### 主要源文件地图

| 范围 | 主要文件 | 接手说明 |
| --- | --- | --- |
| 页面外壳与真实入口 | `docs/index.html`、`docs/site-entry.js` | HTML 中的 ID、类名和 data 属性连接交互；改结构时保留这些连接 |
| 预加载与启动 | `docs/boot.js`、`docs/loading-policy.js`、`docs/preload-core.js`、`docs/load-budget.js`、`docs/resource-cache.js` | 底层流程，复杂修改交 Codex |
| 主阅读流程 | `docs/dialogue.js` | 章节导航、分层阅读、控件、批注、三维与终章切换集中在这里；只做局部 UI 改动 |
| 章节文案与来源 | `docs/dialogue-content.js`、`docs/reader-extras.js` | 包括后续覆盖和扩展，改文字前读完相关赋值 |
| 阅读视觉 | `docs/reader-ui.css`、`docs/reader-update.css`、`docs/print-edition.css`、`docs/readability.css` | 排版、按钮、印刷风格、可读性覆盖规则 |
| 封面与第二页 | `docs/opening.css`、`docs/cover-print.js`、`docs/cover-entrance.js`、`docs/gate-entrance.js` | 分层拼贴、入场和第二页过渡 |
| 章节首页与转场 | `docs/chapter-poster.js`、`docs/chapter-poster.css`、`docs/chapter-transit.js`、`docs/chapter-transit.css`、`docs/unit-entrance.js` | 章节海报、页面转场；样式是否打包以构建清单为准 |
| 阅读页印刷装饰 | `docs/reader-print.js`、`docs/reader-print.css` | 纹路、图版和页面装饰 |
| 序章与教程 | `docs/prologue.js`、`docs/prologue.css`、`docs/prologue-media.js`、`docs/tutorial.js`、`docs/tutorial.css` | 影像时间线、教程步骤；媒体时序交 Codex |
| 三维场景与模型 | `docs/dialogue-scenes.js`、`docs/model-library.js`、`docs/scene-miniatures.js`、`docs/focus.js`、`docs/refraction-light.js` | 模型位置、镜头、材质和观察；复杂场景改造交 Codex |
| AI 情境 | `docs/ai-content.js`、`docs/ai-scenes.js`、`docs/ai-reader.css` | 内容、三维场景和界面 |
| 五个设计提案 | `docs/proposal-content.js`、`docs/proposal-view.js`、`docs/proposal-scenes.js`、`docs/proposals.css` | 状态与规则、UI、场景和样式分别在对应文件 |
| 终章与牌阵 | `docs/finale.js`、`docs/finale.css`、`docs/finale-recap.css`、`docs/printed-ritual.js`、`docs/ritual-art.js`、`docs/standby-print.js`、`docs/standby-print.css` | 终章排版与视觉可美化；阶段逻辑保持现有行为 |
| 身份卡呈现 | `docs/identity-card.js`、`docs/identity-cards.css`、`docs/identity-lettering.js` | 人物、卡面、装饰文字与导出 |
| 身份计算与存档 | `docs/final-choices.js`、`docs/reading-round.js`、`docs/study-state.js`、`docs/reset-reading.js` | 复杂或底层工作交 Codex |
| 双人对局 UI | `docs/duel.js`、`docs/duel.css`、`docs/duel-arena.js`、`docs/duel-arena.css`、`docs/reading-review.js` | 可调整界面布局；不要借美化修改对局规则 |
| 对局与终局规则 | `docs/duel-state.js`、`docs/duel-data.js`、`docs/duel-endgame.js` | Codex 负责规则与存档兼容 |
| 终局界面 | `docs/duel-endgame-view.js`、`docs/duel-endgame.css` | 可做局部呈现调整；保持私密阶段和揭晓顺序 |
| 音乐与手机横屏 | `docs/music.js`、`docs/music.css`、`docs/orientation.js`、`docs/orientation.css` | 样式可以调整，媒体和设备行为交 Codex |
| 手势与依赖 | `docs/ritual-hand.js`、`docs/vendor/hand/` | 识别运行库、模型及摄像头流程交 Codex |

### 构建与辅助文件

| 文件 | 用途 |
| --- | --- |
| `scripts/build.mjs` | 打包 JS/CSS，更新 HTML 的资源引用，生成清单 |
| `scripts/preview.mjs` | 本地静态预览，端口 8787；提供媒体 Range 响应 |
| `scripts/preload-manifest.mjs` | 更新素材大小清单并嵌入 HTML，构建时调用 |
| `scripts/check-runtime.mjs` | Codex 使用的发布入口模拟运行检查，不验证 WebGL 渲染 |
| `scripts/optimize-images.py` | 图片优化辅助工具，需要 Python 与 Pillow；当前命令环境的 `python` 不可直接运行，必要时由 Codex 配置 |
| `tests/` | 已有启动、发布入口、预加载、音乐、提案、手牌和终局测试；由 Codex 运行和维护 |
| `package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` | 开发依赖与构建配置；美化阶段沿用现有设置 |
| `docs/built-*.js`、`docs/built-*.css`、`docs/built-*.LEGAL.txt` | 自动生成的发布文件，不直接编辑 |
| `docs/preload-manifest.json`、`docs/runtime-manifest.json`、HTML 内的清单和生成引用 | 构建自动维护，新增或替换资源后重新构建 |

`docs/edition-one.html`、`docs/dossier.html`、`docs/finale.html`、`docs/identity-atlas.html`、`docs/identity-directions.html` 是其他独立页面或辅助资料。当前主页是 `docs/index.html`，不要把 `edition-one.html` 配套的 `book.js` 当作当前主阅读流程。删除任何旧文件前应先核对引用，这类清理不属于本轮视觉工作。

`docs/footage-sources.html` 保存影像来源；`docs/vendor/` 和 `docs/fonts/` 含第三方许可说明，保留它们。

### 网页内实际素材

| 目录 | 内容 |
| --- | --- |
| `docs/assets/opening/` | 封面、第二页、灯塔、纸纹、图形和字标 |
| `docs/assets/prologue/` | 序章影像与静帧 |
| `docs/assets/chapter-plates/`、`docs/assets/reader-print/`、`docs/assets/tutorial/` | 章节图版、印刷纹理、教程图片 |
| `docs/assets/models/` | 已接入的 GLB 模型，含人物、轮椅、推车、王座、长榻、手袋 |
| `docs/assets/identity/`、`docs/assets/identity-studies/` | 卡牌底图、候选及实际使用的人物图 |
| `docs/assets/standby/`、`docs/assets/epilogue/`、`docs/assets/recap/` | 终章、钟、待机与回顾素材 |
| `docs/assets/game/` | 对局视觉素材 |
| `docs/assets/music/` | `ordinary.mp3`、`prologue.mp3`、`finale.mp3`、`endgame.mp3` |
| `docs/assets/references/`、`docs/plates/`、`docs/fonts/` | 参考图、概念 SVG 与字体 |

原图 PNG 与轻量 WebP 可能同时存在，具体加载哪个以实际引用为准。不要仅替换 PNG 却遗漏正在使用的 WebP。

## 四 项目外的设计与交付素材

以下资料都在 `C:\Users\Lenovo\Documents\ChatGPT\阿伦特`，是 `github-pages` 的同级文件夹或文件，**不在当前网页 Git 仓库里**。本机 Claude 如果只获得项目目录访问权限，可能还需用户添加对应资料文件夹；云端仅克隆仓库时不会自动拿到这些资料。

| 本地相对项目根目录的位置 | 内容与使用方式 |
| --- | --- |
| `../设计说明PPT交付/灯塔、飞鸟与王座的游戏_设计说明_21比9_更新版.pptx` | 已整理的项目设计说明，理解作品表达及展陈包装 |
| `../设计说明PPT素材/` | 封面、第二页、章节、模型、终章、选牌、阅读结果、对局的实屏图片，以及研究与排版素材；实屏为已有记录，最终以当前网页为准 |
| `../作品封面/` | 静态 PNG、多个 GIF 版本、MP4 和 `作品简介.txt` |
| `../开场视觉解构/index.html` | 开场视觉拆解与复现，配有参考封面、第二页图片 |
| `../之间-展板图片素材/素材浏览.html` | 展板素材的可视化浏览入口；配套 `使用说明.txt` 与 `素材清单.json` |
| `../之间-展板图片素材/` | 封面和第二页分层、卡牌、章节纹路、终章、王座骰子、44 张模型及交互场景截图、参考图片和模型备份 |
| `../之间-展板素材云端分包/` | 20 个 `between-assets-XX.zip` 分包，可分别解压并合并到同一素材目录 |
| `../模型交付-之间/制作说明与总览.html` | 人物、轮椅、推车、王座、长榻和手袋的三视图、母型、尺寸、支点、材质及接入要求 |
| `../四阶段音乐生成提示词.txt` | 四阶段音乐的创作提示记录 |
| 外层的预览 PNG/JPG | 序章、预加载、提案、立体对局、终局规则及评分等已有画面记录 |
| 外层 `between-*.tar.gz` | 早期阶段版本快照；不能按最大版本号覆盖当前仓库 |

展板素材中的「整页定位分层」保持共同画布尺寸，便于叠放；部分原图本身带有印刷文字，避免再叠加一层相同文字。素材导出图主要用于展板和参考，修改网页时仍应回到 `docs/assets/` 中的运行素材。

模型精修若进入后续范围，先阅读建模说明。当前模型约定 Y 轴向上、+Z 朝正面，需保留支点、可寻址节点及现有场景缩放关系；复杂的模型替换和动画接入交 Codex。

## 五 下一步美化应注意什么

### 视觉基调与内容表达

当前视觉已经建立群青蓝与白色纸面的主色、黑灰正文、网点拼贴、放射线、圆盘、折页和细线装饰。三维场景以白色、浅灰、透明材质配合蓝色交互焦点，封面比正文更具表现性。推荐强化这套语言在封面、阅读页、卡牌和对局间的连续性。

正文与操作需要清晰，装饰不应挤占阅读空间。当前 `readability.css` 以正文约 16px、辅助文字约 14px、主要操作高度约 44px 为基础；这些是现有实现的参考值，不能靠整体缩小界面解决拥挤。长中文、两行按钮、自定义答案和输入框要保留足够空间。

哲学概念、案例来源、用户自己的回答和系统整理出的身份具有不同角色。保持原有文案含义与来源；项目拟写的问题和阅读转述不能被包装成阿伦特原话。身份是本轮阅读的线索，文案和视觉不要把它渲染成固定人格诊断。

### 样式与局部交互

- CSS 有多层覆盖，最后效果取决于 `scripts/build.mjs` 中的样式顺序；`readability.css`、`orientation.css` 等后置规则可能覆盖前面的修改。优先在所属模块内改样式，避免不断追加全局 `!important`。
- 新建 CSS 文件不会自动进入打包链。优先使用已参与构建的样式文件；如果必须改变构建配置，把接入需求写给 Codex。
- 页面存在 `body` 类名、`data-*`、`inert`、`hidden` 和动态 DOM。保留事件绑定所依赖的 ID、属性、按钮含义及焦点反馈。
- 简单 UI 交互可以直接改；需要调整多页面共享状态、阅读层级顺序、答案含义、身份映射或对局阶段时，转交 Codex。
- 保留区分「单元内翻层」与「切换主题」的导航语义，避免视觉统一后让两个动作混淆。
- 动效应服务于阅读方向和层级；继续尊重已有减少动态效果设置，不增加必须等待很久才能操作的装饰过渡。
- 覆盖在三维画布上的装饰层不应阻挡模型拖动或控件点击；文字滚动区、底部导航与触屏操作需要各有空间。

### 已存在的底层行为

这些内容是 Claude 美化时应保留的行为背景，若需要修改则记入 Codex 待办，不要求 Claude 去检查或修复：

- 首屏不等待全部模型、音乐、视频或识别库下载。当前 `docs/` 全部文件约 143.7 MiB，包含原图、候选素材和运行库，不等于首屏下载量。
- 开场跳过、超时、失败重试和控件解锁已有处理；不要删除这些入口来简化画面。
- 音乐受浏览器播放权限影响，初次互动后才能播放属于现有处理范围；本次访问内的手动静音、切曲淡出与安静间隔、序章画音同步应保留。
- 手机以横屏体验为当前设计，不是独立竖屏阅读产品。可优化横屏提示的样式，完整竖屏重排应另列任务。
- 摄像头为可选交互，鼠标或触屏应继续可用，识别库保持按需加载。
- 笔记通常在 `localStorage`，当前轮次与对局在 `sessionStorage`。相关键包括 `between-dialogue-notes-v1`、`between.notes.*`、`between.reading-round.1`、`between.duel.1`、`between.reader-reset.1`。视觉任务不清空或改造这些存储。
- 导出卡面、人物文字、来源和许可证应继续存在；不要用一张整页截图替换实际可操作的页面。

### 建议的推进顺序

这是可执行的默认顺序，用户的新要求可以覆盖它：

1. 封面与第二页：整理标题层级、主按钮、菜单和音乐按钮的视觉关系，控制装饰密度。
2. 一个完整阅读单元：统一标题、正文、控件、提示和底部导航，再把规则扩展到其余单元及五个提案。
3. 终章与卡牌：统一人物、卡底、身份名称、说明和导出呈现。
4. 对局与终局：改善当前玩家、手牌、情境、输入区及操作按钮的层级，保留现有阶段和规则。
5. 交回修改清单、视觉预览和 `CODEX_TODO.md`，由 Codex 接手正式验证与复杂事项。

## 六 Claude 与 Codex 如何交接

Claude 完成一轮后，提供：

- 修改的文件和每组视觉变化，附可查看的预览或关键页面截图。
- 已完成的简单交互调整及影响的页面。
- 复杂需求在 `CODEX_TODO.md` 中的条目编号，以及为它保留的接口、文件位置或设计状态。
- 是否执行了为呈现改动所需的构建；如果构建报错，记录原始错误和触发步骤，不展开复杂排障。
- 明确说明未运行正式测试与功能回归，交由 Codex 执行；不声称视觉修改已经全面验证。

预留的原则是保留可运行版本。有依赖尚未实现时，用说明、设计图或清楚的接入注释表达，不新增假成功提示、无效按钮或半接入的流程。对复杂部分暂停实现，不影响继续处理独立的排版和素材工作。

### Codex 专用后续验证

本节供用户将任务转回 Codex 时使用，**不要求 Claude 执行**。

在当前基线与美化后的版本之间核对改动，按实际范围完成构建和验证：

```powershell
node scripts/build.mjs
node --test tests/*.test.mjs
node scripts/check-runtime.mjs
```

发布入口检查使用模拟 DOM，不替代真实浏览器和 WebGL。根据改动范围查看封面进入、章节导航与控件、文字滚动、输入与记录、终章选牌、对局及手机横屏。动到存档、规则、音视频或摄像头时，再验证对应完整流程。无需因纯文档或很小的视觉修改无限扩展测试范围。

需要验证慢媒体时，可使用预览服务的 `/__slow/` 路径；它是本地测试入口，不属于线上发布内容。页面定位锚点为 `#cover`、`#start`、`#prologue`、`#tutorial`、`#boundary`、`#public`、`#power`、`#privacy`、`#alienation`、`#alienation-two`、`#violence`、`#finale`、`#duel`。直达终章时若没有本轮答案，结果不能代表完整阅读路径。

正式发布时，源码与重新生成的 `docs/` 产物需要一起交付；是否提交、推送或发布以当次用户任务为准。
