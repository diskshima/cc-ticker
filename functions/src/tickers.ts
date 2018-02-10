import * as https from 'https';

type MarketSymbol = string;

const generateExchangeProcessor = (
  buildUrl: (string) => string,
  takeOutBid: (data: string) => number,
): (string) => Promise<number> => {
  return (sym: MarketSymbol) =>
    new Promise((resolve, reject) => {
      https.get(buildUrl(sym), (res) => {
        res.on('data', (data: string) => {
          resolve(takeOutBid(data));
        }).on('error', (e) => {
          reject(e);
        });
      });
    });
};

const processBitflyer = generateExchangeProcessor(
  (sym) => {
    const productCode = sym.replace('/', '_');
    return `https://api.bitflyer.jp/v1/ticker?product_code=${productCode}`;
  },
  (data) => {
    const json = JSON.parse(data);
    return json.best_bid;
  });

const processCoincheck = generateExchangeProcessor(
  (sym) => {
    if (sym.toLowerCase() !== 'btc/jpy') {
      throw new Error(`Coincheck does not support this symbol: ${sym}`);
    }

    return 'https://coincheck.com/api/ticker';
  },
  (data) => {
    const json = JSON.parse(data);
    return json.bid;
  });

const processZaif = generateExchangeProcessor(
  (sym) => {
    const pair = sym.replace('/', '_').toLowerCase();
    return `https://api.zaif.jp/api/1/last_price/${pair}`;
  },
  (data) => {
    const json = JSON.parse(data);
    return json.last_price;
  });

export const getBid = async (exchangeName: string, sym: MarketSymbol) => {
  switch (exchangeName.toLowerCase()) {
    case 'bitflyer':
      return await processBitflyer(sym);
    case 'coincheck':
      return await processCoincheck(sym);
    case 'zaif':
      return await processZaif(sym);
    default:
      throw new Error(`Does not support exchange: ${exchangeName}`);
  }
};

// getBid(process.argv[2], process.argv[3]).then(v => console.log(v));
