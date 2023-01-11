import {
  Handler,
  HandlerEvent,
  HandlerContext,
  schedule,
} from '@netlify/functions';

import { TwitterApi } from 'twitter-api-v2';
import { getCurrentSupply, getPreviousSupply, setSupply } from '../../src';
import supabase from '../../src/supabaseClient';
import BigNumber from 'bignumber.js';
import { Response } from '@netlify/functions/dist/function/response';

const myHandler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<Response> => {
  const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY ?? '',
    appSecret: process.env.CONSUMER_SECRET ?? '',
    accessToken: process.env.OAUTH_TOKEN ?? '',
    accessSecret: process.env.OAUTH_TOKEN_SECRET ?? '',
  });

  try {
    const [prevSup] = await getPreviousSupply();
    const currentSupply = await getCurrentSupply();

    console.log({ prevSup, currentSupply });

    if (!prevSup && !currentSupply) return { statusCode: 500 };

    const amount = new BigNumber(prevSup.supply)
      .minus(new BigNumber(currentSupply))
      .abs();

    const dbRes = await setSupply(
      `${new BigNumber(currentSupply).decimalPlaces(0)}`
    );

    const tweet = await client.v2.me();
    console.log('🚀 ~ file: scheduled.ts:41 ~ tweet', tweet);

    // const twitterRes = await client.v2.tweet(
    //   `${amount.toFormat(0)} $BONK has been burned in the last 24 hours`
    // );

    // console.log(twitterRes);
    return {
      statusCode: 200,
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500 };
  }
};

const handler = schedule('@daily', myHandler);

export { handler };
