import { dot, cross, fromValues as fromValues$2 } from './jsxcad-math-vec3.js';
import { fromValues as fromValues$1 } from './jsxcad-math-vec2.js';

/**
 * Set a mat4 to the identity matrix
 *
 * @returns {mat4} out
 */

const identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// FIX: Move to cgal.
identityMatrix.blessed = true;

const identity = () => identityMatrix;

/**
 * Adds two mat4's
 *
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
const add = (a, b) => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
  a[3] + b[3],
  a[4] + b[4],
  a[5] + b[5],
  a[6] + b[6],
  a[7] + b[7],
  a[8] + b[8],
  a[9] + b[9],
  a[10] + b[10],
  a[11] + b[11],
  a[12] + b[12],
  a[13] + b[13],
  a[14] + b[14],
  a[15] + b[15],
];

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
const equals = (a, b) => {
  return (
    a[0] === b[0] &&
    a[1] === b[1] &&
    a[2] === b[2] &&
    a[3] === b[3] &&
    a[4] === b[4] &&
    a[5] === b[5] &&
    a[6] === b[6] &&
    a[7] === b[7] &&
    a[8] === b[8] &&
    a[9] === b[9] &&
    a[10] === b[10] &&
    a[11] === b[11] &&
    a[12] === b[12] &&
    a[13] === b[13] &&
    a[14] === b[14] &&
    a[15] === b[15]
  );
};

const EPSILON = 1e-5;

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
const fromRotation = (rad, [x, y, z]) => {
  let len = Math.sqrt(x * x + y * y + z * z);

  if (Math.abs(len) < EPSILON) {
    return identity();
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const t = 1 - c;

  // Perform rotation-specific matrix multiplication
  return [
    x * x * t + c,
    y * x * t + z * s,
    z * x * t - y * s,
    0,
    x * y * t - z * s,
    y * y * t + c,
    z * y * t + x * s,
    0,
    x * z * t + y * s,
    y * z * t - x * s,
    z * z * t + c,
    0,
    0,
    0,
    0,
    1,
  ];
};

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */
const fromScaling = ([x = 1, y = 1, z = 1]) => [
  x,
  0,
  0,
  0,
  0,
  y,
  0,
  0,
  0,
  0,
  z,
  0,
  0,
  0,
  0,
  1,
];

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
const fromTranslation = ([x = 0, y = 0, z = 0]) => [
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  x,
  y,
  z,
  1,
];

