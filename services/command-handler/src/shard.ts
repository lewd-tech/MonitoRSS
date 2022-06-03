import 'reflect-metadata';
import { Client, Intents } from 'discord.js';
import config from './config';
import setupServices from '@monitorss/services';
import interactionCreate from './events/interaction-create';
import readyEvent from './events/ready';

async function shard() {
  const monitoServices = await setupServices({
    mongoUri: config.mongoUri,
    apis: {
      subscriptions: {
        enabled: config.apis.subscriptions.enabled,
        host: config.apis.subscriptions.host,
        accessToken: config.apis.subscriptions.accessToken,
      },
    },
    defaultMaxFeeds: config.defaultMaxFeeds,
    defaultRefreshRateMinutes: config.defaultRefreshRateMinutes,
    vipEnabled: config.vipEnabled,
    vipRefreshRateMinutes: config.vipRefreshRateMinutes,
    vipRestrictedCommands: config.vipRestrictedCommands,
  });

  const client = new Client({ 
    intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES', 'GUILD_MESSAGE_REACTIONS'],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER']
  });

  client.on('interactionCreate', interaction => interactionCreate(interaction, monitoServices));
  client.once('ready', () => readyEvent(client));
  client.login(config.botToken);
}

shard();
