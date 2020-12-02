import { canonicalize as canonicalize$1, cross, subtract, dot, fromValues, min, max, scale, add, distance, transform as transform$1 } from './jsxcad-math-vec3.js';
import { fromPolygon, signedDistanceToPoint, equals } from './jsxcad-math-plane.js';
import { isMirroring } from './jsxcad-math-mat4.js';

const canonicalize = (polygon) => polygon.map(canonicalize$1);

/**
 * Emits the edges of a polygon in order.
 *
 * @param {function} the function to call with each edge in order.
 * @param {Polygon} the polygon of which to emit the edges.
 */

const eachEdge = (options = {}, thunk, polygon) => {
  if (polygon.length >= 2) {
    for (let nth = 1; nth < polygon.length; nth++) {
      thunk(polygon[nth - 1], polygon[nth]);
    }
    thunk(polygon[polygon.length - 1], polygon[0]);
  }
};

/**
 * Flip the give polygon to face the opposite direction.
 *
 * @param {poly3} polygon - the polygon to flip
 * @returns {poly3} a new poly3
 */
const flip = (polygon) => [...polygon].reverse();

/**
 * Create a Polygon from the given points.
 * @type {function(Point[], Plane):Polygon}
 */
const fromPoints = (points, planeof) => [...points];

const toPlane = (polygon) => {
  if (polygon.plane === undefined) {
    polygon.plane = fromPolygon(polygon);
  }
  return polygon.plane;
};

/**
 * Check whether the polygon is convex.
 * @returns {boolean}
 */
const areVerticesConvex = (vertices, plane) => {
  if (plane === undefined) {
    return false;
  }
  const numvertices = vertices.length;
  if (numvertices > 3) {
    let prevprevpos = vertices[numvertices - 2];
    let prevpos = vertices[numvertices - 1];
    for (let i = 0; i < numvertices; i++) {
      const pos = vertices[i];
      if (!isConvexPoint(prevprevpos, prevpos, pos, plane)) {
        return false;
      }
      prevprevpos = prevpos;
      prevpos = pos;
    }
  }
  return true;
};

// calculate whether three points form a convex corner
//  prevpoint, point, nextpoint: the 3 coordinates (Vector3D instances)
//  normal: the normal vector of the plane
const isConvexPoint = (prevpoint, point, nextpoint, plane) => {
  const crossproduct = cross(
    subtract(point, prevpoint),
    subtract(nextpoint, point)
  );
  // The plane of a polygon is structurally equivalent to its normal.
  const crossdotnormal = dot(crossproduct, plane);
  // CHECK: 0 or EPS?
  return crossdotnormal >= 0;
};

const isConvex = (polygon) =>
  areVerticesConvex(polygon, toPlane(polygon));

const isCoplanar = (polygon) => {
  const plane = toPlane(polygon);
  for (const point of polygon) {
    if (signedDistanceToPoint(plane, point) > 1e-5) {
      return false;
    }
  }
  return true;
};

const isStrictlyCoplanar = (polygon) => {
  const plane = toPlane(polygon);
  for (let nth = 1; nth < polygon.length - 2; nth++) {
    if (!equals(plane, toPlane(polygon.slice(nth)))) {
      return false;
    }
  }
  return true;
};

/**
 * Transforms the vertices of a polygon, producing a new poly3.
 *
 * The polygon does not need to be a poly3, but may be any array of
 * points. The points being represented as arrays of values.
 *
 * If the original has a 'plane' property, the result will have a clone
 * of the plane.
 *
 * @param {Function} [transform=vec3.clone] - function used to transform the vertices.
 * @returns {Array} a copy with transformed vertices and copied properties.
 *
 * @example
 * const vertices = [ [0, 0, 0], [0, 10, 0], [0, 10, 10] ]
 * let observed = poly3.map(vertices)
 */
const map = (original, transform) => {
  if (original === undefined) {
    original = [];
  }
  if (transform === undefined) {
    transform = (_) => _;
  }
  return original.map((vertex) => transform(vertex));
};

