import { readFile, writeFile } from 'node:fs/promises';
import { CacheEntry } from './types.js';
import { existsSync } from 'node:fs';

export const writeToCache = async (content: string): Promise<void> =>
  await writeFile('./cache.json', content);

export const readCache = async (): Promise<{ lastEntries: CacheEntry[] }> =>
  JSON.parse(
    existsSync('./cache.json')
      ? await readFile('./cache.json', 'utf8')
      : '{"lastEntries": []}'
  ) as {
    lastEntries: CacheEntry[];
  };
