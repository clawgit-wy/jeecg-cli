import { createInterface } from 'readline';
import { colors } from './utils.js';

const { CYAN, YELLOW, BOLD, DIM, RESET } = colors;

const rl = createInterface({ input: process.stdin, output: process.stdout });

export function ask(question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

export async function select(title, options) {
  console.log(`\n${CYAN}${title}${RESET}`);
  options.forEach((o, i) => console.log(`  ${YELLOW}${i + 1}${RESET}) ${o.label} ${DIM}${o.desc || ''}${RESET}`));
  const answer = await ask(`${BOLD}请选择 [1-${options.length}]: ${RESET}`);
  const idx = parseInt(answer) - 1;
  if (idx >= 0 && idx < options.length) return options[idx].value;
  return options[0].value;
}

export async function multiSelect(title, options) {
  console.log(`\n${CYAN}${title}${RESET}`);
  console.log(`${DIM}  输入编号，逗号分隔 (如 1,3,5)，a=全选，n=全不选${RESET}`);
  options.forEach((o, i) => console.log(`  ${YELLOW}${i + 1}${RESET}) ${o.label} ${DIM}${o.desc || ''}${RESET}`));
  const answer = await ask(`${BOLD}请选择: ${RESET}`);
  if (answer.toLowerCase() === 'n') return [];
  if (answer.toLowerCase() === 'a') return options.map((o) => o.value);
  const selected = answer.split(/[,\s]+/).map((s) => parseInt(s) - 1).filter((i) => i >= 0 && i < options.length);
  return [...new Set(selected)].map((i) => options[i].value);
}

export async function confirm(msg, defaultYes = true) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = await ask(`${BOLD}${msg} (${hint}): ${RESET}`);
  if (!answer) return defaultYes;
  return answer.toLowerCase() === 'y';
}

export function closeRl() { rl.close(); }
