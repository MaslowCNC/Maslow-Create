import { getModule, generateUniqueId, addPending, write, emit, getControlValue, addSource, hash, addOnEmitHandler, read, elapsed, info, pushModule, popModule } from './jsxcad-sys.js';
export { elapsed, emit, info, read, write } from './jsxcad-sys.js';
import Shape, { Shape as Shape$1, add, and, addTo, align, as, bend, clip, clipFrom, color, colors, cut, cutFrom, drop, fuse, grow, inset, keep, loadGeometry, loft, log, loop, material, minkowskiDifference, minkowskiShell, minkowskiSum, move, noVoid, notAs, offset, op, pack, push, peg, remesh, rotate, rx, ry, rz, rotateX, rotateY, rotateZ, saveGeometry, scale, smooth, size, sketch, split, tags, test, tint, tool, twist, voidFn, weld, withFn, withInset, withOp, x, y, z } from './jsxcad-api-v1-shape.js';
export { Shape, add, addTo, align, and, as, bend, clip, clipFrom, color, colors, cut, cutFrom, drop, fuse, grow, inset, keep, loadGeometry, loft, log, loop, material, minkowskiDifference, minkowskiShell, minkowskiSum, move, noVoid, notAs, offset, op, pack, peg, push, remesh, rotate, rotateX, rotateY, rotateZ, rx, ry, rz, saveGeometry, scale, size, sketch, smooth, split, tags, test, tint, tool, twist, voidFn, weld, withFn, withInset, withOp, x, y, z } from './jsxcad-api-v1-shape.js';
import { ensurePages, Peg, Arc, Assembly, Box, ChainedHull, Cone, Empty, Group, Hershey, Hexagon, Hull, Icosahedron, Implicit, Line, LoopedHull, Octagon, Orb, Page, Path, Pentagon, Plan, Plane, Point, Points, Polygon, Polyhedron, Septagon, Spiral, Tetragon, Triangle, Wave, Weld, ofPlan } from './jsxcad-api-v1-shapes.js';
export { Arc, Assembly, Box, ChainedHull, Cone, Empty, Group, Hershey, Hexagon, Hull, Icosahedron, Implicit, Line, LoopedHull, Octagon, Orb, Page, Path, Peg, Pentagon, Plan, Plane, Point, Points, Polygon, Polyhedron, Septagon, Spiral, Tetragon, Triangle, Wave, Weld, ofPlan } from './jsxcad-api-v1-shapes.js';
import './jsxcad-api-v1-extrude.js';
import './jsxcad-api-v1-gcode.js';
import './jsxcad-api-v1-pdf.js';
import './jsxcad-api-v1-tools.js';
import { Item } from './jsxcad-api-v1-item.js';
export { Item } from './jsxcad-api-v1-item.js';
import { Noise, Random, acos, cos, each, ease, max, min, numbers, sin, sqrt, vec, zag } from './jsxcad-api-v1-math.js';
export { Noise, Random, acos, cos, each, ease, max, min, numbers, sin, sqrt, vec, zag } from './jsxcad-api-v1-math.js';
import { readSvg } from './jsxcad-api-v1-svg.js';
export { readSvg } from './jsxcad-api-v1-svg.js';
import { readStl } from './jsxcad-api-v1-stl.js';
export { readStl } from './jsxcad-api-v1-stl.js';
import { readObj } from './jsxcad-api-v1-obj.js';
export { readObj } from './jsxcad-api-v1-obj.js';
import { readOff } from './jsxcad-api-v1-off.js';
export { readOff } from './jsxcad-api-v1-off.js';
import { foot, inch, mm, mil, cm, m, thou, yard } from './jsxcad-api-v1-units.js';
export { cm, foot, inch, m, mil, mm, thou, yard } from './jsxcad-api-v1-units.js';
import { toEcmascript } from './jsxcad-compiler.js';
import { toSvg } from './jsxcad-convert-svg.js';

