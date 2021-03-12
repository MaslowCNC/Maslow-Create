import { fromXRotation, fromYRotation, fromZRotation, fromScaling, fromTranslation } from './jsxcad-math-mat4.js';
import { canonicalize as canonicalize$1, flip as flip$1, fromPoints, map as map$1, transform as transform$1 } from './jsxcad-math-poly3.js';
import { equals, canonicalize as canonicalize$2, lerp, dot, subtract, scale as scale$1, add, distance, squaredDistance } from './jsxcad-math-vec3.js';
import { isClosed } from './jsxcad-geometry-path.js';
import { fromPolygon } from './jsxcad-math-plane.js';

const isDegenerate = (polygon) => {
  for (let nth = 0; nth < polygon.length; nth++) {
    if (equals(polygon[nth], polygon[(nth + 1) % polygon.length])) {
      return true;
    }
  }
  return false;
};

const canonicalize = (polygons) => {
  const canonicalized = [];
  for (let polygon of polygons) {
    polygon = canonicalize$1(polygon);
    if (!isDegenerate(polygon)) {
      canonicalized.push(polygon);
    }
  }
  return canonicalized;
};

// Edge Properties.
const START = 0;
const END = 1;

const lexicographcalPointOrder = ([aX, aY, aZ], [bX, bY, bZ]) => {
  if (aX < bX) {
    return -1;
  }
  if (aX > bX) {
    return 1;
  }
  if (aY < bY) {
    return -1;
  }
  if (aY > bY) {
    return 1;
  }
  if (aZ < bZ) {
    return -1;
  }
  if (aZ > bZ) {
    return 1;
  }
  return 0;
};

const toLoops = ({ allowOpenPaths = false }, edges) => {
  const extractSuccessor = (edges, start) => {
    // FIX: Use a binary search to take advantage of the sorting of the edges.
    for (let nth = 0; nth < edges.length; nth++) {
      const candidate = edges[nth];
      if (equals(candidate[START], start)) {
        edges.splice(nth, 1);
        return candidate;
      }
    }
    // Given manifold geometry, there must always be a successor.
    throw Error('Non-manifold');
  };

  // Sort the edges so that deduplication is efficient.
  edges.sort(lexicographcalPointOrder);

  // Assemble the edges into loops which are closed paths.
  const loops = [];
  while (edges.length > 0) {
    let edge = edges.shift();
    const loop = [edge[START]];
    try {
      while (!equals(edge[END], loop[0])) {
        edge = extractSuccessor(edges, edge[END]);
        loop.push(edge[START]);
      }
    } catch (e) {
      if (allowOpenPaths) {
        // FIX: Check the error.
        loop.unshift(null);
      } else {
        throw e;
      }
    }
    loops.push(loop);
  }

  return loops;
};

const EPSILON = 1e-5;

// Point Classification.
const COPLANAR = 0;
const FRONT = 1;
const BACK = 2;

// Plane Properties.
const W = 3;

const toType = (plane, point) => {
  let t = dot(plane, point) - plane[W];
  if (t < -EPSILON) {
    return BACK;
  } else if (t > EPSILON) {
    return FRONT;
  } else {
    return COPLANAR;
  }
};

const spanPoint = (plane, startPoint, endPoint) => {
  let t =
    (plane[W] - dot(plane, startPoint)) /
    dot(plane, subtract(endPoint, startPoint));
  return canonicalize$2(lerp(t, startPoint, endPoint));
};

/**
 * Takes a cross-section of a triangulated solid at a plane, yielding surface defining loops
 * in that plane.
 *
 * FIX: Make sure this works properly for solids with holes in them, etc.
 * FIX: Figure out where the duplicate paths are coming from and see if we can avoid deduplication.
 */
