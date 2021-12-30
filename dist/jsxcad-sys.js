class ErrorWouldBlock extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorWouldBlock';
  }
}

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

const computeHash = hash;

const fromStringToIntegerHash = (s) =>
  Math.abs(
    s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  );

const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);

let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return (idbProxyableTypes ||
        (idbProxyableTypes = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
        ]));
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return (cursorAdvanceMethods ||
        (cursorAdvanceMethods = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
        ]));
}
const cursorRequestMap = new WeakMap();
const transactionDoneMap = new WeakMap();
const transactionStoreNamesMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
        const unlisten = () => {
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = () => {
            resolve(wrap(request.result));
            unlisten();
        };
        const error = () => {
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    promise
        .then((value) => {
        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
        // (see wrapFunction).
        if (value instanceof IDBCursor) {
            cursorRequestMap.set(value, request);
        }
        // Catching to avoid "Uncaught Promise exceptions"
    })
        .catch(() => { });
    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx))
        return;
    const done = new Promise((resolve, reject) => {
        const unlisten = () => {
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = () => {
            resolve();
            unlisten();
        };
        const error = () => {
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get(target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done')
                return transactionDoneMap.get(target);
            // Polyfill for objectStoreNames because of Edge.
            if (prop === 'objectStoreNames') {
                return target.objectStoreNames || transactionStoreNamesMap.get(target);
            }
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1]
                    ? undefined
                    : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    },
    has(target, prop) {
        if (target instanceof IDBTransaction &&
            (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    },
};
function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
    if (func === IDBDatabase.prototype.transaction &&
        !('objectStoreNames' in IDBTransaction.prototype)) {
        return function (storeNames, ...args) {
            const tx = func.call(unwrap(this), storeNames, ...args);
            transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
            return wrap(tx);
        };
    }
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) {
        return function (...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap(this), args);
            return wrap(cursorRequestMap.get(this));
        };
    }
    return function (...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function')
        return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction)
        cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
        return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest)
        return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value))
        return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', (event) => {
            upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction));
        });
    }
    if (blocked)
        request.addEventListener('blocked', () => blocked());
    openPromise
        .then((db) => {
        if (terminated)
            db.addEventListener('close', () => terminated());
        if (blocking)
            db.addEventListener('versionchange', () => blocking());
    })
        .catch(() => { });
    return openPromise;
}

const readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
const writeMethods = ['put', 'add', 'delete', 'clear'];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop))
        return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    const method = async function (storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex)
            target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done,
        ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
}
replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop),
}));

const cacheStoreCount = 10;
const workspaces = {};

const ensureDb = (workspace) => {
  let entry = workspaces[workspace];
  if (!entry) {
    const db = openDB('jsxcad/idb', 1, {
      upgrade(db) {
        db.createObjectStore('config/value');
        db.createObjectStore('config/version');
        db.createObjectStore('control/value');
        db.createObjectStore('control/version');
        db.createObjectStore('source/value');
        db.createObjectStore('source/version');
        for (let nth = 0; nth < cacheStoreCount; nth++) {
          db.createObjectStore(`cache_${nth}/value`);
          db.createObjectStore(`cache_${nth}/version`);
        }
      },
    });
    entry = { db, instances: [] };
    workspaces[workspace] = entry;
  }
  return entry;
};

const ensureStore = (store, db, instances) => {
  let instance = instances[store];
  const valueStore = `${store}/value`;
  const versionStore = `${store}/version`;
  if (!instance) {
    instance = {
      clear: async () => {
        const tx = (await db).transaction(
          [valueStore, versionStore],
          'readwrite'
        );
        await tx.objectStore(valueStore).clear();
        await tx.objectStore(versionStore).clear();
        await tx.done;
        return true;
      },
      getItem: async (key) => (await db).get(valueStore, key),
      getItemAndVersion: async (key) => {
        const tx = (await db).transaction([valueStore, versionStore]);
        const value = await tx.objectStore(valueStore).get(key);
        const version = await tx.objectStore(versionStore).get(key);
        await tx.done;
        return { value, version };
      },
      getItemVersion: async (key) => (await db).get(versionStore, key),
      keys: async () => (await db).getAllKeys(valueStore),
      removeItem: async (key) => (await db).delete(valueStore, key),
      setItem: async (key, value) => (await db).put(valueStore, value, key),
      setItemAndIncrementVersion: async (key, value) => {
        const tx = (await db).transaction(
          [valueStore, versionStore],
          'readwrite'
        );
        const version = (await tx.objectStore(versionStore).get(key)) || 0;
        await tx.objectStore(versionStore).put(version + 1, key);
        await tx.objectStore(valueStore).put(value, key);
        await tx.done;
        return version;
      },
    };
    instances[store] = instance;
  }
  return instance;
};

const db = (key) => {
  const [jsxcad, workspace, partition] = key.split('/');
  let store;

  if (jsxcad !== 'jsxcad') {
    throw Error('Malformed key');
  }

  switch (partition) {
    case 'config':
    case 'control':
    case 'source':
      store = partition;
      break;
    default: {
      const nth = fromStringToIntegerHash(key) % cacheStoreCount;
      store = `cache_${nth}`;
      break;
    }
  }
  const { db, instances } = ensureDb(workspace);
  return ensureStore(store, db, instances);
};

const clearCacheDb = async ({ workspace }) => {
  const { db, instances } = ensureDb(workspace);
  for (let nth = 0; nth < cacheStoreCount; nth++) {
    await ensureStore(`cache_${nth}`, db, instances).clear();
  }
};

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
var config$1 = {};

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

var startTime$2 = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime$2;
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
  config: config$1,
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

/* global self */
var self$1 = self;

const watchers$1 = new Set();

const log = async (entry) => {
  if (isWebWorker) {
    return addPending(self$1.tell({ op: 'log', entry }));
  }

  for (const watcher of watchers$1) {
    watcher(entry);
  }
};

const logInfo = (source, text) =>
  log({ type: 'info', source, text, id: self$1 && self$1.id });

const logError = (source, text) =>
  log({ type: 'error', source, text, id: self$1 && self$1.id });

const watchLog = (thunk) => {
  watchers$1.add(thunk);
  return thunk;
};

const unwatchLog = (thunk) => {
  watchers$1.delete(thunk);
};

const aggregates = new Map();

const startTime$1 = (name) => {
  if (!aggregates.has(name)) {
    aggregates.set(name, { name, count: 0, total: 0, average: 0 });
  }
  const start = new Date();
  const aggregate = aggregates.get(name);
  const timer = { start, name, aggregate };
  logInfo('sys/profile/startTime', name);
  return timer;
};

const endTime = ({ start, name, aggregate }) => {
  const end = new Date();
  const seconds = (end - start) / 1000;
  aggregate.last = seconds;
  aggregate.total += seconds;
  aggregate.count += 1;
  aggregate.average = aggregate.total / aggregate.count;
  const { average, count, last, total } = aggregate;
  logInfo(
    'sys/profile/endTime',
    `${name} average: ${average.toFixed(
      2
    )} count: ${count} last: ${last.toFixed(2)} total: ${total.toFixed(2)}`
  );
  return aggregate;
};

const reportTimes = () => {
  const entries = [...aggregates.values()].sort((a, b) => a.total - b.total);
  for (const { average, count, last, name, total } of entries) {
    logInfo(
      'sys/profile',
      `${name} average: ${average.toFixed(
        2
      )} count: ${count} last: ${last.toFixed(2)} total: ${total.toFixed(2)}`
    );
  }
};

let config = {};

const getConfig = () => config;

const setConfig = (value = {}) => {
  config = value;
};

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
    service.tell({ op: 'sys/attach', config: getConfig(), id: service.id });
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

const fileChangeWatchers = new Set();
const fileChangeWatchersByPath = new Map();
const fileCreationWatchers = new Set();
const fileDeletionWatchers = new Set();

const runFileCreationWatchers = async (path, workspace) => {
  for (const watcher of fileCreationWatchers) {
    await watcher(path, workspace);
  }
};

const runFileDeletionWatchers = async (path, workspace) => {
  for (const watcher of fileDeletionWatchers) {
    await watcher(path, workspace);
  }
};

const runFileChangeWatchers = async (path, workspace) => {
  for (const watcher of fileChangeWatchers) {
    await watcher(path, workspace);
  }
  const entry = fileChangeWatchersByPath.get(qualifyPath(path, workspace));
  if (entry === undefined) {
    return;
  }
  const { watchers } = entry;
  if (watchers === undefined) {
    return;
  }
  for (const watcher of watchers) {
    await watcher(path, workspace);
  }
};

