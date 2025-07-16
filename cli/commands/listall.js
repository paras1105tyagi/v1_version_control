import { getToken } from '../utils/config.js';
import chalk from 'chalk';
import fetch from 'node-fetch';

export default async function listAll() {
  const token = await getToken();
  if (!token) {
    console.log(chalk.red('❌ You must be logged in.'));
    return;
  }

  const res = await fetch('http://localhost:5000/repo/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    const errorText = await res.text();
    console.log(chalk.red('❌ List failed:'), errorText);
    return;
  }

  if (!res.ok) {
    console.log(chalk.red('❌ List failed:'), data.message || JSON.stringify(data));
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.log(chalk.yellow('⚠️ No repos found.'));
    return;
  }

  console.log(chalk.green('Your repositories:'));
  data.forEach(repo => {
    console.log(`- ${repo.name} (id: ${repo._id})`);
  });
} 