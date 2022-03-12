import axios from 'axios';
import { Client, Message } from 'discord.js';
const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
export default async function MessageCreateEvent(
  client: Client,
  message: Message
) {
  if (message.author.bot) return;

  if (
    (message.author.id === '714640925703274547' &&
      message.content.startsWith('pls rob')) ||
    message.content.startsWith('pls steal')
  ) {
    if (/[harry potter|696554549418262548]/gi.test(message.content)) {
      message.reply('wtf. you now get spam');
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
      message.author.send('hello');
      await sleep(5000);
      message.channel.send(message.author.toString()).then(async (msg) => {
        await sleep(1000);
        msg.delete();
      });
      await sleep(5000);
    }
  }
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
