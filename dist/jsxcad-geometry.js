import { composeTransforms, fromSurfaceMesh, fromPointsToAlphaShapeAsSurfaceMesh, disjoint as disjoint$1, deletePendingSurfaceMeshes, bend as bend$1, fromSurfaceMeshEmitBoundingBox, toSurfaceMesh, serializeSurfaceMesh, cast as cast$1, clip as clip$1, computeCentroid as computeCentroid$1, computeNormal as computeNormal$1, outline as outline$1, fuse as fuse$1, inset as inset$1, eachPointOfSurfaceMesh, section as section$1, withAabbTreeQuery, convexHull as convexHull$1, cut as cut$1, deform as deform$1, demeshSurfaceMesh, extrude as extrude$1, faces as faces$1, reverseFaceOrientationsOfSurfaceMesh, fromFunctionToSurfaceMesh, fromPointsToSurfaceMesh, fromPolygonsToSurfaceMesh, generateEnvelope, generatePackingEnvelopeForSurfaceMesh, invertTransform, fromSegmentToInverseTransform, grow as grow$1, fill as fill$1, join as join$1, link as link$1, loft as loft$1, makeAbsolute as makeAbsolute$1, computeArea, computeVolume, minkowskiDifferenceOfSurfaceMeshes, minkowskiShellOfSurfaceMeshes, minkowskiSumOfSurfaceMeshes, offset as offset$1, pushSurfaceMesh, remeshSurfaceMesh, isotropicRemeshingOfSurfaceMesh, removeSelfIntersectionsOfSurfaceMesh, seam as seam$1, approximateSurfaceMesh, simplifySurfaceMesh, subdivideSurfaceMesh, smoothShapeOfSurfaceMesh, smoothSurfaceMesh, separate as separate$1, fromSurfaceMeshToTriangles, taperSurfaceMesh, doesSelfIntersectOfSurfaceMesh, twistSurfaceMesh, SurfaceMeshQuery, fromRotateXToTransform, fromRotateYToTransform, fromRotateZToTransform, fromTranslateToTransform, fromScaleToTransform } from './jsxcad-algorithm-cgal.js';
import { computeHash, write as write$1, read as read$1, readNonblocking as readNonblocking$1, ErrorWouldBlock, addPending } from './jsxcad-sys.js';
import { transform as transform$4, min, max, equals, subtract, dot, distance, canonicalize as canonicalize$5 } from './jsxcad-math-vec3.js';
import { identityMatrix, fromTranslation, fromZRotation, fromScaling } from './jsxcad-math-mat4.js';
import { canonicalize as canonicalize$7 } from './jsxcad-math-plane.js';
import { canonicalize as canonicalize$6 } from './jsxcad-math-poly3.js';

const update = (geometry, updates, changes) => {
  if (updates === undefined) {
    return geometry;
  }
  if (geometry === updates) {
    return geometry;
  }
  const updated = {};
  for (const key of Object.keys(geometry)) {
    if (key === 'cache') {
      // Caches contains derivations from the original object.
      continue;
    }
    if (key === 'hash') {
      // Hash is a bit like a symbol, but we want it to persist.
      continue;
    }
    if (typeof key === 'symbol') {
      // Don't copy symbols.
      continue;
    }
    updated[key] = geometry[key];
  }
  let changed = false;
  for (const key of Object.keys(updates)) {
    if (updates[key] !== updated[key]) {
      updated[key] = updates[key];
      changed = true;
    }
  }
  if (changes !== undefined) {
    for (const key of Object.keys(changes)) {
      if (changes[key] !== updated[key]) {
        updated[key] = changes[key];
        changed = true;
      }
    }
  }
  if (changed) {
    return updated;
  } else {
    return geometry;
  }
};

const replacer = (from, to, limit = from.length) => {
  const map = new Map();
  for (let nth = 0; nth < limit; nth++) {
    map.set(from[nth], to[nth]);
  }
  const update = (geometry, descend) => {
    const cut = map.get(geometry);
    if (cut) {
      return cut;
    } else {
      return descend();
    }
  };
  return (geometry) => rewrite(geometry, update);
};

