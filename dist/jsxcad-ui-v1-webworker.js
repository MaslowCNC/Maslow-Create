import * as baseApi from './jsxcad-api-v1.js';
import * as sys from './jsxcad-sys.js';

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
  await sys.resolvePending(); // Update the notebook.

  const notebook = sys.getEmitted(); // Resolve any promises.

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
  question
}) => {
  await sys.log({
    op: 'evaluate',
    status: 'run'
  });
  await sys.log({
    op: 'text',
    text: 'Evaluation Started'
  });
  let onEmitHandler;

  if (question.touchFile) {
    const {
      path,
      workspace
    } = question.touchFile;
    await sys.touch(path, {
      workspace
    });
  } else if (question.evaluate) {
    sys.setupFilesystem({
      fileBase: question.workspace
    });
    sys.clearEmitted();
    let nthNote = 0;
    onEmitHandler = sys.addOnEmitHandler(async (note, index) => {
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
        sys.pushModule(question.path);
        await module();
      } finally {
        sys.popModule();
      }

      await sys.log({
        op: 'text',
        text: 'Evaluation Succeeded',
        level: 'serious'
      });
      await sys.log({
        op: 'evaluate',
        status: 'success'
      }); // Wait for any pending operations.
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
    } finally {
      await resolveNotebook();
      await sys.resolvePending();
      ask({
        notebookLength: nthNote
      });
      sys.removeOnEmitHandler(onEmitHandler);
    }

    sys.setupFilesystem();
    return sys.getEmitted();
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
  } = sys.conversation({
    agent,
    say
  });
  self.ask = ask; // sys/log depends on ask, so set that up before we boot.

  await sys.boot();

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
