import Shape$1, { Shape, getPegCoords, orient } from './jsxcad-api-v1-shape.js';
import { alphaShape, fromPoints } from './jsxcad-geometry-graph.js';
import { taggedGraph, getPaths, extrude as extrude$1, extrudeToPlane as extrudeToPlane$1, fill as fill$1, outline as outline$1, section as section$1, taggedLayers, getSolids, union, taggedZ0Surface, getSurfaces, getZ0Surfaces, taggedPaths, measureBoundingBox, taggedSolid, taggedPoints, measureHeights } from './jsxcad-geometry-tagged.js';
import { Assembly, Group } from './jsxcad-api-v1-shapes.js';
import { Y as Y$1 } from './jsxcad-api-v1-connector.js';
import { loop } from './jsxcad-algorithm-shape.js';
import { isCounterClockwise, flip, getEdges } from './jsxcad-geometry-path.js';
import { toPlane } from './jsxcad-math-poly3.js';
import { scale, add, normalize, subtract, transform } from './jsxcad-math-vec3.js';
import { fromNormalAndPoint } from './jsxcad-math-plane.js';
import { fromRotation } from './jsxcad-math-mat4.js';
import { toolpath as toolpath$1 } from './jsxcad-algorithm-toolpath.js';
import { fromSolid, containsPoint as containsPoint$1 } from './jsxcad-geometry-bsp.js';
import { createNormalize3 } from './jsxcad-algorithm-quantize.js';
import { fromPolygons } from './jsxcad-geometry-solid.js';

const Alpha = (shape, componentLimit = 1) => {
  const points = [];
  shape.eachPoint((point) => points.push(point));
  return Shape.fromGeometry(
    taggedGraph({}, alphaShape(points, componentLimit))
  );
};

const alphaMethod = function (componentLimit = 1) {
  return Alpha(this, componentLimit);
};
Shape.prototype.alpha = alphaMethod;

/**
 *
 * # Lathe
 *
 * ::: illustration { "view": { "position": [-80, -80, 80] } }
 * ```
 * ```
 * :::
 *
 **/

const Loop = (
  shape,
  endDegrees = 360,
  { sides = 32, pitch = 0 } = {}
) => {
  const profile = shape.chop(Y$1(0));
  const outline = profile.outline();
  const solids = [];
  for (const geometry of getPaths(outline.toKeptGeometry())) {
    for (const path of geometry.paths) {
      for (
        let startDegrees = 0;
        startDegrees < endDegrees;
        startDegrees += 360
      ) {
        solids.push(
          Shape.fromGeometry(
            loop(
              path,
              (Math.min(360, endDegrees - startDegrees) * Math.PI) / 180,
              sides,
              pitch
            )
          ).moveX((pitch * startDegrees) / 360)
        );
      }
    }
  }
  return Assembly(...solids);
};

const LoopMethod = function (...args) {
  return Loop(this, ...args);
};
Shape.prototype.Loop = LoopMethod;

const cloudSolid = (shape) => {
  const points = shape.toPoints();
  return Shape.fromGeometry(taggedGraph({}, fromPoints(points)));
};

const cloudSolidMethod = function () {
  return cloudSolid(this);
};
Shape.prototype.cloudSolid = cloudSolidMethod;

const withCloudSolidMethod = function () {
  return this.with(cloudSolid(this));
};
Shape.prototype.withCloudSolid = withCloudSolidMethod;

const extrude = (shape, height = 1, depth = 0) => {
  if (height < depth) {
    [height, depth] = [depth, height];
  }
  return Shape$1.fromGeometry(extrude$1(shape.toGeometry(), height, depth));
};

const extrudeMethod = function (height = 1, depth = 0) {
  return extrude(this, height, depth);
};
Shape$1.prototype.extrude = extrudeMethod;
Shape$1.prototype.pull = extrudeMethod;

const extrudeToPlane = (
  shape,
  highPlane = [0, 0, 1, 1],
  lowPlane = [0, 0, 1, -1]
) => {
  return Shape$1.fromGeometry(
    extrudeToPlane$1(shape.toGeometry(), highPlane, lowPlane)
  );
};