const validateContent = (geometry, content) => {
  if (content && content.some((value) => !value)) {
    for (const v of content) {
      console.log(`QQ/content: ${v}`);
    }
    throw Error(
      `Invalid content: ${JSON.stringify(geometry, (k, v) =>
        !v ? `<# ${v} #>` : v
      )} ${JSON.stringify(content, (k, v) => (!v ? `<# ${v} #>` : v))}`
    );
  }
  return content;
};

const rewrite = (geometry, op, state) => {
  const walk = (geometry, state) => {
    if (geometry.content) {
      return op(
        geometry,
        (changes, newState = state) =>
          update(
            geometry,
            {
              content: validateContent(
                geometry,
                geometry.content?.map?.((entry) => walk(entry, newState))
              ),
            },
            changes
          ),
        walk,
        state
      );
    } else {
      return op(geometry, (changes) => update(geometry, changes), walk, state);
    }
  };
  return walk(geometry, state);
};

const visit = (geometry, op, state) => {
  const walk = (geometry, state) => {
    if (geometry.content) {
      if (geometry.content.some((x) => x === undefined)) {
        throw Error(`Bad geometry: ${JSON.stringify(geometry)}`);
      }
      return op(
        geometry,
        (state) =>
          geometry.content?.forEach((geometry) => walk(geometry, state)),
        state
      );
    } else {
      return op(geometry, (state) => undefined, state);
    }
  };
  return walk(geometry, state);
};

const transform$3 = (matrix, geometry) => {
  const op = (geometry, descend, walk) =>
    descend({
      matrix: geometry.matrix
        ? composeTransforms(matrix, geometry.matrix)
        : matrix,
    });
  return rewrite(geometry, op);
};

const isNotVoid = ({ tags }) => {
  return tags === undefined || tags.includes('type:void') === false;
};

const isVoid = (geometry) => !isNotVoid(geometry);

const allTags = (geometry) => {
  const collectedTags = new Set();
  const op = ({ tags }, descend) => {
    if (tags !== undefined) {
      for (const tag of tags) {
        collectedTags.add(tag);
      }
    }
    descend();
  };
  visit(geometry, op);
  return collectedTags;
};

const taggedGraph = ({ tags = [], matrix, provenance }, graph) => {
  if (graph.length > 0) {
    throw Error('Graph should not be an array');
  }
  if (graph.graph) {
    throw Error('malformed graph');
  }
  return {
    type: 'graph',
    tags,
    graph,
    matrix,
    provenance,
  };
};

const alphaShape = ({ tags }, points, componentLimit) =>
  taggedGraph(
    { tags },
    fromSurfaceMesh(fromPointsToAlphaShapeAsSurfaceMesh(points, componentLimit))
  );

const registry = new Map();

const reify = (geometry) => {
  if (!geometry) {
    console.log(`Reifying undefined geometry`);
  }
  if (geometry.type === 'plan' && geometry.content.length > 0) {
    return geometry;
  }
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph':
      case 'toolpath':
      case 'triangles':
      case 'points':
      case 'segments':
      case 'paths':
      case 'polygonsWithHoles':
        // No plan to realize.
        return geometry;
      case 'plan': {
        if (geometry.content.length === 0) {
          // This plan is not reified, generate content.
          const reifier = registry.get(geometry.plan.type);
          if (reifier === undefined) {
            throw Error(
              `Do not know how to reify plan: ${JSON.stringify(geometry.plan)}`
            );
          }
          const reified = reifier(geometry);
          // We can't share the reification since things like tags applied to the plan need to propagate separately.
          return descend({ content: [reified] });
        }
        return geometry;
      }
      case 'displayGeometry':
        // CHECK: Should this taint the results if there is a plan?
        return geometry;
      case 'item':
      case 'group':
      case 'layout':
      case 'sketch':
      case 'transform':
        return descend();
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(geometry, op);
};

const toTransformedGeometry = (geometry) => geometry;

const toConcreteGeometry = (geometry) =>
  toTransformedGeometry(reify(geometry));

const linearize = (geometry, filter, out = []) => {
  const collect = (geometry, descend) => {
    if (filter(geometry)) {
      out.push(geometry);
    }
    if (geometry.type !== 'sketch') {
      descend();
    }
  };
  visit(toConcreteGeometry(geometry), collect);
  return out;
};

const taggedGroup = ({ tags = [], matrix, provenance }, ...content) => {
  if (content.some((value) => !value)) {
    throw Error(`Undefined Group content`);
  }
  if (content.some((value) => value.length)) {
    throw Error(`Group content is an array`);
  }
  if (content.length === 1) {
    return content[0];
  }
  return { type: 'group', tags, matrix, content, provenance };
};

const filter$p = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments', 'points'].includes(geometry.type);

const disjoint = (geometries) => {
  const concreteGeometries = geometries.map((geometry) =>
    toConcreteGeometry(geometry)
  );
  const inputs = [];
  for (const concreteGeometry of concreteGeometries) {
    linearize(concreteGeometry, filter$p, inputs);
  }
  const outputs = disjoint$1(inputs);
  const disjointGeometries = [];
  const update = replacer(inputs, outputs);
  for (const concreteGeometry of concreteGeometries) {
    disjointGeometries.push(update(concreteGeometry));
  }
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...disjointGeometries);
};

const assemble = (...geometries) => disjoint(geometries);

const filter$o = (geometry) => ['graph'].includes(geometry.type);

const bend = (geometry, radius) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$o, inputs);
  const outputs = bend$1(inputs, radius);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const measureBoundingBox$2 = (geometry) => {
  if (
    geometry.cache === undefined ||
    geometry.cache.boundingBox === undefined
  ) {
    if (geometry.cache === undefined) {
      geometry.cache = {};
    }
    const { graph } = geometry;
    if (graph.isEmpty) {
      return [
        [Infinity, Infinity, Infinity],
        [-Infinity, -Infinity, -Infinity],
      ];
    }
    fromSurfaceMeshEmitBoundingBox(
      toSurfaceMesh(graph),
      geometry.matrix,
      (xMin, yMin, zMin, xMax, yMax, zMax) => {
        geometry.cache.boundingBox = [
          [xMin, yMin, zMin],
          [xMax, yMax, zMax],
        ];
      }
    );
  }
  return geometry.cache.boundingBox;
};

const prepareForSerialization$1 = (geometry) => {
  const { graph } = geometry;
  if (!graph.isEmpty && !graph.serializedSurfaceMesh) {
    measureBoundingBox$2(geometry);
    graph.serializedSurfaceMesh = serializeSurfaceMesh(toSurfaceMesh(graph));
    graph.hash = computeHash(graph);
  }
  return geometry;
};

const doNothing = (geometry) => geometry;

const op =
  (
    {
      graph = doNothing,
      layout = doNothing,
      paths = doNothing,
      points = doNothing,
      polygonsWithHoles = doNothing,
      segments = doNothing,
      toolpath = doNothing,
      triangles = doNothing,
    },
    method = rewrite,
    accumulate = (x) => x
  ) =>
  (geometry, ...args) => {
    const walk = (geometry, descend) => {
      switch (geometry.type) {
        case 'graph':
          return accumulate(graph(geometry, ...args));
        case 'paths':
          return accumulate(paths(geometry, ...args));
        case 'points':
          return accumulate(points(geometry, ...args));
        case 'polygonsWithHoles':
          return accumulate(polygonsWithHoles(geometry, ...args));
        case 'segments':
          return accumulate(segments(geometry, ...args));
        case 'toolpath':
          return accumulate(toolpath(geometry, ...args));
        case 'triangles':
          return accumulate(triangles(geometry, ...args));
        case 'plan':
          reify(geometry);
        // fall through
        case 'layout':
        // return accumulate(layout(geometry, ...args));
        // fall through
        case 'item':
        case 'group': {
          return descend();
        }
        case 'sketch': {
          // Sketches aren't real for op.
          return geometry;
        }
        default:
          throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
      }
    };

    return method(toConcreteGeometry(geometry), walk);
  };

const prepareForSerialization = (geometry) => {
  op({ graph: prepareForSerialization$1 }, visit)(geometry);
  return geometry;
};

const hash = (geometry) => {
  if (geometry.hash === undefined) {
    if (geometry.content) {
      for (const content of geometry.content) {
        hash(content);
      }
    }
    prepareForSerialization(geometry);
    geometry.hash = computeHash(geometry);
  }
  return geometry.hash;
};

const isStored = Symbol('isStored');

const store = async (geometry) => {
  if (geometry === undefined) {
    throw Error('Attempted to store undefined geometry');
  }
  const uuid = hash(geometry);
  if (geometry[isStored]) {
    return { type: 'link', hash: uuid };
  }
  const stored = { ...geometry, content: geometry.content?.slice() };
  geometry[isStored] = true;
  // Share graphs across geometries.
  const graph = geometry.graph;
  if (graph && !graph[isStored]) {
    await write$1(`graph/${graph.hash}`, graph);
    stored.graph = {
      hash: graph.hash,
      isClosed: graph.isClosed,
      isEmpty: graph.isEmpty,
      provenance: graph.provenance,
    };
  }
  if (geometry.content) {
    for (let nth = 0; nth < geometry.content.length; nth++) {
      if (!geometry.content[nth]) {
        throw Error('Store has empty content/1');
      }
      stored.content[nth] = await store(geometry.content[nth]);
      if (!stored.content[nth]) {
        throw Error('Store has empty content/2');
      }
    }
  }
  await write$1(`hash/${uuid}`, stored);
  return { type: 'link', hash: uuid };
};

const isLoaded = Symbol('isLoaded');

const load = async (geometry) => {
  if (geometry === undefined || geometry[isLoaded]) {
    return geometry;
  }
  if (!geometry.hash) {
    throw Error(`No hash`);
  }
  geometry = await read$1(`hash/${geometry.hash}`);
  if (!geometry) {
    return;
  }
  if (geometry[isLoaded]) {
    return geometry;
  }
  geometry[isLoaded] = true;
  geometry[isStored] = true;
  // Link to any associated graph structure.
  if (geometry.graph && geometry.graph.hash) {
    geometry.graph = await read$1(`graph/${geometry.graph.hash}`);
  }
  if (geometry.content) {
    for (let nth = 0; nth < geometry.content.length; nth++) {
      if (!geometry.content[nth]) {
        throw Error('Load has empty content/1');
      }
      geometry.content[nth] = await load(geometry.content[nth]);
      if (!geometry.content[nth]) {
        throw Error('Load has empty content/2');
      }
    }
  }
  return geometry;
};

const loadNonblocking = (geometry) => {
  if (geometry === undefined || geometry[isLoaded]) {
    return geometry;
  }
  if (!geometry.hash) {
    return;
  }
  geometry = readNonblocking$1(`hash/${geometry.hash}`);
  if (!geometry) {
    return;
  }
  if (geometry[isLoaded]) {
    return geometry;
  }
  geometry[isLoaded] = true;
  geometry[isStored] = true;
  // Link to any associated graph structure.
  if (geometry.graph && geometry.graph.hash) {
    geometry.graph = readNonblocking$1(`graph/${geometry.graph.hash}`);
  }
  if (geometry.content) {
    for (let nth = 0; nth < geometry.content.length; nth++) {
      if (!geometry.content[nth]) {
        throw Error('Load has empty content/3');
      }
      geometry.content[nth] = loadNonblocking(geometry.content[nth]);
      if (!geometry.content[nth]) {
        throw Error('Load has empty content/4');
      }
    }
  }
  return geometry;
};

const read = async (path, options) => {
  const readData = await read$1(path, options);
  if (!readData) {
    return;
  }
  return load(readData);
};

const readNonblocking = (path, options) => {
  const readData = readNonblocking$1(path, options);
  if (!readData) {
    return;
  }
  try {
    return loadNonblocking(readData);
  } catch (error) {
    if (error instanceof ErrorWouldBlock) {
      if (options && options.errorOnMissing === false) {
        return;
      }
    }
    throw error;
  }
};

const write = async (path, geometry, options) => {
  // Ensure that the geometry carries a hash before saving.
  hash(geometry);
  const stored = await store(geometry);
  await write$1(path, stored, options);
  return geometry;
};

// Generally addPending(write(...)) seems a better option.
const writeNonblocking = (path, geometry, options) => {
  addPending(write(path, geometry, options));
  return geometry;
};

const cached =
  (computeKey, op) =>
  (...args) => {
    let key;
    try {
      key = computeKey(...args);
    } catch (error) {
      console.log(JSON.stringify([...args]));
      throw error;
    }
    const hash = computeHash(key);
    const path = `op/${hash}`;
    const data = readNonblocking(path, { errorOnMissing: false });
    if (data !== undefined) {
      return data;
    }
    const result = op(...args);
    addPending(write(path, result));
    return result;
  };

const rewriteType = (op) => (geometry) =>
  rewrite(geometry, (geometry, descend) => descend(op(geometry)));

const addType = (type) => (geometry) => {
  if (geometry.tags.includes(type)) {
    return undefined;
  } else {
    return { tags: [...geometry.tags, type] };
  }
};

const removeType = (type) => (geometry) => {
  if (geometry.tags.includes(type)) {
    return { tags: geometry.tags.filter((tag) => tag !== type) };
  } else {
    return undefined;
  }
};

const hasNotType = (type) => rewriteType(removeType(type));
const hasType = (type) => rewriteType(addType(type));
const isNotType =
  (type) =>
  ({ tags }) =>
    !tags.includes(type);
const isType =
  (type) =>
  ({ tags }) =>
    tags.includes(type);

const typeMasked = 'type:masked';
const hasNotTypeMasked = hasNotType(typeMasked);
const hasTypeMasked = hasType(typeMasked);
const isNotTypeMasked = isNotType(typeMasked);
const isTypeMasked = isType(typeMasked);

const typeVoid = 'type:void';
const hasNotTypeVoid = hasNotType(typeVoid);
const hasTypeVoid = hasType(typeVoid);
const isNotTypeVoid = isNotType(typeVoid);
const isTypeVoid = isType(typeVoid);

const typeWire = 'type:wire';
const hasNotTypeWire = hasNotType(typeWire);
const hasTypeWire = hasType(typeWire);
const isNotTypeWire = isNotType(typeWire);
const isTypeWire = isType(typeWire);

const filter$n = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const cast = (geometry, reference) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$n, inputs);
  const outputs = cast$1(inputs, reference);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const filter$m = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments'].includes(geometry.type);

const clip = (geometry, geometries, open) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$m, inputs);
  const count = inputs.length;
  for (const geometry of geometries) {
    linearize(geometry, filter$m, inputs);
  }
  const outputs = clip$1(inputs, count, open);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs, count)(concreteGeometry);
};

const isClosed = (path) => path.length === 0 || path[0] !== null;
const isOpen = (path) => !isClosed(path);

const close = (path) => (isClosed(path) ? path : path.slice(1));

const filter$l = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const computeCentroid = (geometry, top, bottom) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$l, inputs);
  const outputs = computeCentroid$1(inputs, top, bottom);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const filter$k = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const computeNormal = (geometry, top, bottom) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$k, inputs);
  const outputs = computeNormal$1(inputs, top, bottom);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

function sortKD(ids, coords, nodeSize, left, right, depth) {
    if (right - left <= nodeSize) return;

    const m = (left + right) >> 1;

    select(ids, coords, m, left, right, depth % 2);

    sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
    sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
}

function select(ids, coords, k, left, right, inc) {

    while (right > left) {
        if (right - left > 600) {
            const n = right - left + 1;
            const m = k - left + 1;
            const z = Math.log(n);
            const s = 0.5 * Math.exp(2 * z / 3);
            const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            select(ids, coords, k, newLeft, newRight, inc);
        }

        const t = coords[2 * k + inc];
        let i = left;
        let j = right;

        swapItem(ids, coords, left, k);
        if (coords[2 * right + inc] > t) swapItem(ids, coords, left, right);

        while (i < j) {
            swapItem(ids, coords, i, j);
            i++;
            j--;
            while (coords[2 * i + inc] < t) i++;
            while (coords[2 * j + inc] > t) j--;
        }

        if (coords[2 * left + inc] === t) swapItem(ids, coords, left, j);
        else {
            j++;
            swapItem(ids, coords, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swapItem(ids, coords, i, j) {
    swap(ids, i, j);
    swap(coords, 2 * i, 2 * j);
    swap(coords, 2 * i + 1, 2 * j + 1);
}

function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
    const stack = [0, ids.length - 1, 0];
    const result = [];
    let x, y;

    while (stack.length) {
        const axis = stack.pop();
        const right = stack.pop();
        const left = stack.pop();

        if (right - left <= nodeSize) {
            for (let i = left; i <= right; i++) {
                x = coords[2 * i];
                y = coords[2 * i + 1];
                if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[i]);
            }
            continue;
        }

        const m = Math.floor((left + right) / 2);

        x = coords[2 * m];
        y = coords[2 * m + 1];

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[m]);

        const nextAxis = (axis + 1) % 2;

        if (axis === 0 ? minX <= x : minY <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? maxX >= x : maxY >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }

    return result;
}

function within(ids, coords, qx, qy, r, nodeSize) {
    const stack = [0, ids.length - 1, 0];
    const result = [];
    const r2 = r * r;

    while (stack.length) {
        const axis = stack.pop();
        const right = stack.pop();
        const left = stack.pop();

        if (right - left <= nodeSize) {
            for (let i = left; i <= right; i++) {
                if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) result.push(ids[i]);
            }
            continue;
        }

        const m = Math.floor((left + right) / 2);

        const x = coords[2 * m];
        const y = coords[2 * m + 1];

        if (sqDist(x, y, qx, qy) <= r2) result.push(ids[m]);

        const nextAxis = (axis + 1) % 2;

        if (axis === 0 ? qx - r <= x : qy - r <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? qx + r >= x : qy + r >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }

    return result;
}

function sqDist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}

const defaultGetX = p => p[0];
const defaultGetY = p => p[1];

class KDBush {
    constructor(points, getX = defaultGetX, getY = defaultGetY, nodeSize = 64, ArrayType = Float64Array) {
        this.nodeSize = nodeSize;
        this.points = points;

        const IndexArrayType = points.length < 65536 ? Uint16Array : Uint32Array;

        const ids = this.ids = new IndexArrayType(points.length);
        const coords = this.coords = new ArrayType(points.length * 2);

        for (let i = 0; i < points.length; i++) {
            ids[i] = i;
            coords[2 * i] = getX(points[i]);
            coords[2 * i + 1] = getY(points[i]);
        }

        sortKD(ids, coords, nodeSize, 0, ids.length - 1, 0);
    }

    range(minX, minY, maxX, maxY) {
        return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
    }

    within(x, y, r) {
        return within(this.ids, this.coords, x, y, r, this.nodeSize);
    }
}

const filter$j = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const outline = (geometry) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$j, inputs);
  const outputs = outline$1(inputs);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const transform$2 = ([x = 0, y = 0, z = 0], matrix) => {
  if (!matrix) {
    return [x, y, z];
  }
  let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] || 1.0;
  return [
    (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
    (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w,
  ];
};

const transformCoordinate = (coordinate, matrix) =>
  transform$2(coordinate, matrix);

const transformingCoordinates =
  (matrix, op) =>
  (coordinate, ...args) =>
    op(transformCoordinate(coordinate, matrix), ...args);

const filter$i = ({ type }) => type === 'segments';

const eachSegment = (geometry, emit) => {
  for (const { matrix, segments } of linearize(outline(geometry), filter$i)) {
    for (const [source, target] of segments) {
      emit([
        transformCoordinate(source, matrix),
        transformCoordinate(target, matrix),
      ]);
    }
  }
};

const filter$h = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const fuse = (geometry) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$h, inputs);
  const outputs = fuse$1(inputs);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const eachNonVoidItem = (geometry, op) => {
  const walk = (geometry, descend) => {
    // FIX: Sketches aren't real either -- but this is a bit unclear.
    if (geometry.type !== 'sketch' && isNotVoid(geometry)) {
      op(geometry);
      descend();
    }
  };
  visit(geometry, walk);
};

const getNonVoidSegments = (geometry) => {
  const segmentsets = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'segments') {
      segmentsets.push(item);
    }
  });
  return segmentsets;
};

const filter$g = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const inset = (geometry, ...args) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$g, inputs);
  const outputs = inset$1(inputs, ...args);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const eachPoint$2 = (thunk, paths) => {
  for (const path of paths) {
    for (const point of path) {
      if (point !== null) {
        thunk(point);
      }
    }
  }
};

const eachPoint$1 = (geometry, emit) =>
  eachPointOfSurfaceMesh(toSurfaceMesh(geometry.graph), geometry.matrix, emit);

const paths$1 = (geometry, emit) => eachPoint$2(emit, geometry.paths);

const points$1 = (geometry, emit) => {
  const { points, matrix } = geometry;
  for (const point of points) {
    emit(transform$4(matrix, point));
  }
};

const polygonsWithHoles = (geometry, emit) => {
  const { polygonsWithHoles, matrix } = geometry;
  for (const { points, holes } of polygonsWithHoles) {
    for (const point of points) {
      emit(transform$4(matrix, point));
    }
    for (const { points } of holes) {
      for (const point of points) {
        emit(transform$4(matrix, point));
      }
    }
  }
};

const segments$1 = ({ segments, matrix }, emit) => {
  for (const [start, end] of segments) {
    emit(transform$4(matrix, start));
    emit(transform$4(matrix, end));
  }
};

const eachPoint = op(
  { graph: eachPoint$1, paths: paths$1, points: points$1, polygonsWithHoles, segments: segments$1 },
  visit
);

const measureBoundingBox$1 = (polygons, matrix = identityMatrix) => {
  if (polygons.measureBoundingBox === undefined) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const path of polygons) {
      for (const rawPoint of path) {
        const point = transform$4(matrix, rawPoint);
        if (point[0] < min[0]) min[0] = point[0];
        if (point[1] < min[1]) min[1] = point[1];
        if (point[2] < min[2]) min[2] = point[2];
        if (point[0] > max[0]) max[0] = point[0];
        if (point[1] > max[1]) max[1] = point[1];
        if (point[2] > max[2]) max[2] = point[2];
      }
    }
    polygons.measureBoundingBox = [min, max];
  }
  return polygons.measureBoundingBox;
};

const measureBoundingBoxGeneric = (geometry) => {
  let minPoint = [Infinity, Infinity, Infinity];
  let maxPoint = [-Infinity, -Infinity, -Infinity];
  eachPoint(geometry, (point) => {
    minPoint = min(minPoint, point);
    maxPoint = max(maxPoint, point);
  });
  return [minPoint, maxPoint];
};

const measureBoundingBox = (geometry) => {
  let minPoint = [Infinity, Infinity, Infinity];
  let maxPoint = [-Infinity, -Infinity, -Infinity];

  const update = ([itemMinPoint, itemMaxPoint]) => {
    minPoint = min(minPoint, itemMinPoint);
    maxPoint = max(maxPoint, itemMaxPoint);
  };

  const op = (geometry, descend) => {
    if (isVoid(geometry)) {
      return;
    }
    switch (geometry.type) {
      case 'sketch':
      case 'toolpath':
        // Don't consider these as part of the geometry size.
        return;
      case 'plan':
      case 'group':
      case 'item':
      case 'displayGeometry':
        return descend();
      case 'graph':
        return update(measureBoundingBox$2(geometry));
      case 'layout': {
        const { size = [] } = geometry.layout;
        const [width, height] = size;
        return update([
          [width / -2, height / -2, 0],
          [width / 2, height / 2, 0],
        ]);
      }
      case 'points':
      case 'polygonsWithHoles':
      case 'segments':
      case 'paths':
        return update(measureBoundingBoxGeneric(geometry));
      case 'triangles':
        return update(
          measureBoundingBox$1(geometry.triangles, geometry.matrix)
        );
      default:
        throw Error(`Unknown geometry: ${geometry.type}`);
    }
  };

  visit(toConcreteGeometry(geometry), op);

  if (minPoint[0] === Infinity) {
    return [
      [0, 0, 0],
      [0, 0, 0],
    ];
  }

  return [minPoint, maxPoint];
};

const filterInputs = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments', 'points'].includes(geometry.type);

const filterReferences = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments', 'points', 'empty'].includes(
    geometry.type
  );

const section = (inputGeometry, referenceGeometries) => {
  const concreteGeometry = toConcreteGeometry(inputGeometry);
  const inputs = [];
  linearize(concreteGeometry, filterInputs, inputs);
  const count = inputs.length;
  for (const referenceGeometry of referenceGeometries) {
    linearize(referenceGeometry, filterReferences, inputs);
  }
  const outputs = section$1(inputs, count);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const taggedToolpath = ({ tags = [], provenance }, toolpath) => {
  return { type: 'toolpath', tags, toolpath };
};

const X$2 = 0;
const Y$2 = 1;

const computeToolpath = (
  geometry,
  {
    toolDiameter = 1,
    jumpHeight = 1,
    stepCost = toolDiameter * -2,
    turnCost = -2,
    neighborCost = -2,
    stopCost = 30,
    candidateLimit = 1,
    subCandidateLimit = 1,
  }
) => {
  const startTime = new Date();
  let lastTime = startTime;
  const time = (msg) => {
    const now = new Date();
    console.log(
      `${msg}: ${((now - startTime) / 1000).toFixed(2)} ${(
        (now - lastTime) /
        1000
      ).toFixed(2)}`
    );
    lastTime = now;
  };
  const toolRadius = toolDiameter / 2;

  {
    let points = [];

    const concreteGeometry = toConcreteGeometry(geometry);
    const sections = section(concreteGeometry, [
      { type: 'points', matrix: identityMatrix },
    ]);
    console.log(`QQ/sections: ${JSON.stringify(sections)}`);
    const fusedArea = fuse(sections);
    console.log(`QQ/fusedArea: ${JSON.stringify(fusedArea)}`);
    const insetArea = inset(fusedArea, toolRadius);
    console.log(`QQ/insetArea: ${JSON.stringify(insetArea)}`);

    // Surfaces
    withAabbTreeQuery(
      linearize(insetArea, ({ type }) =>
        ['graph', 'polygonsWithHoles'].includes(type)
      ),
      (query) => {
        console.log(`QQ/withAabbTreeQuery`);
        // The hexagon diameter is the tool radius.
        const isInteriorPoint = (x, y, z) => {
          return query.isIntersectingPointApproximate(x, y, z);
        };
        const [minPoint, maxPoint] = measureBoundingBox(sections);
        const z = 0;
        const sqrt3 = Math.sqrt(3);
        const width = maxPoint[X$2] - minPoint[X$2];
        const offsetX = (maxPoint[X$2] + minPoint[X$2]) / 2 - width / 2;
        const height = maxPoint[Y$2] - minPoint[Y$2];
        const offsetY = (maxPoint[Y$2] + minPoint[Y$2]) / 2 - height / 2;
        const columns = width / (sqrt3 * 0.5 * toolRadius) + 1;
        const rows = height / (toolRadius * 0.75);
        const index = [];
        for (let i = 0; i < columns; i++) {
          index[i] = [];
        }
        const link = (point, neighbor) => {
          if (neighbor) {
            point.fillNeighbors.push(neighbor);
            neighbor.fillNeighbors.push(point);
          }
        };
        for (let i = 0; i < columns; i++) {
          for (let j = 0; j < rows; j++) {
            // const x = offsetX + (i + (j % 2 ? 0.5 : 0)) * sqrt3 * toolRadius;
            // const y = offsetY + j * toolRadius * 0.75;
            const x = offsetX + (i + (j % 2) * 0.5) * toolRadius * sqrt3 * 0.5;
            const y = offsetY + j * toolRadius * 0.75;
            // FIX: We need to produce an affinity with each distinct contiguous area.
            if (isInteriorPoint(x, y, z)) {
              const point = {
                start: [x, y, z],
                isFill: true,
                fillNeighbors: [],
              };
              index[i][j] = point;
              points.push(point);
            }
          }
        }
        for (let i = 0; i < columns; i++) {
          for (let j = 0; j < rows; j++) {
            const point = index[i][j];
            if (!point) {
              continue;
            }
            link(point, index[i - 1][j]);
            link(point, index[i][j - 1]);
            if (j % 2) {
              link(point, index[i + 1][j - 1]);
            } else {
              link(point, index[i - 1][j - 1]);
            }
          }
        }
      }
    );
    time('QQ/computeToolpath/Surfaces');

    // Profiles
    eachSegment(insetArea, ([start, end]) => {
      points.push({ start: start, end: { end: end, type: 'required' } });
      points.push({ start: end, note: 'segment end' });
    });
    time('QQ/computeToolpath/Profiles');

    // Grooves
    // FIX: These should be sectioned segments.
    for (const { matrix, segments } of getNonVoidSegments(concreteGeometry)) {
      for (const [localStart, localEnd] of segments) {
        const start = transformCoordinate(localStart, matrix);
        const end = transformCoordinate(localEnd, matrix);
        points.push({ start, end: { end, type: 'required' } });
        points.push({ start: end, note: 'groove end' });
      }
    }
    time('QQ/computeToolpath/Grooves');

    const compareCoord = (a, b) => {
      const dX = a[X$2] - b[X$2];
      if (dX !== 0) {
        return dX;
      }
      return a[Y$2] - b[Y$2];
    };

    const compareStart = (a, b) => compareCoord(a.start, b.start);

    // Fold the individual points and edges together.
    {
      points.sort(compareStart);
      const consolidated = [];
      let last;
      for (const point of points) {
        if (last === undefined || !equals(last.start, point.start)) {
          last = point;
          if (last.end) {
            last.ends = [last.end];
            delete last.end;
          }
          consolidated.push(point);
          continue;
        } else {
          if (point.isFill) {
            last.isFill = true;
          }
        }
        if (point.end) {
          if (!last.ends) {
            last.ends = [];
          }
          last.ends.push(point.end);
          delete point.end;
        }
        if (point.fillNeighbors) {
          if (!last.fillNeighbors) {
            last.fillNeighbors = [];
          }
          last.fillNeighbors.push(...point.fillNeighbors);
        }
      }
      points = consolidated;
      for (const point of points) {
        if (
          !point.ends &&
          !point.fillNeighbors &&
          point.note !== 'groove end'
        ) {
          throw Error(`Lonely consolidated point: ${JSON.stringify(point)}`);
        }
      }
    }
    time('QQ/computeToolpath/Fold');

    const pointByHash = new Map();

    // Set up an index from start to point, and have the ends share identity with the starts.
    for (const point of points) {
      pointByHash.set(computeHash(point.start), point);
    }

    // Now that we have, e.g.
    // [{ start: [x, y, z], isFill: true, ends: [{ end: [x, y, z], type }] }]
    // we can use a spatial structure to query nearby points.

    const kd = new KDBush(
      points,
      (p) => p.start[X$2],
      (p) => p.start[Y$2]
    );
    time('QQ/computeToolpath/Index');

    const jump = (
      toolpath,
      [fromX = 0, fromY = 0, fromZ = 0],
      [toX = 0, toY = 0, toZ = 0]
    ) =>
      toolpath.push({
        op: 'jump',
        from: [fromX, fromY, fromZ],
        to: [toX, toY, toZ],
      });

    const cut = (
      toolpath,
      [fromX = 0, fromY = 0, fromZ = 0],
      [toX = 0, toY = 0, toZ = 0]
    ) =>
      toolpath.push({
        op: 'cut',
        from: [fromX, fromY, fromZ],
        to: [toX, toY, toZ],
      });

    const considerTargetPoint = (candidates, fulfilled, candidate, target) => {
      if (fulfilled.has(computeHash(target.start))) {
        // This target is already fulfilled.
        return;
      }

      if (!target.ends && !target.fillNeighbors) {
        // This target was already fulfilled, make a note of it.
        fulfilled.add(computeHash(target.start));
        return;
      }

      let cost = candidate.cost;
      if (target.fillNeighbors) {
        for (const neighbor of target.fillNeighbors) {
          if (fulfilled.has(computeHash(neighbor.start))) {
            cost += neighborCost;
          }
        }
      }

      if (candidate.last) {
        const lastDirection = subtract(
          candidate.at.start,
          candidate.last.at.start
        );
        const nextDirection = subtract(target.start, candidate.at.start);
        const dot$1 = dot(lastDirection, nextDirection);
        cost += dot$1 * turnCost;
      }

      const distance$1 = distance(candidate.at.start, target.start);
      if ((candidate.at.isFill || target.isFill) && distance$1 < toolDiameter) {
        // Reaching a fill point fulfills it, but reaching a profile or groove point won't.
        const fulfills = [];
        if (target.isFill) {
          fulfills.push(computeHash(target.start));
        }
        if (candidate.isFill) {
          fulfills.push(computeHash(candidate.at.start));
        }
        cost += stepCost / distance$1;
        const length = candidate.length + 1;
        // Cutting from a fill point also fulfills it.
        const last = candidate;
        const next = { last, toolpath: [], at: target, cost, length, fulfills };
        cut(next.toolpath, candidate.at.start, target.start); // safe cut across fill.
        candidates.push(next);
        return;
      }

      // This is an unsafe cut -- jump.
      // FIX: This is not a very sensible penalty.
      // cost += distance + stepCost + stopCost * 3;
      cost = stepCost / (distance$1 * 2);
      const length = candidate.length + 1;
      const last = candidate;
      const fulfills = [];
      if (target.isFill) {
        fulfills.push(computeHash(target.start));
      }
      const next = { last, toolpath: [], at: target, cost, length, fulfills };
      jump(next.toolpath, candidate.at.start, [
        candidate.at.start[X$2],
        candidate.at.start[Y$2],
        jumpHeight,
      ]);
      jump(
        next.toolpath,
        [candidate.at.start[X$2], candidate.at.start[Y$2], jumpHeight],
        [target.start[X$2], target.start[Y$2], jumpHeight]
      );
      cut(
        next.toolpath,
        [target.start[X$2], target.start[Y$2], jumpHeight],
        target.start
      );
      candidates.push(next);
    };

    const considerTargetEdge = (
      candidates,
      fulfilled,
      candidate,
      target,
      edge
    ) => {
      if (
        fulfilled.has(
          computeHash({ start: candidate.at.start, end: target.start })
        )
      ) {
        // This edge is already fulfilled.
        return;
      }

      let cost = candidate.cost;
      if (target.fillNeighbors) {
        for (const neighbor of target.fillNeighbors) {
          if (fulfilled.has(computeHash(neighbor.start))) {
            cost += neighborCost;
          }
        }
      }

      if (candidate.last) {
        const lastDirection = subtract(
          candidate.at.start,
          candidate.last.at.start
        );
        const nextDirection = subtract(target.start, candidate.at.start);
        const dot$1 = dot(lastDirection, nextDirection);
        cost += dot$1 * turnCost;
      }

      const distance$1 = distance(candidate.at.start, target.start);
      const fulfills = [];
      let isFulfilled = true;
      for (const end of candidate.at.ends) {
        const fulfilledEdge = computeHash({
          start: candidate.at.start,
          end: end.end,
        });
        if (equals(target.start, end.end)) {
          cost += stepCost / distance$1;
          const length = candidate.length + 1;
          fulfills.push(fulfilledEdge);
          const last = candidate;
          const next = {
            last,
            toolpath: [],
            at: target,
            cost,
            length,
            fulfills,
          };
          cut(next.toolpath, candidate.at.start, target.start); // safe cut across known edge.
          candidates.push(next);
        } else {
          if (!fulfilled.has(fulfilledEdge)) {
            isFulfilled = false;
          }
        }
      }
      if (isFulfilled) {
        // All of the candidate edges are now fulfilled, so mark the point as fulfilled.
        fulfills.push(computeHash(candidate.at.start));
      }
    };

    let candidate = {
      at: { start: [0, 0, 0], ends: [] },
      toolpath: [],
      cost: 0,
      length: 0,
    };
    const fulfilled = new Set();
    for (;;) {
      if (candidate.length % 1000 === 0) {
        time(`QQ/computeToolpath/Candidate/${candidate.length}`);
      }
      const nextCandidates = [];
      try {
        if (nextCandidates.length < subCandidateLimit && candidate.at.ends) {
          for (const end of candidate.at.ends) {
            const foundPoint = pointByHash.get(computeHash(end.end));
            if (!foundPoint) {
              throw Error(`Cannot find end point ${JSON.stringify(end.end)}`);
            }
            // This is a bit silly -- why aren't we communicating the edge more directly?
            considerTargetEdge(
              nextCandidates,
              fulfilled,
              candidate,
              foundPoint,
              end
            );
          }
        }
        if (
          nextCandidates.length < subCandidateLimit &&
          candidate.at.fillNeighbors
        ) {
          for (const point of candidate.at.fillNeighbors) {
            considerTargetPoint(nextCandidates, fulfilled, candidate, point);
          }
        }
        if (nextCandidates.length < subCandidateLimit) {
          // From this point they're really jumps.
          const [x, y] = candidate.at.start;
          for (let range = 2; range < Infinity; range *= 2) {
            const destinations = kd.within(x, y, range);
            for (const destination of destinations) {
              const point = points[destination];
              if (point === candidate.at) {
                continue;
              }
              considerTargetPoint(nextCandidates, fulfilled, candidate, point);
            }
            if (
              nextCandidates.length >= subCandidateLimit ||
              destinations.length >= points.length
            ) {
              break;
            }
          }
        }
      } catch (error) {
        console.log(error.stack);
        throw error;
      }
      if (nextCandidates.length === 0) {
        time('QQ/computeToolpath/Candidate/completed');
        // We have computed a total toolpath.
        // Note that we include the imaginary seed point.
        const history = [];
        for (let node = candidate; node; node = node.last) {
          history.push(node.toolpath);
        }
        const toolpath = [];
        while (history.length > 0) {
          toolpath.push(...history.pop());
        }
        return taggedToolpath({}, toolpath);
      }
      nextCandidates.sort((a, b) => a.cost - b.cost);
      candidate = nextCandidates[0];
      if (candidate.fulfills) {
        for (const hash of candidate.fulfills) {
          fulfilled.add(hash);
        }
      }
    }
  }
};

const concatenate = (...paths) => {
  const result = [null, ...[].concat(...paths.map(close))];
  return result;
};

const canonicalizePoint = (point, index) => {
  if (point === null) {
    if (index !== 0) throw Error('Path has null not at head');
    return point;
  } else {
    return canonicalize$5(point);
  }
};

const canonicalize$4 = (path) => path.map(canonicalizePoint);

const canonicalize$3 = (paths) => {
  let canonicalized = paths.map(canonicalize$4);
  if (paths.properties !== undefined) {
    // Transfer properties.
    canonicalized.properties = paths.properties;
  }
  return canonicalized;
};

const canonicalize$2 = (points) => points.map(canonicalize$5);

const isDegenerate = (polygon) => {
  for (let nth = 0; nth < polygon.length; nth++) {
    if (equals(polygon[nth], polygon[(nth + 1) % polygon.length])) {
      return true;
    }
  }
  return false;
};

const canonicalize$1 = (polygons) => {
  const canonicalized = [];
  for (let polygon of polygons) {
    polygon = canonicalize$6(polygon);
    if (!isDegenerate(polygon)) {
      canonicalized.push(polygon);
    }
  }
  return canonicalized;
};

const canonicalize = (geometry) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'points':
        return descend({ points: canonicalize$2(geometry.points) });
      case 'segments':
        return geometry;
      case 'paths':
        return descend({ paths: canonicalize$3(geometry.paths) });
      case 'triangles':
        return descend({ triangles: canonicalize$1(geometry.triangles) });
      case 'plan':
        return descend({
          marks: canonicalize$2(geometry.marks),
          planes: geometry.planes.map(canonicalize$7),
        });
      case 'graph':
        return prepareForSerialization(geometry);
      case 'item':
      case 'group':
      case 'layout':
      case 'sketch':
        return descend();
      default:
        throw Error(`Unexpected geometry type ${geometry.type}`);
    }
  };
  return rewrite(toTransformedGeometry(geometry), op);
};

const filter$f = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments', 'points'].includes(geometry.type);

const convexHull = (geometries) => {
  const inputs = [];
  for (const geometry of geometries) {
    linearize(toConcreteGeometry(geometry), filter$f, inputs);
  }
  const outputs = convexHull$1(inputs);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const filterTargets = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments'].includes(geometry.type);
const filterRemoves = (geometry) =>
  filterTargets(geometry) && isNotTypeMasked(geometry);

const cut = (geometry, geometries, open = false) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filterTargets, inputs);
  const count = inputs.length;
  for (const geometry of geometries) {
    linearize(geometry, filterRemoves, inputs);
  }
  const outputs = cut$1(inputs, count, open);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs, count)(concreteGeometry);
};

const deduplicate = (path) => {
  const unique = [];
  let last = path[path.length - 1];
  for (const point of path) {
    if (last === null || point === null || !equals(point, last)) {
      unique.push(point);
    }
    last = point;
  }
  return unique;
};

const filterShape = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const filterSelection = (geometry) =>
  ['graph'].includes(geometry.type) && isNotTypeVoid(geometry);

const filterDeformation = (geometry) =>
  ['graph', 'polygonsWithHoles', 'points', 'segments'].includes(
    geometry.type
  ) && isNotTypeVoid(geometry);

const deform = (geometry, entries, iterations, tolerance, alpha) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filterShape, inputs);
  const length = inputs.length;
  let end = length;
  for (const { selection, deformation } of entries) {
    // This is fragile, since we assume there are strict pairs of selections and
    // deformations.
    linearize(toConcreteGeometry(selection), filterSelection, inputs);
    if (inputs.length !== end + 1) {
      throw Error(`Too many selections`);
    }
    end += 1;
    linearize(toConcreteGeometry(deformation), filterDeformation, inputs);
    if (inputs.length !== end + 1) {
      throw Error(`Too many deformations`);
    }
    end += 1;
  }
  const outputs = deform$1(inputs, length, iterations, tolerance, alpha);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs, length)(concreteGeometry);
};

const demesh$1 = (geometry, options) =>
  taggedGraph(
    { tags: geometry.tags, matrix: geometry.matrix },
    fromSurfaceMesh(
      demeshSurfaceMesh(toSurfaceMesh(geometry.graph), geometry.matrix, options)
    )
  );

const demesh = op({ graph: demesh$1 });

const difference = (geometry, options = {}, ...geometries) =>
  cut(geometry, geometries);

const iota = 1e-5;
const X$1 = 0;
const Y$1 = 1;
const Z = 2;

// Requires a conservative gap.
const doesNotOverlap = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return true;
  }
  const [minA, maxA] = measureBoundingBox(a);
  const [minB, maxB] = measureBoundingBox(b);
  if (maxA[X$1] <= minB[X$1] - iota * 10) {
    return true;
  }
  if (maxA[Y$1] <= minB[Y$1] - iota * 10) {
    return true;
  }
  if (maxA[Z] <= minB[Z] - iota * 10) {
    return true;
  }
  if (maxB[X$1] <= minA[X$1] - iota * 10) {
    return true;
  }
  if (maxB[Y$1] <= minA[Y$1] - iota * 10) {
    return true;
  }
  if (maxB[Z] <= minA[Z] - iota * 10) {
    return true;
  }
  return false;
};

const hasMatchingTag = (set, tags, whenSetUndefined = false) => {
  if (set === undefined) {
    return whenSetUndefined;
  } else if (tags !== undefined && tags.some((tag) => set.includes(tag))) {
    return true;
  } else {
    return false;
  }
};

const buildCondition = (conditionTags, conditionSpec) => {
  switch (conditionSpec) {
    case 'has':
      return (geometryTags) => hasMatchingTag(geometryTags, conditionTags);
    case 'has not':
      return (geometryTags) => !hasMatchingTag(geometryTags, conditionTags);
    default:
      return undefined;
  }
};

const rewriteTags = (
  add,
  remove,
  geometry,
  conditionTags,
  conditionSpec
) => {
  const condition = buildCondition(conditionTags, conditionSpec);
  const composeTags = (geometryTags) => {
    if (condition === undefined || condition(geometryTags)) {
      if (geometryTags === undefined) {
        return add.filter((tag) => !remove.includes(tag));
      } else {
        return [...add, ...geometryTags].filter((tag) => !remove.includes(tag));
      }
    } else {
      return geometryTags;
    }
  };
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'group':
        return descend();
      default:
        const composedTags = composeTags(geometry.tags);
        if (composedTags === undefined) {
          const copy = { ...geometry };
          delete copy.tags;
          return copy;
        }
        if (composedTags === geometry.tags) {
          return geometry;
        } else {
          return descend({ tags: composedTags });
        }
    }
  };
  return rewrite(geometry, op);
};

// Dropped elements displace as usual, but are not included in positive output.

const drop = (tags, geometry) =>
  rewriteTags(['type:void'], [], geometry, tags, 'has');

const eachItem = (geometry, op) => {
  const walk = (geometry, descend) => {
    switch (geometry.type) {
      case 'sketch': {
        // Sketches aren't real.
        return;
      }
      default: {
        op(geometry);
        return descend();
      }
    }
  };
  visit(geometry, walk);
};

const fromEmpty = ({ tags, isPlanar } = {}) =>
  taggedGraph(
    { tags, provenance: 'geometry/graph/fromEmpty' },
    { isEmpty: true, isPlanar }
  );

const empty = ({ tags, isPlanar }) => fromEmpty({ tags, isPlanar });

const filter$e = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const extrude = (geometry, top, bottom) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$e, inputs);
  const count = inputs.length;
  inputs.push(top, bottom);
  const outputs = extrude$1(inputs, count);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const filter$d = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const faces = (geometry) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$d, inputs);
  const outputs = faces$1(inputs);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const flip$3 = (path) => {
  if (path[0] === null) {
    return [null, ...path.slice(1).reverse()];
  } else {
    return path.slice().reverse();
  }
};

const flip$2 = (paths) => paths.map(flip$3);

const flip$1 = (points) =>
  points.map((point) => {
    if (point.length <= 3) {
      return point;
    }
    const [x, y, z, xF, yF, zF, xR, yR, zR] = point;
    const [xFR, yFR, zFR] = subtract(
      [x, y, z],
      subtract([xR, yR, zR], [x, y, z])
    );
    return [x, y, z, xF, yF, zF, xFR, yFR, zFR];
  });

const reverseFaceOrientations = (geometry) =>
  taggedGraph(
    { tags: geometry.tags },
    fromSurfaceMesh(
      reverseFaceOrientationsOfSurfaceMesh(
        toSurfaceMesh(geometry.graph),
        geometry.matrix
      )
    )
  );

const points = (geometry) => ({
  ...geometry,
  points: flip$1(geometry.points),
});
const paths = (geometry) => ({
  ...geometry,
  paths: flip$2(geometry.points),
});
const segments = (geometry) => ({
  ...geometry,
  segments: geometry.segments.map(([source, target]) => [target, source]),
});

const flip = op({ graph: reverseFaceOrientations, points, paths, segments });

// Remove any symbols (which refer to cached values).
const fresh = (geometry) => {
  const fresh = {};
  for (const key of Object.keys(geometry)) {
    if (typeof key !== 'symbol') {
      fresh[key] = geometry[key];
    }
  }
  return fresh;
};

const fromFunction = ({ tags }, op, options) =>
  taggedGraph(
    { tags },
    fromSurfaceMesh(
      fromFunctionToSurfaceMesh((x = 0, y = 0, z = 0) => op([x, y, z]), options)
    )
  );

const fromPoints = ({ tags }, points) =>
  taggedGraph({ tags }, fromSurfaceMesh(fromPointsToSurfaceMesh(points)));

const fromPolygons = ({ tags }, polygons) =>
  taggedGraph({ tags }, fromSurfaceMesh(fromPolygonsToSurfaceMesh(polygons)));

const fromSurfaceToPathsImpl = (surface) => {
  return { type: 'paths', paths: surface };
};

const fromSurfaceToPaths = fromSurfaceToPathsImpl;

const fromTriangles = ({ tags, matrix }, triangles) =>
  taggedGraph(
    { tags, matrix },
    fromSurfaceMesh(fromPolygonsToSurfaceMesh(triangles))
  );

const filter$c = (geometry) =>
  ['graph'].includes(geometry.type) && isNotTypeVoid(geometry);

const generateLowerEnvelope = (geometry) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$c, inputs);
  const outputs = generateEnvelope(inputs, /* envelopeType= */ 1);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const taggedPolygonsWithHoles = (
  { tags = [], matrix, provenance },
  polygonsWithHoles
) => {
  return {
    type: 'polygonsWithHoles',
    tags,
    matrix,
    provenance,
    plane: [0, 0, 1, 0],
    polygonsWithHoles,
  };
};

const generatePackingEnvelope$1 = (
  geometry,
  offset,
  segments,
  costThreshold
) =>
  taggedPolygonsWithHoles(
    {},
    generatePackingEnvelopeForSurfaceMesh(
      toSurfaceMesh(geometry.graph),
      geometry.matrix,
      offset,
      segments,
      costThreshold
    )
  );

const generatePackingEnvelope = op({ graph: generatePackingEnvelope$1 });

const filter$b = (geometry) =>
  ['graph'].includes(geometry.type) && isNotTypeVoid(geometry);

const generateUpperEnvelope = (geometry) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$b, inputs);
  const outputs = generateEnvelope(inputs, /* envelopeType= */ 0);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const getAnyNonVoidSurfaces = (geometry) => {
  const surfaces = [];
  eachNonVoidItem(geometry, (item) => {
    switch (item.type) {
      case 'surface':
      case 'z0Surface':
        surfaces.push(item);
    }
  });
  return surfaces;
};

const getAnySurfaces = (geometry) => {
  const surfaces = [];
  eachItem(geometry, (item) => {
    switch (item.type) {
      case 'surface':
      case 'z0Surface':
        surfaces.push(item);
    }
  });
  return surfaces;
};

const getItems = (geometry) => {
  const items = [];
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'item':
        return items.push(geometry);
      case 'sketch':
        // We don't look inside sketches.
        return;
      default:
        return descend();
    }
  };
  visit(geometry, op);
  return items;
};

const getInverseMatrices = (geometry) => {
  geometry = toConcreteGeometry(geometry);
  switch (geometry.type) {
    case 'item': {
      // These maintain an invertible matrix.
      const global = geometry.matrix;
      const local = invertTransform(global);
      return { global, local };
    }
    case 'segments': {
      // This is a bit trickier.
      // We transform the matrices such that the first segment starts at [0, 0, 0], and extends to [length, 0, 0].
      const {
        orientation = [
          [0, 0, 0],
          [0, 0, 1],
          [1, 0, 0],
        ],
        segments,
      } = geometry;
      if (segments.length < 1) {
        // There's nothing to do.
        return { global: geometry.matrix, local: geometry.matrix };
      }
      const local = fromSegmentToInverseTransform(segments[0], orientation);
      const global = invertTransform(local);
      return { global, local };
    }
    default: {
      return {
        global: geometry.matrix,
        local: invertTransform(geometry.matrix),
      };
    }
  }
};

const getLayouts = (geometry) => {
  const layouts = [];
  eachItem(geometry, (item) => {
    if (item.type === 'layout') {
      layouts.push(item);
    }
  });
  return layouts;
};

// Retrieve leaf geometry.

const getLeafs = (geometry) => {
  const leafs = [];
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'group':
      case 'layout':
        return descend();
      default:
        return leafs.push(geometry);
    }
  };
  visit(geometry, op);
  return leafs;
};

// Retrieve leaf geometry.

const getLeafsIn = (geometry) => {
  const leafs = [];
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'group':
      case 'layout':
      case 'item':
        return descend();
      default:
        return leafs.push(geometry);
    }
  };
  visit(geometry, op);
  return leafs;
};

const getNonVoidGraphs = (geometry) => {
  const graphs = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'graph') {
      graphs.push(item);
    }
  });
  return graphs;
};

const getNonVoidItems = (geometry) => {
  const items = [];
  const op = (geometry, descend) => {
    if (geometry.type === 'item' && isNotVoid(geometry)) {
      items.push(geometry);
    } else {
      descend();
    }
  };
  visit(geometry, op);
  return items;
};

const getNonVoidPaths = (geometry) => {
  const pathsets = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'paths') {
      pathsets.push(item);
    }
  });
  return pathsets;
};

const getNonVoidPolygonsWithHoles = (geometry) => {
  const polygons = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'polygonsWithHoles') {
      polygons.push(item);
    }
  });
  return polygons;
};

const getNonVoidFaceablePaths = (geometry) => {
  const pathsets = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type !== 'paths') {
      return;
    }
    if (item.tags && item.tags.includes('paths/Wire')) {
      return;
    }
    pathsets.push(item);
  });
  return pathsets;
};

const getNonVoidPlans = (geometry) => {
  const plans = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'plan') {
      plans.push(item);
    }
  });
  return plans;
};

const getNonVoidPoints = (geometry) => {
  const pointsets = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'points') {
      pointsets.push(item);
    }
  });
  return pointsets;
};

const getFaceablePaths = (geometry) => {
  const pathsets = [];
  eachItem(geometry, (item) => {
    if (item.type !== 'paths') {
      return;
    }
    if (item.tags && item.tags.includes('paths/Wire')) {
      return;
    }
    pathsets.push(item);
  });
  return pathsets;
};

const getGraphs = (geometry) => {
  const graphs = [];
  eachItem(geometry, (item) => {
    if (item.type === 'graph') {
      graphs.push(item);
    }
  });
  return graphs;
};

const getPaths = (geometry) => {
  const pathsets = [];
  eachItem(geometry, (item) => {
    if (item.type === 'paths') {
      pathsets.push(item);
    }
  });
  return pathsets;
};

const getEdges = (path) => {
  const edges = [];
  let last = null;
  for (const point of path) {
    if (point === null) {
      continue;
    }
    if (last !== null) {
      edges.push([last, point]);
    }
    last = point;
  }
  if (path[0] !== null) {
    edges.push([last, path[0]]);
  }
  return edges;
};

/**
 * Returns the first orientation peg found, or defaults to Z0.
 */

const getPeg = (geometry) => {
  let peg;
  eachItem(geometry, (item) => {
    if (item.type === 'points' && item.tags && item.tags.includes('peg')) {
      if (peg === undefined) {
        peg = item.points[0];
      }
    }
  });
  const [
    originX = 0,
    originY = 0,
    originZ = 0,
    forwardX = originX,
    forwardY = originY + 1,
    forwardZ = originZ,
    rightX = originX + 1,
    rightY = originY,
    rightZ = originZ,
  ] = peg || [];
  return [
    originX,
    originY,
    originZ,
    forwardX,
    forwardY,
    forwardZ,
    rightX,
    rightY,
    rightZ,
  ];
};

const getPlans = (geometry) => {
  const plans = [];
  eachItem(geometry, (item) => {
    if (item.type === 'plan') {
      plans.push(item);
    }
  });
  return plans;
};

const getPoints = (geometry) => {
  const pointsets = [];
  eachItem(geometry, (item) => {
    if (item.type === 'points') {
      pointsets.push(item);
    }
  });
  return pointsets;
};

const getTags = (geometry) => {
  if (geometry.tags === undefined) {
    return [];
  } else {
    return geometry.tags;
  }
};

const filter$a = (geometry, parent) =>
  ['graph'].includes(geometry.type) && isNotTypeVoid(geometry);

const grow = (geometry, offset, selections, options) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$a, inputs);
  const count = inputs.length;
  inputs.push(offset);
  for (const selection of selections) {
    linearize(toConcreteGeometry(selection), filter$a, inputs);
  }
  const outputs = grow$1(inputs, count, options);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const filter$9 = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const fill = (geometry, tags = []) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$9, inputs);
  const outputs = fill$1(inputs);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs.map((output) => ({ ...output, tags })));
};

const X = 0;
const Y = 1;

/**
 * Measure the area of a path as though it were a polygon.
 * A negative area indicates a clockwise path, and a positive area indicates a counter-clock-wise path.
 * See: http://mathworld.wolfram.com/PolygonArea.html
 * @returns {Number} The area the path would have if it were a polygon.
 */
const measureArea$1 = (path) => {
  let last = path.length - 1;
  let current = path[0] === null ? 1 : 0;
  let twiceArea = 0;
  for (; current < path.length; last = current++) {
    twiceArea +=
      path[last][X] * path[current][Y] - path[last][Y] * path[current][X];
  }
  return twiceArea / 2;
};

const isClockwise = (path) => measureArea$1(path) < 0;

const isCounterClockwise = (path) => measureArea$1(path) > 0;

const hasNotShow = (geometry, show) =>
  isNotShow(geometry, show)
    ? geometry
    : { ...geometry, tags: geometry.tags.filter((tag) => tag !== show) };
const hasShow = (geometry, show) =>
  isShow(geometry, show)
    ? geometry
    : { ...geometry, tags: [...geometry.tags, show] };
const isNotShow = ({ tags }, show) => !tags.includes(show);
const isShow = ({ tags }, show) => tags.includes(show);

const showOutline = 'show:outline';
const hasNotShowOutline = (geometry) =>
  hasNotShow(geometry, showOutline);
const hasShowOutline = (geometry) => hasShow(geometry, showOutline);
const isNotShowOutline = (geometry) => isNotShow(geometry, showOutline);
const isShowOutline = (geometry) => isShow(geometry, showOutline);

const showOverlay = 'show:overlay';
const hasNotShowOverlay = (geometry) =>
  hasNotShow(geometry, showOutline);
const hasShowOverlay = (geometry) => hasShow(geometry, showOverlay);
const isNotShowOverlay = (geometry) => isNotShow(geometry, showOverlay);
const isShowOverlay = (geometry) => isShow(geometry, showOverlay);

const showSkin = 'show:skin';
const hasNotShowSkin = (geometry) => hasNotShow(geometry, showSkin);
const hasShowSkin = (geometry) => hasShow(geometry, showSkin);
const isNotShowSkin = (geometry) => isNotShow(geometry, showSkin);
const isShowSkin = (geometry) => isShow(geometry, showSkin);

const showWireframe = 'show:wireframe';
const hasNotShowWireframe = (geometry) =>
  hasNotShow(geometry, showWireframe);
const hasShowWireframe = (geometry) => hasShow(geometry, showWireframe);
const isNotShowWireframe = (geometry) =>
  isNotShow(geometry, showWireframe);
const isShowWireframe = (geometry) => isShow(geometry, showWireframe);

const filter$8 = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments'].includes(geometry.type);

const join = (geometry, geometries) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$8, inputs);
  const count = inputs.length;
  for (const geometry of geometries) {
    linearize(geometry, filter$8, inputs);
  }
  const outputs = join$1(inputs, count);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs, count)(concreteGeometry);
};

const keep = (tags, geometry) =>
  rewriteTags(['type:void'], [], geometry, tags, 'has not');

const filter$7 = (geometry) =>
  ['points', 'segments'].includes(geometry.type) && isNotTypeVoid(geometry);

const link = (geometries, close = false) => {
  const inputs = [];
  for (const geometry of geometries) {
    linearize(toConcreteGeometry(geometry), filter$7, inputs);
  }
  const outputs = link$1(inputs, close);
  return taggedGroup({}, ...outputs);
};

const filter$6 = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const loft = (geometries, close = true) => {
  const inputs = [];
  // This is wrong -- we produce a total linearization over geometries,
  // but really it should be partitioned.
  for (const geometry of geometries) {
    linearize(toConcreteGeometry(geometry), filter$6, inputs);
  }
  const outputs = loft$1(inputs, close);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const filter$5 = (geometry) =>
  ['graph', 'polygonsWithHoles', 'segments', 'points'].includes(
    geometry.type
  ) && isNotTypeVoid(geometry);

const makeAbsolute = (geometry, tags = []) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$5, inputs);
  const outputs = makeAbsolute$1(inputs);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const filter$4 = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  hasNotTypeVoid(geometry);

const measureArea = (geometry) => {
  const linear = [];
  linearize(geometry, filter$4, linear);
  return computeArea(linear);
};

const filter$3 = (geometry) =>
  geometry.type === 'graph' && hasNotTypeVoid(geometry);

const measureVolume = (geometry) => {
  const linear = [];
  linearize(geometry, filter$3, linear);
  return computeVolume(linear);
};

const minkowskiDifference$1 = ({ tags }, a, b) => {
  if (a.graph.isEmpty || b.graph.isEmpty) {
    return a;
  }
  return taggedGraph(
    { tags },
    fromSurfaceMesh(
      minkowskiDifferenceOfSurfaceMeshes(
        toSurfaceMesh(a.graph),
        a.matrix,
        toSurfaceMesh(b.graph),
        b.matrix
      )
    )
  );
};

const minkowskiDifference = (geometry, offset) => {
  offset = reify(offset);
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        const differences = [];
        for (const otherGeometry of getNonVoidGraphs(offset)) {
          differences.push(
            minkowskiDifference$1({ tags }, geometry, otherGeometry)
          );
        }
        return taggedGroup({}, ...differences);
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return minkowskiDifference(reify(geometry).content[0], offset);
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const minkowskiShell$1 = ({ tags }, a, b) => {
  if (a.graph.isEmpty || b.graph.isEmpty) {
    return a;
  }
  return taggedGraph(
    { tags },
    fromSurfaceMesh(
      minkowskiShellOfSurfaceMeshes(
        toSurfaceMesh(a.graph),
        a.matrix,
        toSurfaceMesh(b.graph),
        b.matrix
      )
    )
  );
};

const minkowskiShell = (geometry, offset) => {
  offset = reify(offset);
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        const sums = [];
        for (const otherGeometry of getNonVoidGraphs(offset)) {
          sums.push(minkowskiShell$1({ tags }, geometry, otherGeometry));
        }
        return taggedGroup({}, ...sums);
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return minkowskiShell(reify(geometry).content[0], offset);
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for push.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const minkowskiSum$1 = ({ tags }, a, b) => {
  if (a.graph.isEmpty || b.graph.isEmpty) {
    return a;
  }
  return taggedGraph(
    { tags },
    fromSurfaceMesh(
      minkowskiSumOfSurfaceMeshes(
        toSurfaceMesh(a.graph),
        a.matrix,
        toSurfaceMesh(b.graph),
        b.matrix
      )
    )
  );
};

const minkowskiSum = (geometry, offset) => {
  offset = reify(offset);
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        const sums = [];
        for (const otherGeometry of getNonVoidGraphs(offset)) {
          sums.push(minkowskiSum$1({ tags }, geometry, otherGeometry));
        }
        return taggedGroup({}, ...sums);
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return minkowskiSum(reify(geometry).content[0], offset);
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for push.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const filter$2 = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const offset = (geometry, ...args) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$2, inputs);
  const outputs = offset$1(inputs, ...args);
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const open = (path) => (isClosed(path) ? [null, ...path] : path);

const push$1 = (geometry, force, minimumDistance, maximumDistance) =>
  taggedGraph(
    { tags: geometry.tags, matrix: geometry.matrix },
    fromSurfaceMesh(
      pushSurfaceMesh(
        toSurfaceMesh(geometry.graph),
        geometry.matrix,
        force,
        minimumDistance,
        maximumDistance
      )
    )
  );

const push = (
  geometry,
  { force, minimumDistance, maximumDistance } = {}
) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph':
        return push$1(geometry, force, minimumDistance, maximumDistance);
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        // CHECK: Isn't this case made redundant by toTransformedGeometry?
        return push(reify(geometry).content[0], {
          force,
          minimumDistance,
          maximumDistance,
        });
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for push.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

// We expect the type to be uniquely qualified.
const registerReifier = (type, reifier) => registry.set(type, reifier);

const remesh$1 = (
  geometry,
  resolution = 1,
  options = {},
  selections = []
) => {
  const { method = 'isotropic', lengths = [resolution] } = options;
  const selectionGraphs = selections.flatMap((selection) =>
    getNonVoidGraphs(toConcreteGeometry(selection))
  );
  switch (method) {
    case 'isotropic': {
      return taggedGraph(
        { tags: geometry.tags, matrix: geometry.matrix },
        fromSurfaceMesh(
          isotropicRemeshingOfSurfaceMesh(
            toSurfaceMesh(geometry.graph),
            geometry.matrix,
            { targetEdgeLength: resolution, ...options },
            selectionGraphs.map(({ graph, matrix }) => ({
              mesh: toSurfaceMesh(graph),
              matrix,
            }))
          )
        )
      );
    }
    case 'edgeLength':
      return taggedGraph(
        { tags: geometry.tags, matrix: geometry.matrix },
        fromSurfaceMesh(
          remeshSurfaceMesh(
            toSurfaceMesh(geometry.graph),
            geometry.matrix,
            ...lengths
          )
        )
      );
    default:
      throw Error(`Unknown remesh method ${method}`);
  }
};

const remesh = op({ graph: remesh$1 });

const removeSelfIntersections$1 = (geometry) =>
  taggedGraph(
    { tags: geometry.tags, matrix: geometry.matrix },
    fromSurfaceMesh(
      removeSelfIntersectionsOfSurfaceMesh(toSurfaceMesh(geometry.graph))
    )
  );

const removeSelfIntersections = op({ graph: removeSelfIntersections$1 });

// A path point may be supplemented by a 'forward' and a 'right' vector
// allowing it to define a plane with a rotation.

const transform$1 = (matrix, path) => {
  const transformedPath = [];
  if (isOpen(path)) {
    transformedPath.push(null);
  }
  for (let nth = isOpen(path) ? 1 : 0; nth < path.length; nth++) {
    const point = path[nth];
    const transformedPoint = transform$4(matrix, point);
    if (point.length > 3) {
      const forward = point.slice(3, 6);
      const transformedForward = transform$4(matrix, forward);
      transformedPoint.push(...transformedForward);
    }
    if (point.length > 6) {
      const right = point.slice(6, 9);
      const transformedRight = transform$4(matrix, right);
      transformedPoint.push(...transformedRight);
    }
    transformedPath.push(transformedPoint);
  }
  return transformedPath;
};

const translate$2 = (vector, path) =>
  transform$1(fromTranslation(vector), path);
const rotateZ$1 = (radians, path) =>
  transform$1(fromZRotation(radians), path);
const scale$2 = (vector, path) => transform$1(fromScaling(vector), path);

const transform = (matrix, paths) =>
  paths.map((path) => transform$1(matrix, path));

const scale$1 = ([x = 1, y = 1, z = 1], paths) =>
  transform(fromScaling([x, y, z]), paths);
const translate$1 = ([x = 0, y = 0, z = 0], paths) =>
  transform(fromTranslation([x, y, z]), paths);

const filter$1 = (geometry, parent) =>
  ['graph'].includes(geometry.type) && isNotTypeVoid(geometry);

const seam = (geometry, selections) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter$1, inputs);
  const count = inputs.length;
  for (const selection of selections) {
    linearize(toConcreteGeometry(selection), filter$1, inputs);
  }
  const outputs = seam$1(inputs, count);
  deletePendingSurfaceMeshes();
  return replacer(inputs, outputs)(concreteGeometry);
};

const serialize = op({ graph: prepareForSerialization$1 });

const simplify$1 = (geometry, options) => {
  const { method = 'simplify' } = options;
  switch (method) {
    case 'simplify':
      return taggedGraph(
        { tags: geometry.tags, matrix: geometry.matrix },
        fromSurfaceMesh(
          simplifySurfaceMesh(
            toSurfaceMesh(geometry.graph),
            geometry.matrix,
            options
          )
        )
      );
    case 'approximate':
      return taggedGraph(
        { tags: geometry.tags, matrix: geometry.matrix },
        fromSurfaceMesh(
          approximateSurfaceMesh(
            toSurfaceMesh(geometry.graph),
            geometry.matrix,
            options
          )
        )
      );
    default:
      throw Error(`Unknown simplify method ${method}`);
  }
};

const simplify = op({ graph: simplify$1 });

const smooth$1 = (geometry, options = {}, selections = []) => {
  const { method = 'shape' } = options;
  const selectionGraphs = selections.flatMap((selection) =>
    getNonVoidGraphs(toConcreteGeometry(selection))
  );
  switch (method) {
    case 'mesh': {
      return taggedGraph(
        { tags: geometry.tags, matrix: geometry.matrix },
        fromSurfaceMesh(
          smoothSurfaceMesh(
            toSurfaceMesh(geometry.graph),
            geometry.matrix,
            options,
            selectionGraphs.map(({ graph, matrix }) => ({
              mesh: toSurfaceMesh(graph),
              matrix,
            }))
          )
        )
      );
    }
    case 'shape': {
      return taggedGraph(
        { tags: geometry.tags, matrix: geometry.matrix },
        fromSurfaceMesh(
          smoothShapeOfSurfaceMesh(
            toSurfaceMesh(geometry.graph),
            geometry.matrix,
            options,
            selectionGraphs.map(({ graph, matrix }) => ({
              mesh: toSurfaceMesh(graph),
              matrix,
            }))
          )
        )
      );
    }
    case 'subdivide': {
      return taggedGraph(
        { tags: geometry.tags },
        fromSurfaceMesh(
          subdivideSurfaceMesh(toSurfaceMesh(geometry.graph), options)
        )
      );
    }
    default:
      throw Error(`Unknown method ${method}`);
  }
};

const smooth = op({ graph: smooth$1 });

const filter = (geometry) =>
  ['graph', 'polygonsWithHoles'].includes(geometry.type) &&
  isNotTypeVoid(geometry);

const separate = (
  geometry,
  keepShapes = true,
  keepHolesInShapes = true,
  keepHolesAsShapes = false
) => {
  const concreteGeometry = toConcreteGeometry(geometry);
  const inputs = [];
  linearize(concreteGeometry, filter, inputs);
  const outputs = separate$1(
    inputs,
    keepShapes,
    keepHolesInShapes,
    keepHolesAsShapes
  );
  deletePendingSurfaceMeshes();
  return taggedGroup({}, ...outputs);
};

const taggedTriangles = (
  { tags = [], matrix, provenance },
  triangles
) => {
  return { type: 'triangles', tags, matrix, provenance, triangles };
};

Error.stackTraceLimit = Infinity;

const toTriangles = ({ tags }, geometry) => {
  geometry.cache = geometry.cache || {};
  if (!geometry.cache.triangles) {
    const { matrix, graph } = geometry;
    const triangles = taggedTriangles(
      { tags, matrix },
      fromSurfaceMeshToTriangles(toSurfaceMesh(graph))
    );
    geometry.cache.triangles = triangles;
  }
  return geometry.cache.triangles;
};

const soup = (
  geometry,
  { doTriangles = true, doOutline = true, doWireframe = true } = {}
) => {
  const show = (geometry) => {
    if (doTriangles) {
      geometry = hasShowSkin(geometry);
    }
    if (doOutline && isNotTypeVoid(geometry)) {
      geometry = hasShowOutline(geometry);
    }
    if (doWireframe && isNotTypeVoid(geometry)) {
      geometry = hasShowWireframe(geometry);
    }
    return geometry;
  };
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        const { graph } = geometry;
        if (!graph) {
          console.log(JSON.stringify(geometry));
        }
        if (graph.isEmpty) {
          return taggedGroup({});
        } else {
          return show(toTriangles({ tags }, geometry));
        }
      }
      // Unreachable.
      case 'polygonsWithHoles':
        return show(geometry);
      case 'segments':
      case 'triangles':
      case 'points':
      case 'paths':
        // Already soupy enough.
        return geometry;
      case 'toolpath':
        // Drop toolpaths for now.
        return taggedGroup({});
      case 'displayGeometry':
        // soup can handle displayGeometry.
        return descend();
      case 'layout':
      case 'plan':
      case 'item':
      case 'sketch':
      case 'group': {
        return descend();
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toConcreteGeometry(geometry), op);
};

const taggedItem = ({ tags = [], matrix, provenance }, ...content) => {
  if (tags !== undefined && tags.length === undefined) {
    throw Error(`Bad tags: ${tags}`);
  }
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined Item content`);
  }
  if (content.length !== 1) {
    throw Error(`Item expects a single content geometry`);
  }
  return { type: 'item', tags, matrix, provenance, content };
};

