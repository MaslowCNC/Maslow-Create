import { fromLDraw, fromLDrawPart } from './jsxcad-convert-ldraw.js';
import { Shape } from './jsxcad-api-shape.js';
import { read } from './jsxcad-sys.js';

const readLDraw = async (path) => {
  const data = await read(`source/${path}`, { sources: [path] });
  return Shape.fromGeometry(await fromLDraw(data));
};

const loadLDrawPart = async (part) =>
  Shape.fromGeometry(await fromLDrawPart(part));

const api = { loadLDrawPart, readLDraw };

export { api as default, loadLDrawPart, readLDraw };
