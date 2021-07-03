import { normalize, subtract, dot, cross, negate, scale as scale$1, add as add$1, distance } from './jsxcad-math-vec3.js';
import { closePath, concatenatePath, assemble as assemble$1, eachPoint, flip, toConcreteGeometry, toDisplayGeometry, toTransformedGeometry, toPoints, transform, rewriteTags, taggedPaths, taggedGraph, openPath, taggedPoints, fromPolygonsToGraph, registerReifier, read, write, realize, rewrite, loft as loft$1, minkowskiDifference as minkowskiDifference$1, minkowskiShell as minkowskiShell$1, minkowskiSum as minkowskiSum$1, isVoid, taggedGroup, offset as offset$1, getLeafs, taggedItem, toDisjointGeometry, push as push$1, getPeg, taggedPlan, remesh as remesh$1, smooth as smooth$1, measureBoundingBox, taggedSketch, split as split$1, allTags, test as test$1, twist as twist$1, toPolygonsWithHoles, arrangePolygonsWithHoles, fromPolygonsWithHolesToTriangles, fromTrianglesToGraph, union, bend as bend$1, intersection, difference, empty, inset as inset$1, grow as grow$1 } from './jsxcad-geometry.js';
import { identityMatrix, fromTranslation, fromRotation, fromScaling } from './jsxcad-math-mat4.js';
import { emit, addPending, writeFile, log as log$1 } from './jsxcad-sys.js';
import { toTagsFromName } from './jsxcad-algorithm-material.js';
import { pack as pack$1 } from './jsxcad-algorithm-pack.js';
import { fromPoints, toXYPlaneTransforms } from './jsxcad-math-plane.js';
import { fromRotateXToTransform, fromRotateYToTransform, fromRotateZToTransform } from './jsxcad-algorithm-cgal.js';
import { toTagsFromName as toTagsFromName$1 } from './jsxcad-algorithm-tool.js';
import { toTagsFromName as toTagsFromName$2 } from './jsxcad-algorithm-color.js';

class Shape {
  close() {
    const geometry = this.toConcreteGeometry();
    if (!isSingleOpenPath(geometry)) {
      throw Error('Close requires a single open path.');
    }
    return Shape.fromClosedPath(closePath(geometry.paths[0]));
  }

  concat(...shapes) {
    const paths = [];
    for (const shape of [this, ...shapes]) {
      const geometry = shape.toConcreteGeometry();
      if (!isSingleOpenPath(geometry)) {
        throw Error(
          `Concatenation requires single open paths: ${JSON.stringify(
            geometry
          )}`
        );
      }
      paths.push(geometry.paths[0]);
    }
    return Shape.fromOpenPath(concatenatePath(...paths));
  }

  constructor(geometry = assemble$1(), context) {
    if (geometry.geometry) {
      throw Error('die: { geometry: ... } is not valid geometry.');
    }
    this.geometry = geometry;
    this.context = context;
  }

  eachPoint(operation) {
    eachPoint(operation, this.toConcreteGeometry());
  }

  flip() {
    return fromGeometry(flip(toConcreteGeometry(this)), this.context);
  }

  toDisplayGeometry(options) {
    return toDisplayGeometry(toGeometry(this), options);
  }

  toKeptGeometry(options = {}) {
    return this.toConcreteGeometry();
  }

  toConcreteGeometry(options = {}) {
    return toConcreteGeometry(toGeometry(this));
  }

  toDisjointGeometry(options = {}) {
    return toConcreteGeometry(toGeometry(this));
  }

  toTransformedGeometry(options = {}) {
    return toTransformedGeometry(toGeometry(this));
  }

  getContext(symbol) {
    return this.context[symbol];
  }

  toGeometry() {
    return this.geometry;
  }

  toPoints() {
    return toPoints(this.toConcreteGeometry()).points;
  }

  points() {
    return Shape.fromGeometry(toPoints(this.toTransformedGeometry()));
  }

  transform(matrix) {
    if (matrix === identityMatrix) {
      return this;
    } else {
      return fromGeometry(transform(matrix, this.toGeometry()), this.context);
    }
  }

