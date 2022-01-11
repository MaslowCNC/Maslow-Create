import { closePath, concatenatePath, assemble as assemble$1, flip, toConcreteGeometry, toDisplayGeometry, toTransformedGeometry, toPoints, transform, rewriteTags, taggedPaths, taggedGraph, openPath, taggedSegments, taggedPoints, fromPolygonsToGraph, registerReifier, taggedPlan, taggedGroup, union, taggedItem, getLeafs, getInverseMatrices, bend as bend$1, projectToPlane, computeCentroid, intersection, allTags, fromPointsToGraph, cut as cut$1, rewrite, visit, hasTypeVoid, hasTypeWire, translatePaths, taggedLayout, measureBoundingBox, getLayouts, isNotVoid, computeNormal, extrude, extrudeToPlane as extrudeToPlane$1, faces as faces$1, fill as fill$1, fuse as fuse$1, eachSegment, removeSelfIntersections as removeSelfIntersections$1, grow as grow$1, outline as outline$1, inset as inset$1, read, readNonblocking, loft as loft$1, realize, hasShowOverlay, hasTypeMasked, minkowskiDifference as minkowskiDifference$1, minkowskiShell as minkowskiShell$1, minkowskiSum as minkowskiSum$1, isVoid, offset as offset$1, eachPoint, push as push$1, remesh as remesh$1, write, writeNonblocking, simplify as simplify$1, section as section$1, separate as separate$1, serialize as serialize$1, smooth as smooth$1, taggedSketch, taper as taper$1, test as test$1, twist as twist$1, withQuery, toPolygonsWithHoles, arrangePolygonsWithHoles, fromPolygonsWithHolesToTriangles, fromTrianglesToGraph, alphaShape, rotateZPath, convexHullToGraph, fromFunctionToGraph, translatePath } from './jsxcad-geometry.js';
import { getSourceLocation, startTime, endTime, emit, computeHash, logInfo, hash, log as log$1, generateUniqueId, addPending, write as write$1 } from './jsxcad-sys.js';
export { elapsed, emit, read, write } from './jsxcad-sys.js';
import { identityMatrix, fromTranslation, fromRotation, fromScaling } from './jsxcad-math-mat4.js';
import { scale as scale$1, subtract, add as add$1, abs, squaredLength, normalize, cross, distance } from './jsxcad-math-vec3.js';
import { zag } from './jsxcad-api-v1-math.js';
import { toTagsFromName } from './jsxcad-algorithm-color.js';
import { toTagsFromName as toTagsFromName$1 } from './jsxcad-algorithm-material.js';
import { invertTransform, fromRotateXToTransform, fromRotateYToTransform, fromRotateZToTransform } from './jsxcad-algorithm-cgal.js';
import { pack as pack$1 } from './jsxcad-algorithm-pack.js';
import { toTagsFromName as toTagsFromName$2 } from './jsxcad-algorithm-tool.js';
import { fromPoints as fromPoints$1 } from './jsxcad-math-poly3.js';
export { cm, foot, inch, m, mil, mm, thou, yard } from './jsxcad-api-v1-units.js';

class Shape {
  close() {
    const geometry = this.toConcreteGeometry();
    if (!isSingleOpenPath(geometry)) {
      throw Error('Close requires a single open path.');
    }
    return Shape.fromClosedPath(closePath(geometry.paths[0]));
  }

  concat(...shapes) {
    const paths = [];
    for (const shape of [this, ...shapes]) {
      const geometry = shape.toConcreteGeometry();
      if (!isSingleOpenPath(geometry)) {
        throw Error(
          `Concatenation requires single open paths: ${JSON.stringify(
            geometry
          )}`
        );
      }
      paths.push(geometry.paths[0]);
    }
    return Shape.fromOpenPath(concatenatePath(...paths));
  }

  constructor(geometry = assemble$1(), context) {
    if (geometry.geometry) {
      throw Error('die: { geometry: ... } is not valid geometry.');
    }
    this.geometry = geometry;
    this.context = context;
  }

  flip() {
    return fromGeometry(
      flip(toConcreteGeometry(this.toGeometry())),
      this.context
    );
  }

  toDisplayGeometry(options) {
    return toDisplayGeometry(toGeometry(this), options);
  }

  toKeptGeometry(options = {}) {
    return this.toConcreteGeometry();
  }

  toConcreteGeometry(options = {}) {
    return toConcreteGeometry(toGeometry(this));
  }

  toDisjointGeometry(options = {}) {
    return toConcreteGeometry(toGeometry(this));
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
    return toPoints(this.toConcreteGeometry()).points;
  }

  transform(matrix) {
    if (matrix === identityMatrix) {
      return this;
    } else {
      return fromGeometry(transform(matrix, this.toGeometry()), this.context);
    }
  }

  // Low level setter for reifiers.
  getTags() {
    return this.toGeometry().tags || [];
  }

  setTags(tags = []) {
    return Shape.fromGeometry(rewriteTags(tags, [], this.toGeometry()));
  }

  toCoordinate(x, y, z) {
    return Shape.toCoordinate(this, x, y, z);
  }

  toShape(value) {
    return Shape.toShape(value, this);
  }

  toShapes(values) {
    return Shape.toShapes(values, this);
  }

  toValue(value) {
    return Shape.toValue(value, this);
  }

  toFlatValues(values) {
    return Shape.toFlatValues(values, this);
  }

  toNestedValues(values) {
    return Shape.toNestedValues(values, this);
  }
}

const isSingleOpenPath = ({ paths }) =>
  paths !== undefined && paths.length === 1 && paths[0][0] === null;

Shape.method = {};

const registerShapeMethod = (name, op) => {
  const path = getSourceLocation()?.path;
  if (Shape.prototype.hasOwnProperty(name)) {
    const { origin } = Shape.prototype[name];
    if (origin !== path) {
      throw Error(
        `Method ${name} is already defined in ${origin} (this is ${path}).`
      );
    }
  }
  // Make the operation constructor available e.g., Shape.grow(1)(s)
  Shape[name] = op;

  // Make the operation application available e.g., s.grow(1)
  const { [name]: method } = {
    [name]: function (...args) {
      const timer = startTime(name);
      const result = op(...args)(this);
      endTime(timer);
      return result;
    },
  };
  method.origin = path;
  Shape.prototype[name] = method;
  return method;
};

const shapeMethod = (build) => {
  return function (...args) {
    return build(...args).at(this);
  };
};

Shape.shapeMethod = shapeMethod;

Shape.fromClosedPath = (path, context) =>
  fromGeometry(taggedPaths({}, [closePath(path)]), context);
Shape.fromGeometry = (geometry, context) => new Shape(geometry, context);
Shape.fromGraph = (graph, context) =>
  new Shape(taggedGraph({}, graph), context);
Shape.fromOpenPath = (path, context) =>
  fromGeometry(taggedPaths({}, [openPath(path)]), context);
Shape.fromSegments = (...segments) =>
  fromGeometry(taggedSegments({}, segments));
Shape.fromPath = (path, context) =>
  fromGeometry(taggedPaths({}, [path]), context);
Shape.fromPaths = (paths, context) =>
  fromGeometry(taggedPaths({}, paths), context);
Shape.fromPoint = (point, context) =>
  fromGeometry(taggedPoints({}, [point]), context);
Shape.fromPoints = (points, context) =>
  fromGeometry(taggedPoints({}, points), context);
Shape.fromPolygons = (polygons, context) =>
  fromGeometry(fromPolygonsToGraph({}, polygons), context);

Shape.registerMethod = registerShapeMethod;

Shape.toShape = (to, from) => {
  if (to instanceof Function) {
    to = to(from);
  }
  if (to instanceof Shape) {
    return to;
  } else {
    throw Error(`Expected Function or Shape. Received: ${to.constructor.name}`);
  }
};

Shape.toShapes = (to, from) => {
  if (to instanceof Function) {
    to = to(from);
  }
  if (to instanceof Array) {
    return to
      .filter((value) => value !== undefined)
      .flatMap((value) => Shape.toShapes(value, from))
      .flatMap((value) => Shape.toShapes(value, from));
  } else {
    return [Shape.toShape(to, from)];
  }
};

Shape.toValue = (to, from) => {
  if (to instanceof Function) {
    to = to(from);
  }
  return to;
};

Shape.toFlatValues = (to, from) => {
  if (to instanceof Function) {
    to = to(from);
  }
  if (to instanceof Array) {
    return to
      .filter((value) => value !== undefined)
      .flatMap((value) => Shape.toValue(value, from))
      .flatMap((value) => Shape.toValue(value, from));
  } else {
    return [Shape.toValue(to, from)];
  }
};

Shape.toNestedValues = (to, from) => {
  if (to instanceof Function) {
    return to(from);
  } else if (to instanceof Array) {
    const expanded = [];
    for (const value of to) {
      if (value instanceof Function) {
        const result = value(from);
        if (result instanceof Array) {
          expanded.push(...result);
        } else {
          expanded.push(result);
        }
      }
    }
    return expanded;
  } else {
    return to;
  }
};

Shape.toCoordinate = (shape, x = 0, y = 0, z = 0) => {
  if (x instanceof Function) {
    x = x(shape);
  }
  if (typeof x === 'string') {
    x = shape.get(x);
  }
  if (x instanceof Shape) {
    const g = x.toTransformedGeometry();
    if (g.type === 'points' && g.points.length === 1) {
      // FIX: Consider how this might be more robust.
      return g.points[0];
    } else {
      throw Error(`Unexpected coordinate value: ${x}`);
    }
  } else if (x instanceof Array) {
    return x;
  } else if (typeof x === 'number') {
    if (typeof y !== 'number') {
      throw Error(`Unexpected coordinate value: ${y}`);
    }
    if (typeof z !== 'number') {
      throw Error(`Unexpected coordinate value: ${z}`);
    }
    return [x, y, z];
  } else {
    throw Error(`Unexpected coordinate value: ${JSON.stringify(x)}`);
  }
};

Shape.toCoordinates = (shape, ...args) => {
  const coordinates = [];
  while (args.length > 0) {
    let x = args.shift();
    if (x instanceof Function) {
      x = x(shape);
    }
    if (typeof x === 'string') {
      x = shape.get(x);
    }
    if (x instanceof Shape) {
      const g = x.toTransformedGeometry();
      if (g.type === 'points' && g.points.length === 1) {
        // FIX: Consider how this might be more robust.
        coordinates.push(g.points[0]);
      } else {
        throw Error(`Unexpected coordinate value: ${x}`);
      }
    } else if (x instanceof Array) {
      coordinates.push(x);
    } else if (typeof x === 'number') {
      let y = args.shift();
      let z = args.shift();
      if (y === undefined) {
        y = 0;
      }
      if (z === undefined) {
        z = 0;
      }
      if (typeof y !== 'number') {
        throw Error(`Unexpected coordinate value: ${y}`);
      }
      if (typeof z !== 'number') {
        throw Error(`Unexpected coordinate value: ${z}`);
      }
      coordinates.push([x, y, z]);
    } else {
      throw Error(`Unexpected coordinate value: ${JSON.stringify(x)}`);
    }
  }
  return coordinates;
};

const fromGeometry = Shape.fromGeometry;
const toGeometry = (shape) => shape.toGeometry();

