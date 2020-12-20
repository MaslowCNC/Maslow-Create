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

setupFilesystem({ fileBase: 'maslow' });

const agent = async ({
  ask,
  question
}) => {
    switch(question.key) {
      case "rectangle":
        const aSquare = api.Square(question.x, question.y);
        await api.saveGeometry(question.writePath, aSquare);
        return 1;
        break;
      case "circle":
        const aCircle = api.Circle(api.d(question.diameter, { sides: question.numSegments }));
        await api.saveGeometry(question.writePath, aCircle);
        return 1;
        break;
      case "extrude":
        const aShape = await api.loadGeometry(question.readPath);
        const extrudedShape = aShape.pull(question.distance);
        await api.saveGeometry(question.writePath, extrudedShape);
        return 1;
        break;
     case "translate":
        const aShape2Translate = await api.loadGeometry(question.readPath);
        const translatedShape = aShape2Translate.translate(question.x, question.y, question.z);
        await api.saveGeometry(question.writePath, translatedShape);
        return 1;
        break;
    case "rotate":
        const aShape2Rotate = await api.loadGeometry(question.readPath);
        const rotatedShape = aShape2Rotate.rotateX(question.x).rotateY(question.y).rotateZ(question.z);
        await api.saveGeometry(question.writePath, rotatedShape);
        return 1;
        break;
    case "difference":
        const aShape2Difference1 = await api.loadGeometry(question.readPath1);
        const aShape2Difference2 = await api.loadGeometry(question.readPath2);
        const cutShape = api.Difference(aShape2Difference1, aShape2Difference2);
        await api.saveGeometry(question.writePath, cutShape);
        return 1;
        break;
    case "intersection":
        const aShape2Intersect1 = await api.loadGeometry(question.readPath1);
        const aShape2Intersect2 = await api.loadGeometry(question.readPath2);
        const intersectionShape = api.Intersection(aShape2Intersect1,aShape2Intersect2);
        await api.saveGeometry(question.writePath, intersectionShape);
        return 1;
        break;
    case "union":
        var geometries = [];
        for (const path of question.paths) {
            const unionGeometry = await api.loadGeometry(path);
            geometries.push(unionGeometry);
        }
        const unionShape = api.Group(...geometries);
        await api.saveGeometry(question.writePath, unionShape);
        return 1;
        break;
    case "hull":
        var hullGeometries = [];
        for (const path of question.paths) {
            const hullGeometry = await api.loadGeometry(path);
            hullGeometries.push(hullGeometry);
        }
        const hullShape = api.Hull(...hullGeometries);
        await api.saveGeometry(question.writePath, hullShape);
        return 1;
        break;
    case "assembly":
        var assemblyGeometries = [];
        for (const path of question.paths) {
            const assemblyGeometry = await api.loadGeometry(path);
            assemblyGeometries.push(assemblyGeometry);
        }
        const assemblyShape = api.Assembly(...assemblyGeometries);
        await api.saveGeometry(question.writePath, assemblyShape);
        return 1;
        break;
    case "color":
        const shape2Color = await api.loadGeometry(question.readPath);
        const coloredShape = shape2Color.color(question.color);
        await api.saveGeometry(question.writePath, coloredShape);
        return 1;
        break;
    case "tag":
        const shape2tag = await api.loadGeometry(question.readPath);
        const taggedShape = shape2tag.as(question.tag);
        await api.saveGeometry(question.writePath, taggedShape);
        return 1;
        break;
    case "extractTag":
        const shape2extractFrom = await api.loadGeometry(question.readPath);
        const extractedShape = shape2extractFrom.keep(question.tag);
        await api.saveGeometry(question.writePath, extractedShape);
        return 1;
        break;
    case "display":
        if(question.readPath != null){
            const geometryToDisplay = await api.loadGeometry(question.readPath);
            const threejsGeometry = toThreejsGeometry(geometryToDisplay.toKeptGeometry());
            return threejsGeometry;
        }
        else{
            return -1;
        }
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