  // Low level setter for reifiers.
  getTags() {
    return this.toGeometry().tags || [];
  }

  setTags(tags = []) {
    return Shape.fromGeometry(rewriteTags(tags, [], this.toGeometry()));
  }
}

const isSingleOpenPath = ({ paths }) =>
  paths !== undefined && paths.length === 1 && paths[0][0] === null;

Shape.method = {};

const registerShapeMethod = (name, op) => {
  /*
  // FIX: See if we can switch these to dispatching via define?
  if (Shape.prototype.hasOwnProperty(name)) {
    throw Error(`Method ${name} is already in use.`);
  }
*/
  // Make the operation constructor available e.g., Shape.grow(1)(s)
  Shape[name] = op;
  // Make the operation application available e.g., s.grow(1)
  const { [name]: method } = {
    [name]: function (...args) {
      return op(...args)(this);
    },
  };
  Shape.prototype[name] = method;
  return method;
};

Shape.fromClosedPath = (path, context) =>
  fromGeometry(taggedPaths({}, [closePath(path)]), context);
Shape.fromGeometry = (geometry, context) => new Shape(geometry, context);
Shape.fromGraph = (graph, context) =>
  new Shape(taggedGraph({}, graph), context);
Shape.fromOpenPath = (path, context) =>
  fromGeometry(taggedPaths({}, [openPath(path)]), context);
Shape.fromPath = (path, context) =>
  fromGeometry(taggedPaths({}, [path]), context);
Shape.fromPaths = (paths, context) =>
  fromGeometry(taggedPaths({}, paths), context);
Shape.fromPoint = (point, context) =>
  fromGeometry(taggedPoints({}, [point]), context);
Shape.fromPoints = (points, context) =>
  fromGeometry(taggedPoints({}, points), context);
Shape.fromPolygons = (polygons, context) =>
  fromGeometry(fromPolygonsToGraph({}, polygons), context);
Shape.registerMethod = registerShapeMethod;
// Let's consider 'method' instead of 'registerMethod'.
Shape.method = registerShapeMethod;
Shape.reifier = (name, op) => registerReifier(name, op);

const fromGeometry = Shape.fromGeometry;
const toGeometry = (shape) => shape.toGeometry();

const orient$1 =
  ({
    center = [0, 0, 0],
    facing = [0, 0, 1],
    at = [0, 0, 0],
    from = [0, 0, 0],
  }) =>
  (shape) => {
    const normalizedFacing = normalize(facing);
    const normalizedAt = normalize(subtract(at, from));

    const angle =
      (Math.acos(dot(normalizedFacing, normalizedAt)) * 180) / Math.PI;
    const axis = normalize(cross(normalizedFacing, normalizedAt));

    return shape
      .move(...negate(center))
      .rotate(angle, axis)
      .move(...from);
  };

Shape.registerMethod('orient', orient$1);

const prepareShape = (shape, name, options = {}) => {
  let index = 0;
  const entries = [];
  entries.push({
    data: new TextEncoder('utf8').encode(JSON.stringify(shape)),
    filename: `${name}_${index++}.jsxcad`,
    type: 'application/x-jsxcad',
  });
  return entries;
};

const downloadShapeMethod = function (...args) {
  const entries = prepareShape(this, ...args);
  emit({ download: { entries } });
  return this;
};
Shape.prototype.downloadShape = downloadShapeMethod;

const writeShape = (shape, name, options = {}) => {
  for (const { data, filename } of prepareShape(shape, name, {})) {
    addPending(writeFile({ doSerialize: false }, `output/${filename}`, data));
  }
  return shape;
};

const writeShapeMethod = function (...args) {
  return writeShape(this, ...args);
};
Shape.prototype.writeShape = writeShapeMethod;

const fromUndefined = () => Shape.fromGeometry();

const loadGeometry = async (
  path,
  { otherwise = fromUndefined } = {}
) => {
  const data = await read(path);
  if (data === undefined) {
    return otherwise();
  } else {
    return Shape.fromGeometry(data);
  }
};