/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */
const fromValues = (
  m00,
  m01,
  m02,
  m03,
  m10,
  m11,
  m12,
  m13,
  m20,
  m21,
  m22,
  m23,
  m30,
  m31,
  m32,
  m33
) => [
  m00,
  m01,
  m02,
  m03,
  m10,
  m11,
  m12,
  m13,
  m20,
  m21,
  m22,
  m23,
  m30,
  m31,
  m32,
  m33,
];

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
const fromXRotation = (rad) => {
  const s = Math.sin(rad);
  const c = Math.cos(rad);

  // Perform axis-specific matrix multiplication
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
};

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
const fromYRotation = (rad) => {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  // Perform axis-specific matrix multiplication
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
};

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
const fromZRotation = (rad) => {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  // Perform axis-specific matrix multiplication
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

/**
 * determine whether the input matrix is a mirroring transformation
 *
 * @param {mat4} mat the input matrix
 * @returns {boolean} output
 */
const isMirroring = (mat) => {
  const u = [mat[0], mat[4], mat[8]];
  const v = [mat[1], mat[5], mat[9]];
  const w = [mat[2], mat[6], mat[10]];

  // for a true orthogonal, non-mirrored base, u.cross(v) == w
  // If they have an opposite direction then we are mirroring
  const mirrorvalue = dot(cross(u, v), w);
  const ismirror = mirrorvalue < 0;
  return ismirror;
};

/**
 * m the mat4 by the dimensions in the given vec3
 * create an affine matrix for mirroring into an arbitrary plane:
 *
 * @param {vec3} v the vec3 to mirror the matrix by
 * @param {mat4} a the matrix to mirror
 * @returns {mat4} out
 */
const mirror = ([x, y, z], a) => [
  a[0] * x,
  a[1] * x,
  a[2] * x,
  a[3] * x,
  a[4] * y,
  a[5] * y,
  a[6] * y,
  a[7] * y,
  a[8] * z,
  a[9] * z,
  a[10] * z,
  a[11] * z,
  a[12],
  a[13],
  a[14],
  a[15],
];

/**
 * Create an affine matrix for mirroring onto an arbitrary plane
 *
 * @param {vec4} plane to mirror the matrix by
 * @returns {mat4} out
 */
const mirrorByPlane = ([nx, ny, nz, w]) => [
  1.0 - 2.0 * nx * nx,
  -2.0 * ny * nx,
  -2.0 * nz * nx,
  0,
  -2.0 * nx * ny,
  1.0 - 2.0 * ny * ny,
  -2.0 * nz * ny,
  0,
  -2.0 * nx * nz,
  -2.0 * ny * nz,
  1.0 - 2.0 * nz * nz,
  0,
  2.0 * nx * w,
  2.0 * ny * w,
  2.0 * nz * w,
  1,
];

/**
 * Multiplies two mat4's
 *
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
const multiply = (a, b) => {
  const out = Array(16);
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];

  // Cache only the current line of the second matrix
  let b0 = b[0];
  let b1 = b[1];
  let b2 = b[2];
  let b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
};

/**
 * Multiply the input matrix by a Vector2 (interpreted as 2 row, 1 column)
 * (result = M*v)
 * Fourth element is set to 1
 * @param {vec2} vector the input vector
 * @param {mat4} matrix the input matrix
 * @returns {vec2} output
 */
const rightMultiplyVec2 = ([v0, v1], matrix) => {
  const v2 = 0;
  const v3 = 1;
  let x = v0 * matrix[0] + v1 * matrix[1] + v2 * matrix[2] + v3 * matrix[3];
  let y = v0 * matrix[4] + v1 * matrix[5] + v2 * matrix[6] + v3 * matrix[7];
  const w =
    v0 * matrix[12] + v1 * matrix[13] + v2 * matrix[14] + v3 * matrix[15];

  // scale such that fourth element becomes 1:
  if (w !== 1) {
    const invw = 1.0 / w;
    x *= invw;
    y *= invw;
  }
  return fromValues$1(x, y);
};

/**
 * Multiply the input matrix by a Vector3 (interpreted as 3 row, 1 column)
 * (result = M*v)
 * Fourth element is set to 1
 * @param {vec3} vector the input vector
 * @param {mat4} matrix the input matrix
 * @returns {vec3} output
 */
const rightMultiplyVec3 = ([v0, v1, v2], matrix) => {
  const v3 = 1;
  let x = v0 * matrix[0] + v1 * matrix[1] + v2 * matrix[2] + v3 * matrix[3];
  let y = v0 * matrix[4] + v1 * matrix[5] + v2 * matrix[6] + v3 * matrix[7];
  let z = v0 * matrix[8] + v1 * matrix[9] + v2 * matrix[10] + v3 * matrix[11];
  const w =
    v0 * matrix[12] + v1 * matrix[13] + v2 * matrix[14] + v3 * matrix[15];

  // scale such that fourth element becomes 1:
  if (w !== 1) {
    const invw = 1.0 / w;
    x *= invw;
    y *= invw;
    z *= invw;
  }
  return fromValues$2(x, y, z);
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
const subtract = (a, b) => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
  a[3] - b[3],
  a[4] - b[4],
  a[5] - b[5],
  a[6] - b[6],
  a[7] - b[7],
  a[8] - b[8],
  a[9] - b[9],
  a[10] - b[10],
  a[11] - b[11],
  a[12] - b[12],
  a[13] - b[13],
  a[14] - b[14],
  a[15] - b[15],
];

export { add, equals, fromRotation, fromScaling, fromTranslation, fromValues, fromXRotation, fromYRotation, fromZRotation, identity, identityMatrix, isMirroring, mirror, mirrorByPlane, multiply, rightMultiplyVec2, rightMultiplyVec3, subtract };
