import { reallyQuantizeForSpace } from './jsxcad-math-utils.js';
import { unit, dot, subtract, cross, length, orthogonal, scale, add, multiply, fromScalar, transform as transform$1 } from './jsxcad-math-vec3.js';
import { fromValues, isMirroring } from './jsxcad-math-mat4.js';

const canonicalize = ([x = 0, y = 0, z = 0, w = 0]) => [
  reallyQuantizeForSpace(x),
  reallyQuantizeForSpace(y),
  reallyQuantizeForSpace(z),
  reallyQuantizeForSpace(w),
];

/**
 * Compare the given planes for equality
 * @return {boolean} true if planes are equal
 */
const equals = (a, b) =>
  a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

/**
 * Flip the given plane (vec4)
 *
 * @param {vec4} vec - plane to flip
 * @return {vec4} flipped plane
 */
const flip = ([x = 0, y = 0, z = 0, w = 0]) => [-x, -y, -z, -w];

/**
 * Create a new plane from the given normal and point values
 * @param {Vec3} normal  - vector 3D
 * @param {Vec3}  point- vector 3D
 * @returns {Array} a new plane with properly typed values
 */
const fromNormalAndPoint = (normal, point) => {
  const u = unit(normal);
  const w = dot(point, u);
  return [u[0], u[1], u[2], w];
};

const fromPoint = ([x = 0, y = 0, z = 0, u = 0, v = 0, d = 1]) => {
  const w = dot([x, y, z], [u, v, d]);
  return [u, v, d, w];
};

/**
 * Create a new plane from the given points
 *
 * @param {Vec3} a - 3D point
 * @param {Vec3} b - 3D point
 * @param {Vec3} c - 3D point
 * @returns {Vec4} a new plane with properly typed values
 */

const fromPoints = (a, b, c) => {
  // let n = b.minus(a).cross(c.minus(a)).unit()
  // FIXME optimize later
  const ba = subtract(b, a);
  const ca = subtract(c, a);
  const cr = cross(ba, ca);
  const normal = unit(cr); // normal part
  //
  const w = dot(normal, a);
  return [normal[0], normal[1], normal[2], w];
};

const EPS = 1e-5;

/** Create a new plane from the given points like fromPoints,
 * but allow the vectors to be on one point or one line
 * in such a case a plane through the given points is constructed
 * @param {Vec3} a - 3D point
 * @param {Vec3} b - 3D point
 * @param {Vec3} c - 3D point
 * @returns {Vec4} a new plane with properly typed values
 */
const fromPointsOrthogonal = (a, b, c) => {
  let v1 = subtract(b, a);
  let v2 = subtract(c, a);
  if (length(v1) < EPS) {
    v1 = orthogonal(v2);
  }
  if (length(v2) < EPS) {
    v2 = orthogonal(v1);
  }
  let normal = cross(v1, v2);
  if (length(normal) < EPS) {
    // this would mean that v1 == v2.negated()
    v2 = orthogonal(v1);
    normal = cross(v1, v2);
  }
  normal = unit(normal);
  return fromValues(normal[0], normal[1], normal[2], dot(normal, a));
};

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;
const W$5 = 3;

// Newell's method for computing the plane of a polygon.
const fromPolygon = (polygon) => {
  const normal = [0, 0, 0];
  const reference = [0, 0, 0];
  let lastPoint = polygon[polygon.length - 1];
  for (const thisPoint of polygon) {
    normal[X$1] += (lastPoint[Y$1] - thisPoint[Y$1]) * (lastPoint[Z$1] + thisPoint[Z$1]);
    normal[Y$1] += (lastPoint[Z$1] - thisPoint[Z$1]) * (lastPoint[X$1] + thisPoint[X$1]);
    normal[Z$1] += (lastPoint[X$1] - thisPoint[X$1]) * (lastPoint[Y$1] + thisPoint[Y$1]);
    reference[X$1] += lastPoint[X$1];
    reference[Y$1] += lastPoint[Y$1];
    reference[Z$1] += lastPoint[Z$1];
    lastPoint = thisPoint;
  }
  const factor = 1 / length(normal);
  const plane = scale(factor, normal);
  plane[W$5] = (dot(reference, normal) * factor) / polygon.length;
  if (isNaN(plane[X$1])) {
    return undefined;
  } else {
    return plane;
  }
};

