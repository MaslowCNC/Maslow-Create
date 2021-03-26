import { getModule, addPending, write, emit, getControlValue, addSource, addOnEmitHandler, read, pushModule, popModule } from './jsxcad-sys.js';
export { emit, read, write } from './jsxcad-sys.js';
import Shape, { Shape as Shape$1, loadGeometry, log, saveGeometry } from './jsxcad-api-v1-shape.js';
export { Shape, loadGeometry, log, saveGeometry } from './jsxcad-api-v1-shape.js';
import { ensurePages, Peg, Arc, Assembly, Box, ChainedHull, Cone, Empty, Group, Hershey, Hexagon, Hull, Icosahedron, Implicit, Line, LoopedHull, Octagon, Orb, Page, Path, Pentagon, Plane, Point, Points, Polygon, Polyhedron, Septagon, Spiral, Tetragon, Triangle, Wave, Weld } from './jsxcad-api-v1-shapes.js';
export { Arc, Assembly, Box, ChainedHull, Cone, Empty, Group, Hershey, Hexagon, Hull, Icosahedron, Implicit, Line, LoopedHull, Octagon, Orb, Page, Path, Peg, Pentagon, Plane, Point, Points, Polygon, Polyhedron, Septagon, Spiral, Tetragon, Triangle, Wave, Weld } from './jsxcad-api-v1-shapes.js';
import { soup } from './jsxcad-geometry-tagged.js';
import './jsxcad-api-v1-extrude.js';
import './jsxcad-api-v1-gcode.js';
import './jsxcad-api-v1-pdf.js';
import './jsxcad-api-v1-tools.js';
import { Item } from './jsxcad-api-v1-item.js';
export { Item } from './jsxcad-api-v1-item.js';
import { Noise, Random, acos, cos, each, ease, max, min, numbers, sin, sqrt, vec } from './jsxcad-api-v1-math.js';
export { Noise, Random, acos, cos, each, ease, max, min, numbers, sin, sqrt, vec } from './jsxcad-api-v1-math.js';
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

// This alphabet uses `A-Za-z0-9_-` symbols. The genetic algorithm helped
// optimize the gzip compression for this alphabet.
let urlAlphabet =
  'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';

let nanoid = (size = 21) => {
  let id = '';
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size;
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id
};

// FIX: Avoid the extra read-write cycle.
const view = (
  shape,
  size,
  op = (x) => x,
  {
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
  const viewShape = op(shape);
  for (const entry of ensurePages(soup(viewShape.toDisjointGeometry()))) {
    const path = `view/${getModule()}/${nanoid()}`;
    addPending(write(path, entry));
    const view = { width, height, position, inline, withAxes, withGrid };
    emit({ hash: nanoid(), path, view });
  }
  return shape;
};

Shape.prototype.view = function (
  size = 256,
  op,
  {
    path,
    width = 1024,
    height = 512,
    position = [100, -100, 100],
    withAxes,
    withGrid,
  } = {}
) {
  return view(this, size, op, {
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.topView = function (
  size = 256,
  op,
  {
    path,
    width = 1024,
    height = 512,
    position = [0, 0, 100],
    withAxes,
    withGrid,
  } = {}
) {
  return view(this, size, op, {
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.gridView = function (
  size = 256,
  op,
  {
    path,
    width = 1024,
    height = 512,
    position = [0, 0, 100],
    withAxes,
    withGrid = true,
  } = {}
) {
  return view(this, size, op, {
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.frontView = function (
  size = 256,
  op,
  {
    path,
    width = 1024,
    height = 512,
    position = [0, -100, 0],
    withAxes,
    withGrid,
  } = {}
) {
  return view(this, size, op, {
    path,
    width,
    height,
    position,
    withAxes,
    withGrid,
  });
};

Shape.prototype.sideView = function (
  size = 256,
  op,
  {
    path,
    width = 1024,
    height = 512,
    position = [100, 0, 0],
    withAxes,
    withGrid,
  } = {}
) {
  return view(this, size, op, {
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
  return define;
};

const defRgbColor = (name, rgb) => define(`color/${name}`, { rgb });

const defThreejsMaterial = (name, definition) =>
  define(`material/${name}`, { threejsMaterial: definition });

const defTool = (name, definition) => define(`tool/${name}`, definition);

const defGrblSpindle = (
  name,
  { cutDepth = 0.2, rpm, feedRate, diameter, jumpZ = 1 }
) =>
  defTool(name, {
    grbl: {
      type: 'spindle',
      cutDepth,
      cutSpeed: rpm,
      feedRate,
      diameter,
      jumpZ,
    },
  });

const defGrblDynamicLaser = (
  name,
  {
    cutDepth = 0.2,
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
      jumpRate: speed,
      jumpSpeed: jumpPower,
      feedRate: speed,
      warmupDuration,
      warmupSpeed: warmupPower,
    },
  });

const card = (strings, ...placeholders) => {
  const card = strings.reduce(
    (result, string, i) => result + placeholders[i - 1] + string
  );
  emit({ hash: hashSum(card), setContext: { card } });
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

const beginRecordingNotes = () => {
  if (handler === undefined) {
    handler = addOnEmitHandler(recordNote);
  }
  recording = true;
  notes = [];
};

const saveRecordedNotes = (path) => {
  let notesToSave = notes;
  notes = undefined;
  recording = false;
  addPending(write(path, notesToSave));
};

const replayRecordedNotes = async (path) => {
  const notes = await read(path);
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

const x = Peg([0, 0, 0], [0, 0, 1], [0, -1, 0]);
const y = Peg([0, 0, 0], [0, 0, 1], [1, 0, 0]);
const z = Peg([0, 0, 0], [0, 1, 0], [-1, 0, 0]);

var api = /*#__PURE__*/Object.freeze({
  __proto__: null,
  x: x,
  y: y,
  z: z,
  define: define,
  defGrblConstantLaser: defGrblConstantLaser,
  defGrblDynamicLaser: defGrblDynamicLaser,
  defGrblSpindle: defGrblSpindle,
  defRgbColor: defRgbColor,
  defThreejsMaterial: defThreejsMaterial,
  defTool: defTool,
  card: card,
  md: md,
  control: control,
  source: source,
  emit: emit,
  read: read,
  write: write,
  beginRecordingNotes: beginRecordingNotes,
  replayRecordedNotes: replayRecordedNotes,
  saveRecordedNotes: saveRecordedNotes,
  Shape: Shape$1,
  loadGeometry: loadGeometry,
  log: log,
  saveGeometry: saveGeometry,
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

export { beginRecordingNotes, card, control, defGrblConstantLaser, defGrblDynamicLaser, defGrblSpindle, defRgbColor, defThreejsMaterial, defTool, define, importModule, md, replayRecordedNotes, saveRecordedNotes, source, x, y, z };
