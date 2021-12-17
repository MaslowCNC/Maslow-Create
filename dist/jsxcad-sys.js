const pending$2 = [];

let pendingErrorHandler = (error) => console.log(error);

const addPending = (promise) => pending$2.push(promise);

const resolvePending = async () => {
  while (pending$2.length > 0) {
    await pending$2.pop();
  }
};

const getPendingErrorHandler = () => pendingErrorHandler;
const setPendingErrorHandler = (handler) => {
  pendingErrorHandler = handler;
};

/**
 * Work around Safari 14 IndexedDB open bug.
 *
 * Safari has a horrible bug where IDB requests can hang while the browser is starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
 * The only solution is to keep nudging it until it's awake.
 */
function idbReady() {
    var isSafari = !navigator.userAgentData &&
        /Safari\//.test(navigator.userAgent) &&
        !/Chrom(e|ium)\//.test(navigator.userAgent);
    // No point putting other browsers or older versions of Safari through this mess.
    if (!isSafari || !indexedDB.databases)
        return Promise.resolve();
    var intervalId;
    return new Promise(function (resolve) {
        var tryIdb = function () { return indexedDB.databases().finally(resolve); };
        intervalId = setInterval(tryIdb, 100);
        tryIdb();
    }).finally(function () { return clearInterval(intervalId); });
}

function promisifyRequest(request) {
  return new Promise(function (resolve, reject) {
    // @ts-ignore - file size hacks
    request.oncomplete = request.onsuccess = function () {
      return resolve(request.result);
    }; // @ts-ignore - file size hacks


    request.onabort = request.onerror = function () {
      return reject(request.error);
    };
  });
}

function createStore(dbName, storeName) {
  var dbp = idbReady().then(function () {
    var request = indexedDB.open(dbName);

    request.onupgradeneeded = function () {
      return request.result.createObjectStore(storeName);
    };

    return promisifyRequest(request);
  });
  return function (txMode, callback) {
    return dbp.then(function (db) {
      return callback(db.transaction(storeName, txMode).objectStore(storeName));
    });
  };
}

var defaultGetStoreFunc;

function defaultGetStore() {
  if (!defaultGetStoreFunc) {
    defaultGetStoreFunc = createStore('keyval-store', 'keyval');
  }

  return defaultGetStoreFunc;
}
/**
 * Get a value by its key.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */


function get(key) {
  var customStore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultGetStore();
  return customStore('readonly', function (store) {
    return promisifyRequest(store.get(key));
  });
}
/**
 * Set a value with a key.
 *
 * @param key
 * @param value
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */


function set(key, value) {
  var customStore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultGetStore();
  return customStore('readwrite', function (store) {
    store.put(value, key);
    return promisifyRequest(store.transaction);
  });
}
/**
 * Delete a particular key from the store.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */


function del(key) {
  var customStore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultGetStore();
  return customStore('readwrite', function (store) {
    store.delete(key);
    return promisifyRequest(store.transaction);
  });
}
/**
 * Clear all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */


function clear() {
  var customStore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultGetStore();
  return customStore('readwrite', function (store) {
    store.clear();
    return promisifyRequest(store.transaction);
  });
}

function eachCursor(customStore, callback) {
  return customStore('readonly', function (store) {
    // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
    // And openKeyCursor isn't supported by Safari.
    store.openCursor().onsuccess = function () {
      if (!this.result) return;
      callback(this.result);
      this.result.continue();
    };

    return promisifyRequest(store.transaction);
  });
}
/**
 * Get all keys in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */


function keys() {
  var customStore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultGetStore();
  var items = [];
  return eachCursor(customStore, function (cursor) {
    return items.push(cursor.key);
  }).then(function () {
    return items;
  });
}

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

const hash = (item) => hashSum(item);

const fromStringToIntegerHash = (s) =>
  Math.abs(
    s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  );

const cacheStoreCount = 10;
const idbKeyvalDbInstance = {};