const W$4 = 3;

/**
 * Calculate the distance to the given point
 * @return {Number} signed distance to point
 */
const signedDistanceToPoint = (plane, point) =>
  dot(plane, point) - plane[W$4];

const W$3 = 3;
/**
 * Split the given line by the given plane.
 * Robust splitting, even if the line is parallel to the plane
 * @type {function(plane:Plane, start:Point, end:Point):Point}
 */
const splitLineByPlane = (plane, start, end) => {
  const direction = subtract(end, start);
  const lambda = (plane[W$3] - dot(plane, start)) / dot(plane, direction);
  if (Number.isNaN(lambda)) {
    return start;
  }
  return add(start, scale(lambda, direction));
};

const W$2 = 3;

/**
 * Split the given line by the given plane.
 * Robust splitting, even if the line is parallel to the plane
 * @type {function(plane:Plane, start:Point, end:Point):Point}
 */
const splitLineSegmentByPlane = (plane, start, end) => {
  const direction = subtract(end, start);
  let lambda = (plane[W$2] - dot(plane, start)) / dot(plane, direction);
  if (Number.isNaN(lambda)) lambda = 0;
  if (lambda > 1) lambda = 1;
  if (lambda < 0) lambda = 0;
  return add(start, scale(lambda, direction));
};

const W$1 = 3;

const toPolygon = (plane, size = 1e10) => {
  const v = unit(cross(plane, orthogonal(plane)));
  const u = cross(v, plane);
  const origin = scale(plane[W$1], plane);
  return [
    add(origin, scale(-size, u)),
    add(origin, scale(-size, v)),
    add(origin, scale(size, u)),
    add(origin, scale(size, v)),
  ];
};

const X = 0;
const Y = 1;
const Z = 2;
const W = 3;

const toXYPlaneTransforms = (plane, rightVector) => {
  if (plane === undefined) {
    throw Error('die');
  }
  if (rightVector === undefined) {
    rightVector = orthogonal(plane);
  }

  const v = unit(cross(plane, rightVector));
  const u = cross(v, plane);
  const p = multiply(plane, fromScalar(plane[W]));

  const to = fromValues(
    u[X],
    v[X],
    plane[X],
    0,
    u[Y],
    v[Y],
    plane[Y],
    0,
    u[Z],
    v[Z],
    plane[Z],
    0,
    0,
    0,
    -plane[W],
    1
  );

  const from = fromValues(
    u[X],
    u[Y],
    u[Z],
    0,
    v[X],
    v[Y],
    v[Z],
    0,
    plane[X],
    plane[Y],
    plane[Z],
    0,
    p[X],
    p[Y],
    p[Z],
    1
  );

  return [to, from];
};

/**
 * Transform the given plane using the given matrix
 * @return {Array} a new plane with properly typed values
 */
const transform = (matrix, plane) => {
  const ismirror = isMirroring(matrix);
  // get two vectors in the plane:
  const r = orthogonal(plane);
  const u = cross(plane, r);
  const v = cross(plane, u);
  // get 3 points in the plane:
  let point1 = multiply(plane, [plane[3], plane[3], plane[3]]);
  let point2 = add(point1, u);
  let point3 = add(point1, v);
  // transform the points:
  point1 = transform$1(matrix, point1);
  point2 = transform$1(matrix, point2);
  point3 = transform$1(matrix, point3);
  // and create a new plane from the transformed points:
  let newplane = fromPoints(point1, point2, point3);
  if (ismirror) {
    // the transform is mirroring so mirror the plane
    newplane = flip(newplane);
  }
  return newplane;
};

export { canonicalize, equals, flip, fromNormalAndPoint, fromPoint, fromPoints, fromPointsOrthogonal, fromPolygon, signedDistanceToPoint, splitLineByPlane, splitLineSegmentByPlane, toPolygon, toXYPlaneTransforms, transform };