const saveGeometry = async (path, shape) =>
  Shape.fromGeometry(await write(shape.toGeometry(), path));

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

/**
 *
 * # Log
 *
 * Writes a string to the console.
 *
 * ```
 * log("Hello, World")
 * ```
 *
 **/

const toText = (value) => {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
};

const log = (value, level) => {
  const text = toText(value);
  const log = { text, level };
  const hash = hashSum(log);
  emit({ log, hash });
  return log$1({ op: 'text', text, level });
};

const logOp = (shape, op) => {
  const text = String(op(shape));
  const level = 'serious';
  const log = { text, level };
  const hash = hashSum(log);
  emit({ log, hash });
  return log$1({ op: 'text', text });
};

const logMethod = function (op = (shape) => JSON.stringify(shape)) {
  logOp(Shape.fromGeometry(realize(this.toGeometry())), op);
  return this;
};
Shape.prototype.log = logMethod;

const selectToKeep = (matchTags, geometryTags) => {
  if (geometryTags === undefined) {
    return false;
  }
  for (const geometryTag of geometryTags) {
    if (matchTags.includes(geometryTag)) {
      return true;
    }
  }
  return false;
};

const selectToDrop = (matchTags, geometryTags) =>
  !selectToKeep(matchTags, geometryTags);

const keepOrDrop = (shape, tags, select) => {
  const matchTags = tags.map((tag) => `user/${tag}`);

  const op = (geometry, descend) => {
    // FIX: Need a more reliable way to detect leaf structure.
    switch (geometry.type) {
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
      case 'layout': {
        return descend();
      }
      case 'item':
      /* {
        if (
          geometry.tags === undefined ||
          !geometry.tags.some((tag) => matchTags.includes(tag))
        ) {
          // If the item isn't involved with these tags; treat it as a branch.
          return descend();
        }
      }
*/
      // falls through to deal with item as a leaf.
      default: {
        if (select(matchTags, geometry.tags)) {
          return descend();
        } else {
          // Operate on the shape.
          const shape = Shape.fromGeometry(geometry);
          // Note that this transform does not violate geometry disjunction.
          const dropped = shape.void().toGeometry();
          return dropped;
        }
      }
    }
  };

  const rewritten = rewrite(shape.toKeptGeometry(), op);
  return Shape.fromGeometry(rewritten);
};

const keep =
  (...tags) =>
  (shape) => {
    if (tags === undefined) {
      // Dropping no tags is an unconditional keep.
      return keepOrDrop(shape, [], selectToDrop);
    } else {
      return keepOrDrop(shape, tags, selectToKeep);
    }
  };

const drop =
  (...tags) =>
  (shape) => {
    if (tags === undefined) {
      // Keeping no tags is an unconditional drop.
      return keepOrDrop(shape, [], selectToKeep);
    } else {
      return keepOrDrop(shape, tags, selectToDrop);
    }
  };

Shape.registerMethod('keep', keep);
Shape.registerMethod('drop', drop);

const loft =
  (...ops) =>
  (shape) =>
    Shape.fromGeometry(
      loft$1(
        /* closed= */ false,
        ...ops.map((op) => op(shape).toGeometry())
      )
    );

Shape.registerMethod('loft', loft);

const loop =
  (...ops) =>
  (shape) =>
    Shape.fromGeometry(
      loft$1(
        /* closed= */ true,
        ...ops.map((op) => op(shape).toGeometry())
      )
    );

Shape.registerMethod('loop', loop);

const material = (name) => (shape) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName(name), [], shape.toGeometry()));

Shape.registerMethod('material', material);

const minkowskiDifference = (offset) => (shape) =>
  Shape.fromGeometry(
    minkowskiDifference$1(shape.toGeometry(), offset.toGeometry())
  );

Shape.registerMethod('minkowskiDifference', minkowskiDifference);

const minkowskiShell = (offset) => (shape) =>
  Shape.fromGeometry(
    minkowskiShell$1(shape.toGeometry(), offset.toGeometry())
  );

Shape.registerMethod('minkowskiShell', minkowskiShell);