const ensureDb = (index) => {
  let instance = idbKeyvalDbInstance[index];
  if (instance) {
    return instance;
  }
  const store = createStore(index, `jsxcad`);
  instance = {
    clear() {
      return clear(store);
    },
    removeItem(path) {
      return del(path, store);
    },
    getItem(path) {
      return get(path, store);
    },
    keys() {
      return keys(store);
    },
    setItem(path, value) {
      return set(path, value, store);
    },
  };
  idbKeyvalDbInstance[index] = instance;
  return instance;
};

const db = (key) => {
  const [jsxcad, workspace, partition] = key.split('/');
  let index;

  if (jsxcad !== 'jsxcad') {
    throw Error('Malformed key');
  }

  switch (partition) {
    case 'config':
    case 'control':
    case 'source':
      index = `jsxcad_${workspace}_${partition}`;
      break;
    default: {
      const nth = fromStringToIntegerHash(key) % cacheStoreCount;
      index = `jsxcad_${workspace}_cache_${nth}`;
      break;
    }
  }
  return ensureDb(index);
};

const clearCacheDb = async ({ workspace }) => {
  for (let nth = 0; nth < cacheStoreCount; nth++) {
    await ensureDb(`jsxcad_${workspace}_cache_${nth}`).clear();
  }
};

const config$1 = {};

var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser = true;
var env = {};
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit$1 = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime$1 = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime$1;
  return dif / 1000;
}

var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: env,
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit$1,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

/* global self */

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

const checkIsWebWorker = () => {
  try {
    return (
      self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope'
    );
  } catch (e) {
    return false;
  }
};

const isWebWorker = checkIsWebWorker();

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

const createConversation = ({ agent, say }) => {
  const conversation = {
    agent,
    history: [],
    id: 0,
    openQuestions: new Map(),
    waiters: [],
    say,
  };

  conversation.waitToFinish = () => {
    if (conversation.openQuestions.size === 0) {
      return true;
    } else {
      const promise = new Promise((resolve, reject) =>
        conversation.waiters.push(resolve)
      );
      return !promise;
    }
  };

  conversation.ask = (question, transfer) => {
    const { id, openQuestions, say } = conversation;
    conversation.id += 1;
    const promise = new Promise((resolve, reject) => {
      openQuestions.set(id, { question, resolve, reject });
    });
    say({ id, question }, transfer);
    return promise;
  };

  conversation.tell = (statement, transfer) => say({ statement }, transfer);

  conversation.hear = async (message) => {
    const { ask, history, openQuestions, tell, waiters } = conversation;
    const { id, question, answer, error, statement } = message;

    const payload = answer || question || statement;
    if (payload instanceof Object && payload.sourceLocation) {
      history.unshift({
        op: payload.op,
        sourceLocation: payload.sourceLocation,
      });
      while (history.length > 3) {
        history.pop();
      }
    }

    // Check hasOwnProperty to detect undefined values.
    if (message.hasOwnProperty('answer')) {
      const openQuestion = openQuestions.get(id);
      if (!openQuestion) {
        throw Error(`Unexpected answer: ${JSON.stringify(message)}`);
      }
      const { resolve, reject } = openQuestion;
      if (error) {
        reject(error);
      } else {
        resolve(answer);
      }
      openQuestions.delete(id);
      if (openQuestions.size === 0) {
        while (waiters.length > 0) {
          waiters.pop()();
        }
      }
    } else if (message.hasOwnProperty('question')) {
      try {
        const answer = await agent({
          ask,
          message: question,
          type: 'question',
          tell,
        });
        say({ id, answer });
      } catch (error) {
        say({ id, answer: 'error', error });
      }
    } else if (message.hasOwnProperty('statement')) {
      await agent({ ask, message: statement, type: 'statement', tell });
    } else if (message.hasOwnProperty('error')) {
      throw error;
    } else {
      throw Error(
        `Expected { answer } or { question } but received ${JSON.stringify(
          message
        )}`
      );
    }
  };

  return conversation;
};

/* global self */

const watchers$1 = new Set();

const log = async (entry) => {
  if (isWebWorker) {
    return addPending(self.tell({ op: 'log', entry }));
  }

  for (const watcher of watchers$1) {
    watcher(entry);
  }
};

