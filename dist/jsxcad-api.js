import './jsxcad-api-v1-gcode.js';
import './jsxcad-api-v1-pdf.js';
import './jsxcad-api-v1-tools.js';
import * as mathApi from './jsxcad-api-v1-math.js';
import * as shapeApi from './jsxcad-api-shape.js';
import { Group, Shape, saveGeometry, loadGeometry } from './jsxcad-api-shape.js';
import { addOnEmitHandler, addPending, write, read, emit, flushEmitGroup, computeHash, logInfo, beginEmitGroup, resolvePending, finishEmitGroup, getConfig, saveEmitGroup, ErrorWouldBlock, restoreEmitGroup, isWebWorker, isNode, getSourceLocation, getControlValue } from './jsxcad-sys.js';
import { toEcmascript } from './jsxcad-compiler.js';
import { readStl, stl } from './jsxcad-api-v1-stl.js';
import { readObj } from './jsxcad-api-v1-obj.js';
import { readOff } from './jsxcad-api-v1-off.js';
import { readSvg } from './jsxcad-api-v1-svg.js';
import { toSvg } from './jsxcad-convert-svg.js';

let recordedNotes;

let recording = false;
let handler;

const recordNotes = (notes) => {
  if (recording) {
    recordedNotes.push(...notes);
  }
};

const beginRecordingNotes = (path, id) => {
  recordedNotes = [];
  if (handler === undefined) {
    handler = addOnEmitHandler(recordNotes);
  }
  recording = true;
};

const clearRecordedNotes = () => {
  recordedNotes = undefined;
  recording = false;
};

const saveRecordedNotes = (path, id) => {
  let notesToSave = recordedNotes;
  recordedNotes = undefined;
  recording = false;
  addPending(write(`data/note/${path}/${id}`, notesToSave));
};

const replayRecordedNotes = async (path, id) => {
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
  flushEmitGroup();
};

const emitSourceLocation = ({ path, id }) => {
  const setContext = { sourceLocation: { path, id } };
  emit({ hash: computeHash(setContext), setContext });
};

const emitSourceText = (sourceText) =>
  emit({ hash: computeHash(sourceText), sourceText });

const $run = async (op, { path, id, text, sha }) => {
  const meta = await read(`meta/def/${path}/${id}`);
  if (!meta || meta.sha !== sha) {
    logInfo('api/core/$run', text);
    const startTime = new Date();
    beginRecordingNotes(path, id);
    beginEmitGroup({ path, id });
    emitSourceText(text);
    let result;
    try {
      result = await op();
    } catch (error) {
      if (error.debugGeometry) {
        Group(
          ...error.debugGeometry.map((geometry) => Shape.fromGeometry(geometry))
        )
          .md(error.message)
          .md('Debug Geometry: ')
          .view();
        await resolvePending();
        finishEmitGroup({ path, id });
      }
      throw error;
    }
    await resolvePending();
    const endTime = new Date();
    const durationMinutes = (endTime - startTime) / 60000;
    try {
      if (getConfig().api.evaluate.showTimeViaMd) {
        const md = `Evaluation time ${durationMinutes.toFixed(2)} minutes.`;
        emit({ md, hash: computeHash(md) });
      }
    } catch (error) {}
    logInfo(
      'api/core/evaluate/duration',
      `Evaluation time ${durationMinutes.toFixed(2)}: ${text}`
    );
    finishEmitGroup({ path, id });
    if (typeof result === 'object') {
      const type = result.constructor.name;
      switch (type) {
        case 'Shape':
          await saveGeometry(`data/def/${path}/${id}`, result);
          await write(`meta/def/${path}/${id}`, { sha, type });
          await saveRecordedNotes(path, id);
          return result;
      }
    }
    clearRecordedNotes();
    return result;
  } else if (meta.type === 'Shape') {
    await replayRecordedNotes(path, id);
    return loadGeometry(`data/def/${path}/${id}`);
  } else {
    throw Error('Unexpected cached result');
  }
};

var notesApi = /*#__PURE__*/Object.freeze({
  __proto__: null,
  beginRecordingNotes: beginRecordingNotes,
  clearRecordedNotes: clearRecordedNotes,
  saveRecordedNotes: saveRecordedNotes,
  replayRecordedNotes: replayRecordedNotes,
  emitSourceLocation: emitSourceLocation,
  emitSourceText: emitSourceText,
  $run: $run
});

