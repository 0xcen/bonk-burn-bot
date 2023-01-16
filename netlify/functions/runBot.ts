import { TwitterApi } from 'twitter-api-v2';
import { getCurrentSupply, getPreviousSupply, setSupply } from '../../src';
import supabase from '../../src/supabaseClient';
import BigNumber from 'bignumber.js';

export const handler = async () => {
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

    if (!prevSup && !currentSupply) return;

    const amount = new BigNumber(prevSup.supply)
      .minus(new BigNumber(currentSupply))
      .abs();

    const dbRes = await setSupply(
      `${new BigNumber(currentSupply).decimalPlaces(0)}`
    );
    if (Number.isNaN(amount.toFormat(0))) return { statusCode: 500 };

    const twitterRes = await client.v2.tweet(
      `${amount.toFormat(0)} $BONK has been burned in the last 24 hours!`
    );

    // console.log(twitterRes);
    return {
      statusCode: 200,
      body: JSON.stringify({
        amount: amount.toFormat(0),
        twitterRes,
      }),
    };
  } catch (error) {
    console.log(error);
    return { statusCode: 500 };
  }
};
