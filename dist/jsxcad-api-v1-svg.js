import Shape$1, { Shape } from './jsxcad-api-v1-shape.js';
import { fromSvgPath, fromSvg, toSvg } from './jsxcad-convert-svg.js';
import { read, addPending, writeFile, getPendingErrorHandler, emit } from './jsxcad-sys.js';
import { ensurePages } from './jsxcad-api-v1-layout.js';

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

const readSvg = async (path) => {
  const data = await read(`source/${path}`, { sources: [path] });
  if (data === undefined) {
    throw Error(`Cannot read svg from ${path}`);
  }
  return Shape$1.fromGeometry(await fromSvg(data));
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
  return Shape$1.fromGeometry(await fromSvgPath(options, data));
};

const prepareSvg = (shape, name, options = {}) => {
  let index = 0;
  const entries = [];
  for (const entry of ensurePages(shape.toKeptGeometry())) {
    const op = toSvg(entry, options).catch(getPendingErrorHandler());
    addPending(op);
    entries.push({
      data: op,
      filename: `${name}_${index++}.svg`,
      type: 'image/svg+xml',
    });
  }
  return entries;
};

const downloadSvgMethod = function (...args) {
  const entries = prepareSvg(this, ...args);
  emit({ download: { entries } });
  return this;
};
Shape$1.prototype.downloadSvg = downloadSvgMethod;

const writeSvg = (shape, name, options = {}) => {
  for (const { data, filename } of prepareSvg(shape, name, {})) {
    addPending(writeFile({ doSerialize: false }, `output/${filename}`, data));
  }
  return shape;
};

const writeSvgMethod = function (...args) {
  return writeSvg(this, ...args);
};
Shape$1.prototype.writeSvg = writeSvgMethod;

const api = { SvgPath, readSvg, readSvgPath, writeSvg };

export default api;
export { SvgPath, readSvg, readSvgPath, writeSvg };
