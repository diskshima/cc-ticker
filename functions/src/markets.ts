import * as https from 'https';

import { Exchange } from './types';

const processBitflyer = (): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    https.get('https://api.bitflyer.jp/v1/markets',
      res => {
        let data = '';
        res.on('data', (chunk: string) => {
          data += chunk;
        }).on('end', () => {
          const json = JSON.parse(data);
          const names = json.map(e => e.product_code);
          resolve(names);
        }).on('error', (e) => {
          reject(e);
        });
      });
  });
};

const processZaif = (): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    https.get('https://api.zaif.jp/api/1/currencies/all',
      res => {
        let data = '';
        res.on('data', (chunk: string) => {
          data += chunk;
        }).on('end', () => {
          const json = JSON.parse(data);
          const names = json.map(e => e.name);
          const validEntries = names.filter(n => n.length <= 4);
          const upperCased = validEntries.map(n => n.toUpperCase());
          resolve(upperCased);
        }).on('error', (e) => {
          reject(e);
        });
      });
  });
};

export const getMarkets = async (exchangeName: Exchange): Promise<Array<string>> => {
  switch (exchangeName) {
    case 'zaif':
      return processZaif();
    case 'bitflyer':
      return processBitflyer();
    default:
      throw new Error(`Does not support exchange: ${exchangeName}`);
  }
};
