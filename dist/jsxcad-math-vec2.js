import { radToDeg, reallyQuantizeForSpace } from './jsxcad-math-utils.js';

/**
 * Calculates the absolute value of the give vector
 *
 * @param {vec2} vec - given value
 * @returns {vec2} absolute value of the vector
 */
const abs = ([x, y]) => [Math.abs(x), Math.abs(y)];

/**
 * Adds two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
const add = ([ax, ay], [bx, by]) => [ax + bx, ay + by];

// y=sin, x=cos
const angleRadians = ([x, y]) => Math.atan2(y, x);

const angleDegrees = (vector) => radToDeg(angleRadians(vector));

const canonicalize = ([x, y]) => [reallyQuantizeForSpace(x), reallyQuantizeForSpace(y)];

/**
 * Computes the cross product (3D) of two vectors
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} cross product
 */
// Alternatively return vec3.cross(out, vec3.fromVec2(a), vec3.fromVec2(b))
const cross = (a, b) => [0, 0, a[0] * b[1] - a[1] * b[0]];

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
const distance = ([ax, ay], [bx, by]) => {
  const x = bx - ax;
  const y = by - ay;
  return Math.sqrt(x * x + y * y);
};

/**
 * Divides two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
const divide = ([ax, ay], [bx, by]) => [ax / bx, ay / by];

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
const dot = ([ax, ay], [bx, by]) => ax * bx + ay * by;

const equals = ([ax, ay], [bx, by]) => ax === bx && ay === by;

const fromAngleDegrees = (degrees) => {
  const radians = (Math.PI * degrees) / 180;
  return [Math.cos(radians), Math.sin(radians)];
};

const fromAngleRadians = (radians) => [
  Math.cos(radians),
  Math.sin(radians),
];

/**
 * Creates a new vec2 from the point given.
 * Missing ranks are implicitly zero.
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
const fromPoint = ([x = 0, y = 0]) => [x, y];

/** Create a vec2 from a single scalar value
 * @param  {Float} scalar
 * @returns {Vec2} a new vec2
 */
const fromScalar = (scalar) => [scalar, scalar];

/**
 * Creates a new vec3 initialized with the given values
 * Any missing ranks are implicitly zero.
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec3} a new 2D vector
 */
const fromValues = (x = 0, y = 0) => [x, y];

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
const length = ([x, y]) => Math.sqrt(x * x + y * y);

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {Number} t interpolation amount between the two inputs
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
const lerp = (t, [ax, ay], [bx, by]) => [
  ax + t * (bx - ax),
  ay + t * (by - ay),
];

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
const max = ([ax, ay], [bx, by]) => [Math.max(ax, bx), Math.max(ay, by)];

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
const min = ([ax, ay], [bx, by]) => [Math.min(ax, bx), Math.min(ay, by)];

/**
 * Multiplies two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
const multiply = ([ax, ay], [bx, by]) => [ax * bx, ay * by];

/**
 * Negates the components of a vec2
 *
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
const negate = ([x, y]) => [-x, -y];

/**
 * Rotates a vec2 by an angle
 *
 * @param {Number} angle the angle of rotation (in radians)
 * @param {vec2} vector the vector to rotate
 * @returns {vec2} out
 */
const rotate = (angle, [x, y]) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c - y * s, x * s + y * c];
};

/**
 * Calculates the normal value of the give vector
 * The normal value is the given vector rotated 90 degress.
 *
 * @param {vec2} vec - given value
 * @returns {vec2} normal value of the vector
 */
const normal = (vec) => rotate(Math.PI / 2, vec);

/**
 * Normalize the given vector.
 *
 * @param {vec2} a vector to normalize
 * @returns {vec2} normalized (unit) vector
 */
const normalize = ([x, y]) => {
  let len = x * x + y * y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    return [x * len, y * len];
  } else {
    return [x, y];
  }
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {Number} amount amount to scale the vector by
 * @param {vec2} vector the vector to scale
 * @returns {vec2} out
 */
const scale = (amount, [x, y]) => [x * amount, y * amount];

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
const squaredDistance = ([ax, ay], [bx, by]) => {
  const x = bx - ax;
  const y = by - ay;
  return x * x + y * y;
};

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
const squaredLength = ([x, y]) => x * x + y * y;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
const subtract = ([ax, ay], [bx, by]) => [ax - bx, ay - by];

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {mat4} matrix matrix to transform with
 * @param {vec2} vector the vector to transform
 * @returns {vec2} out
 */
const transform = (matrix, [x, y]) => [
  matrix[0] * x + matrix[4] * y + matrix[12],
  matrix[1] * x + matrix[5] * y + matrix[13],
];

export { abs, add, angleRadians as angle, angleDegrees, angleRadians, canonicalize, cross, distance, divide, dot, equals, fromAngleRadians as fromAngle, fromAngleDegrees, fromAngleRadians, fromPoint, fromScalar, fromValues, length, lerp, max, min, multiply, negate, normal, normalize, rotate, scale, squaredDistance, squaredLength, subtract, transform };
