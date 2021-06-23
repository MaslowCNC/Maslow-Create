import { add, transform } from './jsxcad-math-vec3.js';
import { identity, fromZRotation, multiply } from './jsxcad-math-mat4.js';
import Shape from './jsxcad-api-v1-shape.js';
import { closePath } from './jsxcad-geometry.js';

// Normalize (1, 2, 3) and ([1, 2, 3]).
const normalizeVector = (...params) => {
  if (params[0] instanceof Array) {
    const [x = 0, y = 0, z = 0] = params[0];
    return [x, y, z];
  } else {
    const [x = 0, y = 0, z = 0] = params;
    return [x, y, z];
  }
};

/**
 *
 * # Cursor
 *
 * A cursor is moved by transformations rather than the universe around it.
 *
 * ::: illustration { "view": { "position": [0, -1, 40] } }
 * ```
 * Cursor.fromOrigin()
 *       .forward(5)
 *       .right(45)
 *       .forward(5)
 *       .fill()
 * ```
 * :::
 * ::: illustration { "view": { "position": [0, -1, 40] } }
 * ```
 * Cursor.fromOrigin()
 *       .forward(5)
 *       .left(135)
 *       .forward(5)
 *       .outline()
 * ```
 * :::
 *
 **/

class Cursor {
  constructor({ matrix = identity(), path = [null, [0, 0, 0]] } = {}) {
    this.matrix = matrix;
    this.path = path.slice();
  }

  close() {
    return new Cursor({ matrix: this.matrix, path: closePath(this.path) });
  }

  fill() {
    return this.close().toShape().fill();
  }

  move(...params) {
    return this.translate(...params);
  }

  outline() {
    return this.close().toShape();
  }

  rotateZ(angle) {
    return this.transform(fromZRotation((angle * Math.PI * 2) / 360));
  }

  toPoint() {
    const last = this.path[this.path.length - 1];
    if (last === null) {
      return [0, 0, 0];
    } else {
      return last;
    }
  }

  toPath() {
    return this.path;
  }

  toShape() {
    return Shape.fromPath(this.toPath());
  }

  transform(matrix) {
    return new Cursor({
      matrix: multiply(matrix, this.matrix),
      path: this.path,
    });
  }

  translate(...params) {
    const [x, y, z] = normalizeVector(params);
    const path = this.path.slice();
    path.push(add(this.toPoint(), transform(this.matrix, [x, y, z])));
    return new Cursor({ matrix: this.matrix, path });
  }

  turn(angle) {
    return this.rotateZ(angle);
  }

  left(angle) {
    return this.turn(angle);
  }

  right(angle) {
    return this.turn(-angle);
  }

  forward(distance) {
    return this.move(distance);
  }
}

const fromOrigin = () => new Cursor();
Cursor.fromOrigin = fromOrigin;

Cursor.signature = 'Cursor.fromOrigin() -> Cursor';

export default Cursor;
export { Cursor };
