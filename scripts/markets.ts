import { getMarkets } from '../functions/src/markets';

getMarkets(process.argv[2]).then(console.log);
