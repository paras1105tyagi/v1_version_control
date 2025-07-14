import Groot from '../core/Groot.js';

export default async function log() {
  const groot = new Groot();
  await groot.log();
}