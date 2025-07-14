import Groot from '../core/Groot.js';

export default async function commit(message) {
  const groot = new Groot();
  await groot.commit(message);
}