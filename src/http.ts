import { load } from 'cheerio';
import Turndown from 'turndown';
import { CacheEntry } from './types.js';

export const getLatestAlerts: () => Promise<CacheEntry[]> = async () => {
  const res = await fetch('https://lwsd.org');
  const html = await res.text();
  const $ = load(html);

  const alerts: { title: string; content: string }[] = [];
  $('.fsPagePop').each((i, el) => {
    const title = $(el).find('.fsPagePopTitle').text();
    const content = $(el).find('.fsPagePopMessage').html();
    alerts.push({
      title,
      content: new Turndown().turndown(content ?? '(no content found)'),
    });
  });
  return alerts;
};
