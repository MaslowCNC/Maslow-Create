import { taggedGroup, outline, translate } from './jsxcad-geometry-tagged.js';
import { Peg } from './jsxcad-api-v1-shapes.js';
import { Shape } from './jsxcad-api-v1-shape.js';
import { each } from './jsxcad-api-v1-math.js';
import { getDefinitions } from './jsxcad-sys.js';
import { toToolFromTags } from './jsxcad-algorithm-tool.js';

const Z = 2;
const z = Peg('z', [0, 0, 0], [0, 1, 0], [-1, 0, 0]);

const carve = (block, tool = {}, ...shapes) => {
  const { grbl = {} } = tool;
  const { diameter = 1, cutDepth = 0.2 } = grbl;
  const negative = block.cut(...shapes);
  const { max, min } = block.size();
  const depth = max[Z] - min[Z];
  const cuts = Math.ceil(depth / cutDepth);
  const effectiveCutDepth = depth / cuts;
  return negative
    .sectionProfile(
      ...each((l) => z.z(l), {
        from: min[Z],
        upto: max[Z],
        by: effectiveCutDepth,
      }).reverse()
    )
    .inset(diameter / 2, diameter / 2);
};

function carveMethod(tool, ...shapes) {
  return carve(this, tool, ...shapes);
}

Shape.prototype.carve = carveMethod;

const mill = (negative, tool = {}) => {
  const { grbl = {} } = tool;
  const { diameter = 1, cutDepth = 0.2 } = grbl;
  const { max, min } = negative.size();
  const depth = max[Z] - min[Z];
  const cuts = Math.ceil(depth / cutDepth);
  const effectiveCutDepth = depth / cuts;
  return negative
    .sectionProfile(
      ...each((l) => z.z(l), {
        from: min[Z],
        upto: max[Z],
        by: effectiveCutDepth,
      }).reverse()
    )
    .inset(diameter / 2, diameter / 2);
};

function millMethod(tool) {
  return mill(this, tool);
}

Shape.prototype.mill = millMethod;

const engrave = (paths, depth = 0.5) => {
  const { cutDepth = 0.2 } = toToolFromTags(
    'grbl',
    paths.toGeometry().tags,
    getDefinitions()
  );
  const cuts = Math.ceil(depth / cutDepth);
  const effectiveCutDepth = depth / cuts;
  const toolpaths = [];
  for (let cut = 1; cut <= cuts; cut++) {
    for (const path of outline(paths.toGeometry())) {
      toolpaths.push(translate([0, 0, cut * -effectiveCutDepth], path));
    }
  }
  return Shape.fromGeometry(taggedGroup({}, ...toolpaths));
};

function engraveMethod(tool, ...shapes) {
  return engrave(this, tool);
}

Shape.prototype.engrave = engraveMethod;
