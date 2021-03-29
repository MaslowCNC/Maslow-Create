import { close, concatenate, open } from './jsxcad-geometry-path.js';
import { taggedAssembly, eachPoint, flip, toDisplayGeometry, toDisjointGeometry as toDisjointGeometry$1, toTransformedGeometry, toPoints, transform, rewriteTags, taggedPaths, taggedGraph, taggedPoints, union, taggedLayers, intersection, allTags, difference, getLeafs, empty, inset as inset$1, rewrite, isVoid, offset as offset$1, assemble as assemble$1, taggedItem, taggedDisjointAssembly, getPeg, taggedPlan, smooth as smooth$1, measureBoundingBox, taggedSketch, test as test$1, outline, read, write, realize } from './jsxcad-geometry-tagged.js';
import { fromPolygons } from './jsxcad-geometry-graph.js';
import { identityMatrix, fromTranslation, fromRotation, fromScaling } from './jsxcad-math-mat4.js';
import { add as add$1, negate, normalize, subtract, dot, cross, scale as scale$1, distance } from './jsxcad-math-vec3.js';
import { toTagsFromName } from './jsxcad-algorithm-color.js';
import { toTagsFromName as toTagsFromName$1 } from './jsxcad-algorithm-material.js';
import { pack as pack$1 } from './jsxcad-algorithm-pack.js';
import { fromPoints, toXYPlaneTransforms } from './jsxcad-math-plane.js';
import { emit, addPending, writeFile, log as log$1 } from './jsxcad-sys.js';
import { fromRotateXToTransform, fromRotateYToTransform, fromRotateZToTransform } from './jsxcad-algorithm-cgal.js';
import { toTagsFromName as toTagsFromName$2 } from './jsxcad-algorithm-tool.js';

class Shape {
  close() {
    const geometry = this.toDisjointGeometry();
    if (!isSingleOpenPath(geometry.content[0])) {
      throw Error('Close requires a single open path.');
    }
    return Shape.fromClosedPath(close(geometry.content[0].paths[0]));
  }

  concat(...shapes) {
    const paths = [];
    for (const shape of [this, ...shapes]) {
      const geometry = shape.toDisjointGeometry();
      if (!isSingleOpenPath(geometry.content[0])) {
        throw Error(
          `Concatenation requires single open paths: ${JSON.stringify(
            geometry
          )}`
        );
      }
      paths.push(geometry.content[0].paths[0]);
    }
    return Shape.fromOpenPath(concatenate(...paths));
  }

  constructor(geometry = taggedAssembly({}), context) {
    if (geometry.geometry) {
      throw Error('die: { geometry: ... } is not valid geometry.');
    }
    this.geometry = geometry;
    this.context = context;
  }

  eachPoint(operation) {
    eachPoint(operation, this.toDisjointGeometry());
  }

  flip() {
    return fromGeometry(flip(toDisjointGeometry(this)), this.context);
  }

  toDisplayGeometry() {
    return toDisplayGeometry(toGeometry(this));
  }

  toKeptGeometry(options = {}) {
    return this.toDisjointGeometry();
  }

  toDisjointGeometry(options = {}) {
    return toDisjointGeometry$1(toGeometry(this));
  }

  toTransformedGeometry(options = {}) {
    return toTransformedGeometry(toGeometry(this));
  }

  getContext(symbol) {
    return this.context[symbol];
  }

  toGeometry() {
    return this.geometry;
  }

  toPoints() {
    return toPoints(this.toDisjointGeometry()).points;
  }

  points() {
    return Shape.fromGeometry(toPoints(this.toTransformedGeometry()));
  }

  transform(matrix) {
    if (matrix === identityMatrix) {
      return this;
    } else {
      return fromGeometry(transform(matrix, this.toGeometry()), this.context);
    }
  }

  // Low level setter for reifiers.
  setTags(tags = []) {
    return Shape.fromGeometry(rewriteTags(tags, [], this.toGeometry()));
  }
}

