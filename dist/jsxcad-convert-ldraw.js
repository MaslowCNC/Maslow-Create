import { fromPolygons, rotateX, scale, transformCoordinate } from './jsxcad-geometry.js';
import { read } from './jsxcad-sys.js';

const transform = (matrix, polygons) =>
  polygons.map((polygon) => ({
    ...polygon,
    points: polygon.points.map((point) => transformCoordinate(point, matrix)),
  }));

const RESOLUTION = 10000;

const URL_PREFIX = 'https://jsxcad.js.org/ldraw/ldraw';

// Three numerics at the start seem to indicate parts vs primitives.

const readPart = async (part, { allowFetch = true } = {}) => {
  part = part.toLowerCase().replace(/\\/, '/');
  if (part.match(/^u[0-9]{4}/)) {
    return read(`cache/ldraw/part/${part}`, {
      sources: [`${URL_PREFIX}/parts/${part}`],
    });
  } else if (part.match(/^[0-9]{3}/)) {
    return read(`cache/ldraw/part/${part}`, {
      sources: [`${URL_PREFIX}/parts/${part}`],
    });
  } else if (part.match(/^s[/]/)) {
    return read(`cache/ldraw/part/${part}`, {
      sources: [`${URL_PREFIX}/parts/${part}`],
    });
  } else if (part.match(/^48[/]/)) {
    return read(`cache/ldraw/primitive/${part}`, {
      sources: [`${URL_PREFIX}/p/${part}`],
    });
  } else {
    return read(`cache/ldraw/primitive/${part}`, {
      sources: [`${URL_PREFIX}/p/48/${part}`, `${URL_PREFIX}/p/${part}`],
    });
  }
};

const fromDataToCode = (data) => {
  const code = [];
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
  const data = await readPart(part, { allowFetch });
  const code = fromDataToCode(data);
  return fromCodeToPolygons(code, { allowFetch, invert, stack });
};

const fromCodeToPolygons = async (
  code,
  { allowFetch = true, invert = false, stack = [] }
) => {
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
        let matrix = [
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
          1.0,
        ];
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
        if (Direction() === 'CW') {
          polygons.push({ points: polygon.reverse() });
        } else {
          polygons.push({ points: polygon });
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
          polygons.push({ points: [p[3], p[1], p[0]] });
          polygons.push({ points: [p[1], p[3], p[2]] });
        } else {
          polygons.push({ points: [p[0], p[1], p[3]] });
          polygons.push({ points: [p[2], p[3], p[1]] });
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

const fromLDrawPart = async (part, { allowFetch = true } = {}) => {
  const polygons = await fromPartToPolygons(`${part}.dat`, { allowFetch });
  const geometry = fromPolygons({}, polygons);
  return rotateX(-90, scale([0.4, 0.4, 0.4], geometry));
};

const fromLDraw = async (data, { allowFetch = true } = {}) => {
  const code = fromDataToCode(data);
  const polygons = await fromCodeToPolygons(code, { allowFetch });
  const geometry = fromPolygons(polygons);
  return rotateX(-90, scale([0.4, 0.4, 0.4], geometry));
};

export { fromLDraw, fromLDrawPart };
