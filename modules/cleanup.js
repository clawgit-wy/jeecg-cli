import { removeDir, step, info } from '../lib/utils.js';

export async function run() {
  step('冗余组件清理');
  removeDir('src/components/Tree_backup', 'Tree备份组件');
}
