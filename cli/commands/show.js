import Groot from '../core/Groot.js';

export default async function show(commitHash) {
  const groot = new Groot();
  await groot.showCommitDiff(commitHash);
}