import * as functions from 'firebase-functions';
import { DialogflowApp } from 'actions-on-google';

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

const ACTION_MAP = new Map();
ACTION_MAP.set(QUERY_ACTION, getPrices);

export const onRequest = functions.https.onRequest((request, response) => {
  const dfApp = new DialogflowApp({ request, response });
  console.log(`Request headers: ${JSON.stringify(request.headers)}`);
  console.log(`Request body: ${JSON.stringify(request.body)}`);

  dfApp.handleRequest(ACTION_MAP);
});
