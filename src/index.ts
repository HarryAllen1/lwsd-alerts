import { Client, TextChannel } from 'discord.js';
import { load } from 'cheerio';
import { token, channels } from '../config.json';
import axios from 'axios';
import fs from 'node:fs';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'],
});

(async () => {
  client.on('ready', () => {
    console.log('Ready as ' + client.user.tag);
  });
  setInterval(async () => {
    const homePage = await axios.get('https://lwsd.org');
    const $ = load(homePage.data);
    const cache = JSON.parse(fs.readFileSync('./cache.json').toString());
    if ($('.fsPagePopTitle').html() !== cache.lastEntry) {
      const pageContent = $('.fsPagePopMessage')
        .html()
        .replaceAll(/<p>/gi, '')
        .replaceAll(/<\/p>/gi, '\n');
      channels.forEach((channel) => {
        (client.channels.cache.get(channel) as TextChannel).send({
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
