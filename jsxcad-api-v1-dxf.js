import Shape from './jsxcad-api-v1-shape.js';
import { fromDxf, toDxf } from './jsxcad-convert-dxf.js';
import { read, addPending, writeFile, getPendingErrorHandler, emit } from './jsxcad-sys.js';
import { ensurePages } from './jsxcad-api-v1-shapes.js';

const readDxf = async (path) => {
  let data = await read(`source/${path}`, { doSerialize: false });
  if (data === undefined) {
    data = await read(`cache/${path}`, { sources: [path] });
  }
  return Shape.fromGeometry(await fromDxf(data));
};

const prepareDxf = (shape, name, options = {}) => {
  let index = 0;
  const entries = [];
  for (const entry of ensurePages(shape.toKeptGeometry())) {
    const op = toDxf(entry, options).catch(getPendingErrorHandler());
    addPending(op);
    entries.push({
      data: op,
      filename: `${name}_${index++}.dxf`,
      type: 'application/dxf',
    });
  }
  return entries;
};

const downloadDxfMethod = function (...args) {
  const entries = prepareDxf(this, ...args);
  emit({ download: { entries } });
  return this;
};
Shape.prototype.downloadDxf = downloadDxfMethod;

const writeDxf = (shape, name, options = {}) => {
  for (const { data, filename } of prepareDxf(shape, name, {})) {
    addPending(writeFile({ doSerialize: false }, `output/${filename}`, data));
  }
  return shape;
};

const writeDxfMethod = function (...args) {
  return writeDxf(this, ...args);
};
Shape.prototype.writeDxf = writeDxfMethod;

const api = { readDxf, writeDxf };

export default api;
export { readDxf, writeDxf };