const isSingleOpenPath = ({ paths }) =>
  paths !== undefined && paths.length === 1 && paths[0][0] === null;

Shape.fromClosedPath = (path, context) =>
  fromGeometry(taggedPaths({}, [close(path)]), context);
Shape.fromGeometry = (geometry, context) => new Shape(geometry, context);
Shape.fromGraph = (graph, context) =>
  new Shape(taggedGraph({}, graph), context);
Shape.fromOpenPath = (path, context) =>
  fromGeometry(taggedPaths({}, [open(path)]), context);
Shape.fromPath = (path, context) =>
  fromGeometry(taggedPaths({}, [path]), context);
Shape.fromPaths = (paths, context) =>
  fromGeometry(taggedPaths({}, paths), context);
Shape.fromPoint = (point, context) =>
  fromGeometry(taggedPoints({}, [point]), context);
Shape.fromPoints = (points, context) =>
  fromGeometry(taggedPoints({}, points), context);
Shape.fromPolygons = (polygons, context) =>
  fromGeometry(taggedGraph({}, fromPolygons(polygons)), context);

const fromGeometry = Shape.fromGeometry;
const toGeometry = (shape) => shape.toGeometry();
const toDisjointGeometry = (shape) => shape.toDisjointGeometry();

const add = (shape, ...shapes) =>
  Shape.fromGeometry(
    union(shape.toGeometry(), ...shapes.map((shape) => shape.toGeometry()))
  );

const addMethod = function (...shapes) {
  return add(this, ...shapes);
};
Shape.prototype.add = addMethod;

const and = (...shapes) =>
  Shape.fromGeometry(
    taggedLayers({}, ...shapes.map((shape) => shape.toGeometry()))
  );

const andMethod = function (...shapes) {
  return and(this, ...shapes);
};
Shape.prototype.and = andMethod;

const addToMethod = function (shape) {
  return add(shape, this);
};
Shape.prototype.addTo = addToMethod;

const X = 0;
const Y = 1;
const Z = 2;

const align = (shape, spec = 'xyz', origin = [0, 0, 0]) =>
  shape.size(({ max, min, center }, shape) => {
    const offset = [0, 0, 0];

    let index = 0;
    while (index < spec.length) {
      switch (spec[index++]) {
        case 'x': {
          switch (spec[index]) {
            case '>':
              offset[X] = -min[X];
              index += 1;
              break;
            case '<':
              offset[X] = -max[X];
              index += 1;
              break;
            default:
              offset[X] = -center[X];
          }
          break;
        }
        case 'y': {
          switch (spec[index]) {
            case '>':
              offset[Y] = -min[Y];
              index += 1;
              break;
            case '<':
              offset[Y] = -max[Y];
              index += 1;
              break;
            default:
              offset[Y] = -center[Y];
          }
          break;
        }
        case 'z': {
          switch (spec[index]) {
            case '>':
              offset[Z] = -min[Z];
              index += 1;
              break;
            case '<':
              offset[Z] = -max[Z];
              index += 1;
              break;
            default:
              offset[Z] = -center[Z];
          }
          break;
        }
      }
    }
    const moved = shape.move(...add$1(offset, origin));
    return moved;
  });

const alignMethod = function (spec, origin) {
  return align(this, spec, origin);
};
Shape.prototype.align = alignMethod;

/**
 *
 * # As
 *
 * Produces a version of a shape with user defined tags.
 *
 * ::: illustration
 * ```
 * Circle(10).as('A')
 * ```
 * :::
 *
 **/

const as = (shape, tags) =>
  Shape.fromGeometry(
    rewriteTags(
      tags.map((tag) => `user/${tag}`),
      [],
      shape.toGeometry()
    )
  );

const notAs = (shape, tags) =>
  Shape.fromGeometry(
    rewriteTags(
      [],
      tags.map((tag) => `user/${tag}`),
      shape.toGeometry()
    )
  );

const asMethod = function (...tags) {
  return as(this, tags);
};
const notAsMethod = function (...tags) {
  return notAs(this, tags);
};

