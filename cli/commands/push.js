import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { getToken } from '../utils/config.js';
import chalk from 'chalk';

export async function pushRepo(repoName) {
  const token = await getToken();
  if (!token) {
    console.log(chalk.red('❌ You must be logged in.'));
    return;
  }

  
  const grootPath = path.join(process.cwd(), '.groot');
  const objectsPath = path.join(grootPath, 'objects');
  const headPath = path.join(grootPath, 'HEAD');

  const head = (await fs.readFile(headPath, 'utf-8')).trim();
  const commitData = await fs.readFile(path.join(objectsPath, head), 'utf-8');
  const commit = JSON.parse(commitData);

  const files = [];

 for (const file of commit.files) {
  const absolutePath = path.resolve(file.path); // ✅ always get actual file content
  const buffer = await fs.readFile(absolutePath); // read from working directory
  files.push({
    path: file.path,
    hash: file.hash,
    content: buffer.toString('base64')  // base64 encode original file
  });
}

  const payload = {
    commit: {
      hash: head,
      message: commit.message,
      timeStamp: commit.timeStamp,
      parent: commit.parent,
      files: commit.files
    },
    files
  };

  try {
    const res = await fetch(`https://v1-version-control.onrender.com/repo/${repoName}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      console.log(chalk.green(`✅ Pushed to repo: ${repoName}`));
    } else {
      console.log(chalk.red('❌ Push failed:'), data.message);
    }
  } catch (err) {
    console.log(chalk.red('❌ Network or server error:'), err.message);
  }
}
