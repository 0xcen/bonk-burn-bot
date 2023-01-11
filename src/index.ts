import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';
dotenv.config();
import { Connection, PublicKey } from '@solana/web3.js';
// import twitterClient from './twitterClient';

import db from './supabaseClient';
import { TwitterApi } from 'twitter-api-v2';

const main = async () => {
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
    console.log('🚀 ~ file: index.ts:23 ~ main ~ dbRes', dbRes);

    // const twitterRes = await client.v2.tweet(
    //   `${amount.toFormat(0)} $BONK has been burned in the last 24 hours`
    // );

    // console.log(twitterRes);
  } catch (error) {
    console.log(error);
  }
};

export const setSupply = async (supply: string) => {
  try {
    const { data, error } = await db.from('bonkSupply').insert({ supply });
    console.log('🚀 ~ file: index.ts:18 ~ setSupply ~ error', error);
    return data;
  } catch (error) {
    console.log('🚀 ~ file: index.ts:20 ~ setSupply ~ error', error);
  }
};

export const getPreviousSupply = async () => {
  try {
    const { data, error } = await db
      .from('bonkSupply')
      .select()
      .order('id', { ascending: false })
      .limit(1);

    console.log('🚀 ~ file: index.ts:18 ~ setSupply ~ error', error);
    if (!data) return [];
    return data;
  } catch (error) {
    console.log('🚀 ~ file: index.ts:20 ~ setSupply ~ error', error);
    return [];
  }
};

export const getCurrentSupply = async (): Promise<string> => {
  const BONK_PUBKEY = new PublicKey(
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
  );
  try {
    const connection = new Connection(
      process.env.RPC_ENDPOINT || 'mainnet-beta'
    );
    //   get current supply
    const account = await connection.getTokenSupply(BONK_PUBKEY);
    if (!account.value.uiAmountString) {
      return '';
    }
    return account.value.uiAmountString;
  } catch (error) {
    console.log('🚀 ~ file: index.ts:59 ~ getCurrentSupply ~ error', error);
    return '';
  }
};

main();
