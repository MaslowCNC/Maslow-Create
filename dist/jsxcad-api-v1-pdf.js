import { addPending, writeFile, getDefinitions, getPendingErrorHandler, emit } from './jsxcad-sys.js';
import Shape from './jsxcad-api-v1-shape.js';
import { ensurePages } from './jsxcad-api-v1-shapes.js';
import { hash } from './jsxcad-geometry.js';
import { toPdf } from './jsxcad-convert-pdf.js';

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

/*
export const preparePdf = (shape, name, { lineWidth = 0.096 } = {}) => {
  let index = 0;
  const entries = [];
  for (const entry of ensurePages(shape.toKeptGeometry())) {
    const { size } = entry.layout;
    const op = convertToPdf(entry, { lineWidth, size }).catch(
      getPendingErrorHandler()
    );
    addPending(op);
    entries.push({
      data: op,
      filename: `${name}_${index++}.pdf`,
      type: 'application/pdf',
    });
  }
  return entries;
};
*/

const preparePdf = (shape, name, options = {}) => {
  let index = 0;
  const entries = [];
  for (const entry of ensurePages(shape.toDisjointGeometry())) {
    const op = toPdf(entry, {
      definitions: getDefinitions(),
      ...options,
    }).catch(getPendingErrorHandler());
    addPending(op);
    entries.push({
      data: op,
      filename: `${name}_${index++}.pdf`,
      type: 'application/pdf',
    });
  }
  return entries;
};

const downloadPdfMethod = function (name, options = {}) {
  const entries = preparePdf(this, name, options);
  const download = { entries };
  const hash$1 = hashSum({ name, options }) + hash(this.toGeometry());
  emit({ download, hash: hash$1 });
  return this;
};
Shape.prototype.downloadPdf = downloadPdfMethod;
Shape.prototype.pdf = downloadPdfMethod;

const writePdf = (shape, name, { lineWidth = 0.096 } = {}) => {
  for (const { data, filename } of preparePdf(shape, name, { lineWidth })) {
    addPending(writeFile({ doSerialize: false }, `output/${filename}`, data));
  }
  return writePdf;
};

const writePdfMethod = function (...args) {
  return writePdf(this, ...args);
};
Shape.prototype.writePdf = writePdfMethod;

const api = { writePdf };

export default api;
export { writePdf };
