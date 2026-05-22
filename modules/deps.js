import { step, info, warn, readPackageJson, writePackageJson } from '../lib/utils.js';
import { multiSelect } from '../lib/prompt.js';

export async function run() {
  step('清理冗余依赖');

  const safeRemove = { dependencies: ['codemirror'], devDependencies: ['@types/codemirror'] };
  const optionalDeps = {
    dependencies: {
      'intro.js': '用户引导，仅demo+online表单',
      'emoji-mart-vue-fast': '表情选择器，仅评论/消息',
      'showdown': 'Markdown查看器',
      'vue-grid-layout-v3': '拖拽布局，未找到引用',
      'lunar-javascript': '农历，未找到引用',
      'perfect-scrollbar': '滚动条，未找到引用',
      'vue-color': '颜色选择器，未找到引用',
      'vue-infinite-scroll': '无限滚动，未找到引用',
      'print-js': '打印，仅demo',
      'vue-print-nb-jeecg': '打印，仅demo',
      'swagger-ui-dist': 'Swagger文档',
    },
    devDependencies: {
      '@types/intro.js': 'intro.js类型',
      '@types/showdown': 'showdown类型',
    },
  };

  const pkg = readPackageJson();
  if (!pkg) { warn('package.json 不存在'); return; }

  for (const dep of safeRemove.dependencies) {
    if (pkg.dependencies?.[dep]) { delete pkg.dependencies[dep]; info(`安全删除: ${dep}`); }
  }
  for (const dep of safeRemove.devDependencies) {
    if (pkg.devDependencies?.[dep]) { delete pkg.devDependencies[dep]; info(`安全删除: ${dep}`); }
  }

  const options = [];
  for (const [k, v] of Object.entries(optionalDeps.dependencies)) {
    if (pkg.dependencies?.[k]) options.push({ value: k, label: k, desc: v });
  }
  for (const [k, v] of Object.entries(optionalDeps.devDependencies)) {
    if (pkg.devDependencies?.[k]) options.push({ value: k, label: k, desc: v });
  }

  if (options.length > 0) {
    const selected = await multiSelect('选择要删除的可选依赖', options);
    for (const dep of selected) {
      if (pkg.dependencies?.[dep]) { delete pkg.dependencies[dep]; info(`已删除: ${dep}`); }
      if (pkg.devDependencies?.[dep]) { delete pkg.devDependencies[dep]; info(`已删除: ${dep}`); }
    }
  }

  writePackageJson(pkg);
}
