import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { getToken } from '../utils/config.js';
import chalk from 'chalk';
import mime from 'mime-types'; // ✅ for MIME detection

export async function pullRepo(repoName) {
  const token = await getToken();
  if (!token) {
    console.log(chalk.red('❌ You must be logged in.'));
    return;
  }

  const res = await fetch(`http://localhost:5000/repo/${repoName}/pull`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    const errorText = await res.text();
    console.log(chalk.red('❌ Pull failed:'), errorText);
    return;
  }

  if (!res.ok) {
    console.log(chalk.red('❌ Pull failed:'), data.message || JSON.stringify(data));
    return;
  }

  const latestCommit = data.commits?.[data.commits.length - 1];
  if (!latestCommit) {
    console.log(chalk.yellow('⚠️ No commits found in repo.'));
    return;
  }

  const grootPath = path.join(process.cwd(), '.groot');
  const objectsPath = path.join(grootPath, 'objects');
  await fs.mkdir(objectsPath, { recursive: true });

  for (const file of latestCommit.files) {
    if (!file.content) {
      console.log(chalk.red(`❌ Missing content for file: ${file.path}`));
      continue;
    }

    // Always decode and write as buffer to preserve exact file bytes
    const buffer = Buffer.from(file.content, 'base64');
    await fs.writeFile(file.path, buffer);

    console.log(chalk.green(`✅ Pulled file: ${file.path}`));
  }

  const commitHash = latestCommit.hash;
  await fs.writeFile(path.join(objectsPath, commitHash), JSON.stringify(latestCommit));
  await fs.writeFile(path.join(grootPath, 'HEAD'), commitHash);

  console.log(chalk.green(`📦 Pulled latest commit: ${commitHash}`));
}