const minkowskiSum = (offset) => (shape) =>
  Shape.fromGeometry(
    minkowskiSum$1(shape.toGeometry(), offset.toGeometry())
  );

Shape.registerMethod('minkowskiSum', minkowskiSum);

const move =
  (x = 0, y = 0, z = 0) =>
  (shape) => {
    if (!isFinite(x)) {
      x = 0;
    }
    if (!isFinite(y)) {
      y = 0;
    }
    if (!isFinite(z)) {
      z = 0;
    }
    return shape.transform(fromTranslation([x, y, z]));
  };

Shape.registerMethod('move', move);

const noVoid = (tags, select) => (shape) => {
  const op = (geometry, descend) => {
    if (isVoid(geometry)) {
      return taggedGroup({});
    } else {
      return descend();
    }
  };

  const rewritten = rewrite(shape.toDisjointGeometry(), op);
  return Shape.fromGeometry(rewritten);
};

Shape.registerMethod('noVoid', noVoid);

const offset =
  (initial = 1, step, limit) =>
  (shape) =>
    Shape.fromGeometry(
      offset$1(shape.toGeometry(), initial, step, limit)
    );

Shape.registerMethod('offset', offset);

const op = (fn) => (shape) => fn(shape);

const withOp = (fn) => (shape) => shape.with(fn(shape));

Shape.registerMethod('op', op);
Shape.registerMethod('withOp', withOp);

const pack =
  ({
    size,
    pageMargin = 5,
    itemMargin = 1,
    perLayout = Infinity,
    packSize = [],
  } = {}) =>
  (shape) => {
    if (perLayout === 0) {
      // Packing was disabled -- do nothing.
      return shape;
    }

    let todo = [];
    for (const leaf of getLeafs(shape.toKeptGeometry())) {
      todo.push(leaf);
    }
    const packedLayers = [];
    while (todo.length > 0) {
      const input = [];
      while (todo.length > 0 && input.length < perLayout) {
        input.push(todo.shift());
      }
      const [packed, unpacked, minPoint, maxPoint] = pack$1(
        { size, pageMargin, itemMargin },
        ...input
      );
      packSize[0] = minPoint;
      packSize[1] = maxPoint;
      if (packed.length === 0) {
        break;
      } else {
        packedLayers.push(
          taggedItem({}, taggedGroup({}, ...packed.map(toDisjointGeometry)))
        );
      }
      todo.unshift(...unpacked);
    }
    let packedShape = Shape.fromGeometry(taggedGroup({}, ...packedLayers));
    if (size === undefined) {
      packedShape = packedShape.align('xy');
    }
    return packedShape;
  };

Shape.registerMethod('pack', pack);

const push =
  (force = 0.1, minimumDistance = 1, maximumDistance = 10) =>
  (shape) =>
    Shape.fromGeometry(
      push$1(shape.toGeometry(), {
        force,
        minimumDistance,
        maximumDistance,
      })
    );

Shape.registerMethod('push', push);

const normalizeCoords = ([
  x = 0,
  y = 0,
  z = 0,
  fX = 0,
  fY = 1,
  fZ = 0,
  rX = 1,
  rY = 0,
  rZ = 0,
]) => [x, y, z, fX, fY, fZ, rX, rY, rZ];

const getPegCoords = (shape) => {
  const coords =
    shape.constructor === Shape
      ? getPeg(shape.toTransformedGeometry())
      : normalizeCoords(shape);
  const origin = coords.slice(0, 3);
  const forward = coords.slice(3, 6);
  const right = coords.slice(6, 9);
  // const plane = fromPoints(right, forward, origin);
  const plane = fromPoints(origin, forward, right);

  return { coords, origin, forward, right, plane };
};

// See also:
// https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724

