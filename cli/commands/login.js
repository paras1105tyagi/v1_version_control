import readline from 'readline';
import fetch from 'node-fetch';
import { saveToken } from '../utils/config.js';
import chalk from 'chalk';

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (input) => {
      rl.close();
      resolve(input);
    });
  });
}

export async function login() {
  const username = await prompt('Username: ');
  const password = await prompt('Password: ');

  const res = await fetch('https://v1-version-control.onrender.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    await saveToken(data.token);
    console.log(chalk.green('✅ Logged in successfully.'));
  } else {
    console.log(chalk.red('❌ Login failed:'), data.error);
  }
}
