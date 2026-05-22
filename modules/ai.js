import { removeDir, removeFile, removeEmptyDir, step, info, patchFile, readPackageJson, writePackageJson } from '../lib/utils.js';

export async function run() {
  step('精简 AI 功能模块');

  const aiDirs = [
    ['src/views/super/airag/aiapp', 'AI应用'],
    ['src/views/super/airag/aicloth', 'AI换衣'],
    ['src/views/super/airag/aiknowledge', 'AI知识库'],
    ['src/views/super/airag/aimcp', 'AI MCP'],
    ['src/views/super/airag/aimodel', 'AI模型'],
    ['src/views/super/airag/aiposter', 'AI海报'],
    ['src/views/super/airag/aiprompts', 'AI提示词'],
    ['src/views/super/airag/aivideo', 'AI视频'],
    ['src/views/super/airag/aivideo2', 'AI视频2'],
    ['src/views/super/airag/aivoice', 'AI语音'],
    ['src/views/super/airag/aiwriter', 'AI写作'],
    ['src/views/super/airag/ocr', 'AI OCR'],
    ['src/views/super/airag/wordtpl', 'AI文档模板'],
  ];
  for (const [d, desc] of aiDirs) removeDir(d, desc);
  removeEmptyDir('src/views/super/airag');

  removeDir('src/views/dashboard/ai', 'AI仪表盘');

  removeFile('src/assets/images/ai/aiflow.png', 'AI Flow图片');
  removeFile('src/assets/images/ai/avatar.jpg', 'AI头像');
  removeEmptyDir('src/assets/images/ai');

  patchFile('src/layouts/default/header/index.vue', [
    {
      search: '  import Aide from "@/views/dashboard/ai/components/aide/index.vue"\n',
      replace: '',
      desc: '移除 header AI Aide 组件 import',
    },
    {
      search: '      <!-- ai助手 -->\n      <Aide v-if="getAiIconShow"></Aide>\n',
      replace: '',
      desc: '移除 header AI Aide 组件模板',
    },
    {
      search: '      Aide\n',
      replace: '',
      desc: '移除 header AI Aide 组件注册',
    },
    {
      search: 'getAiIconShow, ',
      replace: '',
      desc: '移除 getAiIconShow 解构 (前面)',
    },
    {
      search: ', getAiIconShow',
      replace: '',
      desc: '移除 getAiIconShow 解构 (后面)',
    },
    {
      search: '        getAiIconShow\n',
      replace: '',
      desc: '移除 getAiIconShow return 属性',
    },
  ]);

  patchFile('src/layouts/default/tabs/index.vue', [
    {
      search: '  import Aide from "/@/views/dashboard/ai/components/aide/index.vue"\n',
      replace: '',
      desc: '移除 tabs AI Aide 组件 import',
    },
    {
      search: '      Aide,\n',
      replace: '',
      desc: '移除 tabs AI Aide 组件注册',
    },
    {
      search: /          <router-link v-if="!getIsSimpleTheme" to="\/ai" class="ai-icon">[\s\S]*?<\/router-link>\n/,
      replace: '',
      desc: '移除 tabs AI 图标链接',
    },
    {
      search: /          <!-- <TabContent isExtra :tabItem="\$route" v-if="getShowQuick" \/> -->\n          <!-- 列表页全屏 \n          <FoldButton v-if="getShowFold" \/>-->\n          <!-- <FullscreenOutlined \/-> -->\n/,
      replace: '',
      desc: '移除 tabs 注释代码',
    },
    {
      search: /    \.ai-icon \{[\s\S]*?\}\n/,
      replace: '',
      desc: '移除 tabs .ai-icon CSS 样式',
    },
    {
      search: '        getIsSimpleTheme,\n',
      replace: '',
      desc: '移除 tabs getIsSimpleTheme return 属性',
    },
    {
      search: /      \/\/ 极简模式隐藏标签栏AI入口图标\n      const getIsSimpleTheme = computed\(\(\) => unref\(getTabsTheme\) === TabsThemeEnum\.SIMPLE\);\n\n/,
      replace: '',
      desc: '移除 tabs getIsSimpleTheme 计算属性',
    },
  ]);

  patchFile('src/router/routes/staticRouter.ts', [
    {
      search: /import type \{ AppRouteRecordRaw \} from '\/@\/router\/types';\nimport \{ LAYOUT \} from '\/@\/router\/constant';\n\nexport const AI_ROUTE[\s\S]*?export const staticRoutesList = \[AI_ROUTE\];/,
      replace: "import type { AppRouteRecordRaw } from '/@/router/types';\n\nexport const staticRoutesList: AppRouteRecordRaw[] = [];",
      desc: '清空 staticRouter.ts AI 路由',
    },
  ]);

  patchFile('src/utils/monorepo/registerPackages.ts', [
    {
      search: "  { name: '@jeecg/aiflow', importer: () => import('@jeecg/aiflow') },\n",
      replace: '',
      desc: '移除 @jeecg/aiflow 懒加载配置',
    },
  ]);

  const pkg = readPackageJson();
  if (pkg) {
    const aiDeps = ['@jeecg/aiflow', '@logicflow/core', '@logicflow/extension', '@logicflow/vue-node-registry'];
    const removed = [];
    for (const dep of aiDeps) {
      if (pkg.dependencies?.[dep]) { delete pkg.dependencies[dep]; removed.push(dep); }
    }
    if (removed.length > 0) {
      writePackageJson(pkg);
      info(`已删除 AI 依赖: ${removed.join(', ')}`);
    }
  }
}
