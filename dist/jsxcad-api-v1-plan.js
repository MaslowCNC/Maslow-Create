import Shape from './jsxcad-api-v1-shape.js';
import { taggedAssembly } from './jsxcad-geometry-tagged.js';

const Plan = (
  { plan, marks = [], planes = [], tags = [], visualization, content },
  context
) => {
  let visualizationGeometry =
    visualization === undefined
      ? taggedAssembly({})
      : visualization.toKeptGeometry();
  let contentGeometry =
    content === undefined ? [] : content.map((shape) => shape.toKeptGeometry());
  const shape = Shape.fromGeometry(
    {
      type: 'plan',
      plan,
      marks,
      planes,
      tags,
      content: contentGeometry,
      visualization: visualizationGeometry,
    },
    context
  );
  return shape;
};

export default Plan;
export { Plan };
