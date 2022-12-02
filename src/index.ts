import {
  ActivityType,
  Client,
  GatewayIntentBits,
  TextChannel,
} from 'discord.js';
import { readCache, writeToCache } from './cache.js';
import { config } from './config.js';
import { getLatestAlerts } from './http.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('Ready!');
  client.user?.setActivity({
    type: ActivityType.Watching,
    name: 'the LWSD homepage',
    url: 'https://lwsd.org/',
  });

  setInterval(async () => {
    const alerts = await getLatestAlerts();

    let isSame = true;
    const { lastEntries } = await readCache();
    if (alerts.length !== lastEntries.length) {
      isSame = false;
    } else {
      for (let i = 0; i < alerts.length; i++) {
        if (alerts[i].title !== lastEntries[i].title) {
          isSame = false;
          break;
        }
      }
    }

    if (!isSame) {
      config.channels.forEach(async (channelId) => {
        const channel = (await client.channels.fetch(channelId)) as TextChannel;

        await channel.send({
          embeds: alerts.map((alert) => ({
            title: alert.title,
            description: alert.content,
          })),
        });
      });
    }
    await writeToCache(JSON.stringify({ lastEntries: alerts }));
  }, 1000 * 60 * 2);
});

client.on('interactionCreate', async (i) => {
  if (i.isChatInputCommand()) {
    if (i.commandName === 'alert') {
      const alerts = await getLatestAlerts();
      await i.reply({
        embeds: alerts.map((alert) => ({
          title: alert.title,
          description: alert.content,
        })),
      });
    }
  }
});

await client.login(config.token);
