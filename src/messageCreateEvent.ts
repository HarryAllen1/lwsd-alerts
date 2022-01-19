import axios from 'axios';
import { Client, Message } from 'discord.js';

export default async function MessageCreateEvent(
  client: Client,
  message: Message
) {
  if (message.author.bot) return;

  if (!message.content.startsWith('$')) return;
  const [cmdName, ...args] = message.content
    .slice('$'.length)
    .trim()
    .split(/\s+/);
  if (message.content.toLowerCase().startsWith('lwsd eval')) {
    eval(args.join(' '));
    return;
  }
  if (cmdName === 'subscribe') {
    if (!args[0]) {
      message.reply('You need to specify a school name');
      return;
    }
    axios
      .get(`https://${args[0]}.lwsd.org/`)
      .then(async (res) => {})
      .catch(() => {
        message.reply('The specified school must be the prefix to "lwsd.org"');
      });
  }
}