const logInfo = (source, text) => log({ type: 'info', source, text });

const logError = (source, text) => log({ type: 'error', source, text });

const watchLog = (thunk) => {
  watchers$1.add(thunk);
  return thunk;
};

const unwatchLog = (thunk) => {
  watchers$1.delete(thunk);
};

const nodeWorker = () => {};

/* global Worker */

const webWorker = (spec) =>
  new Worker(spec.webWorker, { type: spec.workerType });

let serviceId = 0;

const newWorker = (spec) => {
  if (isNode) {
    return nodeWorker();
  } else if (isBrowser) {
    return webWorker(spec);
  } else {
    throw Error('die');
  }
};

// Sets up a worker with conversational interface.
const createService = (spec, worker) => {
  try {
    let service = {};
    service.id = serviceId++;
    service.released = false;
    if (worker === undefined) {
      service.worker = newWorker(spec);
    } else {
      service.worker = worker;
    }
    service.say = (message, transfer) => {
      try {
        service.worker.postMessage(message, transfer);
      } catch (e) {
        console.log(e.stack);
        throw e;
      }
    };
    service.conversation = createConversation({
      agent: spec.agent,
      say: service.say,
    });
    const { ask, hear, waitToFinish } = service.conversation;
    service.waitToFinish = () => {
      service.waiting = true;
      return waitToFinish();
    };
    service.ask = ask;
    service.hear = hear;
    service.tell = (statement) => service.say({ statement });
    service.worker.onmessage = ({ data }) => service.hear(data);
    service.worker.onerror = (error) => {
      console.log(`QQ/worker/error: ${error}`);
    };
    service.release = (terminate) => {
      if (!service.released) {
        service.released = true;
        if (spec.release) {
          spec.release(spec, service, terminate);
        } else {
          const worker = service.releaseWorker();
          if (worker) {
            worker.terminate();
          }
        }
      }
    };
    service.releaseWorker = () => {
      if (service.worker) {
        const worker = service.worker;
        service.worker = undefined;
        return worker;
      } else {
        return undefined;
      }
    };
    service.terminate = () => service.release(true);
    service.tell({ op: 'sys/attach', id: service.id });
    return service;
  } catch (e) {
    log({ op: 'text', text: '' + e, level: 'serious', duration: 6000000 });
    console.log(e.stack);
    throw e;
  }
};

const controlValue = new Map();

const setControlValue = (module, label, value) =>
  controlValue.set(`${module}/${label}`, value);

const getControlValue = (module, label, value) => {
  const result = controlValue.get(`${module}/${label}`);
  if (result === undefined) {
    return value;
  } else {
    return result;
  }
};

var empty = {};

var fs = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': empty
});

var v8 = {};

var v8$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': v8
});

// When base is undefined the persistent filesystem is disabled.
let base;

const qualifyPath = (path = '', workspace) => {
  if (workspace !== undefined) {
    return `jsxcad/${workspace}/${path}`;
  } else if (base !== undefined) {
    return `jsxcad/${base}${path}`;
  } else {
    return `jsxcad//${path}`;
  }
};

const setupFilesystem = ({ fileBase } = {}) => {
  // A prefix used to partition the persistent filesystem for multiple workspaces.
  if (fileBase !== undefined) {
    if (fileBase.endsWith('/')) {
      base = fileBase;
    } else {
      base = `${fileBase}/`;
    }
  } else {
    base = undefined;
  }
};

const setupWorkspace = (workspace) =>
  setupFilesystem({ filebase: workspace });

const getFilesystem = () => {
  if (base !== undefined) {
    const [filesystem] = base.split('/');
    return filesystem;
  }
};

const getWorkspace = () => getFilesystem();

const files = new Map();
const fileCreationWatchers = new Set();
const fileDeletionWatchers = new Set();