const watchFile = async (path, workspace, thunk) => {
  if (thunk) {
    const qualifiedPath = qualifyPath(path, workspace);
    let entry = fileChangeWatchersByPath.get(qualifiedPath);
    if (entry === undefined) {
      entry = { path, workspace, watchers: new Set() };
      fileChangeWatchersByPath.set(qualifiedPath, entry);
    }
    entry.watchers.add(thunk);
    return thunk;
  }
};

const unwatchFile = async (path, workspace, thunk) => {
  if (thunk) {
    const qualifiedPath = qualifyPath(path, workspace);
    const entry = fileChangeWatchersByPath.get(qualifiedPath);
    if (entry === undefined) {
      return;
    }
    entry.watchers.delete(thunk);
    if (entry.watchers.size === 0) {
      fileChangeWatchersByPath.delete(qualifiedPath);
    }
  }
};

const unwatchFileCreation = async (thunk) => {
  fileCreationWatchers.delete(thunk);
  return thunk;
};

const unwatchFileDeletion = async (thunk) => {
  fileCreationWatchers.delete(thunk);
  return thunk;
};

const watchFileCreation = async (thunk) => {
  fileCreationWatchers.add(thunk);
  return thunk;
};

const watchFileDeletion = async (thunk) => {
  fileDeletionWatchers.add(thunk);
  return thunk;
};

const files = new Map();

// Do we need the ensureFile functions?
const ensureQualifiedFile = (path, qualifiedPath) => {
  let file = files.get(qualifiedPath);
  // Accessing a file counts as creation.
  if (file === undefined) {
    file = { path, storageKey: qualifiedPath };
    files.set(qualifiedPath, file);
  }
  return file;
};

const getQualifiedFile = (qualifiedPath) => files.get(qualifiedPath);

const getFile = (path, workspace) =>
  getQualifiedFile(qualifyPath(path, workspace));

const listFiles$1 = (set) => {
  for (const file of files.keys()) {
    set.add(file);
  }
};

watchFileDeletion((path, workspace) => {
  const qualifiedPath = qualifyPath(path, workspace);
  const file = files.get(qualifiedPath);
  if (file) {
    file.data = undefined;
  }
  files.delete(qualifiedPath);
});

var nodeFetch = _ => _;

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var util = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNode = exports.PROMISE_RESOLVED_VOID = exports.PROMISE_RESOLVED_TRUE = exports.PROMISE_RESOLVED_FALSE = void 0;
exports.isPromise = isPromise;
exports.microSeconds = microSeconds;
exports.randomInt = randomInt;
exports.randomToken = randomToken;
exports.sleep = sleep;

/**
 * returns true if the given object is a promise
 */
function isPromise(obj) {
  if (obj && typeof obj.then === 'function') {
    return true;
  } else {
    return false;
  }
}

var PROMISE_RESOLVED_FALSE = Promise.resolve(false);
exports.PROMISE_RESOLVED_FALSE = PROMISE_RESOLVED_FALSE;
var PROMISE_RESOLVED_TRUE = Promise.resolve(true);
exports.PROMISE_RESOLVED_TRUE = PROMISE_RESOLVED_TRUE;
var PROMISE_RESOLVED_VOID = Promise.resolve();
exports.PROMISE_RESOLVED_VOID = PROMISE_RESOLVED_VOID;

function sleep(time, resolveWith) {
  if (!time) time = 0;
  return new Promise(function (res) {
    return setTimeout(function () {
      return res(resolveWith);
    }, time);
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
/**
 * https://stackoverflow.com/a/8084248
 */


function randomToken() {
  return Math.random().toString(36).substring(2);
}

var lastMs = 0;
var additional = 0;
/**
 * returns the current time in micro-seconds,
 * WARNING: This is a pseudo-function
 * Performance.now is not reliable in webworkers, so we just make sure to never return the same time.
 * This is enough in browsers, and this function will not be used in nodejs.
 * The main reason for this hack is to ensure that BroadcastChannel behaves equal to production when it is used in fast-running unit tests.
 */

function microSeconds() {
  var ms = new Date().getTime();

  if (ms === lastMs) {
    additional++;
    return ms * 1000 + additional;
  } else {
    lastMs = ms;
    additional = 0;
    return ms * 1000;
  }
}
/**
 * copied from the 'detect-node' npm module
 * We cannot use the module directly because it causes problems with rollup
 * @link https://github.com/iliakan/detect-node/blob/master/index.js
 */


var isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
exports.isNode = isNode;
});

unwrapExports(util);
util.isNode;
util.PROMISE_RESOLVED_VOID;
util.PROMISE_RESOLVED_TRUE;
util.PROMISE_RESOLVED_FALSE;
util.isPromise;
util.microSeconds;
util.randomInt;
util.randomToken;
util.sleep;

var interopRequireDefault = createCommonjsModule(function (module) {
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
});

unwrapExports(interopRequireDefault);

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}

module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
});

unwrapExports(_typeof_1);

var native_1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.averageResponseTime = averageResponseTime;
exports.canBeUsed = canBeUsed;
exports.close = close;
exports.create = create;
exports.microSeconds = exports["default"] = void 0;
exports.onMessage = onMessage;
exports.postMessage = postMessage;
exports.type = void 0;



var microSeconds = util.microSeconds;
exports.microSeconds = microSeconds;
var type = 'native';
exports.type = type;

function create(channelName) {
  var state = {
    messagesCallback: null,
    bc: new BroadcastChannel(channelName),
    subFns: [] // subscriberFunctions

  };

  state.bc.onmessage = function (msg) {
    if (state.messagesCallback) {
      state.messagesCallback(msg.data);
    }
  };

  return state;
}

function close(channelState) {
  channelState.bc.close();
  channelState.subFns = [];
}

function postMessage(channelState, messageJson) {
  try {
    channelState.bc.postMessage(messageJson, false);
    return util.PROMISE_RESOLVED_VOID;
  } catch (err) {
    return Promise.reject(err);
  }
}

function onMessage(channelState, fn) {
  channelState.messagesCallback = fn;
}

function canBeUsed() {
  /**
   * in the electron-renderer, isNode will be true even if we are in browser-context
   * so we also check if window is undefined
   */
  if (util.isNode && typeof window === 'undefined') return false;

  if (typeof BroadcastChannel === 'function') {
    if (BroadcastChannel._pubkey) {
      throw new Error('BroadcastChannel: Do not overwrite window.BroadcastChannel with this module, this is not a polyfill');
    }

    return true;
  } else return false;
}

function averageResponseTime() {
  return 150;
}

var _default = {
  create: create,
  close: close,
  onMessage: onMessage,
  postMessage: postMessage,
  canBeUsed: canBeUsed,
  type: type,
  averageResponseTime: averageResponseTime,
  microSeconds: microSeconds
};
exports["default"] = _default;
});

unwrapExports(native_1);
native_1.averageResponseTime;
native_1.canBeUsed;
native_1.close;
native_1.create;
native_1.microSeconds;
native_1.onMessage;
native_1.postMessage;
native_1.type;

/**
 * this is a set which automatically forgets
 * a given entry when a new entry is set and the ttl
 * of the old one is over
 */
var ObliviousSet = /** @class */ (function () {
    function ObliviousSet(ttl) {
        this.ttl = ttl;
        this.set = new Set();
        this.timeMap = new Map();
    }
    ObliviousSet.prototype.has = function (value) {
        return this.set.has(value);
    };
    ObliviousSet.prototype.add = function (value) {
        var _this = this;
        this.timeMap.set(value, now());
        this.set.add(value);
        /**
         * When a new value is added,
         * start the cleanup at the next tick
         * to not block the cpu for more important stuff
         * that might happen.
         */
        setTimeout(function () {
            removeTooOldValues(_this);
        }, 0);
    };
    ObliviousSet.prototype.clear = function () {
        this.set.clear();
        this.timeMap.clear();
    };
    return ObliviousSet;
}());
/**
 * Removes all entries from the set
 * where the TTL has expired
 */
function removeTooOldValues(obliviousSet) {
    var olderThen = now() - obliviousSet.ttl;
    var iterator = obliviousSet.set[Symbol.iterator]();
    /**
     * Because we can assume the new values are added at the bottom,
     * we start from the top and stop as soon as we reach a non-too-old value.
     */
    while (true) {
        var value = iterator.next().value;
        if (!value) {
            return; // no more elements
        }
        var time = obliviousSet.timeMap.get(value);
        if (time < olderThen) {
            obliviousSet.timeMap.delete(value);
            obliviousSet.set.delete(value);
        }
        else {
            // We reached a value that is not old enough
            return;
        }
    }
}
function now() {
    return new Date().getTime();
}

var es$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ObliviousSet: ObliviousSet,
  removeTooOldValues: removeTooOldValues,
  now: now
});

var options = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fillOptionsWithDefaults = fillOptionsWithDefaults;

