import { DialogflowApp } from 'actions-on-google';
import { getBidAsk, toFullSym } from './tickers';

process.env.DEBUG = 'actions-on-google:*';

const QUOTE_ACTION = 'quote_action';
const MARKET_ARG = 'market';
const EXCHANGE_ARG = 'exchange';

const quoteAction = async (app) => {
  const sym = app.getArgument(MARKET_ARG).toUpperCase();
  const exchangeName = app.getArgument(EXCHANGE_ARG).toLowerCase();
  const processedSym = toFullSym(sym);

  const bidAsk = await getBidAsk(exchangeName, processedSym);

  app.tell(`Ask is ${bidAsk.ask}, bid is ${bidAsk.bid} for ${sym} on ${exchangeName}`);
};

const ACTION_MAP = new Map();
ACTION_MAP.set(QUOTE_ACTION, quoteAction);

export const handleDialogFlowRequest = async (request, response) => {
  const dfApp = new DialogflowApp({ request, response });
  dfApp.handleRequest(ACTION_MAP);
};
