import { fromPolygons, rotateX, scale, taggedGroup, read, write, transformCoordinate, transform as transform$1 } from './jsxcad-geometry.js';
import { read as read$1 } from './jsxcad-sys.js';

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
  const maybe = (type) => type;
  if (part.match(/^u[0-9]{4}/)) {
    return {
      path: `cache/ldraw/part/${part}`,
      sources: [`${URL_PREFIX}/parts/${part}`],
      type: maybe('part'),
    };
  } else if (part.match(/^[0-9]{3}/)) {
    return {
      path: `cache/ldraw/part/${part}`,
      sources: [`${URL_PREFIX}/parts/${part}`],
      type: maybe('part'),
    };
  } else if (part.match(/^s[/]/)) {
    return {
      path: `cache/ldraw/part/${part}`,
      sources: [`${URL_PREFIX}/parts/${part}`],
      type: maybe('subpart'),
    };
  } else if (part.match(/^48[/]/)) {
    return {
      path: `cache/ldraw/primitive/${part}`,
      sources: [`${URL_PREFIX}/p/${part}`],
      type: maybe('primitive'),
    };
  } else {
    return {
      path: `cache/ldraw/primitive/${part}`,
      sources: [`${URL_PREFIX}/p/48/${part}`, `${URL_PREFIX}/p/${part}`],
      type: maybe('primitive'),
    };
  }
};

const fromDataToCode = (data) => {
  const code = [];
  const source = new TextDecoder('utf8').decode(data);
  for (let line of source.split(/\r?\n/)) {
    let args = line.toLowerCase().replace(/^\s+/, '').split(/\s+/);
    code.push(args);
  }
  return { type: source.type, code: code, name: source.name };
};

const flt = (text) => parseFloat(text);
const ldu = (text) => Math.round(flt(text) * RESOLUTION) / RESOLUTION;

const fromPartToPolygons = async (
  part,
  {
    allowFetch = true,
    invert = false,
    stack = [],
    top = false,
    override,
    rebuild,
  }
) => {
  if (override && override[part]) {
    return override[part];
  }
  const { path, sources, type } = await readPart(part, { allowFetch });
  if (!rebuild && type === 'part') {
    const geometry = await read(`cache/ldraw/geometry/${part}`);
    if (geometry) {
      console.log(`fromLDraw: Using cached ${part}`);
      return { content: [geometry] };
    }
  }
  const data = read$1(path, { sources });
  const code = fromDataToCode(await data);
  if (type === 'part') {
    console.log(`fromLDraw: Computing ${part}`);
  }
  const { polygons, content } = await fromCodeToPolygons(code, {
    allowFetch,
    invert,
    stack,
    override,
    rebuild,
  });
  if (type === 'part' /* && top */) {
    if (polygons.length > 0) {
      const geometry = fromPolygons(polygons, {
        tags: [`ldraw:${part}`],
        tolerance: 0.1,
        close: false,
      });
      await write(`cache/ldraw/geometry/${part}`, geometry);
      console.log(`fromLDraw: Saving geometry for ${part}`);
      return { content: [geometry] };
    } else {
      return { content };
    }
  } else {
    return { content, polygons };
  }
};

const fromCodeToPolygons = async (
  code,
  {
    allowFetch = true,
    invert = false,
    stack = [],
    top = false,
    override,
    rebuild,
  }
) => {
  const content = [];
  const polygons = [];
  let direction = 'ccw';
  let invertNext = 0;

  function Direction() {
    if (invert) {
      return { ccw: 'cw', cw: 'ccW' }[direction];
    } else {
      return direction;
    }
  }

  for (let args of code.code) {
    switch (parseInt(args[0])) {
      case 0: {
        // meta
        switch (args[1]) {
          case 'bfc':
            switch (args[2]) {
              case 'certify': {
                switch (args[3]) {
                  case 'cw': {
                    direction = 'cw';
                    break;
                  }
                  case 'ccw': {
                    direction = 'ccw';
                    break;
                  }
                }
                break;
              }
              case 'invertnext': {
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

        if (a < 0) {
          subInvert = !subInvert;
        }
        if (e < 0) {
          subInvert = !subInvert;
        }
        if (i < 0) {
          subInvert = !subInvert;
        }

        const { polygons: partPolygons, content: partContent } =
          await fromPartToPolygons(subPart, {
            invert: subInvert,
            stack,
            allowFetch,
            top,
            override,
            rebuild,
          });
        if (partPolygons) {
          polygons.push(...transform(matrix, partPolygons));
        }
        if (partContent) {
          content.push(
            ...partContent.map((geometry) =>
              transform$1(matrix, geometry)
            )
          );
        }
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
        let p = [
          [ldu(x1), ldu(y1), ldu(z1)],
          [ldu(x2), ldu(y2), ldu(z2)],
          [ldu(x3), ldu(y3), ldu(z3)],
        ];
        if (Direction() === 'cw') {
          polygons.push({ points: [p[2], p[1], p[0]] });
        } else {
          polygons.push({ points: [p[0], p[1], p[2]] });
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
        if (Direction() === 'cw') {
          polygons.push({ points: [p[3], p[1], p[0]] });
          polygons.push({ points: [p[3], p[2], p[1]] });
        } else {
          polygons.push({ points: [p[0], p[1], p[3]] });
          polygons.push({ points: [p[1], p[2], p[3]] });
        }
        break;
      }
    }
    if (invertNext > 0) {
      invertNext -= 1;
    }
  }
  return { polygons, content };
};

const fromLDrawPart = async (
  part,
  { allowFetch = true, override, rebuild = false } = {}
) => {
  console.log(
    `================================================================================`
  );
  const { content = [], polygons } = await fromPartToPolygons(`${part}.dat`, {
    allowFetch,
    top: true,
    override,
    rebuild,
  });
  if (polygons) {
    content.push(
      fromPolygons(polygons, {
        tags: ['ldraw:data'],
        tolerance: 0.1,
        close: false,
      })
    );
  }
  return rotateX(-1 / 4, scale([0.4, 0.4, 0.4], taggedGroup({}, ...content)));
};

const fromLDraw = async (
  data,
  { allowFetch = true, override, rebuild = false } = {}
) => {
  console.log(
    `================================================================================`
  );
  const code = fromDataToCode(data);
  const { content = [], polygons } = await fromCodeToPolygons(code, {
    allowFetch,
    top: true,
    override,
    rebuild,
  });
  if (polygons) {
    content.push(
      fromPolygons(polygons, {
        tags: ['ldraw:data'],
        tolerance: 0.1,
        close: false,
      })
    );
  }
  return rotateX(-1 / 4, scale([0.4, 0.4, 0.4], taggedGroup({}, ...content)));
};

export { fromLDraw, fromLDrawPart };
