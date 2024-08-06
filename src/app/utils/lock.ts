import redisClient from './redis';
const prefix = 'mutex.';

const generateKey = (name: string): string => {
  return prefix + name;
}

export const lock = async (name: string, timeout: number): Promise<() => void> => {
  if (!name) {
    throw new Error('Please select a name for your lock');
  }
  const key = generateKey(name);
  const val = await redisClient.incr(key);
  const is_locked = val > 1;

  if (is_locked) {
    throw new Error('LOCK_EXISTS');
  }

  await redisClient.pexpire(key, timeout);

  const _delete = async () => {
    await redisClient.del(key);
  }

  return _delete;
};
