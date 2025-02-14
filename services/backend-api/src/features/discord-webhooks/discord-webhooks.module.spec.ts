import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  setupEndpointTests,
  teardownEndpointTests,
} from '../../utils/endpoint-tests';
import { MongooseTestModule } from '../../utils/mongoose-test.module';
import nock from 'nock';
import { CACHE_MANAGER, HttpStatus } from '@nestjs/common';
import { DISCORD_API_BASE_URL } from '../../constants/discord';
import { Session } from '../../common';
import { PartialUserGuild } from '../discord-users/types/PartialUserGuild.type';
import { DiscordWebhooksModule } from './discord-webhooks.module';
import * as qs from 'qs';
import {
  DiscordWebhook,
  DiscordWebhookType,
} from './types/discord-webhook.type';
import { Cache } from 'cache-manager';
import { ApiErrorCode } from '../../common/constants/api-errors';
import { DiscordWebhooksService } from './discord-webhooks.service';

describe('DiscordWebhooksModule', () => {
  let app: NestFastifyApplication;
  let setAccessToken: (accessToken: Session['accessToken']) => Promise<string>;
  const standardRequestOptions = {
    headers: {
      cookie: '',
    },
  };
  const botClientId = 'bot-client-id';

  beforeAll(async () => {
    const { init } = setupEndpointTests({
      imports: [DiscordWebhooksModule, MongooseTestModule.forRoot()],
    });

    ({ app, setAccessToken } = await init());

    standardRequestOptions.headers.cookie = await setAccessToken({
      access_token: 'accessToken',
    } as Session['accessToken']);

    app.get(DiscordWebhooksService).clientId = botClientId;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(async () => {
    nock.cleanAll();
    const cacheManager = app.get<Cache>(CACHE_MANAGER);
    cacheManager.reset();
  });

  afterAll(async () => {
    await teardownEndpointTests();
  });

  describe('GET /discord-webhooks', () => {
    const serverId = '633432788015644722';
    const sampleWebhooks: DiscordWebhook[] = [
      {
        id: '12345',
        type: DiscordWebhookType.INCOMING,
        channel_id: '12345',
        application_id: botClientId,
        name: 'test',
      },
    ];
    const standardQuery = qs.stringify({
      filters: {
        serverId,
      },
    });

    const mockGetUserGuilds = (partialGuild?: Partial<PartialUserGuild>) => {
      nock(DISCORD_API_BASE_URL)
        .get(`/users/@me/guilds`)
        .reply(200, [
          {
            id: serverId,
            owner: true,
            permissions: 16,
            ...partialGuild,
          },
        ]);
    };

    const mockGetServerWebhooks = () => {
      nock(DISCORD_API_BASE_URL)
        .get(`/guilds/${serverId}/webhooks`)
        .reply(200, sampleWebhooks);
    };

    it('returns forbidden if user does not own requested server', async () => {
      nock(DISCORD_API_BASE_URL).get(`/users/@me/guilds`).reply(200, []);

      const { statusCode } = await app.inject({
        method: 'GET',
        url: `/discord-webhooks?${standardQuery}`,
        ...standardRequestOptions,
      });

      expect(statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('returns 400 if serverId filter is missing', async () => {
      mockGetUserGuilds();

      const badFilters = qs.stringify({
        filters: {},
      });

      const { statusCode } = await app.inject({
        method: 'GET',
        url: `/discord-webhooks?${badFilters}`,
        ...standardRequestOptions,
      });

      expect(statusCode).toBe(400);
    });

    it('returns the correct response', async () => {
      mockGetUserGuilds();
      mockGetServerWebhooks();

      const { statusCode, body } = await app.inject({
        method: 'GET',
        url: `/discord-webhooks?${standardQuery}`,
        ...standardRequestOptions,
      });

      expect(statusCode).toEqual(200);
      const parsedBody = JSON.parse(body);
      expect(parsedBody.results).toEqual([
        {
          id: '12345',
          channelId: '12345',
          name: 'test',
        },
      ]);
    });

    it('returns 403 with the correct error code if discord returns 403', async () => {
      mockGetUserGuilds();
      nock(DISCORD_API_BASE_URL)
        .get(`/guilds/${serverId}/webhooks`)
        .reply(403, {
          message: 'no access!',
        });

      const { statusCode, body } = await app.inject({
        method: 'GET',
        url: `/discord-webhooks?${standardQuery}`,
        ...standardRequestOptions,
      });

      expect(statusCode).toBe(403);
      const parsedBody = JSON.parse(body);
      expect(parsedBody.code).toBe(
        ApiErrorCode.WEBHOOKS_MANAGE_MISSING_PERMISSIONS,
      );
    });
  });
});
