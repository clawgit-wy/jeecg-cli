#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 解析 --cwd 参数，并将目标项目目录通过环境变量注入到 utils.js
// 这一步必须放在 import('../index.js') 之前，因为 utils.js 中 ROOT 是模块加载时立刻求值的
const args = process.argv.slice(2);
const cwdIndex = args.indexOf('--cwd');
if (cwdIndex !== -1 && args[cwdIndex + 1]) {
  process.env.JEECG_CLI_CWD = resolve(args[cwdIndex + 1]);
  // 从 argv 中剔除 --cwd 及其值，避免影响后续 parseArgs
  process.argv.splice(2 + cwdIndex, 2);
} else {
  process.env.JEECG_CLI_CWD = process.cwd();
}

import(join(__dirname, '..', 'index.js'));
