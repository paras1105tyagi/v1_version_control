import crypto from 'crypto';

export function hashObject(content) {
  return crypto.createHash('sha1').update(content, 'utf-8').digest('hex');
}
