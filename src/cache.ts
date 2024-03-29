import { readFile, writeFile } from 'node:fs/promises';
import { CacheEntry } from './types.js';

export const writeToCache = async (content: string) =>
  await writeFile('./cache.json', content);

export const readCache = async (): Promise<{ lastEntries: CacheEntry[] }> =>
  JSON.parse(await readFile('./cache.json', 'utf-8')) as {
    lastEntries: CacheEntry[];
  };
