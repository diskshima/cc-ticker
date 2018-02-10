import { config } from 'firebase-functions';
import { createHmac } from 'crypto';
import { Client } from '@line/bot-sdk';

export const LINE_HEADER_NAME = 'x-line-signature';

const LINE_CONFIG = config().line;
const CHANNEL_SECRET = LINE_CONFIG.channel_secret;
const CHANNEL_ACCESS_TOKEN = LINE_CONFIG.channel_access_token;

const buildSignature = requestBody =>
  createHmac('SHA256', CHANNEL_SECRET)
    .update(requestBody)
    .digest('base64');

const validateMessageDigest = (request) => {
  const signatureInHeader = request.headers[LINE_HEADER_NAME];
  const requestStr = JSON.stringify(request.body);
  const bodySignature = buildSignature(requestStr);

  return bodySignature === signatureInHeader;
};

const buildClient = () => new Client({ channelAccessToken: CHANNEL_ACCESS_TOKEN });

const extractReplyToken = (request) => request.body.events[0].replyToken;

const sendResponse = async (text: string, replyToken: string) => {
  const client = buildClient();

  try {
    await client.replyMessage(replyToken, { type: 'text', text });
    console.log('Successfully sent reply.');
  } catch (e) {
    console.error(e);
  }
};

export const handleLineRequest = async (request, response) => {
  let respMsg;
  console.log('Handling Line request.');

  if (validateMessageDigest(request)) {
    respMsg ='Request was valid.';
  } else {
    respMsg ='Request was invalid.';
  }

  console.log(`Sending back reply: "${respMsg}"`);
  await sendResponse(respMsg, extractReplyToken(request));
  response.end();
};
