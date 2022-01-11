import {
  Client,
  MessageActionRow,
  MessageButton,
  MessageEditOptions,
  TextChannel,
} from 'discord.js';
import { load } from 'cheerio';
import { token } from '../config.json';
import channels from '../channels.json';
import axios from 'axios';
import fs from 'node:fs';
import TurndownService from 'turndown';
import { Paginator } from './paginator';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'],
});
const turndownService = new TurndownService();

let realPages: MessageEditOptions[] = [];

process.on('unhandledRejection', console.error);
(async () => {
  client.on('ready', () => {
    console.log('Ready as ' + client.user.tag);
    client.user.setActivity({
      type: 'WATCHING',
      name: 'the LWSD homepage',
    });
  });

  client.on('interactionCreate', async (i) => {
    const paginator = new Paginator([
      { embeds: [{ title: 'hi' }] },
      { embeds: [{ title: 'bye' }] },
    ]);
    if (i.isButton() && i.customId === 'testButton')
      paginator.start({ interaction: i });
  });
  setInterval(async () => {
    const homePage = await axios.get('https://lwsd.org');
    const $ = load(homePage.data);
    const cache = JSON.parse(fs.readFileSync('./cache.json').toString());
    if ($('article.fsPagePop.slick-slide')) {
      // check if the first page of the carousel has changed
      if ($('#fsPagePopCollection').html() === cache.lastEntry) return;

      const pages: MessageEditOptions[] = [];
      const messages: string[] = [];
      $('.fsPagePopMessage').each((i, el) => {
        messages[i] = $(el).html();
      });
      $('.fsPagePopTitle').each((i, el) => {
        pages[i] = {
          embeds: [
            {
              title: $(el).html(),
              description: turndownService
                .turndown(messages[i])
                ?.replaceAll(/\n\n/gi, '\n')
                ?.replaceAll('&nbsp;', '\n'),
            },
          ],
        };
      });
      channels.forEach((channel) => {
        realPages = pages;
        (client.channels.cache.get(channel) as TextChannel)?.send({
          embeds: [
            {
              title:
                'This alert has multiple pages, and would be too long to show.',
              description: 'Hit the button below to paginate through them.',
            },
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel('View Alerts')
                .setCustomId('viewAlerts')
                .setStyle('PRIMARY')
            ),
          ],
        });
      });
      cache.lastEntry = $('#fsPagePopCollection').html();
      const json = JSON.stringify(cache);
      fs.writeFileSync('./cache.json', json, 'utf-8');
    } else if ($('.fsPagePopTitle').html() !== cache.lastEntry) {
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

  client.on('interactionCreate', async (i) => {
    if (i.isButton() && i.customId === 'viewAlerts') {
      if (realPages === []) {
        const homePage = await axios.get('https://lwsd.org');
        const $ = load(homePage.data);
        const pages: MessageEditOptions[] = [];
        const messages: string[] = [];
        $('.fsPagePopMessage').each((i, el) => {
          messages[i] = $(el).html();
        });
        $('.fsPagePopTitle').each((i, el) => {
          pages[i] = {
            embeds: [
              {
                title: $(el).html(),
                description: turndownService
                  .turndown(messages[i])
                  ?.replaceAll(/\n\n/gi, '\n')
                  ?.replaceAll('&nbsp;', '\n'),
              },
            ],
          };
        });
        realPages = pages;
        const paginator = new Paginator(realPages);
        paginator.start({ interaction: i });
      } else {
        const paginator = new Paginator(realPages);
        paginator.start({ interaction: i });
      }
    }
  });

  void client.login(token);
})();
