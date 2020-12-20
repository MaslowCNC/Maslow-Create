import { close, concatenate, open } from './jsxcad-geometry-path.js';
import { taggedAssembly, eachPoint, flip, toDisjointGeometry as toDisjointGeometry$1, toTransformedGeometry, toPoints, transform, reconcile, isWatertight, makeWatertight, taggedPaths, taggedGraph, taggedPoints, taggedSolid, taggedSurface, union as union$1, rewriteTags, assemble as assemble$1, canonicalize as canonicalize$1, measureBoundingBox as measureBoundingBox$1, intersection as intersection$1, allTags, difference as difference$1, getLeafs, getSolids, rewrite, taggedGroup, getAnySurfaces, getPaths, getGraphs, taggedLayers, isVoid, getNonVoidPaths, getPeg, measureArea, taggedSketch, getNonVoidSolids, getAnyNonVoidSurfaces, getNonVoidGraphs, getNonVoidSurfaces, read, write } from './jsxcad-geometry-tagged.js';
import { fromPolygons, findOpenEdges, fromSurface as fromSurface$1 } from './jsxcad-geometry-solid.js';
import { add, scale as scale$1, negate, normalize, subtract, dot, cross, distance } from './jsxcad-math-vec3.js';
import { toTagFromName } from './jsxcad-algorithm-color.js';
import { createNormalize3 } from './jsxcad-algorithm-quantize.js';
import { junctionSelector } from './jsxcad-geometry-halfedge.js';
import { fromSolid, fromSurface, fromPaths, toSolid as toSolid$1, toPaths } from './jsxcad-geometry-graph.js';
import { fromTranslation, fromRotation, fromScaling } from './jsxcad-math-mat4.js';
import { fromPoints, toXYPlaneTransforms } from './jsxcad-math-plane.js';
import { emit, addPending, writeFile, log as log$1 } from './jsxcad-sys.js';
import { fromRotateXToTransform, fromRotateYToTransform, fromRotateZToTransform } from './jsxcad-algorithm-cgal.js';
import { segment } from './jsxcad-geometry-paths.js';

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

  setTags(tags) {
    return fromGeometry({ ...toGeometry(this), tags }, this.context);
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
    return fromGeometry(transform(matrix, this.toGeometry()), this.context);
  }

  reconcile() {
    return fromGeometry(reconcile(this.toDisjointGeometry()));
  }

  assertWatertight() {
    if (!this.isWatertight()) {
      throw Error('not watertight');
    }
    return this;
  }

  isWatertight() {
    return isWatertight(this.toDisjointGeometry());
  }

  makeWatertight(threshold) {
    return fromGeometry(
      makeWatertight(this.toDisjointGeometry(), undefined, undefined, threshold)
    );
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
// Shape.fromPathToSurface = (path, context) =>
//  fromGeometry(fromPathToSurface(path), context);
// Shape.fromPathsToSurface = (paths, context) =>
//  fromGeometry(fromPathsToSurface(paths), context);
Shape.fromPoint = (point, context) =>
  fromGeometry(taggedPoints({}, [point]), context);
Shape.fromPoints = (points, context) =>
  fromGeometry(taggedPoints({}, points), context);
Shape.fromPolygonsToSolid = (polygons, context) =>
  fromGeometry(taggedSolid({}, fromPolygons(polygons)), context);
Shape.fromPolygonsToSurface = (polygons, context) =>
  fromGeometry(taggedSurface({}, polygons), context);
Shape.fromSurfaces = (surfaces, context) =>
  fromGeometry(taggedSolid({}, surfaces), context);
Shape.fromSolid = (solid, context) =>
  fromGeometry(taggedSolid({}, solid), context);

const fromGeometry = Shape.fromGeometry;
const toGeometry = (shape) => shape.toGeometry();
const toDisjointGeometry = (shape) => shape.toDisjointGeometry();
const toKeptGeometry = (shape) => shape.toDisjointGeometry();

/**
 *
 * # Union
 *
 * Union produces a version of the first shape extended to cover the remaining shapes, as applicable.
 * Different kinds of shapes do not interact. e.g., you cannot union a surface and a solid.
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * union(Sphere(5).left(),
 *       Sphere(5),
 *       Sphere(5).right())
 * ```
 * :::
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * union(Sphere(5).left(),
 *       Sphere(5),
 *       Sphere(5).right())
 *   .section()
 *   .outline()
 * ```
 * :::
 * ::: illustration { "view": { "position": [0, 0, 5] } }
 * ```
 * union(Triangle(),
 *       Triangle().rotateZ(180))
 * ```
 * :::
 * ::: illustration { "view": { "position": [0, 0, 5] } }
 * ```
 * union(Triangle(),
 *       Triangle().rotateZ(180))
 *   .outline()
 * ```
 * :::
 * ::: illustration { "view": { "position": [5, 5, 5] } }
 * ```
 * union(assemble(Cube().left(),
 *                Cube().right()),
 *       Cube().front())
 *   .section()
 *   .outline()
 * ```
 * :::
 *
 **/

// NOTE: Perhaps we should make union(a, b, c) equivalent to emptyGeometry.union(a, b, c);
// This would restore commutation.

const union = (...shapes) => {
  switch (shapes.length) {
    case 0: {
      return fromGeometry(taggedAssembly({}));
    }
    case 1: {
      return shapes[0];
    }
    default: {
      return fromGeometry(union$1(...shapes.map(toKeptGeometry)));
    }
  }
};

const unionMethod = function (...shapes) {
  return union(this, ...shapes);
};
Shape.prototype.union = unionMethod;

union.signature = 'union(shape:Shape, ...shapes:Shape) -> Shape';
unionMethod.signature = 'Shape -> union(...shapes:Shape) -> Shape';

/**
 *
 * # shape.add(...shapes)
 *
 * Produces a version of shape with the regions overlapped by shapes added.
 *
 * shape.add(...shapes) is equivalent to union(shape, ...shapes).
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Cube(10).below().add(Cube(5).moveX(5).below())
 * ```
 * :::
 *
 **/

const addMethod = function (...shapes) {
  return union(this, ...shapes);
};
Shape.prototype.add = addMethod;

addMethod.signature = 'Shape -> (...Shapes) -> Shape';

// x.addTo(y) === y.add(x)

const addToMethod = function (shape) {
  return union(shape, this);
};
Shape.prototype.addTo = addToMethod;

const X = 0;
const Y = 1;
const Z = 2;

const align = (shape, spec = 'xyz', origin = [0, 0, 0]) => {
  const { max, min, center } = shape.size();
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
  const moved = shape.move(...add(offset, origin));
  return moved;
};

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

asMethod.signature = 'Shape -> as(...tags:string) -> Shape';
notAsMethod.signature = 'Shape -> as(...tags:string) -> Shape';

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

const assembleMethod = function (op) {
  return assemble(...this.each(op));
};

Shape.prototype.assemble = assembleMethod;

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

/**
 * Moves the left front corner to the left front corner of the bench
 * and places the top level with the bench top at Z = 0.
 *
 * Operations are downward and relative to the top of the shape.
 */

const bench = (shape, x = 0, y = 0, z = 0) => {
  const { max, min } = shape.size();
  return shape.move(0 - x - min[X$1], 0 - y - min[Y$1], 0 - z - max[Z$1]);
};

const benchMethod = function (x, y, z) {
  return bench(this, x, y, z);
};
Shape.prototype.bench = benchMethod;

/**
 * Moves the left front corner to the left front corner of the bench
 * and places the bottom level with the bench top at Z = 0.
 *
 * Operations are upward and relative to the bottom of the shape.
 */

const benchTop = (shape, x = 0, y = 0, z = 0) => {
  const { min } = shape.size();
  return shape.move(0 - x - min[X$1], 0 - y - min[Y$1], 0 - z - min[Z$1]);
};

const benchTopMethod = function (x, y, z) {
  return benchTop(this, x, y, z);
};
Shape.prototype.benchTop = benchTopMethod;

const canonicalize = (shape) =>
  Shape.fromGeometry(canonicalize$1(shape.toGeometry()));

const canonicalizeMethod = function () {
  return canonicalize(this);
};
Shape.prototype.canonicalize = canonicalizeMethod;

/**
 *
 * # Measure Bounding Box
 *
 * Provides the corners of the smallest orthogonal box containing the shape.
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Sphere(7)
 * ```
 * :::
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * const [corner1, corner2] = Sphere(7).measureBoundingBox();
 * Cube.fromCorners(corner1, corner2)
 * ```
 * :::
 **/

const measureBoundingBox = (shape) =>
  measureBoundingBox$1(shape.toGeometry());

const measureBoundingBoxMethod = function () {
  return measureBoundingBox(this);
};
Shape.prototype.measureBoundingBox = measureBoundingBoxMethod;

measureBoundingBox.signature = 'measureBoundingBox(shape:Shape) -> BoundingBox';
measureBoundingBoxMethod.signature =
  'Shape -> measureBoundingBox() -> BoundingBox';

const X$2 = 0;
const Y$2 = 1;
const Z$2 = 2;

const center = (
  shape,
  { centerX = true, centerY = true, centerZ = true } = {}
) => {
  const [minPoint, maxPoint] = measureBoundingBox(shape);
  const center = scale$1(0.5, add(minPoint, maxPoint));
  if (!centerX) {
    center[X$2] = 0;
  }
  if (!centerY) {
    center[Y$2] = 0;
  }
  if (!centerZ) {
    center[Z$2] = 0;
  }
  // FIX: Find a more principled way to handle centering empty shapes.
  if (isNaN(center[X$2]) || isNaN(center[Y$2]) || isNaN(center[Z$2])) {
    return shape;
  }
  const moved = shape.move(...negate(center));
  return moved;
};

const centerMethod = function (...params) {
  return center(this, ...params);
};
Shape.prototype.center = centerMethod;

/**
 *
 * # Intersection
 *
 * Intersection produces a version of the first shape retaining only the parts included in the remaining shapes.
 *
 * Different kinds of shapes do not interact. e.g., you cannot intersect a surface and a solid.
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * intersection(Cube(12),
 *              Sphere(8))
 * ```
 * :::
 * ::: illustration
 * ```
 * intersection(Circle(10).move(-5),
 *              Circle(10).move(5))
 * ```
 * :::
 * ::: illustration { "view": { "position": [5, 5, 5] } }
 * ```
 * intersection(assemble(Cube().below(),
 *                       Cube().above()),
 *              Sphere(1))
 * ```
 * :::
 * ::: illustration
 * ```
 * assemble(difference(Square(10),
 *                     Square(7))
 *            .translate(-2, -2),
 *          difference(Square(10),
 *                     Square(7))
 *            .move(2, 2));
 * ```
 * :::
 * ::: illustration
 * ```
 * intersection(difference(Square(10),
 *                         Square(7))
 *                .translate(-2, -2),
 *              difference(Square(10),
 *                         Square(7))
 *                .move(2, 2));
 * ```
 * :::
 **/

const intersection = (...shapes) => {
  switch (shapes.length) {
    case 0: {
      return fromGeometry(taggedAssembly({}));
    }
    case 1: {
      // We still want to produce a simple shape.
      return fromGeometry(toKeptGeometry(shapes[0]));
    }
    default: {
      return fromGeometry(intersection$1(...shapes.map(toKeptGeometry)));
    }
  }
};

const clipMethod = function (...shapes) {
  return intersection(this, ...shapes);
};
Shape.prototype.clip = clipMethod;

clipMethod.signature = 'Shape -> clip(...to:Shape) -> Shape';

const clipFromMethod = function (shape) {
  return intersection(shape, this);
};
Shape.prototype.clipFrom = clipFromMethod;

clipFromMethod.signature = 'Shape -> clipFrom(...to:Shape) -> Shape';

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
  Shape.fromGeometry(
    rewriteTags([toTagFromName(name)], [], shape.toGeometry())
  );

const color = (...args) => fromName(...args);

const colorMethod = function (...args) {
  return color(this, ...args);
};
Shape.prototype.color = colorMethod;

const colors = (shape) =>
  [...allTags(shape.toGeometry())]
    .filter((tag) => tag.startsWith('color/'))
    .map((tag) => tag.substring(6));

const colorsMethod = function () {
  return colors(this);
};
Shape.prototype.colors = colorsMethod;

colors.signature = 'colors(shape:Shape) -> strings';
colorsMethod.signature = 'Shape -> colors() -> strings';

const constantLaser = (shape, level) =>
  Shape.fromGeometry(
    rewriteTags([`toolpath/constant_laser`], [], shape.toGeometry())
  );

const constantLaserMethod = function (...args) {
  return constantLaser(this);
};
Shape.prototype.constantLaser = constantLaserMethod;

/**
 *
 * # Difference
 *
 * Difference produces a version of the first shape with the remaining shapes removed, where applicable.
 * Different kinds of shapes do not interact. e.g., you cannot subtract a surface from a solid.
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * difference(Cube(10).below(),
 *            Cube(5).below())
 * ```
 * :::
 * ::: illustration
 * ```
 * difference(Circle(10),
 *            Circle(2.5))
 * ```
 * :::
 * ::: illustration { "view": { "position": [5, 5, 5] } }
 * ```
 * difference(assemble(Cube().below(),
 *                     Cube().above()),
 *            Cube().right())
 * ```
 * :::
 *
 **/

const difference = (...shapes) => {
  switch (shapes.length) {
    case 0: {
      return fromGeometry(taggedAssembly({}));
    }
    case 1: {
      // We still want to produce a simple shape.
      return fromGeometry(toKeptGeometry(shapes[0]));
    }
    default: {
      return fromGeometry(difference$1(...shapes.map(toKeptGeometry)));
    }
  }
};

/**
 *
 * # shape.cut(...shapes)
 *
 * Produces a version of shape with the regions overlapped by shapes removed.
 *
 * shape.cut(...shapes) is equivalent to difference(shape, ...shapes).
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Cube(10).below().cut(Cube(5).below())
 * ```
 * :::
 *
 **/

const cutMethod = function (...shapes) {
  return difference(this, ...shapes);
};
Shape.prototype.cut = cutMethod;

cutMethod.signature = 'Shape -> cut(...shapes:Shape) -> Shape';

// a.cut(b) === b.cutFrom(a)

const cutFromMethod = function (shape) {
  return difference(shape, this);
};
Shape.prototype.cutFrom = cutFromMethod;

cutFromMethod.signature = 'Shape -> cutFrom(...shapes:Shape) -> Shape';

const each = (shape, op = (x) => x) =>
  getLeafs(shape.toDisjointGeometry()).map((leaf) =>
    op(Shape.fromGeometry(leaf))
  );

const eachMethod = function (op) {
  return each(this, op);
};

Shape.prototype.each = eachMethod;

const faces = (shape, op = (x) => x) => {
  const faces = [];
  for (const { solid } of getSolids(shape.toKeptGeometry())) {
    for (const surface of solid) {
      faces.push(
        op(Shape.fromGeometry(taggedSurface({}, surface)), faces.length)
      );
    }
  }
  return faces;
};

const facesMethod = function (...args) {
  return faces(this, ...args);
};
Shape.prototype.faces = facesMethod;

const feedRate = (shape, mmPerMinute) =>
  Shape.fromGeometry(
    rewriteTags([`toolpath/feed_rate/${mmPerMinute}`], [], shape.toGeometry())
  );

const feedRateMethod = function (...args) {
  return feedRate(this, ...args);
};
Shape.prototype.feedRate = feedRateMethod;

const hole = (shape) =>
  Shape.fromGeometry(
    rewriteTags(['compose/non-positive'], [], shape.toGeometry())
  );

const holeMethod = function () {
  return hole(this);
};
Shape.prototype.hole = holeMethod;

const inSolids = (shape, op = (_) => _) => {
  let nth = 0;
  const rewritten = rewrite(shape.toKeptGeometry(), (geometry, descend) => {
    if (geometry.solid) {
      // Operate on the solid.
      const solid = op(Shape.fromGeometry(geometry), nth++);
      // Replace the solid with the result (which might not be a solid).
      return solid.toGeometry();
    } else {
      return descend();
    }
  });
  return Shape.fromGeometry(rewritten);
};

const inSolidsMethod = function (...args) {
  return inSolids(this, ...args);
};
Shape.prototype.inSolids = inSolidsMethod;

const junctions = (shape, mode = (n) => n) => {
  const junctions = [];
  const points = [];
  for (const { solid } of getSolids(shape.toKeptGeometry())) {
    const normalize = createNormalize3();
    const select = junctionSelector(solid, normalize);
    for (const surface of solid) {
      for (const path of surface) {
        for (const point of path) {
          points.push(normalize(point));
        }
      }
    }
    for (const point of points) {
      if (mode(select(point))) {
        junctions.push(point);
      }
    }
  }
  return Shape.fromGeometry(taggedPoints({}, junctions));
};

const nonJunctions = (shape) => junctions(shape, (n) => !n);

const junctionsMethod = function () {
  return junctions(this);
};
Shape.prototype.junctions = junctionsMethod;

const nonJunctionsMethod = function () {
  return nonJunctions(this);
};
Shape.prototype.nonJunctions = nonJunctionsMethod;

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
          const dropped = shape.hole().toGeometry();
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

// FIX: Remove after graphs are properly integrated.

const toGraph = (shape) => {
  const graphs = [];
  for (const { tags, solid } of getSolids(shape.toTransformedGeometry())) {
    graphs.push(taggedGraph({ tags }, fromSolid(solid)));
  }
  for (const { tags, surface, z0Surface } of getAnySurfaces(
    shape.toTransformedGeometry()
  )) {
    graphs.push(taggedGraph({ tags }, fromSurface(surface || z0Surface)));
  }
  for (const { tags, paths } of getPaths(shape.toTransformedGeometry())) {
    graphs.push(taggedGraph({ tags }, fromPaths(paths)));
  }
  return Shape.fromGeometry(taggedGroup({}, ...graphs));
};

const toGraphMethod = function () {
  return toGraph(this);
};
Shape.prototype.toGraph = toGraphMethod;

const toSolid = (shape) => {
  const solids = [];
  for (const { tags, graph } of getGraphs(shape.toTransformedGeometry())) {
    solids.push(taggedSolid({ tags }, toSolid$1(graph)));
  }
  return Shape.fromGeometry(taggedGroup({}, ...solids));
};

const toSolidMethod = function () {
  return toSolid(this);
};
Shape.prototype.toSolid = toSolidMethod;

const group = (...shapes) =>
  Shape.fromGeometry(
    taggedLayers({}, ...shapes.map((shape) => shape.toGeometry()))
  );

const groupMethod = function (...shapes) {
  return group(this, ...shapes);
};
Shape.prototype.group = groupMethod;
Shape.prototype.layer = Shape.prototype.group;
Shape.prototype.and = groupMethod;

const laserPower = (shape, level) =>
  Shape.fromGeometry(
    rewriteTags([`toolpath/laser_power/${level}`], [], shape.toGeometry())
  );

const laserPowerMethod = function (...args) {
  return laserPower(this, ...args);
};
Shape.prototype.laserPower = laserPowerMethod;

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

const material = (shape, ...tags) =>
  Shape.fromGeometry(
    rewriteTags(
      tags.map((tag) => `material/${tag}`),
      [],
      shape.toGeometry()
    )
  );

const materialMethod = function (...tags) {
  return material(this, ...tags);
};
Shape.prototype.material = materialMethod;

material.signature = 'material(shape:Shape) -> Shape';
materialMethod.signature = 'Shape -> material() -> Shape';

/**
 *
 * # Translate
 *
 * Translation moves a shape.
 *
 * ::: illustration { "view": { "position": [10, 0, 10] } }
 * ```
 * assemble(Circle(),
 *          Sphere().above())
 * ```
 * :::
 * ::: illustration { "view": { "position": [10, 0, 10] } }
 * ```
 * assemble(Circle(),
 *          Sphere().above()
 *                  .translate(0, 0, 1))
 * ```
 * :::
 * ::: illustration { "view": { "position": [10, 0, 10] } }
 * ```
 * assemble(Circle(),
 *          Sphere().above()
 *                  .translate(0, 1, 0))
 * ```
 * :::
 * ::: illustration { "view": { "position": [10, 0, 10] } }
 * ```
 * assemble(Circle(),
 *          Sphere().above()
 *                  .translate([-1, -1, 1]))
 * ```
 * :::
 *
 **/

const translate = (shape, x = 0, y = 0, z = 0) =>
  shape.transform(fromTranslation([x, y, z]));

const method = function (...args) {
  return translate(this, ...args);
};
Shape.prototype.translate = method;

const move = (...args) => translate(...args);

const moveMethod = function (...params) {
  return translate(this, ...params);
};
Shape.prototype.move = moveMethod;

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
Shape.prototype.moveX = moveXMethod;
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
Shape.prototype.moveY = moveYMethod;
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
Shape.prototype.moveZ = moveZMethod;
Shape.prototype.z = moveZMethod;

const noHoles = (shape, tags, select) => {
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

const noHolesMethod = function (...tags) {
  return noHoles(this);
};

Shape.prototype.noHoles = noHolesMethod;
Shape.prototype.noVoid = noHolesMethod;

const opMethod = function (op, ...args) {
  return op(this, ...args);
};
const withOpMethod = function (op, ...args) {
  return assemble(this, op(this, ...args));
};

Shape.prototype.op = opMethod;
Shape.prototype.withOp = withOpMethod;

const openEdges = (shape, { isOpen = true } = {}) => {
  const r = (v) => v;
  const paths = [];
  for (const { solid } of getSolids(shape.toKeptGeometry())) {
    paths.push(...findOpenEdges(solid, isOpen));
  }
  return Shape.fromGeometry(
    taggedPaths(
      {},
      paths.map((path) => path.map(([x, y, z]) => [r(x), r(y), r(z)]))
    )
  );
};

const openEdgesMethod = function (...args) {
  return openEdges(this, ...args);
};
Shape.prototype.openEdges = openEdgesMethod;

const withOpenEdgesMethod = function (...args) {
  return assemble(this, openEdges(this, ...args));
};
Shape.prototype.withOpenEdges = withOpenEdgesMethod;

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

/** Pause after the path is complete, waiting for the user to continue. */

const pauseAfter = (shape) =>
  Shape.fromGeometry(
    rewriteTags([`toolpath/pause_after`], [], shape.toGeometry())
  );

const pauseAfterMethod = function (...args) {
  return pauseAfter(this);
};
Shape.prototype.pauseAfter = pauseAfterMethod;

/** Pause before the path is started, waiting for the user to continue. */

const pauseBefore = (shape) =>
  Shape.fromGeometry(
    rewriteTags([`toolpath/pause_before`], [], shape.toGeometry())
  );

const pauseBeforeMethod = function (...args) {
  return pauseBefore(this);
};
Shape.prototype.pauseBefore = pauseBeforeMethod;

const paths = (shape, op = (_) => _) => {
  const paths = [];
  for (const geometry of getNonVoidPaths(shape.toDisjointGeometry())) {
    paths.push(op(Shape.fromGeometry(geometry)));
  }
  return paths;
};

const pathsMethod = function (op) {
  return paths(this, op);
};
Shape.prototype.paths = pathsMethod;

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

const atMethod = function (pegShape) {
  return peg(pegShape, this);
};

Shape.prototype.at = atMethod;

const shapeMethod = (build) => {
  return function (...args) {
    return this.peg(build(...args));
  };
};

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

const rotateY = (shape, angle) =>
  shape.transform(fromRotateYToTransform(angle));

const rotateYMethod = function (angle) {
  return rotateY(this, angle);
};
Shape.prototype.rotateY = rotateYMethod;

const rotateZ = (shape, angle) =>
  shape.transform(fromRotateZToTransform(angle));

const rotateZMethod = function (angle) {
  return rotateZ(this, angle);
};
Shape.prototype.rotateZ = rotateZMethod;

const scale = (shape, x = 1, y = x, z = y) =>
  shape.transform(fromScaling([x, y, z]));

const scaleMethod = function (x, y, z) {
  return scale(this, x, y, z);
};
Shape.prototype.scale = scaleMethod;

const X$3 = 0;
const Y$3 = 1;
const Z$3 = 2;

const size = (shape) => {
  const geometry = shape.toKeptGeometry();
  const [min, max] = measureBoundingBox$1(geometry);
  const area = measureArea(geometry);
  const length = max[X$3] - min[X$3];
  const width = max[Y$3] - min[Y$3];
  const height = max[Z$3] - min[Z$3];
  const center = scale$1(0.5, add(min, max));
  const radius = distance(center, max);
  return { area, length, width, height, max, min, center, radius };
};

const sizeMethod = function () {
  return size(this);
};
Shape.prototype.size = sizeMethod;

size.signature = 'size(shape:Shape) -> Size';
sizeMethod.signature = 'Shape -> size() -> Size';

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

const solids = (shape, xform = (_) => _) => {
  const solids = [];
  for (const solid of getNonVoidSolids(shape.toDisjointGeometry())) {
    solids.push(xform(Shape.fromGeometry(solid)));
  }
  return solids;
};

const solidsMethod = function (...args) {
  return solids(this, ...args);
};
Shape.prototype.solids = solidsMethod;

const spindleRpm = (shape, rpm) =>
  Shape.fromGeometry(
    rewriteTags([`toolpath/spindle_rpm/${rpm}`], [], shape.toGeometry())
  );

const spindleRpmMethod = function (...args) {
  return spindleRpm(this, ...args);
};
Shape.prototype.spindleRpm = spindleRpmMethod;

const surfaces = (shape, op = (_) => _) => {
  const surfaces = [];
  for (const surface of getAnyNonVoidSurfaces(shape.toDisjointGeometry())) {
    surfaces.push(op(Shape.fromGeometry(surface)));
  }
  return surfaces;
};

const surfacesMethod = function (op) {
  return surfaces(this, op);
};
Shape.prototype.surfaces = surfacesMethod;

const tags = (shape) =>
  [...allTags(shape.toGeometry())]
    .filter((tag) => tag.startsWith('user/'))
    .map((tag) => tag.substring(5));

const method$1 = function () {
  return tags(this);
};

Shape.prototype.tags = method$1;

const toolpaths = (shape, xform = (_) => _) => {
  const toolpaths = [];
  for (const geometry of getNonVoidPaths(shape.toDisjointGeometry())) {
    const { tags = [] } = geometry;
    if (tags.includes('path/Toolpath')) {
      toolpaths.push(xform(Shape.fromGeometry(geometry)));
    }
  }
  return toolpaths;
};

const toolpathsMethod = function (xform) {
  return toolpaths(this, xform);
};
Shape.prototype.toolpaths = toolpathsMethod;

const keepToolpathsMethod = function (xform) {
  return assemble(...toolpaths(this, xform));
};
Shape.prototype.keepToolpaths = keepToolpathsMethod;

const trace = (shape, length = 1) => {
  const tracePaths = [];
  for (const { paths } of getPaths(shape.toKeptGeometry())) {
    for (let start = 0; ; start += length) {
      const segments = segment(paths, start, start + length);
      if (segments.length === 0) {
        break;
      }
      tracePaths.push(...segments);
    }
  }
  return Shape.fromGeometry(
    taggedPaths({ tags: ['display/trace'] }, tracePaths)
  );
};

const traceMethod = function (length = 1) {
  return trace(this, length);
};
Shape.prototype.trace = traceMethod;

/**
 *
 * # Turn
 *
 * ```
 * turn(shape, axis, angle)
 * shape.turn(axis, angle)
 * ```
 *
 * Rotates the shape around its own axis.
 *
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Square(10)
 * ```
 * :::
 * ::: illustration { "view": { "position": [40, 40, 40] } }
 * ```
 * Square(10).turn([1, 1, 1], 90)
 * ```
 * :::
 **/

const turn = (shape, axis, angle) => {
  const center = shape.measureCenter();
  return shape
    .move(...negate(center))
    .rotate(axis, angle)
    .move(...center);
};

const turnMethod = function (angle, axis) {
  return turn(this, axis, angle);
};
Shape.prototype.turn = turnMethod;

const turnX = (shape, angle) => {
  const center = shape.measureCenter();
  return shape
    .move(...negate(center))
    .rotateX(angle)
    .move(...center);
};

const turnXMethod = function (angle) {
  return turnX(this, angle);
};
Shape.prototype.turnX = turnXMethod;

const turnY = (shape, angle) => {
  const center = shape.measureCenter();
  return shape
    .move(...negate(center))
    .rotateY(angle)
    .move(...center);
};

const turnYMethod = function (angle) {
  return turnY(this, angle);
};
Shape.prototype.turnY = turnYMethod;

const turnZ = (shape, angle) => {
  const center = shape.measureCenter();
  return shape
    .move(...negate(center))
    .rotateZ(angle)
    .move(...center);
};

const turnZMethod = function (angle) {
  return turnZ(this, angle);
};
Shape.prototype.turnZ = turnZMethod;

// FIX: Debugging only -- remove this method.
const wall = (shape) => {
  const normalize = createNormalize3();
  const solids = [];
  for (const { surface, z0Surface, tags } of getAnyNonVoidSurfaces(
    shape.toDisjointGeometry()
  )) {
    solids.push(
      taggedSolid({ tags }, fromSurface$1(surface || z0Surface, normalize))
    );
  }
  return Shape.fromGeometry(taggedAssembly({}, ...solids));
};

const wallMethod = function () {
  return wall(this);
};
Shape.prototype.wall = wallMethod;

const weld = (...shapes) => {
  const weld = [];
  for (const shape of shapes) {
    for (const { paths } of getNonVoidPaths(shape.toTransformedGeometry())) {
      weld.push(...paths);
    }
  }
  return Shape.fromGeometry(taggedPaths({}, weld));
};

const weldMethod = function (...shapes) {
  return weld(this, ...shapes);
};

Shape.prototype.weld = weldMethod;

const toWireframeFromSolid = (solid) => {
  const paths = [];
  for (const surface of solid) {
    paths.push(...surface);
  }
  return taggedPaths({}, paths);
};

const toWireframeFromSurface = (surface) => {
  return taggedPaths({}, surface);
};

const wireframe = (options = {}, shape) => {
  const pieces = [];
  for (const { graph } of getNonVoidGraphs(shape.toKeptGeometry())) {
    pieces.push(toPaths(graph));
  }
  for (const { solid } of getNonVoidSolids(shape.toKeptGeometry())) {
    pieces.push(toWireframeFromSolid(solid));
  }
  for (const { surface } of getNonVoidSurfaces(shape.toKeptGeometry())) {
    pieces.push(toWireframeFromSurface(surface));
  }
  return Shape.fromGeometry(taggedGroup({}, ...pieces));
};

const method$2 = function (options) {
  return wireframe(options, this);
};

Shape.prototype.wireframe = method$2;
Shape.prototype.withWireframe = function (options) {
  return this.and(wireframe(options, this));
};

const wireframeFaces = (shape, op = (x) => x) => {
  const faces = [];
  for (const { solid } of getSolids(shape.toKeptGeometry())) {
    for (const surface of solid) {
      for (const path of surface) {
        faces.push(
          op(Shape.fromGeometry(taggedPaths({}, [path])), faces.length)
        );
      }
    }
  }
  return assemble(...faces);
};

const wireframeFacesMethod = function (...args) {
  return wireframeFaces(this, ...args);
};
Shape.prototype.wireframeFaces = wireframeFacesMethod;

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

const logMethod = function (
  op = (shape) => JSON.stringify(shape.toKeptGeometry())
) {
  logOp(this, op);
  return this;
};
Shape.prototype.log = logMethod;

export default Shape;
export { Shape, getPegCoords, loadGeometry, log, orient$1 as orient, saveGeometry, shapeMethod, weld };
