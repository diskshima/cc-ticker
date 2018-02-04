import * as ccxt from 'ccxt';
import { isObject, to } from './utils';

type MarketSymbol = string;

const DELAY_MS = 2000;

const EXCHANGE_NAMES = [
  'anxpro', 'binance', 'bitflyer', 'btcbox', 'coincheck', 'coinexchange',
  'quoinex', 'zaif',
];

const exchangeCtrMap: Map<string, typeof ccxt.Exchange> =
  EXCHANGE_NAMES.reduce((map, value) => {
    map.set(value, ccxt[value]);
    return map;
  }, new Map());

const exchangeFromName = (exchangeName: string): ccxt.Exchange => {
  const exNameLower = exchangeName.toLowerCase();
  const classCtr = exchangeCtrMap.get(exNameLower);

  if (!classCtr) {
    throw new Error(`No exchange found with name: ${exchangeName}.`);
  }

  return new classCtr();
};

const symbolsForExchange = async (exchangeName: string): Promise<Array<MarketSymbol>> => {
  const exchange = exchangeFromName(exchangeName);

  const [err, markets] = await to(exchange.fetchMarkets());

  if (err) {
    console.log(err);
    return [];
  }

  let marketList;

  if (Array.isArray(markets)) {
    marketList = markets;
  } else if (isObject(markets)) {
    marketList = Object.keys(markets).map(k => markets[k]);
  }

  return marketList.map(m => m.symbol);
};

const tickerForSymbol = async(
  exchangeName: string, sym: MarketSymbol
): Promise<ccxt.Ticker> => {
  const exchange = exchangeFromName(exchangeName);
  const [err, ticker] = await to(exchange.fetchTicker(sym));

  if (err) {
    console.log(err);
    return null;
  }

  return ticker;
};

const main = async (exchangeName: string, sym: MarketSymbol) => {
  console.log(await symbolsForExchange(exchangeName));
  console.log(await tickerForSymbol(exchangeName, sym));
  // const exchange = exchangeFromName(exchangeName);
  // const ticker = await exchange.fetchTicker(sym);
  // console.log(ticker);

  // markets.forEach(async (market) => {
  //   const sym = market.symbol;
  //   console.log(await exchange.fetchOrderBook(sym));
  //   await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  // });
};

main(process.argv[2], process.argv[3]);
