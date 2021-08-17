import { fromOffSync, fromOff as fromOff$1 } from './jsxcad-convert-off.js';
import { Shape } from './jsxcad-api-shape.js';
import { read } from './jsxcad-sys.js';

const fromOff = async (data, { invert = false } = {}) =>
  Shape.fromGeometry(await fromOff$1(data, { invert }));

Shape.fromOff = (data, { invert = false } = {}) =>
  Shape.fromGeometry(
    fromOffSync(new TextEncoder('utf8').encode(data), { invert })
  );

const readOff = async (path, { src, invert = false } = {}) => {
  const data = await read(`source/${path}`, { sources: [path] });
  return Shape.fromGeometry(await fromOff$1(data, { invert }));
};

const api = {
  fromOff,
  readOff,
};

export { api as default, fromOff, readOff };
