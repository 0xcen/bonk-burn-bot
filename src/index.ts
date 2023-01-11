import dotenv from 'dotenv';
dotenv.config();

import { Connection, PublicKey } from '@solana/web3.js';

import db from './supabaseClient';

export const setSupply = async (supply: string) => {
  try {
    if (Number.isNaN(+supply)) throw Error('Supply is not a number.');
    const { data, error } = await db.from('bonkSupply').insert({ supply });

    if (error) throw Error(error.message);
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

    if (error) throw Error(error.message);
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
