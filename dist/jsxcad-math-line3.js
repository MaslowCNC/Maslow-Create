import { canonicalize as canonicalize$1, dot, subtract, add, scale, length, equals as equals$1, unit, cross, fromValues, negate, transform as transform$1 } from './jsxcad-math-vec3.js';
import { solve2Linear } from './jsxcad-math-utils.js';

/**
 * Produce a canonical version of a ray3.
 * @param {ray3} the ray
 * @returns {ray3} the canonical ray3
 */
const canonicalize = ([point, unitDirection]) => [
  canonicalize$1(point),
  canonicalize$1(unitDirection),
];

/**
 * Determine the closest point on the given line to the given point.
 *
 * @param {vec3} point the point of reference
 * @param {line3} line the 3D line for calculations
 * @returns {vec3} a new point
 */
const closestPoint = (point, [lpoint, ldirection]) => {
  const a = dot(subtract(point, lpoint), ldirection);
  const b = dot(ldirection, ldirection);
  const t = a / b;
  return add(lpoint, scale(t, ldirection));
};

// From: http://paulbourke.net/geometry/pointlineplane/

/*
//   Calculate the line segment PaPb that is the shortest route between
//   two lines P1P2 and P3P4. Calculate also the values of mua and mub where
//      Pa = P1 + mua (P2 - P1)
//      Pb = P3 + mub (P4 - P3)
//   Return FALSE if no solution exists.
int LineLineIntersect(
   XYZ p1,XYZ p2,XYZ p3,XYZ p4,XYZ *pa,XYZ *pb,
   double *mua, double *mub)
{
   XYZ p13,p43,p21;
   double d1343,d4321,d1321,d4343,d2121;
   double numer,denom;

   p13.x = p1.x - p3.x;
   p13.y = p1.y - p3.y;
   p13.z = p1.z - p3.z;
   p43.x = p4.x - p3.x;
   p43.y = p4.y - p3.y;
   p43.z = p4.z - p3.z;

   if (ABS(p43.x) < EPS && ABS(p43.y) < EPS && ABS(p43.z) < EPS)
      return(FALSE);

   p21.x = p2.x - p1.x;
   p21.y = p2.y - p1.y;
   p21.z = p2.z - p1.z;

   if (ABS(p21.x) < EPS && ABS(p21.y) < EPS && ABS(p21.z) < EPS)
      return(FALSE);

   d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
   d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
   d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
   d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
   d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

   denom = d2121 * d4343 - d4321 * d4321;

   if (ABS(denom) < EPS)
      return(FALSE);

   numer = d1343 * d4321 - d1321 * d4343;

   *mua = numer / denom;
   *mub = (d1343 + d4321 * (*mua)) / d4343;

   pa->x = p1.x + *mua * p21.x;
   pa->y = p1.y + *mua * p21.y;
   pa->z = p1.z + *mua * p21.z;
   pb->x = p3.x + *mub * p43.x;
   pb->y = p3.y + *mub * p43.y;
   pb->z = p3.z + *mub * p43.z;

   return(TRUE);
}
*/

const EPSILON = 1e-5;
const X = 0;
const Y = 1;
const Z = 2;

/**
 * Calculate the line segment PaPb that is the shortest route between
 * two lines P1-P2 and P3-P4.
 *
 * Calculate also the values of mua and mub where
 *   Pa = P1 + mua (P2 - P1)
 *   Pb = P3 + mub (P4 - P3)
 *
 * Return undefined if no solution exists.
 * Otherwise return the shortest connecting line segment.
 */

const closestSegmentBetweenLines = ([p1, p2], [p3, p4]) => {
  const p13 = [p1[X] - p3[X], p1[Y] - p3[Y], p1[Z] - p3[Z]];
  const p43 = [p4[X] - p3[X], p4[Y] - p3[Y], p4[Z] - p3[Z]];

  if (
    Math.abs(p43[X]) < EPSILON &&
    Math.abs(p43[Y]) < EPSILON &&
    Math.abs(p43[Z]) < EPSILON
  ) {
    return [null, null];
  }

  const p21 = [p2[X] - p1[X], p2[Y] - p1[Y], p2[Z] - p1[Z]];

  if (
    Math.abs(p21[X]) < EPSILON &&
    Math.abs(p21[Y]) < EPSILON &&
    Math.abs(p21[Z]) < EPSILON
  ) {
    return [null, null];
  }

  const d1343 = p13[X] * p43[X] + p13[Y] * p43[Y] + p13[Z] * p43[Z];
  const d4321 = p43[X] * p21[X] + p43[Y] * p21[Y] + p43[Z] * p21[Z];
  const d1321 = p13[X] * p21[X] + p13[Y] * p21[Y] + p13[Z] * p21[Z];
  const d4343 = p43[X] * p43[X] + p43[Y] * p43[Y] + p43[Z] * p43[Z];
  const d2121 = p21[X] * p21[X] + p21[Y] * p21[Y] + p21[Z] * p21[Z];

  const denominator = d2121 * d4343 - d4321 * d4321;

  if (Math.abs(denominator) < EPSILON) {
    return [null, null];
  }

  const numerator = d1343 * d4321 - d1321 * d4343;

  const mua = numerator / denominator;
  const mub = (d1343 + d4321 * mua) / d4343;

  const pa = [p1[X] + mua * p21[X], p1[Y] + mua * p21[Y], p1[Z] + mua * p21[Z]];
  const pb = [p3[X] + mub * p43[X], p3[Y] + mub * p43[Y], p3[Z] + mub * p43[Z]];

  return [pa, pb, mua, mub];
};