const cutTrianglesByPlane = (
  { allowOpenPaths = false },
  plane,
  triangles
) => {
  let edges = [];
  const addEdge = (start, end) => {
    edges.push([canonicalize$2(start), canonicalize$2(end)]);
  };

  // Find the edges along the plane and fold them into paths to produce a set of closed loops.
  for (let nth = 0; nth < triangles.length; nth++) {
    const triangle = triangles[nth];
    const [a, b, c] = triangle;
    const [aType, bType, cType] = [
      toType(plane, a),
      toType(plane, b),
      toType(plane, c),
    ];

    switch (aType) {
      case FRONT:
        switch (bType) {
          case FRONT:
            switch (cType) {
              case FRONT:
                // No intersection.
                break;
              case COPLANAR:
                // Corner touches.
                break;
              case BACK:
                // b-c down c-a up
                addEdge(spanPoint(plane, b, c), spanPoint(plane, c, a));
                break;
            }
            break;
          case COPLANAR:
            switch (cType) {
              case FRONT:
                // Corner touches.
                break;
              case COPLANAR:
                // b-c along plane.
                addEdge(b, c);
                break;
              case BACK:
                // down at b, up c-a.
                addEdge(b, spanPoint(plane, c, a));
                break;
            }
            break;
          case BACK:
            switch (cType) {
              case FRONT:
                // a-b down, b-c up.
                addEdge(spanPoint(plane, a, b), spanPoint(plane, b, c));
                break;
              case COPLANAR:
                // a-b down, c up.
                addEdge(spanPoint(plane, a, b), c);
                break;
              case BACK:
                // a-b down, c-a up.
                addEdge(spanPoint(plane, a, b), spanPoint(plane, c, a));
                break;
            }
            break;
        }
        break;
      case COPLANAR:
        switch (bType) {
          case FRONT:
            switch (cType) {
              case FRONT:
                // Corner touches.
                break;
              case COPLANAR:
                // c-a along plane.
                addEdge(c, a);
                break;
              case BACK:
                // down at b-c, up at a
                addEdge(spanPoint(plane, b, c), a);
                break;
            }
            break;
          case COPLANAR:
            switch (cType) {
              case FRONT:
                // a-b along plane.
                addEdge(a, b);
                break;
            }
            break;
          case BACK:
            switch (cType) {
              case FRONT:
                // down at a, up at b-c.
                addEdge(a, spanPoint(plane, b, c));
                break;
            }
            break;
        }
        break;
      case BACK:
        switch (bType) {
          case FRONT:
            switch (cType) {
              case FRONT:
                // down at c-a, up at a-b
                addEdge(spanPoint(plane, c, a), spanPoint(plane, a, b));
                break;
              case COPLANAR:
                // down at c, up at a-b
                addEdge(c, spanPoint(plane, a, b));
                break;
              case BACK:
                // down at b-c, up at a-b.
                addEdge(spanPoint(plane, b, c), spanPoint(plane, a, b));
                break;
            }
            break;
          case COPLANAR:
            switch (cType) {
              case FRONT:
                // down at c-a, up at b.
                addEdge(spanPoint(plane, c, a), b);
                break;
            }
            break;
          case BACK:
            switch (cType) {
              case FRONT:
                // down at c-a, up at b-c.
                addEdge(spanPoint(plane, c, a), spanPoint(plane, b, c));
                break;
            }
            break;
        }
        break;
    }
  }

  return toLoops({ allowOpenPaths }, edges);
};