function fillOptionsWithDefaults() {
  var originalOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = JSON.parse(JSON.stringify(originalOptions)); // main

  if (typeof options.webWorkerSupport === 'undefined') options.webWorkerSupport = true; // indexed-db

  if (!options.idb) options.idb = {}; //  after this time the messages get deleted

  if (!options.idb.ttl) options.idb.ttl = 1000 * 45;
  if (!options.idb.fallbackInterval) options.idb.fallbackInterval = 150; //  handles abrupt db onclose events.

  if (originalOptions.idb && typeof originalOptions.idb.onclose === 'function') options.idb.onclose = originalOptions.idb.onclose; // localstorage

  if (!options.localstorage) options.localstorage = {};
  if (!options.localstorage.removeTimeout) options.localstorage.removeTimeout = 1000 * 60; // custom methods

  if (originalOptions.methods) options.methods = originalOptions.methods; // node

  if (!options.node) options.node = {};
  if (!options.node.ttl) options.node.ttl = 1000 * 60 * 2; // 2 minutes;

  /**
   * On linux use 'ulimit -Hn' to get the limit of open files.
   * On ubuntu this was 4096 for me, so we use half of that as maxParallelWrites default.
   */

  if (!options.node.maxParallelWrites) options.node.maxParallelWrites = 2048;
  if (typeof options.node.useFastPath === 'undefined') options.node.useFastPath = true;
  return options;
}
});

unwrapExports(options);
options.fillOptionsWithDefaults;

var indexedDb = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.averageResponseTime = averageResponseTime;
exports.canBeUsed = canBeUsed;
exports.cleanOldMessages = cleanOldMessages;
exports.close = close;
exports.create = create;
exports.createDatabase = createDatabase;
exports["default"] = void 0;
exports.getAllMessages = getAllMessages;
exports.getIdb = getIdb;
exports.getMessagesHigherThan = getMessagesHigherThan;
exports.getOldMessages = getOldMessages;
exports.microSeconds = void 0;
exports.onMessage = onMessage;
exports.postMessage = postMessage;
exports.removeMessageById = removeMessageById;
exports.type = void 0;
exports.writeMessage = writeMessage;







/**
 * this method uses indexeddb to store the messages
 * There is currently no observerAPI for idb
 * @link https://github.com/w3c/IndexedDB/issues/51
 */
var microSeconds = util.microSeconds;
exports.microSeconds = microSeconds;
var DB_PREFIX = 'pubkey.broadcast-channel-0-';
var OBJECT_STORE_ID = 'messages';
var type = 'idb';
exports.type = type;

function getIdb() {
  if (typeof indexedDB !== 'undefined') return indexedDB;

  if (typeof window !== 'undefined') {
    if (typeof window.mozIndexedDB !== 'undefined') return window.mozIndexedDB;
    if (typeof window.webkitIndexedDB !== 'undefined') return window.webkitIndexedDB;
    if (typeof window.msIndexedDB !== 'undefined') return window.msIndexedDB;
  }

  return false;
}

function createDatabase(channelName) {
  var IndexedDB = getIdb(); // create table

  var dbName = DB_PREFIX + channelName;
  var openRequest = IndexedDB.open(dbName, 1);

  openRequest.onupgradeneeded = function (ev) {
    var db = ev.target.result;
    db.createObjectStore(OBJECT_STORE_ID, {
      keyPath: 'id',
      autoIncrement: true
    });
  };

  var dbPromise = new Promise(function (res, rej) {
    openRequest.onerror = function (ev) {
      return rej(ev);
    };

    openRequest.onsuccess = function () {
      res(openRequest.result);
    };
  });
  return dbPromise;
}
/**
 * writes the new message to the database
 * so other readers can find it
 */


function writeMessage(db, readerUuid, messageJson) {
  var time = new Date().getTime();
  var writeObject = {
    uuid: readerUuid,
    time: time,
    data: messageJson
  };
  var transaction = db.transaction([OBJECT_STORE_ID], 'readwrite');
  return new Promise(function (res, rej) {
    transaction.oncomplete = function () {
      return res();
    };

    transaction.onerror = function (ev) {
      return rej(ev);
    };

    var objectStore = transaction.objectStore(OBJECT_STORE_ID);
    objectStore.add(writeObject);
  });
}

function getAllMessages(db) {
  var objectStore = db.transaction(OBJECT_STORE_ID).objectStore(OBJECT_STORE_ID);
  var ret = [];
  return new Promise(function (res) {
    objectStore.openCursor().onsuccess = function (ev) {
      var cursor = ev.target.result;

      if (cursor) {
        ret.push(cursor.value); //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);

        cursor["continue"]();
      } else {
        res(ret);
      }
    };
  });
}

function getMessagesHigherThan(db, lastCursorId) {
  var objectStore = db.transaction(OBJECT_STORE_ID).objectStore(OBJECT_STORE_ID);
  var ret = [];

  function openCursor() {
    // Occasionally Safari will fail on IDBKeyRange.bound, this
    // catches that error, having it open the cursor to the first
    // item. When it gets data it will advance to the desired key.
    try {
      var keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity);
      return objectStore.openCursor(keyRangeValue);
    } catch (e) {
      return objectStore.openCursor();
    }
  }

  return new Promise(function (res) {
    openCursor().onsuccess = function (ev) {
      var cursor = ev.target.result;

      if (cursor) {
        if (cursor.value.id < lastCursorId + 1) {
          cursor["continue"](lastCursorId + 1);
        } else {
          ret.push(cursor.value);
          cursor["continue"]();
        }
      } else {
        res(ret);
      }
    };
  });
}

function removeMessageById(db, id) {
  var request = db.transaction([OBJECT_STORE_ID], 'readwrite').objectStore(OBJECT_STORE_ID)["delete"](id);
  return new Promise(function (res) {
    request.onsuccess = function () {
      return res();
    };
  });
}

function getOldMessages(db, ttl) {
  var olderThen = new Date().getTime() - ttl;
  var objectStore = db.transaction(OBJECT_STORE_ID).objectStore(OBJECT_STORE_ID);
  var ret = [];
  return new Promise(function (res) {
    objectStore.openCursor().onsuccess = function (ev) {
      var cursor = ev.target.result;

      if (cursor) {
        var msgObk = cursor.value;

        if (msgObk.time < olderThen) {
          ret.push(msgObk); //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);

          cursor["continue"]();
        } else {
          // no more old messages,
          res(ret);
          return;
        }
      } else {
        res(ret);
      }
    };
  });
}

function cleanOldMessages(db, ttl) {
  return getOldMessages(db, ttl).then(function (tooOld) {
    return Promise.all(tooOld.map(function (msgObj) {
      return removeMessageById(db, msgObj.id);
    }));
  });
}

function create(channelName, options$1) {
  options$1 = (0, options.fillOptionsWithDefaults)(options$1);
  return createDatabase(channelName).then(function (db) {
    var state = {
      closed: false,
      lastCursorId: 0,
      channelName: channelName,
      options: options$1,
      uuid: (0, util.randomToken)(),

      /**
       * emittedMessagesIds
       * contains all messages that have been emitted before
       * @type {ObliviousSet}
       */
      eMIs: new es$1.ObliviousSet(options$1.idb.ttl * 2),
      // ensures we do not read messages in parrallel
      writeBlockPromise: util.PROMISE_RESOLVED_VOID,
      messagesCallback: null,
      readQueuePromises: [],
      db: db
    };
    /**
     * Handle abrupt closes that do not originate from db.close().
     * This could happen, for example, if the underlying storage is
     * removed or if the user clears the database in the browser's
     * history preferences.
     */

    db.onclose = function () {
      state.closed = true;
      if (options$1.idb.onclose) options$1.idb.onclose();
    };
    /**
     * if service-workers are used,
     * we have no 'storage'-event if they post a message,
     * therefore we also have to set an interval
     */


    _readLoop(state);

    return state;
  });
}

function _readLoop(state) {
  if (state.closed) return;
  readNewMessages(state).then(function () {
    return (0, util.sleep)(state.options.idb.fallbackInterval);
  }).then(function () {
    return _readLoop(state);
  });
}

function _filterMessage(msgObj, state) {
  if (msgObj.uuid === state.uuid) return false; // send by own

  if (state.eMIs.has(msgObj.id)) return false; // already emitted

  if (msgObj.data.time < state.messagesCallbackTime) return false; // older then onMessageCallback

  return true;
}
/**
 * reads all new messages from the database and emits them
 */


