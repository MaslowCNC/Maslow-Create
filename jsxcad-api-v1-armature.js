import { verlet, addInertia, createAngleConstraint, createDistanceConstraint, createPinnedConstraint, solve, positions } from './jsxcad-algorithm-verlet.js';

/**
 *
 * # Armature
 *
 * Armature builds a set of points based on constraints.
 *
 * ::: illustration { "view": { "position": [40, -40, 40], "target": [0, 0, 0] } }
 * ```
 * const { angle, compute, distance, pinned } = Armature();
 * pinned('A', [0, 0, 0]);
 * angle('A', 'B', 'C', 90);
 * distance('B', 'A', 20);
 * distance('B', 'C', 10);
 * const { A, B, C } = compute();
 * Polygon(A, B, C).outline().center();
 * ```
 * :::
 *
 **/

const Armature = () => {
  const constraints = verlet();
  addInertia(constraints);
  const angle = createAngleConstraint(constraints);
  const distance = createDistanceConstraint(constraints);
  const pinned = createPinnedConstraint(constraints);
  let solved = false;

  const isSolved = () => solved;

  const compute = (limit = 0) => {
    solved = solve(constraints, limit);
    return positions(constraints);
  };

  return {
    angle,
    compute,
    distance,
    isSolved,
    pinned,
  };
};

Armature.signature = 'Armature() -> armature';

const api = { Armature };

export { Armature, api as default };
