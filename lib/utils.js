import fs from 'fs';
import path from 'path';

// 全局 npm 包模式：ROOT 指向用户执行命令的项目目录（可被 --cwd 参数覆盖）
// 通过环境变量 JEECG_CLI_CWD 由入口注入，避免在 import 时被静态求值
function resolveRoot() {
  return process.env.JEECG_CLI_CWD
    ? path.resolve(process.env.JEECG_CLI_CWD)
    : process.cwd();
}

export const ROOT = resolveRoot();
export const stats = { removed: 0, skipped: 0, modified: 0 };

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

export const colors = { RESET, RED, GREEN, YELLOW, BLUE, CYAN, BOLD, DIM };

export function log(tag, color, msg) {
  console.log(`${color}[${tag}]${RESET} ${msg}`);
}
export const info = (m) => log('INFO', GREEN, m);
export const warn = (m) => log('WARN', YELLOW, m);
export const error = (m) => log('ERR ', RED, m);
export const step = (m) => console.log(`\n${BLUE}${'='.repeat(50)}${RESET}\n${BLUE}  ${m}${RESET}\n${BLUE}${'='.repeat(50)}${RESET}`);

export function removeDir(dir, desc) {
  const full = path.join(ROOT, dir);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    info(`已删除: ${desc} (${dir})`);
    stats.removed++;
  } else {
    stats.skipped++;
  }
}

export function removeFile(file, desc) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { force: true });
    info(`已删除: ${desc} (${file})`);
    stats.removed++;
  } else {
    stats.skipped++;
  }
}

export function readFile(file) {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf-8') : null;
}

export function writeFile(file, content) {
  const full = path.join(ROOT, file);
  fs.writeFileSync(full, content, 'utf-8');
  info(`已修改: ${file}`);
  stats.modified++;
}

export function patchFile(file, replacements) {
  let content = readFile(file);
  if (!content) { stats.skipped++; return; }
  let changed = false;
  for (const { search, replace, desc } of replacements) {
    const isMatch = search instanceof RegExp ? search.test(content) : content.includes(search);
    if (isMatch) {
      content = content.replace(search, replace);
      changed = true;
      if (desc) info(`  ${desc}`);
    }
  }
  if (changed) writeFile(file, content);
  else warn(`无需修改: ${file}`);
}

export function readPackageJson() {
  const content = readFile('package.json');
  return content ? JSON.parse(content) : null;
}

export function writePackageJson(pkg) {
  writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n');
}

export function removeEmptyDir(dir) {
  const full = path.join(ROOT, dir);
  if (fs.existsSync(full) && fs.readdirSync(full).length === 0) {
    fs.rmdirSync(full);
    info(`已删除空目录: ${dir}`);
  }
}