Shape.prototype.as = asMethod;
Shape.prototype.notAs = notAsMethod;

const clip = (shape, ...shapes) =>
  Shape.fromGeometry(
    intersection(
      shape.toGeometry(),
      ...shapes.map((shape) => shape.toGeometry())
    )
  );

const clipMethod = function (...shapes) {
  return clip(this, ...shapes);
};
Shape.prototype.clip = clipMethod;

const clipFromMethod = function (shape) {
  return clip(shape, this);
};
Shape.prototype.clipFrom = clipFromMethod;

/**
 *
 * # Color
 *
 * Produces a version of a shape the given color.
 * FIX: Support color in convert/threejs/toSvg.
 *
 * ::: illustration
 * ```
 * Circle(10).color('blue')
 * ```
 * :::
 * ::: illustration
 * ```
 * Triangle(10).color('chartreuse')
 * ```
 * :::
 *
 **/

const fromName = (shape, name) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName(name), [], shape.toGeometry()));

const color = (...args) => fromName(...args);

const colorMethod = function (...args) {
  return color(this, ...args);
};
Shape.prototype.color = colorMethod;

const colors = (shape, op = (colors, shape) => colors) =>
  op(
    [...allTags(shape.toGeometry())]
      .filter((tag) => tag.startsWith('color/'))
      .map((tag) => tag.substring(6)),
    shape
  );

const colorsMethod = function (op) {
  return colors(this, op);
};
Shape.prototype.colors = colorsMethod;

const cut = (shape, ...shapes) =>
  Shape.fromGeometry(
    difference(shape.toGeometry(), ...shapes.map((shape) => shape.toGeometry()))
  );

const cutMethod = function (...shapes) {
  return cut(this, ...shapes);
};
Shape.prototype.cut = cutMethod;

// a.cut(b) === b.cutFrom(a)

const cutFromMethod = function (shape) {
  return cut(shape, this);
};
Shape.prototype.cutFrom = cutFromMethod;

const each = (shape, op = (leafs, shape) => leafs) =>
  op(
    getLeafs(shape.toDisjointGeometry()).map((leaf) =>
      Shape.fromGeometry(leaf)
    ),
    shape
  );

const eachMethod = function (op) {
  return each(this, op);
};

Shape.prototype.each = eachMethod;

const fuse = (shape) => {
  const geometry = shape.toGeometry();
  return fromGeometry(union(empty({ tags: geometry.tags }), geometry));
};

const fuseMethod = function (...shapes) {
  return fuse(this);
};
Shape.prototype.fuse = fuseMethod;

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

/**
 *
 * # Keep in assembly
 *
 * Generates an assembly from components in an assembly with a tag.
 *
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 *   .keep('A')
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 *   .keep('B')
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(Circle(10).as('A'),
 *          Square(10).as('B'))
 *   .keep('A', 'B')
 * ```
 * :::
 *
 **/

const selectToKeep = (matchTags, geometryTags) => {
  if (geometryTags === undefined) {
    return false;
  }
  for (const geometryTag of geometryTags) {
    if (matchTags.includes(geometryTag)) {
      return true;
    }
  }
  return false;
};

const selectToDrop = (matchTags, geometryTags) =>
  !selectToKeep(matchTags, geometryTags);

const keepOrDrop = (shape, tags, select) => {
  const matchTags = tags.map((tag) => `user/${tag}`);

  const op = (geometry, descend) => {
    // FIX: Need a more reliable way to detect leaf structure.
    switch (geometry.type) {
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
      case 'layout': {
        return descend();
      }
      case 'item':
      /* {
        if (
          geometry.tags === undefined ||
          !geometry.tags.some((tag) => matchTags.includes(tag))
        ) {
          // If the item isn't involved with these tags; treat it as a branch.
          return descend();
        }
      }
*/
      // falls through to deal with item as a leaf.
      default: {
        if (select(matchTags, geometry.tags)) {
          return descend();
        } else {
          // Operate on the shape.
          const shape = Shape.fromGeometry(geometry);
          // Note that this transform does not violate geometry disjunction.
          const dropped = shape.void().toGeometry();
          return dropped;
        }
      }
    }
  };

  const rewritten = rewrite(shape.toKeptGeometry(), op);
  return Shape.fromGeometry(rewritten);
};