const updatePlan =
  (...updates) =>
  (shape) => {
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

Shape.registerMethod('updatePlan', updatePlan);

const hasAngle =
  (start = 0, end = 0) =>
  (shape) =>
    shape.updatePlan({ angle: { start: start, end: end } });
const hasBase = (base) => (shape) => shape.updatePlan({ base });
const hasAt =
  (x = 0, y = 0, z = 0) =>
  (shape) =>
    shape.updatePlan({
      at: [x, y, z],
    });
const hasCorner1 =
  (x = 0, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan({
      corner1: [x, y, z],
    });
const hasCorner2 =
  (x = 0, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan({
      corner2: [x, y, z],
    });
const hasDiameter =
  (x = 1, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan(
      { corner1: [x / 2, y / 2, z / 2] },
      { corner2: [x / -2, y / -2, z / -2] }
    );
const hasRadius =
  (x = 1, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan(
      {
        corner1: [x, y, z],
      },
      {
        corner2: [-x, -y, -z],
      }
    );
const hasApothem =
  (x = 1, y = x, z = 0) =>
  (shape) =>
    shape.updatePlan(
      {
        corner1: [x, y, z],
      },
      {
        corner2: [-x, -y, -z],
      },
      { apothem: [x, y, z] }
    );
const hasFrom =
  (x = 0, y = 0, z = 0) =>
  (shape) =>
    shape.updatePlan({ from: [x, y, z] });
const hasSides =
  (sides = 1) =>
  (shape) =>
    shape.updatePlan({ sides });
const hasTo =
  (x = 0, y = 0, z = 0) =>
  (shape) =>
    shape.updatePlan({ to: [x, y, z], top: undefined });
const hasTop = (top) => (shape) => shape.updatePlan({ top });
const hasUp =
  (x = 0, y = 0, z = 0) =>
  (shape) =>
    shape.updatePlan({ up: [x, y, z], top: undefined });
const hasZag = (zag) => (shape) => shape.updatePlan({ zag });

// Let's consider migrating to a 'has' prefix for planning.

Shape.registerMethod('hasApothem', hasApothem);
Shape.registerMethod('hasAngle', hasAngle);
Shape.registerMethod('hasAt', hasAt);
Shape.registerMethod('hasBase', hasBase);
Shape.registerMethod('hasCorner1', hasCorner1);
Shape.registerMethod('hasC1', hasCorner1);
Shape.registerMethod('hasCorner2', hasCorner2);
Shape.registerMethod('hasC2', hasCorner2);
Shape.registerMethod('hasDiameter', hasDiameter);
Shape.registerMethod('hasFrom', hasFrom);
Shape.registerMethod('hasRadius', hasRadius);
Shape.registerMethod('hasSides', hasSides);
Shape.registerMethod('hasTo', hasTo);
Shape.registerMethod('hasTop', hasTop);
Shape.registerMethod('hasUp', hasUp);
Shape.registerMethod('hasZag', hasZag);

const eachEntry = (geometry, op, otherwise) => {
  if (geometry.plan.history) {
    for (let nth = geometry.plan.history.length - 1; nth >= 0; nth--) {
      const result = op(geometry.plan.history[nth]);
      if (result !== undefined) {
        return result;
      }
    }
  }
  return otherwise;
};

const find = (geometry, key, otherwise) =>
  eachEntry(
    geometry,
    (entry) => {
      return entry[key];
    },
    otherwise
  );

const ofPlan = find;

const getAngle = (geometry) => find(geometry, 'angle', {});
const getCorner1 = (geometry) => find(geometry, 'corner1', [0, 0, 0]);
const getCorner2 = (geometry) => find(geometry, 'corner2', [0, 0, 0]);
const getMatrix = (geometry) => geometry.matrix || identityMatrix;

const defaultZag = 0.01;

const getSides = (geometry, otherwise = 32) => {
  const [scale] = getScale(geometry);
  let [length, width] = abs(scale);
  {
    otherwise = zag(Math.max(length, width) * 2, defaultZag);
  }
  return eachEntry(
    geometry,
    (entry) => {
      if (entry.sides !== undefined) {
        return entry.sides;
      } else if (entry.zag !== undefined) {
        return zag(Math.max(length, width), entry.zag);
      }
    },
    otherwise
  );
};

const getScale = (geometry) => {
  const corner1 = getCorner1(geometry);
  const corner2 = getCorner2(geometry);
  return [
    scale$1(0.5, subtract(corner1, corner2)),
    scale$1(0.5, add$1(corner1, corner2)),
  ];
};

const Plan = (type) => Shape.fromGeometry(taggedPlan({}, { type }));

Shape.registerReifier = (name, op) => {
  const finishedOp = (geometry) => {
    const shape = op(geometry);
    if (!(shape instanceof Shape)) {
      throw Error('Expected Shape');
    }
    return shape
      .transform(getMatrix(geometry))
      .setTags(geometry.tags)
      .toGeometry();
  };
  registerReifier(name, finishedOp);
  return finishedOp;
};

const define = (tag, data) => {
  const define = { tag, data };
  emit({ define, hash: computeHash(define) });
  return data;
};

const defRgbColor = (name, rgb) => define(`color:${name}`, { rgb });

const defThreejsMaterial = (name, definition) =>
  define(`material:${name}`, { threejsMaterial: definition });

const defTool = (name, definition) => define(`tool:${name}`, definition);

const GrblSpindle = ({
  cutDepth = 0.2,
  rpm,
  feedRate,
  drillRate,
  diameter,
  jumpZ = 1,
} = {}) => ({
  grbl: {
    type: 'spindle',
    cutDepth,
    cutSpeed: rpm,
    feedRate,
    drillRate,
    diameter,
    jumpZ,
  },
});

const GrblDynamicLaser = ({
  cutDepth = 0.2,
  diameter = 0.09,
  jumpPower = 0,
  power = 1000,
  speed = 1000,
  warmupDuration,
  warmupPower = 0,
} = {}) => ({
  grbl: {
    type: 'dynamicLaser',
    cutDepth,
    cutSpeed: -power,
    diameter,
    jumpRate: speed,
    jumpSpeed: -jumpPower,
    feedRate: speed,
    warmupDuration,
    warmupSpeed: -warmupPower,
  },
});

const GrblConstantLaser = ({
  cutDepth = 0.2,
  diameter = 0.09,
  jumpPower,
  power = 1000,
  speed = 1000,
  warmupDuration,
  warmupPower = 0,
} = {}) => ({
  grbl: {
    type: 'constantLaser',
    cutDepth,
    cutSpeed: power,
    diameter,
    jumpRate: speed,
    jumpSpeed: jumpPower,
    feedRate: speed,
    warmupDuration,
    warmupSpeed: warmupPower,
  },
});

const GrblPlotter = ({ feedRate = 1000, jumpZ = 1 } = {}) => ({
  grbl: { type: 'plotter', feedRate, jumpZ },
});

const md = (strings, ...placeholders) => {
  const md = strings.reduce(
    (result, string, i) => result + placeholders[i - 1] + string
  );
  emit({ md, hash: computeHash(md) });
  return md;
};

const mdMethod =
  (...chunks) =>
  (shape) => {
    const strings = [];
    for (const chunk of chunks) {
      if (chunk instanceof Function) {
        strings.push(chunk(shape));
      } else {
        strings.push(chunk);
      }
    }
    const md = strings.join('');
    emit({ md, hash: computeHash(md) });
    return shape;
  };

Shape.registerMethod('md', mdMethod);

const render = (abstract, shape) => {
  const graph = [];
  graph.push("'''mermaid");
  graph.push('graph LR;');

  let id = 0;
  const nextId = () => id++;

  const identify = ({ type, tags, content }) => {
    if (content) {
      return { type, tags, id: nextId(), content: content.map(identify) };
    } else {
      return { type, tags, id: nextId() };
    }
  };

  const render = ({ id, type, tags = [], content = [] }) => {
    graph.push(`  ${id}[${type}<br>${tags.join('<br>')}]`);
    for (const child of content) {
      graph.push(`  ${id} --> ${child.id};`);
      render(child);
    }
  };

  render(identify(abstract));

  graph.push("'''");

  return shape.md(graph.join('\n'));
};

const abstract =
  (op = render) =>
  (shape) => {
    const walk = ({ type, tags, plan, content }) => {
      if (type === 'group') {
        return content.flatMap(walk);
      } else if (type === 'plan') {
        return [{ type, plan }];
      } else if (content) {
        return [{ type, tags, content: content.flatMap(walk) }];
      } else {
        return [{ type, tags }];
      }
    };
    return op(taggedGroup({}, ...walk(shape.toGeometry())), shape);
  };

Shape.registerMethod('abstract', abstract);

const add =
  (...shapes) =>
  (shape) =>
    Shape.fromGeometry(
      union(
        shape.toGeometry(),
        ...shapes.map((other) => Shape.toShape(other, shape).toGeometry())
      )
    );

Shape.registerMethod('add', add);
Shape.registerMethod('join', add);

const and =
  (...args) =>
  (shape) =>
    Shape.fromGeometry(
      taggedGroup(
        {},
        shape.toGeometry(),
        ...shape.toShapes(args).map((shape) => shape.toGeometry())
      )
    );

Shape.registerMethod('and', and);

const addTo = (other) => (shape) => other.add(shape);
Shape.registerMethod('addTo', addTo);

const X$6 = 0;
const Y$6 = 1;
const Z$6 = 2;

// Round to the nearest 0.001 mm

const round = (v) => Math.round(v * 1000) / 1000;

const roundCoordinate = ([x, y, z]) => [round(x), round(y), round(z)];

const align =
  (spec = 'xyz', origin = [0, 0, 0]) =>
  (shape) =>
    shape.size(({ max, min, center }, shape) => {
      // This is producing very small deviations.
      // FIX: Try a more principled approach.
      max = roundCoordinate(max);
      min = roundCoordinate(min);
      center = roundCoordinate(center);
      const offset = [0, 0, 0];
      let index = 0;
      while (index < spec.length) {
        switch (spec[index++]) {
          case 'x': {
            switch (spec[index]) {
              case '>':
                offset[X$6] = -min[X$6];
                index += 1;
                break;
              case '<':
                offset[X$6] = -max[X$6];
                index += 1;
                break;
              default:
                offset[X$6] = -center[X$6];
            }
            break;
          }
          case 'y': {
            switch (spec[index]) {
              case '>':
                offset[Y$6] = -min[Y$6];
                index += 1;
                break;
              case '<':
                offset[Y$6] = -max[Y$6];
                index += 1;
                break;
              default:
                offset[Y$6] = -center[Y$6];
            }
            break;
          }
          case 'z': {
            switch (spec[index]) {
              case '>':
                offset[Z$6] = -min[Z$6];
                index += 1;
                break;
              case '<':
                offset[Z$6] = -max[Z$6];
                index += 1;
                break;
              default:
                offset[Z$6] = -center[Z$6];
            }
            break;
          }
        }
      }
      const moved = shape.move(...add$1(offset, origin));
      return moved;
    });

Shape.registerMethod('align', align);

// Constructs an item from the designator.
const as =
  (...names) =>
  (shape) =>
    Shape.fromGeometry(
      taggedItem(
        { tags: names.map((name) => `item:${name}`) },
        shape.toGeometry()
      )
    );

Shape.registerMethod('as', as);

// Constructs an item, as a part, from the designator.
const asPart = (partName) => (shape) =>
  Shape.fromGeometry(
    taggedItem({ tags: [`part:${partName}`] }, shape.toGeometry())
  );

Shape.registerMethod('asPart', asPart);

const at =
  (selection, ...ops) =>
  (shape) => {
    if (ops.length === 0) {
      ops.push(() => shape);
    }
    ops = ops.map((op) => (op instanceof Function ? op : () => op));
    // We've already selected the item for reference, e.g., s.on(g('plate'), ...);
    if (selection instanceof Function) {
      selection = selection(shape);
    }
    for (const leaf of getLeafs(selection.toGeometry())) {
      const { global, local } = getInverseMatrices(leaf);
      // Switch to the local coordinate space, perform the operation, and come back to the global coordinate space.
      shape = shape
        .transform(local)
        .op(...ops)
        .transform(global);
    }
    return shape;
  };

Shape.registerMethod('at', at);

const bend =
  (radius = 100) =>
  (shape) =>
    Shape.fromGeometry(bend$1(shape.toGeometry(), radius));

Shape.registerMethod('bend', bend);

// Is this better than s.get('part:*').tags('part')?
const billOfMaterials =
  (op = (list) => list) =>
  (shape) =>
    shape.get('part:*').tags('part', op);

Shape.registerMethod('billOfMaterials', billOfMaterials);
Shape.registerMethod('bom', billOfMaterials);

const cast =
  (plane = [0, 0, 1, 0], direction = [0, 0, 1, 0]) =>
  (shape) =>
    Shape.fromGeometry(
      projectToPlane(shape.toGeometry(), plane, direction)
    );

Shape.registerMethod('cast', cast);

const center = () => (shape) =>
  Shape.fromGeometry(computeCentroid(shape.toGeometry()));

Shape.registerMethod('center', center);

const clip =
  (...shapes) =>
  (shape) =>
    Shape.fromGeometry(
      intersection(
        shape.toGeometry(),
        ...shapes.map((other) => Shape.toShape(other, shape).toGeometry())
      )
    );

Shape.registerMethod('clip', clip);

const clipFrom = (other) => (shape) => other.clip(shape);
Shape.registerMethod('clipFrom', clipFrom);

const color = (name) => (shape) =>
  shape.untag('color:*').tag(...toTagsFromName(name));

Shape.registerMethod('color', color);

const colors =
  (op = (colors, shape) => colors) =>
  (shape) =>
    op(
      [...allTags(shape.toGeometry())]
        .filter((tag) => tag.startsWith('color/'))
        .map((tag) => tag.substring(6)),
      shape
    );

Shape.registerMethod('colors', colors);

const cloudSolid = () => (shape) => {
  const points = shape.toPoints();
  return Shape.fromGeometry(fromPointsToGraph({}, points));
};

Shape.registerMethod('cloudSolid', cloudSolid);

const withCloudSolid = () => (shape) => shape.with(cloudSolid());

Shape.registerMethod('withCloudSolid', withCloudSolid);

const cut =
  (...shapes) =>
  (shape) =>
    Shape.fromGeometry(
      cut$1(
        shape.toGeometry(),
        shape.toShapes(shapes).map((other) => other.toGeometry())
      )
    );

Shape.registerMethod('cut', cut);

const cutFrom = (other) => (shape) =>
  Shape.toShape(other, shape).cut(shape);
Shape.registerMethod('cutFrom', cutFrom);

const cutout =
  (other, op = (clipped) => clipped.void()) =>
  (shape) => {
    other = Shape.toShape(other, shape);
    return shape.cut(other).and(op(shape.clip(other)));
  };
Shape.registerMethod('cutout', cutout);

const Group = (...shapes) =>
  Shape.fromGeometry(
    taggedGroup(
      {},
      ...Shape.toShapes(shapes).map((shape) => shape.toGeometry())
    )
  );

Shape.prototype.Group = Shape.shapeMethod(Group);
Shape.Group = Group;

const qualifyTag = (tag, namespace = 'user') => {
  if (tag.includes(':')) {
    return tag;
  }
  return `${namespace}:${tag}`;
};

const tagMatcher = (tag, namespace = 'user') => {
  const qualifiedTag = qualifyTag(tag, namespace);
  if (qualifiedTag.endsWith(':*')) {
    const [namespace] = qualifiedTag.split(':');
    const prefix = `${namespace}:`;
    return (tag) => tag.startsWith(prefix);
  } else {
    return (tag) => tag === qualifiedTag;
  }
};

const oneOfTagMatcher = (tags, namespace = 'user') => {
  const matchers = tags.map((tag) => tagMatcher(tag, namespace));
  const isMatch = (tag) => {
    for (const matcher of matchers) {
      if (matcher(tag)) {
        return true;
      }
    }
    return false;
  };
  return isMatch;
};

const tagGeometry = (geometry, tags) => {
  const tagsToAdd = tags.map((tag) => qualifyTag(tag, 'user'));
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'group':
      case 'layout': {
        return descend();
      }
      default: {
        const tags = [...(geometry.tags || [])];
        for (const tagToAdd of tagsToAdd) {
          if (!tags.includes(tagToAdd)) {
            tags.push(tagToAdd);
          }
        }
        return descend({ tags });
      }
    }
  };
  return rewrite(geometry, op);
};

const tag =
  (...tags) =>
  (shape) =>
    Shape.fromGeometry(tagGeometry(shape.toGeometry(), tags));

Shape.registerMethod('tag', tag);

const get =
  (...tags) =>
  (shape) => {
    const isMatch = oneOfTagMatcher(tags, 'item');
    const picks = [];
    const walk = (geometry, descend) => {
      const { tags, type } = geometry;
      if (type === 'group') {
        return descend();
      }
      for (const tag of tags) {
        if (isMatch(tag)) {
          picks.push(Shape.fromGeometry(geometry));
          break;
        }
      }
      if (type !== 'item') {
        return descend();
      }
    };
    const geometry = shape.toGeometry();
    if (geometry.type === 'item') {
      // FIX: Can we make this less magical?
      // This allows constructions like s.get('a').get('b')
      visit(geometry.content[0], walk);
    } else {
      visit(geometry, walk);
    }
    return Group(...picks);
  };

const g = get;

Shape.registerMethod('get', get);
Shape.registerMethod('g', get);

const voidFn = () => (shape) =>
  Shape.fromGeometry(hasTypeVoid(shape.toGeometry()));

Shape.registerMethod('void', voidFn);

const drop = (tag) => (shape) => shape.on(get(tag), voidFn());

Shape.registerMethod('drop', drop);

const Edge = (source = 1, target = 0) =>
  Shape.fromSegments([
    Shape.toCoordinate(undefined, source),
    Shape.toCoordinate(undefined, target),
  ]);

Shape.prototype.Edge = Shape.shapeMethod(Edge);

const Face = (...points) =>
  Shape.fromPolygons([
    { points: points.map((point) => Shape.toCoordinate(undefined, point)) },
  ]);

Shape.prototype.Face = Shape.shapeMethod(Face);

const Point = (...args) =>
  Shape.fromPoint(Shape.toCoordinate(undefined, ...args));

Shape.prototype.Point = Shape.shapeMethod(Point);

const ofPointPaths = (points = [], paths = []) => {
  const polygons = [];
  for (const path of paths) {
    polygons.push({ points: path.map((point) => points[point]) });
  }
  return Shape.fromPolygons(polygons);
};

const ofPolygons = (...polygons) => {
  const out = [];
  for (const polygon of polygons) {
    if (polygon instanceof Array) {
      out.push({ points: polygon });
    } else if (polygon instanceof Shape) {
      out.push({ points: polygon.toPoints() });
    }
  }
  return Shape.fromPolygons(out);
};

const Polyhedron = (...args) => ofPolygons(...args);

Polyhedron.ofPointPaths = ofPointPaths;

Shape.prototype.Polyhedron = Shape.shapeMethod(Polyhedron);

const X$5 = 0;
const Y$5 = 1;
const Z$5 = 2;

const reifyBox = (geometry) => {
  const build = () => {
    const corner1 = getCorner1(geometry);
    const corner2 = getCorner2(geometry);

    const left = corner1[X$5];
    const right = corner2[X$5];

    const front = corner1[Y$5];
    const back = corner2[Y$5];

    const bottom = corner1[Z$5];
    const top = corner2[Z$5];

    if (top === bottom) {
      if (left === right) {
        if (front === back) {
          return Point(bottom, left, front);
        } else {
          return Edge(Point(left, front, bottom), Point(right, back, top));
        }
      } else {
        if (front === back) {
          return Edge(Point(left, front, bottom), Point(right, back, top));
        } else {
          // left !== right && front !== back
          return Face(
            Point(left, back, bottom),
            Point(left, front, bottom),
            Point(right, front, top),
            Point(right, back, top)
          );
        }
      }
    } else {
      if (left === right) {
        if (front === back) {
          return Edge(Point(left, front, bottom), Point(right, back, top));
        } else {
          // top !== bottom && front !== back
          return Face(
            Point(right, back, top),
            Point(right, front, top),
            Point(right, front, bottom),
            Point(left, back, bottom)
          );
        }
      } else {
        if (front === back) {
          // top !== bottom && left !== right
          return Face(
            Point(left, back, top),
            Point(right, front, top),
            Point(right, front, bottom),
            Point(left, back, bottom)
          );
        } else {
          // top !== bottom && front !== back && left !== right
          return Polyhedron(
            Face(
              Point(left, back, top),
              Point(left, front, top),
              Point(right, front, top),
              Point(right, back, top)
            ),
            Face(
              Point(left, back, bottom),
              Point(left, front, bottom),
              Point(right, front, bottom),
              Point(right, back, bottom)
            ),
            Face(
              Point(left, back, bottom),
              Point(left, front, bottom),
              Point(left, front, top),
              Point(left, back, top)
            ),
            Face(
              Point(right, back, bottom),
              Point(right, front, bottom),
              Point(right, front, top),
              Point(right, back, top)
            ),
            Face(
              Point(left, back, bottom),
              Point(right, back, bottom),
              Point(right, back, top),
              Point(left, back, top)
            ),
            Face(
              Point(left, front, bottom),
              Point(right, front, bottom),
              Point(right, front, top),
              Point(left, front, top)
            )
          );
        }
      }
    }
  };

  return build().tag(...geometry.tags);
};

Shape.registerReifier('Box', reifyBox);

const Box = (x, y = x, z = 0) => {
  const c1 = [0, 0, 0];
  const c2 = [0, 0, 0];
  if (x instanceof Array) {
    if (x[0] < x[1]) {
      c1[X$5] = x[1];
      c2[X$5] = x[0];
    } else {
      c1[X$5] = x[0];
      c2[X$5] = x[1];
    }
  } else {
    c1[X$5] = x / 2;
    c2[X$5] = x / -2;
  }
  if (y instanceof Array) {
    if (y[0] < y[1]) {
      c1[Y$5] = y[1];
      c2[Y$5] = y[0];
    } else {
      c1[Y$5] = y[0];
      c2[Y$5] = y[1];
    }
  } else {
    c1[Y$5] = y / 2;
    c2[Y$5] = y / -2;
  }
  if (z instanceof Array) {
    if (z[0] < z[1]) {
      c1[Z$5] = z[1];
      c2[Z$5] = z[0];
    } else {
      c1[Z$5] = z[0];
      c2[Z$5] = z[1];
    }
  } else {
    c1[Z$5] = z / 2;
    c2[Z$5] = z / -2;
  }
  return Shape.fromGeometry(taggedPlan({}, { type: 'Box' }))
    .hasC1(...c1)
    .hasC2(...c2);
};

Shape.prototype.Box = Shape.shapeMethod(Box);

// Hershey simplex one line font.
// See: http://paulbourke.net/dataformats/hershey/

const hersheyPaths = {
  32: [[null]],
  33: [
    [null, [5, 21, 0], [5, 7, 0]],
    [null, [5, 2, 0], [4, 1, 0], [5, 0, 0], [6, 1, 0], [5, 2, 0]],
    [null],
  ],
  34: [
    [null, [4, 21, 0], [4, 14, 0]],
    [null, [12, 21, 0], [12, 14, 0]],
    [null],
  ],
  35: [
    [null, [11, 25, 0], [4, -7, 0]],
    [null, [17, 25, 0], [10, -7, 0]],
    [null, [4, 12, 0], [18, 12, 0]],
    [null, [3, 6, 0], [17, 6, 0]],
    [null],
  ],
  36: [
    [null, [8, 25, 0], [8, -4, 0]],
    [null, [12, 25, 0], [12, -4, 0]],
    [
      null,
      [17, 18, 0],
      [15, 20, 0],
      [12, 21, 0],
      [8, 21, 0],
      [5, 20, 0],
      [3, 18, 0],
      [3, 16, 0],
      [4, 14, 0],
      [5, 13, 0],
      [7, 12, 0],
      [13, 10, 0],
      [15, 9, 0],
      [16, 8, 0],
      [17, 6, 0],
      [17, 3, 0],
      [15, 1, 0],
      [12, 0, 0],
      [8, 0, 0],
      [5, 1, 0],
      [3, 3, 0],
    ],
    [null],
  ],
  37: [
    [null, [21, 21, 0], [3, 0, 0]],
    [
      null,
      [8, 21, 0],
      [10, 19, 0],
      [10, 17, 0],
      [9, 15, 0],
      [7, 14, 0],
      [5, 14, 0],
      [3, 16, 0],
      [3, 18, 0],
      [4, 20, 0],
      [6, 21, 0],
      [8, 21, 0],
      [10, 20, 0],
      [13, 19, 0],
      [16, 19, 0],
      [19, 20, 0],
      [21, 21, 0],
    ],
    [
      null,
      [17, 7, 0],
      [15, 6, 0],
      [14, 4, 0],
      [14, 2, 0],
      [16, 0, 0],
      [18, 0, 0],
      [20, 1, 0],
      [21, 3, 0],
      [21, 5, 0],
      [19, 7, 0],
      [17, 7, 0],
    ],
    [null],
  ],
  38: [
    [
      null,
      [23, 12, 0],
      [23, 13, 0],
      [22, 14, 0],
      [21, 14, 0],
      [20, 13, 0],
      [19, 11, 0],
      [17, 6, 0],
      [15, 3, 0],
      [13, 1, 0],
      [11, 0, 0],
      [7, 0, 0],
      [5, 1, 0],
      [4, 2, 0],
      [3, 4, 0],
      [3, 6, 0],
      [4, 8, 0],
      [5, 9, 0],
      [12, 13, 0],
      [13, 14, 0],
      [14, 16, 0],
      [14, 18, 0],
      [13, 20, 0],
      [11, 21, 0],
      [9, 20, 0],
      [8, 18, 0],
      [8, 16, 0],
      [9, 13, 0],
      [11, 10, 0],
      [16, 3, 0],
      [18, 1, 0],
      [20, 0, 0],
      [22, 0, 0],
      [23, 1, 0],
      [23, 2, 0],
    ],
    [null],
  ],
  39: [
    [
      null,
      [5, 19, 0],
      [4, 20, 0],
      [5, 21, 0],
      [6, 20, 0],
      [6, 18, 0],
      [5, 16, 0],
      [4, 15, 0],
    ],
    [null],
  ],
  40: [
    [
      null,
      [11, 25, 0],
      [9, 23, 0],
      [7, 20, 0],
      [5, 16, 0],
      [4, 11, 0],
      [4, 7, 0],
      [5, 2, 0],
      [7, -2, 0],
      [9, -5, 0],
      [11, -7, 0],
    ],
    [null],
  ],
  41: [
    [
      null,
      [3, 25, 0],
      [5, 23, 0],
      [7, 20, 0],
      [9, 16, 0],
      [10, 11, 0],
      [10, 7, 0],
      [9, 2, 0],
      [7, -2, 0],
      [5, -5, 0],
      [3, -7, 0],
    ],
    [null],
  ],
  42: [
    [null, [8, 21, 0], [8, 9, 0]],
    [null, [3, 18, 0], [13, 12, 0]],
    [null, [13, 18, 0], [3, 12, 0]],
    [null],
  ],
  43: [[null, [13, 18, 0], [13, 0, 0]], [null, [4, 9, 0], [22, 9, 0]], [null]],
  44: [
    [
      null,
      [6, 1, 0],
      [5, 0, 0],
      [4, 1, 0],
      [5, 2, 0],
      [6, 1, 0],
      [6, -1, 0],
      [5, -3, 0],
      [4, -4, 0],
    ],
    [null],
  ],
  45: [[null, [4, 9, 0], [22, 9, 0]], [null]],
  46: [[null, [5, 2, 0], [4, 1, 0], [5, 0, 0], [6, 1, 0], [5, 2, 0]], [null]],
  47: [[null, [20, 25, 0], [2, -7, 0]], [null]],
  48: [
    [
      null,
      [9, 21, 0],
      [6, 20, 0],
      [4, 17, 0],
      [3, 12, 0],
      [3, 9, 0],
      [4, 4, 0],
      [6, 1, 0],
      [9, 0, 0],
      [11, 0, 0],
      [14, 1, 0],
      [16, 4, 0],
      [17, 9, 0],
      [17, 12, 0],
      [16, 17, 0],
      [14, 20, 0],
      [11, 21, 0],
      [9, 21, 0],
    ],
    [null],
  ],
  49: [[null, [6, 17, 0], [8, 18, 0], [11, 21, 0], [11, 0, 0]], [null]],
  50: [
    [
      null,
      [4, 16, 0],
      [4, 17, 0],
      [5, 19, 0],
      [6, 20, 0],
      [8, 21, 0],
      [12, 21, 0],
      [14, 20, 0],
      [15, 19, 0],
      [16, 17, 0],
      [16, 15, 0],
      [15, 13, 0],
      [13, 10, 0],
      [3, 0, 0],
      [17, 0, 0],
    ],
    [null],
  ],
  51: [
    [
      null,
      [5, 21, 0],
      [16, 21, 0],
      [10, 13, 0],
      [13, 13, 0],
      [15, 12, 0],
      [16, 11, 0],
      [17, 8, 0],
      [17, 6, 0],
      [16, 3, 0],
      [14, 1, 0],
      [11, 0, 0],
      [8, 0, 0],
      [5, 1, 0],
      [4, 2, 0],
      [3, 4, 0],
    ],
    [null],
  ],
  52: [
    [null, [13, 21, 0], [3, 7, 0], [18, 7, 0]],
    [null, [13, 21, 0], [13, 0, 0]],
    [null],
  ],
  53: [
    [
      null,
      [15, 21, 0],
      [5, 21, 0],
      [4, 12, 0],
      [5, 13, 0],
      [8, 14, 0],
      [11, 14, 0],
      [14, 13, 0],
      [16, 11, 0],
      [17, 8, 0],
      [17, 6, 0],
      [16, 3, 0],
      [14, 1, 0],
      [11, 0, 0],
      [8, 0, 0],
      [5, 1, 0],
      [4, 2, 0],
      [3, 4, 0],
    ],
    [null],
  ],
  54: [
    [
      null,
      [16, 18, 0],
      [15, 20, 0],
      [12, 21, 0],
      [10, 21, 0],
      [7, 20, 0],
      [5, 17, 0],
      [4, 12, 0],
      [4, 7, 0],
      [5, 3, 0],
      [7, 1, 0],
      [10, 0, 0],
      [11, 0, 0],
      [14, 1, 0],
      [16, 3, 0],
      [17, 6, 0],
      [17, 7, 0],
      [16, 10, 0],
      [14, 12, 0],
      [11, 13, 0],
      [10, 13, 0],
      [7, 12, 0],
      [5, 10, 0],
      [4, 7, 0],
    ],
    [null],
  ],
  55: [[null, [17, 21, 0], [7, 0, 0]], [null, [3, 21, 0], [17, 21, 0]], [null]],
  56: [
    [
      null,
      [8, 21, 0],
      [5, 20, 0],
      [4, 18, 0],
      [4, 16, 0],
      [5, 14, 0],
      [7, 13, 0],
      [11, 12, 0],
      [14, 11, 0],
      [16, 9, 0],
      [17, 7, 0],
      [17, 4, 0],
      [16, 2, 0],
      [15, 1, 0],
      [12, 0, 0],
      [8, 0, 0],
      [5, 1, 0],
      [4, 2, 0],
      [3, 4, 0],
      [3, 7, 0],
      [4, 9, 0],
      [6, 11, 0],
      [9, 12, 0],
      [13, 13, 0],
      [15, 14, 0],
      [16, 16, 0],
      [16, 18, 0],
      [15, 20, 0],
      [12, 21, 0],
      [8, 21, 0],
    ],
    [null],
  ],
  57: [
    [
      null,
      [16, 14, 0],
      [15, 11, 0],
      [13, 9, 0],
      [10, 8, 0],
      [9, 8, 0],
      [6, 9, 0],
      [4, 11, 0],
      [3, 14, 0],
      [3, 15, 0],
      [4, 18, 0],
      [6, 20, 0],
      [9, 21, 0],
      [10, 21, 0],
      [13, 20, 0],
      [15, 18, 0],
      [16, 14, 0],
      [16, 9, 0],
      [15, 4, 0],
      [13, 1, 0],
      [10, 0, 0],
      [8, 0, 0],
      [5, 1, 0],
      [4, 3, 0],
    ],
    [null],
  ],
  58: [
    [null, [5, 14, 0], [4, 13, 0], [5, 12, 0], [6, 13, 0], [5, 14, 0]],
    [null, [5, 2, 0], [4, 1, 0], [5, 0, 0], [6, 1, 0], [5, 2, 0]],
    [null],
  ],
  59: [
    [null, [5, 14, 0], [4, 13, 0], [5, 12, 0], [6, 13, 0], [5, 14, 0]],
    [
      null,
      [6, 1, 0],
      [5, 0, 0],
      [4, 1, 0],
      [5, 2, 0],
      [6, 1, 0],
      [6, -1, 0],
      [5, -3, 0],
      [4, -4, 0],
    ],
    [null],
  ],
  60: [[null, [20, 18, 0], [4, 9, 0], [20, 0, 0]], [null]],
  61: [[null, [4, 12, 0], [22, 12, 0]], [null, [4, 6, 0], [22, 6, 0]], [null]],
  62: [[null, [4, 18, 0], [20, 9, 0], [4, 0, 0]], [null]],
  63: [
    [
      null,
      [3, 16, 0],
      [3, 17, 0],
      [4, 19, 0],
      [5, 20, 0],
      [7, 21, 0],
      [11, 21, 0],
      [13, 20, 0],
      [14, 19, 0],
      [15, 17, 0],
      [15, 15, 0],
      [14, 13, 0],
      [13, 12, 0],
      [9, 10, 0],
      [9, 7, 0],
    ],
    [null, [9, 2, 0], [8, 1, 0], [9, 0, 0], [10, 1, 0], [9, 2, 0]],
    [null],
  ],
  64: [
    [
      null,
      [18, 13, 0],
      [17, 15, 0],
      [15, 16, 0],
      [12, 16, 0],
      [10, 15, 0],
      [9, 14, 0],
      [8, 11, 0],
      [8, 8, 0],
      [9, 6, 0],
      [11, 5, 0],
      [14, 5, 0],
      [16, 6, 0],
      [17, 8, 0],
    ],
    [
      null,
      [12, 16, 0],
      [10, 14, 0],
      [9, 11, 0],
      [9, 8, 0],
      [10, 6, 0],
      [11, 5, 0],
    ],
    [
      null,
      [18, 16, 0],
      [17, 8, 0],
      [17, 6, 0],
      [19, 5, 0],
      [21, 5, 0],
      [23, 7, 0],
      [24, 10, 0],
      [24, 12, 0],
      [23, 15, 0],
      [22, 17, 0],
      [20, 19, 0],
      [18, 20, 0],
      [15, 21, 0],
      [12, 21, 0],
      [9, 20, 0],
      [7, 19, 0],
      [5, 17, 0],
      [4, 15, 0],
      [3, 12, 0],
      [3, 9, 0],
      [4, 6, 0],
      [5, 4, 0],
      [7, 2, 0],
      [9, 1, 0],
      [12, 0, 0],
      [15, 0, 0],
      [18, 1, 0],
      [20, 2, 0],
      [21, 3, 0],
    ],
    [null, [19, 16, 0], [18, 8, 0], [18, 6, 0], [19, 5, 0]],
  ],
  65: [
    [null, [9, 21, 0], [1, 0, 0]],
    [null, [9, 21, 0], [17, 0, 0]],
    [null, [4, 7, 0], [14, 7, 0]],
    [null],
  ],
  66: [
    [null, [4, 21, 0], [4, 0, 0]],
    [
      null,
      [4, 21, 0],
      [13, 21, 0],
      [16, 20, 0],
      [17, 19, 0],
      [18, 17, 0],
      [18, 15, 0],
      [17, 13, 0],
      [16, 12, 0],
      [13, 11, 0],
    ],
    [
      null,
      [4, 11, 0],
      [13, 11, 0],
      [16, 10, 0],
      [17, 9, 0],
      [18, 7, 0],
      [18, 4, 0],
      [17, 2, 0],
      [16, 1, 0],
      [13, 0, 0],
      [4, 0, 0],
    ],
    [null],
  ],
  67: [
    [
      null,
      [18, 16, 0],
      [17, 18, 0],
      [15, 20, 0],
      [13, 21, 0],
      [9, 21, 0],
      [7, 20, 0],
      [5, 18, 0],
      [4, 16, 0],
      [3, 13, 0],
      [3, 8, 0],
      [4, 5, 0],
      [5, 3, 0],
      [7, 1, 0],
      [9, 0, 0],
      [13, 0, 0],
      [15, 1, 0],
      [17, 3, 0],
      [18, 5, 0],
    ],
    [null],
  ],
  68: [
    [null, [4, 21, 0], [4, 0, 0]],
    [
      null,
      [4, 21, 0],
      [11, 21, 0],
      [14, 20, 0],
      [16, 18, 0],
      [17, 16, 0],
      [18, 13, 0],
      [18, 8, 0],
      [17, 5, 0],
      [16, 3, 0],
      [14, 1, 0],
      [11, 0, 0],
      [4, 0, 0],
    ],
    [null],
  ],
  69: [
    [null, [4, 21, 0], [4, 0, 0]],
    [null, [4, 21, 0], [17, 21, 0]],
    [null, [4, 11, 0], [12, 11, 0]],
    [null, [4, 0, 0], [17, 0, 0]],
    [null],
  ],
  70: [
    [null, [4, 21, 0], [4, 0, 0]],
    [null, [4, 21, 0], [17, 21, 0]],
    [null, [4, 11, 0], [12, 11, 0]],
    [null],
  ],
  71: [
    [
      null,
      [18, 16, 0],
      [17, 18, 0],
      [15, 20, 0],
      [13, 21, 0],
      [9, 21, 0],
      [7, 20, 0],
      [5, 18, 0],
      [4, 16, 0],
      [3, 13, 0],
      [3, 8, 0],
      [4, 5, 0],
      [5, 3, 0],
      [7, 1, 0],
      [9, 0, 0],
      [13, 0, 0],
      [15, 1, 0],
      [17, 3, 0],
      [18, 5, 0],
      [18, 8, 0],
    ],
    [null, [13, 8, 0], [18, 8, 0]],
    [null],
  ],
  72: [
    [null, [4, 21, 0], [4, 0, 0]],
    [null, [18, 21, 0], [18, 0, 0]],
    [null, [4, 11, 0], [18, 11, 0]],
    [null],
  ],
  73: [[null, [4, 21, 0], [4, 0, 0]], [null]],
  74: [
    [
      null,
      [12, 21, 0],
      [12, 5, 0],
      [11, 2, 0],
      [10, 1, 0],
      [8, 0, 0],
      [6, 0, 0],
      [4, 1, 0],
      [3, 2, 0],
      [2, 5, 0],
      [2, 7, 0],
    ],
    [null],
  ],
  75: [
    [null, [4, 21, 0], [4, 0, 0]],
    [null, [18, 21, 0], [4, 7, 0]],
    [null, [9, 12, 0], [18, 0, 0]],
    [null],
  ],
  76: [[null, [4, 21, 0], [4, 0, 0]], [null, [4, 0, 0], [16, 0, 0]], [null]],
  77: [
    [null, [4, 21, 0], [4, 0, 0]],
    [null, [4, 21, 0], [12, 0, 0]],
    [null, [20, 21, 0], [12, 0, 0]],
    [null, [20, 21, 0], [20, 0, 0]],
    [null],
  ],
  78: [
    [null, [4, 21, 0], [4, 0, 0]],
    [null, [4, 21, 0], [18, 0, 0]],
    [null, [18, 21, 0], [18, 0, 0]],
    [null],
  ],
  79: [
    [
      null,
      [9, 21, 0],
      [7, 20, 0],
      [5, 18, 0],
      [4, 16, 0],
      [3, 13, 0],
      [3, 8, 0],
      [4, 5, 0],
      [5, 3, 0],
      [7, 1, 0],
      [9, 0, 0],
      [13, 0, 0],
      [15, 1, 0],
      [17, 3, 0],
      [18, 5, 0],
      [19, 8, 0],
      [19, 13, 0],
      [18, 16, 0],
      [17, 18, 0],
      [15, 20, 0],
      [13, 21, 0],
      [9, 21, 0],
    ],
    [null],
  ],
  80: [
    [null, [4, 21, 0], [4, 0, 0]],
    [
      null,
      [4, 21, 0],
      [13, 21, 0],
      [16, 20, 0],
      [17, 19, 0],
      [18, 17, 0],
      [18, 14, 0],
      [17, 12, 0],
      [16, 11, 0],
      [13, 10, 0],
      [4, 10, 0],
    ],
    [null],
  ],
  81: [
    [
      null,
      [9, 21, 0],
      [7, 20, 0],
      [5, 18, 0],
      [4, 16, 0],
      [3, 13, 0],
      [3, 8, 0],
      [4, 5, 0],
      [5, 3, 0],
      [7, 1, 0],
      [9, 0, 0],
      [13, 0, 0],
      [15, 1, 0],
      [17, 3, 0],
      [18, 5, 0],
      [19, 8, 0],
      [19, 13, 0],
      [18, 16, 0],
      [17, 18, 0],
      [15, 20, 0],
      [13, 21, 0],
      [9, 21, 0],
    ],
    [null, [12, 4, 0], [18, -2, 0]],
    [null],
  ],
  82: [
    [null, [4, 21, 0], [4, 0, 0]],
    [
      null,
      [4, 21, 0],
      [13, 21, 0],
      [16, 20, 0],
      [17, 19, 0],
      [18, 17, 0],
      [18, 15, 0],
      [17, 13, 0],
      [16, 12, 0],
      [13, 11, 0],
      [4, 11, 0],
    ],
    [null, [11, 11, 0], [18, 0, 0]],
    [null],
  ],
  83: [
    [
      null,
      [17, 18, 0],
      [15, 20, 0],
      [12, 21, 0],
      [8, 21, 0],
      [5, 20, 0],
      [3, 18, 0],
      [3, 16, 0],
      [4, 14, 0],
      [5, 13, 0],
      [7, 12, 0],
      [13, 10, 0],
      [15, 9, 0],
      [16, 8, 0],
      [17, 6, 0],
      [17, 3, 0],
      [15, 1, 0],
      [12, 0, 0],
      [8, 0, 0],
      [5, 1, 0],
      [3, 3, 0],
    ],
    [null],
  ],
  84: [[null, [8, 21, 0], [8, 0, 0]], [null, [1, 21, 0], [15, 21, 0]], [null]],
  85: [
    [
      null,
      [4, 21, 0],
      [4, 6, 0],
      [5, 3, 0],
      [7, 1, 0],
      [10, 0, 0],
      [12, 0, 0],
      [15, 1, 0],
      [17, 3, 0],
      [18, 6, 0],
      [18, 21, 0],
    ],
    [null],
  ],
  86: [[null, [1, 21, 0], [9, 0, 0]], [null, [17, 21, 0], [9, 0, 0]], [null]],
  87: [
    [null, [2, 21, 0], [7, 0, 0]],
    [null, [12, 21, 0], [7, 0, 0]],
    [null, [12, 21, 0], [17, 0, 0]],
    [null, [22, 21, 0], [17, 0, 0]],
    [null],
  ],
  88: [[null, [3, 21, 0], [17, 0, 0]], [null, [17, 21, 0], [3, 0, 0]], [null]],
  89: [
    [null, [1, 21, 0], [9, 11, 0], [9, 0, 0]],
    [null, [17, 21, 0], [9, 11, 0]],
    [null],
  ],
  90: [
    [null, [17, 21, 0], [3, 0, 0]],
    [null, [3, 21, 0], [17, 21, 0]],
    [null, [3, 0, 0], [17, 0, 0]],
    [null],
  ],
  91: [
    [null, [4, 25, 0], [4, -7, 0]],
    [null, [5, 25, 0], [5, -7, 0]],
    [null, [4, 25, 0], [11, 25, 0]],
    [null, [4, -7, 0], [11, -7, 0]],
    [null],
  ],
  92: [[null, [0, 21, 0], [14, -3, 0]], [null]],
  93: [
    [null, [9, 25, 0], [9, -7, 0]],
    [null, [10, 25, 0], [10, -7, 0]],
    [null, [3, 25, 0], [10, 25, 0]],
    [null, [3, -7, 0], [10, -7, 0]],
    [null],
  ],
  94: [
    [null, [6, 15, 0], [8, 18, 0], [10, 15, 0]],
    [null, [3, 12, 0], [8, 17, 0], [13, 12, 0]],
    [null, [8, 17, 0], [8, 0, 0]],
    [null],
  ],
  95: [[null, [0, -2, 0], [16, -2, 0]], [null]],
  96: [
    [
      null,
      [6, 21, 0],
      [5, 20, 0],
      [4, 18, 0],
      [4, 16, 0],
      [5, 15, 0],
      [6, 16, 0],
      [5, 17, 0],
    ],
    [null],
  ],
  97: [
    [null, [15, 14, 0], [15, 0, 0]],
    [
      null,
      [15, 11, 0],
      [13, 13, 0],
      [11, 14, 0],
      [8, 14, 0],
      [6, 13, 0],
      [4, 11, 0],
      [3, 8, 0],
      [3, 6, 0],
      [4, 3, 0],
      [6, 1, 0],
      [8, 0, 0],
      [11, 0, 0],
      [13, 1, 0],
      [15, 3, 0],
    ],
    [null],
  ],
  98: [
    [null, [4, 21, 0], [4, 0, 0]],
    [
      null,
      [4, 11, 0],
      [6, 13, 0],
      [8, 14, 0],
      [11, 14, 0],
      [13, 13, 0],
      [15, 11, 0],
      [16, 8, 0],
      [16, 6, 0],
      [15, 3, 0],
      [13, 1, 0],
      [11, 0, 0],
      [8, 0, 0],
      [6, 1, 0],
      [4, 3, 0],
    ],
    [null],
  ],
  99: [
    [
      null,
      [15, 11, 0],
      [13, 13, 0],
      [11, 14, 0],
      [8, 14, 0],
      [6, 13, 0],
      [4, 11, 0],
      [3, 8, 0],
      [3, 6, 0],
      [4, 3, 0],
      [6, 1, 0],
      [8, 0, 0],
      [11, 0, 0],
      [13, 1, 0],
      [15, 3, 0],
    ],
    [null],
  ],
  100: [
    [null, [15, 21, 0], [15, 0, 0]],
    [
      null,
      [15, 11, 0],
      [13, 13, 0],
      [11, 14, 0],
      [8, 14, 0],
      [6, 13, 0],
      [4, 11, 0],
      [3, 8, 0],
      [3, 6, 0],
      [4, 3, 0],
      [6, 1, 0],
      [8, 0, 0],
      [11, 0, 0],
      [13, 1, 0],
      [15, 3, 0],
    ],
    [null],
  ],
  101: [
    [
      null,
      [3, 8, 0],
      [15, 8, 0],
      [15, 10, 0],
      [14, 12, 0],
      [13, 13, 0],
      [11, 14, 0],
      [8, 14, 0],
      [6, 13, 0],
      [4, 11, 0],
      [3, 8, 0],
      [3, 6, 0],
      [4, 3, 0],
      [6, 1, 0],
      [8, 0, 0],
      [11, 0, 0],
      [13, 1, 0],
      [15, 3, 0],
    ],
    [null],
  ],
  102: [
    [null, [10, 21, 0], [8, 21, 0], [6, 20, 0], [5, 17, 0], [5, 0, 0]],
    [null, [2, 14, 0], [9, 14, 0]],
    [null],
  ],
  103: [
    [
      null,
      [15, 14, 0],
      [15, -2, 0],
      [14, -5, 0],
      [13, -6, 0],
      [11, -7, 0],
      [8, -7, 0],
      [6, -6, 0],
    ],
    [
      null,
      [15, 11, 0],
      [13, 13, 0],
      [11, 14, 0],
      [8, 14, 0],
      [6, 13, 0],
      [4, 11, 0],
      [3, 8, 0],
      [3, 6, 0],
      [4, 3, 0],
      [6, 1, 0],
      [8, 0, 0],
      [11, 0, 0],
      [13, 1, 0],
      [15, 3, 0],
    ],
    [null],
  ],
  104: [
    [null, [4, 21, 0], [4, 0, 0]],
    [
      null,
      [4, 10, 0],
      [7, 13, 0],
      [9, 14, 0],
      [12, 14, 0],
      [14, 13, 0],
      [15, 10, 0],
      [15, 0, 0],
    ],
    [null],
  ],
  105: [
    [null, [3, 21, 0], [4, 20, 0], [5, 21, 0], [4, 22, 0], [3, 21, 0]],
    [null, [4, 14, 0], [4, 0, 0]],
    [null],
  ],
  106: [
    [null, [5, 21, 0], [6, 20, 0], [7, 21, 0], [6, 22, 0], [5, 21, 0]],
    [null, [6, 14, 0], [6, -3, 0], [5, -6, 0], [3, -7, 0], [1, -7, 0]],
    [null],
  ],
  107: [
    [null, [4, 21, 0], [4, 0, 0]],
    [null, [14, 14, 0], [4, 4, 0]],
    [null, [8, 8, 0], [15, 0, 0]],
    [null],
  ],
  108: [[null, [4, 21, 0], [4, 0, 0]], [null]],
  109: [
    [null, [4, 14, 0], [4, 0, 0]],
    [
      null,
      [4, 10, 0],
      [7, 13, 0],
      [9, 14, 0],
      [12, 14, 0],
      [14, 13, 0],
      [15, 10, 0],
      [15, 0, 0],
    ],
    [
      null,
      [15, 10, 0],
      [18, 13, 0],
      [20, 14, 0],
      [23, 14, 0],
      [25, 13, 0],
      [26, 10, 0],
      [26, 0, 0],
    ],
    [null],
  ],
  110: [
    [null, [4, 14, 0], [4, 0, 0]],
    [
      null,
      [4, 10, 0],
      [7, 13, 0],
      [9, 14, 0],
      [12, 14, 0],
      [14, 13, 0],
      [15, 10, 0],
      [15, 0, 0],
    ],
    [null],
  ],
  111: [
    [
      null,
      [8, 14, 0],
      [6, 13, 0],
      [4, 11, 0],
      [3, 8, 0],
      [3, 6, 0],
      [4, 3, 0],
      [6, 1, 0],
      [8, 0, 0],
      [11, 0, 0],
      [13, 1, 0],
      [15, 3, 0],
      [16, 6, 0],
      [16, 8, 0],
      [15, 11, 0],
      [13, 13, 0],
      [11, 14, 0],
      [8, 14, 0],
    ],
    [null],
  ],
  112: [
    [null, [4, 14, 0], [4, -7, 0]],
    [
      null,
      [4, 11, 0],
      [6, 13, 0],
      [8, 14, 0],
      [11, 14, 0],
      [13, 13, 0],
      [15, 11, 0],
      [16, 8, 0],
      [16, 6, 0],
      [15, 3, 0],
      [13, 1, 0],
      [11, 0, 0],
      [8, 0, 0],
      [6, 1, 0],
      [4, 3, 0],
    ],
    [null],
  ],
  113: [
    [null, [15, 14, 0], [15, -7, 0]],
    [
      null,
      [15, 11, 0],
      [13, 13, 0],
      [11, 14, 0],
      [8, 14, 0],
      [6, 13, 0],
      [4, 11, 0],
      [3, 8, 0],
      [3, 6, 0],
      [4, 3, 0],
      [6, 1, 0],
      [8, 0, 0],
      [11, 0, 0],
      [13, 1, 0],
      [15, 3, 0],
    ],
    [null],
  ],
  114: [
    [null, [4, 14, 0], [4, 0, 0]],
    [null, [4, 8, 0], [5, 11, 0], [7, 13, 0], [9, 14, 0], [12, 14, 0]],
    [null],
  ],
  115: [
    [
      null,
      [14, 11, 0],
      [13, 13, 0],
      [10, 14, 0],
      [7, 14, 0],
      [4, 13, 0],
      [3, 11, 0],
      [4, 9, 0],
      [6, 8, 0],
      [11, 7, 0],
      [13, 6, 0],
      [14, 4, 0],
      [14, 3, 0],
      [13, 1, 0],
      [10, 0, 0],
      [7, 0, 0],
      [4, 1, 0],
      [3, 3, 0],
    ],
    [null],
  ],
  116: [
    [null, [5, 21, 0], [5, 4, 0], [6, 1, 0], [8, 0, 0], [10, 0, 0]],
    [null, [2, 14, 0], [9, 14, 0]],
    [null],
  ],
  117: [
    [
      null,
      [4, 14, 0],
      [4, 4, 0],
      [5, 1, 0],
      [7, 0, 0],
      [10, 0, 0],
      [12, 1, 0],
      [15, 4, 0],
    ],
    [null, [15, 14, 0], [15, 0, 0]],
    [null],
  ],
  118: [[null, [2, 14, 0], [8, 0, 0]], [null, [14, 14, 0], [8, 0, 0]], [null]],
  119: [
    [null, [3, 14, 0], [7, 0, 0]],
    [null, [11, 14, 0], [7, 0, 0]],
    [null, [11, 14, 0], [15, 0, 0]],
    [null, [19, 14, 0], [15, 0, 0]],
    [null],
  ],
  120: [[null, [3, 14, 0], [14, 0, 0]], [null, [14, 14, 0], [3, 0, 0]], [null]],
  121: [
    [null, [2, 14, 0], [8, 0, 0]],
    [
      null,
      [14, 14, 0],
      [8, 0, 0],
      [6, -4, 0],
      [4, -6, 0],
      [2, -7, 0],
      [1, -7, 0],
    ],
    [null],
  ],
  122: [
    [null, [14, 14, 0], [3, 0, 0]],
    [null, [3, 14, 0], [14, 14, 0]],
    [null, [3, 0, 0], [14, 0, 0]],
    [null],
  ],
  123: [
    [
      null,
      [9, 25, 0],
      [7, 24, 0],
      [6, 23, 0],
      [5, 21, 0],
      [5, 19, 0],
      [6, 17, 0],
      [7, 16, 0],
      [8, 14, 0],
      [8, 12, 0],
      [6, 10, 0],
    ],
    [
      null,
      [7, 24, 0],
      [6, 22, 0],
      [6, 20, 0],
      [7, 18, 0],
      [8, 17, 0],
      [9, 15, 0],
      [9, 13, 0],
      [8, 11, 0],
      [4, 9, 0],
      [8, 7, 0],
      [9, 5, 0],
      [9, 3, 0],
      [8, 1, 0],
      [7, 0, 0],
      [6, -2, 0],
      [6, -4, 0],
      [7, -6, 0],
    ],
    [
      null,
      [6, 8, 0],
      [8, 6, 0],
      [8, 4, 0],
      [7, 2, 0],
      [6, 1, 0],
      [5, -1, 0],
      [5, -3, 0],
      [6, -5, 0],
      [7, -6, 0],
      [9, -7, 0],
    ],
    [null],
  ],
  124: [[null, [4, 25, 0], [4, -7, 0]], [null]],
  125: [
    [
      null,
      [5, 25, 0],
      [7, 24, 0],
      [8, 23, 0],
      [9, 21, 0],
      [9, 19, 0],
      [8, 17, 0],
      [7, 16, 0],
      [6, 14, 0],
      [6, 12, 0],
      [8, 10, 0],
    ],
    [
      null,
      [7, 24, 0],
      [8, 22, 0],
      [8, 20, 0],
      [7, 18, 0],
      [6, 17, 0],
      [5, 15, 0],
      [5, 13, 0],
      [6, 11, 0],
      [10, 9, 0],
      [6, 7, 0],
      [5, 5, 0],
      [5, 3, 0],
      [6, 1, 0],
      [7, 0, 0],
      [8, -2, 0],
      [8, -4, 0],
      [7, -6, 0],
    ],
    [
      null,
      [8, 8, 0],
      [6, 6, 0],
      [6, 4, 0],
      [7, 2, 0],
      [8, 1, 0],
      [9, -1, 0],
      [9, -3, 0],
      [8, -5, 0],
      [7, -6, 0],
      [5, -7, 0],
    ],
    [null],
  ],
  126: [
    [
      null,
      [3, 6, 0],
      [3, 8, 0],
      [4, 11, 0],
      [6, 12, 0],
      [8, 12, 0],
      [10, 11, 0],
      [14, 8, 0],
      [16, 7, 0],
      [18, 7, 0],
      [20, 8, 0],
      [21, 10, 0],
    ],
    [
      null,
      [3, 8, 0],
      [4, 10, 0],
      [6, 11, 0],
      [8, 11, 0],
      [10, 10, 0],
      [14, 7, 0],
      [16, 6, 0],
      [18, 6, 0],
      [20, 7, 0],
      [21, 10, 0],
      [21, 12, 0],
    ],
    [null],
  ],
};

const hersheyWidth = {
  32: 16,
  33: 10,
  34: 16,
  35: 21,
  36: 20,
  37: 24,
  38: 26,
  39: 10,
  40: 14,
  41: 14,
  42: 16,
  43: 26,
  44: 10,
  45: 26,
  46: 10,
  47: 22,
  48: 20,
  49: 20,
  50: 20,
  51: 20,
  52: 20,
  53: 20,
  54: 20,
  55: 20,
  56: 20,
  57: 20,
  58: 10,
  59: 10,
  60: 24,
  61: 26,
  62: 24,
  63: 18,
  64: 27,
  65: 18,
  66: 21,
  67: 21,
  68: 21,
  69: 19,
  70: 18,
  71: 21,
  72: 22,
  73: 8,
  74: 16,
  75: 21,
  76: 17,
  77: 24,
  78: 22,
  79: 22,
  80: 21,
  81: 22,
  82: 21,
  83: 20,
  84: 16,
  85: 22,
  86: 18,
  87: 24,
  88: 20,
  89: 18,
  90: 20,
  91: 14,
  92: 14,
  93: 14,
  94: 16,
  95: 16,
  96: 10,
  97: 19,
  98: 19,
  99: 18,
  100: 19,
  101: 18,
  102: 12,
  103: 19,
  104: 19,
  105: 8,
  106: 10,
  107: 17,
  108: 8,
  109: 30,
  110: 19,
  111: 19,
  112: 19,
  113: 19,
  114: 13,
  115: 17,
  116: 12,
  117: 19,
  118: 16,
  119: 22,
  120: 17,
  121: 16,
  122: 17,
  123: 14,
  124: 8,
  125: 14,
  126: 24,
};

const toPaths = (letters) => {
  let xOffset = 0;
  const mergedPaths = [];
  for (const letter of letters) {
    const code = letter.charCodeAt(0);
    const paths = hersheyPaths[code] || [];
    mergedPaths.push(...translatePaths([xOffset, 0, 0], paths));
    xOffset += hersheyWidth[code] || 0;
  }
  return Shape.fromGeometry(hasTypeWire(taggedPaths({}, mergedPaths)))
    .scale(1 / 28)
    .outline();
};

const ofSize = (text, size) => toPaths(text).scale(size);

const Hershey = ofSize;

const MIN = 0;
const MAX = 1;
const X$4 = 0;
const Y$4 = 1;

const getItemNames = (geometry) => {
  const names = new Set();
  const op = (geometry, descend) => {
    if (
      geometry.type === 'item' &&
      isNotVoid(geometry) &&
      geometry.tags &&
      geometry.tags.some((tag) => tag.startsWith('item/'))
    ) {
      geometry.tags
        .filter((tag) => tag.startsWith('item/'))
        .forEach((tag) => names.add(tag.substring(5)));
    } else {
      descend();
    }
  };
  visit(geometry, op);
  return [...names].sort();
};

const buildLayoutGeometry = ({ layer, pageWidth, pageLength, margin }) => {
  const itemNames = getItemNames(layer).filter((name) => name !== '');
  const labelScale = 0.0125 * 10;
  const size = [pageWidth, pageLength];
  const r = (v) => Math.floor(v * 100) / 100;
  const fontHeight = Math.max(pageWidth, pageLength) * labelScale;
  const title = [];
  title.push(Hershey(`${r(pageWidth)} x ${r(pageLength)}`, fontHeight));
  for (let nth = 0; nth < itemNames.length; nth++) {
    title.push(Hershey(itemNames[nth], fontHeight).y((nth + 1) * fontHeight));
  }
  const visualization = Box(
    Math.max(pageWidth, margin),
    Math.max(pageLength, margin)
  )
    .outline()
    .and(
      Group(...title).move(pageWidth / -2, (pageLength * (1 + labelScale)) / 2)
    )
    .color('red')
    .sketch()
    .toGeometry();
  return taggedLayout({ size, margin, title }, layer, visualization);
};

const Page = (
  {
    size,
    pageMargin = 5,
    itemMargin = 1,
    itemsPerPage = Infinity,
    pack = true,
  },
  ...shapes
) => {
  const margin = itemMargin;
  const layers = [];
  for (const shape of shapes) {
    for (const leaf of getLeafs(shape.toDisjointGeometry())) {
      layers.push(leaf);
    }
  }
  if (!pack && size) {
    const layer = taggedGroup({}, ...layers);
    const [width, height] = size;
    const packSize = [
      [-width / 2, -height / 2, 0],
      [width / 2, height / 2, 0],
    ];
    const pageWidth =
      Math.max(
        1,
        Math.abs(packSize[MAX][X$4] * 2),
        Math.abs(packSize[MIN][X$4] * 2)
      ) +
      pageMargin * 2;
    const pageLength =
      Math.max(
        1,
        Math.abs(packSize[MAX][Y$4] * 2),
        Math.abs(packSize[MIN][Y$4] * 2)
      ) +
      pageMargin * 2;
    return Shape.fromGeometry(
      buildLayoutGeometry({ layer, pageWidth, pageLength, margin })
    );
  } else if (!pack && !size) {
    const layer = taggedGroup({}, ...layers);
    const packSize = measureBoundingBox(layer);
    const pageWidth =
      Math.max(
        1,
        Math.abs(packSize[MAX][X$4] * 2),
        Math.abs(packSize[MIN][X$4] * 2)
      ) +
      pageMargin * 2;
    const pageLength =
      Math.max(
        1,
        Math.abs(packSize[MAX][Y$4] * 2),
        Math.abs(packSize[MIN][Y$4] * 2)
      ) +
      pageMargin * 2;
    if (isFinite(pageWidth) && isFinite(pageLength)) {
      return Shape.fromGeometry(
        buildLayoutGeometry({ layer, pageWidth, pageLength, margin })
      );
    } else {
      return Shape.fromGeometry(
        buildLayoutGeometry({ layer, pageWidth: 0, pageLength: 0, margin })
      );
    }
  } else if (pack && size) {
    // Content fits to page size.
    const packSize = [];
    const content = Shape.fromGeometry(taggedGroup({}, ...layers)).pack({
      size,
      pageMargin,
      itemMargin,
      perLayout: itemsPerPage,
      packSize,
    });
    if (packSize.length === 0) {
      throw Error('Packing failed');
    }
    const pageWidth = Math.max(1, packSize[MAX][X$4] - packSize[MIN][X$4]);
    const pageLength = Math.max(1, packSize[MAX][Y$4] - packSize[MIN][Y$4]);
    if (isFinite(pageWidth) && isFinite(pageLength)) {
      const plans = [];
      for (const layer of content.toDisjointGeometry().content[0].content) {
        plans.push(
          buildLayoutGeometry({
            layer,
            pageWidth,
            pageLength,
            margin,
          })
        );
      }
      return Shape.fromGeometry(taggedGroup({}, ...plans));
    } else {
      const layer = taggedGroup({}, ...layers);
      return buildLayoutGeometry({
        layer,
        pageWidth: 0,
        pageLength: 0,
        margin,
      });
    }
  } else if (pack && !size) {
    const packSize = [];
    // Page fits to content size.
    const content = Shape.fromGeometry(taggedGroup({}, ...layers)).pack({
      pageMargin,
      itemMargin,
      perLayout: itemsPerPage,
      packSize,
    });
    if (packSize.length === 0) {
      throw Error('Packing failed');
    }
    // FIX: Using content.size() loses the margin, which is a problem for repacking.
    // Probably page plans should be generated by pack and count toward the size.
    const pageWidth = packSize[MAX][X$4] - packSize[MIN][X$4];
    const pageLength = packSize[MAX][Y$4] - packSize[MIN][Y$4];
    if (isFinite(pageWidth) && isFinite(pageLength)) {
      const plans = [];
      for (const layer of content.toDisjointGeometry().content[0].content) {
        const layoutGeometry = buildLayoutGeometry({
          layer,
          packSize,
          pageWidth,
          pageLength,
          margin,
        });
        Shape.fromGeometry(layoutGeometry);
        plans.push(layoutGeometry);
      }
      return Shape.fromGeometry(taggedGroup({}, ...plans));
    } else {
      const layer = taggedGroup({}, ...layers);
      return buildLayoutGeometry({
        layer,
        pageWidth: 0,
        pageLength: 0,
        margin,
      });
    }
  }
};

const page =
  (options = {}) =>
  (shape) =>
    Page(options, shape);
Shape.registerMethod('page', page);

const ensurePages = (geometry, depth = 0) => {
  const pages = getLayouts(geometry);
  if (pages.length === 0 && depth === 0) {
    return ensurePages(
      Page({ pack: false }, Shape.fromGeometry(geometry)).toDisjointGeometry(),
      depth + 1
    );
  } else {
    return pages;
  }
};

const fix =
  (options = {}) =>
  (shape) =>
    Page({ ...options, pack: false }, shape);
Shape.registerMethod('fix', fix);

const each =
  (
    leafOp = (leaf) => leaf,
    groupOp = (leafs, shape) => Shape.Group(...leafs)
  ) =>
  (shape) => {
    const leafShapes = getLeafs(shape.toGeometry()).map((leaf) =>
      leafOp(Shape.fromGeometry(leaf))
    );
    return groupOp(leafShapes, shape);
  };
Shape.registerMethod('each', each);

const edit = (editId) => (shape) =>
  shape.untag('editId:*').tag(`editId:${editId}`);

Shape.registerMethod('edit', edit);

const normal = () => (shape) =>
  Shape.fromGeometry(computeNormal(shape.toGeometry()));

Shape.registerMethod('normal', normal);

const extrudeAlong =
  (direction, ...extents) =>
  (shape) => {
    const heights = extents.map((extent) => Shape.toValue(extent, shape));
    if (heights.length % 2 === 1) {
      heights.push(0);
    }
    heights.sort((a, b) => a - b);
    const extrusions = [];
    while (heights.length > 0) {
      const height = heights.pop();
      const depth = heights.pop();
      if (height === depth) {
        // Return unextruded geometry at this height, instead.
        extrusions.push(shape.z(height));
        continue;
      }
      extrusions.push(
        Shape.fromGeometry(
          extrude(
            shape.toGeometry(),
            height,
            depth,
            Shape.toShape(direction, shape).toGeometry()
          )
        )
      );
    }
    return Shape.Group(...extrusions);
  };

const e = (...extents) => extrudeAlong(normal(), ...extents);

Shape.registerMethod('extrudeAlong', extrudeAlong);
Shape.registerMethod('e', e);

const extrudeX = (...extents) =>
  extrudeAlong(Point(1, 0, 0), ...extents);
const extrudeY = (...extents) =>
  extrudeAlong(Point(0, 1, 0), ...extents);
const extrudeZ = (...extents) =>
  extrudeAlong(Point(0, 0, 1), ...extents);

const ex = extrudeX;
const ey = extrudeY;
const ez = extrudeZ;

Shape.registerMethod('ex', ex);
Shape.registerMethod('ey', ey);
Shape.registerMethod('ez', ez);

const extrudeToPlane =
  (
    highPlane = [0, 0, 1, 1],
    lowPlane = [0, 0, 1, -1],
    direction = [0, 0, 1, 0]
  ) =>
  (shape) =>
    Shape.fromGeometry(
      extrudeToPlane$1(
        shape.toGeometry(),
        highPlane,
        lowPlane,
        direction
      )
    );

Shape.registerMethod('extrudeToPlane', extrudeToPlane);

const faces = () => (shape) =>
  Shape.fromGeometry(faces$1(shape.toGeometry()));

Shape.registerMethod('faces', faces);

const fill = () => (shape) =>
  Shape.fromGeometry(fill$1(shape.toGeometry()));

const f = fill;

Shape.registerMethod('fill', fill);
Shape.registerMethod('f', f);

const withFill = () => (shape) => shape.group(shape.fill());
Shape.registerMethod('withFill', withFill);

const assemble = (...shapes) => {
  shapes = shapes.filter((shape) => shape !== undefined);
  switch (shapes.length) {
    case 0: {
      return Shape.fromGeometry(assemble$1());
    }
    case 1: {
      return shapes[0];
    }
    default: {
      return fromGeometry(assemble$1(...shapes.map(toGeometry)));
    }
  }
};

const fit =
  (...shapes) =>
  (shape) =>
    assemble(...shapes.map((other) => Shape.toShape(other, shape)), shape);

Shape.registerMethod('fit', fit);

const fitTo =
  (...shapes) =>
  (shape) =>
    assemble(shape, ...shapes.map((other) => Shape.toShape(other, shape)));

Shape.registerMethod('fitTo', fitTo);

const fuse =
  () =>
  (...shapes) =>
    fromGeometry(
      fuse$1(Shape.toShapes(shapes).map((shape) => shape.toGeometry()))
    );

Shape.registerMethod('fuse', fuse);

const noOp = (shape) => shape;
const zero = (segment) => 0;

const getEdge =
  (computeGoodness = zero, op = noOp) =>
  (shape) => {
    let best = [];
    let bestGoodness = 0;
    const admitSegment = (segment, orientation) => {
      const goodness = computeGoodness(segment);
      if (goodness < bestGoodness) {
        return;
      }
      if (goodness > bestGoodness) {
        bestGoodness = goodness;
        best.length = 0;
      }
      best.push({ segment, orientation });
    };
    eachSegment(shape.toGeometry(), admitSegment);
    return Group(
      ...best.map(({ segment, orientation }) =>
        op(Shape.fromGeometry(taggedSegments({ orientation }, [segment])))
      )
    );
  };

Shape.registerMethod('getEdge', getEdge);

const getNot =
  (...tags) =>
  (shape) => {
    const isMatch = oneOfTagMatcher(tags, 'item');
    const picks = [];
    const walk = (geometry, descend) => {
      const { tags, type } = geometry;
      if (type === 'group') {
        return descend();
      }
      let discard = false;
      for (const tag of tags) {
        if (isMatch(tag)) {
          discard = true;
          break;
        }
      }
      if (!discard) {
        picks.push(Shape.fromGeometry(geometry));
      }
      if (type !== 'item') {
        return descend();
      }
    };
    const geometry = shape.toGeometry();
    if (geometry.type === 'item') {
      // FIX: Can we make this less magical?
      // This allows constructions like s.get('a').get('b')
      visit(geometry.content[0], walk);
    } else {
      visit(geometry, walk);
    }
    return Group(...picks);
  };

const gn = getNot;

Shape.registerMethod('getNot', getNot);
Shape.registerMethod('gn', gn);

const removeSelfIntersections = () => (shape) =>
  Shape.fromGeometry(removeSelfIntersections$1(shape.toGeometry()));

Shape.registerMethod('removeSelfIntersections', removeSelfIntersections);

const grow =
  (amount, { doRemoveSelfIntersections = true } = {}) =>
  (shape) =>
    Shape.fromGeometry(grow$1(shape.toGeometry(), amount)).op(
      doRemoveSelfIntersections && removeSelfIntersections()
    );

Shape.registerMethod('grow', grow);

const outline = () => (shape) =>
  Group(
    ...outline$1(shape.toGeometry()).map((outline) =>
      Shape.fromGeometry(outline)
    )
  );

Shape.registerMethod('outline', outline);

const withOutline =
  (op = (x) => x) =>
  (shape) =>
    shape.and(op(outline()));

Shape.registerMethod('withOutline', withOutline);

const inline = () => (shape) => outline({}, shape.flip());

Shape.registerMethod('inline', inline);

const withInline = () => (shape) => shape.with(inline());

Shape.registerMethod('withInline', withInline);

const inset =
  (initial = 1, step, limit) =>
  (shape) =>
    Shape.fromGeometry(inset$1(shape.toGeometry(), initial, step, limit));

// CHECK: Using 'with' for may be confusing, but andInset looks odd.
const withInset = (initial, step, limit) => (shape) =>
  shape.and(shape.inset(initial, step, limit));

Shape.registerMethod('inset', inset);
Shape.registerMethod('withInset', withInset);

const keep = (tag) => (shape) => shape.on(getNot(tag), voidFn());

Shape.registerMethod('keep', keep);

const fromUndefined = () => Shape.fromGeometry();

const loadGeometry = async (
  path,
  { otherwise = fromUndefined } = {}
) => {
  logInfo('api/shape/loadGeometry', path);
  const data = await read(path);
  if (data === undefined) {
    return otherwise();
  } else {
    return Shape.fromGeometry(data);
  }
};

const loadGeometryNonblocking = (path) => {
  logInfo('api/shape/loadGeometryNonblocking', path);
  const geometry = readNonblocking(path);
  if (geometry) {
    return Shape.fromGeometry(geometry);
  }
};

const loft =
  (...ops) =>
  (shape) =>
    Shape.fromGeometry(
      loft$1(
        /* closed= */ false,
        ...shape.toFlatValues(ops).map((shape) => shape.toGeometry())
      )
    );

Shape.registerMethod('loft', loft);

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
  const hash$1 = hash(log);
  emit({ log, hash: hash$1 });
  return log$1({ op: 'text', text, level });
};

const logOp = (shape, op) => {
  const text = String(op(shape));
  const level = 'serious';
  const log = { text, level };
  const hash$1 = hash(log);
  emit({ log, hash: hash$1 });
  return log$1({ op: 'text', text });
};

const logMethod = function (op = (shape) => JSON.stringify(shape)) {
  logOp(Shape.fromGeometry(realize(this.toGeometry())), op);
  return this;
};
Shape.prototype.log = logMethod;

const loop =
  (...ops) =>
  (shape) => {
    // CHECK: Is two sufficient levels?
    return Shape.fromGeometry(
      loft$1(
        /* closed= */ true,
        ...shape.toFlatValues(ops).map((shape) => shape.toGeometry())
      )
    );
  };

Shape.registerMethod('loop', loop);

const overlay = () => (shape) =>
  Shape.fromGeometry(hasShowOverlay(shape.toGeometry()));

Shape.registerMethod('overlay', overlay);

const mask =
  (...args) =>
  (shape) =>
    Group(
      ...args.map((arg) => Shape.toShape(arg, shape).void()),
      Shape.fromGeometry(hasTypeMasked(shape.toGeometry()))
    );

Shape.registerMethod('mask', mask);

const material = (name) => (shape) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName$1(name), [], shape.toGeometry()));

