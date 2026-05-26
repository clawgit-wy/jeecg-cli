# @jeecg/cli

> JeecgBoot Vue3 项目模板精简工具，支持全局安装后在任意 JeecgBoot 项目中执行精简定制。

[![npm version](https://img.shields.io/npm/v/@jeecg/cli.svg)](https://www.npmjs.com/package/@jeecg/cli)
[![npm downloads](https://img.shields.io/npm/dm/@jeecg/cli.svg)](https://www.npmjs.com/package/@jeecg/cli)
[![License](https://img.shields.io/npm/l/@jeecg/cli.svg)](./LICENSE)
[![Node](https://img.shields.io/node/v/@jeecg/cli.svg)](https://nodejs.org)

## ✨ 简介

`@jeecg/cli` 是面向 [JeecgBoot Vue3](https://github.com/jeecgboot/jeecg-boot) 项目的脚手架精简工具。
基于交互式菜单或快捷参数，可以一键删除官方仓库中默认携带的 Demo 示例、AI 模块、qiankun 微前端、Electron 桌面端等冗余代码与依赖，
帮助开发者快速从官方模板得到一份只包含业务必要能力的最小项目骨架。

工具完全使用原生 Node.js（无运行时依赖）实现，全局安装后可在任意 JeecgBoot Vue3 项目目录中执行。

## 🚀 安装

### 全局安装（推荐）

```bash
npm install -g @jeecg/cli
# 或
pnpm add -g @jeecg/cli
# 或
yarn global add @jeecg/cli
```

### 临时执行（无需安装）

```bash
npx @jeecg/cli
```

## 📦 环境要求

- Node.js `>= 18`
- 目标项目为 JeecgBoot Vue3（`package.json` 中 `name = "jeecgboot-vue3"`）

## 🔧 使用方式

### 1. 交互式菜单（默认）

进入 JeecgBoot Vue3 项目根目录后执行：

```bash
jeecg-cli
```

会展示交互式菜单，可选择：

- **快速精简**：内置 `最小化 / 标准 / 仅 Demo` 三种模板，一键执行
- **自定义精简**：按模块自由勾选要剔除/替换的功能
- **环境配置**：交互式修改 API 地址、端口等
- **查看项目信息**：查看模块目录是否存在、依赖数量等

### 2. 快速精简模式

跳过主菜单直接进入快速精简：

```bash
jeecg-cli --quick
```

### 3. 查看项目信息

```bash
jeecg-cli --info
```

### 4. 指定项目目录

不在项目根目录时，可通过 `--cwd` 指定目标项目：

```bash
jeecg-cli --cwd /path/to/jeecgboot-vue3-project
jeecg-cli --quick --cwd /path/to/jeecgboot-vue3-project
```

### 5. 帮助信息

```bash
jeecg-cli --help
```

## 🧩 模块说明

| 模块         | 说明                                                |
| ------------ | --------------------------------------------------- |
| `demo`       | 删除 Demo 示例代码（views/routes/api/mock/locales） |
| `ai`         | 删除 AI 功能模块（airag 下所有子模块、AI 仪表盘等） |
| `qiankun`    | 删除 qiankun 微前端并修复相关引用                   |
| `microapp`   | 删除 qiankun，安装并配置 micro-app 替代方案         |
| `electron`   | 删除 Electron 桌面端相关代码与配置                  |
| `deps`       | 清理 package.json 中的冗余依赖                      |
| `env`        | 交互式配置 `.env.development` / `.env.production` 等 |
| `cleanup`    | 清理 `Tree_backup` 等冗余备份组件                   |

### 快速精简模板对照

| 模板        | 删除内容                                           |
| ----------- | -------------------------------------------------- |
| 最小化      | Demo + AI + qiankun + Electron + 冗余依赖          |
| 标准        | Demo + qiankun + Electron（保留 AI）               |
| 仅 Demo     | 仅删除 Demo 示例代码                               |

## 📁 项目结构

```
jeecgboot-cli/
├── bin/
│   └── jeecg-cli.mjs        # CLI 入口，处理 --cwd 参数
├── lib/
│   ├── prompt.js            # readline 交互工具（select/multiSelect/confirm）
│   ├── utils.js             # 通用工具（文件操作、日志、ROOT 解析）
├── modules/                 # 各精简模块
│   ├── ai.js
│   ├── cleanup.js
│   ├── demo.js
│   ├── deps.js
│   ├── electron.js
│   ├── env.js
│   ├── microapp.js
│   └── qiankun.js
├── index.js                 # 主流程：菜单与模块编排
└── package.json
```

每个模块导出 `run()` 函数，通过 `index.js` 的菜单按需懒加载。

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/jeecgboot/jeecgboot-cli.git
cd jeecgboot-cli

# 链接到全局，以便在任意目录使用 jeecg-cli 命令
npm link

# 在某个 JeecgBoot Vue3 项目目录测试
cd /path/to/jeecgboot-vue3
jeecg-cli --info

# 调试完成后解除链接
cd -
npm run unlink:local
```

## 📤 发布

本仓库通过 GitHub Actions 自动发布到 npm，详见 [.github/workflows/release.yml](./.github/workflows/release.yml)。

发布流程：

1. 修改 `package.json` 中的 `version` 字段（遵循 [SemVer](https://semver.org)）
2. 提交变更并推送到主分支
3. 创建并推送 tag：

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. 推送 tag 后，GitHub Actions 会自动：
   - 安装依赖
   - 校验 tag 与 `package.json` 中的版本号一致
   - 通过 `NPM_TOKEN` 发布到 npm 公共 registry
   - 创建对应的 GitHub Release

> 也可通过 GitHub 仓库页面的 **Actions → Release → Run workflow** 手动触发。

### 配置 NPM_TOKEN

1. 在 [npmjs.com](https://www.npmjs.com/) 生成一个具有 `Automation` 权限的 Access Token
2. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中新建 secret：
   - Name: `NPM_TOKEN`
   - Value: 上一步生成的 token

## 🤝 贡献

欢迎提交 Issue 与 Pull Request。提交前请确保：

- 新增/修改的精简逻辑兼容当前 JeecgBoot Vue3 主分支
- 遵循现有代码风格（原生 ESM、无第三方运行时依赖）
- 在真实 JeecgBoot 项目中验证执行成功

## 📄 License

[MIT](./LICENSE) © JeecgBoot Team