const keep = (shape, tags) => {
  if (tags === undefined) {
    // Dropping no tags is an unconditional keep.
    return keepOrDrop(shape, [], selectToDrop);
  } else {
    return keepOrDrop(shape, tags, selectToKeep);
  }
};

const drop = (shape, tags) => {
  if (tags === undefined) {
    // Keeping no tags is an unconditional drop.
    return keepOrDrop(shape, [], selectToKeep);
  } else {
    return keepOrDrop(shape, tags, selectToDrop);
  }
};

const keepMethod = function (...tags) {
  return keep(this, tags);
};
Shape.prototype.keep = keepMethod;

const dropMethod = function (...tags) {
  return drop(this, tags);
};
Shape.prototype.drop = dropMethod;

/**
 *
 * # Material
 *
 * Produces a version of a shape with a given material.
 *
 * Materials supported include 'paper', 'metal', 'glass', etc.
 *
 * ::: illustration
 * ```
 * Cylinder(5, 10).material('copper')
 * ```
 * :::
 *
 **/

const material = (shape, name) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName$1(name), [], shape.toGeometry()));

const materialMethod = function (name) {
  return material(this, name);
};
Shape.prototype.material = materialMethod;

const move = (shape, x = 0, y = 0, z = 0) =>
  shape.transform(fromTranslation([x, y, z]));

const moveMethod = function (...params) {
  return move(this, ...params);
};
Shape.prototype.move = moveMethod;

const noVoid = (shape, tags, select) => {
  const op = (geometry, descend) => {
    if (isVoid(geometry)) {
      return taggedLayers({});
    } else {
      return descend();
    }
  };

  const rewritten = rewrite(shape.toDisjointGeometry(), op);
  return Shape.fromGeometry(rewritten);
};

const noVoidMethod = function (...tags) {
  return noVoid(this);
};

Shape.prototype.noVoid = noVoidMethod;

const offset = (shape, initial = 1, step, limit) =>
  Shape.fromGeometry(offset$1(shape.toGeometry(), initial, step, limit));

const offsetMethod = function (initial, step, limit) {
  return offset(this, initial, step, limit);
};

Shape.prototype.offset = offsetMethod;

const assemble = (...shapes) => {
  shapes = shapes.filter((shape) => shape !== undefined);
  switch (shapes.length) {
    case 0: {
      return Shape.fromGeometry(taggedAssembly({}));
    }
    case 1: {
      return shapes[0];
    }
    default: {
      return fromGeometry(assemble$1(...shapes.map(toGeometry)));
    }
  }
};

const opMethod = function (op, ...args) {
  return op(this, ...args);
};
const withOpMethod = function (op, ...args) {
  return assemble(this, op(this, ...args));
};

Shape.prototype.op = opMethod;
Shape.prototype.withOp = withOpMethod;

/**
 *
 * # Orient
 *
 * Orients a shape so that it moves from 'center' to 'from' and faces toward 'at', rather than 'facing'.
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Square(10)
 * ```
 * :::
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Square(10).orient({ from: [3, 3, 3], at: [1, 1, 1] });
 * ```
 * :::
 **/

const orient = (
  shape,
  { center = [0, 0, 0], facing = [0, 0, 1], at = [0, 0, 0], from = [0, 0, 0] }
) => {
  const normalizedFacing = normalize(facing);
  const normalizedAt = normalize(subtract(at, from));

  const angle =
    (Math.acos(dot(normalizedFacing, normalizedAt)) * 180) / Math.PI;
  const axis = normalize(cross(normalizedFacing, normalizedAt));

  return shape
    .move(...negate(center))
    .rotate(angle, axis)
    .move(...from);
};

const orientMethod = function (...args) {
  return orient(this, ...args);
};
Shape.prototype.orient = orientMethod;