function readNewMessages(state) {
  // channel already closed
  if (state.closed) return util.PROMISE_RESOLVED_VOID; // if no one is listening, we do not need to scan for new messages

  if (!state.messagesCallback) return util.PROMISE_RESOLVED_VOID;
  return getMessagesHigherThan(state.db, state.lastCursorId).then(function (newerMessages) {
    var useMessages = newerMessages
    /**
     * there is a bug in iOS where the msgObj can be undefined some times
     * so we filter them out
     * @link https://github.com/pubkey/broadcast-channel/issues/19
     */
    .filter(function (msgObj) {
      return !!msgObj;
    }).map(function (msgObj) {
      if (msgObj.id > state.lastCursorId) {
        state.lastCursorId = msgObj.id;
      }

      return msgObj;
    }).filter(function (msgObj) {
      return _filterMessage(msgObj, state);
    }).sort(function (msgObjA, msgObjB) {
      return msgObjA.time - msgObjB.time;
    }); // sort by time

    useMessages.forEach(function (msgObj) {
      if (state.messagesCallback) {
        state.eMIs.add(msgObj.id);
        state.messagesCallback(msgObj.data);
      }
    });
    return util.PROMISE_RESOLVED_VOID;
  });
}

function close(channelState) {
  channelState.closed = true;
  channelState.db.close();
}

function postMessage(channelState, messageJson) {
  channelState.writeBlockPromise = channelState.writeBlockPromise.then(function () {
    return writeMessage(channelState.db, channelState.uuid, messageJson);
  }).then(function () {
    if ((0, util.randomInt)(0, 10) === 0) {
      /* await (do not await) */
      cleanOldMessages(channelState.db, channelState.options.idb.ttl);
    }
  });
  return channelState.writeBlockPromise;
}

function onMessage(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
  readNewMessages(channelState);
}

function canBeUsed() {
  if (util.isNode) return false;
  var idb = getIdb();
  if (!idb) return false;
  return true;
}

function averageResponseTime(options) {
  return options.idb.fallbackInterval * 2;
}

var _default = {
  create: create,
  close: close,
  onMessage: onMessage,
  postMessage: postMessage,
  canBeUsed: canBeUsed,
  type: type,
  averageResponseTime: averageResponseTime,
  microSeconds: microSeconds
};
exports["default"] = _default;
});

unwrapExports(indexedDb);
indexedDb.averageResponseTime;
indexedDb.canBeUsed;
indexedDb.cleanOldMessages;
indexedDb.close;
indexedDb.create;
indexedDb.createDatabase;
indexedDb.getAllMessages;
indexedDb.getIdb;
indexedDb.getMessagesHigherThan;
indexedDb.getOldMessages;
indexedDb.microSeconds;
indexedDb.onMessage;
indexedDb.postMessage;
indexedDb.removeMessageById;
indexedDb.type;
indexedDb.writeMessage;

var localstorage = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addStorageEventListener = addStorageEventListener;
exports.averageResponseTime = averageResponseTime;
exports.canBeUsed = canBeUsed;
exports.close = close;
exports.create = create;
exports["default"] = void 0;
exports.getLocalStorage = getLocalStorage;
exports.microSeconds = void 0;
exports.onMessage = onMessage;
exports.postMessage = postMessage;
exports.removeStorageEventListener = removeStorageEventListener;
exports.storageKey = storageKey;
exports.type = void 0;







/**
 * A localStorage-only method which uses localstorage and its 'storage'-event
 * This does not work inside of webworkers because they have no access to locastorage
 * This is basically implemented to support IE9 or your grandmothers toaster.
 * @link https://caniuse.com/#feat=namevalue-storage
 * @link https://caniuse.com/#feat=indexeddb
 */
var microSeconds = util.microSeconds;
exports.microSeconds = microSeconds;
var KEY_PREFIX = 'pubkey.broadcastChannel-';
var type = 'localstorage';
/**
 * copied from crosstab
 * @link https://github.com/tejacques/crosstab/blob/master/src/crosstab.js#L32
 */

exports.type = type;

function getLocalStorage() {
  var localStorage;
  if (typeof window === 'undefined') return null;

  try {
    localStorage = window.localStorage;
    localStorage = window['ie8-eventlistener/storage'] || window.localStorage;
  } catch (e) {// New versions of Firefox throw a Security exception
    // if cookies are disabled. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1028153
  }

  return localStorage;
}

function storageKey(channelName) {
  return KEY_PREFIX + channelName;
}
/**
* writes the new message to the storage
* and fires the storage-event so other readers can find it
*/


function postMessage(channelState, messageJson) {
  return new Promise(function (res) {
    (0, util.sleep)().then(function () {
      var key = storageKey(channelState.channelName);
      var writeObj = {
        token: (0, util.randomToken)(),
        time: new Date().getTime(),
        data: messageJson,
        uuid: channelState.uuid
      };
      var value = JSON.stringify(writeObj);
      getLocalStorage().setItem(key, value);
      /**
       * StorageEvent does not fire the 'storage' event
       * in the window that changes the state of the local storage.
       * So we fire it manually
       */

      var ev = document.createEvent('Event');
      ev.initEvent('storage', true, true);
      ev.key = key;
      ev.newValue = value;
      window.dispatchEvent(ev);
      res();
    });
  });
}

function addStorageEventListener(channelName, fn) {
  var key = storageKey(channelName);

  var listener = function listener(ev) {
    if (ev.key === key) {
      fn(JSON.parse(ev.newValue));
    }
  };

  window.addEventListener('storage', listener);
  return listener;
}

function removeStorageEventListener(listener) {
  window.removeEventListener('storage', listener);
}

function create(channelName, options$1) {
  options$1 = (0, options.fillOptionsWithDefaults)(options$1);

  if (!canBeUsed()) {
    throw new Error('BroadcastChannel: localstorage cannot be used');
  }

  var uuid = (0, util.randomToken)();
  /**
   * eMIs
   * contains all messages that have been emitted before
   * @type {ObliviousSet}
   */

  var eMIs = new es$1.ObliviousSet(options$1.localstorage.removeTimeout);
  var state = {
    channelName: channelName,
    uuid: uuid,
    eMIs: eMIs // emittedMessagesIds

  };
  state.listener = addStorageEventListener(channelName, function (msgObj) {
    if (!state.messagesCallback) return; // no listener

    if (msgObj.uuid === uuid) return; // own message

    if (!msgObj.token || eMIs.has(msgObj.token)) return; // already emitted

    if (msgObj.data.time && msgObj.data.time < state.messagesCallbackTime) return; // too old

    eMIs.add(msgObj.token);
    state.messagesCallback(msgObj.data);
  });
  return state;
}

function close(channelState) {
  removeStorageEventListener(channelState.listener);
}

function onMessage(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
}

function canBeUsed() {
  if (util.isNode) return false;
  var ls = getLocalStorage();
  if (!ls) return false;

  try {
    var key = '__broadcastchannel_check';
    ls.setItem(key, 'works');
    ls.removeItem(key);
  } catch (e) {
    // Safari 10 in private mode will not allow write access to local
    // storage and fail with a QuotaExceededError. See
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#Private_Browsing_Incognito_modes
    return false;
  }

  return true;
}

function averageResponseTime() {
  var defaultTime = 120;
  var userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    // safari is much slower so this time is higher
    return defaultTime * 2;
  }

  return defaultTime;
}

var _default = {
  create: create,
  close: close,
  onMessage: onMessage,
  postMessage: postMessage,
  canBeUsed: canBeUsed,
  type: type,
  averageResponseTime: averageResponseTime,
  microSeconds: microSeconds
};
exports["default"] = _default;
});

unwrapExports(localstorage);
localstorage.addStorageEventListener;
localstorage.averageResponseTime;
localstorage.canBeUsed;
localstorage.close;
localstorage.create;
localstorage.getLocalStorage;
localstorage.microSeconds;
localstorage.onMessage;
localstorage.postMessage;
localstorage.removeStorageEventListener;
localstorage.storageKey;
localstorage.type;

var simulate = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.averageResponseTime = averageResponseTime;
exports.canBeUsed = canBeUsed;
exports.close = close;
exports.create = create;
exports.microSeconds = exports["default"] = void 0;
exports.onMessage = onMessage;
exports.postMessage = postMessage;
exports.type = void 0;



var microSeconds = util.microSeconds;
exports.microSeconds = microSeconds;
var type = 'simulate';
exports.type = type;
var SIMULATE_CHANNELS = new Set();

function create(channelName) {
  var state = {
    name: channelName,
    messagesCallback: null
  };
  SIMULATE_CHANNELS.add(state);
  return state;
}

function close(channelState) {
  SIMULATE_CHANNELS["delete"](channelState);
}

function postMessage(channelState, messageJson) {
  return new Promise(function (res) {
    return setTimeout(function () {
      var channelArray = Array.from(SIMULATE_CHANNELS);
      channelArray.filter(function (channel) {
        return channel.name === channelState.name;
      }).filter(function (channel) {
        return channel !== channelState;
      }).filter(function (channel) {
        return !!channel.messagesCallback;
      }).forEach(function (channel) {
        return channel.messagesCallback(messageJson);
      });
      res();
    }, 5);
  });
}

