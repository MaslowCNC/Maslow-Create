/* global Worker */

import { isBrowser, isNode } from './browserOrNode.js';
import { conversation } from './conversation.js';

// Sets up a worker with conversational interface.
export const createService = async ({ nodeWorker, webWorker, agent }) => {
  if (isNode) {
    console.log(`QQ/worker_threads/import`);
    const { Worker } = await import('worker_threads');
    console.log(`QQ/worker_threads/worker`);
    const worker = new Worker(nodeWorker);
    const say = (message) => worker.postMessage(message);
    const { ask, hear } = conversation({ agent, say });
    const stop = async () => {
      return new Promise((resolve, reject) => {
        worker.terminate((err, exitCode) => {
          if (err) {
            reject(err);
          } else {
            resolve(exitCode);
          }
        });
      });
    };
    console.log(`QQ/worker_threads/hear`);
    worker.on('message', hear);
    return { ask, stop };
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
