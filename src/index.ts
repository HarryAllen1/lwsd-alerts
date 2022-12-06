import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  TextChannel,
} from 'discord.js';
import { readCache, writeToCache } from './cache.js';
import { config } from './config.js';
import { getLatestAlerts } from './http.js';
import isEqual from 'lodash.isequal';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.ClientReady, () => {
  console.log('Ready!');
  client.user?.setActivity({
    type: ActivityType.Watching,
    name: 'the LWSD homepage',
    url: 'https://lwsd.org/',
  });

  setInterval(async () => {
    const alerts = await getLatestAlerts();

    const { lastEntries } = await readCache();
    const isSame = isEqual(alerts, lastEntries);

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

client.on(Events.InteractionCreate, async (i) => {
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
  } else if (i.isUserContextMenuCommand()) {
    if (i.commandName === 'Alerts') {
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
