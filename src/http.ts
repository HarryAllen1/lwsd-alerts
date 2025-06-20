import { load } from 'cheerio';
import Turndown from 'turndown';
import { CacheEntry } from './types.js';

const turndown = new Turndown({
  headingStyle: 'atx',
  hr: '---',
});

turndown.addRule("don't escape identity links", {
  filter: 'a',
  replacement: (content, node) =>
    content.trim() === (node as HTMLAnchorElement).href
      ? content
      : `[${content}](${(node as HTMLAnchorElement).href})`,
});

export const getLatestAlerts: () => Promise<CacheEntry[]> = async () => {
  const response = await fetch('https://jhs.lwsd.org/fs/pages/22716/page-pops');
  const html = await response.text();
  const $ = load(html);

  const alerts: { title: string; content: string }[] = [];
  $('.fsPagePop').each((i, element) => {
    const title = $(element).find('.fsPagePopTitle').text();
    if (
      title.toLowerCase().includes('bus route cancellation') ||
      title.toLowerCase().includes('lottery')
    )
      return;
    const content = $(element).find('.fsPagePopMessage').html();
    alerts.push({
      title: title.trim(),
      content: turndown.turndown(content ?? '(no content found)').trim(),
    });
  });
  return alerts;
};
