import * as functions from 'firebase-functions';
import { DialogflowApp } from 'actions-on-google';
import { LINE_HEADER_NAME, handleLineRequest } from './lineProcessor';

process.env.DEBUG = 'actions-on-google:*';

const QUERY_ACTION = 'query_action';

const getPrices = async (app) => {
  // const item = app.getArgument(ITEM_ARG);
  // console.log(`Received item: ${item}`);

  // const result = await addToShoppingList(item);
  // console.log(result);

  // const success = result.id !== null;

  // if (success) {
  //   app.tell(``);
  // } else {
  //   app.tell(``);
  // }
};

const hasLineHeader = request => !!request.headers[LINE_HEADER_NAME];

const ACTION_MAP = new Map();
ACTION_MAP.set(QUERY_ACTION, getPrices);

export const quote = functions.https.onRequest(async (request, response) => {
  console.log(`Request headers: ${JSON.stringify(request.headers)}`);
  console.log(`Request body: ${JSON.stringify(request.body)}`);

  if (hasLineHeader(request)) {
    await handleLineRequest(request, response);
  } else {
    const dfApp = new DialogflowApp({ request, response });
    dfApp.handleRequest(ACTION_MAP);
  }
});
