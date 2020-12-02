import Shape, { Shape as Shape$1, log } from './jsxcad-api-v1-shape.js';
import { orthogonal, add, scale, dot } from './jsxcad-math-vec3.js';
import Plan from './jsxcad-api-v1-plan.js';
import { visit, getSolids, getSurfaces, getZ0Surfaces } from './jsxcad-geometry-tagged.js';
import { toPlane } from './jsxcad-geometry-surface.js';
import { toXYPlaneTransforms } from './jsxcad-math-plane.js';

/**
 *
 * # Connector
 *
 * Returns a connector plan.
 * See connect().
 *
 * ::: illustration { "view": { "position": [60, -60, 60], "target": [0, 0, 0] } }
 * ```
 * Cube(10).with(Connector('top').move(5))
 * ```
 * :::
 * ::: illustration { "view": { "position": [60, -60, 60], "target": [0, 0, 0] } }
 * ```
 * Cube(10).Connector('top').moveZ(5).connect(Sphere(5).Connector('bottom').flip().moveZ(-5))
 * ```
 * :::
 **/

const shapeToConnect = Symbol('shapeToConnect');

// A connector is an oriented reference point.
//
// The orientation expresses the direction of facing orthogonal to that axis.
// The joint may have a zero length (origin and end are equal), but axis must not equal origin.
// Note: axis must be further than end from origin.

const Connector = (
  connector,
  {
    plane = [0, 0, 1, 0],
    center = [0, 0, 0],
    right = [1, 0, 0],
    start = [0, 0, 0],
    end = [0, 0, 0],
    shape,
    visualization,
  } = {}
) => {
  const plan = Plan(
    // Geometry
    {
      plan: { connector },
      marks: [center, right, start, end],
      planes: [plane],
      tags: [`connector/${connector}`],
      visualization,
    },
    // Context
    {
      [shapeToConnect]: shape,
    }
  );
  return plan;
};

Plan.Connector = Connector;

const ConnectorMethod = function (connector, options) {
  return Connector(connector, { ...options, [shapeToConnect]: this });
};
Shape.prototype.Connector = ConnectorMethod;

Connector.signature =
  'Connector(id:string, { plane:Plane, center:Point, right:Point, start:Point, end:Point, shape:Shape, visualization:Shape }) -> Shape';

// Associates an existing connector with a shape.
const toConnectorMethod = function (connector, options) {
  return Shape.fromGeometry(connector.toKeptGeometry(), {
    ...options,
    [shapeToConnect]: this,
  });
};
Shape.prototype.toConnector = toConnectorMethod;

/**
 *
 * # connectors
 *
 * Returns the set of connectors in an assembly by tag.
 * Note that connectors inside Items are not visible.
 * See connect().
 *
 * ::: illustration { "view": { "position": [60, -60, 60], "target": [0, 0, 0] } }
 * ```
 * Cube(10).with(Connector('top').moveZ(5))
 *         .connectors()['top']
 *         .connect(Prism(10, 10).with(Connector('bottom').flip().moveZ(-5))
 *                               .connectors()['bottom']);
 * ```
 * :::
 **/

const connectors = (shape) => {
  const connectors = [];
  const walk = (geometry, descend) => {
    if (geometry.item) ; else if (geometry.plan && geometry.plan.connector) {
      connectors.push(
        Shape.fromGeometry(geometry, { [shapeToConnect]: shape })
      );
    } else {
      descend();
    }
  };
  visit(shape.toKeptGeometry(), walk);
  return connectors;
};

const connectorsMethod = function () {
  return connectors(this);
};
Shape.prototype.connectors = connectorsMethod;

/**
 *
 * # connector
 *
 * Returns a connector from an assembly.
 * See connect().
 *
 * ::: illustration { "view": { "position": [60, -60, 60], "target": [0, 0, 0] } }
 * ```
 * Prism(10, 10).with(Connector('top').moveZ(5))
 *              .connector('top')
 *              .connect(Cube(10).with(Connector('bottom').flip().moveZ(-5))
 *                               .connector('bottom'));
 * ```
 * :::
 **/

const connector = (shape, id) => {
  for (const connector of connectors(shape)) {
    if (connector.toGeometry().plan.connector === id) {
      return connector;
    }
  }
};

const connectorMethod = function (id) {
  return connector(this, id);
};
Shape.prototype.connector = connectorMethod;

// FIX:
// This will produce the average position, but that's probably not what we
// want, since it will include interior points produced by breaking up
// convexity.
const toPosition = (surface) => {
  let sum = [0, 0, 0];
  let count = 0;
  for (const path of surface) {
    for (const point of path) {
      sum = add(sum, point);
      count += 1;
    }
  }
  const position = scale(1 / count, sum);
  return position;
};

