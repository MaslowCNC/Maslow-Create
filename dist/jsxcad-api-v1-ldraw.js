import { fromLDraw, fromLDrawPart } from './jsxcad-convert-ldraw.js';
import { Shape } from './jsxcad-api-shape.js';
import { read } from './jsxcad-sys.js';

const readLDraw = async (path, { override, rebuild = false } = {}) => {
  const data = await read(`source/${path}`, { sources: [path] });
  return Shape.fromGeometry(await fromLDraw(data, { override, rebuild }));
};

const loadLDrawPart = async (part, { override, rebuild = false } = {}) =>
  Shape.fromGeometry(await fromLDrawPart(part, { override, rebuild }));

const LDraw = async (text, { override, rebuild = false } = {}) =>
  Shape.fromGeometry(
    await fromLDraw(new TextEncoder('utf8').encode(text), { override, rebuild })
  );

const api = { loadLDrawPart, readLDraw };

export { LDraw, api as default, loadLDrawPart, readLDraw };
