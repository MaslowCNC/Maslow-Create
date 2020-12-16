import { addPending, writeFile, getPendingErrorHandler, emit } from './jsxcad-sys.js';
import Shape from './jsxcad-api-v1-shape.js';
import { ensurePages } from './jsxcad-api-v1-layout.js';
import { hash } from './jsxcad-geometry-tagged.js';
import { toGcode } from './jsxcad-convert-gcode.js';

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

const prepareGcode = (shape, name, options = {}) => {
  let index = 0;
  const entries = [];
  for (const entry of ensurePages(shape.toKeptGeometry())) {
    const op = toGcode(entry, options).catch(getPendingErrorHandler());
    addPending(op);
    entries.push({
      data: op,
      filename: `${name}_${index++}.gcode`,
      // CHECK: Is this a reasonable mime type?
      type: 'application/x-gcode',
    });
  }
  return entries;
};

const downloadGcodeMethod = function (name, options = {}) {
  const entries = prepareGcode(this, name, options);
  const download = { entries };
  const hash$1 = hashSum({ name, options }) + hash(this.toGeometry());
  emit({ download, hash: hash$1 });
  return this;
};
Shape.prototype.downloadGcode = downloadGcodeMethod;

const writeGcode = (shape, name, options = {}) => {
  for (const { data, filename } of prepareGcode(shape, name, options)) {
    addPending(writeFile({ doSerialize: false }, `output/${filename}`, data));
  }
  return shape;
};

const writeGcodeMethod = function (...args) {
  return writeGcode(this, ...args);
};
Shape.prototype.writeGcode = writeGcodeMethod;

const api = { writeGcode };

export default api;
export { writeGcode };