const orient = (origin, forward, right, shapeToPeg) => {
  console.log(`QQ/orient`);
  console.log(`QQ/right: ${JSON.stringify(right)}`);
  console.log(`QQ/forward: ${JSON.stringify(forward)}`);
  console.log(`QQ/origin: ${JSON.stringify(origin)}`);
  // const plane = fromPoints(right, forward, origin);
  const plane = fromPoints(origin, forward, right);
  console.log(`QQ/orient/plane: ${JSON.stringify(plane)}`);
  const d = Math.abs(dot(plane, [0, 0, 1, 0]));
  if (d >= 0.99999) {
    return shapeToPeg.move(...origin);
  }
  const rightDirection = subtract(right, origin);
  console.log(`QQ/orient/rightDirection: ${JSON.stringify(rightDirection)}`);
  const [, from] = toXYPlaneTransforms(plane, rightDirection);
  console.log(`QQ/orient/from: ${JSON.stringify(from)}`);
  return shapeToPeg.transform(from).move(...origin);
};

const peg = (shapeToPeg) => (shape) => {
  const { origin, right, forward } = getPegCoords(shape);
  return orient(origin, right, forward, shapeToPeg);
};

Shape.registerMethod('peg', peg);

const put = (pegShape) => (shape) => peg(shape)(pegShape);

Shape.registerMethod('put', put);

const shapeMethod = (build) => {
  return function (...args) {
    return this.peg(build(...args));
  };
};

const updatePlan = (shape, ...updates) => {
  const geometry = shape.toTransformedGeometry();
  if (geometry.type !== 'plan') {
    throw Error(`Shape is not a plan`);
  }
  return Shape.fromGeometry(
    taggedPlan(
      { tags: geometry.tags },
      {
        ...geometry.plan,
        history: [...(geometry.plan.history || []), ...updates],
      }
    )
  );
};

const updatePlanMethod = function (...updates) {
  return updatePlan(this, ...updates);
};

Shape.prototype.updatePlan = updatePlanMethod;

const hasAngle =
  (start = 0, end = 0) =>
  (shape) =>
    shape.updatePlan({ angle: { start: start, end: end } });
const hasBase = (base) => (shape) => shape.updatePlan({ base });
const hasAt =
  (x = 0, y = 0, z = 0) =>
  (shape) =>
    shape.updatePlan({
      at: [x, y, z],
    });
const hasCorner1 =
  (x = 0, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan({
      corner1: [x, y, z],
    });
const hasC1 = hasCorner1;
const hasCorner2 =
  (x = 0, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan({
      corner2: [x, y, z],
    });
const hasC2 = hasCorner2;
const hasDiameter =
  (x = 1, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan(
      { corner1: [x / 2, y / 2, z / 2] },
      { corner2: [x / -2, y / -2, z / -2] }
    );
const hasRadius =
  (x = 1, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan(
      {
        corner1: [x, y, z],
      },
      {
        corner2: [-x, -y, -z],
      }
    );
const hasApothem =
  (x = 1, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan(
      {
        corner1: [x, y, z],
      },
      {
        corner2: [-x, -y, -z],
      },
      { apothem: [x, y, z] }
    );
const hasFrom =
  (x = 0, y = 0, z = 0) =>
  (shape) =>
    shape.updatePlan({ from: [x, y, z] });
const hasSides =
  (sides = 1) =>
  (shape) =>
    shape.updatePlan({ sides });
const hasTo =
  (x = 0, y = 0, z = 0) =>
  (shape) =>
    shape.updatePlan({ to: [x, y, z], top: undefined });
const hasTop = (top) => (shape) => shape.updatePlan({ top });
const hasZag = (zag) => (shape) => shape.updatePlan({ zag });

// Let's consider migrating to a 'has' prefix for planning.

Shape.registerMethod('hasApothem', hasApothem);
Shape.registerMethod('hasAngle', hasAngle);
Shape.registerMethod('hasAt', hasAt);
Shape.registerMethod('hasBase', hasBase);
Shape.registerMethod('hasCorner1', hasCorner1);
Shape.registerMethod('hasC1', hasCorner1);
Shape.registerMethod('hasCorner2', hasCorner2);
Shape.registerMethod('hasC2', hasCorner2);
Shape.registerMethod('hasDiameter', hasDiameter);
Shape.registerMethod('hasFrom', hasFrom);
Shape.registerMethod('hasRadius', hasRadius);
Shape.registerMethod('hasSides', hasSides);
Shape.registerMethod('hasTo', hasTo);
Shape.registerMethod('hasTop', hasTop);
Shape.registerMethod('hasZag', hasZag);

const remesh =
  (...lengths) =>
  (shape) =>
    Shape.fromGeometry(remesh$1(shape.toGeometry(), { lengths }));

Shape.registerMethod('remesh', remesh);

const rotate =
  (angle = 0, axis = [0, 0, 1]) =>
  (shape) =>
    shape.transform(fromRotation(angle * 0.017453292519943295, axis));

Shape.registerMethod('rotate', rotate);

const rotateX =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...angles.map((angle) => shape.transform(fromRotateXToTransform(angle)))
    );

// rx is in terms of turns -- 1/2 is a half turn.
const rx =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...angles.map((angle) =>
        shape.transform(fromRotateXToTransform(angle * 360))
      )
    );

Shape.registerMethod('rotateX', rotateX);
Shape.registerMethod('rx', rx);

const rotateY =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...angles.map((angle) => shape.transform(fromRotateYToTransform(angle)))
    );

// ry is in terms of turns -- 1/2 is a half turn.
const ry =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...angles.map((angle) =>
        shape.transform(fromRotateYToTransform(angle * 360))
      )
    );

Shape.registerMethod('rotateY', rotateY);
Shape.registerMethod('ry', ry);

const rotateZ =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...angles.map((angle) => shape.transform(fromRotateZToTransform(angle)))
    );

