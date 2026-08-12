# dotStart

一个 现代 · 极简 · 干净 的新标签页

## 特别提醒

本项目为Vibe Coding产物，仅供作者自用，代码质量较差。如有需要请自行重构或修改

## 主要功能

- 自动/浅色/深色主题切换
- 实时时钟显示
- 自定义搜索引擎
- 三种预设背景格式
- 中英文界面切换
- 常用快捷入口

## 安装运行

### Chrome

**最新快照版本**

1. 克隆本仓库
2. 访问`chrome://extensions/`
3. 启用`开发人员模式`
4. 选择`加载已解压的扩展程序`，并选中项目根目录
源码目录可直接作为 Chrome 扩展加载，无需额外执行构建步骤。

**稳定发行版本**

1. 进入GitHub Release，下载`ext-release.zip`
2. 将该压缩包解压至一个空文件夹
3. 在扩展程序设置中启用`开发人员模式`
4. 选中`加载已解压的扩展程序`，并选中该文件夹

### Firefox

**支持的Firefox版本**

1. Firefox Nightly
2. Firefox Developer Edtion \[推荐\]
3. Firefox ESR
4. Unbranded Firefox

您需要使用上述特定的Firefox版本并关闭扩展签名校验

**最新快照版本**

1. 克隆本仓库
2. 全选所有内容并添加至Zip压缩文件
3. 打开`about:addons`
4. 进入`扩展`选项卡并点击右上角设置
5. 点击`从文件加载附加组件`
6. 选中`ext-release.zip`并确认

**稳定发行版本**

1. 进入GitHub Release，下载`ext-release.zip`
2. 打开`about:addons`
3. 进入`扩展`选项卡并点击右上角设置
4. 点击`从文件加载附加组件
5. 选中`ext-release.zip`并确认

## 项目许可

本项目遵循[MIT LICENSE](LICENSE)进行分发