const taggedDisplayGeometry = (
  { tags = [], matrix, provenance },
  ...content
) => {
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined DisplayGeometry content`);
  }
  if (content.length !== 1) {
    throw Error(`DisplayGeometry expects a single content geometry`);
  }
  return { type: 'displayGeometry', tags, matrix, provenance, content };
};

const taggedLayout = (
  { tags = [], matrix, provenance, size, margin, title },
  ...content
) => {
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined Layout content`);
  }
  if (content.some((value) => value.length)) {
    throw Error(`Layout content is an array`);
  }
  if (content.some((value) => value.geometry)) {
    throw Error(`Likely Shape in Layout`);
  }
  return {
    type: 'layout',
    layout: { size, margin, title },
    tags,
    matrix,
    provenance,
    content,
  };
};

const taggedPaths = ({ tags = [], matrix, provenance }, paths) => ({
  type: 'paths',
  tags,
  matrix,
  provenance,
  paths,
});

const taggedPlan = ({ tags = [], matrix, provenance }, plan) => ({
  type: 'plan',
  tags,
  matrix,
  provenance,
  plan,
  content: [],
});

const taggedPoints = (
  { tags = [], matrix, provenance },
  points,
  exactPoints
) => {
  return { type: 'points', tags, matrix, provenance, points, exactPoints };
};

