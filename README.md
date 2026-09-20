# dotStart

一个 现代 · 极简 · 干净 的新标签页

## 特别提醒

本项目为Vibe Coding产物，仅供作者自用，代码质量较差。如有需要请自行重构或修改

## 主要功能

- 自动/浅色/深色主题切换
- 实时时钟显示
- 自定义搜索引擎
- 现代 / 极客 两种搜索框样式，圆角大小、框线粗细、搜索框长度与透明度可调
- 三种预设背景格式
- 中英文界面切换
- 自定义快捷方式（最多 4 个，可设权重决定左右顺序）
- 自定义 CSS（留空即关闭，写入后覆盖内置样式）
- 右键唤出底部设置面板

## 仓库

<https://github.com/alt021/dotStart>

## 浏览器支持

- Chrome / Edge / 其他 Chromium 内核浏览器
- Firefox 109+（需使用特定版本并关闭扩展签名校验，详见安装说明）

## 安装运行

### Chrome / Chromium 内核

**最新快照（克隆本仓库）**

1. 克隆本仓库
2. 访问 `chrome://extensions/`
3. 启用 `开发人员模式`
4. 选择 `加载已解压的扩展程序`，并选中项目根目录

源码目录可直接作为 Chrome 扩展加载，无需额外执行构建步骤。

**稳定发行版本**

1. 进入 GitHub Release，下载 `ext-release.zip`
2. 将该压缩包解压至一个空文件夹
3. 在扩展程序设置中启用 `开发人员模式`
4. 选中 `加载已解压的扩展程序`，并选中该文件夹

### Firefox 109+

**支持的 Firefox 版本**

1. Firefox Nightly
2. Firefox Developer Edition \[推荐\]
3. Firefox ESR
4. Unbranded Firefox

加载未签名扩展需要使用上述版本之一，并关闭扩展签名校验。

**最新快照（克隆本仓库）**

1. 克隆本仓库
2. 访问 `about:debugging#/runtime/this-firefox`
3. 点击 `Load Temporary Add-on…`
4. 选择项目根目录下的 `manifest.json`

**稳定发行版本**

1. 进入 GitHub Release，下载 `ext-release.zip`
2. 打开 `about:addons`
3. 进入 `扩展` 选项卡并点击右上角设置
4. 点击 `从文件加载附加组件`
5. 选中 `ext-release.zip` 并确认

> Firefox 临时加载的扩展在浏览器重启后会失效，需重新加载。

## 项目许可

本项目遵循[MIT LICENSE](LICENSE)进行分发
