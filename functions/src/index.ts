import * as functions from 'firebase-functions';
import { LINE_HEADER_NAME, handleLineRequest } from './lineProcessor';
import { handleDialogFlowRequest } from './dfProcessor';

const hasLineHeader = request => !!request.headers[LINE_HEADER_NAME];

export const quote = functions.https.onRequest(async (request, response) => {
  console.log(`Request headers: ${JSON.stringify(request.headers)}`);
  console.log(`Request body: ${JSON.stringify(request.body)}`);

  if (hasLineHeader(request)) {
    await handleLineRequest(request, response);
  } else {
    handleDialogFlowRequest(request, response);
  }
});
