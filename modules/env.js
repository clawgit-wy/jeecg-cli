import { step, info, patchFile } from '../lib/utils.js';
import { select, ask } from '../lib/prompt.js';

export async function run() {
  step('环境配置');

  const choice = await select('选择环境配置', [
    { value: 'dev', label: '开发环境', desc: '配置API地址、端口' },
    { value: 'prod', label: '生产环境', desc: '配置构建参数' },
    { value: 'docker', label: 'Docker部署', desc: '容器化部署' },
  ]);

  if (choice === 'dev') {
    const apiUrl = await ask('API地址 (默认 http://localhost:8080/jeecg-boot): ') || 'http://localhost:8080/jeecg-boot';
    const port = await ask('开发端口 (默认 3100): ') || '3100';
    patchFile('.env.development', [
      { search: /VITE_GLOB_API_URL=.*/, replace: `VITE_GLOB_API_URL=${apiUrl}` },
      { search: /VITE_PORT=.*/, replace: `VITE_PORT=${port}` },
    ]);
    info(`API地址: ${apiUrl}`);
    info(`开发端口: ${port}`);
  } else if (choice === 'prod') {
    const apiUrl = await ask('生产API地址: ');
    if (apiUrl) {
      patchFile('.env.production', [
        { search: /VITE_GLOB_API_URL=.*/, replace: `VITE_GLOB_API_URL=${apiUrl}` },
      ]);
    }
  } else if (choice === 'docker') {
    const apiUrl = await ask('Docker API地址: ');
    if (apiUrl) {
      patchFile('.env.docker', [
        { search: /VITE_GLOB_API_URL=.*/, replace: `VITE_GLOB_API_URL=${apiUrl}` },
      ]);
    }
  }
}
