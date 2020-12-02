import * as api from './jsxcad-api-v1.js';
import { setPendingErrorHandler, emit, log, boot, conversation, setupFilesystem, clearEmitted, addOnEmitHandler, pushModule, popModule, resolvePending, removeOnEmitHandler, getEmitted, writeFile, readFile } from './jsxcad-sys.js';
import { toThreejsGeometry } from './jsxcad-convert-threejs.js';

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
    console.log(question.key);
    
    switch(question.key) {
      case "rectangle":
        console.log("Case rectangle recognized");
        console.log(question.writePath);
        const aSquare = api.Square(question.x,question.y);
        await api.saveGeometry(question.writePath, aSquare);
        return 1;
        break;
      case "extrude":
        console.log("Case extrude recognized");
        const aShape = await api.loadGeometry(question.readPath);
        const extrudedShape = aShape.pull(question.distance);
        await api.saveGeometry(question.writePath, extrudedShape);
        return 1;
      case "display":
        console.log("Case display recognized");
        const anotherCube = await api.loadGeometry(question.readPath);
        const threejsGeometry = toThreejsGeometry(anotherCube.toKeptGeometry());
        return threejsGeometry;
        break;
      default:
        console.log("Unable to process command: " + question.key);
    }
}; 


const messageBootQueue = [];

onmessage = ({
  data
}) => messageBootQueue.push(data);

const bootstrap = async () => {
  await boot();
  const {
    ask,
    hear
  } = conversation({
    agent,
    say
  });
  self.ask = ask;

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