const taggedPolygons = ({ tags = [], matrix, provenance }, polygons) => {
  return { type: 'polygons', tags, matrix, provenance, polygons };
};

const taggedSegments = (
  { tags = [], matrix, provenance, orientation },
  segments
) => {
  return { type: 'segments', tags, matrix, provenance, segments, orientation };
};

const taggedSketch = ({ tags = [], matrix, provenance }, ...content) => {
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined Sketch content`);
  }
  if (content.length !== 1) {
    throw Error(`Sketch expects a single content geometry`);
  }
  return { type: 'sketch', tags, matrix, provenance, content };
};

const taper$1 = (
  geometry,
  xPlusFactor,
  xMinusFactor,
  yPlusFactor,
  yMinusFactor,
  zPlusFactor,
  zMinusFactor
) =>
  taggedGraph(
    { tags: geometry.tags, matrix: geometry.matrix },
    fromSurfaceMesh(
      taperSurfaceMesh(
        toSurfaceMesh(geometry.graph),
        geometry.matrix,
        xPlusFactor,
        xMinusFactor,
        yPlusFactor,
        yMinusFactor,
        zPlusFactor,
        zMinusFactor
      )
    )
  );

const taper = (
  geometry,
  xPlusFactor,
  xMinusFactor,
  yPlusFactor,
  yMinusFactor,
  zPlusFactor,
  zMinusFactor
) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph': {
        return taper$1(
          geometry,
          xPlusFactor,
          xMinusFactor,
          yPlusFactor,
          yMinusFactor,
          zPlusFactor,
          zMinusFactor
        );
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return taper(
          reify(geometry).content[0],
          xPlusFactor,
          xMinusFactor,
          yPlusFactor,
          yMinusFactor,
          zPlusFactor,
          zMinusFactor
        );
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for taper.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const test$1 = (graph) => {
  if (doesSelfIntersectOfSurfaceMesh(toSurfaceMesh(graph))) {
    throw Error('Self-intersection detected');
  }
  return graph;
};

const test = (geometry) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph':
        return test$1(geometry.graph);
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'points':
      case 'paths':
        return;
      case 'plan':
        return test(reify(geometry).content[0]);
      case 'transform':
      case 'layout':
      case 'item':
      case 'group':
      case 'sketch':
        return descend();
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  visit(geometry, op);
  return geometry;
};

const toDisplayGeometry = (
  geometry,
  { triangles, outline = true, skin, wireframe = false } = {}
) => {
  if (!geometry) {
    throw Error('die');
  }
  if (skin === undefined) {
    skin = triangles;
  }
  if (skin === undefined) {
    skin = true;
  }
  return soup(toConcreteGeometry(geometry), {
    doTriangles: skin,
    doOutline: outline,
    doWireframe: wireframe,
  });
};

const toPoints = (geometry) => {
  const points = [];
  eachPoint(geometry, (point) => points.push(point));
  return taggedPoints({}, points);
};

const toTriangleArray = (geometry) => {
  const triangles = [];
  const op = (geometry, descend) => {
    const { matrix = identityMatrix, tags, type } = geometry;
    const transformTriangles = (triangles) =>
      triangles.map((triangle) =>
        triangle.map((point) => transform$4(matrix, point))
      );
    switch (type) {
      case 'graph': {
        if (isNotVoid(geometry)) {
          triangles.push(
            ...transformTriangles(
              toTriangles({ tags }, geometry).triangles
            )
          );
        }
        break;
      }
      case 'triangles': {
        if (isNotVoid(geometry)) {
          triangles.push(...transformTriangles(geometry.triangles));
        }
        break;
      }
      case 'polygonsWithHoles':
      case 'points':
      case 'paths':
      case 'segments':
        break;
      case 'layout':
      case 'plan':
      case 'item':
      case 'sketch':
      case 'group': {
        return descend();
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  visit(toConcreteGeometry(geometry), op);

  return triangles;
};

const twist$1 = (geometry, turnsPerMm) =>
  taggedGraph(
    { tags: geometry.tags, matrix: geometry.matrix },
    fromSurfaceMesh(
      twistSurfaceMesh(
        toSurfaceMesh(geometry.graph),
        geometry.matrix,
        turnsPerMm
      )
    )
  );

const twist = (geometry, turnsPerMm, axis) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph': {
        return twist$1(geometry, turnsPerMm);
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return twist(reify(geometry).content[0], turnsPerMm);
      case 'item':
      case 'group': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for twist.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const collect = (geometry, out) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph':
        out.push(geometry);
        break;
    }
    descend();
  };
  visit(geometry, op);
};

const getQuery = (geometry) => {
  const graphGeometries = [];
  collect(geometry, graphGeometries);

  const queries = graphGeometries.map((graphGeometry) =>
    SurfaceMeshQuery(toSurfaceMesh(graphGeometry.graph), graphGeometry.matrix)
  );

  const isInteriorPoint = (x = 0, y = 0, z = 0) => {
    for (const query of queries) {
      if (query.isIntersectingPointApproximate(x, y, z)) {
        return true;
      }
    }
    return false;
  };
  const clipSegment = (
    [sourceX = 0, sourceY = 0, sourceZ = 0],
    [targetX = 0, targetY = 0, targetZ = 0]
  ) => {
    const segments = [];
    for (const query of queries) {
      query.clipSegmentApproximate(
        sourceX,
        sourceY,
        sourceZ,
        targetX,
        targetY,
        targetZ,
        (sourceX, sourceY, sourceZ, targetX, targetY, targetZ) =>
          segments.push([
            [sourceX, sourceY, sourceZ],
            [targetX, targetY, targetZ],
          ])
      );
    }
    return segments;
  };
  const clipSegments = (segments) => {
    const clipped = [];
    for (const [source, target] of segments) {
      clipped.push(...clipSegment(source, target));
    }
    return clipped;
  };
  const release = () => {
    for (const query of queries) {
      query.delete();
    }
  };
  return { clipSegment, clipSegments, isInteriorPoint, release };
};

const withQuery = (geometry, thunk) => {
  const queries = [];
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph':
        queries.push(getQuery(geometry));
        return;
      default:
        descend();
    }
  };
  visit(toConcreteGeometry(geometry), op);
  const clipSegment = (source, target) => {
    const clippedSegments = [];
    for (const query of queries) {
      if (query.clipSegment) {
        clippedSegments.push(...query.clipSegment(source, target));
      }
    }
    return clippedSegments;
  };
  const clipSegments = (segments) => {
    const clippedSegments = [];
    for (const query of queries) {
      if (query.clipSegments) {
        clippedSegments.push(...query.clipSegments(segments));
      }
    }
    return clippedSegments;
  };
  const isInteriorPoint = (x = 0, y = 0, z = 0) => {
    for (const query of queries) {
      if (query.isInteriorPoint && query.isInteriorPoint(x, y, z)) {
        return true;
      }
    }
    return false;
  };
  thunk({ clipSegment, clipSegments, isInteriorPoint });
  for (const query of queries) {
    query.release();
  }
};

const rotateX = (turn, geometry) =>
  transform$3(fromRotateXToTransform(turn), geometry);
const rotateY = (turn, geometry) =>
  transform$3(fromRotateYToTransform(turn), geometry);
const rotateZ = (turn, geometry) =>
  transform$3(fromRotateZToTransform(turn), geometry);
const translate = (vector, geometry) =>
  transform$3(fromTranslateToTransform(...vector), geometry);
const scale = (vector, geometry) =>
  transform$3(fromScaleToTransform(...vector), geometry);

export { allTags, alphaShape, assemble, bend, cached, canonicalize, canonicalize$4 as canonicalizePath, canonicalize$3 as canonicalizePaths, cast, clip, close as closePath, computeCentroid, computeNormal, computeToolpath, concatenate as concatenatePath, convexHull, cut, deduplicate as deduplicatePath, deform, demesh, difference, disjoint, doesNotOverlap, drop, eachItem, eachPoint, eachSegment, empty, extrude, faces, fill, flip, flip$3 as flipPath, fresh, fromFunction as fromFunctionToGraph, fromPoints as fromPointsToGraph, fromPolygons as fromPolygonsToGraph, fromSurfaceToPaths, fromTriangles as fromTrianglesToGraph, fuse, generateLowerEnvelope, generatePackingEnvelope, generateUpperEnvelope, getAnyNonVoidSurfaces, getAnySurfaces, getFaceablePaths, getGraphs, getInverseMatrices, getItems, getLayouts, getLeafs, getLeafsIn, getNonVoidFaceablePaths, getNonVoidGraphs, getNonVoidItems, getNonVoidPaths, getNonVoidPlans, getNonVoidPoints, getNonVoidPolygonsWithHoles, getNonVoidSegments, getEdges as getPathEdges, getPaths, getPeg, getPlans, getPoints, getTags, grow, hasNotShow, hasNotShowOutline, hasNotShowOverlay, hasNotShowSkin, hasNotShowWireframe, hasNotType, hasNotTypeMasked, hasNotTypeVoid, hasNotTypeWire, hasShow, hasShowOutline, hasShowOverlay, hasShowSkin, hasShowWireframe, hasType, hasTypeMasked, hasTypeVoid, hasTypeWire, hash, inset, isClockwise as isClockwisePath, isClosed as isClosedPath, isCounterClockwise as isCounterClockwisePath, isNotShow, isNotShowOutline, isNotShowOverlay, isNotShowSkin, isNotShowWireframe, isNotType, isNotTypeMasked, isNotTypeVoid, isNotTypeWire, isNotVoid, isShow, isShowOutline, isShowOverlay, isShowSkin, isShowWireframe, isType, isTypeMasked, isTypeVoid, isTypeWire, isVoid, join, keep, linearize, link, loft, makeAbsolute, measureArea, measureBoundingBox, measureVolume, minkowskiDifference, minkowskiShell, minkowskiSum, offset, op, open as openPath, outline, prepareForSerialization, push, read, readNonblocking, registerReifier, reify, remesh, removeSelfIntersections, reverseFaceOrientations as reverseFaceOrientationsOfGraph, rewrite, rewriteTags, rotateX, rotateY, rotateZ, rotateZ$1 as rotateZPath, scale, scale$2 as scalePath, scale$1 as scalePaths, seam, section, separate, serialize, showOutline, showOverlay, showSkin, showWireframe, simplify, smooth, soup, taggedDisplayGeometry, taggedGraph, taggedGroup, taggedItem, taggedLayout, taggedPaths, taggedPlan, taggedPoints, taggedPolygons, taggedPolygonsWithHoles, taggedSegments, taggedSketch, taggedTriangles, taper, test, toConcreteGeometry, toDisplayGeometry, toPoints, toTransformedGeometry, toTriangleArray, toTriangles as toTrianglesFromGraph, transform$3 as transform, transformCoordinate, transform as transformPaths, transformingCoordinates, translate, translate$2 as translatePath, translate$1 as translatePaths, twist, typeMasked, typeVoid, typeWire, update, visit, withQuery, write, writeNonblocking };