const faceConnector = (shape, id, scoreOrientation, scorePosition) => {
  let bestSurface;
  let bestPosition;
  let bestOrientationScore = -Infinity;
  let bestPositionScore = -Infinity;

  // FIX: This may be sensitive to noise.
  const geometry = shape.toKeptGeometry();
  for (const { solid } of getSolids(geometry)) {
    for (const surface of solid) {
      const orientationScore = scoreOrientation(surface);
      if (orientationScore > bestOrientationScore) {
        bestSurface = surface;
        bestOrientationScore = orientationScore;
        bestPosition = toPosition(surface);
        bestPositionScore = scorePosition(bestPosition);
      } else if (orientationScore === bestOrientationScore) {
        const position = toPosition(surface);
        const positionScore = scorePosition(position);
        if (positionScore > bestPositionScore) {
          bestSurface = surface;
          bestPosition = position;
          bestPositionScore = positionScore;
        }
      }
    }
  }

  // FIX: We should have a consistent rule for deciding the rotational position of the connector.
  const plane = toPlane(bestSurface);
  return shape.toConnector(
    Connector(id, {
      plane,
      center: bestPosition,
      right: add(bestPosition, orthogonal(plane)),
    })
  );
};

const toConnector = (shape, surface, id) => {
  const center = toPosition(surface);
  // FIX: Adding y + 1 is not always correct.
  const plane = toPlane(surface);
  return Connector(id, { plane, center, right: orthogonal(plane) });
};

const withConnector = (shape, surface, id) => {
  return shape.toConnector(toConnector(shape, surface, id));
};

const Y = 1;

const back = (shape) =>
  shape.connector('back') ||
  faceConnector(
    shape,
    'back',
    (surface) => dot(toPlane(surface), [0, 1, 0, 0]),
    (point) => point[Y]
  );

const backMethod = function () {
  return back(this);
};
Shape.prototype.back = backMethod;

back.signature = 'back(shape:Shape) -> Shape';
backMethod.signature = 'Shape -> back() -> Shape';

const Z = 2;

const bottom = (shape) =>
  shape.connector('bottom') ||
  faceConnector(
    shape,
    'bottom',
    (surface) => dot(toPlane(surface), [0, 0, -1, 0]),
    (point) => -point[Z]
  );

const bottomMethod = function () {
  return bottom(this);
};
Shape.prototype.bottom = bottomMethod;

bottom.signature = 'bottom(shape:Shape) -> Shape';
bottomMethod.signature = 'Shape -> bottom() -> Shape';

const Z$1 = 2;

const findFlatTransforms = (shape) => {
  let bestDepth = Infinity;
  let bestTo;
  let bestFrom;
  let bestSurface;

  const assay = (surface) => {
    const plane = toPlane(surface);
    if (plane !== undefined) {
      const [to, from] = toXYPlaneTransforms(plane);
      const flatShape = shape.transform(to);
      const [min, max] = flatShape.measureBoundingBox();
      const depth = max[Z$1] - min[Z$1];
      if (depth < bestDepth) {
        bestDepth = depth;
        bestTo = to;
        bestFrom = from;
        bestSurface = surface;
      }
    }
  };

  const geometry = shape.toKeptGeometry();
  for (const { solid } of getSolids(geometry)) {
    for (const surface of solid) {
      assay(surface);
    }
  }
  for (const { surface } of getSurfaces(geometry)) {
    assay(surface);
  }
  for (const { z0Surface } of getZ0Surfaces(geometry)) {
    assay(z0Surface);
  }

  return [bestTo, bestFrom, bestSurface];
};

const flat = (shape) => {
  const [, , bestSurface] = findFlatTransforms(shape);
  return withConnector(shape, bestSurface, 'flat');
};

const flatMethod = function () {
  return flat(this);
};
Shape.prototype.flat = flatMethod;

flat.signature = 'flat(shape:Shape) -> Connector';
flatMethod.signature = 'Shape -> flat() -> Connector';

// Perform an operation on the shape in its best flat orientation,
// returning the result in the original orientation.

const inFlat = (shape, op) => {
  const [to, from] = findFlatTransforms(shape);
  return op(shape.transform(to)).transform(from);
};

const inFlatMethod = function (op = (_) => _) {
  return inFlat(this, op);
};
Shape.prototype.inFlat = inFlatMethod;

const Y$1 = 1;

const front = (shape) =>
  shape.connector('front') ||
  faceConnector(
    shape,
    'front',
    (surface) => dot(toPlane(surface), [0, -1, 0, 0]),
    (point) => -point[Y$1]
  );

const frontMethod = function () {
  return front(this);
};
Shape.prototype.front = frontMethod;

front.signature = 'front(shape:Shape) -> Shape';
frontMethod.signature = 'Shape -> front() -> Shape';

const X = 0;