Shape.registerMethod('material', material);

const minkowskiDifference = (offset) => (shape) =>
  Shape.fromGeometry(
    minkowskiDifference$1(shape.toGeometry(), offset.toGeometry())
  );

Shape.registerMethod('minkowskiDifference', minkowskiDifference);

const minkowskiShell = (offset) => (shape) =>
  Shape.fromGeometry(
    minkowskiShell$1(shape.toGeometry(), offset.toGeometry())
  );

Shape.registerMethod('minkowskiShell', minkowskiShell);

const minkowskiSum = (offset) => (shape) =>
  Shape.fromGeometry(
    minkowskiSum$1(shape.toGeometry(), offset.toGeometry())
  );

Shape.registerMethod('minkowskiSum', minkowskiSum);

const move =
  (...args) =>
  (shape) =>
    Shape.Group(
      ...Shape.toCoordinates(shape, ...args).map((coordinate) =>
        shape.transform(fromTranslation(coordinate))
      )
    );

const xyz = move;

Shape.registerMethod('xyz', xyz);

Shape.registerMethod('move', move);

const moveAlong =
  (direction, ...offsets) =>
  (shape) => {
    direction = shape.toCoordinate(direction);
    offsets = offsets.map((extent) => Shape.toValue(extent, shape));
    offsets.sort((a, b) => a - b);
    const moves = [];
    while (offsets.length > 0) {
      const offset = offsets.pop();
      moves.push(shape.move(scale$1(offset, direction)));
    }
    return Shape.Group(...moves);
  };

