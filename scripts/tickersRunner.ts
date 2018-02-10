import { getBidAsk } from '../functions/src/tickers';

getBidAsk(process.argv[2], process.argv[3]).then(console.log);
