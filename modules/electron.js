import { removeDir, removeFile, step, info, patchFile } from '../lib/utils.js';

export async function run() {
  step('精简 Electron 桌面端');

  removeDir('electron', 'Electron构建目录');
  removeDir('src/electron', 'Electron源码目录');
  removeFile('electron-builder.yaml', 'Electron构建配置');
  removeFile('electron.md', 'Electron文档');
  removeFile('.env.prod_electron', 'Electron环境配置');
  removeFile('build/vite/plugin/electron.ts', 'Electron Vite插件');

  patchFile('src/main.ts', [
    { search: /import\s*\{[^}]*setupElectron[^}]*\}\s*from\s*["']@\/electron["'];?\n?/g, replace: '', desc: '移除 Electron import' },
    { search: /\s*setupElectron\(app\)\n?/, replace: '', desc: '移除 setupElectron() 调用' },
  ]);

  patchFile('src/router/index.ts', [
    {
      search: /import\s*\{\s*\$electron\s*\}\s*from\s*["']@\/electron["'];?\n/,
      replace: "import { useGlobSetting } from '/@/hooks/setting';\n",
      desc: '替换 $electron import 为 useGlobSetting',
    },
    {
      search: '    $electron.isElectron(),\n',
      replace: '    useGlobSetting().isElectronPlatform,\n',
      desc: '替换 $electron.isElectron() 为 useGlobSetting().isElectronPlatform',
    },
  ]);

  patchFile('src/utils/common/compUtils.ts', [
    {
      search: /import\s*\{\s*\$electron\s*\}\s*from\s*["']@\/electron["'];?\n/,
      replace: "import { useGlobSetting } from '/@/hooks/setting';\n",
      desc: '替换 compUtils $electron import',
    },
    {
      search: 'if (url && $electron.isElectron())',
      replace: 'if (url && useGlobSetting().isElectronPlatform)',
      desc: '替换 compUtils $electron.isElectron()',
    },
  ]);

  patchFile('src/components/Markdown/src/Markdown.vue', [
    {
      search: /import\s*\{\s*\$electron\s*\}\s*from\s*["']@\/electron["'];?\n/,
      replace: "import { useGlobSetting } from '/@/hooks/setting';\n",
      desc: '替换 Markdown $electron import',
    },
    {
      search: 'if ($electron.isElectron())',
      replace: 'if (useGlobSetting().isElectronPlatform)',
      desc: '替换 Markdown $electron.isElectron()',
    },
  ]);

  patchFile('src/views/monitor/mynews/DetailModal.vue', [
    {
      search: /import\s*\{\s*\$electron\s*\}\s*from\s*["']@\/electron["'];?\n/,
      replace: "import { useGlobSetting } from '/@/hooks/setting';\n",
      desc: '替换 mynews DetailModal $electron import',
    },
    {
      search: 'if($electron.isElectron())',
      replace: 'if(useGlobSetting().isElectronPlatform)',
      desc: '替换 mynews DetailModal $electron.isElectron()',
    },
  ]);

  patchFile('src/views/system/notice/DetailModal.vue', [
    {
      search: /import\s*\{\s*\$electron\s*\}\s*from\s*["']@\/electron["'];?\n/,
      replace: "import { useGlobSetting } from '/@/hooks/setting';\n",
      desc: '替换 notice DetailModal $electron import',
    },
    {
      search: 'if($electron.isElectron())',
      replace: 'if(useGlobSetting().isElectronPlatform)',
      desc: '替换 notice DetailModal $electron.isElectron()',
    },
  ]);
}
