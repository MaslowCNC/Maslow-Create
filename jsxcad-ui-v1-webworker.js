import * as baseApi from './jsxcad-api-v1.js';
import { setPendingErrorHandler, emit, log, conversation, boot, touch, setupFilesystem, clearEmitted, addOnEmitHandler, pushModule, popModule, resolvePending, removeOnEmitHandler, getEmitted } from './jsxcad-sys.js';

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

/* global postMessage, onmessage:writable, self */

const resolveNotebook = async () => {
  await resolvePending(); // Update the notebook.

  const notebook = getEmitted(); // Resolve any promises.

  for (const note of notebook) {
    if (note.download) {
      for (const entry of note.download.entries) {
        entry.data = await entry.data;
      }
    }
  }
};

const say = message => postMessage(message);

const reportError = error => {
  const entry = {
    text: error.stack ? error.stack : error,
    level: 'serious'
  };
  const hash = hashSum(entry);
  emit({
    error: entry,
    hash
  });
  log({
    op: 'text',
    text: error.stack ? error.stack : error,
    level: 'serious'
  });
};

setPendingErrorHandler(reportError);

const agent = async ({
  ask,
  question
}) => {
  await log({
    op: 'evaluate',
    status: 'run'
  });
  await log({
    op: 'text',
    text: 'Evaluation Started'
  });
  let onEmitHandler;

  if (question.touchFile) {
    const {
      path,
      workspace
    } = question.touchFile;
    await touch(path, {
      workspace
    });
  } else if (question.evaluate) {
    setupFilesystem({
      fileBase: question.workspace
    });
    clearEmitted();
    let nthNote = 0;
    onEmitHandler = addOnEmitHandler(async (note, index) => {
      nthNote += 1;

      if (note.download) {
        for (const entry of note.download.entries) {
          entry.data = await entry.data;
        }
      }

      ask({
        note,
        index
      });
    });

    try {
      const ecmascript = question.evaluate;
      console.log({
        op: 'text',
        text: `QQ/script: ${question.evaluate}`
      });
      console.log({
        op: 'text',
        text: `QQ/ecmascript: ${ecmascript}`
      });
      const api = { ...baseApi,
        sha: question.sha || 'master'
      };
      const builder = new Function(`{ ${Object.keys(api).join(', ')} }`, `return async () => { ${ecmascript} };`);
      const module = await builder(api);

      try {
        pushModule(question.path);
        await module();
      } finally {
        popModule();
      }

      await log({
        op: 'text',
        text: 'Evaluation Succeeded',
        level: 'serious'
      });
      await log({
        op: 'evaluate',
        status: 'success'
      }); // Wait for any pending operations.
    } catch (error) {
      reportError(error);
      await log({
        op: 'text',
        text: 'Evaluation Failed',
        level: 'serious'
      });
      await log({
        op: 'evaluate',
        status: 'failure'
      });
    } finally {
      await resolveNotebook();
      await resolvePending();
      ask({
        notebookLength: nthNote
      });
      removeOnEmitHandler(onEmitHandler);
    }

    setupFilesystem();
    return getEmitted();
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
    hear
  } = conversation({
    agent,
    say
  });
  self.ask = ask; // sys/log depends on ask, so set that up before we boot.

  await boot();

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
