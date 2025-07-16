import { logoutToken } from '../utils/config.js';
import chalk from 'chalk';

export default async function logout() {
  await logoutToken();
  console.log(chalk.green('✅ Logged out successfully.'));
} 