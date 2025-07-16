import path from 'path';
import fs from 'fs/promises';
import { diffLines } from 'diff';
import chalk from 'chalk';
import { hashObject } from '../utils/hash.js';

class Groot {
  constructor(repoPath = '.') {
    this.repoPath = path.join(repoPath, '.groot');
    this.ObjectsPath = path.join(this.repoPath, 'objects');
    this.headPath = path.join(this.repoPath, 'HEAD');
    this.indexPath = path.join(this.repoPath, 'index');
    this.init();
  }

  async init() {
    await fs.mkdir(this.ObjectsPath, { recursive: true });
    try {
      await fs.writeFile(this.headPath, '', { flag: 'wx' });
      await fs.writeFile(this.indexPath, JSON.stringify([]), { flag: 'wx' });
      process.stdout.write(chalk.green('Initialised Empty v0_version_repo'));
    } catch {
      console.log('Already initialised the .groot folder');
    }
  }

  async add(fileToBeAdded) {
   let fileData = await fs.readFile(fileToBeAdded);
if (fileData[0] === 0xef && fileData[1] === 0xbb && fileData[2] === 0xbf) {
  fileData = fileData.slice(3); // Remove UTF-8 BOM
}
// ✅ Buffer
    const fileHash = hashObject(fileData);
    const newFilePath = path.join(this.ObjectsPath, fileHash);
    await fs.writeFile(newFilePath, fileData); // ✅ Save as binary
    await this.updateStagingArea(fileToBeAdded, fileHash);
    process.stdout.write(chalk.green('Added ' + fileToBeAdded));
  }

  async updateStagingArea(filePath, fileHash) {
    const index = JSON.parse(await fs.readFile(this.indexPath, 'utf-8'));
    index.push({ path: filePath, hash: fileHash });
    await fs.writeFile(this.indexPath, JSON.stringify(index));
  }

  async commit(message) {
    const index = JSON.parse(await fs.readFile(this.indexPath, 'utf-8'));
    const parentCommit = await this.getCurrentHead();

    const commitData = {
      timeStamp: new Date().toString(),
      message,
      files: index,
      parent: parentCommit
    };

    const commitHash = hashObject(JSON.stringify(commitData));
    const commitPath = path.join(this.ObjectsPath, commitHash);
    await fs.writeFile(commitPath, JSON.stringify(commitData)); // ✅ Save as string (JSON)
    await fs.writeFile(this.headPath, commitHash);
    await fs.writeFile(this.indexPath, JSON.stringify([]));
    process.stdout.write(chalk.yellow('Commit successfully created ' + commitHash));
  }

  async getCurrentHead() {
    try {
      return (await fs.readFile(this.headPath, 'utf-8')).trim();
    } catch {
      return null;
    }
  }

  async log() {
    let currentCommitHash = await this.getCurrentHead();
    while (currentCommitHash) {
      const commitData = JSON.parse(await fs.readFile(path.join(this.ObjectsPath, currentCommitHash), 'utf-8'));
      process.stdout.write(
        chalk.blueBright(
          `Commit: ${currentCommitHash}\nDate: ${commitData.timeStamp}\n\n${commitData.message}\n\n`
        )
      );
      currentCommitHash = commitData.parent;
    }
  }

  async showCommitDiff(commitHash) {
    const commitData = JSON.parse(await this.getCommitData(commitHash));
    if (!commitData) return console.log('Commit not found');

    console.log('Changes in the last commit are:');
    for (const file of commitData.files) {
      console.log(`File: ${file.path}`);
      const fileContentBuf = await this.getFileContent(file.hash);
      const fileContent = fileContentBuf.toString('utf-8'); // ✅ For diff display only

      if (commitData.parent) {
        const parentCommitData = JSON.parse(await this.getCommitData(commitData.parent));
        const parentContentBuf = await this.getParentFileContent(parentCommitData, file.path);
        const parentContent = parentContentBuf?.toString('utf-8');

        if (parentContent !== undefined) {
          const diff = diffLines(parentContent, fileContent);
          diff.forEach(part => {
            if (part.added) process.stdout.write(chalk.green('++' + part.value));
            else if (part.removed) process.stdout.write(chalk.red('--' + part.value));
            else process.stdout.write(chalk.grey(part.value));
          });
        } else {
          process.stdout.write(chalk.green('New file in this commit'));
        }
      } else {
        process.stdout.write(chalk.bgYellowBright('First commit'));
      }
    }
  }

  async getParentFileContent(parentCommitData, filePath) {
    const parentFile = parentCommitData.files.find(f => f.path === filePath);
    if (parentFile) return await this.getFileContent(parentFile.hash);
  }

  async getCommitData(commitHash) {
    const commitPath = path.join(this.ObjectsPath, commitHash);
    try {
      return await fs.readFile(commitPath, 'utf-8');
    } catch (error) {
      console.log('Failed to read commit data', error);
      return null;
    }
  }

  async getFileContent(fileHash) {
    const objectPath = path.join(this.ObjectsPath, fileHash);
    return await fs.readFile(objectPath); // ✅ Always return Buffer
  }
}


export default Groot;
