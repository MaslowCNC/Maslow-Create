import { Shape } from './jsxcad-api-shape.js';
import { fromDst } from './jsxcad-convert-dst.js';
import { read } from './jsxcad-sys.js';

/**
 *
 * # Read Data Stitch Tajima
 *
 * ::: illustration { "view": { "position": [0, 0, 200] } }
 * ```
 * await readDst({ path: 'dst/atg-sft003.dst',
 *               sources: [{ file: 'dst/atg-sft003.dst' },
 *                         { url: 'https://jsxcad.js.org/dst/atg-sft003.dst' }] })
 * ```
 * :::
 * ::: illustration { "view": { "position": [0, 0, 20] } }
 * ```
 * await readDst({ path: 'dst/atg-sft003.dst',
 *                 sources: [{ file: 'dst/atg-sft003.dst' },
 *                           { url: 'https://jsxcad.js.org/dst/atg-sft003.dst' }] })
 * ```
 * :::
 *
 **/

const readDst = async (path) => {
  let data = await read(`source/${path}`);
  if (data === undefined) {
    data = await read(`cache/${path}`, { doSerialize: false, sources: [path] });
  }
  return Shape.fromGeometry(await fromDst(data));
};

const api = { readDst };

export default api;
export { readDst };