let locked = false;
const pending = [];

const acquire = async () => {
  if (locked) {
    console.log(`QQ/acquire/wait`);
    return new Promise((resolve, reject) => pending.push(resolve));
  } else {
    console.log(`QQ/acquire`);
    locked = true;
  }
};

const release = async () => {
  if (pending.length > 0) {
    console.log(`QQ/release/schedule`);
    const resolve = pending.pop();
    resolve(true);
  } else {
    locked = false;
    console.log(`QQ/release`);
  }
};

let api$1;

const setApi = (value) => {
  api$1 = value;
};

const getApi = () => api$1;

const evaluate = async (ecmascript, { api, path }) => {
  const where = isWebWorker ? 'worker' : 'browser';
  let emitGroup;
  try {
    await acquire();
    emitGroup = saveEmitGroup();
    logInfo(
      'api/core/evaluate/script',
      `${where}: ${ecmascript.replace(/\n/g, '\n|   ')}`
    );
    const builder = new Function(
      `{ ${Object.keys(api).join(', ')} }`,
      `return async () => { ${ecmascript} };`
    );
    // Add import to make import.meta.url available.
    const op = await builder({ ...api, import: { meta: { url: path } } });
    console.log('QQ/evaluate/done');
    // Retry until none of the operations block.
    for (;;) {
      try {
        const result = await op();
        return result;
      } catch (error) {
        if (error instanceof ErrorWouldBlock) {
          logInfo('api/core/evaluate/error', error.message);
          await resolvePending();
          restoreEmitGroup(emitGroup);
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    throw error;
  } finally {
    if (emitGroup) {
      restoreEmitGroup(emitGroup);
    }
    await release();
  }
};

const execute = async (
  script,
  {
    evaluate,
    replay,
    path,
    topLevel = new Map(),
    parallelUpdateLimit = Infinity,
    clearUpdateEmits = false,
  }
) => {
  const where = isWebWorker ? 'worker' : 'browser';
  try {
    let replaysDone = false;
    let importsDone = false;
    console.log(`QQ/Evaluate`);
    const scheduled = new Set();
    const completed = new Set();
    for (;;) {
      console.log(`QQ/Compile`);
      const updates = {};
      const replays = {};
      const exports = [];
      await toEcmascript(script, {
        path,
        topLevel,
        updates,
        replays,
        exports,
      });
      // Make sure modules are prepared.
      if (!importsDone) {
        const { importModule } = getApi();
        // The imports we'll need to run these updates.
        const imports = new Set();
        for (const id of Object.keys(updates)) {
          const update = updates[id];
          if (update.imports) {
            for (const entry of update.imports) {
              imports.add(entry);
            }
          }
        }
        // We could run these in parallel, but let's keep it simple for now.
        for (const path of imports) {
          await importModule(path, { evaluate, replay, doRelease: false });
        }
        // At this point the modules should build with a simple replay.
      }
      // Replay anything we can.
      if (!replaysDone) {
        replaysDone = true;
        for (const id of Object.keys(replays)) {
          await replay(replays[id].program, { path });
          completed.add(id);
        }
      }
      // Update what we can.
      const unprocessedUpdates = new Set(Object.keys(updates));
      while (unprocessedUpdates.size > 0) {
        const updatePromises = [];
        // Determine the updates we can process.
        for (const id of unprocessedUpdates) {
          if (scheduled.has(id)) {
            continue;
          }
          const entry = updates[id];
          const outstandingDependencies = entry.dependencies.filter(
            (dependency) =>
              !completed.has(dependency) &&
              updates[dependency] &&
              dependency !== id
          );
          if (
            updatePromises.length <= 1 &&
            outstandingDependencies.length === 0
          ) {
            // if (isWebWorker) {
            //   throw Error('Updates should not happen in worker');
            // }
            // For now, only do one thing at a time, and block the remaining updates.
            const task = async () => {
              try {
                await evaluate(updates[id].program, { path });
                completed.add(id);
                console.log(`Completed ${id}`);
              } catch (error) {
                throw error;
              }
            };
            updatePromises.push(task());
            unprocessedUpdates.delete(id);
            scheduled.add(id);
          }
        }
        // FIX: We could instead use Promise.race() and then see what new updates could be queued.
        while (updatePromises.length > 0) {
          await updatePromises.pop();
        }
      }
      // Finally compute the exports.
      console.log(`QQ/Exports ${where}`);
      for (const entry of exports) {
        return await evaluate(entry, { path });
      }
      return;
    }
  } catch (error) {
    throw error;
  }
};

const DYNAMIC_MODULES = new Map();

const registerDynamicModule = (path, browserPath, nodePath) => {
  DYNAMIC_MODULES.set(path, isNode ? nodePath : browserPath);
};

const CACHED_MODULES = new Map();

const buildImportModule =
  (baseApi) =>
  async (
    name,
    {
      clearUpdateEmits = false,
      topLevel = new Map(),
      evaluate: evaluate$1,
      replay,
      doRelease = true,
    } = {}
  ) => {
    let emitGroup;
    try {
      if (doRelease) {
        emitGroup = saveEmitGroup();
        await release();
      }
      if (CACHED_MODULES.has(name)) {
        // It's ok for a module to evaluate to undefined so we need to check has explicitly.
        return CACHED_MODULES.get(name);
      }
      const internalModule = DYNAMIC_MODULES.get(name);
      if (internalModule !== undefined) {
        const module = await import(internalModule);
        CACHED_MODULES.set(name, module);
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
      const path = name;
      const api = { ...baseApi, sha: 'master' };
      if (!evaluate$1) {
        evaluate$1 = (script) => evaluate(script, { api, path });
      }
      if (!replay) {
        replay = (script) => evaluate(script, { api, path });
      }
      const builtModule = await execute(scriptText, {
        evaluate: evaluate$1,
        replay,
        path,
        topLevel,
        parallelUpdateLimit: 1,
        clearUpdateEmits,
      });
      CACHED_MODULES.set(name, builtModule);
      return builtModule;
    } catch (error) {
      throw error;
    } finally {
      if (doRelease) {
        await acquire();
        restoreEmitGroup(emitGroup);
      }
    }
  };

/*
  Options
  slider: { min, max, step }
  select: { options }
*/

const control = (label, value, type, options) => {
  const { path } = getSourceLocation();
  const control = {
    type,
    label,
    value: getControlValue(path, label, value),
    options,
    path,
  };
  emit({ control, hash: computeHash(control) });
  return value;
};

const api = {
  _: undefined,
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

// Register Dynamically loadable modules.

registerDynamicModule(
  '@' + 'jsxcad/api-threejs',
  './jsxcad-api-threejs.js',
  '../threejs/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-armature',
  './jsxcad-api-v1-armature.js',
  '../v1-armature/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-cursor',
  './jsxcad-api-v1-cursor.js',
  '../v1-cursor/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-deform',
  './jsxcad-api-v1-deform.js',
  '../v1-deform/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-dst',
  './jsxcad-api-v1-dst.js',
  '../v1-dst/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-dxf',
  './jsxcad-api-v1-dxf.js',
  '../v1-dxf.main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-font',
  './jsxcad-api-v1-font.js',
  '../v1-font/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-gcode',
  './jsxcad-api-v1-gcode.js',
  '../v1-gcode/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-ldraw',
  './jsxcad-api-v1-ldraw.js',
  '../v1-ldraw/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-math',
  './jsxcad-api-v1-math.js',
  '../v1-math/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-pdf',
  './jsxcad-api-v1-pdf.js',
  '../v1-pdf/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-png',
  './jsxcad-api-v1-png.js',
  '../v1-png/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-threejs',
  './jsxcad-api-v1-threejs.js',
  '../v1-threejs/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-shape',
  './jsxcad-api-v1-shape.js',
  '../v1-shape/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-shapefile',
  './jsxcad-api-v1-shapefile.js',
  '../v1-shapefile/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-stl',
  './jsxcad-api-v1-stl.js',
  '../v1-stl/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-svg',
  './jsxcad-api-v1-svg.js',
  '../v1-svg/main.js'
);
registerDynamicModule(
  '@' + 'jsxcad/api-v1-units',
  './jsxcad-api-v1-units.js',
  '../v1-units/main.js'
);

setApi(api);

export { api as default, evaluate, execute };
