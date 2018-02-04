import * as ccxt from 'ccxt';

const DELAY_MS = 2000;

const ZAIF = new ccxt.zaif();

const main = async (sym: string) => {
  const exchange = ZAIF;
  // const markets = await exchange.fetchMarkets();

  // markets.forEach(async (market) => {
  //   const sym = market.symbol;
  //   console.log(await exchange.fetchOrderBook(sym));
  //   await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  // });
  const ticker = await exchange.fetchTicker(sym);
  console.log(ticker);
};

main(process.argv[2]);
