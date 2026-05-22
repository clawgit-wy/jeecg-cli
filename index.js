#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ROOT, stats, colors, info, warn, error, step } from './lib/utils.js';
import { select, multiSelect, confirm, closeRl } from './lib/prompt.js';

const modules = {
  demo: () => import('./modules/demo.js').then((m) => m.run()),
  ai: () => import('./modules/ai.js').then((m) => m.run()),
  qiankun: () => import('./modules/qiankun.js').then((m) => m.run()),
  microapp: () => import('./modules/microapp.js').then((m) => m.run()),
  electron: () => import('./modules/electron.js').then((m) => m.run()),
  deps: () => import('./modules/deps.js').then((m) => m.run()),
  env: () => import('./modules/env.js').then((m) => m.run()),
  cleanup: () => import('./modules/cleanup.js').then((m) => m.run()),
};

const { BOLD, CYAN, GREEN, RED, DIM } = colors;

function showBanner() {
  console.log('');
  console.log(`${BOLD}${CYAN}  ╔══════════════════════════════════════╗${DIM}`);
  console.log(`${BOLD}${CYAN}  ║   JeecgBoot Vue3 项目模板精简 CLI    ║${DIM}`);
  console.log(`${BOLD}${CYAN}  ║   v1.0.0                            ║${DIM}`);
  console.log(`${BOLD}${CYAN}  ╚══════════════════════════════════════╝${DIM}`);
  console.log(`  ${DIM}目标项目: ${ROOT}${DIM}`);
  console.log('');
}

function showHelp() {
  console.log(`
${BOLD}用法:${DIM}
  jeecg-cli [选项]

${BOLD}选项:${DIM}
  --quick           快速精简模式（跳过菜单，直接选择模板）
  --info            查看项目模块和依赖状态
  --cwd <path>      指定 JeecgBoot 项目目录（默认为当前命令执行目录）
  --help, -h        显示帮助信息

${BOLD}示例:${DIM}
  jeecg-cli                        在当前目录执行（交互式菜单）
  jeecg-cli --quick                快速精简当前目录的 JeecgBoot 项目
  jeecg-cli --info                 查看当前目录的项目信息
  jeecg-cli --cwd /path/to/proj    指定项目目录执行

${BOLD}全局安装:${DIM}
  npm install -g @jeecg/cli
  pnpm add -g @jeecg/cli
  yarn global add @jeecg/cli
`);
}

function showInfo() {
  step('项目信息');
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : {};
  console.log(`  ${BOLD}项目:${DIM} ${pkg.name || 'unknown'} v${pkg.version || '?'}`);
  console.log(`  ${BOLD}路径:${DIM} ${ROOT}`);
  console.log(`  ${BOLD}dependencies:${DIM} ${Object.keys(pkg.dependencies || {}).length} 个`);
  console.log(`  ${BOLD}devDependencies:${DIM} ${Object.keys(pkg.devDependencies || {}).length} 个`);

  const checks = [
    ['src/views/demo', 'Demo示例'],
    ['src/views/super/airag', 'AI功能'],
    ['src/qiankun', 'qiankun微前端'],
    ['electron', 'Electron'],
    ['src/electron', 'Electron源码'],
    ['src/micro-app', 'micro-app微前端'],
    ['src/components/Tree_backup', '冗余组件备份'],
  ];
  console.log(`\n  ${BOLD}模块状态:${DIM}`);
  for (const [d, label] of checks) {
    const exists = fs.existsSync(path.join(ROOT, d));
    console.log(`    ${exists ? GREEN : RED}${exists ? '✓' : '✗'}${DIM} ${label} (${d})`);
  }
}

async function quickMode() {
  step('快速精简模式');

  const choice = await select('选择快速精简模板', [
    { value: 'minimal', label: '最小化模板', desc: '删除Demo+AI+qiankun+Electron+冗余依赖' },
    { value: 'standard', label: '标准模板', desc: '删除Demo+qiankun+Electron, 保留AI' },
    { value: 'demo-only', label: '仅删除Demo', desc: '仅删除示例代码' },
  ]);

  const ok = await confirm(`确认执行 ${choice === 'minimal' ? '最小化' : choice === 'standard' ? '标准' : '仅Demo'} 精简？`);
  if (!ok) { warn('已取消'); return; }

  if (choice === 'minimal' || choice === 'standard' || choice === 'demo-only') {
    await modules.demo();
  }
  if (choice === 'minimal') {
    await modules.ai();
  }
  if (choice === 'minimal' || choice === 'standard') {
    await modules.qiankun();
    await modules.electron();
    await modules.deps();
    await modules.cleanup();
  }

  info('快速精简完成!');
}

