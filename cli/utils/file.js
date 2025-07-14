
import fs from 'fs/promises';

export async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function readJSON(path) {
  const data = await fs.readFile(path, 'utf-8');
  return JSON.parse(data);
}

export async function writeJSON(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}