const rz =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...angles.map((angle) =>
        shape.transform(fromRotateZToTransform(angle * 360))
      )
    );

Shape.registerMethod('rotateZ', rotateZ);
Shape.registerMethod('rz', rz);

const scale =
  (x = 1, y = x, z = y) =>
  (shape) =>
    shape.transform(fromScaling([x, y, z]));

Shape.registerMethod('scale', scale);

const smooth =
  (options = {}) =>
  (shape) =>
    Shape.fromGeometry(smooth$1(shape.toGeometry(), options));

Shape.registerMethod('smooth', smooth);

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

const size =
  (op = (size, shape) => size) =>
  (shape) => {
    const geometry = shape.toConcreteGeometry();
    const [min, max] = measureBoundingBox(geometry);
    const length = max[X$1] - min[X$1];
    const width = max[Y$1] - min[Y$1];
    const height = max[Z$1] - min[Z$1];
    const center = scale$1(0.5, add$1(min, max));
    const radius = distance(center, max);
    return op(
      {
        length,
        width,
        height,
        max,
        min,
        center,
        radius,
      },
      Shape.fromGeometry(geometry)
    );
  };

Shape.registerMethod('size', size);

const sketch = () => (shape) =>
  Shape.fromGeometry(taggedSketch({}, shape.toGeometry()));

Shape.registerMethod('sketch', sketch);

const split =
  ({
    keepVolumes = true,
    keepCavitiesInVolumes = true,
    keepCavitiesAsVolumes = false,
  } = {}) =>
  (shape) =>
    Shape.fromGeometry(
      split$1(
        shape.toGeometry(),
        keepVolumes,
        keepCavitiesInVolumes,
        keepCavitiesAsVolumes
      )
    );

Shape.registerMethod('split', split);

const tags =
  (op = (tags, shape) => tags) =>
  (shape) =>
    op(
      [...allTags(shape.toGeometry())]
        .filter((tag) => tag.startsWith('user/'))
        .map((tag) => tag.substring(5)),
      shape
    );

Shape.registerMethod('tags', tags);

const test = (md) => (shape) => {
  if (md) {
    shape.md(md);
  }
  test$1(shape.toGeometry());
  return shape;
};

Shape.registerMethod('test', test);

const tool = (name) => (shape) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName$1(name), [], shape.toGeometry()));

Shape.registerMethod('tool', tool);

const twist =
  (degreesPerMm = 1) =>
  (shape) =>
    Shape.fromGeometry(twist$1(shape.toGeometry(), degreesPerMm));

Shape.registerMethod('twist', twist);

