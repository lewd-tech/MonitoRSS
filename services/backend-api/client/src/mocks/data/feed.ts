import { Feed } from '../../features/feed';
import mockDiscordChannels from './discordChannels';
import mockDiscordWebhooks from './discordWebhooks';

const mockFeeds: Feed[] = [{
  id: '1',
  title: 'New York Times',
  url: 'https://www.feed1.com',
  channel: mockDiscordChannels[0].id,
  status: 'failing',
  embeds: [],
  text: 'Feed Text Here',
  createdAt: new Date().toISOString(),
  refreshRateSeconds: 60,
  checkTitles: false,
  checkDates: false,
  directSubscribers: true,
  formatTables: true,
  imgLinksExistence: true,
  imgPreviews: false,
  splitMessage: false,
  failReason: undefined,
  ncomparisons: [],
  pcomparisons: [],
  webhook: {
    id: mockDiscordWebhooks[0].id,
    iconUrl: mockDiscordWebhooks[0].avatarUrl,
    name: mockDiscordWebhooks[0].name,
  },
  filters: [{
    category: 'title',
    value: 'New York Times',
  }, {
    category: 'url',
    value: 'https://www.feed1.com',
  }, {
    category: 'title',
    value: 'Yahoo News',
  }],
  disabledReason: undefined,
}];

export default mockFeeds;