const extrudeToPlaneMethod = function (highPlane, lowPlane) {
  return extrudeToPlane(this, highPlane, lowPlane);
};
Shape$1.prototype.extrudeToPlane = extrudeToPlaneMethod;

const fill = (shape) =>
  Shape.fromGeometry(fill$1(shape.toGeometry()));

const fillMethod = function () {
  return fill(this);
};

const withFillMethod = function () {
  return this.group(this.fill());
};

Shape.prototype.interior = fillMethod;
Shape.prototype.fill = fillMethod;
Shape.prototype.withFill = withFillMethod;

const outline = (shape) =>
  Group(
    ...outline$1(shape.toGeometry()).map((outline) =>
      Shape.fromGeometry(outline)
    )
  );

const outlineMethod = function () {
  return outline(this);
};

const withOutlineMethod = function (op = (x) => x) {
  return this.with(op(outline(this)));
};

Shape.prototype.outline = outlineMethod;
Shape.prototype.wire = outlineMethod;

Shape.prototype.withOutline = withOutlineMethod;
Shape.prototype.withWire = withOutlineMethod;

const inline = (shape) => outline(shape.flip());

const inlineMethod = function (options) {
  return inline(this);
};

const withInlineMethod = function (options) {
  return this.with(inline(this));
};

Shape$1.prototype.inline = inlineMethod;
Shape$1.prototype.withInline = withInlineMethod;

const section = (shape, ...pegs) => {
  const planes = [];
  if (pegs.length === 0) {
    planes.push([0, 0, 1, 0]);
  } else {
    for (const peg of pegs) {
      const { plane } = getPegCoords(peg);
      planes.push(plane);
    }
  }
  return Shape.fromGeometry(section$1(shape.toGeometry(), planes));
};

const sectionMethod = function (...args) {
  return section(this, ...args);
};
Shape.prototype.section = sectionMethod;

const squash = (shape) => {
  const geometry = shape.toKeptGeometry();
  const result = taggedLayers({});
  for (const { solid, tags } of getSolids(geometry)) {
    const polygons = [];
    for (const surface of solid) {
      for (const path of surface) {
        const flat = path.map(([x, y]) => [x, y, 0]);
        if (toPlane(flat) === undefined) continue;
        polygons.push(isCounterClockwise(flat) ? flat : flip(flat));
      }
    }
    result.content.push(
      union(...polygons.map((polygon) => taggedZ0Surface({ tags }, [polygon])))
    );
  }
  for (const { surface, tags } of getSurfaces(geometry)) {
    const polygons = [];
    for (const path of surface) {
      const flat = path.map(([x, y]) => [x, y, 0]);
      if (toPlane(flat) === undefined) continue;
      polygons.push(isCounterClockwise(flat) ? flat : flip(flat));
    }
    result.content.push(taggedZ0Surface({ tags }, polygons));
  }
  for (const { z0Surface, tags } of getZ0Surfaces(geometry)) {
    const polygons = [];
    for (const path of z0Surface) {
      polygons.push(path);
    }
    result.content.push(taggedZ0Surface({ tags }, polygons));
  }
  for (const { paths, tags } of getPaths(geometry)) {
    const flatPaths = [];
    for (const path of paths) {
      flatPaths.push(path.map(([x, y]) => [x, y, 0]));
    }
    result.content.push({ type: 'paths', paths: flatPaths, tags });
    result.content.push(taggedPaths({ tags }, flatPaths));
  }
  return Shape$1.fromGeometry(result);
};

const squashMethod = function () {
  return squash(this);
};
Shape$1.prototype.squash = squashMethod;

const START = 0;
const END = 1;

const planeOfBisection = (aStart, bStart, intersection) => {
  const dA = normalize(subtract(aStart, intersection));
  const dB = normalize(subtract(bStart, intersection));
  const bis2 = subtract(dA, dB);
  return fromNormalAndPoint(bis2, intersection);
};

const neg = ([x, y, z, w]) => [x, y, z, -w];

