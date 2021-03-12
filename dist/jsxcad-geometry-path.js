import { fromTranslation, fromXRotation, fromYRotation, fromZRotation, fromScaling } from './jsxcad-math-mat4.js';
import { transform as transform$1, equals, canonicalize as canonicalize$1 } from './jsxcad-math-vec3.js';

const isClosed = (path) => path.length === 0 || path[0] !== null;
const isOpen = (path) => !isClosed(path);

// A path point may be supplemented by a 'forward' and a 'right' vector
// allowing it to define a plane with a rotation.

const transform = (matrix, path) => {
  const transformedPath = [];
  if (isOpen(path)) {
    transformedPath.push(null);
  }
  for (let nth = isOpen(path) ? 1 : 0; nth < path.length; nth++) {
    const point = path[nth];
    const transformedPoint = transform$1(matrix, point);
    if (point.length > 3) {
      const forward = point.slice(3, 6);
      const transformedForward = transform$1(matrix, forward);
      transformedPoint.push(...transformedForward);
    }
    if (point.length > 6) {
      const right = point.slice(6, 9);
      const transformedRight = transform$1(matrix, right);
      transformedPoint.push(...transformedRight);
    }
    transformedPath.push(transformedPoint);
  }
  return transformedPath;
};

const translate = (vector, path) =>
  transform(fromTranslation(vector), path);
const rotateX = (radians, path) =>
  transform(fromXRotation(radians), path);
const rotateY = (radians, path) =>
  transform(fromYRotation(radians), path);
const rotateZ = (radians, path) =>
  transform(fromZRotation(radians), path);
const scale = (vector, path) => transform(fromScaling(vector), path);

const createClosedPath = (...points) => [...points];

const createOpenPath = (...points) => [null, ...points];

const assertUnique = (path) => {
  let last = null;
  for (const point of path) {
    if (point === undefined) {
      throw Error(`die: ${JSON.stringify(path)}`);
    }
    if (last !== null && equals(point, last)) {
      throw Error(`die: ${JSON.stringify(path)}`);
    }
    last = point;
  }
};

const assertGood = (path) => {
  assertUnique(path);
};

const canonicalizePoint = (point, index) => {
  if (point === null) {
    if (index !== 0) throw Error('Path has null not at head');
    return point;
  } else {
    return canonicalize$1(point);
  }
};

const canonicalize = (path) => path.map(canonicalizePoint);

const close = (path) => (isClosed(path) ? path : path.slice(1));

const concatenate = (...paths) => {
  const result = [null, ...[].concat(...paths.map(close))];
  return result;
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

const flip = (path) => {
  if (path[0] === null) {
    return [null, ...path.slice(1).reverse()];
  } else {
    return path.slice().reverse();
  }
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

const X = 0;
const Y = 1;

/**
 * Measure the area of a path as though it were a polygon.
 * A negative area indicates a clockwise path, and a positive area indicates a counter-clock-wise path.
 * See: http://mathworld.wolfram.com/PolygonArea.html
 * @returns {Number} The area the path would have if it were a polygon.
 */
const measureArea = (path) => {
  let last = path.length - 1;
  let current = path[0] === null ? 1 : 0;
  let twiceArea = 0;
  for (; current < path.length; last = current++) {
    twiceArea +=
      path[last][X] * path[current][Y] - path[last][Y] * path[current][X];
  }
  return twiceArea / 2;
};

const isClockwise = (path) => measureArea(path) < 0;

const isCounterClockwise = (path) => measureArea(path) > 0;

const open = (path) => (isClosed(path) ? [null, ...path] : path);

const toGeneric = (path) => [...path];

const toPolygon = (path) => {
  if (path.isPolygon !== true) {
    if (path.length < 3) throw Error('Path would form degenerate polygon.');
    if (path[0] === null) throw Error('Only closed paths can be polygons.');
    // FIX: Check for coplanarity.
    path.isPolygon = true;
  }
  return path;
};

const toSegments = (options = {}, path) => {
  if (path.length < 3 && path[0] === null) {
    return [];
  } else if (path.length < 2) {
    return [];
  }
  const segments = [];
  if (path[0] !== null) {
    segments.push([path[path.length - 1], path[0]]);
    segments.push([path[0], path[1]]);
  }
  for (let nth = 2; nth < path.length; nth++) {
    segments.push([path[nth - 1], path[nth]]);
  }
  if (segments.some((segment) => segment[1] === undefined)) {
    throw Error('die');
  }
  return segments;
};

const isZ0Point = ([x = 0, y = 0, z = 0]) => z === 0;

const toZ0Polygon = (path) => {
  if (path.isZ0Polygon !== true) {
    if (path.length < 3) throw Error('Path would form degenerate polygon.');
    if (path[0] === null) throw Error('Only closed paths can be polygons.');
    if (!path.every(isZ0Point)) {
      throw Error(
        `z != 0: ${JSON.stringify(path.filter((path) => !isZ0Point(path)))}`
      );
    }
    path.isZ0Polygon = true;
  }
  return path;
};

export { assertGood, assertUnique, canonicalize, close, concatenate, createClosedPath, createOpenPath, deduplicate, flip, getEdges, isClockwise, isClosed, isCounterClockwise, isOpen, measureArea, open, rotateX, rotateY, rotateZ, scale, toGeneric, toPolygon, toSegments, toZ0Polygon, transform, translate };
