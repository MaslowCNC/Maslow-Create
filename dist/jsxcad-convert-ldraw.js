import { isStrictlyCoplanar, flip } from './jsxcad-math-poly3.js';
import { rotateX, scale, fromPolygons } from './jsxcad-geometry-solid.js';
import { fromValues } from './jsxcad-math-mat4.js';
import { readFile } from './jsxcad-sys.js';
import { transform } from './jsxcad-geometry-polygons.js';

const RESOLUTION = 10000;

const URL_PREFIX = 'https://jsxcad.js.org/ldraw/ldraw';

const readPart = async (part, { allowFetch = true } = {}) => {
  const sources = [
    `${URL_PREFIX}/parts/${part}`,
    `${URL_PREFIX}/p/48/${part}`,
    `${URL_PREFIX}/p/${part}`,
  ];
  if (!allowFetch) sources.length = 0;
  part = part.toLowerCase().replace(/\\/, '/');
  const parts = await readFile(
    { allowFetch, ephemeral: true, sources, decode: 'utf8' },
    `cache/ldraw/parts/${part}`
  );
  const p48 = await readFile(
    { allowFetch, ephemeral: true, sources, decode: 'utf8' },
    `cache/ldraw/p48/${part}`
  );
  const p = await readFile(
    { allowFetch, ephemeral: true, sources, decode: 'utf8' },
    `cache/ldraw/p/${part}`
  );
  return parts || p48 || p;
};

const loadPart = async (part, { allowFetch = true } = {}) => {
  const code = [];
  const data = await readPart(part, { allowFetch });
  const source = new TextDecoder('utf8').decode(data);
  for (let line of source.split('\r\n')) {
    let args = line.replace(/^\s+/, '').split(/\s+/);
    code.push(args);
  }
  return { type: source.type, code: code, name: source.name };
};

const flt = (text) => parseFloat(text);
const ldu = (text) => Math.round(flt(text) * RESOLUTION) / RESOLUTION;

const fromPartToPolygons = async (
  part,
  { allowFetch = true, invert = false, stack = [] }
) => {
  let code = await loadPart(part, { allowFetch });
  let polygons = [];
  let direction = 'CCW';
  let invertNext = 0;

  function Direction() {
    if (invert) {
      return { CCW: 'CW', CW: 'CCW' }[direction];
    } else {
      return direction;
    }
  }

  for (let args of code.code) {
    switch (parseInt(args[0])) {
      case 0: {
        // meta
        switch (args[1]) {
          case 'BFC':
            switch (args[2]) {
              case 'CERTIFY': {
                switch (args[3]) {
                  case 'CW': {
                    direction = 'CW';
                    break;
                  }
                  case 'CCW': {
                    direction = 'CCW';
                    break;
                  }
                }
                break;
              }
              case 'INVERTNEXT': {
                invertNext = 2;
                break;
              }
            }
            break;
        }
        break;
      }
      case 1: {
        // sub-part
        let [, , x, y, z, a, b, c, d, e, f, g, h, i, subPart] = args;
        let subInvert = invert;
        if (invertNext > 0) {
          subInvert = !subInvert;
        }
        stack.push(subPart);
        let matrix = fromValues(
          flt(a),
          flt(d),
          flt(g),
          0.0,
          flt(b),
          flt(e),
          flt(h),
          0.0,
          flt(c),
          flt(f),
          flt(i),
          0.0,
          ldu(x),
          ldu(y),
          ldu(z),
          1.0
        );
        polygons.push(
          ...transform(
            matrix,
            await fromPartToPolygons(subPart, {
              invert: subInvert,
              stack,
              allowFetch,
            })
          )
        );
        stack.pop();
        break;
      }
      case 2: {
        // display line
        break;
      }
      case 3: {
        // triangle
        let [, , x1, y1, z1, x2, y2, z2, x3, y3, z3] = args;
        let polygon = [
          [ldu(x1), ldu(y1), ldu(z1)],
          [ldu(x2), ldu(y2), ldu(z2)],
          [ldu(x3), ldu(y3), ldu(z3)],
        ];
        if (!isStrictlyCoplanar(polygon)) throw Error('die');
        if (Direction() === 'CW') {
          polygons.push(flip(polygon));
        } else {
          polygons.push(polygon);
        }
        break;
      }
      case 4: {
        // quad
        let [, , x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4] = args;
        let p = [
          [ldu(x1), ldu(y1), ldu(z1)],
          [ldu(x2), ldu(y2), ldu(z2)],
          [ldu(x3), ldu(y3), ldu(z3)],
          [ldu(x4), ldu(y4), ldu(z4)],
        ];
        if (Direction() === 'CW') {
          if (isStrictlyCoplanar(p)) {
            polygons.push(flip(p));
          } else {
            polygons.push(flip([p[0], p[1], p[3]]));
            polygons.push(flip([p[2], p[3], p[1]]));
          }
        } else {
          if (isStrictlyCoplanar(p)) {
            polygons.push(p);
          } else {
            polygons.push([p[0], p[1], p[3]]);
            polygons.push([p[2], p[3], p[1]]);
          }
        }
        break;
      }
    }
    if (invertNext > 0) {
      invertNext -= 1;
    }
  }
  return polygons;
};

const fromLDraw = async (part, { allowFetch = true } = {}) => ({
  type: 'solid',
  solid: rotateX(
    (-90 * Math.PI) / 180,
    scale(
      [0.4, 0.4, 0.4],
      fromPolygons(await fromPartToPolygons(`${part}.dat`, { allowFetch }))
    )
  ),
});

export { fromLDraw };
