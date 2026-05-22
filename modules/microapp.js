import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ROOT, removeDir, step, info, error, patchFile, writeFile } from '../lib/utils.js';
import { run as removeQiankun } from './qiankun.js';

export async function run() {
  step('配置 micro-app 微前端 (替代 qiankun)');

  await removeQiankun();

  info('安装 micro-app 依赖...');
  try {
    execSync('pnpm add @micro-zoe/micro-app', { cwd: ROOT, stdio: 'inherit' });
    info('micro-app 安装成功');
  } catch {
    error('micro-app 安装失败，请手动执行: pnpm add @micro-zoe/micro-app');
  }

  const microAppDir = path.join(ROOT, 'src/micro-app');
  if (!fs.existsSync(microAppDir)) fs.mkdirSync(microAppDir, { recursive: true });

  writeFile('src/micro-app/index.ts', `import microApp from '@micro-zoe/micro-app';
import { getAppEnvConfig } from '/@/utils/env';

export function setupMicroApp() {
  const { VITE_GLOB_APP_OPEN_QIANKUN } = getAppEnvConfig();
  if (!VITE_GLOB_APP_OPEN_QIANKUN) return;

  microApp.start({
    tagName: 'micro-app',
  });
}
`);

  patchFile('src/main.ts', [
    {
      search: "import { registerPackages } from '/@/utils/monorepo/registerPackages';",
      replace: "import { registerPackages } from '/@/utils/monorepo/registerPackages';\nimport { setupMicroApp } from '/@/micro-app';",
      desc: '添加 micro-app import',
    },
    {
      search: '  await registerThirdComp(app);',
      replace: '  await registerThirdComp(app);\n\n  setupMicroApp();',
      desc: '添加 setupMicroApp() 调用',
    },
  ]);

  info('micro-app 配置完成!');
  info('使用方式: <micro-app name="xxx" url="http://xxx"></micro-app>');
  info('子应用配置参考: https://micro-zoe.github.io/micro-app/');
}
