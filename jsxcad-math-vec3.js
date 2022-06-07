import { reallyQuantizeForSpace } from './jsxcad-math-utils.js';

/**
 * Calculates the absolute value of the give vector
 *
 * @param {vec3} [out] - receiving vector
 * @param {vec3} vec - given value
 * @returns {vec3} absolute value of the vector
 */
const abs = ([x, y, z]) => [Math.abs(x), Math.abs(y), Math.abs(z)];

/**
 * Adds two Points.
 *
 * @param {vec3} a the first vector to add
 * @param {vec3} b the second vector to add
 * @returns {vec3} the added vectors
 */
const add = ([ax = 0, ay = 0, az = 0], [bx = 0, by = 0, bz = 0]) => [
  ax + bx,
  ay + by,
  az + bz,
];

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
const dot = ([ax, ay, az], [bx, by, bz]) => ax * bx + ay * by + az * bz;

/**
 * Scales the length of a vector by some amount.
 *
 * @param {number} the amount to scale
 * @param {vec3} the vector to scale
 * @returns {vec3}
 */
const scale = (amount, [x = 0, y = 0, z = 0]) => [
  x * amount,
  y * amount,
  z * amount,
];

/**
 * Normalize a vec3
 *
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
const normalize = (a) => {
  const [x, y, z] = a;
  const len = x * x + y * y + z * z;
  if (len > 0) {
    // TODO: evaluate use of glm_invsqrt here?
    return scale(1 / Math.sqrt(len), a);
  } else {
    return a;
  }
};

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
const angle = (a, b) => {
  const cosine = reallyQuantizeForSpace(dot(normalize(a), normalize(b)));
  return cosine > 1.0 ? 0 : Math.acos(cosine);
};

// Normalize negative zero to positive zero.
const f = (v) => (v === 0 ? 0 : v);

const canonicalize = ([x = 0, y = 0, z = 0]) => [
  f(reallyQuantizeForSpace(x)),
  f(reallyQuantizeForSpace(y)),
  f(reallyQuantizeForSpace(z)),
];

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
const cross = ([ax, ay, az], [bx, by, bz]) => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
const distance = ([ax, ay, az], [bx, by, bz]) => {
  const x = bx - ax;
  const y = by - ay;
  const z = bz - az;
  return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Divides two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
const divide = ([ax, ay, az], [bx, by, bz]) => [
  ax / bx,
  ay / by,
  az / bz,
];

const equals = ([ax, ay, az], [bx, by, bz]) =>
  ax === bx && ay === by && az === bz;

/**
 * Creates a new vec3 from the point given.
 * Missing ranks are implicitly zero.
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
const fromPoint = ([x = 0, y = 0, z = 0]) => [x, y, z];

/** create a vec3 from a single scalar value
 * all components of the resulting vec3 have the value of the
 * input scalar
 * @param  {Float} scalar
 * @returns {Vec3}
 */
const fromScalar = (scalar) => [scalar, scalar, scalar];

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
const fromValues = (x = 0, y = 0, z = 0) => [x, y, z];

// extend to a 3D vector by adding a z coordinate:
const fromVec2 = ([x = 0, y = 0], z = 0) => [x, y, z];

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
const length = ([x = 0, y = 0, z = 0]) =>
  Math.sqrt(x * x + y * y + z * z);

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {Number} t interpolant (0.0 to 1.0) applied between the two inputs
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
const lerp = (t, [ax, ay, az], [bx, by, bz]) => [
  ax + t * (bx - ax),
  ay + t * (by - ay),
  az + t * (bz - az),
];

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
const max = ([ax, ay, az], [bx, by, bz]) => [
  Math.max(ax, bx),
  Math.max(ay, by),
  Math.max(az, bz),
];

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
const min = ([ax, ay, az], [bx, by, bz]) => [
  Math.min(ax, bx),
  Math.min(ay, by),
  Math.min(az, bz),
];