const getFile = async (options, unqualifiedPath) => {
  if (typeof unqualifiedPath !== 'string') {
    throw Error(`die: ${JSON.stringify(unqualifiedPath)}`);
  }
  const path = qualifyPath(unqualifiedPath, options.workspace);
  let file = files.get(path);
  if (file === undefined) {
    file = { path: unqualifiedPath, watchers: new Set(), storageKey: path };
    files.set(path, file);
    for (const watcher of fileCreationWatchers) {
      await watcher(options, file);
    }
  }
  return file;
};

const listFiles$1 = (set) => {
  for (const file of files.keys()) {
    set.add(file);
  }
};

const deleteFile$1 = async (options, unqualifiedPath) => {
  const path = qualifyPath(unqualifiedPath, options.workspace);
  let file = files.get(path);
  if (file !== undefined) {
    files.delete(path);
  } else {
    // It might not have been in the cache, but we still need to inform watchers.
    file = { path: unqualifiedPath, storageKey: path };
  }
  for (const watcher of fileDeletionWatchers) {
    await watcher(options, file);
  }
};

const unwatchFiles = async (thunk) => {
  for (const file of files.values()) {
    file.watchers.delete(thunk);
  }
};

const watchFileCreation = async (thunk) => {
  fileCreationWatchers.add(thunk);
  return thunk;
};

const unwatchFileCreation = async (thunk) => {
  fileCreationWatchers.delete(thunk);
  return thunk;
};

const watchFileDeletion = async (thunk) => {
  fileDeletionWatchers.add(thunk);
  return thunk;
};

const unwatchFileDeletion = async (thunk) => {
  fileCreationWatchers.delete(thunk);
  return thunk;
};

const watchFile = async (path, thunk, options) => {
  if (thunk) {
    (await getFile(options, path)).watchers.add(thunk);
    return thunk;
  }
};

const unwatchFile = async (path, thunk, options) => {
  if (thunk) {
    return (await getFile(options, path)).watchers.delete(thunk);
  }
};

const sourceLocations = [];

const getSourceLocation = () =>
  sourceLocations[sourceLocations.length - 1];

const emitGroup = [];

let startTime = new Date();

const elapsed = () => new Date() - startTime;

const clearEmitted = () => {
  startTime = new Date();
  sourceLocations.splice(0);
};

const saveEmitGroup = () => {
  const savedSourceLocations = [...sourceLocations];
  sourceLocations.splice(0);

  const savedEmitGroup = [...emitGroup];
  emitGroup.splice(0);

  return { savedSourceLocations, savedEmitGroup };
};

const restoreEmitGroup = ({ savedSourceLocations, savedEmitGroup }) => {
  sourceLocations.splice(0, sourceLocations.length, ...savedSourceLocations);
  emitGroup.splice(0, emitGroup.length, ...savedEmitGroup);
};

const onEmitHandlers = new Set();

const emit = (value) => {
  if (value.sourceLocation === undefined) {
    value.sourceLocation = getSourceLocation();
  }
  emitGroup.push(value);
};

const addOnEmitHandler = (handler) => {
  onEmitHandlers.add(handler);
  return handler;
};

const beginEmitGroup = (sourceLocation) => {
  if (emitGroup.length !== 0) {
    throw Error('emitGroup not empty');
  }
  sourceLocations.push(sourceLocation);
  emit({ beginSourceLocation: sourceLocation });
};

const flushEmitGroup = () => {
  for (const onEmitHandler of onEmitHandlers) {
    onEmitHandler([...emitGroup]);
  }
  emitGroup.splice(0);
};

const finishEmitGroup = (sourceLocation) => {
  if (sourceLocations.length === 0) {
    throw Error(`Expected current sourceLocation but there was none.`);
  }
  const endSourceLocation = getSourceLocation();
  if (
    sourceLocation.path !== endSourceLocation.path ||
    sourceLocation.id !== endSourceLocation.id
  ) {
    throw Error(
      `Expected sourceLocation ${JSON.stringify(
        sourceLocation
      )} but found ${JSON.stringify(endSourceLocation)}`
    );
  }
  emit({ endSourceLocation });
  sourceLocations.pop();
  flushEmitGroup();
};

const removeOnEmitHandler = (handler) => onEmitHandlers.delete(handler);

const info = (text) => {};

