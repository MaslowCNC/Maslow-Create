import { reallyQuantizeForSpace, solve2Linear } from './jsxcad-math-utils.js';
import { negate, normal, scale, fromValues as fromValues$1, dot, equals as equals$1, normalize, subtract, length, add, cross, transform as transform$1 } from './jsxcad-math-vec2.js';

/**
 * Creates a new unbounded 2D line initialized with the given values.
 *
 * This is a 2d plane, similar to the [x, y, z, w] form of the 3d plane.
 *
 * @param {Number} x X coordinate of the unit normal
 * @param {Number} y Y coordinate of the unit normal
 * @param {Number} w length (positive) of the normal segment
 * @returns {line2} a new unbounded 2D line
 */
const fromValues = (x = 0, y = 1, w = 0) => [x, y, w];

const canonicalize = ([x = 0, y = 0, w = 0]) =>
  fromValues(reallyQuantizeForSpace(x), reallyQuantizeForSpace(y), reallyQuantizeForSpace(w));

/**
 * Return the direction of the given line.
 *
 * @return {vec2} a new relative vector in the direction of the line
 */
const direction = (line) => negate(normal(line));

/**
 * Return the origin of the given line.
 *
 * @param {line2} line the 2D line of reference
 * @return {vec2} the origin of the line
 */
const W = 2;

const origin = (line) => scale(line[W], line);

/**
 * Determine the closest point on the given line to the given point.
 * Thanks to @khrismuc
 *
 * @param {vec2} point the point of reference
 * @param {line2} line the 2D line for calculations
 * @returns {vec2} a new point
 */
const closestPoint = (point, line) => {
  // linear function of AB
  const a = origin(line);
  const b = direction(line);
  const m1 = (b[1] - a[1]) / (b[0] - a[0]);
  const t1 = a[1] - m1 * a[0];
  // linear function of PC
  const m2 = -1 / m1; // perpendicular
  const t2 = point[1] - m2 * point[0];
  // c.x * m1 + t1 === c.x * m2 + t2
  const x = (t2 - t1) / (m1 - m2);
  const y = m1 * x + t1;

  return fromValues$1(x, y);
};

/**
 * Calculate the distance (positive) between the given point and line
 *
 * @param {vec2} point the point of reference
 * @param {line2} line the 2D line of reference
 * @return {Number} distance between line and point
 */
const distanceToPoint = (point, line) =>
  Math.abs(dot(point, line) - line[2]);

const EPS = 1e-5;

// see if the line between p0start and p0end intersects with the line between p1start and p1end
// returns true if the lines strictly intersect, the end points are not counted!
/**
 * @param  {vec} p0start
 * @param  {vec} p0end
 * @param  {vec} p1start
 * @param  {vec} p1end
 */
const doLinesIntersect = function (p0start, p0end, p1start, p1end) {
  if (equals$1(p0end, p1start) || equals$1(p1end, p0start)) {
    const unitVec1 = normalize(subtract(p1end, p1start));
    const unitVec2 = normalize(subtract(p0end, p0start));
    let d = length(add(unitVec1, unitVec2));
    if (d < EPS) {
      return true;
    }
  } else {
    const d0 = subtract(p0end, p0start);
    const d1 = subtract(p1end, p1start);
    // FIXME These epsilons need review and testing
    if (Math.abs(cross(d0, d1)) < 1e-9) return false; // lines are parallel
    let alphas = solve2Linear(
      -d0[0],
      d1[0],
      -d0[1],
      d1[1],
      p0start[0] - p1start[0],
      p0start[1] - p1start[1]
    );
    if (
      alphas[0] > 1e-6 &&
      alphas[0] < 0.999999 &&
      alphas[1] > 1e-5 &&
      alphas[1] < 0.999999
    ) {
      return true;
    }
  }
  return false;
};

const EPS$1 = 1e-5;
const W$1 = 2;

/**
 * Compare the given 2D lines for equality
 *
 * @return {boolean} true if lines are equal
 */
const equals = (line1, line2) => {
  if (!equals$1(line1, line2)) {
    return false;
  }
  if (Math.abs(line1[W$1] - line2[W$1]) > EPS$1) {
    return false;
  }
  return true;
};

/**
 * Create a new 2D line that passes through the given points
 *
 * @param {vec2} p1 start point of the 2D line
 * @param {vec2} p2 end point of the 2D line
 * @returns {line2} a new unbounded 2D line
 */
const fromPoints = (p1, p2) => {
  const direction = subtract(p2, p1);
  const normalizedNormal = normalize(normal(direction));
  const distance = dot(p1, normalizedNormal);
  const values = fromValues(normalizedNormal[0], normalizedNormal[1], distance);
  return values;
};

/**
 * Return the point of intersection between the given lines.
 *
 * The point will have Infinity values if the lines are parallel.
 * The point will have NaN values if the lines are the same.
 *
 * @param {line2} line1 a 2D line for reference
 * @param {line2} line2 a 2D line for reference
 * @return {vec2} the point of intersection
 */
const intersect = (line1, line2) =>
  solve2Linear(line1[0], line1[1], line2[0], line2[1], line1[2], line2[2]);

// TODO: Call this flip?
/**
 * Create a new line in the opposite direction as the given.
 *
 * @param {line2} line the 2D line to reverse
 * @returns {line2} a new unbounded 2D line
 */
const reverse = (line) => {
  const normal = negate(line);
  const distance = -line[2];
  return fromValues(normal[0], normal[1], distance);
};

/**
 * Transforms the given 2D line using the given matrix.
 *
 * @param {mat4} matrix matrix to transform with
 * @param {line2} line the 2D line to transform
 * @returns {line2} a new unbounded 2D line
 */
const transform = (matrix, line) =>
  fromPoints(
    transform$1(matrix, origin(line)),
    transform$1(matrix, direction(line))
  );

/**
 * Determine the X coordinate of the given line at the Y coordinate.
 *
 * The X coordinate will be Infinity if the line is parallel to the X axis.
 *
 * @param {Number} y the Y coordinate on the line
 * @param {line2} line the 2D line of reference
 * @return {Number} the X coordinate on the line
 */
const xAtY = (y, line) => {
  // px = (distance - normal.y * y) / normal.x
  let x = (line[2] - line[1] * y) / line[0];
  if (Number.isNaN(x)) {
    const org = origin(line);
    x = org[0];
  }
  return x;
};

export { canonicalize, closestPoint, direction, distanceToPoint, doLinesIntersect, equals, fromPoints, fromValues, intersect, origin, reverse, transform, xAtY };
