import { fromObjSync, fromObj as fromObj$1 } from './jsxcad-convert-obj.js';
import { Shape } from './jsxcad-api-shape.js';
import { read } from './jsxcad-sys.js';

const fromObj = async (data, { invert = false } = {}) =>
  Shape.fromGeometry(await fromObj$1(data, { invert }));

Shape.fromObj = (data, { invert = false } = {}) =>
  Shape.fromGeometry(
    fromObjSync(new TextEncoder('utf8').encode(data), { invert })
  );

const readObj = async (path, { src, invert = false } = {}) => {
  const data = await read(`source/${path}`, { sources: [path] });
  return Shape.fromGeometry(await fromObj$1(data, { invert }));
};

const api = {
  fromObj,
  readObj,
};

export default api;
export { fromObj, readObj };