/**
 * Return the direction of the given line.
 *
 * @return {vec3} the relative vector in the direction of the line
 */
const direction = ([point, unitDirection]) => unitDirection;

/**
 * Calculate the distance (positive) between the given point and line
 *
 * @param {vec3} point the point of reference
 * @param {line3} line the 3D line of reference
 * @return {Number} distance between line and point
 */
const distanceToPoint = (point, line) => {
  const closest = closestPoint(point, line);
  const distancevector = subtract(point, closest);
  return length(distancevector);
};

const EPS$1 = 1e-5;

/**
 * Compare the given 3D lines for equality
 *
 * @return {boolean} true if lines are equal
 */
const equals = (line1, [point2, unit2]) => {
  const [, unit1] = line1;

  // compare directions (unit vectors)
  if (!equals$1(unit1, unit2)) return false;

  // See if the reference point of the second line is on the first line.
  let distance = distanceToPoint(point2, line1);
  if (distance >= EPS$1) return false;

  return true;
};

/**
 * Create a line in 3D space from the given data.
 *
 * The point can be any random point on the line.
 * The direction must be a vector with positive or negative distance from the point.
 * See the logic of fromPoints for appropriate values.
 *
 * @param {vec3} point start point of the line segment
 * @param {vec3} direction direction of the line segment
 * @returns {line3} a new unbounded 3D line
 */
const fromPointAndDirection = (point, direction) => [
  point,
  unit(direction),
];

const EPS = 1e-5;

const fromPlanes = (plane1, plane2) => {
  let direction = cross(plane1, plane2);
  let length$1 = length(direction);
  if (length$1 < EPS) {
    throw new Error('parallel planes do not intersect');
  }
  length$1 = 1.0 / length$1;
  direction = scale(length$1, direction);

  const absx = Math.abs(direction[0]);
  const absy = Math.abs(direction[1]);
  const absz = Math.abs(direction[2]);
  let origin;
  let r;
  if (absx >= absy && absx >= absz) {
    // find a point p for which x is zero
    r = solve2Linear(
      plane1[1],
      plane1[2],
      plane2[1],
      plane2[2],
      plane1[3],
      plane2[3]
    );
    origin = fromValues(0, r[0], r[1]);
  } else if (absy >= absx && absy >= absz) {
    // find a point p for which y is zero
    r = solve2Linear(
      plane1[0],
      plane1[2],
      plane2[0],
      plane2[2],
      plane1[3],
      plane2[3]
    );
    origin = fromValues(r[0], 0, r[1]);
  } else {
    // find a point p for which z is zero
    r = solve2Linear(
      plane1[0],
      plane1[1],
      plane2[0],
      plane2[1],
      plane1[3],
      plane2[3]
    );
    origin = fromValues(r[0], r[1], 0);
  }
  return fromPointAndDirection(origin, direction);
};

/**
 * Creates a new 3D line that passes through the given points.
 *
 * @param {vec3} p1 start point of the line segment
 * @param {vec3} p2 end point of the line segment
 * @returns {line3} a new unbounded 3D line
 */
const fromPoints = (p1, p2) => {
  const direction = subtract(p2, p1);
  return fromPointAndDirection(p1, direction);
};

const W = 3;

/**
 * Determine the closest point on the given plane to the given line.
 *
 * The point of intersection will be invalid if parallel to the plane, e.g. NaN.
 *
 * @param {plane} plane the plane of reference
 * @param {line3} line the 3D line of reference
 * @returns {vec3} a new point
 */
const intersectPointOfLineAndPlane = (plane, [origin, direction]) => {
  // plane: plane.normal * p = plane.w
  const pw = plane[W];

  // point: p = line.point + labda * line.direction
  const lambda = (pw - dot(plane, origin)) / dot(plane, direction);

  const point = add(origin, scale(lambda, direction));
  return point;
};

/**
 * Return the origin of the given line.
 *
 * @param {line3} line the 3D line of reference
 * @return {vec3} the origin of the line
 */
const origin = ([origin, unitDirection]) => origin;

/**
 * Create a new line in the opposite direction as the given.
 *
 * @param {line3} line the 3D line to reverse
 * @returns {line3} a new unbounded 3D line
 */
const reverse = ([point, unitDirection]) =>
  fromPointAndDirection(point, negate(unitDirection));

/**
 * Transforms the given 3D line using the given matrix.
 *
 * @param {mat4} matrix matrix to transform with
 * @param {line3} line the 3D line to transform
 * @returns {line3} a new unbounded 3D line
 */
const transform = (matrix, [point, direction]) => {
  const pointPlusDirection = add(point, direction);
  const newpoint = transform$1(matrix, point);
  const newPointPlusDirection = transform$1(matrix, pointPlusDirection);
  const newdirection = subtract(newPointPlusDirection, newpoint);
  return fromPointAndDirection(newpoint, newdirection);
};

export { canonicalize, closestPoint, closestSegmentBetweenLines, direction, distanceToPoint, equals, fromPlanes, fromPointAndDirection, fromPoints, intersectPointOfLineAndPlane, origin, reverse, transform };