var nodeFetch = _ => _;

// Copyright Joyent, Inc. and other Node contributors.

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

let activeServiceLimit = 5;
let idleServiceLimit = 5;
const activeServices = new Set();
const idleServices = [];
const pending$1 = [];
const watchers = new Set();

// TODO: Consider different specifications.

const notifyWatchers = () => {
  for (const watcher of watchers) {
    watcher();
  }
};

const acquireService = async (spec, context) => {
  if (idleServices.length > 0) {
    logInfo('sys/servicePool', 'Recycle worker');
    logInfo(
      'sys/servicePool/counts',
      `Active service count: ${activeServices.size}`
    );
    // Recycle an existing worker.
    // FIX: We might have multiple paths to consider in the future.
    // For now, just assume that the path is correct.
    const service = idleServices.pop();
    activeServices.add(service);
    if (service.released) {
      throw Error('die');
    }
    service.context = context;
    notifyWatchers();
    return service;
  } else if (activeServices.size < activeServiceLimit) {
    logInfo('sys/servicePool', 'Allocate worker');
    logInfo(
      'sys/servicePool/counts',
      `Active service count: ${activeServices.size}`
    );
    // Create a new service.
    const service = createService({ ...spec, release: releaseService });
    activeServices.add(service);
    if (service.released) {
      throw Error('die');
    }
    service.context = context;
    notifyWatchers();
    return service;
  } else {
    logInfo('sys/servicePool', 'Wait for worker');
    logInfo(
      'sys/servicePool/counts',
      `Active service count: ${activeServices.size}`
    );
    // Wait for a service to become available.
    return new Promise((resolve, reject) =>
      pending$1.push({ spec, resolve, context })
    );
  }
};

const releaseService = (spec, service, terminate = false) => {
  logInfo('sys/servicePool', 'Release worker');
  logInfo(
    'sys/servicePool/counts',
    `Active service count: ${activeServices.size}`
  );
  service.poolReleased = true;
  activeServices.delete(service);
  const worker = service.releaseWorker();
  if (worker) {
    if (terminate || idleServices.length >= idleServiceLimit) {
      worker.terminate();
    } else {
      idleServices.push(
        createService({ ...spec, release: releaseService }, worker)
      );
    }
  }
  if (pending$1.length > 0 && activeServices.size < activeServiceLimit) {
    const { spec, resolve, context } = pending$1.shift();
    resolve(acquireService(spec, context));
  }
  notifyWatchers();
};

const getServicePoolInfo = () => ({
  activeServices: [...activeServices],
  activeServiceCount: activeServices.size,
  activeServiceLimit,
  idleServices: [...idleServices],
  idleServiceLimit,
  idleServiceCount: idleServices.length,
  pendingCount: pending$1.length,
});

const getActiveServices = (contextFilter = (context) => true) => {
  const filteredServices = [];
  for (const service of activeServices) {
    const { context } = service;
    if (contextFilter(context)) {
      filteredServices.push(service);
    }
  }
  return filteredServices;
};

const terminateActiveServices = (contextFilter = (context) => true) => {
  for (const { terminate, context } of activeServices) {
    if (contextFilter(context)) {
      terminate();
    }
  }
};

const askService = (spec, question, transfer, context) => {
  let terminated;
  let doTerminate = () => {
    terminated = true;
  };
  const terminate = () => doTerminate();
  const flow = async () => {
    let service;
    try {
      service = await acquireService(spec, context);
      if (service.released) {
        return Promise.reject(Error('Terminated'));
      }
      doTerminate = () => {
        service.terminate();
        return Promise.reject(Error('Terminated'));
      };
      if (terminated) {
        terminate();
      }
      const answer = await service.ask(question, transfer);
      return answer;
    } catch (error) {
      throw error;
    } finally {
      if (service) {
        await service.waitToFinish();
        service.finished = true;
        service.release();
      }
    }
  };
  const answer = flow();
  // Avoid a race in which the service might be terminated before
  // acquireService returns.
  return { answer, terminate };
};

