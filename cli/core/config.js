import path from 'path';
import fs from 'fs/promises';

const CONFIG_PATH = path.join('.groot', 'config.json');

export async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function setConfig(newValues) {
  const current = await getConfig();
  const updated = { ...current, ...newValues };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(updated, null, 2));
}

export async function getRemoteUrl() {
  const config = await getConfig();
  return config.remoteUrl;
}

export async function getAuthToken() {
  const config = await getConfig();
  return config.token;
}