function onMessage(channelState, fn) {
  channelState.messagesCallback = fn;
}

function canBeUsed() {
  return true;
}

function averageResponseTime() {
  return 5;
}

var _default = {
  create: create,
  close: close,
  onMessage: onMessage,
  postMessage: postMessage,
  canBeUsed: canBeUsed,
  type: type,
  averageResponseTime: averageResponseTime,
  microSeconds: microSeconds
};
exports["default"] = _default;
});

unwrapExports(simulate);
simulate.averageResponseTime;
simulate.canBeUsed;
simulate.close;
simulate.create;
simulate.microSeconds;
simulate.onMessage;
simulate.postMessage;
simulate.type;

var methodChooser = createCommonjsModule(function (module, exports) {





Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chooseMethod = chooseMethod;

var _native = interopRequireDefault(native_1);

var _indexedDb = interopRequireDefault(indexedDb);

var _localstorage = interopRequireDefault(localstorage);

var _simulate = interopRequireDefault(simulate);

// the line below will be removed from es5/browser builds
// order is important
var METHODS = [_native["default"], // fastest
_indexedDb["default"], _localstorage["default"]];

function chooseMethod(options) {
  var chooseMethods = [].concat(options.methods, METHODS).filter(Boolean); // the line below will be removed from es5/browser builds



  if (options.type) {
    if (options.type === 'simulate') {
      // only use simulate-method if directly chosen
      return _simulate["default"];
    }

    var ret = chooseMethods.find(function (m) {
      return m.type === options.type;
    });
    if (!ret) throw new Error('method-type ' + options.type + ' not found');else return ret;
  }
  /**
   * if no webworker support is needed,
   * remove idb from the list so that localstorage is been chosen
   */


  if (!options.webWorkerSupport && !util.isNode) {
    chooseMethods = chooseMethods.filter(function (m) {
      return m.type !== 'idb';
    });
  }

  var useMethod = chooseMethods.find(function (method) {
    return method.canBeUsed();
  });
  if (!useMethod) throw new Error("No useable method found in " + JSON.stringify(METHODS.map(function (m) {
    return m.type;
  })));else return useMethod;
}
});

unwrapExports(methodChooser);
methodChooser.chooseMethod;

var broadcastChannel$1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OPEN_BROADCAST_CHANNELS = exports.BroadcastChannel = void 0;
exports.clearNodeFolder = clearNodeFolder;
exports.enforceOptions = enforceOptions;







/**
 * Contains all open channels,
 * used in tests to ensure everything is closed.
 */
var OPEN_BROADCAST_CHANNELS = new Set();
exports.OPEN_BROADCAST_CHANNELS = OPEN_BROADCAST_CHANNELS;
var lastId = 0;

var BroadcastChannel = function BroadcastChannel(name, options$1) {
  // identifier of the channel to debug stuff
  this.id = lastId++;
  OPEN_BROADCAST_CHANNELS.add(this);
  this.name = name;

  if (ENFORCED_OPTIONS) {
    options$1 = ENFORCED_OPTIONS;
  }

  this.options = (0, options.fillOptionsWithDefaults)(options$1);
  this.method = (0, methodChooser.chooseMethod)(this.options); // isListening

  this._iL = false;
  /**
   * _onMessageListener
   * setting onmessage twice,
   * will overwrite the first listener
   */

  this._onML = null;
  /**
   * _addEventListeners
   */

  this._addEL = {
    message: [],
    internal: []
  };
  /**
   * Unsend message promises
   * where the sending is still in progress
   * @type {Set<Promise>}
   */

  this._uMP = new Set();
  /**
   * _beforeClose
   * array of promises that will be awaited
   * before the channel is closed
   */

  this._befC = [];
  /**
   * _preparePromise
   */

  this._prepP = null;

  _prepareChannel(this);
}; // STATICS

/**
 * used to identify if someone overwrites
 * window.BroadcastChannel with this
 * See methods/native.js
 */


exports.BroadcastChannel = BroadcastChannel;
BroadcastChannel._pubkey = true;
/**
 * clears the tmp-folder if is node
 * @return {Promise<boolean>} true if has run, false if not node
 */

function clearNodeFolder(options$1) {
  options$1 = (0, options.fillOptionsWithDefaults)(options$1);
  var method = (0, methodChooser.chooseMethod)(options$1);

  if (method.type === 'node') {
    return method.clearNodeFolder().then(function () {
      return true;
    });
  } else {
    return util.PROMISE_RESOLVED_FALSE;
  }
}
/**
 * if set, this method is enforced,
 * no mather what the options are
 */


var ENFORCED_OPTIONS;

function enforceOptions(options) {
  ENFORCED_OPTIONS = options;
} // PROTOTYPE


BroadcastChannel.prototype = {
  postMessage: function postMessage(msg) {
    if (this.closed) {
      throw new Error('BroadcastChannel.postMessage(): ' + 'Cannot post message after channel has closed');
    }

    return _post(this, 'message', msg);
  },
  postInternal: function postInternal(msg) {
    return _post(this, 'internal', msg);
  },

  set onmessage(fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time: time,
      fn: fn
    };

    _removeListenerObject(this, 'message', this._onML);

    if (fn && typeof fn === 'function') {
      this._onML = listenObj;

      _addListenerObject(this, 'message', listenObj);
    } else {
      this._onML = null;
    }
  },

  addEventListener: function addEventListener(type, fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time: time,
      fn: fn
    };

    _addListenerObject(this, type, listenObj);
  },
  removeEventListener: function removeEventListener(type, fn) {
    var obj = this._addEL[type].find(function (obj) {
      return obj.fn === fn;
    });

    _removeListenerObject(this, type, obj);
  },
  close: function close() {
    var _this = this;

    if (this.closed) {
      return;
    }

    OPEN_BROADCAST_CHANNELS["delete"](this);
    this.closed = true;
    var awaitPrepare = this._prepP ? this._prepP : util.PROMISE_RESOLVED_VOID;
    this._onML = null;
    this._addEL.message = [];
    return awaitPrepare // wait until all current sending are processed
    .then(function () {
      return Promise.all(Array.from(_this._uMP));
    }) // run before-close hooks
    .then(function () {
      return Promise.all(_this._befC.map(function (fn) {
        return fn();
      }));
    }) // close the channel
    .then(function () {
      return _this.method.close(_this._state);
    });
  },

  get type() {
    return this.method.type;
  },

  get isClosed() {
    return this.closed;
  }

};
/**
 * Post a message over the channel
 * @returns {Promise} that resolved when the message sending is done
 */

function _post(broadcastChannel, type, msg) {
  var time = broadcastChannel.method.microSeconds();
  var msgObj = {
    time: time,
    type: type,
    data: msg
  };
  var awaitPrepare = broadcastChannel._prepP ? broadcastChannel._prepP : util.PROMISE_RESOLVED_VOID;
  return awaitPrepare.then(function () {
    var sendPromise = broadcastChannel.method.postMessage(broadcastChannel._state, msgObj); // add/remove to unsend messages list

    broadcastChannel._uMP.add(sendPromise);

    sendPromise["catch"]().then(function () {
      return broadcastChannel._uMP["delete"](sendPromise);
    });
    return sendPromise;
  });
}

function _prepareChannel(channel) {
  var maybePromise = channel.method.create(channel.name, channel.options);

  if ((0, util.isPromise)(maybePromise)) {
    channel._prepP = maybePromise;
    maybePromise.then(function (s) {
      // used in tests to simulate slow runtime

      /*if (channel.options.prepareDelay) {
           await new Promise(res => setTimeout(res, this.options.prepareDelay));
      }*/
      channel._state = s;
    });
  } else {
    channel._state = maybePromise;
  }
}

function _hasMessageListeners(channel) {
  if (channel._addEL.message.length > 0) return true;
  if (channel._addEL.internal.length > 0) return true;
  return false;
}

function _addListenerObject(channel, type, obj) {
  channel._addEL[type].push(obj);

  _startListening(channel);
}

function _removeListenerObject(channel, type, obj) {
  channel._addEL[type] = channel._addEL[type].filter(function (o) {
    return o !== obj;
  });

  _stopListening(channel);
}