// FIX: There is something very wrong with this -- rotating the profile around z can produce inversion.
const sweep = (toolpath, tool, up = [0, 0, 1, 0]) => {
  const chains = [];
  for (const { paths } of getPaths(toolpath.toKeptGeometry())) {
    for (const path of paths) {
      // FIX: Handle open paths and bent polygons.
      const edges = getEdges(path);
      // const up = [0, 0, 1, 0]; // fromPolygon(path);
      const length = edges.length;
      for (let nth = 0; nth < length; nth++) {
        const prev = edges[nth];
        const curr = edges[(nth + 1) % length];
        const next = edges[(nth + 2) % length];
        const a = planeOfBisection(prev[START], curr[END], curr[START]);
        const b = planeOfBisection(curr[START], next[END], curr[END]);
        const middle = scale(0.5, add(curr[START], curr[END]));
        const rotate90 = fromRotation(Math.PI / -2, up);
        const direction = normalize(subtract(curr[START], curr[END]));
        const rightDirection = transform(rotate90, direction);
        const right = add(middle, rightDirection);
        chains.push(
          orient(middle, add(middle, up), right, tool).extrudeToPlane(
            neg(b),
            neg(a)
          )
        );
      }
    }
  }
  return Group(...chains);
};

const sweepMethod = function (tool, up) {
  return sweep(this, tool, up);
};

Shape.prototype.sweep = sweepMethod;
Shape.prototype.withSweep = function (tool, up) {
  return this.with(sweep(this, tool, up));
};

const toolpath = (
  shape,
  diameter = 1,
  { overcut = false, solid = true } = {}
) =>
  Shape.fromGeometry({
    type: 'paths',
    paths: toolpath$1(shape.toKeptGeometry(), diameter, overcut, solid),
  });

const method = function (...options) {
  return toolpath(this, ...options);
};

Shape.prototype.toolpath = method;
Shape.prototype.withToolpath = function (...args) {
  return this.with(toolpath(this, ...args));
};

const X = 0;
const Y = 1;
const Z = 2;

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

const voxels = (shape, resolution = 1) => {
  const offset = resolution / 2;
  const geometry = shape.toDisjointGeometry();
  const normalize = createNormalize3();
  const [boxMin, boxMax] = measureBoundingBox(geometry);
  const min = floorPoint(boxMin, resolution);
  const max = ceilPoint(boxMax, resolution);
  const classifiers = [];
  for (const { solid } of getSolids(shape.toDisjointGeometry())) {
    classifiers.push({ bsp: fromSolid(solid, normalize) });
  }
  const test = (point) => {
    for (const { bsp } of classifiers) {
      if (containsPoint$1(bsp, point)) {
        return true;
      }
    }
    return false;
  };
  const polygons = [];
  for (let x = min[X] - offset; x <= max[X] + offset; x += resolution) {
    for (let y = min[Y] - offset; y <= max[Y] + offset; y += resolution) {
      for (let z = min[Z] - offset; z <= max[Z] + offset; z += resolution) {
        const state = test([x, y, z]);
        if (state !== test([x + resolution, y, z])) {
          const face = [
            [x + offset, y - offset, z - offset],
            [x + offset, y + offset, z - offset],
            [x + offset, y + offset, z + offset],
            [x + offset, y - offset, z + offset],
          ];
          polygons.push(state ? face : face.reverse());
        }
        if (state !== test([x, y + resolution, z])) {
          const face = [
            [x - offset, y + offset, z - offset],
            [x + offset, y + offset, z - offset],
            [x + offset, y + offset, z + offset],
            [x - offset, y + offset, z + offset],
          ];
          polygons.push(state ? face.reverse() : face);
        }
        if (state !== test([x, y, z + resolution])) {
          const face = [
            [x - offset, y - offset, z + offset],
            [x + offset, y - offset, z + offset],
            [x + offset, y + offset, z + offset],
            [x - offset, y + offset, z + offset],
          ];
          polygons.push(state ? face : face.reverse());
        }
      }
    }
  }
  return Shape.fromGeometry(taggedSolid({}, fromPolygons(polygons)));
};

const voxelsMethod = function (...args) {
  return voxels(this, ...args);
};
Shape.prototype.voxels = voxelsMethod;

