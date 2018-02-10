import { getBid } from '../functions/src/tickers';

getBid(process.argv[2], process.argv[3]).then(console.log);