const m = (...offsets) => moveAlong(normal(), ...offsets);

Shape.registerMethod('m', m);
Shape.registerMethod('moveAlong', moveAlong);

// FIX: This is probably the wrong approach to moving to a particular location.
const moveTo =
  (x = 0, y = 0, z = 0) =>
  (shape) => {
    x = Shape.toValue(x, shape);
    y = Shape.toValue(y, shape);
    z = Shape.toValue(z, shape);
    // Allow a Point to be provided.
    if (x instanceof Shape) {
      const g = x.toTransformedGeometry();
      if (g.type === 'points' && g.points.length === 1) {
        // FIX: Consider how this might be more robust.
        [x, y, z] = g.points[0];
      }
    }
    if (!isFinite(x)) {
      x = 0;
    }
    if (!isFinite(y)) {
      y = 0;
    }
    if (!isFinite(z)) {
      z = 0;
    }
    return shape.transform(fromTranslation([-x, -y, -z]));
  };

Shape.registerMethod('moveTo', moveTo);

const noop = () => (shape) => shape;

const noVoid = (tags, select) => (shape) => {
  const op = (geometry, descend) => {
    if (isVoid(geometry)) {
      return taggedGroup({});
    } else {
      return descend();
    }
  };

  const rewritten = rewrite(shape.toDisjointGeometry(), op);
  return Shape.fromGeometry(rewritten);
};