const surfaceCloud = (shape, resolution = 1) => {
  const offset = resolution / 2;
  const geometry = shape.toDisjointGeometry();
  const normalize = createNormalize3();
  const [boxMin, boxMax] = measureBoundingBox(geometry);
  const min = floorPoint(boxMin, resolution);
  const max = ceilPoint(boxMax, resolution);
  const classifiers = [];
  for (const { solid } of getSolids(shape.toDisjointGeometry())) {
    classifiers.push({ bsp: fromSolid(solid, normalize) });
  }
  const test = (point) => {
    for (const { bsp } of classifiers) {
      if (containsPoint$1(bsp, point)) {
        return true;
      }
    }
    return false;
  };
  const paths = [];
  for (let x = min[X] - offset; x <= max[X] + offset; x += resolution) {
    for (let y = min[Y] - offset; y <= max[Y] + offset; y += resolution) {
      for (let z = min[Z] - offset; z <= max[Z] + offset; z += resolution) {
        const state = test([x, y, z]);
        if (state !== test([x + resolution, y, z])) {
          paths.push([null, [x, y, z], [x + resolution, y, z]]);
        }
        if (state !== test([x, y + resolution, z])) {
          paths.push([null, [x, y, z], [x, y + resolution, z]]);
        }
        if (state !== test([x, y, z + resolution])) {
          paths.push([null, [x, y, z], [x, y, z + resolution]]);
        }
      }
    }
  }
  return Shape.fromGeometry(taggedPaths({}, paths));
};

const surfaceCloudMethod = function (...args) {
  return surfaceCloud(this, ...args);
};
Shape.prototype.surfaceCloud = surfaceCloudMethod;

const withSurfaceCloudMethod = function (...args) {
  return this.with(surfaceCloud(this, ...args));
};
Shape.prototype.withSurfaceCloud = withSurfaceCloudMethod;

const orderPoints = ([aX, aY, aZ], [bX, bY, bZ]) => {
  const dX = aX - bX;
  if (dX !== 0) {
    return dX;
  }
  const dY = aY - bY;
  if (dY !== 0) {
    return dY;
  }
  const dZ = aZ - bZ;
  return dZ;
};

const cloud = (shape, resolution = 1) => {
  const offset = resolution / 2;
  const geometry = shape.toDisjointGeometry();
  const normalize = createNormalize3();
  const [boxMin, boxMax] = measureBoundingBox(geometry);
  const min = floorPoint(boxMin, resolution);
  const max = ceilPoint(boxMax, resolution);
  const classifiers = [];
  for (const { solid } of getSolids(shape.toDisjointGeometry())) {
    classifiers.push({ bsp: fromSolid(solid, normalize) });
  }
  const test = (point) => {
    for (const { bsp } of classifiers) {
      if (containsPoint$1(bsp, point)) {
        return true;
      }
    }
    return false;
  };
  const points = [];
  for (let x = min[X] - offset; x <= max[X] + offset; x += resolution) {
    for (let y = min[Y] - offset; y <= max[Y] + offset; y += resolution) {
      for (let z = min[Z] - offset; z <= max[Z] + offset; z += resolution) {
        if (test([x, y, z])) {
          points.push([x, y, z]);
        }
      }
    }
  }
  points.sort(orderPoints);
  return Shape.fromGeometry(taggedPoints({}, points));
};

const cloudMethod = function (...args) {
  return cloud(this, ...args);
};
Shape.prototype.cloud = cloudMethod;

// FIX: move this
const containsPoint = (shape, point) => {
  for (const { solid } of getSolids(shape.toDisjointGeometry())) {
    const bsp = fromSolid(solid, createNormalize3());
    if (containsPoint$1(bsp, point)) {
      return true;
    }
  }
  return false;
};

const containsPointMethod = function (point) {
  return containsPoint(this, point);
};
Shape.prototype.containsPoint = containsPointMethod;

const heightCloud = (shape, resolution) => {
  const heights = measureHeights(shape.toDisjointGeometry(), resolution);
  return Shape.fromGeometry(taggedPoints({}, heights));
};

const heightCloudMethod = function (resolution) {
  return heightCloud(this, resolution);
};
Shape.prototype.heightCloud = heightCloudMethod;

const api = {
  Alpha,
  Loop,
  extrude,
  extrudeToPlane,
  fill,
  inline,
  outline,
  section,
  squash,
  sweep,
  toolpath,
  voxels,
};

export default api;
export { Alpha, Loop, cloudSolid, extrude, extrudeToPlane, fill, inline, outline, section, squash, sweep, toolpath, voxels };
