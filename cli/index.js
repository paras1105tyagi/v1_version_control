#!/usr/bin/env node

import  {pushRepo } from './commands/push.js';
import { pullRepo } from './commands/pull.js';
import { Command } from 'commander';
import init from './commands/init.js';
import add from './commands/add.js';
import commit from './commands/commit.js';
import log from './commands/log.js';
import show from './commands/show.js';
import { login } from './commands/login.js';


const program = new Command();

program.command('init').action(init);
program.command('add <file>').action(add);
program.command('commit <message>').action(commit);
program.command('log').action(log);
program.command('show <commitHash>').action(show);
program.command('push <repo>').action(async (repo) => {
  await pushRepo(repo);
});

program.command('pull <repo>').action(async (repo) => {
  await pullRepo(repo);
});
program
  .command('login')
  .description('Login to Groot backend')
  .action(async () => {
    await login();
  });

  
program.parse(process.argv);