/**
 * Multiplies two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
const multiply = ([ax, ay, az], [bx, by, bz]) => [
  ax * bx,
  ay * by,
  az * bz,
];

/**
 * Negates the components of a vec3
 *
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
const negate = ([x = 0, y = 0, z = 0]) => [-x, -y, -z];

// find a vector that is somewhat orthogonal to this one
const orthogonal = (vec) => {
  const temp = abs(vec);
  if (temp[0] <= temp[1] && temp[0] <= temp[2]) {
    return [1, 0, 0];
  } else if (temp[1] <= temp[0] && temp[1] <= temp[2]) {
    return [0, 1, 0];
  } else {
    return [0, 0, 1];
  }
};

const rotateX = ([x, y, z], radians) => [
  x,
  y * Math.cos(radians) - z * Math.sin(radians),
  y * Math.sin(radians) + z * Math.cos(radians),
];

const rotateY = ([x, y, z], radians) => [
  z * Math.sin(radians) + x * Math.cos(radians),
  y,
  z * Math.cos(radians) - x * Math.sin(radians),
];

const rotateZ = ([x, y, z], radians) => [
  x * Math.cos(radians) - y * Math.sin(radians),
  x * Math.sin(radians) + y * Math.cos(radians),
  z,
];

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
const squaredDistance = ([ax, ay, az], [bx, by, bz]) => {
  const x = bx - ax;
  const y = by - ay;
  const z = bz - az;
  return x * x + y * y + z * z;
};

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
const squaredLength = ([x, y, z]) => x * x + y * y + z * z;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
const subtract = ([ax, ay, az], [bx, by, bz]) => [
  ax - bx,
  ay - by,
  az - bz,
];

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 * @param {[[<vec3>], <mat4> , <vec3>]} params
 * @param {mat4} params[1] matrix matrix to transform with
 * @param {vec3} params[2] vector the vector to transform
 * @returns {vec3} out
 */
const transform = (matrix, [x = 0, y = 0, z = 0]) => {
  if (!matrix) {
    return [x, y, z];
  }
  let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  w = w || 1.0;
  return [
    (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
    (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w,
  ];
};

/**
 * Rotate vector 3D vector around the x-axis
 * @param {Number} angle The angle of rotation
 * @param {vec3} origin The origin of the rotation
 * @param {vec3} vector The vec3 point to rotate
 * @returns {vec3} out
 */
const turnX = (angle, origin, vector) => {
  const p = subtract(vector, origin);
  // rotate
  const r = [
    p[0],
    p[1] * Math.cos(angle) - p[2] * Math.sin(angle),
    p[1] * Math.sin(angle) + p[2] * Math.cos(angle),
  ];
  // translate
  return add(r, origin);
};

/**
 * Rotate vector 3D vector around the y-axis
 * @param {Number} angle The angle of rotation
 * @param {vec3} origin The origin of the rotation
 * @param {vec3} vector The vec3 point to turn
 * @returns {vec3} out
 */
const turnY = (angle, origin, vector) => {
  const p = subtract(vector, origin);
  // turn
  const r = [
    p[2] * Math.sin(angle) + p[0] * Math.cos(angle),
    p[1],
    p[2] * Math.cos(angle) - p[0] * Math.sin(angle),
  ];
  // translate
  return add(r, origin);
};

/**
 * Rotate vector 3D vector around the z-axis
 * @param {Number} angle The angle of rotation in radians
 * @param {vec3} origin The origin of the rotation
 * @param {vec3} vector The vec3 point to turn
 * @returns {vec3} out
 */
const turnZ = (angle, origin, vector) => {
  const p = subtract(vector, origin);
  // turn
  const r = [
    p[0] * Math.cos(angle) - p[1] * Math.sin(angle),
    p[0] * Math.sin(angle) + p[1] * Math.cos(angle),
    p[2],
  ];
  // translate
  return add(r, origin);
};

/**
 * Calculates the unit vector of the given vector
 *
 * @param {vec3} vector - the base vector for calculations
 * @returns {vec3} unit vector of the given vector
 */
const unit = (vector) => {
  const [x, y, z] = vector;
  const magnitude = length(vector);
  return [x / magnitude, y / magnitude, z / magnitude];
};

export { abs, add, angle, canonicalize, cross, distance, divide, dot, equals, fromPoint, fromScalar, fromValues, fromVec2, length, lerp, max, min, multiply, negate, normalize, orthogonal, rotateX, rotateY, rotateZ, scale, squaredDistance, squaredLength, subtract, transform, turnX, turnY, turnZ, unit };
