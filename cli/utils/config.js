import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const configPath = path.join(os.homedir(), '.groot_config.json');

export async function saveToken(token) {
  await fs.writeFile(configPath, JSON.stringify({ token }));
}

export async function getToken() {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data).token;
  } catch (e) {
    return null;
  }
}
