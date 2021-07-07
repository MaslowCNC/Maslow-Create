import { Shape, ensurePages } from './jsxcad-api-shape.js';
import { fromStl, toStl } from './jsxcad-convert-stl.js';
import { read, addPending, writeFile, getModule, generateUniqueId, write, getPendingErrorHandler, emit } from './jsxcad-sys.js';
import { hash } from './jsxcad-geometry.js';

const readStl = async (
  path,
  { src, format = 'ascii', geometry = 'graph' } = {}
) => {
  const data = await read(`source/${path}`, { sources: [path] });
  return Shape.fromGeometry(await fromStl(data, { format, geometry }));
};

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

const prepareStl = (shape, name, options = {}) => {
  const { prepareStl = (s) => s } = options;
  let index = 0;
  const entries = [];
  for (const entry of ensurePages(prepareStl(shape).toDisjointGeometry())) {
    const path = `stl/${getModule()}/${generateUniqueId()}`;
    const op = toStl(entry, options)
      .then((data) => write(path, data))
      .catch(getPendingErrorHandler());
    addPending(op);
    entries.push({
      // data: op,
      path,
      filename: `${name}_${index++}.stl`,
      type: 'application/sla',
    });
  }
  return entries;
};

const downloadStlMethod = function (name, options) {
  const entries = prepareStl(this, name, options);
  const download = { entries };
  // We should be saving the stl data in the filesystem.
  const hash$1 = hashSum({ name }) + hash(this.toGeometry());
  emit({ download, hash: hash$1 });
  return this;
};
Shape.prototype.downloadStl = downloadStlMethod;
Shape.prototype.stl = downloadStlMethod;

const writeStl = (shape, name, options = {}) => {
  for (const { data, filename } of prepareStl(shape, name, {})) {
    addPending(writeFile({ doSerialize: false }, `output/${filename}`, data));
  }
  return shape;
};

const method = function (...args) {
  return writeStl(this, ...args);
};
Shape.prototype.writeStl = method;

const api = {
  readStl,
  writeStl,
};

export default api;
export { readStl, writeStl };
