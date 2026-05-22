import { removeDir, removeFile, removeEmptyDir, step, info, warn, patchFile } from '../lib/utils.js';

export async function run() {
  step('精简 Demo 示例代码');

  const viewDirs = [
    ['src/views/demo/feat', '功能示例'],
    ['src/views/demo/form', '表单示例'],
    ['src/views/demo/charts', '图表示例'],
    ['src/views/demo/codemirror', '代码编辑器示例'],
    ['src/views/demo/comp', '组件示例'],
    ['src/views/demo/document', '文档示例'],
    ['src/views/demo/editor', '编辑器示例'],
    ['src/views/demo/level', '多级菜单示例'],
    ['src/views/demo/main-out', '外页示例'],
    ['src/views/demo/permission', '权限示例'],
    ['src/views/demo/setup', '引导页示例'],
    ['src/views/demo/system', '系统管理示例'],
    ['src/views/demo/table', '表格示例'],
    ['src/views/demo/tree', '树组件示例'],
    ['src/views/demo/page', '页面示例'],
    ['src/views/demo/jeecg', 'Jeecg组件示例'],
    ['src/views/report', '报表示例'],
  ];
  for (const [d, desc] of viewDirs) removeDir(d, desc);
  removeEmptyDir('src/views/demo');

  const routeFiles = [
    ['src/router/routes/modules/demo/charts.ts', '图表路由'],
    ['src/router/routes/modules/demo/comp.ts', '组件路由'],
    ['src/router/routes/modules/demo/feat.ts', '功能路由'],
    ['src/router/routes/modules/demo/iframe.ts', 'iframe路由'],
    ['src/router/routes/modules/demo/level.ts', '多级菜单路由'],
    ['src/router/routes/modules/demo/page.ts', '页面路由'],
    ['src/router/routes/modules/demo/permission.ts', '权限路由'],
    ['src/router/routes/modules/demo/setup.ts', '引导页路由'],
    ['src/router/routes/modules/demo/system.ts', '系统路由'],
  ];
  for (const [f, desc] of routeFiles) removeFile(f, desc);
  removeEmptyDir('src/router/routes/modules/demo');

  patchFile('src/router/routes/mainOut.ts', [
    {
      search: /import type \{ AppRouteModule \} from '\/#\/router\/types';\n\n\/\/ test\n\/\/ http:ip:port\/main-out\nexport const mainOutRoutes: AppRouteModule\[\] = \[[\s\S]*?\];\n\nexport const mainOutRouteNames = mainOutRoutes\.map\(\(item\) => item\.name\);/,
      replace: `import type { AppRouteModule } from '/#/router/types';\n\nexport const mainOutRoutes: AppRouteModule[] = [];\n\nexport const mainOutRouteNames: string[] = [];`,
      desc: '清空 mainOut 路由（引用已删除的Demo页面）',
    },
  ]);

  removeDir('src/api/demo', 'Demo API接口');
  removeDir('mock/demo', 'Demo Mock数据');
  removeFile('src/locales/lang/zh-CN/routes/demo.ts', '中文Demo语言');
  removeFile('src/locales/lang/en/routes/demo.ts', '英文Demo语言');
  removeFile('src/assets/images/demo.png', 'Demo图片');
}
