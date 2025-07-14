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

  const latestCommit = data.commits?.[0];
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

    let buffer = Buffer.from(file.content, 'base64'); // ✅ decode
    if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
      buffer = buffer.slice(3); // ✅ strip BOM if present
    }

    const objectPath = path.join(objectsPath, file.hash);
    await fs.writeFile(objectPath, buffer); // save in .groot/objects

    // Detect if it's a text file
    const mimeType = mime.lookup(file.path);
    const isText = mimeType && mimeType.startsWith('text/');

    if (isText) {
      await fs.writeFile(file.path, buffer.toString('utf-8')); // text: decode to string
    } else {
      await fs.writeFile(file.path, buffer); // binary: write as-is
    }

    console.log(chalk.green(`✅ Pulled file: ${file.path}`));
  }

  const commitHash = latestCommit.hash;
  await fs.writeFile(path.join(objectsPath, commitHash), JSON.stringify(latestCommit));
  await fs.writeFile(path.join(grootPath, 'HEAD'), commitHash);

  console.log(chalk.green(`📦 Pulled latest commit: ${commitHash}`));
}