// FIX: Avoid the extra read-write cycle.
const view = (
  shape,
  {
    size,
    skin = true,
    outline = true,
    wireframe = false,
    prepareView = (x) => x,
    inline,
    width = 1024,
    height = 512,
    position = [100, -100, 100],
    withAxes = false,
    withGrid = false,
  } = {}
) => {
  if (size !== undefined) {
    width = size;
    height = size / 2;
  }
  const viewShape = prepareView(shape);
  for (const entry of ensurePages(
    viewShape.toDisplayGeometry({ skin, outline, wireframe })
  )) {
    const path = `view/${getModule()}/${generateUniqueId()}`;
    addPending(write(path, entry));
    const view = { width, height, position, inline, withAxes, withGrid };
    emit({ hash: generateUniqueId(), path, view });
  }
  return shape;
};

Shape.prototype.view = function ({
  size = 512,
  skin = true,
  outline = true,
  wireframe = false,
  prepareView,
  path,
  width = 1024,
  height = 512,
  position = [100, -100, 100],
  withAxes,
  withGrid,
} = {}) {
  return view(this, {
    size,
    skin,
    outline,
    wireframe,
    prepareView,
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.topView = function ({
  size = 512,
  skin = true,
  outline = true,
  wireframe = false,
  prepareView,
  path,
  width = 1024,
  height = 512,
  position = [0, 0, 100],
  withAxes,
  withGrid,
} = {}) {
  return view(this, {
    size,
    skin,
    outline,
    wireframe,
    prepareView,
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.gridView = function ({
  size = 512,
  skin = true,
  outline = true,
  wireframe = false,
  prepareView,
  path,
  width = 1024,
  height = 512,
  position = [0, 0, 100],
  withAxes,
  withGrid = true,
} = {}) {
  return view(this, {
    size,
    skin,
    outline,
    wireframe,
    prepareView,
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.frontView = function ({
  size = 512,
  skin = true,
  outline = true,
  wireframe = false,
  prepareView,
  path,
  width = 1024,
  height = 512,
  position = [0, -100, 0],
  withAxes,
  withGrid,
} = {}) {
  return view(this, {
    size,
    skin,
    outline,
    wireframe,
    prepareView,
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.sideView = function ({
  size = 512,
  skin = true,
  outline = true,
  wireframe = false,
  prepareView,
  path,
  width = 1024,
  height = 512,
  position = [100, 0, 0],
  withAxes,
  withGrid,
} = {}) {
  return view(this, {
    size,
    skin,
    outline,
    wireframe,
    prepareView,
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

function pad (hash, len) {
  while (hash.length < len) {
    hash = '0' + hash;
  }
  return hash;
}

function fold (hash, text) {
  var i;
  var chr;
  var len;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash < 0 ? hash * -2 : hash;
}

function foldObject (hash, o, seen) {
  return Object.keys(o).sort().reduce(foldKey, hash);
  function foldKey (hash, key) {
    return foldValue(hash, o[key], key, seen);
  }
}

function foldValue (input, value, key, seen) {
  var hash = fold(fold(fold(input, key), toString(value)), typeof value);
  if (value === null) {
    return fold(hash, 'null');
  }
  if (value === undefined) {
    return fold(hash, 'undefined');
  }
  if (typeof value === 'object' || typeof value === 'function') {
    if (seen.indexOf(value) !== -1) {
      return fold(hash, '[Circular]' + key);
    }
    seen.push(value);

    var objHash = foldObject(hash, value, seen);

    if (!('valueOf' in value) || typeof value.valueOf !== 'function') {
      return objHash;
    }

    try {
      return fold(objHash, String(value.valueOf()))
    } catch (err) {
      return fold(objHash, '[valueOf exception]' + (err.stack || err.message))
    }
  }
  return fold(hash, value.toString());
}

function toString (o) {
  return Object.prototype.toString.call(o);
}

function sum (o) {
  return pad(foldValue(0, o, '', []).toString(16), 8);
}

var hashSum = sum;

const define = (tag, data) => {
  const define = { tag, data };
  emit({ define, hash: hashSum(define) });
  return data;
};

const defRgbColor = (name, rgb) => define(`color/${name}`, { rgb });

const defThreejsMaterial = (name, definition) =>
  define(`material/${name}`, { threejsMaterial: definition });

const defTool = (name, definition) => define(`tool/${name}`, definition);

const defGrblSpindle = (
  name,
  { cutDepth = 0.2, rpm, feedRate, drillRate, diameter, jumpZ = 1 } = {}
) =>
  defTool(name, {
    grbl: {
      type: 'spindle',
      cutDepth,
      cutSpeed: rpm,
      feedRate,
      drillRate,
      diameter,
      jumpZ,
    },
  });

const defGrblDynamicLaser = (
  name,
  {
    cutDepth = 0.2,
    diameter = 0.09,
    jumpPower = 0,
    power = 1000,
    speed = 1000,
    warmupDuration,
    warmupPower = 0,
  } = {}
) =>
  defTool(name, {
    grbl: {
      type: 'dynamicLaser',
      cutDepth,
      cutSpeed: -power,
      diameter,
      jumpRate: speed,
      jumpSpeed: -jumpPower,
      feedRate: speed,
      warmupDuration,
      warmupSpeed: -warmupPower,
    },
  });

const defGrblConstantLaser = (
  name,
  {
    cutDepth = 0.2,
    diameter = 0.09,
    jumpPower,
    power = 1000,
    speed = 1000,
    warmupDuration,
    warmupPower = 0,
  } = {}
) =>
  defTool(name, {
    grbl: {
      type: 'constantLaser',
      cutDepth,
      cutSpeed: power,
      diameter,
      jumpRate: speed,
      jumpSpeed: jumpPower,
      feedRate: speed,
      warmupDuration,
      warmupSpeed: warmupPower,
    },
  });

const defGrblPlotter = (name, { feedRate = 1000 } = {}) =>
  defTool(name, { grbl: { type: 'plotter', feedRate, cutSpeed: 1 } });

const card = (strings, ...placeholders) => {
  const card = strings.reduce(
    (result, string, i) => result + placeholders[i - 1] + string
  );
  const setContext = { card };
  emit({ hash: hashSum(setContext), setContext });
  return card;
};

const emitSourceLocation = ({ line, column }) => {
  const setContext = { sourceLocation: { line, column } };
  emit({ hash: hashSum(setContext), setContext });
  return card;
};

const md = (strings, ...placeholders) => {
  const md = strings.reduce(
    (result, string, i) => result + placeholders[i - 1] + string
  );
  emit({ md, hash: hashSum(md) });
  return md;
};

const mdMethod = function (string, ...placeholders) {
  if (string instanceof Function) {
    string = string(this);
  }
  md([string], ...placeholders);
  return this;
};

Shape.prototype.md = mdMethod;

/*
  Options
  slider: { min, max, step }
  select: { options }
*/

const control = (label, value, type, options) => {
  const control = {
    type,
    label,
    value: getControlValue(getModule(), label, value),
    options,
    path: getModule(),
  };
  const hash = hashSum(control);
  emit({ control, hash });
  return value;
};

const source = (path, source) => addSource(`cache/${path}`, source);

let notes;

let recording = false;
let handler;

const recordNote = (note, index) => {
  if (recording) {
    notes.push({ note, index });
  }
};

const beginRecordingNotes = (path, id, sourceLocation) => {
  const setContext = { recording: { path, id } };
  emit({ hash: hash(setContext), setContext });

  if (handler === undefined) {
    handler = addOnEmitHandler(recordNote);
  }
  recording = true;
  notes = [];
};

const saveRecordedNotes = (path, id) => {
  let notesToSave = notes;
  notes = undefined;
  recording = false;
  addPending(write(`data/note/${path}/${id}`, notesToSave));
};

const replayRecordedNotes = async (path, id) => {
  const setContext = { recording: { path, id } };
  emit({ hash: hash(setContext), setContext });

  const notes = await read(`data/note/${path}/${id}`);

  if (notes === undefined) {
    return;
  }
  if (notes.length === 0) {
    return;
  }
  for (const { note } of notes) {
    emit(note);
  }
};

/**
 *
 * Defines the interface used by the api to access the rest of the system on
 * behalf of a user. e.g., algorithms and geometries.
 *
 * A user can destructively update this mapping in their code to change what
 * the api uses.
 */

const yz = Peg('x', [0, 0, 0], [0, 0, 1], [0, -1, 0]);
const xz = Peg('y', [0, 0, 0], [0, 0, 1], [1, 0, 0]);
const xy = Peg('z', [0, 0, 0], [0, 1, 0], [-1, 0, 0]);

var api = /*#__PURE__*/Object.freeze({
  __proto__: null,
  yz: yz,
  xz: xz,
  xy: xy,
  define: define,
  defGrblConstantLaser: defGrblConstantLaser,
  defGrblDynamicLaser: defGrblDynamicLaser,
  defGrblPlotter: defGrblPlotter,
  defGrblSpindle: defGrblSpindle,
  defRgbColor: defRgbColor,
  defThreejsMaterial: defThreejsMaterial,
  defTool: defTool,
  card: card,
  emitSourceLocation: emitSourceLocation,
  md: md,
  control: control,
  source: source,
  elapsed: elapsed,
  emit: emit,
  info: info,
  read: read,
  write: write,
  beginRecordingNotes: beginRecordingNotes,
  replayRecordedNotes: replayRecordedNotes,
  saveRecordedNotes: saveRecordedNotes,
  Shape: Shape$1,
  add: add,
  and: and,
  addTo: addTo,
  align: align,
  as: as,
  bend: bend,
  clip: clip,
  clipFrom: clipFrom,
  color: color,
  colors: colors,
  cut: cut,
  cutFrom: cutFrom,
  drop: drop,
  fuse: fuse,
  grow: grow,
  inset: inset,
  keep: keep,
  loadGeometry: loadGeometry,
  loft: loft,
  log: log,
  loop: loop,
  material: material,
  minkowskiDifference: minkowskiDifference,
  minkowskiShell: minkowskiShell,
  minkowskiSum: minkowskiSum,
  move: move,
  noVoid: noVoid,
  notAs: notAs,
  offset: offset,
  op: op,
  pack: pack,
  push: push,
  peg: peg,
  remesh: remesh,
  rotate: rotate,
  rx: rx,
  ry: ry,
  rz: rz,
  rotateX: rotateX,
  rotateY: rotateY,
  rotateZ: rotateZ,
  saveGeometry: saveGeometry,
  scale: scale,
  smooth: smooth,
  size: size,
  sketch: sketch,
  split: split,
  tags: tags,
  test: test,
  tint: tint,
  tool: tool,
  twist: twist,
  voidFn: voidFn,
  weld: weld,
  withFn: withFn,
  withInset: withInset,
  withOp: withOp,
  x: x,
  y: y,
  z: z,
  Arc: Arc,
  Assembly: Assembly,
  Box: Box,
  ChainedHull: ChainedHull,
  Cone: Cone,
  Empty: Empty,
  Group: Group,
  Hershey: Hershey,
  Hexagon: Hexagon,
  Hull: Hull,
  Icosahedron: Icosahedron,
  Implicit: Implicit,
  Line: Line,
  LoopedHull: LoopedHull,
  Octagon: Octagon,
  Orb: Orb,
  Page: Page,
  Path: Path,
  Peg: Peg,
  Pentagon: Pentagon,
  Plan: Plan,
  Plane: Plane,
  Point: Point,
  Points: Points,
  Polygon: Polygon,
  Polyhedron: Polyhedron,
  Septagon: Septagon,
  Spiral: Spiral,
  Tetragon: Tetragon,
  Triangle: Triangle,
  Wave: Wave,
  Weld: Weld,
  ofPlan: ofPlan,
  Item: Item,
  Noise: Noise,
  Random: Random,
  acos: acos,
  cos: cos,
  each: each,
  ease: ease,
  max: max,
  min: min,
  numbers: numbers,
  sin: sin,
  sqrt: sqrt,
  vec: vec,
  zag: zag,
  readSvg: readSvg,
  readStl: readStl,
  readObj: readObj,
  readOff: readOff,
  foot: foot,
  inch: inch,
  mm: mm,
  mil: mil,
  cm: cm,
  m: m,
  thou: thou,
  yard: yard
});

const DYNAMIC_MODULES = new Map();

const registerDynamicModule = (bare, path) =>
  DYNAMIC_MODULES.set(bare, path);

const buildImportModule = (api) => async (name) => {
  const internalModule = DYNAMIC_MODULES.get(name);
  if (internalModule !== undefined) {
    const module = await import(internalModule);
    return module;
  }
  let script;
  if (script === undefined) {
    const path = `source/${name}`;
    const sources = [];
    sources.push(name);
    script = await read(path, { sources });
  }
  if (script === undefined) {
    throw Error(`Cannot import module ${name}`);
  }
  const scriptText =
    typeof script === 'string'
      ? script
      : new TextDecoder('utf8').decode(script);
  const ecmascript = await toEcmascript(scriptText, { path: name });
  const builder = new Function(
    `{ ${Object.keys(api).join(', ')} }`,
    `return async () => { ${ecmascript} };`
  );
  const module = await builder(api);
  try {
    pushModule(name);
    const exports = await module();
    return exports;
  } finally {
    popModule();
  }
};

const extendedApi = { ...api, toSvg };

const importModule = buildImportModule(extendedApi);

extendedApi.importModule = importModule;

// Register Dynamic libraries.

const module = (name) => `@jsxcad/api-v1-${name}`;

registerDynamicModule(module('armature'), './jsxcad-api-v1-armature.js');
registerDynamicModule(module('cursor'), './jsxcad-api-v1-cursor.js');
registerDynamicModule(module('deform'), './jsxcad-api-v1-deform.js');
registerDynamicModule(module('dst'), './jsxcad-api-v1-dst.js');
registerDynamicModule(module('dxf'), './jsxcad-api-v1-dxf.js');
registerDynamicModule(module('extrude'), './jsxcad-api-v1-extrude.js');
registerDynamicModule(module('font'), './jsxcad-api-v1-font.js');
registerDynamicModule(module('gcode'), './jsxcad-api-v1-gcode.js');
registerDynamicModule(module('item'), './jsxcad-api-v1-item.js');
registerDynamicModule(module('ldraw'), './jsxcad-api-v1-ldraw.js');
registerDynamicModule(module('math'), './jsxcad-api-v1-math.js');
registerDynamicModule(module('pdf'), './jsxcad-api-v1-pdf.js');
registerDynamicModule(module('plan'), './jsxcad-api-v1-plan.js');
registerDynamicModule(module('plans'), './jsxcad-api-v1-plans.js');
registerDynamicModule(module('png'), './jsxcad-api-v1-png.js');
registerDynamicModule(module('shape'), './jsxcad-api-v1-shape.js');
registerDynamicModule(module('shapefile'), './jsxcad-api-v1-shapefile.js');
registerDynamicModule(module('shapes'), './jsxcad-api-v1-shapes.js');
registerDynamicModule(module('stl'), './jsxcad-api-v1-stl.js');
registerDynamicModule(module('svg'), './jsxcad-api-v1-svg.js');
registerDynamicModule(module('threejs'), './jsxcad-api-v1-threejs.js');
registerDynamicModule(module('units'), './jsxcad-api-v1-units.js');

export { beginRecordingNotes, card, control, defGrblConstantLaser, defGrblDynamicLaser, defGrblPlotter, defGrblSpindle, defRgbColor, defThreejsMaterial, defTool, define, emitSourceLocation, importModule, md, replayRecordedNotes, saveRecordedNotes, source, xy, xz, yz };