const askServices = async (question) => {
  for (const { ask } of [...idleServices, ...activeServices]) {
    await ask(question);
  }
};

const tellServices = (statement) => {
  for (const { tell } of [...idleServices, ...activeServices]) {
    tell(statement);
  }
};

const waitServices = () => {
  return new Promise((resolve, reject) => {
    let watcher;
    watcher = () => {
      unwatchServices(watcher);
      resolve();
    };
    watchServices(watcher);
  });
};

const watchServices = (watcher) => {
  watchers.add(watcher);
  return watcher;
};

const unwatchServices = (watcher) => {
  watchers.delete(watcher);
  return watcher;
};

/* global self */

const touch = async (
  path,
  { workspace, clear = true, broadcast = true } = {}
) => {
  const file = await getFile({ workspace }, path);
  if (file !== undefined) {
    if (clear) {
      // This will force a reload of the data.
      file.data = undefined;
    }

    for (const watcher of file.watchers) {
      await watcher({ workspace }, file);
    }
  }

  if (isWebWorker) {
    if (broadcast) {
      addPending(
        await self.ask({ op: 'sys/touch', path, workspace, id: self.id })
      );
    }
  } else {
    tellServices({ op: 'sys/touch', path, workspace });
  }
};

const { promises: promises$3 } = fs;
const { serialize } = v8$1;

const writeFile = async (options, path, data) => {
  data = await data;

  const {
    doSerialize = true,
    ephemeral,
    workspace = getFilesystem(),
  } = options;
  const file = await getFile(options, path);
  file.data = data;

  if (!ephemeral && workspace !== undefined) {
    const qualifiedPath = qualifyPath(path, workspace);
    if (isNode) {
      try {
        await promises$3.mkdir(dirname(qualifiedPath), { recursive: true });
      } catch (error) {
        throw error;
      }
      try {
        if (doSerialize) {
          data = serialize(data);
        }
        await promises$3.writeFile(qualifiedPath, data);
      } catch (error) {
        throw error;
      }
    } else if (isBrowser || isWebWorker) {
      await db(qualifiedPath).setItem(qualifiedPath, data);
    }

    // Let everyone know the file has changed.
    await touch(path, { workspace, clear: false });
  }

  for (const watcher of file.watchers) {
    await watcher(options, file);
  }

  return true;
};

const write = async (path, data, options = {}) => {
  if (typeof data === 'function') {
    // Always fail to write functions.
    return undefined;
  }
  return writeFile(options, path, data);
};

/* global self */

const { promises: promises$2 } = fs;
const { deserialize } = v8$1;

const getUrlFetcher = async () => {
  if (isBrowser) {
    return window.fetch;
  }
  if (isWebWorker) {
    return self.fetch;
  }
  if (isNode) {
    return nodeFetch;
  }
  throw Error('die');
};

const getExternalFileFetcher = async (
  qualify = qualifyPath,
  doSerialize = true
) => {
  if (isNode) {
    // FIX: Put this through getFile, also.
    return async (path) => {
      let data = await promises$2.readFile(qualify(path));
      if (doSerialize) {
        data = deserialize(data);
      }
      return data;
    };
  } else if (isBrowser || isWebWorker) {
    return async (path) => {};
  } else {
    throw Error('die');
  }
};

const getInternalFileFetcher = async (
  qualify = qualifyPath,
  doSerialize = true
) => {
  if (isNode) {
    // FIX: Put this through getFile, also.
    return async (path) => {
      let data = await promises$2.readFile(qualify(path));
      if (doSerialize) {
        data = deserialize(data);
      }
      return data;
    };
  } else if (isBrowser || isWebWorker) {
    return async (path) => {
      const qualifiedPath = qualify(path);
      const data = await db(qualifiedPath).getItem(qualifiedPath);
      if (data !== null) {
        return data;
      }
    };
  } else {
    throw Error('die');
  }
};

// Fetch from internal store.
const fetchPersistent = async (path, { workspace, doSerialize }) => {
  try {
    if (workspace) {
      const fetchFile = await getInternalFileFetcher(
        (path) => qualifyPath(path, workspace),
        doSerialize
      );
      const data = await fetchFile(path);
      return data;
    }
  } catch (e) {
    if (e.code && e.code === 'ENOENT') {
      return;
    }
    console.log(e);
  }
};