function _startListening(channel) {
  if (!channel._iL && _hasMessageListeners(channel)) {
    // someone is listening, start subscribing
    var listenerFn = function listenerFn(msgObj) {
      channel._addEL[msgObj.type].forEach(function (listenerObject) {
        /**
         * Getting the current time in JavaScript has no good precision.
         * So instead of only listening to events that happend 'after' the listener
         * was added, we also listen to events that happended 100ms before it.
         * This ensures that when another process, like a WebWorker, sends events
         * we do not miss them out because their timestamp is a bit off compared to the main process.
         * Not doing this would make messages missing when we send data directly after subscribing and awaiting a response.
         * @link https://johnresig.com/blog/accuracy-of-javascript-time/
         */
        var hundredMsInMicro = 100 * 1000;
        var minMessageTime = listenerObject.time - hundredMsInMicro;

        if (msgObj.time >= minMessageTime) {
          listenerObject.fn(msgObj.data);
        }
      });
    };

    var time = channel.method.microSeconds();

    if (channel._prepP) {
      channel._prepP.then(function () {
        channel._iL = true;
        channel.method.onMessage(channel._state, listenerFn, time);
      });
    } else {
      channel._iL = true;
      channel.method.onMessage(channel._state, listenerFn, time);
    }
  }
}

function _stopListening(channel) {
  if (channel._iL && !_hasMessageListeners(channel)) {
    // noone is listening, stop subscribing
    channel._iL = false;
    var time = channel.method.microSeconds();
    channel.method.onMessage(channel._state, null, time);
  }
}
});

unwrapExports(broadcastChannel$1);
broadcastChannel$1.OPEN_BROADCAST_CHANNELS;
broadcastChannel$1.BroadcastChannel;
broadcastChannel$1.clearNodeFolder;
broadcastChannel$1.enforceOptions;

/* global WorkerGlobalScope */
function add$1(fn) {
  if (typeof WorkerGlobalScope === 'function' && self instanceof WorkerGlobalScope) ; else {
    /**
     * if we are on react-native, there is no window.addEventListener
     * @link https://github.com/pubkey/unload/issues/6
     */
    if (typeof window.addEventListener !== 'function') return;
    /**
     * for normal browser-windows, we use the beforeunload-event
     */

    window.addEventListener('beforeunload', function () {
      fn();
    }, true);
    /**
     * for iframes, we have to use the unload-event
     * @link https://stackoverflow.com/q/47533670/3443137
     */

    window.addEventListener('unload', function () {
      fn();
    }, true);
  }
  /**
   * TODO add fallback for safari-mobile
   * @link https://stackoverflow.com/a/26193516/3443137
   */

}

var BrowserMethod = {
  add: add$1
};

var USE_METHOD = BrowserMethod;
var LISTENERS = new Set();
var startedListening = false;

function startListening() {
  if (startedListening) return;
  startedListening = true;
  USE_METHOD.add(runAll);
}

function add(fn) {
  startListening();
  if (typeof fn !== 'function') throw new Error('Listener is no function');
  LISTENERS.add(fn);
  var addReturn = {
    remove: function remove() {
      return LISTENERS["delete"](fn);
    },
    run: function run() {
      LISTENERS["delete"](fn);
      return fn();
    }
  };
  return addReturn;
}
function runAll() {
  var promises = [];
  LISTENERS.forEach(function (fn) {
    promises.push(fn());
    LISTENERS["delete"](fn);
  });
  return Promise.all(promises);
}
function removeAll() {
  LISTENERS.clear();
}
function getSize() {
  return LISTENERS.size;
}

var es = /*#__PURE__*/Object.freeze({
  __proto__: null,
  add: add,
  runAll: runAll,
  removeAll: removeAll,
  getSize: getSize
});

var leaderElection = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.beLeader = beLeader;
exports.createLeaderElection = createLeaderElection;





var LeaderElection = function LeaderElection(broadcastChannel, options) {
  var _this = this;

  this.broadcastChannel = broadcastChannel;
  this._options = options;
  this.isLeader = false;
  this.hasLeader = false;
  this.isDead = false;
  this.token = (0, util.randomToken)();
  /**
   * Apply Queue,
   * used to ensure we do not run applyOnce()
   * in parallel.
   */

  this._aplQ = util.PROMISE_RESOLVED_VOID; // amount of unfinished applyOnce() calls

  this._aplQC = 0; // things to clean up

  this._unl = []; // _unloads

  this._lstns = []; // _listeners

  this._dpL = function () {}; // onduplicate listener


  this._dpLC = false; // true when onduplicate called

  /**
   * Even when the own instance is not applying,
   * we still listen to messages to ensure the hasLeader flag
   * is set correctly.
   */

  var hasLeaderListener = function hasLeaderListener(msg) {
    if (msg.context === 'leader') {
      if (msg.action === 'death') {
        _this.hasLeader = false;
      }

      if (msg.action === 'tell') {
        _this.hasLeader = true;
      }
    }
  };

  this.broadcastChannel.addEventListener('internal', hasLeaderListener);

  this._lstns.push(hasLeaderListener);
};

LeaderElection.prototype = {
  /**
   * Returns true if the instance is leader,
   * false if not.
   * @async
   */
  applyOnce: function applyOnce( // true if the applyOnce() call came from the fallbackInterval cycle
  isFromFallbackInterval) {
    var _this2 = this;

    if (this.isLeader) {
      return (0, util.sleep)(0, true);
    }

    if (this.isDead) {
      return (0, util.sleep)(0, false);
    }
    /**
     * Already applying more then once,
     * -> wait for the apply queue to be finished.
     */


    if (this._aplQC > 1) {
      return this._aplQ;
    }
    /**
     * Add a new apply-run
     */


    var applyRun = function applyRun() {
      /**
       * Optimization shortcuts.
       * Directly return if a previous run
       * has already elected a leader.
       */
      if (_this2.isLeader) {
        return util.PROMISE_RESOLVED_TRUE;
      }

      var stopCriteria = false;
      var stopCriteriaPromiseResolve;
      /**
       * Resolves when a stop criteria is reached.
       * Uses as a performance shortcut so we do not
       * have to await the responseTime when it is already clear
       * that the election failed.
       */

      var stopCriteriaPromise = new Promise(function (res) {
        stopCriteriaPromiseResolve = function stopCriteriaPromiseResolve() {
          stopCriteria = true;
          res();
        };
      });

      var handleMessage = function handleMessage(msg) {
        if (msg.context === 'leader' && msg.token != _this2.token) {

          if (msg.action === 'apply') {
            // other is applying
            if (msg.token > _this2.token) {
              /**
               * other has higher token
               * -> stop applying and let other become leader.
               */
              stopCriteriaPromiseResolve();
            }
          }

          if (msg.action === 'tell') {
            // other is already leader
            stopCriteriaPromiseResolve();
            _this2.hasLeader = true;
          }
        }
      };

      _this2.broadcastChannel.addEventListener('internal', handleMessage);
      /**
       * If the applyOnce() call came from the fallbackInterval,
       * we can assume that the election runs in the background and
       * not critical process is waiting for it.
       * When this is true, we give the other intances
       * more time to answer to messages in the election cycle.
       * This makes it less likely to elect duplicate leaders.
       * But also it takes longer which is not a problem because we anyway
       * run in the background.
       */


      var waitForAnswerTime = isFromFallbackInterval ? _this2._options.responseTime * 4 : _this2._options.responseTime;

      var applyPromise = _sendMessage(_this2, 'apply') // send out that this one is applying
      .then(function () {
        return Promise.race([(0, util.sleep)(waitForAnswerTime), stopCriteriaPromise.then(function () {
          return Promise.reject(new Error());
        })]);
      }) // send again in case another instance was just created
      .then(function () {
        return _sendMessage(_this2, 'apply');
      }) // let others time to respond
      .then(function () {
        return Promise.race([(0, util.sleep)(waitForAnswerTime), stopCriteriaPromise.then(function () {
          return Promise.reject(new Error());
        })]);
      })["catch"](function () {}).then(function () {
        _this2.broadcastChannel.removeEventListener('internal', handleMessage);

        if (!stopCriteria) {
          // no stop criteria -> own is leader
          return beLeader(_this2).then(function () {
            return true;
          });
        } else {
          // other is leader
          return false;
        }
      });

      return applyPromise;
    };

    this._aplQC = this._aplQC + 1;
    this._aplQ = this._aplQ.then(function () {
      return applyRun();
    }).then(function () {
      _this2._aplQC = _this2._aplQC - 1;
    });
    return this._aplQ.then(function () {
      return _this2.isLeader;
    });
  },
  awaitLeadership: function awaitLeadership() {
    if (
    /* _awaitLeadershipPromise */
    !this._aLP) {
      this._aLP = _awaitLeadershipOnce(this);
    }

    return this._aLP;
  },

  set onduplicate(fn) {
    this._dpL = fn;
  },

  die: function die() {
    var _this3 = this;

    this._lstns.forEach(function (listener) {
      return _this3.broadcastChannel.removeEventListener('internal', listener);
    });

    this._lstns = [];

    this._unl.forEach(function (uFn) {
      return uFn.remove();
    });

    this._unl = [];

    if (this.isLeader) {
      this.hasLeader = false;
      this.isLeader = false;
    }

    this.isDead = true;
    return _sendMessage(this, 'death');
  }
};
/**
 * @param leaderElector {LeaderElector}
 */