const voidFn = () => (shape) =>
  Shape.fromGeometry(
    rewriteTags(['compose/non-positive'], [], shape.toGeometry())
  );

Shape.registerMethod('void', voidFn);

const weld =
  (...rest) =>
  (first) => {
    const unwelded = [];
    for (const shape of [first, ...rest]) {
      // We lose the tags at this point.
      const result = toPolygonsWithHoles(shape.toGeometry());
      for (const { polygonsWithHoles } of result) {
        unwelded.push(...polygonsWithHoles);
      }
    }
    const welds = [];
    const arrangements = arrangePolygonsWithHoles(unwelded);
    console.log(`QQ/arrangements: ${JSON.stringify(arrangements)}`);
    for (const { polygonsWithHoles } of arrangements) {
      // Keep the planar grouping.
      const triangles = fromPolygonsWithHolesToTriangles(polygonsWithHoles);
      const graph = fromTrianglesToGraph(triangles);
      welds.push(taggedGraph({}, graph));
    }
    // A group of planar welds.
    return Shape.fromGeometry(taggedGroup({}, ...welds));
  };

Shape.registerMethod('weld', weld);

const assemble = (...shapes) => {
  shapes = shapes.filter((shape) => shape !== undefined);
  switch (shapes.length) {
    case 0: {
      return Shape.fromGeometry(assemble$1());
    }
    case 1: {
      return shapes[0];
    }
    default: {
      return fromGeometry(assemble$1(...shapes.map(toGeometry)));
    }
  }
};

const withFn =
  (...shapes) =>
  (shape) =>
    assemble(shape, ...shapes);

Shape.registerMethod('with', withFn);

const x =
  (...x) =>
  (shape) =>
    Shape.Group(...x.map((x) => move(x)(shape)));

Shape.registerMethod('x', x);

const y =
  (...y) =>
  (shape) =>
    Shape.Group(...y.map((y) => move(0, y)(shape)));

Shape.registerMethod('y', y);

const z =
  (...z) =>
  (shape) =>
    Shape.Group(...z.map((z) => move(0, 0, z)(shape)));

Shape.registerMethod('z', z);

const add =
  (shape, ...shapes) =>
  (shape) =>
    Shape.fromGeometry(
      union(shape.toGeometry(), ...shapes.map((shape) => shape.toGeometry()))
    );

Shape.registerMethod('add', add);

const and =
  (...shapes) =>
  (shape) =>
    Shape.fromGeometry(
      taggedGroup(
        {},
        shape.toGeometry(),
        ...shapes.map((shape) => shape.toGeometry())
      )
    );

Shape.registerMethod('and', and);

const addTo = (other) => (shape) => add(other, shape);
Shape.registerMethod('addTo', addTo);

const X = 0;
const Y = 1;
const Z = 2;

const align =
  (spec = 'xyz', origin = [0, 0, 0]) =>
  (shape) =>
    shape.size(({ max, min, center }, shape) => {
      const offset = [0, 0, 0];

      let index = 0;
      while (index < spec.length) {
        switch (spec[index++]) {
          case 'x': {
            switch (spec[index]) {
              case '>':
                offset[X] = -min[X];
                index += 1;
                break;
              case '<':
                offset[X] = -max[X];
                index += 1;
                break;
              default:
                offset[X] = -center[X];
            }
            break;
          }
          case 'y': {
            switch (spec[index]) {
              case '>':
                offset[Y] = -min[Y];
                index += 1;
                break;
              case '<':
                offset[Y] = -max[Y];
                index += 1;
                break;
              default:
                offset[Y] = -center[Y];
            }
            break;
          }
          case 'z': {
            switch (spec[index]) {
              case '>':
                offset[Z] = -min[Z];
                index += 1;
                break;
              case '<':
                offset[Z] = -max[Z];
                index += 1;
                break;
              default:
                offset[Z] = -center[Z];
            }
            break;
          }
        }
      }
      const moved = shape.move(...add$1(offset, origin));
      return moved;
    });

Shape.registerMethod('align', align);