// Fetch from external sources.
const fetchSources = async (sources, { workspace }) => {
  const fetchUrl = await getUrlFetcher();
  const fetchFile = await getExternalFileFetcher((path) => path, false);
  // Try to load the data from a source.
  for (const source of sources) {
    if (typeof source === 'string') {
      try {
        if (source.startsWith('http:') || source.startsWith('https:')) {
          log({ op: 'text', text: `# Fetching ${source}` });
          info(`Fetching url ${source}`);
          const response = await fetchUrl(source, { cache: 'reload' });
          if (response.ok) {
            return new Uint8Array(await response.arrayBuffer());
          }
        } else {
          log({ op: 'text', text: `# Fetching ${source}` });
          info(`Fetching file ${source}`);
          // Assume a file path.
          const data = await fetchFile(source);
          if (data !== undefined) {
            return data;
          }
        }
      } catch (e) {}
    } else {
      throw Error('die');
    }
  }
};

// Deprecated
const readFile = async (options, path) => {
  const {
    allowFetch = true,
    ephemeral,
    sources = [],
    workspace = getFilesystem(),
    useCache = true,
    forceNoCache = false,
    decode,
  } = options;
  const file = await getFile(options, path);
  if (file.data === undefined || useCache === false || forceNoCache) {
    file.data = await fetchPersistent(path, { workspace, doSerialize: true });
  }

  if (file.data === undefined && allowFetch && sources.length > 0) {
    let data = await fetchSources(sources, { workspace });
    if (decode) {
      data = new TextDecoder(decode).decode(data);
    }
    if (!ephemeral && file.data !== undefined) {
      // Update persistent cache.
      await writeFile({ ...options, doSerialize: true }, path, data);
    }
    // The writeFile above can trigger a touch which can invalidate the cache
    // so we need to set the cached value after that is resolved.
    file.data = data;
  }
  if (file.data !== undefined) {
    if (file.data.then) {
      // Resolve any outstanding promises.
      file.data = await file.data;
    }
  }
  info(`Read complete: ${path} ${file.data ? 'present' : 'missing'}`);

  return file.data;
};

const read = async (path, options = {}) => readFile(options, path);

const readOrWatch = async (path, options = {}) => {
  const data = await read(path, options);
  if (data !== undefined) {
    return data;
  }
  let resolveWatch;
  const watch = new Promise((resolve) => {
    resolveWatch = resolve;
  });
  const watcher = await watchFile(path, (file) => resolveWatch(path), options);
  await watch;
  await unwatchFile(path, watcher, options);
  return read(path, options);
};

/* global self */

let handleAskUser;

const askUser = async (identifier, options) => {
  if (handleAskUser) {
    return handleAskUser(identifier, options);
  } else {
    return { identifier, value: '', type: 'string' };
  }
};

const ask = async (identifier, options = {}) => {
  if (isWebWorker) {
    return addPending(self.ask({ op: 'ask', identifier, options }));
  }

  return askUser(identifier, options);
};

const setHandleAskUser = (handler) => {
  handleAskUser = handler;
};

const tasks = [];

// Add task to complete before using system.
// Note: These are expected to be idempotent.
const onBoot = (op) => {
  tasks.push(op);
};

const UNBOOTED = 'unbooted';
const BOOTING = 'booting';
const BOOTED = 'booted';

let status = UNBOOTED;

const pending = [];

// Execute tasks to complete before using system.
const boot = async () => {
  // No need to wait.
  if (status === BOOTED) {
    return;
  }
  if (status === BOOTING) {
    // Wait for the system to boot.
    return new Promise((resolve, reject) => {
      pending.push(resolve);
    });
  }
  // Initiate boot.
  status = BOOTING;
  for (const task of tasks) {
    await task();
  }
  // Complete boot.
  status = BOOTED;
  // Release the pending clients.
  while (pending.length > 0) {
    pending.pop()();
  }
};

