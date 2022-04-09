import { fromThreejsToGeometry, fromColladaToThreejs, fromSvgToThreejs } from './jsxcad-convert-threejs.js';
import { Shape } from './jsxcad-api-shape.js';
import { read } from './jsxcad-sys.js';

const readCollada = async (path, { src, invert = false } = {}) => {
  const data = await read(`source/${path}`, { sources: [path] });
  return Shape.fromGeometry(
    await fromThreejsToGeometry(await fromColladaToThreejs(data))
  );
};

const readSvg = async (path, { src, invert = false } = {}) => {
  const data = await read(`source/${path}`, { sources: [path] });
  return Shape.fromGeometry(
    await fromThreejsToGeometry(await fromSvgToThreejs(data))
  );
};

const api = {
  readCollada,
  readSvg,
};

export { api as default, readCollada, readSvg };
