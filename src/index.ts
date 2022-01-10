import { Client, TextChannel } from 'discord.js';
import { load } from 'cheerio';
import { token } from '../config.json';
import channels from '../channels.json';
import axios from 'axios';
import fs from 'node:fs';
import TurndownService from 'turndown';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'],
});
const turndownService = new TurndownService();

process.on('unhandledRejection', console.error);
(async () => {
  client.on('ready', () => {
    console.log('Ready as ' + client.user.tag);
    client.user.setActivity({
      type: 'WATCHING',
      name: 'the LWSD homepage',
    });
  });
  setInterval(async () => {
    const homePage = await axios.get('https://lwsd.org');
    const $ = load(homePage.data);
    const cache = JSON.parse(fs.readFileSync('./cache.json').toString());
    if ($('.fsPagePopTitle').html() !== cache.lastEntry) {
      const pageContent = turndownService
        .turndown($('.fsPagePopMessage').html())
        ?.replaceAll(/\n\n/gi, '\n')
        ?.replaceAll('&nbsp;', '\n');
      channels.forEach((channel) => {
        (client.channels.cache.get(channel) as TextChannel)?.send({
          embeds: [
            {
              title: $('.fsPagePopTitle').html(),
              description: pageContent,
            },
          ],
        });
      });

      cache.lastEntry = $('.fsPagePopTitle').html();
      const json = JSON.stringify(cache);
      fs.writeFileSync('./cache.json', json, 'utf-8');
    }
  }, 15000);

  void client.login(token);
})();
