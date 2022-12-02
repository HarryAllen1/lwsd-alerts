import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
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

  setInterval(async () => {
    const alerts = await getLatestAlerts();

    if ((await readCache()).lastEntries !== alerts) {
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

await client.login(config.token);