function _awaitLeadershipOnce(leaderElector) {
  if (leaderElector.isLeader) {
    return util.PROMISE_RESOLVED_VOID;
  }

  return new Promise(function (res) {
    var resolved = false;

    function finish() {
      if (resolved) {
        return;
      }

      resolved = true;
      leaderElector.broadcastChannel.removeEventListener('internal', whenDeathListener);
      res(true);
    } // try once now


    leaderElector.applyOnce().then(function () {
      if (leaderElector.isLeader) {
        finish();
      }
    });
    /**
     * Try on fallbackInterval
     * @recursive
     */

    var tryOnFallBack = function tryOnFallBack() {
      return (0, util.sleep)(leaderElector._options.fallbackInterval).then(function () {
        if (leaderElector.isDead || resolved) {
          return;
        }

        if (leaderElector.isLeader) {
          finish();
        } else {
          return leaderElector.applyOnce(true).then(function () {
            if (leaderElector.isLeader) {
              finish();
            } else {
              tryOnFallBack();
            }
          });
        }
      });
    };

    tryOnFallBack(); // try when other leader dies

    var whenDeathListener = function whenDeathListener(msg) {
      if (msg.context === 'leader' && msg.action === 'death') {
        leaderElector.hasLeader = false;
        leaderElector.applyOnce().then(function () {
          if (leaderElector.isLeader) {
            finish();
          }
        });
      }
    };

    leaderElector.broadcastChannel.addEventListener('internal', whenDeathListener);

    leaderElector._lstns.push(whenDeathListener);
  });
}
/**
 * sends and internal message over the broadcast-channel
 */


function _sendMessage(leaderElector, action) {
  var msgJson = {
    context: 'leader',
    action: action,
    token: leaderElector.token
  };
  return leaderElector.broadcastChannel.postInternal(msgJson);
}

function beLeader(leaderElector) {
  leaderElector.isLeader = true;
  leaderElector.hasLeader = true;
  var unloadFn = (0, es.add)(function () {
    return leaderElector.die();
  });

  leaderElector._unl.push(unloadFn);

  var isLeaderListener = function isLeaderListener(msg) {
    if (msg.context === 'leader' && msg.action === 'apply') {
      _sendMessage(leaderElector, 'tell');
    }

    if (msg.context === 'leader' && msg.action === 'tell' && !leaderElector._dpLC) {
      /**
       * another instance is also leader!
       * This can happen on rare events
       * like when the CPU is at 100% for long time
       * or the tabs are open very long and the browser throttles them.
       * @link https://github.com/pubkey/broadcast-channel/issues/414
       * @link https://github.com/pubkey/broadcast-channel/issues/385
       */
      leaderElector._dpLC = true;

      leaderElector._dpL(); // message the lib user so the app can handle the problem


      _sendMessage(leaderElector, 'tell'); // ensure other leader also knows the problem

    }
  };

  leaderElector.broadcastChannel.addEventListener('internal', isLeaderListener);

  leaderElector._lstns.push(isLeaderListener);

  return _sendMessage(leaderElector, 'tell');
}

function fillOptionsWithDefaults(options, channel) {
  if (!options) options = {};
  options = JSON.parse(JSON.stringify(options));

  if (!options.fallbackInterval) {
    options.fallbackInterval = 3000;
  }

  if (!options.responseTime) {
    options.responseTime = channel.method.averageResponseTime(channel.options);
  }

  return options;
}

function createLeaderElection(channel, options) {
  if (channel._leaderElector) {
    throw new Error('BroadcastChannel already has a leader-elector');
  }

  options = fillOptionsWithDefaults(options, channel);
  var elector = new LeaderElection(channel, options);

  channel._befC.push(function () {
    return elector.die();
  });

  channel._leaderElector = elector;
  return elector;
}
});

unwrapExports(leaderElection);
leaderElection.beLeader;
leaderElection.createLeaderElection;

var lib = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "BroadcastChannel", {
  enumerable: true,
  get: function get() {
    return broadcastChannel$1.BroadcastChannel;
  }
});
Object.defineProperty(exports, "OPEN_BROADCAST_CHANNELS", {
  enumerable: true,
  get: function get() {
    return broadcastChannel$1.OPEN_BROADCAST_CHANNELS;
  }
});
Object.defineProperty(exports, "beLeader", {
  enumerable: true,
  get: function get() {
    return leaderElection.beLeader;
  }
});
Object.defineProperty(exports, "clearNodeFolder", {
  enumerable: true,
  get: function get() {
    return broadcastChannel$1.clearNodeFolder;
  }
});
Object.defineProperty(exports, "createLeaderElection", {
  enumerable: true,
  get: function get() {
    return leaderElection.createLeaderElection;
  }
});
Object.defineProperty(exports, "enforceOptions", {
  enumerable: true,
  get: function get() {
    return broadcastChannel$1.enforceOptions;
  }
});
});

unwrapExports(lib);

/**
 * because babel can only export on default-attribute,
 * we use this for the non-module-build
 * this ensures that users do not have to use
 * var BroadcastChannel = require('broadcast-channel').default;
 * but
 * var BroadcastChannel = require('broadcast-channel');
 */
var index_es5 = {
  BroadcastChannel: lib.BroadcastChannel,
  createLeaderElection: lib.createLeaderElection,
  clearNodeFolder: lib.clearNodeFolder,
  enforceOptions: lib.enforceOptions,
  beLeader: lib.beLeader
};
var index_es5_1 = index_es5.BroadcastChannel;

let broadcastChannel;

const receiveNotification = async ({ id, op, path, workspace }) => {
  logInfo(
    'sys/broadcast',
    `Received broadcast: ${JSON.stringify({ id, op, path, workspace })}`
  );
  switch (op) {
    case 'changePath':
      await runFileChangeWatchers(path, workspace);
      break;
    case 'createPath':
      await runFileCreationWatchers(path, workspace);
      break;
    case 'deletePath':
      await runFileDeletionWatchers(path, workspace);
      break;
    default:
      throw Error(
        `Unexpected broadcast ${JSON.stringify({ id, op, path, workspace })}`
      );
  }
};

const receiveBroadcast = ({ id, op, path, workspace }) => {
  if (id === (self$1 && self$1.id)) {
    // We already received this via a local receiveNotification.
    return;
  }
  receiveNotification({ id, op, path, workspace });
};

const sendBroadcast = async (message) => {
  // We send to ourself immediately, so that we can order effects like cache clears and updates.
  await receiveNotification(message);
  broadcastChannel.postMessage(message);
};

const initBroadcastChannel = async () => {
  broadcastChannel = new index_es5_1('sys/fs');
  broadcastChannel.onmessage = receiveBroadcast;
};

const notifyFileChange = async (path, workspace) =>
  sendBroadcast({ id: self$1 && self$1.id, op: 'changePath', path, workspace });

const notifyFileCreation = async (path, workspace) =>
  sendBroadcast({ id: self$1 && self$1.id, op: 'createPath', path, workspace });

const notifyFileDeletion = async (path, workspace) =>
  sendBroadcast({ id: self$1 && self$1.id, op: 'deletePath', path, workspace });

initBroadcastChannel();

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

const { promises: promises$3 } = fs;
const { serialize } = v8$1;

const getFileWriter = () => {
  if (isNode) {
    return async (qualifiedPath, data, doSerialize) => {
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
        // FIX: Do proper versioning.
        const version = 0;
        return version;
      } catch (error) {
        throw error;
      }
    };
  } else if (isBrowser || isWebWorker) {
    return async (qualifiedPath, data) => {
      return db(qualifiedPath).setItemAndIncrementVersion(qualifiedPath, data);
    };
  }
};

const fileWriter = getFileWriter();

const writeNonblocking = (path, data, options = {}) => {
  // Schedule a deferred write to update persistent storage.
  addPending(write(path, data, options));
  throw new ErrorWouldBlock(`Would have blocked on write ${path}`);
};

const write = async (path, data, options = {}) => {
  data = await data;

  if (typeof data === 'function') {
    // Always fail to write functions.
    return undefined;
  }

  const {
    doSerialize = true,
    ephemeral,
    workspace = getFilesystem(),
  } = options;

  const qualifiedPath = qualifyPath(path, workspace);
  const file = ensureQualifiedFile(path, qualifiedPath);

  if (!file.data) {
    await notifyFileCreation(path, workspace);
  }

  file.data = data;

  if (!ephemeral && workspace !== undefined) {
    file.version = await fileWriter(qualifiedPath, data, doSerialize);
  }

  // Let everyone else know the file has changed.
  await notifyFileChange(path, workspace);

  return true;
};