Shape.registerMethod('noVoid', noVoid);

const notColor =
  (...colors) =>
  (shape) =>
    shape.untag(...colors.map((color) => qualifyTag(color, 'color')));

Shape.registerMethod('notColor', notColor);

const nth =
  (...ns) =>
  (shape) => {
    const candidates = shape.each(
      (leaf) => leaf,
      (leafs) => leafs
    );
    return Group(...ns.map((n) => candidates[n]));
  };

const n = nth;

Shape.registerMethod('nth', nth);
Shape.registerMethod('n', nth);

const offset =
  (initial = 1, step, limit) =>
  (shape) =>
    Shape.fromGeometry(
      offset$1(shape.toGeometry(), initial, step, limit)
    );

Shape.registerMethod('offset', offset);

const on =
  (selection, ...ops) =>
  (shape) => {
    ops = ops.map((op) => (op instanceof Function ? op : () => op));
    // We've already selected the item to replace, e.g., s.on(g('plate'), ...);
    if (selection instanceof Function) {
      selection = selection(shape);
    }
    // FIX: This needs to walk through items.
    const leafs = getLeafs(selection.toGeometry());
    const walk = (geometry, descend) => {
      if (leafs.includes(geometry)) {
        // This is a target.
        const global = geometry.matrix;
        const local = invertTransform(global);
        const target = Shape.fromGeometry(geometry);
        // Switch to the local coordinate space, perform the operation, and come back to the global coordinate space.
        return target
          .transform(local)
          .op(...ops)
          .transform(global)
          .toGeometry();
      }
      return descend();
    };
    return Shape.fromGeometry(rewrite(shape.toGeometry(), walk));
  };

