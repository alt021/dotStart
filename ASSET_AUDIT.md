# dotStart 资产审查报告

审查日期：2026-09-09 · 版本：2.1.0 · 审查范围：全部纳入扩展包的文件与资源

> **状态（2026-10-02 整理）**：本报告的发现已按下方状态表执行完毕，除 P3（拆分 `newtab.js`）外全部落地。
>
> 审查当时的现场记录（原第二至七节）已在 2026-10-02 的清理中删除。它们记录的是**审查那一刻**的现场，其中几乎每一条此后都被推翻或改写：`guide.md` 已删、`showDots` 已迁移并移除、`MIT_LICENSE` 常量已改为运行时读 `LICENSE`、`extName` 死资源已启用、`tabs` / `bookmarks` / `history` 已从清单移除、缺 16/128 图标已补齐、两张截图已统一尺寸、`\uXXXX` 转义已还原为真实中文、彩蛋文本已外置并最终硬编码。留着它们只会让后来者读到一份与实际代码相反的清单。
>
> 下面这份状态表是本文件唯一仍具权威性的部分：它记录**改了什么、为什么、落在哪个 commit**。

## 建议动作与执行状态

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
| 2026-09-20 | 自定义 CSS 的首次启用加 8 秒确认阶段；新增扩展工具栏按钮弹窗（`popup.html` + `src/popup.js` + `src/popup.css`）一键清除；已打开的页面通过 `storage` 事件实时恢复（零新增权限） | `17e4015` … `7cbac39` |
| 2026-09-21 | 主页覆盖移到 `manifest.firefox.json`（Chrome 拒绝装载带 homepage 的清单）；`make_dist.py` 由 HEAD 生成两个原生 `git archive` 产物 | `31e711c` |
| 2026-09-30 | 声明 `gecko.data_collection_permissions.required = ["none"]`，并把 `strict_min_version` 由 109.0 提到 128.0（≤127 遇到该键是**报错**而非忽略） | `56aa590` |
| 2026-10-02 | 清理 Agent 侧文件：删除一次性临时产物与失效脚本、已回退功能（更新检测）的记忆与注释残留、本报告已被推翻的现场记录 | 本轮 |
| 2026-10-25 | 新品牌标：方框（页面）+ 红点（句点），仅黑白红三色。`favicon.svg` 取代 Font Awesome 房子图标（暗色下描边转白）；五张扩展图标由同一组几何常数生成，改为黑底 + 白框 + 红点，解决"透明 PNG 在深色工具栏上消失"的问题 | `8f564b0` |
| 2026-10-25 | 图标清晰度：每个尺寸改为按**自身像素网格**绘制（外框、描边、圆点全部取整），4× 超采样后 `BOX` 下采样，取代"从 256 网格缩放"；`chrome://extensions` 里那圈灰边（边缘半覆盖像素）消失。README 顶部增加品牌横幅 `docs/logo.svg` / `docs/logo-dark.svg`（裸形图标 + `dotStart` 字标；字标为轮廓而非 `<text>`，否则排版会随读者字体漂移），由 `make_logo.py` 生成，`<picture>` 按 GitHub 主题切换 | 本轮 |
| 2026-10-27 | 扩展图标呈现方式：去掉整块底板，改为**白纸 + 黑框 + 红句点，外缘透明**。浅色工具栏靠黑框成形、深色靠白纸成形，不再像录音/停止键；句点半径 35 → 28（更像句号）。图标、`favicon.svg`、README 横幅由同一组常数重生成 | 本轮 |
| 2026-10-28 | 新增 `favicon-dark.svg`：**白框 + 红点**，不带媒体查询。`favicon.svg` 仍靠 `prefers-color-scheme` 自行换墨；只有页面 `data-theme` 被设为 `dark` 时，`updateFavicon()` 才把 icon 链接指向白框文件（这一偏好到不了媒体查询），其余主题一律指回 `favicon.svg`。两份 SVG 由 `make_icon.py` 同一组常数生成 | 本轮 |

### 仍未解决

- **`newtab.js` 仍是单文件约 1768 行**（P3）。多套独立 UI 混居一处，改动易互相干扰。建议后续拆为 `i18n` / `search` / `menu` / `settings-dialog` / `onboarding` / `easter-egg` 模块。**AGENTS.md §1.3 已给出按函数族的模块映射表，可作为拆分蓝本。**
- **Chrome 新标签页不渲染 favicon（有意为之）**：`favicon.svg` / `favicon-dark.svg` 基本只在 Firefox 或直接打开 `newtab.html` 时可见。Chrome 侧的视觉标识只能由 `manifest.json` 的 `icons` 承担，已于 2026-10-25 随新图标一并处理；PNG 无法随主题变色，所以那五张是**白纸 + 黑框、外缘透明**，而不是全透明的墨色描边——浅色工具栏靠黑框、深色靠白纸（理由见 AGENTS.md §4.5）。

---

复跑审计：`.workbuddy/asset_audit.py`（检查孤立 CSS 类、i18n 键一致性、图片尺寸、locale 消息引用情况）。注意该脚本为本地工具，位于 `.workbuddy/`（已被 gitignore），不入库。

> 该脚本用正则扫源码，**看不到运行时拼出的类名**：设置面板的 `icon:` 字段、`cardHTML()` 生成的 `.settings-card*`、`itemStatus()` 动态加上的 `.selected` 都会被它报成"未使用"。图标覆盖率请以 `.workbuddy/fa_verify.py` 为准（它同时核对 CSS 规则、字体 cmap 与字形轮廓），不要照抄这个列表去删样式。
