import { Shape, ensurePages } from './jsxcad-api-shape.js';
import { fromSvgPath, fromSvg, toSvg } from './jsxcad-convert-svg.js';
import { read, emit, getSourceLocation, generateUniqueId, addPending, write, getPendingErrorHandler } from './jsxcad-sys.js';
import { hash } from './jsxcad-geometry.js';

/**
 *
 * # Svg Path
 *
 * Generates a path from svg path data.
 *
 * ::: illustration
 * ```
 * SvgPath('M 120.25163,89.678938 C 105.26945,76.865343 86.290871,70.978848 64.320641,70.277872 z')
 *   .center()
 *   .scale(0.2)
 * ```
 * :::
 *
 **/

const SvgPath = (svgPath, options = {}) =>
  Shape.fromGeometry(
    fromSvgPath(new TextEncoder('utf8').encode(svgPath), options)
  );

const readSvg = async (path, { fill = true, stroke = true } = {}) => {
  const data = await read(`source/${path}`, { sources: [path] });
  if (data === undefined) {
    throw Error(`Cannot read svg from ${path}`);
  }
  return Shape.fromGeometry(
    await fromSvg(data, { doFill: fill, doStroke: stroke })
  );
};

/**
 *
 * # Read SVG path data
 *
 **/

const readSvgPath = async (options) => {
  if (typeof options === 'string') {
    options = { path: options };
  }
  const { path } = options;
  let data = await read(`source/${path}`);
  if (data === undefined) {
    data = await read(`cache/${path}`, { sources: [path] });
  }
  return Shape.fromGeometry(await fromSvgPath(options, data));
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

const prepareSvg = (shape, name, op = (s) => s, options = {}) => {
  const { path } = getSourceLocation();
  let index = 0;
  const entries = [];
  for (const entry of ensurePages(op(shape).toDisjointGeometry())) {
    const svgPath = `download/svg/${path}/${generateUniqueId()}`;
    const render = async () => {
      try {
        await write(svgPath, await toSvg(entry, options));
      } catch (error) {
        getPendingErrorHandler()(error);
      }
    };
    addPending(render());
    entries.push({
      path: svgPath,
      filename: `${name}_${index++}.svg`,
      type: 'image/svg+xml',
    });
    Shape.fromGeometry(entry).gridView(name, options.view);
  }
  return entries;
};

const svg =
  (name, op, options = {}) =>
  (shape) => {
    const entries = prepareSvg(shape, name, op, options);
    const download = { entries };
    const hash$1 = hashSum({ name, options }) + hash(shape.toGeometry());
    emit({ download, hash: hash$1 });
    return shape;
  };

Shape.registerMethod('svg', svg);

const api = { SvgPath, readSvg, readSvgPath, svg };

export { SvgPath, api as default, readSvg, readSvgPath, svg };
