import * as  functions from 'firebase-functions';
import { dialogflow } from 'actions-on-google';
import { Exchange, getBidAsk, toFullSym } from './tickers';

process.env.DEBUG = 'actions-on-google:*';

const QUOTE_ACTION = 'quote_action';
const MARKET_ARG = 'market';
const EXCHANGE_ARG = 'exchange';

const app = dialogflow();
app.intent(QUOTE_ACTION, async conv => {
  const sym = conv.parameters[MARKET_ARG].toString().toUpperCase();
  const exchangeName = conv.parameters[EXCHANGE_ARG].toString().toLowerCase();
  const processedSym = toFullSym(sym);

  const bidAsk = await getBidAsk(exchangeName as Exchange, processedSym);

  conv.close(`Ask is ${bidAsk.ask}, bid is ${bidAsk.bid} for ${sym} on ${exchangeName}`);
});

export const handleDialogFlowRequest = functions.https.onRequest(app);
