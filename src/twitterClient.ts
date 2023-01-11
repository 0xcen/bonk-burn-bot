import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.CONSUMER_KEY ?? '',
  appSecret: process.env.CONSUMER_SECRET ?? '',
  accessToken: process.env.OAUTH_TOKEN ?? '',
  accessSecret: process.env.OAUTH_TOKEN_SECRET ?? '',
});
//   const res = await client.v2.tweet('hi'); console.log('🚀 ~ file: index.ts:18 ~ main ~ res', res);

export default client;