async function customMode() {
  const selected = await multiSelect('选择要执行的精简模块', [
    { value: 'demo', label: 'Demo 示例代码', desc: '删除demo/views/routes/api/mock' },
    { value: 'ai', label: 'AI 功能模块', desc: '删除airag下所有AI子模块' },
    { value: 'qiankun', label: 'qiankun 微前端', desc: '删除qiankun并修复引用' },
    { value: 'microapp', label: 'micro-app 微前端', desc: '删除qiankun，安装配置micro-app' },
    { value: 'electron', label: 'Electron 桌面端', desc: '删除electron相关代码' },
    { value: 'deps', label: '冗余依赖清理', desc: '清理不需要的package依赖' },
    { value: 'env', label: '环境配置', desc: '配置API地址、端口等' },
    { value: 'cleanup', label: '冗余组件清理', desc: 'Tree_backup等' },
  ]);

  if (selected.length === 0) { warn('未选择任何模块'); return; }

  for (const mod of selected) {
    if (modules[mod]) await modules[mod]();
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    quick: args.includes('--quick'),
    info: args.includes('--info'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    return;
  }

  showBanner();

  // 项目校验：确保 ROOT 是一个 JeecgBoot Vue3 项目
  const pkgPath = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    error(`未找到 package.json: ${pkgPath}`);
    error(`请在 JeecgBoot Vue3 项目根目录执行，或使用 --cwd 指定项目目录`);
    closeRl();
    process.exit(1);
  }
  const projectPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (projectPkg.name !== 'jeecgboot-vue3') {
    warn(`当前目录的 package.json (name=${projectPkg.name}) 看起来不是标准 JeecgBoot Vue3 项目`);
    const ok = await confirm('继续执行可能误删非预期文件，确认继续？');
    if (!ok) { warn('已取消'); closeRl(); return; }
  }

  if (args.info) {
    showInfo();
    closeRl();
    return;
  }

  if (args.quick) {
    await quickMode();
    console.log(`\n${DIM}────────────────────────────────────────${DIM}`);
    console.log(`\n${BOLD}统计:${DIM} 删除 ${stats.removed} 项 | 跳过 ${stats.skipped} 项 | 修改 ${stats.modified} 项`);
    closeRl();
    return;
  }

  while (true) {
    const action = await select('请选择操作', [
      { value: 'quick', label: '快速精简', desc: '一键生成最小化/标准/仅Demo模板' },
      { value: 'custom', label: '自定义精简', desc: '按模块选择精简内容' },
      { value: 'env', label: '环境配置', desc: '配置API地址、端口等' },
      { value: 'info', label: '查看项目信息', desc: '查看模块和依赖状态' },
      { value: 'exit', label: '退出', desc: '' },
    ]);

    if (action === 'quick') await quickMode();
    else if (action === 'custom') await customMode();
    else if (action === 'env') await modules.env();
    else if (action === 'info') showInfo();
    else if (action === 'exit') break;

    console.log(`\n${DIM}────────────────────────────────────────${DIM}`);
  }

  console.log(`\n${BOLD}统计:${DIM} 删除 ${stats.removed} 项 | 跳过 ${stats.skipped} 项 | 修改 ${stats.modified} 项`);

  const doInstall = await confirm('是否运行 pnpm install 重新安装依赖？');
  if (doInstall) {
    info('正在安装依赖...');
    try { execSync('pnpm install', { cwd: ROOT, stdio: 'inherit' }); info('依赖安装完成'); }
    catch { error('依赖安装失败'); }
  }

  const doDev = await confirm('是否运行 pnpm dev 验证项目？');
  if (doDev) {
    info('正在启动开发服务器...');
    execSync('pnpm dev', { cwd: ROOT, stdio: 'inherit' });
  }

  closeRl();
  info('定制工具执行完毕!');
}

main().catch((e) => { error(e.message); closeRl(); process.exit(1); });