const pack = (
  shape,
  {
    size,
    pageMargin = 5,
    itemMargin = 1,
    perLayout = Infinity,
    packSize = [],
  } = {}
) => {
  if (perLayout === 0) {
    // Packing was disabled -- do nothing.
    return shape;
  }

  let todo = [];
  for (const leaf of getLeafs(shape.toKeptGeometry())) {
    todo.push(leaf);
  }
  const packedLayers = [];
  while (todo.length > 0) {
    const input = [];
    while (todo.length > 0 && input.length < perLayout) {
      input.push(todo.shift());
    }
    const [packed, unpacked, minPoint, maxPoint] = pack$1(
      { size, pageMargin, itemMargin },
      ...input
    );
    packSize[0] = minPoint;
    packSize[1] = maxPoint;
    if (packed.length === 0) {
      break;
    } else {
      packedLayers.push(
        taggedItem(
          {},
          taggedDisjointAssembly({}, ...packed.map(toDisjointGeometry$1))
        )
      );
    }
    todo.unshift(...unpacked);
  }
  let packedShape = Shape.fromGeometry(taggedLayers({}, ...packedLayers));
  if (size === undefined) {
    packedShape = packedShape.align('xy');
  }
  return packedShape;
};

const packMethod = function (...args) {
  return pack(this, ...args);
};
Shape.prototype.pack = packMethod;

const normalizeCoords = ([
  x = 0,
  y = 0,
  z = 0,
  fX = 0,
  fY = 1,
  fZ = 0,
  rX = 1,
  rY = 0,
  rZ = 0,
]) => [x, y, z, fX, fY, fZ, rX, rY, rZ];

const getPegCoords = (shape) => {
  const coords =
    shape.constructor === Shape
      ? getPeg(shape.toTransformedGeometry())
      : normalizeCoords(shape);
  const origin = coords.slice(0, 3);
  const forward = coords.slice(3, 6);
  const right = coords.slice(6, 9);
  const plane = fromPoints(right, forward, origin);

  return { coords, origin, forward, right, plane };
};

// See also:
// https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724

const orient$1 = (origin, forward, right, shapeToPeg) => {
  const plane = fromPoints(right, forward, origin);
  const d = Math.abs(dot(plane, [0, 0, 1, 0]));
  if (d >= 0.99999) {
    return shapeToPeg.move(...origin);
  }
  const rightDirection = subtract(right, origin);
  const [, from] = toXYPlaneTransforms(plane, rightDirection);
  return shapeToPeg.transform(from).move(...origin);
};

const peg = (shape, shapeToPeg) => {
  const { origin, right, forward } = getPegCoords(shape);
  return orient$1(origin, right, forward, shapeToPeg);
};

const pegMethod = function (shapeToPeg) {
  return peg(this, shapeToPeg);
};

Shape.prototype.peg = pegMethod;

const putMethod = function (pegShape) {
  return peg(pegShape, this);
};

Shape.prototype.put = putMethod;

const shapeMethod = (build) => {
  return function (...args) {
    return this.peg(build(...args));
  };
};

const updatePlan = (shape, ...updates) => {
  const geometry = shape.toTransformedGeometry();
  if (geometry.type !== 'plan') {
    throw Error(`Shape is not a plan`);
  }
  return Shape.fromGeometry(
    taggedPlan(
      { tags: geometry.tags },
      {
        ...geometry.plan,
        history: [...(geometry.plan.history || []), ...updates],
      }
    )
  );
};

const updatePlanMethod = function (...updates) {
  return updatePlan(this, ...updates);
};

Shape.prototype.updatePlan = updatePlanMethod;

const angle = (shape, end = 360, start = 0) =>
  start > end
    ? shape.updatePlan({ angle: { start: end, end: start } })
    : shape.updatePlan({ angle: { start: start, end: end } });
const base = (shape, base) => shape.updatePlan({ base });
const at = (shape, x = 0, y = 0, z = 0) =>
  shape.updatePlan({
    at: [x, y, z],
  });
