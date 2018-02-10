import * as url from 'url';
import { IncomingMessage } from 'http';
import * as https from 'https';

export type Exchange = 'bitflyer' | 'zaif' | 'coincheck' | 'dmm';
type MarketSymbol = string;
type QueryCallback = (res: IncomingMessage) => void;

const generateExchangeProcessor = (
  runQuery: (sym: MarketSymbol, callback: QueryCallback) => void,
  takeOutBid: (data: string, sym: MarketSymbol) => number,
): (string) => Promise<number> => {
  return (sym: MarketSymbol) =>
    new Promise((resolve, reject) => {
      runQuery(sym, (res) => {
        res.on('data', (data: string) => {
          resolve(takeOutBid(data, sym));
        }).on('error', (e) => {
          reject(e);
        });
      });
    });
};

const processBitflyer = generateExchangeProcessor(
  (sym: MarketSymbol, callback: QueryCallback) => {
    const productCode = sym.replace('/', '_').toUpperCase();
    https.get(`https://api.bitflyer.jp/v1/ticker?product_code=${productCode}`,
      res => callback(res));
  },
  (data: string) => {
    const json = JSON.parse(data);
    return json.best_bid;
  });

const processCoincheck = generateExchangeProcessor(
  (sym: MarketSymbol, callback: QueryCallback) => {
    if (sym.toLowerCase() !== 'btc/jpy') {
      throw new Error(`Coincheck does not support this symbol: ${sym}`);
    }
    https.get('https://coincheck.com/api/ticker', res => callback(res));
  },
  (data: string) => {
    const json = JSON.parse(data);
    return json.bid;
  });

const processZaif = generateExchangeProcessor(
  (sym: MarketSymbol, callback: QueryCallback) => {
    const pair = sym.replace('/', '_').toLowerCase();
    https.get(`https://api.zaif.jp/api/1/last_price/${pair}`,
      res => callback(res));
  },
  (data: string) => {
    const json = JSON.parse(data);
    return json.last_price;
  });

const processDmm = generateExchangeProcessor(
  (sym: MarketSymbol, callback: QueryCallback) => {
    const dmmUrl = url.parse('https://bitcoin.dmm.com/api/get_rate');
    const options = { method: 'POST', hostname: dmmUrl.host, path: dmmUrl.pathname };
    const req = https.request(options, res => callback(res));
    req.on('error', (e) => { console.error(e); });
    req.end();
  },
  (data: string, sym: MarketSymbol) => {
    const json = JSON.parse(data);
    const matchingKeys =
      Object.keys(json.rate)
            .find(key => {
              const marketType = json.rate[key].type;
              return marketType.toLowerCase().endsWith(sym.toLowerCase());
            });
    return parseFloat(json.rate[matchingKeys[0]].bid_value);
  });


export const getBid = async (exchangeName: string, sym: MarketSymbol) => {
  switch (exchangeName.toLowerCase()) {
    case 'bitflyer':
      return await processBitflyer(sym);
    case 'coincheck':
      return await processCoincheck(sym);
    case 'zaif':
      return await processZaif(sym);
    case 'dmm':
      return await processDmm(sym);
    default:
      throw new Error(`Does not support exchange: ${exchangeName}`);
  }
};

// getBid(process.argv[2], process.argv[3]).then(console.log);