// measure the area of the given poly3 (3D planar polygon)
// translated from the orginal C++ code from Dan Sunday
// 2000 softSurfer http://geomalgorithms.com
const measureArea = (poly3) => {
  let area = poly3.area;
  if (area !== undefined) {
    return area;
  }

  area = 0;
  const n = poly3.length;
  if (n < 3) {
    return 0; // degenerate polygon
  }
  const vertices = poly3;

  // calculate a real normal
  const a = vertices[0];
  const b = vertices[1];
  const c = vertices[2];
  const ba = subtract(b, a);
  const ca = subtract(c, a);
  const normal = cross(ba, ca);
  // let normal = b.minus(a).cross(c.minus(a))
  // let normal = poly3.plane.normal // unit based normal, CANNOT use

  // determin direction of projection
  const ax = Math.abs(normal[0]);
  const ay = Math.abs(normal[1]);
  const az = Math.abs(normal[2]);
  const an = Math.sqrt(ax * ax + ay * ay + az * az); // length of normal

  let coord = 3; // ignore Z coordinates
  if (ax > ay && ax > az) {
    coord = 1; // ignore X coordinates
  } else if (ay > az) {
    coord = 2; // ignore Y coordinates
  }

  let h = 0;
  let i = 1;
  let j = 2;
  switch (coord) {
    case 1: // ignore X coordinates
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1;
        j = (i + 1) % n;
        area += vertices[i][1] * (vertices[j][2] - vertices[h][2]);
      }
      area += vertices[0][1] * (vertices[1][2] - vertices[n - 1][2]);
      // scale to get area
      area *= an / (2 * normal[0]);
      break;

    case 2: // ignore Y coordinates
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1;
        j = (i + 1) % n;
        area += vertices[i][2] * (vertices[j][0] - vertices[h][0]);
      }
      area += vertices[0][2] * (vertices[1][0] - vertices[n - 1][0]);
      // scale to get area
      area *= an / (2 * normal[1]);
      break;

    case 3: // ignore Z coordinates
    default:
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1;
        j = (i + 1) % n;
        area += vertices[i][0] * (vertices[j][1] - vertices[h][1]);
      }
      area += vertices[0][0] * (vertices[1][1] - vertices[n - 1][1]);
      // scale to get area
      area *= an / (2 * normal[2]);
      break;
  }

  poly3.area = area;
  return area;
};

// returns an array of two Vector3Ds (minimum coordinates and maximum coordinates)
const measureBoundingBox = (poly3) => {
  const cached = poly3.boundingBox;
  if (cached === undefined) {
    const vertices = poly3;
    const numvertices = vertices.length;
    let min$1 = numvertices === 0 ? fromValues() : vertices[0];
    let max$1 = min$1;
    for (let i = 1; i < numvertices; i++) {
      min$1 = min(min$1, vertices[i]);
      max$1 = max(max$1, vertices[i]);
    }
    poly3.boundingBox = [min$1, max$1];
    return poly3.boundingBox;
  }
  return cached;
};

/** Measure the bounding sphere of the given poly3
 * @param {poly3} the poly3 to measure
 * @returns computed bounding sphere; center (vec3) and radius
 */
const measureBoundingSphere = (poly3) => {
  const box = measureBoundingBox(poly3);
  const center = scale(0.5, add(box[0], box[1]));
  const radius = distance(center, box[1]);
  return [center, radius];
};

/**
 * Converts the polygon to an ordered list of edges.
 *
 * @param {Polygon}
 * @returns {Edges}
 */

const toEdges = (options = {}, polygon) => {
  let edges = [];
  eachEdge({}, (a, b) => edges.push([a, b]), polygon);
  return edges;
};

/**
 * Returns the polygon as an array of points.
 * @param {Polygon}
 * @returns {Points}
 */

const toPoints = (polygon) => polygon;

// Affine transformation of polygon. Returns a new polygon.
const transform = (matrix, polygon) => {
  const transformed = map(polygon, (vertex) => transform$1(matrix, vertex));
  if (isMirroring(matrix)) {
    // Reverse the order to preserve the orientation.
    transformed.reverse();
  }
  return transformed;
};

export { canonicalize, eachEdge, flip, fromPoints, isConvex, isCoplanar, isStrictlyCoplanar, map, measureArea, measureBoundingBox, measureBoundingSphere, toEdges, toPlane, toPoints, transform };