const as =
  (...tags) =>
  (shape) =>
    Shape.fromGeometry(
      rewriteTags(
        tags.map((tag) => `user/${tag}`),
        [],
        shape.toGeometry()
      )
    );

const notAs =
  (...tags) =>
  (shape) =>
    Shape.fromGeometry(
      rewriteTags(
        [],
        tags.map((tag) => `user/${tag}`),
        shape.toGeometry()
      )
    );

Shape.registerMethod('as', as);
Shape.registerMethod('notAs', notAs);

const bend =
  (degreesPerMm = 1) =>
  (shape) =>
    Shape.fromGeometry(bend$1(shape.toGeometry(), degreesPerMm));

Shape.registerMethod('bend', bend);

const clip =
  (...shapes) =>
  (shape) =>
    Shape.fromGeometry(
      intersection(
        shape.toGeometry(),
        ...shapes.map((shape) => shape.toGeometry())
      )
    );

Shape.registerMethod('clip', clip);

const clipFrom = (other) => (shape) => clip(other, shape);
Shape.registerMethod('clipFrom', clipFrom);

const fromName = (shape, name) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName$2(name), [], shape.toGeometry()));

// Tint adds another color to the mix.
const tint =
  (...args) =>
  (shape) =>
    fromName(shape, ...args);

// FIX: Have color remove all other color tags.
const color =
  (...args) =>
  (shape) =>
    fromName(shape, ...args);

Shape.registerMethod('color', color);
Shape.registerMethod('tint', tint);

const colors =
  (op = (colors, shape) => colors) =>
  (shape) =>
    op(
      [...allTags(shape.toGeometry())]
        .filter((tag) => tag.startsWith('color/'))
        .map((tag) => tag.substring(6)),
      shape
    );

Shape.registerMethod('colors', colors);

const cut =
  (...shapes) =>
  (shape) =>
    Shape.fromGeometry(
      difference(
        shape.toGeometry(),
        ...shapes.map((shape) => shape.toGeometry())
      )
    );

Shape.registerMethod('cut', cut);

// a.cut(b) === b.cutFrom(a)

const cutFrom = (other) => (shape) => cut(other, shape);
Shape.registerMethod('cutFrom', cutFrom);

const each =
  (op = (leafs, shape) => leafs) =>
  (shape) =>
    op(
      getLeafs(shape.toDisjointGeometry()).map((leaf) =>
        Shape.fromGeometry(leaf)
      ),
      shape
    );
Shape.registerMethod('each', each);

const fuse = () => (shape) => {
  const geometry = shape.toGeometry();
  return fromGeometry(union(empty({ tags: geometry.tags }), geometry));
};
Shape.registerMethod('fuse', fuse);

const inset =
  (initial = 1, step, limit) =>
  (shape) =>
    Shape.fromGeometry(inset$1(shape.toGeometry(), initial, step, limit));

// CHECK: Using 'with' for may be confusing, but andInset looks odd.
const withInset = (initial, step, limit) => (shape) =>
  shape.and(shape.inset(initial, step, limit));

Shape.registerMethod('inset', inset);
Shape.registerMethod('withInset', withInset);

const grow = (amount) => (shape) =>
  Shape.fromGeometry(grow$1(shape.toGeometry(), amount));

Shape.registerMethod('grow', grow);

export default Shape;
export { Shape, add, addTo, align, and, as, bend, clip, clipFrom, color, colors, cut, cutFrom, drop, each, fuse, getPegCoords, grow, hasAngle, hasApothem, hasAt, hasBase, hasC1, hasC2, hasCorner1, hasDiameter, hasFrom, hasRadius, hasSides, hasTo, hasTop, hasZag, inset, keep, loadGeometry, loft, log, loop, material, minkowskiDifference, minkowskiShell, minkowskiSum, move, noVoid, notAs, offset, op, orient, pack, peg, push, remesh, rotate, rotateX, rotateY, rotateZ, rx, ry, rz, saveGeometry, scale, shapeMethod, size, sketch, smooth, split, tags, test, tint, tool, twist, voidFn, weld, withFn, withInset, withOp, x, y, z };