Shape.registerMethod('on', on);

const op =
  (...fns) =>
  (shape) =>
    Group(...fns.filter((fn) => fn).map((fn) => fn(shape)));

const withOp =
  (...fns) =>
  (shape) =>
    shape.with(shape.op(...fns));

Shape.registerMethod('op', op);
Shape.registerMethod('withOp', withOp);

const X$3 = 0;
const Y$3 = 1;
const Z$4 = 2;

// These are all absolute positions in the world.
// at is where the object's origin should move to.
// to is where the object's axis should point at.
// up rotates around the axis to point a dorsal position toward.

const orient =
  ({ at = [0, 0, 0], to = [0, 0, 0], up = [0, 0, 0] }) =>
  (shape) => {
    const { local } = getInverseMatrices(shape.toGeometry());
    // Algorithm from threejs Matrix4
    let u = subtract(up, at);
    if (squaredLength(u) === 0) {
      u[Z$4] = 1;
    }
    u = normalize(u);
    let z = subtract(to, at);
    if (squaredLength(z) === 0) {
      z[Z$4] = 1;
    }
    z = normalize(z);
    let x = cross(u, z);
    if (squaredLength(x) === 0) {
      // u and z are parallel
      if (Math.abs(u[Z$4]) === 1) {
        z[X$3] += 0.0001;
      } else {
        z[Z$4] += 0.0001;
      }
      z = normalize(z);
      x = cross(u, z);
    }
    x = normalize(x);
    let y = cross(z, x);
    const lookAt = [
      x[X$3],
      x[Y$3],
      x[Z$4],
      0,
      y[X$3],
      y[Y$3],
      y[Z$4],
      0,
      z[X$3],
      z[Y$3],
      z[Z$4],
      0,
      0,
      0,
      0,
      1,
    ];
    return shape
      .transform(local)
      .transform(lookAt)
      .move(...at);
  };

Shape.registerMethod('orient', orient);

const pack =
  ({
    size,
    pageMargin = 5,
    itemMargin = 1,
    perLayout = Infinity,
    packSize = [],
  } = {}) =>
  (shape) => {
    if (perLayout === 0) {
      // Packing was disabled -- do nothing.
      return shape;
    }

    let todo = [];
    for (const leaf of getLeafs(shape.toTransformedGeometry())) {
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
          taggedItem({}, taggedGroup({}, ...packed.map(toTransformedGeometry)))
        );
      }
      todo.unshift(...unpacked);
    }
    let packedShape = Shape.fromGeometry(taggedGroup({}, ...packedLayers));
    if (size === undefined) {
      packedShape = packedShape.align('xy');
    }
    return packedShape;
  };

Shape.registerMethod('pack', pack);

const play =
  (amount = 0.1) =>
  (shape) =>
    shape.grow(amount).void().and(shape);

Shape.registerMethod('play', play);

const points$1 =
  (op = Point, group = Group) =>
  (shape) => {
    const results = [];
    eachPoint((point) => results.push(op(point)), shape.toGeometry());
    return group(...results);
  };

Shape.registerMethod('points', points$1);

const push =
  (force = 0.1, minimumDistance = 1, maximumDistance = 10) =>
  (shape) =>
    Shape.fromGeometry(
      push$1(shape.toGeometry(), {
        force,
        minimumDistance,
        maximumDistance,
      })
    );

Shape.registerMethod('push', push);

const remesh =
  (options, ...selections) =>
  (shape) =>
    Shape.fromGeometry(
      remesh$1(
        shape.toGeometry(),
        options,
        shape.toShapes(selections).map((selection) => selection.toGeometry())
      )
    );

Shape.registerMethod('remesh', remesh);

const rotate =
  (turn = 0, axis = [0, 0, 1]) =>
  (shape) =>
    shape.transform(fromRotation(turn * Math.PI * 2, axis));

Shape.registerMethod('rotate', rotate);

// rx is in terms of turns -- 1/2 is a half turn.
const rx =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...shape
        .toFlatValues(angles)
        .map((angle) => shape.transform(fromRotateXToTransform(angle * 360)))
    );

Shape.registerMethod('rx', rx);

const rotateX = rx;
Shape.registerMethod('rotateX', rotateX);

// ry is in terms of turns -- 1/2 is a half turn.
const ry =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...shape
        .toFlatValues(angles)
        .map((angle) => shape.transform(fromRotateYToTransform(angle * 360)))
    );

Shape.registerMethod('ry', ry);

const rotateY = ry;
Shape.registerMethod('rotateY', ry);

// rz is in terms of turns -- 1/2 is a half turn.
const rz =
  (...angles) =>
  (shape) =>
    Shape.Group(
      ...shape
        .toFlatValues(angles)
        .map((angle) => shape.transform(fromRotateZToTransform(angle * 360)))
    );

Shape.registerMethod('rz', rz);

const rotateZ = rz;
Shape.registerMethod('rotateZ', rz);

const saveGeometry = async (path, shape) => {
  logInfo('api/shape/saveGeometry', path);
  return Shape.fromGeometry(await write(path, shape.toGeometry()));
};

const saveGeometryNonblocking = (path, shape) => {
  logInfo('api/shape/saveGeometryNonblocking', path);
  return Shape.fromGeometry(writeNonblocking(path, shape.toGeometry()));
};

const scale =
  (x = 1, y = x, z = y) =>
  (shape) => {
    [x = 1, y = x, z] = shape.toCoordinate(x, y, z);
    const negatives = (x < 0) + (y < 0) + (z < 0);
    if (negatives % 2) {
      // Compensate for inversion.
      return shape.transform(fromScaling([x, y, z])).flip();
    } else {
      return shape.transform(fromScaling([x, y, z]));
    }
  };

Shape.registerMethod('scale', scale);

const scaleX =
  (...x) =>
  (shape) =>
    Shape.Group(...shape.toFlatValues(x).map((x) => scale(x, 1, 1)(shape)));

const sx = scaleX;

Shape.registerMethod('scaleX', scaleX);
Shape.registerMethod('sx', sx);

const scaleY =
  (...y) =>
  (shape) =>
    Shape.Group(...shape.toFlatValues(y).map((y) => scale(1, y, 1)(shape)));

const sy = scaleY;

Shape.registerMethod('scaleY', scaleY);
Shape.registerMethod('sy', sy);

const scaleZ =
  (...z) =>
  (shape) =>
    Shape.Group(...shape.toFlatValues(z).map((z) => scale(1, 1, z)(shape)));

const sz = scaleZ;

Shape.registerMethod('scaleZ', scaleZ);
Shape.registerMethod('sz', sz);

const scaleToFit =
  (x = 1, y = x, z = y) =>
  (shape) => {
    const { length, width, height } = shape.size();
    const xFactor = x / length;
    const yFactor = y / width;
    const zFactor = z / height;
    // Surfaces may get non-finite factors -- use the unit instead.
    const finite = (factor) => (isFinite(factor) ? factor : 1);
    return shape.scale(finite(xFactor), finite(yFactor), finite(zFactor));
  };

Shape.registerMethod('scaleToFit', scaleToFit);

const simplify =
  (options = {}, ...selections) =>
  (shape) =>
    Shape.fromGeometry(
      simplify$1(
        shape.toGeometry(),
        options,
        shape.toShapes(selections).map((selection) => selection.toGeometry())
      )
    );

Shape.registerMethod('simplify', simplify);

const baseSection =
  ({ profile = false } = {}, orientations) =>
  (shape) => {
    orientations = orientations
      .flatMap((orientation) => Shape.toValue(orientation, shape))
      .flatMap((orientation) => Shape.toValue(orientation, shape));
    const matrices = [];
    if (orientations.length === 0) {
      matrices.push({ plane: [0, 0, 1, 0] });
    } else {
      for (const item of orientations) {
        const matrix = item.toGeometry().matrix;
        matrices.push({ matrix });
      }
    }
    return Shape.fromGeometry(
      section$1(shape.toGeometry(), matrices, { profile })
    );
  };

const section =
  (...orientations) =>
  (shape) =>
    baseSection({ profile: false }, orientations)(shape);

Shape.registerMethod('section', section);

const sectionProfile =
  (...orientations) =>
  (shape) =>
    baseSection({ profile: true }, orientations)(shape);

Shape.registerMethod('sectionProfile', sectionProfile);

const separate =
  ({
    keepShapes = true,
    keepHolesInShapes = true,
    keepHolesAsShapes = false,
  } = {}) =>
  (shape) =>
    Shape.fromGeometry(
      separate$1(
        shape.toGeometry(),
        keepShapes,
        keepHolesInShapes,
        keepHolesAsShapes
      )
    );

Shape.registerMethod('separate', separate);

const EPSILON = 1e-5;

const maybeApply = (value, shape) => {
  if (value instanceof Function) {
    return value(shape);
  } else {
    return value;
  }
};

// This is getting a bit excessively magical.
const seq =
  (...args) =>
  (shape) => {
    let op;
    let groupOp;
    let specs = [];
    for (const arg of args) {
      if (arg instanceof Function) {
        if (!op) {
          op = arg;
        } else if (!groupOp) {
          groupOp = arg;
        }
      } else if (arg instanceof Object) {
        specs.push(arg);
      }
    }
    if (!op) {
      op = (n) => n;
    }
    if (!groupOp) {
      groupOp = (...values) => values;
    }

    const indexes = [];
    for (const spec of specs) {
      let { from = 0, to = 1, upto, downto, by = 1 } = spec;

      from = Shape.toValue(from, shape);
      to = Shape.toValue(to, shape);
      upto = Shape.toValue(upto, shape);
      downto = Shape.toValue(downto, shape);
      by = Shape.toValue(by, shape);

      let consider;

      if (by > 0) {
        if (upto !== undefined) {
          consider = (value) => value < upto - EPSILON;
        } else {
          consider = (value) => value <= to + EPSILON;
        }
      } else if (by < 0) {
        if (downto !== undefined) {
          consider = (value) => value > downto + EPSILON;
        } else {
          consider = (value) => value >= to - EPSILON;
        }
      } else {
        throw Error('seq: Expects by != 0');
      }
      const numbers = [];
      for (let number = from, nth = 0; consider(number); number += by, nth++) {
        numbers.push(number);
      }
      indexes.push(numbers);
    }
    const results = [];
    const index = indexes.map(() => 0);
    for (;;) {
      results.push(
        maybeApply(op(...index.map((nth, index) => indexes[index][nth])), shape)
      );
      let nth;
      for (nth = 0; nth < index.length; nth++) {
        if (++index[nth] < indexes[nth].length) {
          break;
        }
        index[nth] = 0;
      }
      if (nth === index.length) {
        break;
      }
    }
    return groupOp(...results);
  };

