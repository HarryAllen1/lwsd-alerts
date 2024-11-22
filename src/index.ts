import { dequal } from 'dequal';
import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  roleMention,
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

const checkAndSendAlerts = async (): Promise<void> => {
  const alerts = await getLatestAlerts();

  const { lastEntries } = await readCache();
  const isSame = dequal(alerts, lastEntries);

  if (!isSame && alerts.every((a) => a.title && a.content)) {
    for (const channelId of config.channels) {
      const channel = (await client.channels.fetch(channelId)) as TextChannel;

      if (alerts.every((a) => a.title && a.content))
        await channel.send(
          channelId === '888512392584122478'
            ? {
                content: roleMention('1308986605712834560'),
                embeds: alerts.map(({ title, content: description }) => ({
                  title,
                  description,
                })),
              }
            : {
                content: 'Alert:',
                embeds: alerts.map(({ title, content: description }) => ({
                  title,
                  description,
                })),
              }
        );
    }
  }
  await writeToCache(JSON.stringify({ lastEntries: alerts }));
};

client.on(Events.ClientReady, async () => {
  // const TEST_CHANNEL = (await client.channels.fetch(
  //   '888611523881213972'
  // )) as TextChannel;

  console.log('Ready!');
  client.user?.setActivity({
    type: ActivityType.Watching,
    name: 'the LWSD homepage',
    url: 'https://lwsd.org/',
  });

  await checkAndSendAlerts();

  setInterval(checkAndSendAlerts, 1000 * 15);
});

client.on(Events.InteractionCreate, async (i) => {
  if (i.isChatInputCommand()) {
    if (i.commandName === 'alert') {
      const alerts = await getLatestAlerts();

      await i.reply({
        embeds: alerts.map(({ title, content: description }) => ({
          title,
          description,
        })),
      });
    }
  } else if (i.isUserContextMenuCommand()) {
    if (i.commandName === 'Alerts') {
      const alerts = await getLatestAlerts();

      await i.reply({
        embeds: alerts.map(({ title, content: description }) => ({
          title,
          description,
        })),
      });
    }
  } else if (i.isStringSelectMenu()) {
    // console.log(i.reply({}));
  }
});

await client.login(config.token);