const { promises: promises$1 } = fs;

const getFileLister = async ({ workspace }) => {
  if (isNode) {
    // FIX: Put this through getFile, also.
    return async () => {
      const qualifiedPaths = new Set();
      const walk = async (path) => {
        for (const file of await promises$1.readdir(path)) {
          if (file.startsWith('.') || file === 'node_modules') {
            continue;
          }
          const subpath = `${path}${file}`;
          const stats = await promises$1.stat(subpath);
          if (stats.isDirectory()) {
            await walk(`${subpath}/`);
          } else {
            qualifiedPaths.add(subpath);
          }
        }
      };
      await walk('jsxcad/');
      listFiles$1(qualifiedPaths);
      return qualifiedPaths;
    };
  } else if (isBrowser || isWebWorker) {
    // FIX: Make localstorage optional.
    return async () => {
      const qualifiedPaths = new Set(
        await db(`jsxcad/${workspace}/source`).keys(),
        await db(`jsxcad/${workspace}/config`).keys(),
        await db(`jsxcad/${workspace}/control`).keys()
      );
      listFiles$1(qualifiedPaths);
      return qualifiedPaths;
    };
  } else {
    throw Error('Did not detect node, browser, or webworker');
  }
};

let cachedKeys;

const updateCachedKeys = (options = {}, file) =>
  cachedKeys.add(file.storageKey);
const deleteCachedKeys = (options = {}, file) =>
  cachedKeys.delete(file.storageKey);

const getKeys = async ({ workspace }) => {
  if (cachedKeys === undefined) {
    const listFiles = await getFileLister({ workspace });
    cachedKeys = await listFiles();
    watchFileCreation(updateCachedKeys);
    watchFileDeletion(deleteCachedKeys);
  }
  return cachedKeys;
};

const listFiles = async ({ workspace } = {}) => {
  if (workspace === undefined) {
    workspace = getFilesystem();
  }
  const prefix = qualifyPath('', workspace);
  const keys = await getKeys({ workspace });
  const files = [];
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      files.push(key.substring(prefix.length));
    }
  }
  return files;
};

/* global self */

const { promises } = fs;

const getFileDeleter = async ({ workspace } = {}) => {
  if (isNode) {
    // FIX: Put this through getFile, also.
    return async (path) => {
      return promises.unlink(qualifyPath(path, workspace));
    };
  } else if (isBrowser) {
    return async (path) => {
      const qualifiedPath = qualifyPath(path, workspace);
      await db(qualifiedPath).removeItem(qualifiedPath);
    };
  } else {
    throw Error('die');
  }
};

const deleteFile = async (options, path) => {
  if (isWebWorker) {
    return addPending(self.ask({ op: 'deleteFile', options, path }));
  }
  const deleter = await getFileDeleter(options);
  await deleter(path);
  await deleteFile$1(options, path);
};

const sleep = (ms = 0) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
let nanoid = (size = 21) => {
  let id = '';
  let i = size;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id
};

const generateUniqueId = () => nanoid();

export { addOnEmitHandler, addPending, ask, askService, askServices, beginEmitGroup, boot, clearCacheDb, clearEmitted, config$1 as config, createConversation, createService, deleteFile, elapsed, emit, finishEmitGroup, flushEmitGroup, generateUniqueId, getActiveServices, getControlValue, getFilesystem, getPendingErrorHandler, getServicePoolInfo, getSourceLocation, getWorkspace, hash, info, isBrowser, isNode, isWebWorker, listFiles, log, logError, logInfo, onBoot, qualifyPath, read, readFile, readOrWatch, removeOnEmitHandler, resolvePending, restoreEmitGroup, saveEmitGroup, setControlValue, setHandleAskUser, setPendingErrorHandler, setupFilesystem, setupWorkspace, sleep, tellServices, terminateActiveServices, touch, unwatchFile, unwatchFileCreation, unwatchFileDeletion, unwatchFiles, unwatchLog, unwatchServices, waitServices, watchFile, watchFileCreation, watchFileDeletion, watchLog, watchServices, write, writeFile };