Shape.registerMethod('seq', seq);

const serialize =
  (op = (v) => v, groupOp = (v, s) => s) =>
  (shape) =>
    groupOp(op(serialize$1(shape.toGeometry())), shape);

Shape.registerMethod('serialize', serialize);

const smooth =
  (options = { iterations: 1, method: 'subdivide' }, ...selections) =>
  (shape) =>
    Shape.fromGeometry(
      smooth$1(
        shape.toGeometry(),
        options,
        shape.toShapes(selections).map((selection) => selection.toGeometry())
      )
    );

Shape.registerMethod('smooth', smooth);

const X$2 = 0;
const Y$2 = 1;
const Z$3 = 2;

const size =
  (op = (size, shape) => size) =>
  (shape) => {
    const geometry = shape.toConcreteGeometry();
    const [min, max] = measureBoundingBox(geometry);
    const length = max[X$2] - min[X$2];
    const width = max[Y$2] - min[Y$2];
    const height = max[Z$3] - min[Z$3];
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

Shape.registerMethod('size', size);

const sketch = () => (shape) =>
  Shape.fromGeometry(taggedSketch({}, shape.toGeometry()));

Shape.registerMethod('sketch', sketch);

const table =
  (rows, columns, ...cells) =>
  (shape) => {
    const uniqueId = generateUniqueId;
    const open = { open: { type: 'table', rows, columns, uniqueId } };
    emit({ open, hash: computeHash(open) });
    for (let cell of cells) {
      if (cell instanceof Function) {
        cell = cell(shape);
      }
      if (typeof cell === 'string') {
        md(cell);
      }
    }
    const close = { close: { type: 'table', rows, columns, uniqueId } };
    emit({ close, hash: computeHash(close) });
    return shape;
  };

Shape.registerMethod('table', table);

const tags =
  (namespace = 'user', op = (tags, shape) => tags) =>
  (shape) => {
    const prefix = `${namespace}:`;
    const collected = [];
    for (const { tags } of getLeafs(shape.toGeometry())) {
      for (const tag of tags) {
        if (tag.startsWith(prefix)) {
          collected.push(tag.substring(prefix.length));
        }
      }
    }
    return op(collected, shape);
  };

Shape.registerMethod('tags', tags);

const taper =
  (
    xPlusFactor = 1,
    xMinusFactor = 1,
    yPlusFactor = 1,
    yMinusFactor = 1,
    zPlusFactor = 1,
    zMinusFactor = 1
  ) =>
  (shape) =>
    Shape.fromGeometry(
      taper$1(
        shape.toGeometry(),
        xPlusFactor,
        xMinusFactor,
        yPlusFactor,
        yMinusFactor,
        zPlusFactor,
        zMinusFactor
      )
    );

Shape.registerMethod('taper', taper);

const test = (md) => (shape) => {
  if (md) {
    shape.md(md);
  }
  test$1(shape.toGeometry());
  return shape;
};

Shape.registerMethod('test', test);

// Tint adds another color to the mix.
const tint = (name) => (shape) => shape.tag(...toTagsFromName(name));

Shape.registerMethod('tint', tint);

const to =
  (selection, ...ops) =>
  (shape) => {
    if (ops.length === 0) {
      ops.push(() => shape);
    }
    ops = ops.map((op) => (op instanceof Function ? op : () => op));
    // We've already selected the item for reference, e.g., s.on(g('plate'), ...);
    if (selection instanceof Function) {
      selection = selection(shape);
    }
    const placed = [];
    for (const leaf of getLeafs(selection.toGeometry())) {
      const { local } = getInverseMatrices(leaf);
      // Perform the operation, then switch to the local coordinate space.
      placed.push(shape.transform(local).op(...ops));
    }
    return Group(...placed);
  };

Shape.registerMethod('to', to);

const tool = (name) => (shape) =>
  Shape.fromGeometry(rewriteTags(toTagsFromName$2(name), [], shape.toGeometry()));

Shape.registerMethod('tool', tool);

const Z$2 = 2;

const top = () => (shape) => shape.size(({ max }) => max[Z$2]);

Shape.registerMethod('top', top);

const twist =
  (turnsPerMm = 1) =>
  (shape) =>
    Shape.fromGeometry(twist$1(shape.toGeometry(), turnsPerMm));

Shape.registerMethod('twist', twist);

const untagGeometry = (geometry, tags) => {
  const isMatch = oneOfTagMatcher(tags, 'user');
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'group':
      case 'layout':
        return descend();
      default: {
        const { tags = [] } = geometry;
        const remaining = [];
        for (const tag of tags) {
          if (!isMatch(tag)) {
            remaining.push(tag);
          }
        }
        return descend({ tags: remaining });
      }
    }
  };
  return rewrite(geometry, op);
};

const untag =
  (...tags) =>
  (shape) =>
    Shape.fromGeometry(untagGeometry(shape.toGeometry(), tags));

Shape.registerMethod('untag', untag);

const byType = (args, defaultOptions) => {
  let viewId;
  let op = (x) => x;
  let options = defaultOptions;

  // An attempt to make view less annoying by assigning the arguments based on type.
  for (const arg of args) {
    if (arg instanceof Function) {
      op = arg;
    } else if (arg instanceof Object) {
      options = Object.assign({}, defaultOptions, arg);
    } else if (arg !== undefined) {
      viewId = arg;
    }
  }
  return { viewId, op, options };
};

const markContent = (geometry) => {
  if (geometry.type === 'group') {
    return {
      ...geometry,
      content: geometry.content.map((child, nth) =>
        tagGeometry(untagGeometry(child, ['groupChildId:*']), [
          `groupChildId:${nth}`,
        ])
      ),
    };
  } else {
    return geometry;
  }
};

// FIX: Avoid the extra read-write cycle.
const baseView =
  (viewId, op = (x) => x, options = {}) =>
  (shape) => {
    let {
      size,
      skin = true,
      outline = true,
      wireframe = false,
      inline,
      width = 512,
      height = 256,
      position = [100, -100, 100],
      withAxes = false,
      withGrid = true,
    } = options;

    if (size !== undefined) {
      width = size;
      height = size / 2;
    }
    const viewShape = op(shape);
    const sourceLocation = getSourceLocation();
    if (!sourceLocation) {
      console.log('No sourceLocation');
    }
    const { id, path } = sourceLocation;
    for (const entry of ensurePages(
      markContent(viewShape.toDisplayGeometry({ skin, outline, wireframe }))
    )) {
      const geometry = tagGeometry(untagGeometry(entry, ['viewId:*']), [
        `viewId:${viewId}`,
      ]);
      const viewPath = `view/${path}/${id}/${viewId}`;
      addPending(write$1(viewPath, geometry));
      const view = {
        viewId,
        width,
        height,
        position,
        inline,
        withAxes,
        withGrid,
      };
      emit({ hash: generateUniqueId(), path: viewPath, view });
    }
    return shape;
  };

const topView =
  (...args) =>
  (shape) => {
    const { viewId, op, options } = byType(args, {
      size: 512,
      skin: true,
      outline: true,
      wireframe: false,
      width: 1024,
      height: 512,
      position: [0, 0, 100],
    });
    return view(viewId, op, options)(shape);
  };

Shape.registerMethod('topView', topView);

const gridView = (...args) => {
  const { viewId, op, options } = byType(args, {
    size: 512,
    skin: true,
    outline: true,
    wireframe: false,
    width: 1024,
    height: 512,
    position: [0, 0, 100],
    withGrid: true,
  });
  return (shape) => view(viewId, op, options)(shape);
};

Shape.registerMethod('gridView', gridView);

const frontView =
  (...args) =>
  (shape) => {
    const { viewId, op, options } = byType(args, {
      size: 512,
      skin: true,
      outline: true,
      wireframe: false,
      width: 1024,
      height: 512,
      position: [0, -100, 0],
    });
    return (shape) => view(viewId, op, options)(shape);
  };

Shape.registerMethod('frontView', frontView);

Shape.registerMethod('sideView');

const view =
  (...args) =>
  (shape) => {
    const { viewId, op, options } = byType(args, {});
    switch (options.style) {
      case 'grid':
        return shape.gridView(viewId, op, options);
      case 'none':
        return shape;
      case 'side':
        return shape.sideView(viewId, op, options);
      case 'top':
        return shape.topView(viewId, op, options);
      default:
        return baseView(viewId, op, options)(shape);
    }
  };

Shape.registerMethod('view', view);

const voidIn = (other) => (shape) =>
  Shape.toShape(other, shape).fitTo(shape.void());

Shape.registerMethod('voidIn', voidIn);

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

const floor = (value, resolution) =>
  Math.floor(value / resolution) * resolution;
const ceil = (value, resolution) => Math.ceil(value / resolution) * resolution;

const floorPoint = ([x, y, z], resolution) => [
  floor(x, resolution),
  floor(y, resolution),
  floor(z, resolution),
];
const ceilPoint = ([x, y, z], resolution) => [
  ceil(x, resolution),
  ceil(y, resolution),
  ceil(z, resolution),
];

const voxels =
  (resolution = 1) =>
  (shape) => {
    const offset = resolution / 2;
    const geometry = shape.toGeometry();
    const [boxMin, boxMax] = measureBoundingBox(geometry);
    const min = floorPoint(boxMin, resolution);
    const max = ceilPoint(boxMax, resolution);
    const polygons = [];
    withQuery(geometry, ({ isInteriorPoint }) => {
      for (let x = min[X$1] - offset; x <= max[X$1] + offset; x += resolution) {
        for (let y = min[Y$1] - offset; y <= max[Y$1] + offset; y += resolution) {
          for (let z = min[Z$1] - offset; z <= max[Z$1] + offset; z += resolution) {
            const state = isInteriorPoint(x, y, z);
            if (state !== isInteriorPoint(x + resolution, y, z)) {
              const face = [
                [x + offset, y - offset, z - offset],
                [x + offset, y + offset, z - offset],
                [x + offset, y + offset, z + offset],
                [x + offset, y - offset, z + offset],
              ];
              polygons.push({ points: state ? face : face.reverse() });
            }
            if (state !== isInteriorPoint(x, y + resolution, z)) {
              const face = [
                [x - offset, y + offset, z - offset],
                [x + offset, y + offset, z - offset],
                [x + offset, y + offset, z + offset],
                [x - offset, y + offset, z + offset],
              ];
              polygons.push({ points: state ? face.reverse() : face });
            }
            if (state !== isInteriorPoint(x, y, z + resolution)) {
              const face = [
                [x - offset, y - offset, z + offset],
                [x + offset, y - offset, z + offset],
                [x + offset, y + offset, z + offset],
                [x - offset, y + offset, z + offset],
              ];
              polygons.push({ points: state ? face : face.reverse() });
            }
          }
        }
      }
    });
    return Shape.fromPolygons(polygons);
  };

Shape.registerMethod('voxels', voxels);

const Voxels = (...points) => {
  const offset = 0.5;
  const index = new Set();
  const key = (x, y, z) => `${x},${y},${z}`;
  let max = [-Infinity, -Infinity, -Infinity];
  let min = [Infinity, Infinity, Infinity];
  for (const [x, y, z] of points.map((point) =>
    Shape.toCoordinate(undefined, point)
  )) {
    index.add(key(x, y, z));
    max[X$1] = Math.max(x + 1, max[X$1]);
    max[Y$1] = Math.max(y + 1, max[Y$1]);
    max[Z$1] = Math.max(z + 1, max[Z$1]);
    min[X$1] = Math.min(x - 1, min[X$1]);
    min[Y$1] = Math.min(y - 1, min[Y$1]);
    min[Z$1] = Math.min(z - 1, min[Z$1]);
  }
  const isInteriorPoint = (x, y, z) => index.has(key(x, y, z));
  const polygons = [];
  for (let x = min[X$1]; x <= max[X$1]; x++) {
    for (let y = min[Y$1]; y <= max[Y$1]; y++) {
      for (let z = min[Z$1]; z <= max[Z$1]; z++) {
        const state = isInteriorPoint(x, y, z);
        if (state !== isInteriorPoint(x + 1, y, z)) {
          const face = [
            [x + offset, y - offset, z - offset],
            [x + offset, y + offset, z - offset],
            [x + offset, y + offset, z + offset],
            [x + offset, y - offset, z + offset],
          ];
          polygons.push({ points: state ? face : face.reverse() });
        }
        if (state !== isInteriorPoint(x, y + 1, z)) {
          const face = [
            [x - offset, y + offset, z - offset],
            [x + offset, y + offset, z - offset],
            [x + offset, y + offset, z + offset],
            [x - offset, y + offset, z + offset],
          ];
          polygons.push({ points: state ? face.reverse() : face });
        }
        if (state !== isInteriorPoint(x, y, z + 1)) {
          const face = [
            [x - offset, y - offset, z + offset],
            [x + offset, y - offset, z + offset],
            [x + offset, y + offset, z + offset],
            [x - offset, y + offset, z + offset],
          ];
          polygons.push({ points: state ? face : face.reverse() });
        }
      }
    }
  }
  return Shape.fromPolygons(polygons).tag('editType:Voxels');
};

Shape.prototype.Voxels = Shape.shapeMethod(Voxels);

const weld =
  (...rest) =>
  (first) => {
    const unwelded = [];
    for (const shape of [first, ...rest]) {
      // We lose the tags at this point.
      const result = toPolygonsWithHoles(shape.toGeometry());
      for (const { polygonsWithHoles } of result) {
        unwelded.push(...polygonsWithHoles);
      }
    }
    const welds = [];
    const arrangements = arrangePolygonsWithHoles(unwelded);
    for (const { polygonsWithHoles } of arrangements) {
      // Keep the planar grouping.
      const triangles = fromPolygonsWithHolesToTriangles(polygonsWithHoles);
      const graph = fromTrianglesToGraph({}, triangles);
      welds.push(graph);
    }
    // A group of planar welds.
    return Shape.fromGeometry(taggedGroup({}, ...welds));
  };

Shape.registerMethod('weld', weld);

const Weld = (first, ...rest) => first.weld(...rest);

Shape.prototype.Weld = Shape.shapeMethod(Weld);

// DEPRECATE

const withFn =
  (...shapes) =>
  (shape) =>
    assemble(shape, ...shapes);

Shape.registerMethod('with', withFn);

const x =
  (...x) =>
  (shape) =>
    Shape.Group(...shape.toFlatValues(x).map((x) => move([x, 0, 0])(shape)));

Shape.registerMethod('x', x);

const y =
  (...y) =>
  (shape) =>
    Shape.Group(...shape.toFlatValues(y).map((y) => move([0, y, 0])(shape)));

Shape.registerMethod('y', y);

const z =
  (...z) =>
  (shape) =>
    Shape.Group(...shape.toFlatValues(z).map((z) => move([0, 0, z])(shape)));

Shape.registerMethod('z', z);

const Alpha = (componentLimit = 1, shape) => {
  const points = [];
  eachPoint((point) => points.push(point), shape.toGeometry());
  return Shape.fromGeometry(
    alphaShape({ tags: shape.toGeometry().tags }, points, componentLimit)
  );
};

const alpha =
  (componentLimit = 1) =>
  (shape) =>
    Alpha(componentLimit, shape);

Shape.registerMethod('alpha', alpha);

const Spiral = (
  toPathFromTurn = (turn) => [[turn]],
  { from, by, to, upto, downto } = {}
) => {
  let path = [null];
  for (const turn of seq(
    {
      from,
      by,
      to,
      upto,
      downto,
    },
    (turn) => turn,
    (...numbers) => numbers
  )()) {
    const radians = -turn * Math.PI * 2;
    const subpath = toPathFromTurn(turn);
    path = concatenatePath(path, rotateZPath(radians, subpath));
  }
  return Shape.fromPath(path);
};

Shape.prototype.Spiral = Shape.shapeMethod(Spiral);

const X = 0;
const Y = 1;
const Z = 2;

