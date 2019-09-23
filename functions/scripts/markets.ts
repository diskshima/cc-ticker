import { getMarkets } from '../src/markets';
import { Exchange } from '../src/types';

getMarkets(process.argv[2] as Exchange).then(console.log);
