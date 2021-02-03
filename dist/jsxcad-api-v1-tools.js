import { Peg } from './jsxcad-api-v1-shapes.js';
import { Shape } from './jsxcad-api-v1-shape.js';
import { each } from './jsxcad-api-v1-math.js';
import { getDefinitions } from './jsxcad-sys.js';
import { toToolFromTags } from './jsxcad-algorithm-tool.js';

const Z = 2;
const z = Peg([0, 0, 0], [0, 1, 0], [-1, 0, 0]);

const carve = (block, { toolDiameter = 1, cutDepth = 1 } = {}, ...shapes) => {
  const { diameter = 1 } = toToolFromTags(
    block.toGeometry.tags,
    getDefinitions()
  );
  const negative = block.cut(...shapes);
  const { max, min } = block.size();
  const depth = max[Z] - min[Z];
  const cuts = Math.ceil(depth / cutDepth);
  const effectiveCutDepth = depth / cuts;
  return negative
    .section(
      ...each((l) => z.z(l), {
        from: min[Z],
        upto: max[Z],
        by: effectiveCutDepth,
      })
    )
    .inset(diameter / 2, diameter / 2)
    .z(-max[Z]);
};

function carveMethod(tool, ...shapes) {
  return carve(this, tool, ...shapes);
}

Shape.prototype.carve = carveMethod;

const mill = (negative, { toolDiameter = 1, cutDepth = 1 } = {}) => {
  const { diameter = 1 } = toToolFromTags(
    negative.toGeometry.tags,
    getDefinitions()
  );
  const { max, min } = negative.size();
  const depth = max[Z] - min[Z];
  const cuts = Math.ceil(depth / cutDepth);
  const effectiveCutDepth = depth / cuts;
  return negative
    .section(
      ...each((l) => z.z(l), {
        from: min[Z],
        upto: max[Z],
        by: effectiveCutDepth,
      })
    )
    .inset(diameter / 2, diameter / 2)
    .z(-max[Z]);
};

function millMethod(tool, ...shapes) {
  return mill(this, tool);
}

Shape.prototype.mill = millMethod;
