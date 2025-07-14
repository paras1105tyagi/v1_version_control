// 📁 cli/utils/diff.js
import { diffLines } from 'diff';
import chalk from 'chalk';

export function formatDiff(oldContent, newContent) {
  const diff = diffLines(oldContent, newContent);
  return diff.map(part => {
    if (part.added) return chalk.green(`++ ${part.value}`);
    if (part.removed) return chalk.red(`-- ${part.value}`);
    return chalk.gray(part.value);
  }).join('');
}
