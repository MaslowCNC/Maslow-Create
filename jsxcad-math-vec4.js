/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first vec4
 * @param {vec4} b the second vec4
 * @returns {Number} dot product of a and b
 */
const dot = ([ax, ay, az, aw], [bx, by, bz, bw]) =>
  ax * bx + ay * by + az * bz + aw * bw;

const equals = ([ax, ay, az, aw], [bx, by, bz, bw]) =>
  ax === bx && ay === by && az === bz && aw === bw;

/** Create a new vec4 from the given scalar value (single)
 *
 * @param  {Number} scalar
 * @returns {vec4} a new vector
 */
const fromScalar = (scalar) => [scalar, scalar, scalar, scalar];

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new vector
 */
const fromValues = (x = 0, y = 0, z = 0, w = 0) => [x, y, z, w];

/**
 * Transform the given vec4 using the given mat4
 *
 * @param {mat4} matrix matrix to transform with
 * @param {vec4} vector the vector to transform
 * @returns {vec4} a new vector or the receiving vector
 */
// PROVE: Why do we use fround here?
const transform = (matrix, [x, y, z, w]) => [
  Math.fround(matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w),
  Math.fround(matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w),
  Math.fround(matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w),
  Math.fround(matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w),
];

export { dot, equals, fromScalar, fromValues, transform };
