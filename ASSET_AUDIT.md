# dotStart 资产审查报告

审查日期：2026-09-09 · 版本：2.1.0 · 审查范围：全部纳入扩展包的文件与资源

> **状态（2026-09-11 更新）**：本报告的发现已按第八节执行完毕，除 P3（拆分 `newtab.js`）外全部落地。
> 第二至七节保留的是**审查当时**的现场记录，其中若干资产已在本轮清理中删除或改写（`guide.md` 已删、`showDots` 已迁移、`MIT_LICENSE` 已改为读取 `LICENSE`、彩蛋文本已外置为 `EASTER.MD` 并最终硬编码为 `EASTER_CONTENT`）。
> 阅读时请以**第八节的状态表**为准。

## 一、资产总览

| 资产 | 尺寸/规格 | 大小 | 引用方 | 状态 |
| --- | --- | --- | --- | --- |
| `icon-48.png` | 48×48 | 3.4 KB | `manifest.icons.48` | 正常 |
| `icon-96.png` | 96×96 | 8.9 KB | `manifest.icons.96` | 正常 |
| `icon.png` | 256×256 | 32 KB | `manifest.icons.256` | 警告（缺 16/128） |
| `scrshot-light.png` | 1147×637 | 55 KB | 引导页第 3 屏 | 警告（尺寸不一致） |
| `scrshot-dark.png` | 1129×621 | 45 KB | 引导页第 3 屏 | 警告（尺寸不一致） |
| `_locales/en/messages.json` | 2 条消息 | 182 B | 仅 `extDescription` | 警告（extName 死资源） |
| `_locales/zh_CN/messages.json` | 2 条消息 | 175 B | 仅 `extDescription` | 警告（extName 死资源） |
| `src/newtab.js` | 1223 行 | 49 KB | `newtab.html` | 风险 |
| `src/newtab.css` | 77 个类 | 18 KB | `newtab.html` | 正常（无孤立样式） |
| `newtab.html` | 13 行 | 336 B | manifest newtab | 正常 |
| `manifest.json` | MV3 | 511 B | — | 见第三节 |
| `README.md` / `AGENTS.md` / `guide.md` / `LICENSE` | — | 3.1 KB | 仅人工阅读 | 见第四节 |

扩展包总计约 **190 KB**，其中图片资产 **145 KB（76%）**。

## 二、死资产与未引用资源

1. **`extName` 消息键（en / zh_CN 各一份）** — manifest 中 `name` 硬编码为 `dotStart`，从未使用 `__MSG_extName__`。两条消息的值为 `"N3w P4ge by AmeXE2"`，是旧产品名的遗留。**建议**：要么在 manifest 改用 `"name": "__MSG_extName__"` 并把值统一成 `dotStart`，要么直接删除这两个键。

2. **`showDots` 存储键** — `STORAGE_KEYS.showDots` 已定义且仍在 `updateDots()` / `getMenuHTML()` 中作回退读取，但 UI 上已无任何写入入口（菜单里只有 `backgroundStyle`）。属于僵尸配置项，仅对老用户生效。**建议**：加一段一次性迁移（读到 `showDots` 时写入 `backgroundStyle` 并删除），或直接移除回退逻辑。

3. **CSS 无孤立类** — 已交叉比对 77 个 CSS 类与 JS/HTML 中的类名，未发现只定义不使用的样式。`.checked` / `.selected` 经三元表达式动态生成，属正常。

## 三、重复维护（漂移风险）

| 内容 | 副本 1 | 副本 2 | 风险 |
| --- | --- | --- | --- |
| 版本号 `2.1.0` | `manifest.json` | `newtab.js` 彩蛋文本 `GUIDE_CONTENT_ZH/EN` | 发版必漏改一处 |
| MIT 许可证全文 | `LICENSE` | `newtab.js` 的 `MIT_LICENSE` 常量（约 1 KB） | 改许可证需同步两处 |
| 发行日志 / 仓库地址 | `guide.md` | `newtab.js` 彩蛋文本 | 已出现偏差：guide 用 `<扩展程序版本号>` 占位，JS 里写死 2.1.0 |
| 引导页文案 | `ONBOARDING_I18N`（JS 内） | 无外部来源 | 翻译只能改代码 |

