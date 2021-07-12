import { taggedGraph, alphaShape, fromPointsToGraph, extrude as extrude$1, extrudeToPlane as extrudeToPlane$1, fill as fill$1, outline as outline$1, projectToPlane as projectToPlane$1, section as section$1, getPathEdges } from './jsxcad-geometry.js';
import Shape$1, { Shape, getPegCoords, orient } from './jsxcad-api-v1-shape.js';
import { Group, ChainedHull } from './jsxcad-api-v1-shapes.js';
import { add, normalize, subtract } from './jsxcad-math-vec3.js';
import { fromNormalAndPoint } from './jsxcad-math-plane.js';

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

const cloudSolid = (shape) => {
  const points = shape.toPoints();
  return Shape.fromGeometry(taggedGraph({}, fromPointsToGraph(points)));
};

const cloudSolidMethod = function () {
  return cloudSolid(this);
};
Shape.prototype.cloudSolid = cloudSolidMethod;

const withCloudSolidMethod = function () {
  return this.with(cloudSolid(this));
};
Shape.prototype.withCloudSolid = withCloudSolidMethod;

const extrude = (shape, ...heights) => {
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
      Shape$1.fromGeometry(extrude$1(shape.toGeometry(), height, depth))
    );
  }
  return Shape$1.Group(...extrusions);
};

const extrudeMethod = function (...heights) {
  return extrude(this, ...heights);
};
Shape$1.prototype.extrude = extrudeMethod;
Shape$1.prototype.pull = extrudeMethod;
Shape$1.prototype.ex = extrudeMethod;

const extrudeToPlane = (
  shape,
  highPlane = [0, 0, 1, 1],
  lowPlane = [0, 0, 1, -1],
  direction = [0, 0, 1, 0]
) => {
  return Shape$1.fromGeometry(
    extrudeToPlane$1(shape.toGeometry(), highPlane, lowPlane, direction)
  );
};

const extrudeToPlaneMethod = function (highPlane, lowPlane, direction) {
  return extrudeToPlane(this, highPlane, lowPlane, direction);
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
  return this.and(op(outline(this)));
};

Shape.prototype.outline = outlineMethod;
Shape.prototype.wire = outlineMethod;

Shape.prototype.andOutline = withOutlineMethod;
Shape.prototype.andWire = withOutlineMethod;

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

const projectToPlane = (
  shape,
  plane = [0, 0, 1, 1],
  direction = [0, 0, 1, 0]
) => {
  return Shape$1.fromGeometry(
    projectToPlane$1(shape.toGeometry(), plane, direction)
  );
};

const projectToPlaneMethod = function (plane, direction) {
  return projectToPlane(this, plane, direction);
};
Shape$1.prototype.projectToPlane = projectToPlaneMethod;

const section = (shape, { profile = false }, ...pegs) => {
  const planes = [];
  if (pegs.length === 0) {
    planes.push({ plane: [0, 0, 1, 0] });
  } else {
    for (const peg of pegs) {
      const { plane } = getPegCoords(peg);
      planes.push({ plane });
    }
  }
  return Shape.fromGeometry(
    section$1(shape.toGeometry(), planes, { profile })
  );
};

const sectionMethod = function (...args) {
  return section(this, { profile: false }, ...args);
};
Shape.prototype.section = sectionMethod;

const sectionProfileMethod = function (...args) {
  return section(this, { profile: true }, ...args);
};
Shape.prototype.sectionProfile = sectionProfileMethod;

const START = 0;
const END = 1;

const planeOfBisection = (aStart, bStart, intersection) => {
  const dA = normalize(subtract(aStart, intersection));
  const dB = normalize(subtract(bStart, intersection));
  const bis1 = add(dA, dB);
  // const bis2 = subtract(dA, dB);
  // return fromNormalAndPoint(bis2, intersection);
  return fromNormalAndPoint(bis1, intersection);
};

// FIX: segments can produce overlapping tools.
const sweep = (toolpath, tool, up = [0, 0, 1, 0]) => {
  const chains = [];
  for (const { paths } of outline$1(toolpath.toKeptGeometry())) {
    for (const path of paths) {
      // FIX: Handle open paths and bent polygons.
      const tools = [];
      const edges = getPathEdges(path);
      const up = [0, 0, 1, 0];
      const length = edges.length;
      for (let nth = 0; nth < length + 1; nth++) {
        const prev = edges[nth % length];
        const curr = edges[(nth + 1) % length];
        const next = edges[(nth + 2) % length];
        // We are going to sweep from a to b.
        const a = planeOfBisection(prev[START], curr[END], prev[END]);
        const b = planeOfBisection(curr[START], next[END], curr[END]);
        const right = a;
        const p = prev[END];
        tools.push(
          orient(p, add(p, up), add(p, right), tool).projectToPlane(b, a)
        );
      }
      chains.push(ChainedHull(...tools));
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

const api = {
  Alpha,
  extrude,
  extrudeToPlane,
  fill,
  inline,
  outline,
  projectToPlane,
  section,
  sweep,
};

export default api;
export { Alpha, cloudSolid, extrude, extrudeToPlane, fill, inline, outline, projectToPlane, section, sweep };