const reifyArc =
  (axis = Z) =>
  (geometry) => {
    let { start = 0, end = 1 } = getAngle(geometry);

    while (start > end) {
      start -= 1;
    }

    const [scale, middle] = getScale(geometry);
    const corner1 = getCorner1(geometry);
    const corner2 = getCorner2(geometry);

    const left = corner1[X];
    const right = corner2[X];

    const front = corner1[Y];
    const back = corner2[Y];

    const bottom = corner1[Z];
    const top = corner2[Z];

    const step = 1 / getSides(geometry, 32);
    const steps = Math.ceil((end - start) / step);
    const effectiveStep = (end - start) / steps;

    let spiral;

    if (end - start === 1) {
      spiral = Spiral((a) => [[1]], {
        from: start - 1 / 4,
        upto: end - 1 / 4,
        by: effectiveStep,
      })
        .close()
        .fill();
    } else {
      spiral = Spiral((a) => [[1]], {
        from: start - 1 / 4,
        to: end - 1 / 4,
        by: effectiveStep,
      });
    }

    switch (axis) {
      case X: {
        scale[X] = 1;
        spiral = spiral
          .ry(-1 / 4)
          .scale(scale)
          .move(middle);
        if (left !== right) {
          spiral = spiral.fill().ex(left - middle[X], right - middle[X]);
        }
        break;
      }
      case Y: {
        scale[Y] = 1;
        spiral = spiral
          .rx(-1 / 4)
          .scale(scale)
          .move(middle);
        if (front !== back) {
          spiral = spiral.fill().ey(front - middle[Y], back - middle[Y]);
        }
        break;
      }
      case Z: {
        scale[Z] = 1;
        spiral = spiral.scale(scale).move(middle);
        if (top !== bottom) {
          spiral = spiral.fill().ez(top - middle[Z], bottom - middle[Z]);
        }
        break;
      }
    }

    return spiral.tag(...geometry.tags);
  };

Shape.registerReifier('Arc', reifyArc(Z));
Shape.registerReifier('ArcX', reifyArc(X));
Shape.registerReifier('ArcY', reifyArc(Y));
Shape.registerReifier('ArcZ', reifyArc(Z));

const ArcOp =
  (type) =>
  (x = 1, y = x, z = 0) => {
    const c1 = [0, 0, 0];
    const c2 = [0, 0, 0];
    if (x instanceof Array) {
      if (x[0] < x[1]) {
        c1[X] = x[1];
        c2[X] = x[0];
      } else {
        c1[X] = x[0];
        c2[X] = x[1];
      }
    } else {
      c1[X] = x / 2;
      c2[X] = x / -2;
    }
    if (y instanceof Array) {
      if (y[0] < y[1]) {
        c1[Y] = y[1];
        c2[Y] = y[0];
      } else {
        c1[Y] = y[0];
        c2[Y] = y[1];
      }
    } else {
      c1[Y] = y / 2;
      c2[Y] = y / -2;
    }
    if (z instanceof Array) {
      if (z[0] < z[1]) {
        c1[Z] = z[1];
        c2[Z] = z[0];
      } else {
        c1[Z] = z[0];
        c2[Z] = z[1];
      }
    } else {
      c1[Z] = z / 2;
      c2[Z] = z / -2;
    }
    return Shape.fromGeometry(taggedPlan({}, { type }))
      .hasC1(...c1)
      .hasC2(...c2);
  };

const Arc = ArcOp('Arc');
const ArcX = ArcOp('ArcX');
const ArcY = ArcOp('ArcY');
const ArcZ = ArcOp('ArcZ');

Shape.prototype.Arc = Shape.shapeMethod(Arc);
Shape.prototype.ArcX = Shape.shapeMethod(ArcX);
Shape.prototype.ArcY = Shape.shapeMethod(ArcY);
Shape.prototype.ArcZ = Shape.shapeMethod(ArcZ);

const Assembly = (...shapes) =>
  Shape.fromGeometry(
    assemble$1(...Shape.toShapes(shapes).map((shape) => shape.toGeometry()))
  );

Shape.prototype.Assembly = Shape.shapeMethod(Assembly);

const Cached = (name, thunk) => {
  const op = (...args) => {
    const path = `cached/${name}/${JSON.stringify(args)}`;
    // The first time we hit this, we'll schedule a read and throw, then wait for the read to complete, and retry.
    const cached = loadGeometryNonblocking(path);
    if (cached) {
      return cached;
    }
    // The read we scheduled last time produced undefined, so we fall through to here.
    const shape = thunk(...args);
    // This will schedule a write and throw, then wait for the write to complete, and retry.
    saveGeometryNonblocking(path, shape);
    return shape;
  };
  return op;
};

const Hull = (...shapes) => {
  const points = [];
  for (const shape of shapes) {
    if (!shape) {
      continue;
    }
    eachPoint((point) => points.push(point), shape.toGeometry());
  }
  return Shape.fromGeometry(convexHullToGraph({}, points));
};

Shape.prototype.Hull = Shape.shapeMethod(Hull);

const hull =
  (...shapes) =>
  (shape) =>
    Hull(shape, ...shapes.map((other) => Shape.toShape(other, shape)));

Shape.registerMethod('hull', hull);

const Points = (...args) =>
  Shape.fromPoints(args.map((arg) => Shape.toCoordinate(undefined, arg)));

Shape.prototype.Points = Shape.shapeMethod(Points);

const ChainedHull = (...shapes) => {
  const pointsets = shapes.map((shape) => shape.toPoints());
  const chain = [];
  for (let nth = 1; nth < pointsets.length; nth++) {
    const points = [...pointsets[nth - 1], ...pointsets[nth]];
    chain.push(Hull(Points(...points)));
  }
  return Group(...chain);
};

const chainHullMethod = function (...shapes) {
  return ChainedHull(this, ...shapes);
};

Shape.prototype.chainHull = chainHullMethod;
Shape.prototype.ChainedHull = Shape.shapeMethod(ChainedHull);

const Edges = (...segments) =>
  Shape.fromSegments(
    ...Shape.toNestedValues(segments).map(([source, target]) => [
      Shape.toCoordinate(undefined, source),
      Shape.toCoordinate(undefined, target),
    ])
  );

Shape.prototype.Edges = Shape.shapeMethod(Edges);

const Empty = (...shapes) => Shape.fromGeometry(taggedGroup({}));

Shape.prototype.Empty = Shape.shapeMethod(Empty);

const Hexagon = (x, y, z) => Arc(x, y, z).hasSides(6);

Shape.prototype.Hexagon = Shape.shapeMethod(Hexagon);

/** @type {function(Point[], Path[]):Triangle[]} */
const fromPointsAndPaths = (points = [], paths = []) => {
  /** @type {Polygon[]} */
  const polygons = [];
  for (const path of paths) {
    polygons.push({ points: fromPoints$1(path.map((nth) => points[nth])) });
  }
  return polygons;
};

// Unit icosahedron vertices.
/** @type {Point[]} */
const points = [
  [0.850651, 0.0, -0.525731],
  [0.850651, -0.0, 0.525731],
  [-0.850651, -0.0, 0.525731],
  [-0.850651, 0.0, -0.525731],
  [0.0, -0.525731, 0.850651],
  [0.0, 0.525731, 0.850651],
  [0.0, 0.525731, -0.850651],
  [0.0, -0.525731, -0.850651],
  [-0.525731, -0.850651, -0.0],
  [0.525731, -0.850651, -0.0],
  [0.525731, 0.850651, 0.0],
  [-0.525731, 0.850651, 0.0],
];

// Triangular decomposition structure.
/** @type {Path[]} */
const paths = [
  [1, 9, 0],
  [0, 10, 1],
  [0, 7, 6],
  [0, 6, 10],
  [0, 9, 7],
  [4, 1, 5],
  [9, 1, 4],
  [1, 10, 5],
  [3, 8, 2],
  [2, 11, 3],
  [4, 5, 2],
  [2, 8, 4],
  [5, 11, 2],
  [6, 7, 3],
  [3, 11, 6],
  [3, 7, 8],
  [4, 8, 9],
  [5, 10, 11],
  [6, 11, 10],
  [7, 9, 8],
];

// FIX: Why aren't we computing the convex hull?

/**
 * Computes the polygons of a unit icosahedron.
 * @type {function():Triangle[]}
 */
const buildRegularIcosahedron = () => {
  return fromPointsAndPaths(points, paths);
};

Shape.registerReifier('Icosahedron', (geometry) => {
  const [scale, middle] = getScale(geometry);
  const a = Shape.fromPolygons(buildRegularIcosahedron());
  const b = a.scale(...scale);
  const c = b.move(...middle);
  return c;
});

const Icosahedron = (x = 1, y = x, z = x) =>
  Shape.fromGeometry(taggedPlan({}, { type: 'Icosahedron' })).hasDiameter(
    x,
    y,
    z
  );

Shape.prototype.Icosahedron = Shape.shapeMethod(Icosahedron);

const Implicit = (op, options) =>
  Shape.fromGeometry(fromFunctionToGraph({}, op, options));

Shape.prototype.Implicit = Shape.shapeMethod(Implicit);

const Join = (...shapes) =>
  Shape.fromGeometry(fuse$1(shapes.map((shape) => shape.toGeometry())));

Shape.prototype.Join = Shape.shapeMethod(Join);

const Line = (forward, backward = 0) =>
  Edge(Point(forward), Point(backward));

Shape.prototype.Line = Shape.shapeMethod(Line);

const Octagon = (x, y, z) => Arc(x, y, z).hasSides(8);

Shape.prototype.Octagon = Shape.shapeMethod(Octagon);

// Approximates a UV sphere.
const extrudeSphere =
  (height = 1, { sides = 20 } = {}) =>
  (shape) => {
    const lofts = [];

    const getEffectiveSlice = (slice) => {
      if (slice === 0) {
        return 0.5;
      } else if (slice === latitudinalResolution) {
        return latitudinalResolution - 0.5;
      } else {
        return slice;
      }
    };

    const latitudinalResolution = sides;

    for (let slice = 0; slice <= latitudinalResolution; slice++) {
      const angle =
        (Math.PI * 1.0 * getEffectiveSlice(slice)) / latitudinalResolution;
      const z = Math.cos(angle);
      const radius = Math.sin(angle);
      lofts.push((s) => s.scale(radius, radius, 1).z(z * height));
    }
    return shape.loft(...lofts.reverse());
  };

Shape.registerMethod('extrudeSphere', extrudeSphere);

Shape.registerReifier('Orb', (geometry) => {
  const [scale, middle] = getScale(geometry);
  const sides = getSides(geometry, 16);
  return extrudeSphere(1, { sides: 2 + sides })(Arc(2).hasSides(sides * 2))
    .scale(scale)
    .move(middle);
});

const Orb = (x = 1, y = x, z = x) =>
  Shape.fromGeometry(taggedPlan({}, { type: 'Orb' })).hasDiameter(x, y, z);

Shape.prototype.Orb = Shape.shapeMethod(Orb);

const fromVec3 = (...points) =>
  Shape.fromOpenPath(points.map(([x = 0, y = 0, z = 0]) => [x, y, z]));

const fromPoints = (...shapes) => {
  const vec3List = [];
  for (const shape of shapes) {
    eachPoint((vec3) => vec3List.push(vec3), shape.toGeometry());
  }
  return fromVec3(...vec3List);
};

const Path = (...points) => fromPoints(...points);
Path.fromVec3 = fromVec3;

Shape.prototype.Path = Shape.shapeMethod(Path);

const Pentagon = (x, y, z) => Arc(x, y, z).hasSides(5);

Shape.prototype.Pentagon = Shape.shapeMethod(Pentagon);

const Polygon = (...points) =>
  Shape.fromClosedPath(
    points.map((point) => Shape.toCoordinate(undefined, point))
  ).fill();

Shape.prototype.Polygon = Shape.shapeMethod(Polygon);

const Septagon = (x, y, z) => Arc(x, y, z).hasSides(7);

Shape.prototype.Septagon = Shape.shapeMethod(Septagon);

const SurfaceMesh = (
  serializedSurfaceMesh,
  { isClosed = true, matrix } = {}
) =>
  Shape.fromGeometry(
    taggedGraph({ tags: [], matrix }, { serializedSurfaceMesh, isClosed })
  );

const Tetragon = (x, y, z) => Arc(x, y, z).hasSides(4);

Shape.prototype.Tetragon = Shape.shapeMethod(Tetragon);

const Triangle = (x, y, z) => Arc(x, y, z).hasSides(3);

Shape.prototype.Triangle = Shape.shapeMethod(Triangle);

const Wave = (
  toPathFromXDistance = (xDistance) => [[0]],
  { from, by, to, upto, downto } = {}
) => {
  let path = [null];
  for (const xDistance of seq(
    {
      from,
      by,
      to,
      upto,
      downto,
    },
    (distance) => distance,
    (...numbers) => numbers
  )()) {
    const subpath = toPathFromXDistance(xDistance);
    path = concatenatePath(path, translatePath([xDistance, 0, 0], subpath));
  }
  return Shape.fromPath(path);
};

Shape.prototype.Wave = Shape.shapeMethod(Wave);

/**
 *
 * Defines the interface used by the api to access the rest of the system on
 * behalf of a user. e.g., algorithms and geometries.
 *
 * A user can destructively update this mapping in their code to change what
 * the api uses.
 */

const xy = Shape.fromGeometry({
  type: 'item',
  tags: ['item:xy'],
  content: [
    {
      type: 'group',
      content: [],
      matrix: [
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
        0,
        0,
        0,
        1,
        '1',
        '0',
        '0',
        '0',
        '0',
        '1',
        '0',
        '0',
        '0',
        '0',
        '1',
        '0',
        '1',
      ],
    },
  ],
  matrix: [
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
    0,
    0,
    0,
    1,
    '1',
    '0',
    '0',
    '0',
    '0',
    '1',
    '0',
    '0',
    '0',
    '0',
    '1',
    '0',
    '1',
  ],
});
const xz = Shape.fromGeometry({
  type: 'item',
  tags: ['item:xz'],
  content: [
    {
      type: 'group',
      tags: [],
      content: [],
      matrix: [
        1,
        0,
        0,
        0,
        0,
        0,
        -1,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        '1',
        '0',
        '0',
        '0',
        '0',
        '0',
        '1',
        '0',
        '0',
        '-1',
        '0',
        '0',
        '1',
      ],
    },
  ],
  matrix: [
    1,
    0,
    0,
    0,
    0,
    0,
    -1,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    1,
    '1',
    '0',
    '0',
    '0',
    '0',
    '0',
    '1',
    '0',
    '0',
    '-1',
    '0',
    '0',
    '1',
  ],
});
const yz = Shape.fromGeometry({
  type: 'item',
  tags: ['item:yz'],
  content: [
    {
      type: 'group',
      tags: [],
      content: [],
      matrix: [
        0,
        0,
        -1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        '0',
        '0',
        '1',
        '0',
        '0',
        '1',
        '0',
        '0',
        '-1',
        '0',
        '0',
        '0',
        '1',
      ],
    },
  ],
  matrix: [
    0,
    0,
    -1,
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    '0',
    '0',
    '1',
    '0',
    '0',
    '1',
    '0',
    '0',
    '-1',
    '0',
    '0',
    '0',
    '1',
  ],
});

export { Alpha, Arc, ArcX, ArcY, ArcZ, Assembly, Box, Cached, ChainedHull, Edge, Edges, Empty, Face, GrblConstantLaser, GrblDynamicLaser, GrblPlotter, GrblSpindle, Group, Hershey, Hexagon, Hull, Icosahedron, Implicit, Join, Line, Octagon, Orb, Page, Path, Pentagon, Plan, Point, Points, Polygon, Polyhedron, Septagon, Shape, Spiral, SurfaceMesh, Tetragon, Triangle, Voxels, Wave, Weld, abstract, add, addTo, align, and, as, asPart, at, bend, billOfMaterials, cast, center, clip, clipFrom, cloudSolid, color, colors, cut, cutFrom, cutout, defRgbColor, defThreejsMaterial, defTool, define, drop, e, each, edit, ensurePages, ex, extrudeAlong, extrudeToPlane, extrudeX, extrudeY, extrudeZ, ey, ez, faces, fill, fit, fitTo, fuse, g, get, getEdge, getNot, gn, grow, inline, inset, keep, loadGeometry, loft, log, loop, mask, material, md, minkowskiDifference, minkowskiShell, minkowskiSum, move, moveAlong, moveTo, n, noVoid, noop, normal, notColor, nth, ofPlan, offset, on, op, orient, outline, overlay, pack, play, points$1 as points, push, remesh, removeSelfIntersections, rotate, rotateX, rotateY, rotateZ, rx, ry, rz, saveGeometry, scale, scaleToFit, scaleX, scaleY, scaleZ, section, sectionProfile, separate, seq, serialize, simplify, size, sketch, smooth, sx, sy, sz, table, tag, tags, taper, test, tint, to, tool, top, twist, untag, view, voidFn, voidIn, voxels, weld, withFill, withFn, withInset, withOp, x, xy, xyz, xz, y, yz, z };