**建议**：把彩蛋里的版本、仓库、日志改为从 `chrome.runtime.getManifest().version` 与单一常量读取；MIT 全文改为运行时 `fetch()` 同目录 `LICENSE`（扩展页面允许同源读取）或直接保留一份、删除另一份。

## 四、文档资产问题

- **`AGENTS.md` 严重过时**：仍描述为"search + theme toggle logic"，而实际代码含 5 个模块（搜索、右键菜单、书签/历史侧边栏、首次引导、彩蛋）。未提及 `_locales`、Firefox 兼容分支（`isFirefox()`）、`scrshot-*.png` 资产、以及 `permissions` 中实际申请的 `tabs`/`bookmarks`/`history`。AI 协作者按此文件工作会持续产生错误假设。
- **`guide.md` 被 `.gitignore` 忽略**：文件在磁盘上但不入库，其内容又被硬编码进 JS。等于存在"第三份"事实来源，且克隆仓库的人看不到。
- **`README.md` 未写仓库地址**：实际 remote 为 `https://github.com/alt021/dotStart`（与彩蛋一致），但 README 里查不到。
- **命名差异（非冲突）**：GitHub 账户 ID 为 `alt021`（仓库 `alt021/dotStart`、git remote 仍指向此账号）；显示名 / 作者署名为 `AmeXE2`；Firefox 扩展 ID 用 `dotstart@amexe2.github.io` 是因为 GitHub Pages 域绑定到 `amexe2.github.io`。三者属于不同维度，不需要保持一致。

## 五、图标与截图规范

- **缺 `16` 与 `128` 尺寸**：Chrome 网上应用店要求提供 128×128；16 用于扩展管理页与右键菜单。当前只有 48/96/256，Chrome 会缩放，Firefox 会在验证时提示。
- **两张截图尺寸不一致**（1147×637 vs 1129×621，宽高比 1.80 vs 1.82）：引导页第 3 屏同时插入两张 `<img>`，靠主题类切换显示。尺寸差异会造成切换主题时的布局微跳。**建议**重新截取为同一画布尺寸（如统一 1200×675），并考虑压缩——两张共 100 KB，占包体一半以上。

## 六、代码资产可维护性

`src/newtab.js` 49 KB / 1223 行，是**构建产物形态的源文件**：

- 中文文案全部转义成 `\u663E\u793A\u6807\u9898` 形式（esbuild 等工具的输出特征），且带 `/* @__PURE__ */` 标记；
- 但 README 明确写了"移除对 npm 的依赖"，即已无构建步骤。

结果是**源码不可读也不可直接编辑**——想改一句中文提示得先反查 Unicode 码点。这是本项目最大的技术债。

**建议**（按成本从低到高）：
1. 用一次性脚本把 `\uXXXX` 还原为真实中文字符提交（风险最低，立刻可读）；
2. 或重新引入构建：保留可读的 `src/` 源文件，输出到 `dist/`，manifest 指向 `dist/`；
3. 至少将 `I18N` / `ONBOARDING_I18N` / `GUIDE_*` 拆到独立的 `src/i18n.js`，让文案与逻辑分离。

另外，单文件 1223 行里混杂了 DOM 构建、右键菜单、侧边栏、引导流程、彩蛋五套相互独立的 UI，后续任何改动都容易互相踩到。

## 七、其他发现

- **未提交改动**：`src/newtab.js` 有 1 行未提交（`isFirefox()` 判断从 `browser.runtime` 加固为 `browser.runtime?.getBrowserInfo`）。git 因目录属主问题拒绝操作，需执行 `git config --global --add safe.directory D:/OpenCode/New-page`。
- **Firefox 兼容性缺口**：默认搜索引擎 `browser` 走 `chrome.search.query()`，该 API 是 Chrome 87+ 专有，Firefox 无对应实现（`browser.search` 接口不同），且 Firefox 不识别 `search` 权限。因此在 Firefox 上选"跟随浏览器"会静默无响应。**建议**在 `isFirefox()` 时隐藏该选项或回退到某个具体引擎。
- **权限偏大**：申请了 `tabs` + `bookmarks` + `history` 三项，其中 `history`/`bookmarks` 仅在侧边栏开启时使用。Firefox 不支持 `optional_permissions` 动态申请，但 Chrome 可考虑改为可选权限以降低安装时的权限提示压力。