/* global self */

const { promises: promises$2 } = fs;
const { deserialize } = v8$1;

const getUrlFetcher = () => {
  if (isBrowser) {
    return window.fetch;
  }
  if (isWebWorker) {
    return self.fetch;
  }
  if (isNode) {
    return nodeFetch;
  }
  throw Error('Expected browser or web worker or node');
};

const urlFetcher = getUrlFetcher();

const getExternalFileFetcher = () => {
  if (isNode) {
    // FIX: Put this through getFile, also.
    return async (qualifiedPath) => {
      try {
        let data = await promises$2.readFile(qualifiedPath);
        return data;
      } catch (e) {
        if (e.code && e.code === 'ENOENT') {
          return {};
        }
        logInfo('sys/getExternalFile/error', e.toString());
      }
    };
  } else if (isBrowser || isWebWorker) {
    return async (qualifiedPath) => {};
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const externalFileFetcher = getExternalFileFetcher();

const getInternalFileFetcher = () => {
  if (isNode) {
    // FIX: Put this through getFile, also.
    return async (qualifiedPath, doSerialize = true) => {
      try {
        let data = await promises$2.readFile(qualifiedPath);
        if (doSerialize) {
          data = deserialize(data);
        }
        // FIX: Use a proper version.
        return { data, version: 0 };
      } catch (e) {
        if (e.code && e.code === 'ENOENT') {
          return {};
        }
        logInfo('sys/getExternalFile/error', e.toString());
      }
    };
  } else if (isBrowser || isWebWorker) {
    return (qualifiedPath) =>
      db(qualifiedPath).getItemAndVersion(qualifiedPath);
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const internalFileFetcher = getInternalFileFetcher();

const getInternalFileVersionFetcher = (qualify = qualifyPath) => {
  if (isNode) {
    // FIX: Put this through getFile, also.
    return (qualifiedPath) => {
      // FIX: Use a proper version.
      return 0;
    };
  } else if (isBrowser || isWebWorker) {
    return (qualifiedPath) => db(qualifiedPath).getItemVersion(qualifiedPath);
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const internalFileVersionFetcher = getInternalFileVersionFetcher();

// Fetch from internal store.
const fetchPersistent = (qualifiedPath, { workspace, doSerialize }) => {
  try {
    if (workspace) {
      return internalFileFetcher(qualifiedPath, doSerialize);
    } else {
      return {};
    }
  } catch (e) {
    if (e.code && e.code === 'ENOENT') {
      return {};
    }
    logInfo('sys/fetchPersistent/error', e.toString());
  }
};

const fetchPersistentVersion = (qualifiedPath, { workspace }) => {
  try {
    if (workspace) {
      return internalFileVersionFetcher(qualifiedPath);
    }
  } catch (e) {
    if (e.code && e.code === 'ENOENT') {
      return;
    }
    logInfo('sys/fetchPersistentVersion/error', e.toString());
  }
};

// Fetch from external sources.
const fetchSources = async (sources, { workspace }) => {
  // Try to load the data from a source.
  for (const source of sources) {
    if (typeof source === 'string') {
      try {
        if (source.startsWith('http:') || source.startsWith('https:')) {
          logInfo('sys/fetchSources/url', source);
          const response = await urlFetcher(source, { cache: 'reload' });
          if (response.ok) {
            return new Uint8Array(await response.arrayBuffer());
          }
        } else {
          logInfo('sys/fetchSources/file', source);
          // Assume a file path.
          const data = await externalFileFetcher(source);
          if (data !== undefined) {
            return data;
          }
        }
      } catch (e) {}
    } else {
      throw Error('Expected file source to be a string');
    }
  }
};

const readNonblocking = (path, options = {}) => {
  const { workspace = getFilesystem() } = options;
  const file = getFile(path, workspace);
  if (file) {
    return file.data;
  }
  addPending(read(path, options));
  throw new ErrorWouldBlock(`Would have blocked on read ${path}`);
};

const read = async (path, options = {}) => {
  const {
    allowFetch = true,
    ephemeral,
    sources = [],
    workspace = getFilesystem(),
    useCache = true,
    forceNoCache = false,
    decode,
  } = options;
  const qualifiedPath = qualifyPath(path, workspace);
  const file = ensureQualifiedFile(path, qualifiedPath);

  if (file.data && workspace) {
    // Check that the version is still up to date.
    if (
      file.version !==
      (await fetchPersistentVersion(qualifiedPath, { workspace }))
    ) {
      file.data = undefined;
    }
  }

  if (file.data === undefined || useCache === false || forceNoCache) {
    const { value, version } = await fetchPersistent(qualifiedPath, {
      workspace,
      doSerialize: true,
    });
    file.data = value;
    file.version = version;
  }

  if (file.data === undefined && allowFetch && sources.length > 0) {
    let data = await fetchSources(sources, { workspace });
    if (decode) {
      data = new TextDecoder(decode).decode(data);
    }
    if (!ephemeral && file.data !== undefined) {
      // Update persistent cache.
      await write(path, data, { ...options, doSerialize: true });
    }
    file.data = data;
  }
  if (file.data !== undefined) {
    if (file.data.then) {
      // Resolve any outstanding promises.
      file.data = await file.data;
    }
  }
  return file.data;
};

const readOrWatch = async (path, options = {}) => {
  const data = await read(path, options);
  if (data !== undefined) {
    return data;
  }
  let resolveWatch;
  const watch = new Promise((resolve) => {
    resolveWatch = resolve;
  });
  const watcher = await watchFile(path, options.workspace, (file) =>
    resolveWatch(path)
  );
  await watch;
  await unwatchFile(path, options.workspace, watcher);
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

const pending$1 = [];

// Execute tasks to complete before using system.
const boot = async () => {
  // No need to wait.
  if (status === BOOTED) {
    return;
  }
  if (status === BOOTING) {
    // Wait for the system to boot.
    return new Promise((resolve, reject) => {
      pending$1.push(resolve);
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
  while (pending$1.length > 0) {
    pending$1.pop()();
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
  console.log(JSON.stringify(value));
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

const getKeys = async ({ workspace }) => (await getFileLister({ workspace }))();

const listFiles = async ({ workspace } = {}) => {
  if (workspace === undefined) {
    workspace = getFilesystem();
  }
  const prefix = qualifyPath('', workspace);
  const keys = await getKeys({ workspace });
  const files = [];
  for (const key of keys) {
    if (key && key.startsWith(prefix)) {
      files.push(key.substring(prefix.length));
    }
  }
  return files;
};

let activeServiceLimit = 5;
let idleServiceLimit = 5;
const activeServices = new Set();
const idleServices = [];
const pending = [];
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
      pending.push({ spec, resolve, context })
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
  if (pending.length > 0 && activeServices.size < activeServiceLimit) {
    const { spec, resolve, context } = pending.shift();
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
  pendingCount: pending.length,
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

const { promises } = fs;

const getPersistentFileDeleter = () => {
  if (isNode) {
    return async (qualifiedPath) => {
      return promises.unlink(qualifiedPath);
    };
  } else if (isBrowser || isWebWorker) {
    return async (qualifiedPath) => {
      await db(qualifiedPath).removeItem(qualifiedPath);
    };
  } else {
    throw Error('Expected node or browser or web worker');
  }
};

const persistentFileDeleter = getPersistentFileDeleter();

const remove = async (path, { workspace } = {}) => {
  await persistentFileDeleter(qualifyPath(path, workspace));
  await notifyFileDeletion(path, workspace);
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

export { ErrorWouldBlock, addOnEmitHandler, addPending, ask, askService, askServices, beginEmitGroup, boot, clearCacheDb, clearEmitted, computeHash, createConversation, createService, elapsed, emit, endTime, finishEmitGroup, flushEmitGroup, generateUniqueId, getActiveServices, getConfig, getControlValue, getFilesystem, getPendingErrorHandler, getServicePoolInfo, getSourceLocation, getWorkspace, hash, isBrowser, isNode, isWebWorker, listFiles, log, logError, logInfo, onBoot, qualifyPath, read, readNonblocking, readOrWatch, remove, removeOnEmitHandler, reportTimes, resolvePending, restoreEmitGroup, saveEmitGroup, setConfig, setControlValue, setHandleAskUser, setPendingErrorHandler, setupFilesystem, setupWorkspace, sleep, startTime$1 as startTime, tellServices, terminateActiveServices, unwatchFile, unwatchFileCreation, unwatchFileDeletion, unwatchLog, unwatchServices, waitServices, watchFile, watchFileCreation, watchFileDeletion, watchLog, watchServices, write, writeNonblocking };
