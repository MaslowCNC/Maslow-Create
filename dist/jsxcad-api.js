import './jsxcad-api-v1-gcode.js';
import './jsxcad-api-v1-pdf.js';
import './jsxcad-api-v1-tools.js';
import * as mathApi from './jsxcad-api-v1-math.js';
import { addOnEmitHandler, emit, hash, addPending, write, read, pushModule, popModule, getControlValue, getModule } from './jsxcad-sys.js';
import * as shapeApi from './jsxcad-api-shape.js';
import { toEcmascript } from './jsxcad-compiler.js';
import { readStl, stl } from './jsxcad-api-v1-stl.js';
import { readObj } from './jsxcad-api-v1-obj.js';
import { readOff } from './jsxcad-api-v1-off.js';
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
  notes = [];
  if (handler === undefined) {
    handler = addOnEmitHandler(recordNote);
  }
  recording = true;
  const setContext = { recording: { path, id } };
  emit({ hash: hash(setContext), setContext });
  emit({ beginNotes: { path, id } });
};

const saveRecordedNotes = (path, id) => {
  emit({ endNotes: { path, id } });
  let notesToSave = notes;
  notes = undefined;
  recording = false;
  addPending(write(`data/note/${path}/${id}`, notesToSave));
};

const replayRecordedNotes = async (path, id) => {
  // const setContext = { recording: { path, id } };
  // emit({ hash: hash(setContext), setContext });

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
  try {
    const module = await builder(api);
    pushModule(path);
    const result = await module();
    return result;
  } catch (error) {
    throw error;
  } finally {
    popModule();
  }
};

const execute = async (
  script,
  { evaluate, replay, path, topLevel = {} }
) => {
  try {
    console.log(`QQ/execute/0`);
    const updates = {};
    await toEcmascript(script, {
      path,
      updates,
    });
    const pending = new Set(Object.keys(updates));
    const unprocessed = new Set(Object.keys(updates));
    const processed = new Set();
    let somethingHappened;
    let somethingFailed;
    const schedule = () => {
      console.log(`Updates remaining ${[...pending].join(', ')}`);
      for (const id of [...pending]) {
        const entry = updates[id];
        const outstandingDependencies = entry.dependencies.filter(
          (dependency) => updates[dependency] && !processed.has(dependency)
        );
        if (outstandingDependencies.length === 0) {
          console.log(`Scheduling: ${id}`);
          pending.delete(id);
          const task = async () => {
            try {
              await evaluate(updates[id].program);
              console.log(`Completed ${id}`);
              delete updates[id];
              unprocessed.delete(id);
              processed.add(id);
            } catch (error) {
              somethingFailed(error); // FIX: Deadlock?
            } finally {
              somethingHappened();
            }
          };
          task();
        }
      }
    };
    while (unprocessed.size > 0) {
      const somethingHappens = new Promise((resolve, reject) => {
        somethingHappened = resolve;
        somethingFailed = reject;
      });
      schedule();
      if (unprocessed.size > 0) {
        // Wait for something to happen.
        await somethingHappens;
      }
    }
    // Execute the script in the context of the resolved updates.
    const ecmascript = await toEcmascript(script, {
      path,
      topLevel,
      updates,
    });
    // These should all be resolved already.
    if (Object.keys(updates).length !== 0) {
      throw Error('Unresolved updates');
    }
    try {
      const result = await replay(ecmascript, { path });
      return result;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const DYNAMIC_MODULES = new Map();

const registerDynamicModule = (bare, path) =>
  DYNAMIC_MODULES.set(bare, path);

const CACHED_MODULES = new Map();

const buildImportModule = (baseApi) => async (name) => {
  try {
    const cachedModule = CACHED_MODULES.get(name);
    if (cachedModule !== undefined) {
      return cachedModule;
    }
    console.log(`QQ/importModule/0`);
    const internalModule = DYNAMIC_MODULES.get(name);
    if (internalModule !== undefined) {
      const module = await import(internalModule);
      CACHED_MODULES.set(name, module);
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
    const api = { ...baseApi, sha: 'master' };
    console.log(`QQ/importModule/5`);
    const evaluate$1 = (script) => evaluate(script, { api, path });
    const replay = (script) => evaluate(script, { api, path });
    console.log(`QQ/importModule/6`);

    const builtModule = await execute(scriptText, {
      evaluate: evaluate$1,
      replay,
      path,
      topLevel,
    });
    CACHED_MODULES.set(name, builtModule);
    return builtModule;
  } catch (error) {
    throw error;
  }
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
  stl,
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
