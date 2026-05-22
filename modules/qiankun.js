import { removeDir, removeFile, step, info, patchFile, readPackageJson, writePackageJson } from '../lib/utils.js';

export async function run() {
  step('删除 qiankun 微前端模块');

  removeDir('src/qiankun', 'qiankun模块');
  removeFile('build/vite/plugin/qiankunMicro.ts', 'qiankun Vite插件');

  patchFile('src/main.ts', [
    { search: /import\s*\{[^}]*checkIsQiankunMicro[^}]*\}\s*from\s*["'][^"']*qiankun[^"']*["'];?\n?/g, replace: '', desc: '移除 qiankun import (checkIsQiankunMicro)' },
    { search: /import\s*\{[^}]*autoUseQiankunMicro[^}]*\}\s*from\s*["'][^"']*qiankun[^"']*["'];?\n?/g, replace: '', desc: '移除 qiankun import (autoUseQiankunMicro)' },
    {
      search: /async function main\(\)\s*\{[\s\S]*?await bootstrap\(props?\)[\s\S]*?\}/,
      replace: `async function main() {\n  const props = getMainAppProps();\n  await bootstrap(props);\n}`,
      desc: '简化 main() 函数',
    },
  ]);

  patchFile('src/utils/env.ts', [
    {
      search: /import\s*\{\s*getGlobal\s*\}\s*from\s*["']@\/qiankun\/micro["'];?\n?/,
      replace: `function getGlobal() {\n  return typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});\n}\n\n`,
      desc: '替换 qiankun/micro getGlobal 为本地实现',
    },
  ]);

  patchFile('vite.config.ts', [
    {
      search: /const serverOptions[^}]*\}\s*\/\/.*?\n\s*const\s*\{VITE_GLOB_QIANKUN_MICRO_APP_NAME[\s\S]*?\/\/.*?\[end\].*?\n/,
      replace: '',
      desc: '移除 vite.config.ts qiankun 配置块',
    },
    { search: 'isQiankunMicro ? VITE_GLOB_QIANKUN_MICRO_APP_ENTRY : VITE_PUBLIC_PATH', replace: 'VITE_PUBLIC_PATH', desc: 'base 改为 VITE_PUBLIC_PATH' },
    { search: '...serverOptions,\n', replace: '', desc: '移除 serverOptions' },
    { search: 'createVitePlugins(viteEnv, isBuild, isQiankunMicro)', replace: 'createVitePlugins(viteEnv, isBuild)', desc: '移除 createVitePlugins isQiankunMicro 参数' },
  ]);

  patchFile('build/vite/plugin/index.ts', [
    { search: "import { configQiankunMicroPlugin } from './qiankunMicro';\n", replace: '', desc: '移除 qiankunMicro import' },
    { search: 'isQiankunMicro: boolean,\n', replace: '', desc: '移除 isQiankunMicro 参数声明' },
    { search: 'configHtmlPlugin(viteEnv, isBuild, isQiankunMicro)', replace: 'configHtmlPlugin(viteEnv, isBuild)', desc: '移除 configHtmlPlugin isQiankunMicro 参数' },
    {
      search: /\/\/\s*【JEECG作为乾坤子应用】注册乾坤子应用模式插件[\s\S]*?vitePlugins\.push\(\.\.\.configQiankunMicroPlugin[^)]*\)\)\s*\n\s*\}/,
      replace: '',
      desc: '移除 qiankunMicro 插件注册块',
    },
  ]);

  patchFile('build/vite/plugin/html.ts', [
    {
      search: 'export function configHtmlPlugin(env: ViteEnv, isBuild: boolean, isQiankunMicro: boolean)',
      replace: 'export function configHtmlPlugin(env: ViteEnv, isBuild: boolean)',
      desc: '移除 html 插件 isQiankunMicro 参数',
    },
    {
      search: /\/\/\s*【JEECG作为乾坤子应用】补充静态资源前缀[\s\S]*?const basePublicPath = isQiankunMicro[\s\S]*?'';/,
      replace: "const basePublicPath = '';",
      desc: '简化 basePublicPath',
    },
  ]);

  patchFile('src/layouts/default/content/index.vue', [
    { search: '    <div :id="qiankunDivId" class="app-view-box" v-if="openQiankun && qiankunDivId"></div>\n', replace: '', desc: '移除 qiankun 容器 div' },
    { search: "  // import registerApps from '/@/qiankun';\n", replace: '', desc: '移除 qiankun 注释 import' },
    { search: "      const openQiankun = globSetting.openQianKun == 'true';\n      const qiankunDivId = ref('');\n", replace: '', desc: '移除 qiankun 变量声明' },
    { search: /      \/\/ \/\/ 注册 qiankun[\s\S]*?\/\/ \}\n/, replace: '', desc: '移除 qiankun 注册注释块' },
    { search: '        openQiankun,\n        qiankunDivId,\n', replace: '', desc: '移除 qiankun return 属性' },
  ]);

  patchFile('src/layouts/default/index.vue', [
    {
      search: /        \/\/ 【JEECG作为乾坤子应用】\n        if \(unref\(isQiankunMicro\)\) \{\n\s+\}\n/,
      replace: '',
      desc: '移除 index.vue qiankun 空条件块',
    },
    {
      search: /      const \{ isQiankunMicro \} = glob;\n\n      \/\/ Create a lock screen monitor\n/,
      replace: '      // Create a lock screen monitor\n',
      desc: '移除 index.vue isQiankunMicro 解构',
    },
    {
      search: '        isQiankunMicro,\n',
      replace: '        isQiankunMicro: false,\n',
      desc: '替换 index.vue isQiankunMicro return 为 false',
    },
    {
      search: /      \/\/ 代码逻辑说明:【issues\/8709】LayoutContent样式多出1px\n\s+\/\/ margin-left: 1px;\n\n\s+\/\/ 【JEECG作为乾坤子应用】根 Layout 作为 absolute 定位的参照容器\n\s+\}\n\n\s+\}\n/,
      replace: '    }\n',
      desc: '修复 index.vue CSS 多余闭合括号',
    },
  ]);

  patchFile('src/layouts/default/sider/LayoutSider.vue', [
    { search: /\[\`\$\{prefixCls\}--qiankun-micro`\]: glob\.isQiankunMicro,\n/, replace: '', desc: '移除 sider qiankun CSS 类名' },
    { search: /    &--qiankun-micro \{[\s\S]*?\}\n/, replace: '', desc: '移除 sider qiankun CSS 样式块' },
  ]);

  patchFile('src/layouts/default/header/index.vue', [
    { search: /\[\`\$\{prefixCls\}--qiankun-micro`\]: isQiankunMicro,\n/, replace: '', desc: '移除 header qiankun CSS 类名' },
    {
      search: /            \[`\$\{prefixCls\}--\$\{theme\}`\]: theme,\n\s+\/\/ 【JEECG作为乾坤子应用】\n\s+\},\n/,
      replace: '            [`${prefixCls}--${theme}`]: theme,\n          },\n',
      desc: '修复 header index.vue qiankun 注释残留',
    },
    {
      search: "      const { title, isQiankunMicro } = useGlobSetting();\n",
      replace: "      const { title } = useGlobSetting();\n",
      desc: '移除 header index.vue isQiankunMicro 解构',
    },
  ]);

  patchFile('src/layouts/default/header/MultipleHeader.vue', [
    { search: /\[\`\$\{prefixCls\}--qiankun-micro`\]: glob\.isQiankunMicro,\n/, replace: '', desc: '移除 MultipleHeader qiankun CSS 类名' },
    {
      search: /          \[`\$\{prefixCls\}--fixed`\]: unref\(getIsFixed\),\n\s+\/\/ 【JEECG作为乾坤子应用】\n\s+\}\];\n/,
      replace: '          [`${prefixCls}--fixed`]: unref(getIsFixed),\n        }];\n',
      desc: '修复 MultipleHeader qiankun 注释残留',
    },
    {
      search: /    \/\/ 【JEECG作为乾坤子应用】\n\s+\}\n\n\s+\}\n<\/style>/,
      replace: '  }\n</style>',
      desc: '修复 MultipleHeader CSS 多余闭合括号',
    },
  ]);

  patchFile('src/utils/http/axios/index.ts', [
    {
      search: /    \/\/ 代码逻辑说明: 【JEECG作为乾坤子应用】作为乾坤子应用启动时，拼接请求路径\n\s+if \(globSetting\.isQiankunMicro\) \{\n\s+if \(config\.url && config\.url\.startsWith\('\/'\)\) \{\n\s+config\.url = globSetting\.qiankunMicroAppEntry \+ config\.url\n\s+\}\n\s+\}\n\n/,
      replace: '',
      desc: '移除 axios qiankun 请求路径拼接逻辑',
    },
  ]);

  patchFile('src/hooks/setting/index.ts', [
    { search: "    // 【JEECG作为乾坤子应用】\n    VITE_GLOB_QIANKUN_MICRO_APP_NAME,\n    VITE_GLOB_QIANKUN_MICRO_APP_ENTRY,\n", replace: '', desc: '移除 qiankun 环境变量解构' },
    { search: "    // 【JEECG作为乾坤子应用】是否以乾坤子应用模式启动\n    isQiankunMicro: VITE_GLOB_QIANKUN_MICRO_APP_NAME != null && VITE_GLOB_QIANKUN_MICRO_APP_NAME !== '',\n    // 【JEECG作为乾坤子应用】乾坤子应用入口\n    qiankunMicroAppEntry: VITE_GLOB_QIANKUN_MICRO_APP_ENTRY,\n", replace: '', desc: '移除 qiankun 配置属性' },
  ]);

  const pkg = readPackageJson();
  if (pkg?.devDependencies?.['vite-plugin-qiankun']) {
    delete pkg.devDependencies['vite-plugin-qiankun'];
    writePackageJson(pkg);
    info('已从 package.json 删除 vite-plugin-qiankun');
  }

  info('qiankun 微前端模块已完全清理');
}
