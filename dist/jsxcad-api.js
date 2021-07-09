import './jsxcad-api-v1-gcode.js';
import './jsxcad-api-v1-pdf.js';
import './jsxcad-api-v1-tools.js';
import * as mathApi from './jsxcad-api-v1-math.js';
import { emit, hash, addOnEmitHandler, addPending, write, read, pushModule, popModule, getControlValue, getModule } from './jsxcad-sys.js';
import * as shapeApi from './jsxcad-api-shape.js';
import { toEcmascript } from './jsxcad-compiler.js';
import { readObj } from './jsxcad-api-v1-obj.js';
import { readOff } from './jsxcad-api-v1-off.js';
import { readStl } from './jsxcad-api-v1-stl.js';
import { readSvg } from './jsxcad-api-v1-svg.js';
import { toSvg } from './jsxcad-convert-svg.js';

let notes;

let recording = false;
let handler;

const recordNote = (note) => {
  if (recording) {
    notes.push(note);
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
  for (const note of notes) {
    emit(note);
  }
};

const emitSourceLocation = ({ line, column }) => {
  const setContext = { sourceLocation: { line, column } };
  emit({ hash: hash(setContext), setContext });
};

var notesApi = /*#__PURE__*/Object.freeze({
  __proto__: null,
  beginRecordingNotes: beginRecordingNotes,
  saveRecordedNotes: saveRecordedNotes,
  replayRecordedNotes: replayRecordedNotes,
  emitSourceLocation: emitSourceLocation
});

const evaluate = async (ecmascript, { api, path }) => {
  const builder = new Function(
    `{ ${Object.keys(api).join(', ')} }`,
    `return async () => { ${ecmascript} };`
  );
  const module = await builder(api);
  try {
    pushModule(path);
    return await module();
  } finally {
    popModule();
  }
};

const doNothing = () => {};

const execute = async (
  script,
  { evaluate, path, topLevel = {}, onError = doNothing }
) => {
  console.log(`QQ/execute/0`);
  const updates = {};
  const ecmascript = await toEcmascript(script, {
    path,
    topLevel,
    updates,
  });
  const pending = new Set(Object.keys(updates));
  const unprocessed = new Set(Object.keys(updates));
  let somethingHappened;
  const schedule = () => {
    console.log(`Updates remaining ${[...pending].join(', ')}`);
    for (const id of [...pending]) {
      const entry = updates[id];
      const outstandingDependencies = entry.dependencies.filter(
        (dependency) => updates[dependency]
      );
      if (outstandingDependencies.length === 0) {
        console.log(`Scheduling: ${id}`);
        pending.delete(id);
        evaluate(updates[id].program)
          .then(() => {
            console.log(`Completed ${id}`);
            delete updates[id];
            unprocessed.delete(id);
          })
          .catch(onError) // FIX: Deadlock?
          .finally(() => somethingHappened());
      }
    }
  };
  while (unprocessed.size > 0) {
    const somethingHappens = new Promise((resolve, reject) => {
      somethingHappened = resolve;
    });
    schedule();
    if (unprocessed.size > 0) {
      // Wait for something to happen.
      await somethingHappens;
    }
  }
  return evaluate(ecmascript, { path });
};

const DYNAMIC_MODULES = new Map();

const registerDynamicModule = (bare, path) =>
  DYNAMIC_MODULES.set(bare, path);

const buildImportModule = (baseApi) => async (name) => {
  console.log(`QQ/importModule/0`);
  const internalModule = DYNAMIC_MODULES.get(name);
  if (internalModule !== undefined) {
    const module = await import(internalModule);
    return module;
  }
  console.log(`QQ/importModule/1`);
  let script;
  if (script === undefined) {
    const path = `source/${name}`;
    const sources = [];
    sources.push(name);
    script = await read(path, { sources });
  }
  console.log(`QQ/importModule/2`);
  if (script === undefined) {
    throw Error(`Cannot import module ${name}`);
  }
  console.log(`QQ/importModule/3`);
  const scriptText =
    typeof script === 'string'
      ? script
      : new TextDecoder('utf8').decode(script);
  console.log(`QQ/importModule/4`);
  const path = name;
  const topLevel = new Map();
  const onError = (error) => console.log(error.stack);
  const api = { ...baseApi, sha: 'master' };
  console.log(`QQ/importModule/5`);
  const evaluate$1 = (script) => evaluate(script, { api, path });
  console.log(`QQ/importModule/6`);

  return execute(scriptText, { evaluate: evaluate$1, path, topLevel, onError });
  /*
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
*/
};

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
  emit({ control, hash: hash(control) });
  return value;
};

const api = {
  ...mathApi,
  ...shapeApi,
  ...notesApi,
  control,
  readSvg,
  readStl,
  readObj,
  readOff,
  toSvg,
};

const importModule = buildImportModule(api);

api.importModule = importModule;

// Register Dynamic libraries.

const module = (name) => `@jsxcad/api-v1-${name}`;

registerDynamicModule(module('armature'), './jsxcad-api-v1-armature.js');
registerDynamicModule(module('cursor'), './jsxcad-api-v1-cursor.js');
registerDynamicModule(module('deform'), './jsxcad-api-v1-deform.js');
registerDynamicModule(module('dst'), './jsxcad-api-v1-dst.js');
registerDynamicModule(module('dxf'), './jsxcad-api-v1-dxf.js');
registerDynamicModule(module('font'), './jsxcad-api-v1-font.js');
registerDynamicModule(module('gcode'), './jsxcad-api-v1-gcode.js');
registerDynamicModule(module('ldraw'), './jsxcad-api-v1-ldraw.js');
registerDynamicModule(module('math'), './jsxcad-api-v1-math.js');
registerDynamicModule(module('pdf'), './jsxcad-api-v1-pdf.js');
registerDynamicModule(module('png'), './jsxcad-api-v1-png.js');
registerDynamicModule(module('shape'), './jsxcad-api-v1-shape.js');
registerDynamicModule(module('shapefile'), './jsxcad-api-v1-shapefile.js');
registerDynamicModule(module('stl'), './jsxcad-api-v1-stl.js');
registerDynamicModule(module('svg'), './jsxcad-api-v1-svg.js');
registerDynamicModule(module('threejs'), './jsxcad-api-v1-threejs.js');
registerDynamicModule(module('units'), './jsxcad-api-v1-units.js');

export default api;
export { evaluate, execute };