const left = (shape) =>
  shape.connector('left') ||
  faceConnector(
    shape,
    'left',
    (surface) => dot(toPlane(surface), [-1, 0, 0, 0]),
    (point) => -point[X]
  );

const leftMethod = function () {
  return left(this);
};
Shape.prototype.left = leftMethod;

left.signature = 'left(shape:Shape) -> Shape';
leftMethod.signature = 'Shape -> left() -> Shape';

const on = (above, below, op = (_) => _) =>
  above.bottom().to(below.top().op(op));

const onMethod = function (below, op) {
  return on(this, below, op);
};

Shape.prototype.on = onMethod;

const X$1 = 0;

const right = (shape) =>
  shape.connector('right') ||
  faceConnector(
    shape,
    'right',
    (surface) => dot(toPlane(surface), [1, 0, 0, 0]),
    (point) => point[X$1]
  );

const rightMethod = function () {
  return right(this);
};
Shape.prototype.right = rightMethod;

right.signature = 'right(shape:Shape) -> Shape';
rightMethod.signature = 'Shape -> right() -> Shape';

const Z$2 = 2;

const top = (shape) =>
  shape.connector('top') ||
  faceConnector(
    shape,
    'top',
    (surface) => dot(toPlane(surface), [0, 0, 1, 0]),
    (point) => point[Z$2]
  );

const topMethod = function () {
  return top(this);
};
Shape.prototype.top = topMethod;

top.signature = 'top(shape:Shape) -> Shape';
topMethod.signature = 'Shape -> top() -> Shape';

/**
 *
 * # Unfold
 *
 **/

// FIX: Does not handle convex solids.
const unfold = (shape) => {
  const faces = shape.faces((f) => f);
  log(`Face count is ${faces.length}`);
  const faceByEdge = new Map();

  for (const face of faces) {
    for (const edge of face.faceEdges()) {
      faceByEdge.set(edge, face);
    }
  }

  const reverseEdge = (edge) => {
    const [a, b] = edge.split(':');
    const reversedEdge = `${b}:${a}`;
    return reversedEdge;
  };

  const seen = new Set();
  const queue = [];

  const enqueueNeighbors = (face) => {
    for (const edge of face.faceEdges()) {
      const redge = reverseEdge(edge);
      const neighbor = faceByEdge.get(redge);
      if (neighbor === undefined || seen.has(neighbor)) continue;
      seen.add(neighbor);
      queue.push({
        face: neighbor,
        to: `face/edge:${edge}`,
        from: `face/edge:${redge}`,
      });
    }
  };

  let root = faces[0];
  enqueueNeighbors(root);

  while (queue.length > 0) {
    const { face, from, to } = queue.shift();
    seen.add(face);
    const fromConnector = face.connector(from);
    const toConnector = root.connector(to);
    if (fromConnector === undefined) {
      log('bad from');
      continue;
    }
    if (toConnector === undefined) {
      log('bad to');
      continue;
    }
    root = fromConnector.to(toConnector);
    if (root === undefined) break;
    enqueueNeighbors(face);
  }

  return root;
};

const method = function (...args) {
  return unfold(this);
};
Shape$1.prototype.unfold = method;

// Ideally this would be a plane of infinite extent.
// Unfortunately this makes things like interpolation tricky,
// so we approximate it with a very large polygon instead.

const X$2 = (x = 0) => {
  const size = 1e5;
  const min = -size;
  const max = size;
  const sheet = Shape$1.fromPathToSurface([
    [x, max, min],
    [x, max, max],
    [x, min, max],
    [x, min, min],
  ]);
  return toConnector(sheet, sheet.toGeometry().surface, 'top');
};

// Ideally this would be a plane of infinite extent.
// Unfortunately this makes things like interpolation tricky,
// so we approximate it with a very large polygon instead.

const Y$2 = (y = 0) => {
  const size = 1e5;
  const min = -size;
  const max = size;
  const sheet = Shape$1.fromPathToSurface([
    [max, y, min],
    [max, y, max],
    [min, y, max],
    [min, y, min],
  ]);
  return toConnector(sheet, sheet.toGeometry().surface, 'top');
};

// Ideally this would be a plane of infinite extent.
// Unfortunately this makes things like interpolation tricky,
// so we approximate it with a very large polygon instead.

const Z$3 = (z = 0) => {
  const size = 1e5;
  const min = -size;
  const max = size;
  // FIX: Why aren't we createing the connector directly?
  const sheet = Shape$1.fromPathToSurface([
    [max, min, z],
    [max, max, z],
    [min, max, z],
    [min, min, z],
  ]);
  return toConnector(sheet, sheet.toGeometry().surface, 'top');
};

const api = {
  X: X$2,
  Y: Y$2,
  Z: Z$3,
};

export default api;
export { X$2 as X, Y$2 as Y, Z$3 as Z };
