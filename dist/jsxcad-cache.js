var HAS_WEAKSET_SUPPORT = typeof WeakSet === 'function';
var keys = Object.keys;
/**
 * @function addToCache
 *
 * add object to cache if an object
 *
 * @param value the value to potentially add to cache
 * @param cache the cache to add to
 */
function addToCache(value, cache) {
    if (value && typeof value === 'object') {
        cache.add(value);
    }
}
/**
 * @function hasPair
 *
 * @description
 * does the `pairToMatch` exist in the list of `pairs` provided based on the
 * `isEqual` check
 *
 * @param pairs the pairs to compare against
 * @param pairToMatch the pair to match
 * @param isEqual the equality comparator used
 * @param meta the meta provided
 * @returns does the pair exist in the pairs provided
 */
function hasPair(pairs, pairToMatch, isEqual, meta) {
    var length = pairs.length;
    var pair;
    for (var index = 0; index < length; index++) {
        pair = pairs[index];
        if (isEqual(pair[0], pairToMatch[0], meta) &&
            isEqual(pair[1], pairToMatch[1], meta)) {
            return true;
        }
    }
    return false;
}
/**
 * @function hasValue
 *
 * @description
 * does the `valueToMatch` exist in the list of `values` provided based on the
 * `isEqual` check
 *
 * @param values the values to compare against
 * @param valueToMatch the value to match
 * @param isEqual the equality comparator used
 * @param meta the meta provided
 * @returns does the value exist in the values provided
 */
function hasValue(values, valueToMatch, isEqual, meta) {
    var length = values.length;
    for (var index = 0; index < length; index++) {
        if (isEqual(values[index], valueToMatch, meta)) {
            return true;
        }
    }
    return false;
}
/**
 * @function sameValueZeroEqual
 *
 * @description
 * are the values passed strictly equal or both NaN
 *
 * @param a the value to compare against
 * @param b the value to test
 * @returns are the values equal by the SameValueZero principle
 */
function sameValueZeroEqual(a, b) {
    return a === b || (a !== a && b !== b);
}
/**
 * @function isPlainObject
 *
 * @description
 * is the value a plain object
 *
 * @param value the value to test
 * @returns is the value a plain object
 */
function isPlainObject(value) {
    return value.constructor === Object || value.constructor == null;
}
/**
 * @function isPromiseLike
 *
 * @description
 * is the value promise-like (meaning it is thenable)
 *
 * @param value the value to test
 * @returns is the value promise-like
 */
function isPromiseLike(value) {
    return !!value && typeof value.then === 'function';
}
/**
 * @function isReactElement
 *
 * @description
 * is the value passed a react element
 *
 * @param value the value to test
 * @returns is the value a react element
 */
function isReactElement(value) {
    return !!(value && value.$$typeof);
}
/**
 * @function getNewCacheFallback
 *
 * @description
 * in cases where WeakSet is not supported, creates a new custom
 * object that mimics the necessary API aspects for cache purposes
 *
 * @returns the new cache object
 */
function getNewCacheFallback() {
    return Object.create({
        _values: [],
        add: function (value) {
            this._values.push(value);
        },
        has: function (value) {
            return this._values.indexOf(value) !== -1;
        },
    });
}
/**
 * @function getNewCache
 *
 * @description
 * get a new cache object to prevent circular references
 *
 * @returns the new cache object
 */
var getNewCache = (function (canUseWeakMap) {
    if (canUseWeakMap) {
        return function _getNewCache() {
            return new WeakSet();
        };
    }
    return getNewCacheFallback;
})(HAS_WEAKSET_SUPPORT);
/**
 * @function createCircularEqualCreator
 *
 * @description
 * create a custom isEqual handler specific to circular objects
 *
 * @param [isEqual] the isEqual comparator to use instead of isDeepEqual
 * @returns the method to create the `isEqual` function
 */