const measureBoundingBox = (polygons) => {
  if (polygons.measureBoundingBox === undefined) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const path of polygons) {
      for (const point of path) {
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

const iota = 1e-5;
const X = 0;
const Y = 1;
const Z = 2;

// Requires a conservative gap.
const doesNotOverlap = (a, b) => {
  if (a.length === 0 || b.length === 0) {
    return true;
  }
  const [minA, maxA] = measureBoundingBox(a);
  const [minB, maxB] = measureBoundingBox(b);
  if (maxA[X] <= minB[X] - iota * 10) {
    return true;
  }
  if (maxA[Y] <= minB[Y] - iota * 10) {
    return true;
  }
  if (maxA[Z] <= minB[Z] - iota * 10) {
    return true;
  }
  if (maxB[X] <= minA[X] - iota * 10) {
    return true;
  }
  if (maxB[Y] <= minA[Y] - iota * 10) {
    return true;
  }
  if (maxB[Z] <= minA[Z] - iota * 10) {
    return true;
  }
  return false;
};

const eachPoint = (options = {}, thunk, polygons) => {
  for (const polygon of polygons) {
    for (const point of polygon) {
      thunk(point);
    }
  }
};

/**
 * Transforms each polygon of Polygons.
 *
 * @param {Polygons} original - the Polygons to transform.
 * @param {Function} [transform=identity] - function used to transform the polygons.
 * @returns {Polygons} a copy with transformed polygons.
 */
const map = (original, transform) => {
  if (original === undefined) {
    original = [];
  }
  if (transform === undefined) {
    transform = (_) => _;
  }
  return original.map((polygon) => transform(polygon));
};

const flip = (polygons) => map(polygons, flip$1);

const fromPointsAndPaths = ({ points = [], paths = [] }) => {
  const polygons = [];
  for (const path of paths) {
    polygons.push(fromPoints(path.map((nth) => points[nth])));
  }
  return polygons;
};

const isTriangle = (path) => isClosed(path) && path.length === 3;

/** Measure the bounding sphere of the given poly3
 * @param {poly3} the poly3 to measure
 * @returns computed bounding sphere; center (vec3) and radius
 */
const measureBoundingSphere = (polygons) => {
  if (polygons.boundingSphere === undefined) {
    const [min, max] = measureBoundingBox(polygons);
    const center = scale$1(0.5, add(min, max));
    const radius = distance(center, max);
    polygons.boundingSphere = [center, radius];
  }
  return polygons.boundingSphere;
};

// const EPSILON = 1e-5;
const EPSILON2 = 1e-10;

const pushWhenValid = (out, points, expectedPlane) => {
  const validated = [];
  const l = points.length;
  for (let i = 0; i < l; i++) {
    if (squaredDistance(points[i], points[(i + 1) % l]) > EPSILON2) {
      validated.push(points[i]);
    }
  }
  if (validated.length < 3) {
    return;
  }
  const plane = fromPolygon(validated);
  if (plane === undefined) {
    return;
  }
  if (expectedPlane !== undefined) {
    validated.plane = expectedPlane;
  }
  out.push(validated);
  return validated;
};

const toGeneric = (polygons) => map(polygons, map$1);

const toPoints = (options = {}, polygons) => {
  const points = [];
  eachPoint(options, (point) => points.push(point), polygons);
  return points;
};

const toTriangles = (options = {}, paths) => {
  const triangles = [];
  for (const path of paths) {
    for (let nth = 2; nth < path.length; nth++) {
      triangles.push([path[0], path[nth - 1], path[nth]]);
    }
  }
  return triangles;
};

const transform = (matrix, polygons) =>
  polygons.map((polygon) => transform$1(matrix, polygon));

const rotateX = (angle, polygons) => transform(fromXRotation(angle), polygons);
const rotateY = (angle, polygons) => transform(fromYRotation(angle), polygons);
const rotateZ = (angle, polygons) => transform(fromZRotation(angle), polygons);
const scale = (vector, polygons) => transform(fromScaling(vector), polygons);
const translate = (vector, polygons) =>
  transform(fromTranslation(vector), polygons);

export { canonicalize, cutTrianglesByPlane, doesNotOverlap, eachPoint, flip, fromPointsAndPaths, isTriangle, map, measureBoundingBox, measureBoundingSphere, pushWhenValid, rotateX, rotateY, rotateZ, scale, toGeneric, toLoops, toPoints, toTriangles, transform, translate };