## 八、建议动作与执行状态

| 优先级 | 动作 | 状态 | 实现位置 |
| --- | --- | --- | --- |
| P0 | 还原 `newtab.js` 中的 `\uXXXX` 转义 | ✅ 完成 | 403 处转义还原为真实中文，`7d71b82` |
| P0 | 更新 `AGENTS.md` 至当前实际架构 | ✅ 完成 | 按 9 个运行时模块重写，`7d71b82`；后续每轮改动同步维护 |
| P1 | 处理 `extName` 死资源 + 版本号/许可证单一来源 | ✅ 完成 | `name` 改用 `__MSG_extName__` 且值统一为 `dotStart`；版本号改读 `chrome.runtime.getManifest().version`；MIT 全文改读 `LICENSE`，`7d71b82` |
| P1 | 补齐 `icon-16.png` / `icon-128.png` | ✅ 完成 | 由 `icon.png` 以 LANCZOS 生成并注册进 `manifest.icons`，`7d71b82` |
| P1 | 修复 Firefox 下 `chrome.search.query()` 失效 | ✅ 完成 | `search()` 加回退到 Google；菜单在 Firefox 下隐藏"跟随浏览器"，`7d71b82` |
| P2 | 统一两张截图尺寸并压缩 | ✅ 完成 | 统一为 960×540，`7d71b82` |
| P2 | `guide.md` 入库或删除，消除第三份事实来源 | ✅ 完成 | 已删除；相关内容改由 `README.md` 与 `EASTER.MD` 承担，`7d71b82` |
| P2 | 清理 `showDots` 僵尸配置 | ✅ 完成 | 新增 `migrateLegacySettings()` 一次性迁移，并从 `STORAGE_KEYS` 移除，`7d71b82` |
| P3 | 拆分 `newtab.js` 为多模块 | ⬜ 未做 | 保留为独立立项 |

### 审查后追加的改动（不在原报告范围内）

| 日期 | 改动 | commit |
| --- | --- | --- |
| 2026-09-11 | 彩蛋文本外置为 `EASTER.MD`（含语言分段 → 双语同屏 → 发行日志分行 → 排版定稿） | `fa00835` … `3c05f77` |
| 2026-09-11 | 彩蛋文本最终**硬编码**为 `EASTER_CONTENT`；滚动速度改为恒定 150px/s 并消除尾部空屏 | `24489e2` |
| 2026-09-11 | 新增 `house-regular-full.svg` 作为主题感知 favicon | `c4e4f34` |
| 2026-09-11 | 权限收敛：删掉未使用的 `tabs`；`bookmarks` / `history` 转入 `optional_permissions`，首次打开侧边栏时申请 | `489a5b9` |
| 2026-09-11 | Firefox 快捷入口定案：整行（含菜单开关）与侧边栏外部链接在 Firefox 下不提供 | `c03e2c5` |

### 仍未解决

- **`newtab.js` 仍是单文件约 1230 行**（P3）。五套独立 UI 混居一处，改动易互相干扰。建议后续拆为 `i18n` / `search` / `menu` / `sidebar` / `onboarding` / `easter-egg` 模块。
- **Chrome 新标签页可能不显示 favicon**：Chrome 有意在 NTP 不渲染 favicon，`house-regular-full.svg` 大概率只在 Firefox 或直接打开 `newtab.html` 时可见。如需在 Chrome 也更换视觉标识，唯一杠杆是重新生成 `manifest.json` 的 `icons`（PNG，无法随主题变色）。**尚未决定**。

---

复跑审计：`.workbuddy/asset_audit.py`（检查孤立 CSS 类、i18n 键一致性、图片尺寸、locale 消息引用情况）。注意该脚本为本地工具，位于 `.workbuddy/`（已被 gitignore），不入库。
