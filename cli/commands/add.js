import Groot from '../core/Groot.js';

export default async function add(file) {
  const groot = new Groot();
  await groot.add(file);
}