const corner1 = (shape, x = 0, y = x, z = 0) =>
  shape.updatePlan({
    corner1: [x, y, z],
  });
const corner2 = (shape, x = 0, y = x, z = 0) =>
  shape.updatePlan({
    corner2: [x, y, z],
  });
const diameter = (shape, x = 1, y = x, z = 0) =>
  shape.updatePlan(
    { corner1: [x / 2, y / 2, z / 2] },
    { corner2: [x / -2, y / -2, z / -2] }
  );
const radius = (shape, x = 1, y = x, z = 0) =>
  shape.updatePlan(
    {
      corner1: [x, y, z],
    },
    {
      corner2: [-x, -y, -z],
    }
  );
const apothem = (shape, x = 1, y = x, z = 0) =>
  shape.updatePlan(
    {
      corner1: [x, y, z],
    },
    {
      corner2: [-x, -y, -z],
    },
    { apothem: [x, y, z] }
  );
const from = (shape, x = 0, y = 0, z = 0) =>
  shape.updatePlan({ from: [x, y, z] });
const sides = (shape, sides = 1) => shape.updatePlan({ sides });
const to = (shape, x = 0, y = 0, z = 0) =>
  shape.updatePlan({ to: [x, y, z], top: undefined });
const top = (shape, top) => shape.updatePlan({ top });

const apothemMethod = function (x, y, z) {
  return apothem(this, x, y, z);
};
const angleMethod = function (end, start) {
  return angle(this, end, start);
};
const baseMethod = function (height) {
  return base(this, height);
};
const atMethod = function (x, y, z) {
  return at(this, x, y, z);
};
const corner1Method = function (x, y, z) {
  return corner1(this, x, y, z);
};
const corner2Method = function (x, y, z) {
  return corner2(this, x, y, z);
};
const diameterMethod = function (x, y, z) {
  return diameter(this, x, y, z);
};
const fromMethod = function (x, y, z) {
  return from(this, x, y, z);
};
const radiusMethod = function (x, y, z) {
  return radius(this, x, y, z);
};
const sidesMethod = function (value) {
  return sides(this, value);
};
const toMethod = function (x, y, z) {
  return to(this, x, y, z);
};
const topMethod = function (height) {
  return top(this, height);
};

Shape.prototype.apothem = apothemMethod;
Shape.prototype.angle = angleMethod;
Shape.prototype.at = atMethod;
Shape.prototype.base = baseMethod;
Shape.prototype.corner1 = corner1Method;
Shape.prototype.c1 = corner1Method;
Shape.prototype.corner2 = corner2Method;
Shape.prototype.c2 = corner2Method;
Shape.prototype.diameter = diameterMethod;
Shape.prototype.from = fromMethod;
Shape.prototype.radius = radiusMethod;
Shape.prototype.sides = sidesMethod;
Shape.prototype.to = toMethod;
Shape.prototype.top = topMethod;

/**
 *
 * # Rotate
 *
 * ```
 * rotate(shape, axis, angle)
 * shape.rotate(axis, angle)
 * ```
 *
 * Rotates the shape around the provided axis.
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Square(10)
 * ```
 * :::
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Square(10).rotate([1, 1, 1], 90)
 * ```
 * :::
 **/

const rotate = (shape, angle = 0, axis = [0, 0, 1]) =>
  shape.transform(fromRotation(angle * 0.017453292519943295, axis));

const rotateMethod = function (...args) {
  return rotate(this, ...args);
};
Shape.prototype.rotate = rotateMethod;

const rotateX = (shape, angle) =>
  shape.transform(fromRotateXToTransform(angle));

const rotateXMethod = function (angle) {
  return rotateX(this, angle);
};
Shape.prototype.rotateX = rotateXMethod;
Shape.prototype.rx = rotateXMethod;

const rotateY = (shape, angle) =>
  shape.transform(fromRotateYToTransform(angle));

const rotateYMethod = function (angle) {
  return rotateY(this, angle);
};
Shape.prototype.rotateY = rotateYMethod;
Shape.prototype.ry = rotateYMethod;

