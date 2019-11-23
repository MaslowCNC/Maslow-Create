/* global Worker */

import { isBrowser, isNode } from './browserOrNode.js';
import { conversation } from './conversation.js';

// Sets up a worker with conversational interface.
export const createService = async ({ nodeWorker, webWorker, agent }) => {
  if (isNode) {
    console.log(`This version doesn't work in node`);
  } else if (isBrowser) {
    const worker = new Worker(webWorker);
    const say = (message) => worker.postMessage(message);
    const { ask, hear } = conversation({ agent, say });
    worker.onmessage = ({ data }) => hear(data);
    return { ask };
  } else {
    throw Error('die');
  }
};
