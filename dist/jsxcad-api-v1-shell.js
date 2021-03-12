import { offset as offset$1, inset as inset$1 } from './jsxcad-geometry-tagged.js';
import { Shape } from './jsxcad-api-v1-shape.js';

const offset = (shape, initial = 1, step, limit) =>
  Shape.fromGeometry(offset$1(shape.toGeometry(), initial, step, limit));

const offsetMethod = function (initial, step, limit) {
  return offset(this, initial, step, limit);
};

Shape.prototype.offset = offsetMethod;

const inset = (shape, initial = 1, step, limit) =>
  Shape.fromGeometry(inset$1(shape.toGeometry(), initial, step, limit));

const insetMethod = function (initial, step, limit) {
  return inset(this, initial, step, limit);
};

Shape.prototype.inset = insetMethod;

// CHECK: Using 'with' for may be confusing, but andInset looks odd.
const withInsetMethod = function (initial, step, limit) {
  return this.group(inset(this, initial, step, limit));
};

Shape.prototype.withInset = withInsetMethod;

const api = { offset, inset };

export default api;
export { inset, offset };
