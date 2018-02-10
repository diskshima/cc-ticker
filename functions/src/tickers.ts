import * as url from 'url';
import { IncomingMessage } from 'http';
import * as https from 'https';

export type Exchange = 'bitflyer' | 'zaif' | 'coincheck' | 'dmm';
export type BidAskPrice = {
  bid: number,
  ask: number,
};
type MarketSymbol = string;
type QueryCallback = (res: IncomingMessage) => void;

const generateExchangeProcessor = (
  runQuery: (sym: MarketSymbol, callback: QueryCallback) => void,
  extractBidAsk: (data: string, sym: MarketSymbol) => BidAskPrice,
): (string) => Promise<BidAskPrice> => {
  return (sym: MarketSymbol) =>
    new Promise((resolve, reject) => {
      runQuery(sym, (res) => {
        res.on('data', (data: string) => {
          resolve(extractBidAsk(data, sym));
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
    return {
      ask: json.best_ask,
      bid: json.best_bid,
    };
  });

const processCoincheck = generateExchangeProcessor(
  (sym: MarketSymbol, callback: QueryCallback) => {
    if (sym !== 'BTC/JPY') {
      throw new Error(`Coincheck does not support this symbol: ${sym}`);
    }
    https.get('https://coincheck.com/api/ticker', res => callback(res));
  },
  (data: string) => {
    const json = JSON.parse(data);
    return {
      ask: json.ask,
      bid: json.bid,
    };
  });

const processZaif = generateExchangeProcessor(
  (sym: MarketSymbol, callback: QueryCallback) => {
    const pair = sym.replace('/', '_').toLowerCase();
    https.get(`https://api.zaif.jp/api/1/ticker/${pair}`,
      res => callback(res));
  },
  (data: string) => {
    const json = JSON.parse(data);
    return {
      ask: json.ask,
      bid: json.bid,
    };
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
              return marketType.toUpperCase().endsWith(sym);
            });
    const matchingRate = json.rate[matchingKeys[0]];
    return {
      ask: parseFloat(matchingRate.ask_value),
      bid: parseFloat(matchingRate.bid_value),
    };
  });

const processGmo = generateExchangeProcessor(
  (sym: MarketSymbol, callback: QueryCallback) => {
    https.get('https://coin.z.com/api/v1/master/getCurrentRate.json',
      res => callback(res));
  },
  (data: string, sym: MarketSymbol) => {
    const indexLookup = ['BTC/JPY', 'ETH/JPY', 'BCH/JPY', 'LTC/JPY', 'XRP/JPY'];
    const index = indexLookup.indexOf(sym);
    const productId = 1001 + index;

    const json = JSON.parse(data);
    const matchingProduct = json.data.find(d => d.productId === productId);
    return {
      ask: matchingProduct.ask,
      bid: matchingProduct.bid,
    };
  });

export const getBidAsk = async (
  exchangeName: string, sym: MarketSymbol
): Promise<BidAskPrice> => {
  switch (exchangeName.toLowerCase()) {
    case 'bitflyer':
      return await processBitflyer(sym);
    case 'coincheck':
      return await processCoincheck(sym);
    case 'zaif':
      return await processZaif(sym);
    case 'dmm':
      return await processDmm(sym);
    case 'gmo':
      return await processGmo(sym);
    default:
      throw new Error(`Does not support exchange: ${exchangeName}`);
  }
};