function createCircularEqualCreator(isEqual) {
    return function createCircularEqual(comparator) {
        var _comparator = isEqual || comparator;
        return function circularEqual(a, b, cache) {
            if (cache === void 0) { cache = getNewCache(); }
            var hasA = cache.has(a);
            var hasB = cache.has(b);
            if (hasA || hasB) {
                return hasA && hasB;
            }
            addToCache(a, cache);
            addToCache(b, cache);
            return _comparator(a, b, cache);
        };
    };
}
/**
 * @function toPairs
 *
 * @description
 * convert the map passed into pairs (meaning an array of [key, value] tuples)
 *
 * @param map the map to convert to [key, value] pairs (entries)
 * @returns the [key, value] pairs
 */
function toPairs(map) {
    var pairs = new Array(map.size);
    var index = 0;
    map.forEach(function (value, key) {
        pairs[index++] = [key, value];
    });
    return pairs;
}
/**
 * @function toValues
 *
 * @description
 * convert the set passed into values
 *
 * @param set the set to convert to values
 * @returns the values
 */
function toValues(set) {
    var values = new Array(set.size);
    var index = 0;
    set.forEach(function (value) {
        values[index++] = value;
    });
    return values;
}
/**
 * @function areArraysEqual
 *
 * @description
 * are the arrays equal in value
 *
 * @param a the array to test
 * @param b the array to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the arrays equal
 */
function areArraysEqual(a, b, isEqual, meta) {
    var length = a.length;
    if (b.length !== length) {
        return false;
    }
    for (var index = 0; index < length; index++) {
        if (!isEqual(a[index], b[index], meta)) {
            return false;
        }
    }
    return true;
}
/**
 * @function areMapsEqual
 *
 * @description
 * are the maps equal in value
 *
 * @param a the map to test
 * @param b the map to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta map to pass through
 * @returns are the maps equal
 */
function areMapsEqual(a, b, isEqual, meta) {
    if (a.size !== b.size) {
        return false;
    }
    var pairsA = toPairs(a);
    var pairsB = toPairs(b);
    var length = pairsA.length;
    for (var index = 0; index < length; index++) {
        if (!hasPair(pairsB, pairsA[index], isEqual, meta) ||
            !hasPair(pairsA, pairsB[index], isEqual, meta)) {
            return false;
        }
    }
    return true;
}
var OWNER = '_owner';
var hasOwnProperty = Function.prototype.bind.call(Function.prototype.call, Object.prototype.hasOwnProperty);
/**
 * @function areObjectsEqual
 *
 * @description
 * are the objects equal in value
 *
 * @param a the object to test
 * @param b the object to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the objects equal
 */
function areObjectsEqual(a, b, isEqual, meta) {
    var keysA = keys(a);
    var length = keysA.length;
    if (keys(b).length !== length) {
        return false;
    }
    var key;
    for (var index = 0; index < length; index++) {
        key = keysA[index];
        if (!hasOwnProperty(b, key)) {
            return false;
        }
        if (key === OWNER && isReactElement(a)) {
            if (!isReactElement(b)) {
                return false;
            }
        }
        else if (!isEqual(a[key], b[key], meta)) {
            return false;
        }
    }
    return true;
}
/**
 * @function areRegExpsEqual
 *
 * @description
 * are the regExps equal in value
 *
 * @param a the regExp to test
 * @param b the regExp to test agains
 * @returns are the regExps equal
 */
function areRegExpsEqual(a, b) {
    return (a.source === b.source &&
        a.global === b.global &&
        a.ignoreCase === b.ignoreCase &&
        a.multiline === b.multiline &&
        a.unicode === b.unicode &&
        a.sticky === b.sticky &&
        a.lastIndex === b.lastIndex);
}
/**
 * @function areSetsEqual
 *
 * @description
 * are the sets equal in value
 *
 * @param a the set to test
 * @param b the set to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta set to pass through
 * @returns are the sets equal
 */
function areSetsEqual(a, b, isEqual, meta) {
    if (a.size !== b.size) {
        return false;
    }
    var valuesA = toValues(a);
    var valuesB = toValues(b);
    var length = valuesA.length;
    for (var index = 0; index < length; index++) {
        if (!hasValue(valuesB, valuesA[index], isEqual, meta) ||
            !hasValue(valuesA, valuesB[index], isEqual, meta)) {
            return false;
        }
    }
    return true;
}