const rotateZ = (shape, angle) =>
  shape.transform(fromRotateZToTransform(angle));

const rotateZMethod = function (angle) {
  return rotateZ(this, angle);
};
Shape.prototype.rotateZ = rotateZMethod;
Shape.prototype.rz = rotateZMethod;

const scale = (shape, x = 1, y = x, z = y) =>
  shape.transform(fromScaling([x, y, z]));

const scaleMethod = function (x, y, z) {
  return scale(this, x, y, z);
};
Shape.prototype.scale = scaleMethod;

const smooth = (shape, options = {}) =>
  Shape.fromGeometry(smooth$1(shape.toGeometry(), options));

const smoothMethod = function (options) {
  return smooth(this, options);
};

Shape.prototype.smooth = smoothMethod;

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

const size = (shape, op = (size, shape) => size) => {
  const geometry = shape.toDisjointGeometry();
  const [min, max] = measureBoundingBox(geometry);
  const length = max[X$1] - min[X$1];
  const width = max[Y$1] - min[Y$1];
  const height = max[Z$1] - min[Z$1];
  const center = scale$1(0.5, add$1(min, max));
  const radius = distance(center, max);
  return op(
    {
      length,
      width,
      height,
      max,
      min,
      center,
      radius,
    },
    Shape.fromGeometry(geometry)
  );
};

const sizeMethod = function (op) {
  return size(this, op);
};
Shape.prototype.size = sizeMethod;

const sketch = (shape) =>
  Shape.fromGeometry(taggedSketch({}, shape.toGeometry()));

Shape.prototype.sketch = function () {
  return sketch(this);
};

Shape.prototype.plan = function () {
  return sketch(this);
};

Shape.prototype.withPlan = function () {
  return assemble(this, sketch(this));
};

const tags = (shape, op = (tags, shape) => tags) =>
  op(
    [...allTags(shape.toGeometry())]
      .filter((tag) => tag.startsWith('user/'))
      .map((tag) => tag.substring(5)),
    shape
  );

const method = function (op) {
  return tags(this, op);
};

Shape.prototype.tags = method;

const test = (shape, md) => {
  if (md) {
    shape.md(md);
  }
  test$1(shape.toGeometry());
  return shape;
};

const testMethod = function (md) {
  return test(this, md);
};

Shape.prototype.test = testMethod;

const tool = (shape, name) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName$2(name), [], shape.toGeometry()));

const toolMethod = function (name) {
  return tool(this, name);
};
Shape.prototype.tool = toolMethod;

const voidFn = (shape) =>
  Shape.fromGeometry(
    rewriteTags(['compose/non-positive'], [], shape.toGeometry())
  );

const voidMethod = function () {
  return voidFn(this);
};
Shape.prototype.void = voidMethod;

const weld = (...shapes) => {
  const weld = [];
  for (const shape of shapes) {
    for (const { paths } of outline(shape.toTransformedGeometry())) {
      weld.push(...paths);
    }
  }
  return Shape.fromGeometry(taggedPaths({}, weld));
};

const weldMethod = function (...shapes) {
  return weld(this, ...shapes);
};

Shape.prototype.weld = weldMethod;

/**
 *
 * # With
 *
 * Assembles the current shape with those provided.
 *
 * The below example is equivalent to
 * ```
 * assemble(Circle(20), Square(40).moveX(10))
 * ```
 *
 * ::: illustration { "view": { "position": [80, 80, 80] } }
 * ```
 * Circle(20).with(Square(40).moveX(10))
 * ```
 * :::
 *
 **/

const withMethod = function (...shapes) {
  return assemble(this, ...shapes);
};
Shape.prototype.with = withMethod;

const prepareShape = (shape, name, options = {}) => {
  let index = 0;
  const entries = [];
  entries.push({
    data: new TextEncoder('utf8').encode(JSON.stringify(shape)),
    filename: `${name}_${index++}.jsxcad`,
    type: 'application/x-jsxcad',
  });
  return entries;
};

