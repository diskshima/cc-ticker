import { getBidAsk, toFullSym } from '../src/tickers';
import { Exchange } from '../src/types';

const exchange = process.argv[2] as Exchange;
const sym = toFullSym(process.argv[3]);

getBidAsk(exchange, sym).then(console.log);
