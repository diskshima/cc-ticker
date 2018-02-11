import { config } from 'firebase-functions';
import { Client, validateSignature } from '@line/bot-sdk';
import { getBidAsk, BidAskPrice, Exchange, toFullSym } from './tickers';

export const LINE_HEADER_NAME = 'x-line-signature';

const LINE_CONFIG = config().line;
const CHANNEL_SECRET = LINE_CONFIG.channel_secret;
const CHANNEL_ACCESS_TOKEN = LINE_CONFIG.channel_access_token;

const DEFAULT_EXCHANGE: Exchange = 'zaif';

const validateMessageDigest = (request) => {
  const signatureInHeader = request.headers[LINE_HEADER_NAME];
  const requestStr = JSON.stringify(request.body);

  return validateSignature(requestStr, CHANNEL_SECRET, signatureInHeader);
};

const buildClient = () => new Client({ channelAccessToken: CHANNEL_ACCESS_TOKEN });

const extractFirstEvent = requestBody => requestBody.events[0];

const extractReplyToken = requestBody => extractFirstEvent(requestBody).replyToken;

const extractFirstMessage = requestBody => extractFirstEvent(requestBody).message.text;

const sendResponse = async (text: string, replyToken: string) => {
  const client = buildClient();

  try {
    await client.replyMessage(replyToken, { type: 'text', text });
    console.log('Successfully sent reply.');
  } catch (e) {
    console.error(e);
  }
};

const formatBidAskReply = (
  exchangeName: Exchange, sym: string, bidAsk: BidAskPrice,
) =>
  `${toFullSym(sym)} (${exchangeName}): ` +
  `Bid ${bidAsk.bid.toLocaleString()} / Ask ${bidAsk.ask.toLocaleString()}`;

const processRequest = async (requestBody) => {
  const words = extractFirstMessage(requestBody).split(/\s+/)

  const sym = words[0].toUpperCase();
  const processedSym = toFullSym(sym);

  let exchangeName = DEFAULT_EXCHANGE;

  if (words.length > 1) {
    exchangeName = words[1].toLowerCase();
  }

  const bidAsk = await getBidAsk(exchangeName, processedSym);
  return formatBidAskReply(exchangeName, sym, bidAsk);
};

export const handleLineRequest = async (request, response) => {
  if (!validateMessageDigest(request)) {
    response.status(401).send('なんかおかしいですね。もう一回やってみてください。');
    return;
  }

  const requestBody = request.body;

  const replyText = await processRequest(requestBody);

  await sendResponse(replyText, extractReplyToken(requestBody));

  response.end();
};