const downloadShapeMethod = function (...args) {
  const entries = prepareShape(this, ...args);
  emit({ download: { entries } });
  return this;
};
Shape.prototype.downloadShape = downloadShapeMethod;

const writeShape = (shape, name, options = {}) => {
  for (const { data, filename } of prepareShape(shape, name, {})) {
    addPending(writeFile({ doSerialize: false }, `output/${filename}`, data));
  }
  return shape;
};

const writeShapeMethod = function (...args) {
  return writeShape(this, ...args);
};
Shape.prototype.writeShape = writeShapeMethod;

/**
 *
 * # MoveX
 *
 * Move along the X axis.
 *
 */

const moveX = (shape, x = 0) => move(shape, x);

const moveXMethod = function (x) {
  return moveX(this, x);
};
Shape.prototype.x = moveXMethod;

/**
 *
 * # MoveY
 *
 * Move along the Y axis.
 *
 */

const moveY = (shape, y = 0) => move(shape, 0, y);

const moveYMethod = function (y) {
  return moveY(this, y);
};
Shape.prototype.y = moveYMethod;

/**
 *
 * # MoveZ
 *
 * Move along the Z axis.
 *
 */

const moveZ = (shape, z = 0) => move(shape, 0, 0, z);

const moveZMethod = function (z) {
  return moveZ(this, z);
};
Shape.prototype.z = moveZMethod;

const loadGeometry = async (path) =>
  Shape.fromGeometry(await read(path));

const saveGeometry = async (path, shape) =>
  Shape.fromGeometry(await write(shape.toGeometry(), path));

function pad (hash, len) {
  while (hash.length < len) {
    hash = '0' + hash;
  }
  return hash;
}

function fold (hash, text) {
  var i;
  var chr;
  var len;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash < 0 ? hash * -2 : hash;
}

function foldObject (hash, o, seen) {
  return Object.keys(o).sort().reduce(foldKey, hash);
  function foldKey (hash, key) {
    return foldValue(hash, o[key], key, seen);
  }
}

function foldValue (input, value, key, seen) {
  var hash = fold(fold(fold(input, key), toString(value)), typeof value);
  if (value === null) {
    return fold(hash, 'null');
  }
  if (value === undefined) {
    return fold(hash, 'undefined');
  }
  if (typeof value === 'object' || typeof value === 'function') {
    if (seen.indexOf(value) !== -1) {
      return fold(hash, '[Circular]' + key);
    }
    seen.push(value);

    var objHash = foldObject(hash, value, seen);

    if (!('valueOf' in value) || typeof value.valueOf !== 'function') {
      return objHash;
    }

    try {
      return fold(objHash, String(value.valueOf()))
    } catch (err) {
      return fold(objHash, '[valueOf exception]' + (err.stack || err.message))
    }
  }
  return fold(hash, value.toString());
}

function toString (o) {
  return Object.prototype.toString.call(o);
}

function sum (o) {
  return pad(foldValue(0, o, '', []).toString(16), 8);
}

var hashSum = sum;

/**
 *
 * # Log
 *
 * Writes a string to the console.
 *
 * ```
 * log("Hello, World")
 * ```
 *
 **/

const toText = (value) => {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
};

const log = (value, level) => {
  const text = toText(value);
  const log = { text, level };
  const hash = hashSum(log);
  emit({ log, hash });
  return log$1({ op: 'text', text, level });
};

const logOp = (shape, op) => {
  const text = String(op(shape));
  const level = 'serious';
  const log = { text, level };
  const hash = hashSum(log);
  emit({ log, hash });
  return log$1({ op: 'text', text });
};

const logMethod = function (op = (shape) => JSON.stringify(shape)) {
  logOp(Shape.fromGeometry(realize(this.toGeometry())), op);
  return this;
};
Shape.prototype.log = logMethod;

export default Shape;
export { Shape, getPegCoords, loadGeometry, log, orient$1 as orient, saveGeometry, shapeMethod, weld };