var isArray = Array.isArray;
var HAS_MAP_SUPPORT = typeof Map === 'function';
var HAS_SET_SUPPORT = typeof Set === 'function';
var OBJECT_TYPEOF = 'object';
function createComparator(createIsEqual) {
    var isEqual = 
    /* eslint-disable no-use-before-define */
    typeof createIsEqual === 'function'
        ? createIsEqual(comparator)
        : comparator;
    /* eslint-enable */
    /**
     * @function comparator
     *
     * @description
     * compare the value of the two objects and return true if they are equivalent in values
     *
     * @param a the value to test against
     * @param b the value to test
     * @param [meta] an optional meta object that is passed through to all equality test calls
     * @returns are a and b equivalent in value
     */
    function comparator(a, b, meta) {
        if (sameValueZeroEqual(a, b)) {
            return true;
        }
        if (a && b && typeof a === OBJECT_TYPEOF && typeof b === OBJECT_TYPEOF) {
            if (isPlainObject(a) && isPlainObject(b)) {
                return areObjectsEqual(a, b, isEqual, meta);
            }
            var arrayA = isArray(a);
            var arrayB = isArray(b);
            if (arrayA || arrayB) {
                return arrayA === arrayB && areArraysEqual(a, b, isEqual, meta);
            }
            var aDate = a instanceof Date;
            var bDate = b instanceof Date;
            if (aDate || bDate) {
                return aDate === bDate && sameValueZeroEqual(a.getTime(), b.getTime());
            }
            var aRegExp = a instanceof RegExp;
            var bRegExp = b instanceof RegExp;
            if (aRegExp || bRegExp) {
                return aRegExp === bRegExp && areRegExpsEqual(a, b);
            }
            if (isPromiseLike(a) || isPromiseLike(b)) {
                return a === b;
            }
            if (HAS_MAP_SUPPORT) {
                var aMap = a instanceof Map;
                var bMap = b instanceof Map;
                if (aMap || bMap) {
                    return aMap === bMap && areMapsEqual(a, b, isEqual, meta);
                }
            }
            if (HAS_SET_SUPPORT) {
                var aSet = a instanceof Set;
                var bSet = b instanceof Set;
                if (aSet || bSet) {
                    return aSet === bSet && areSetsEqual(a, b, isEqual, meta);
                }
            }
            return areObjectsEqual(a, b, isEqual, meta);
        }
        return false;
    }
    return comparator;
}

// comparator
var deepEqual = createComparator();
var shallowEqual = createComparator(function () { return sameValueZeroEqual; });
var circularDeepEqual = createComparator(createCircularEqualCreator());
var circularShallowEqual = createComparator(createCircularEqualCreator(sameValueZeroEqual));

/**
 * @constant DEFAULT_OPTIONS_KEYS the default options keys
 */
var DEFAULT_OPTIONS_KEYS = {
    isEqual: true,
    isMatchingKey: true,
    isPromise: true,
    maxSize: true,
    onCacheAdd: true,
    onCacheChange: true,
    onCacheHit: true,
    transformKey: true,
};
/**
 * @function slice
 *
 * @description
 * slice.call() pre-bound
 */
var slice = Array.prototype.slice;
/**
 * @function cloneArray
 *
 * @description
 * clone the array-like object and return the new array
 *
 * @param arrayLike the array-like object to clone
 * @returns the clone as an array
 */
function cloneArray(arrayLike) {
    var length = arrayLike.length;
    if (!length) {
        return [];
    }
    if (length === 1) {
        return [arrayLike[0]];
    }
    if (length === 2) {
        return [arrayLike[0], arrayLike[1]];
    }
    if (length === 3) {
        return [arrayLike[0], arrayLike[1], arrayLike[2]];
    }
    return slice.call(arrayLike, 0);
}
/**
 * @function getCustomOptions
 *
 * @description
 * get the custom options on the object passed
 *
 * @param options the memoization options passed
 * @returns the custom options passed
 */
function getCustomOptions(options) {
    var customOptions = {};
    /* eslint-disable no-restricted-syntax */
    for (var key in options) {
        if (!DEFAULT_OPTIONS_KEYS[key]) {
            customOptions[key] = options[key];
        }
    }
    /* eslint-enable */
    return customOptions;
}
/**
 * @function isMemoized
 *
 * @description
 * is the function passed already memoized
 *
 * @param fn the function to test
 * @returns is the function already memoized
 */
