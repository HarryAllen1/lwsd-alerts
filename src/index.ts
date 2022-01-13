import {
  Client,
  MessageActionRow,
  MessageButton,
  MessageEditOptions,
  TextChannel,
} from 'discord.js';
import { load } from 'cheerio';
import { token } from '../config.json';
import axios from 'axios';
import fs from 'node:fs';
import TurndownService from 'turndown';
import { Paginator } from './paginator';
import { REST } from '@discordjs/rest';
import { Routes, ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'],
});
const turndownService = new TurndownService();

let realPages: MessageEditOptions[] = [];

process.on('unhandledRejection', console.error);

(async () => {
  client.on('ready', async () => {
    console.log('Ready as ' + client.user.tag);
    client.user.setActivity({
      type: 'WATCHING',
      name: 'the LWSD homepage',
    });
    console.log('Registering slash commands....');
    const rest = new REST({ version: '9' }).setToken(token);
    const commands: any[] = [
      new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Adds or removes a channel to send alerts')
        .addStringOption((option) =>
          option
            .setName('operation')
            .setRequired(true)
            .setDescription('Whether or not to add or remove a channel')
            .addChoice('add', 'add')
            .addChoice('remove', 'remove')
        )
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('The channel to add or remove')
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
        )
        .toJSON(),
      new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Shows the latest alert')
        .toJSON(),
    ];
    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, '892256861947064341'),
        {
          body: commands,
        }
      );
      console.log('Done!');
    } catch (e) {
      console.error(e);
    }
  });

  setInterval(async () => {
    const homePage = await axios.get('https://lwsd.org');
    const $ = load(homePage.data);
    const cache = JSON.parse(fs.readFileSync('./cache.json').toString());
    const channels = JSON.parse(fs.readFileSync('./channels.json').toString());
    if ($('article.fsPagePop.slick-slide')) {
      // check if the first page of the carousel has changed
      if ($('#fsPagePopCollection').html() === cache.lastEntry) return;

      if ($('.fsPagePopTitle').html() === '') return;

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
      channels.forEach((channel) => {
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
      channels.forEach((channel: string) => {
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
      const homePage = await axios.get('https://lwsd.org');
      const $ = load(homePage.data);
      if ($('.fsPagePopTitle').html() === '') return;
      if ($('article.fsPagePop.slick-slide')) {
        // check if the first page of the carousel has changed

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
        const paginator = new Paginator(pages);
        paginator.start({ interaction: i });
      } else {
        i.reply({
          ephemeral: true,
          content: 'This message is out of date!',
        });
      }
    } else if (i.isCommand()) {
      switch (i.commandName) {
        case 'channel':
          if (i.options.getString('operation') === 'add') {
            const channels = JSON.parse(
              fs.readFileSync('./channels.json').toString()
            );
            channels.push(i.options.getChannel('channel').id);
            fs.writeFileSync('./channels.json', channels, 'utf-8');
          }
          break;

        case 'alert':
          const homePage = await axios.get('https://lwsd.org');
          const $ = load(homePage.data);
          const cache = JSON.parse(fs.readFileSync('./cache.json').toString());
          const channels = JSON.parse(
            fs.readFileSync('./channels.json').toString()
          );
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
            realPages = pages;
            i.reply({
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
              ephemeral: true,
            });
            cache.lastEntry = $('#fsPagePopCollection').html();
            const json = JSON.stringify(cache);
            fs.writeFileSync('./cache.json', json, 'utf-8');
          } else if ($('.fsPagePopTitle').html() !== cache.lastEntry) {
            const pageContent = turndownService
              .turndown($('.fsPagePopMessage').html())
              ?.replaceAll(/\n\n/gi, '\n')
              ?.replaceAll('&nbsp;', '\n');
            i.reply({
              embeds: [
                {
                  title: $('.fsPagePopTitle').html(),
                  description: pageContent,
                },
              ],
              ephemeral: true,
            });

            cache.lastEntry = $('.fsPagePopTitle').html();
            const json = JSON.stringify(cache);
            fs.writeFileSync('./cache.json', json, 'utf-8');
          }

          break;

        default:
          break;
      }
    }
  });

  void client.login(token);
})();
