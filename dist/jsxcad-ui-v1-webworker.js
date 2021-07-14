import * as sys from './jsxcad-sys.js';
import baseApi, { evaluate } from './jsxcad-api.js';

function pad (hash, len) {
  while (hash.length < len) {
    hash = '0' + hash;
  }
  return hash;
}

function fold (hash, text) {
  var i;
  var chr;
  var len;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash < 0 ? hash * -2 : hash;
}

function foldObject (hash, o, seen) {
  return Object.keys(o).sort().reduce(foldKey, hash);
  function foldKey (hash, key) {
    return foldValue(hash, o[key], key, seen);
  }
}

function foldValue (input, value, key, seen) {
  var hash = fold(fold(fold(input, key), toString(value)), typeof value);
  if (value === null) {
    return fold(hash, 'null');
  }
  if (value === undefined) {
    return fold(hash, 'undefined');
  }
  if (typeof value === 'object' || typeof value === 'function') {
    if (seen.indexOf(value) !== -1) {
      return fold(hash, '[Circular]' + key);
    }
    seen.push(value);

    var objHash = foldObject(hash, value, seen);

    if (!('valueOf' in value) || typeof value.valueOf !== 'function') {
      return objHash;
    }

    try {
      return fold(objHash, String(value.valueOf()))
    } catch (err) {
      return fold(objHash, '[valueOf exception]' + (err.stack || err.message))
    }
  }
  return fold(hash, value.toString());
}

function toString (o) {
  return Object.prototype.toString.call(o);
}

function sum (o) {
  return pad(foldValue(0, o, '', []).toString(16), 8);
}

var hashSum = sum;

/* global FileReaderSync, postMessage, onmessage:writable, self */

self.window = {};

const resolveNotebook = async () => {
  // Update the notebook.
  const notebook = sys.getEmitted(); // Resolve any promises.

  for (const note of notebook) {
    if (note.download) {
      for (const entry of note.download.entries) {
        entry.data = await entry.data;
      }
    }
  }

  await sys.resolvePending();
};

const say = message => {
  // console.log(`QQ/webworker/say: ${JSON.stringify(message)}`);
  postMessage(message);
};

const reportError = error => {
  const entry = {
    text: error.stack ? error.stack : error,
    level: 'serious'
  };
  const hash = hashSum(entry);
  sys.emit({
    error: entry,
    hash
  });
  sys.log({
    op: 'text',
    text: error.stack ? error.stack : error,
    level: 'serious'
  });
};

sys.setPendingErrorHandler(reportError);

const agent = async ({
  ask,
  message,
  type,
  tell
}) => {
  const {
    op
  } = message;
  await sys.log({
    op: 'evaluate',
    status: 'run'
  });
  await sys.log({
    op: 'text',
    text: 'Evaluation Started'
  });
  const {
    offscreenCanvas,
    id,
    path,
    workspace,
    script,
    sha = 'master',
    view
  } = message;

  if (workspace) {
    sys.setupFilesystem({
      fileBase: workspace
    });
  }

  try {
    switch (op) {
      case 'sys/attach':
        self.id = id;
        return;

      case 'sys/touch':
        if (id === undefined || id !== self.id) {
          // Don't respond to touches from ourself.
          await sys.touch(path, {
            workspace,
            clear: true,
            broadcast: false
          });
        }

        return;

      case 'staticView':
        sys.info('Load Geometry');
        const geometry = await sys.readOrWatch(path, {
          workspace
        });
        const {
          staticView
        } = await import('./jsxcad-ui-threejs.js');
        sys.info('Render');
        await staticView(baseApi.Shape.fromGeometry(geometry), { ...view,
          canvas: offscreenCanvas
        });
        sys.info('Convert to PNG');
        const blob = await offscreenCanvas.convertToBlob({
          type: 'image/png'
        });
        const dataURL = new FileReaderSync().readAsDataURL(blob);
        sys.info('Done');
        return dataURL;

      case 'evaluate':
        sys.clearEmitted();

        try {
          // console.log({ op: 'text', text: `QQ/script: ${script}` });
          const api = { ...baseApi,
            sha
          };
          await evaluate(script, {
            api,
            path
          });
          await sys.log({
            op: 'text',
            text: 'Evaluation Succeeded',
            level: 'serious'
          });
          await sys.log({
            op: 'evaluate',
            status: 'success'
          }); // Wait for any pending operations.

          await resolveNotebook(); // Finally answer the top level question.

          return true;
        } catch (error) {
          reportError(error);
          await sys.log({
            op: 'text',
            text: 'Evaluation Failed',
            level: 'serious'
          });
          await sys.log({
            op: 'evaluate',
            status: 'failure'
          });
          await resolveNotebook();
          return false;
        }

      default:
        throw Error(`Unknown operation ${op}`);
    }
  } catch (error) {
    sys.info(error.stack);
  }
}; // We need to start receiving messages immediately, but we're not ready to process them yet.
// Put them in a buffer.


const messageBootQueue = [];

onmessage = ({
  data
}) => messageBootQueue.push(data);

const bootstrap = async () => {
  const {
    ask,
    hear,
    tell
  } = sys.createConversation({
    agent,
    say
  });
  self.ask = ask;
  self.tell = tell; // sys/log depends on ask, so set that up before we boot.

  await sys.boot();
  sys.addOnEmitHandler(async (note, index) => {
    if (note.download) {
      for (const entry of note.download.entries) {
        entry.data = await entry.data;
      }
    } // console.log(`QQ/webworker/emitHandler: ${JSON.stringify(note)}`);


    self.tell({
      op: 'note',
      note
    });
  });

  onmessage = ({
    data
  }) => hear(data); // Now that we're ready, drain the buffer.


  if (self.messageBootQueue !== undefined) {
    while (self.messageBootQueue.length > 0) {
      hear(self.messageBootQueue.shift());
    }
  }

  while (messageBootQueue.length > 0) {
    hear(messageBootQueue.shift());
  }

  if (onmessage === undefined) throw Error('die');
};

bootstrap();