function isMemoized(fn) {
    return (typeof fn === 'function' &&
        fn.isMemoized);
}
/**
 * @function isSameValueZero
 *
 * @description
 * are the objects equal based on SameValueZero equality
 *
 * @param object1 the first object to compare
 * @param object2 the second object to compare
 * @returns are the two objects equal
 */
function isSameValueZero(object1, object2) {
    // eslint-disable-next-line no-self-compare
    return object1 === object2 || (object1 !== object1 && object2 !== object2);
}
/**
 * @function mergeOptions
 *
 * @description
 * merge the options into the target
 *
 * @param existingOptions the options provided
 * @param newOptions the options to include
 * @returns the merged options
 */
function mergeOptions(existingOptions, newOptions) {
    // @ts-ignore
    var target = {};
    /* eslint-disable no-restricted-syntax */
    for (var key in existingOptions) {
        target[key] = existingOptions[key];
    }
    for (var key in newOptions) {
        target[key] = newOptions[key];
    }
    /* eslint-enable */
    return target;
}

// utils
var Cache = /** @class */ (function () {
    function Cache(options) {
        this.keys = [];
        this.values = [];
        this.options = options;
        var isMatchingKeyFunction = typeof options.isMatchingKey === 'function';
        if (isMatchingKeyFunction) {
            this.getKeyIndex = this._getKeyIndexFromMatchingKey;
        }
        else if (options.maxSize > 1) {
            this.getKeyIndex = this._getKeyIndexForMany;
        }
        else {
            this.getKeyIndex = this._getKeyIndexForSingle;
        }
        this.canTransformKey = typeof options.transformKey === 'function';
        this.shouldCloneArguments = this.canTransformKey || isMatchingKeyFunction;
        this.shouldUpdateOnAdd = typeof options.onCacheAdd === 'function';
        this.shouldUpdateOnChange = typeof options.onCacheChange === 'function';
        this.shouldUpdateOnHit = typeof options.onCacheHit === 'function';
    }
    Object.defineProperty(Cache.prototype, "size", {
        get: function () {
            return this.keys.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cache.prototype, "snapshot", {
        get: function () {
            return {
                keys: cloneArray(this.keys),
                size: this.size,
                values: cloneArray(this.values),
            };
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @function _getKeyIndexFromMatchingKey
     *
     * @description
     * gets the matching key index when a custom key matcher is used
     *
     * @param keyToMatch the key to match
     * @returns the index of the matching key, or -1
     */
    Cache.prototype._getKeyIndexFromMatchingKey = function (keyToMatch) {
        var _a = this.options, isMatchingKey = _a.isMatchingKey, maxSize = _a.maxSize;
        var keys = this.keys;
        var keysLength = keys.length;
        if (!keysLength) {
            return -1;
        }
        if (isMatchingKey(keys[0], keyToMatch)) {
            return 0;
        }
        if (maxSize > 1) {
            for (var index = 1; index < keysLength; index++) {
                if (isMatchingKey(keys[index], keyToMatch)) {
                    return index;
                }
            }
        }
        return -1;
    };
    /**
     * @function _getKeyIndexForMany
     *
     * @description
     * gets the matching key index when multiple keys are used
     *
     * @param keyToMatch the key to match
     * @returns the index of the matching key, or -1
     */
    Cache.prototype._getKeyIndexForMany = function (keyToMatch) {
        var isEqual = this.options.isEqual;
        var keys = this.keys;
        var keysLength = keys.length;
        if (!keysLength) {
            return -1;
        }
        if (keysLength === 1) {
            return this._getKeyIndexForSingle(keyToMatch);
        }
        var keyLength = keyToMatch.length;
        var existingKey;
        var argIndex;
        if (keyLength > 1) {
            for (var index = 0; index < keysLength; index++) {
                existingKey = keys[index];
                if (existingKey.length === keyLength) {
                    argIndex = 0;
                    for (; argIndex < keyLength; argIndex++) {
                        if (!isEqual(existingKey[argIndex], keyToMatch[argIndex])) {
                            break;
                        }
                    }
                    if (argIndex === keyLength) {
                        return index;
                    }
                }
            }
        }
        else {
            for (var index = 0; index < keysLength; index++) {
                existingKey = keys[index];
                if (existingKey.length === keyLength &&
                    isEqual(existingKey[0], keyToMatch[0])) {
                    return index;
                }
            }
        }
        return -1;
    };
    /**
     * @function _getKeyIndexForSingle
     *
     * @description
     * gets the matching key index when a single key is used
     *
     * @param keyToMatch the key to match
     * @returns the index of the matching key, or -1
     */
    Cache.prototype._getKeyIndexForSingle = function (keyToMatch) {
        var keys = this.keys;
        if (!keys.length) {
            return -1;
        }
        var existingKey = keys[0];
        var length = existingKey.length;
        if (keyToMatch.length !== length) {
            return -1;
        }
        var isEqual = this.options.isEqual;
        if (length > 1) {
            for (var index = 0; index < length; index++) {
                if (!isEqual(existingKey[index], keyToMatch[index])) {
                    return -1;
                }
            }
            return 0;
        }
        return isEqual(existingKey[0], keyToMatch[0]) ? 0 : -1;
    };
    /**
     * @function orderByLru
     *
     * @description
     * order the array based on a Least-Recently-Used basis
     *
     * @param key the new key to move to the front
     * @param value the new value to move to the front
     * @param startingIndex the index of the item to move to the front
     */
    Cache.prototype.orderByLru = function (key, value, startingIndex) {
        var keys = this.keys;
        var values = this.values;
        var currentLength = keys.length;
        var index = startingIndex;
        while (index--) {
            keys[index + 1] = keys[index];
            values[index + 1] = values[index];
        }
        keys[0] = key;
        values[0] = value;
        var maxSize = this.options.maxSize;
        if (currentLength === maxSize && startingIndex === currentLength) {
            keys.pop();
            values.pop();
        }
        else if (startingIndex >= maxSize) {
            // eslint-disable-next-line no-multi-assign
            keys.length = values.length = maxSize;
        }
    };
    /**
     * @function updateAsyncCache
     *
     * @description
     * update the promise method to auto-remove from cache if rejected, and
     * if resolved then fire cache hit / changed
     *
     * @param memoized the memoized function
     */
    Cache.prototype.updateAsyncCache = function (memoized) {
        var _this = this;
        var _a = this.options, onCacheChange = _a.onCacheChange, onCacheHit = _a.onCacheHit;
        var firstKey = this.keys[0];
        var firstValue = this.values[0];
        this.values[0] = firstValue.then(function (value) {
            if (_this.shouldUpdateOnHit) {
                onCacheHit(_this, _this.options, memoized);
            }
            if (_this.shouldUpdateOnChange) {
                onCacheChange(_this, _this.options, memoized);
            }
            return value;
        }, function (error) {
            var keyIndex = _this.getKeyIndex(firstKey);
            if (keyIndex !== -1) {
                _this.keys.splice(keyIndex, 1);
                _this.values.splice(keyIndex, 1);
            }
            throw error;
        });
    };
    return Cache;
}());

// cache
function createMemoizedFunction(fn, options) {
    if (options === void 0) { options = {}; }
    if (isMemoized(fn)) {
        return createMemoizedFunction(fn.fn, mergeOptions(fn.options, options));
    }
    if (typeof fn !== 'function') {
        throw new TypeError('You must pass a function to `memoize`.');
    }
    var _a = options.isEqual, isEqual = _a === void 0 ? isSameValueZero : _a, isMatchingKey = options.isMatchingKey, _b = options.isPromise, isPromise = _b === void 0 ? false : _b, _c = options.maxSize, maxSize = _c === void 0 ? 1 : _c, onCacheAdd = options.onCacheAdd, onCacheChange = options.onCacheChange, onCacheHit = options.onCacheHit, transformKey = options.transformKey;
    var normalizedOptions = mergeOptions({
        isEqual: isEqual,
        isMatchingKey: isMatchingKey,
        isPromise: isPromise,
        maxSize: maxSize,
        onCacheAdd: onCacheAdd,
        onCacheChange: onCacheChange,
        onCacheHit: onCacheHit,
        transformKey: transformKey,
    }, getCustomOptions(options));
    var cache = new Cache(normalizedOptions);
    var keys = cache.keys, values = cache.values, canTransformKey = cache.canTransformKey, shouldCloneArguments = cache.shouldCloneArguments, shouldUpdateOnAdd = cache.shouldUpdateOnAdd, shouldUpdateOnChange = cache.shouldUpdateOnChange, shouldUpdateOnHit = cache.shouldUpdateOnHit;
    // @ts-ignore
    var memoized = function memoized() {
        // @ts-ignore
        var key = shouldCloneArguments
            ? cloneArray(arguments)
            : arguments;
        if (canTransformKey) {
            key = transformKey(key);
        }
        var keyIndex = keys.length ? cache.getKeyIndex(key) : -1;
        if (keyIndex !== -1) {
            if (shouldUpdateOnHit) {
                onCacheHit(cache, normalizedOptions, memoized);
            }
            if (keyIndex) {
                cache.orderByLru(keys[keyIndex], values[keyIndex], keyIndex);
                if (shouldUpdateOnChange) {
                    onCacheChange(cache, normalizedOptions, memoized);
                }
            }
        }
        else {
            var newValue = fn.apply(this, arguments);
            var newKey = shouldCloneArguments
                ? key
                : cloneArray(arguments);
            cache.orderByLru(newKey, newValue, keys.length);
            if (isPromise) {
                cache.updateAsyncCache(memoized);
            }
            if (shouldUpdateOnAdd) {
                onCacheAdd(cache, normalizedOptions, memoized);
            }
            if (shouldUpdateOnChange) {
                onCacheChange(cache, normalizedOptions, memoized);
            }
        }
        return values[0];
    };
    memoized.cache = cache;
    memoized.fn = fn;
    memoized.isMemoized = true;
    memoized.options = normalizedOptions;
    return memoized;
}

const memoizedOps = new Set();

const memoize = (op, options) => {
  const memoizedOp = createMemoizedFunction(op, options);
  memoizedOps.add(memoizedOp);
  return memoizedOp;
};

const clearCache = () => {
  for (const memoizedOp of memoizedOps) {
    const cache = memoizedOp.cache;
    cache.keys.length = 0;
    cache.values.length = 0;
  }
};

// This is a very thin abstraction layer to decouple from any particular cache implementation.

const maxSize = 500;

// Keyed by identity

/** @type {function(*):?} */
const cache = (op) => memoize(op, { maxSize });

// Keyed by matrix structure and geometry identity.

const isMatchingTransformKey = ([aMatrix, aGeometry], [bMatrix, bGeometry]) =>
  aGeometry === bGeometry && deepEqual(aMatrix, bMatrix);

const cacheTransform = (op) => memoize(op, { isMatchingKey: isMatchingTransformKey, maxSize });

// Keyed by tag-list and geometry identity.

const isMatchingRewriteTagsKey = ([aAdd, aRemove, aGeometry, aConditionTags, aConditionSpec],
                                  [bAdd, bRemove, bGeometry, bConditionTags, bConditionSpec]) =>
  aGeometry === bGeometry && aConditionSpec === bConditionSpec && deepEqual(aConditionTags, bConditionTags) && deepEqual(aAdd, bAdd) && deepEqual(aRemove, bRemove);

const cacheRewriteTags = (op) => memoize(op, { isMatchingKey: isMatchingRewriteTagsKey, maxSize });

// Keyed by plane structure and geometry identity.

const isMatchingCutKey = ([aPlane, aGeometry], [bPlane, bGeometry]) =>
  aGeometry === bGeometry && deepEqual(aPlane, bPlane);

const cacheCut = (op) => memoize(op, { isMatchingKey: isMatchingCutKey, maxSize });

const cacheSection = (op) => memoize(op, { isMatchingKey: isMatchingCutKey, maxSize });

// Keyed by points structure.

const isMatchingPointsKey = ([aPoints], [bPoints]) => deepEqual(aPoints, bPoints);

const cachePoints = (op) => memoize(op, { isMatchingKey: isMatchingPointsKey, maxSize });

export { cache, cacheCut, cachePoints, cacheRewriteTags, cacheSection, cacheTransform, clearCache };
