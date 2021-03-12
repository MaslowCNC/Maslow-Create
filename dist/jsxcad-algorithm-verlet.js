import { squaredDistance, add, scale, subtract } from './jsxcad-math-vec3.js';

const EPSILON2 = 1e-10;

const relax = (constraint, stepCoefficient) =>
  constraint.relax(constraint, stepCoefficient);

const verlet = ({
  forces = [],
  ids = {},
  particles = [],
  constraints = [],
} = {}) => ({ forces, ids, particles: Object.values(particles), constraints });

const positions = ({ particles }) => {
  const positions = {};
  for (const particle of particles) {
    positions[particle.id] = particle.position;
  }
  return positions;
};

const update = ({ constraints, forces, particles }, step = 16) => {
  for (const particle of particles) {
    const { position } = particle;

    for (const force of forces) {
      force({ particle, particles });
    }

    particle.lastPosition = position;
  }

  // relax
  const stepCoefficient = 1 / step;

  for (let i = 0; i < step; i++) {
    for (const constraint of constraints) {
      relax(constraint, stepCoefficient);
    }
  }
};

const isStopped = ({ particles }) => {
  return particles.every(
    ({ position, lastPosition }) =>
      squaredDistance(position, lastPosition) < EPSILON2
  );
};

const solve = (verlet, stepLimit = 0) => {
  do {
    if (stepLimit > 0) {
      if (--stepLimit === 0) {
        return false;
      }
    }
    update(verlet);
  } while (!isStopped(verlet));
  return true;
};

const force = ({ forces }, vector) => {
  const applyGravity = ({ particle }) => {
    particle.position = add(particle.position, vector);
  };
  forces.push(applyGravity);
};

const force$1 = ({ forces }, friction = 0.99) => {
  const applyInertia = ({ particle }) => {
    const velocity = scale(
      friction,
      subtract(particle.position, particle.lastPosition)
    );
    if (velocity > 1e-5) {
      particle.position = add(particle.position, velocity);
    }
  };
  forces.push(applyInertia);
};

const particle = (id, [x = 0, y = 0, z = 0] = []) => ({
  id,
  position: [x, y, z],
  lastPosition: [x, y, z],
});

const ensureParticle = (ids, particles, id) => {
  let p = ids[id];
  if (p === undefined) {
    p = particle(id, [Math.random() * 10, Math.random() * 10]);
    ids[id] = p;
    particles.push(p);
  }
  return p;
};

const angle = ([ax, ay], [bx, by]) =>
  Math.atan2(ax * by - ay * bx, ax * bx + ay * by);

const angle2 = (pivot, left, right) =>
  angle(subtract(left, pivot), subtract(right, pivot));

const rotate = ([pointX, pointY], [originX, originY], theta) => {
  const x = pointX - originX;
  const y = pointY - originY;
  return [
    x * Math.cos(theta) - y * Math.sin(theta) + originX,
    x * Math.sin(theta) + y * Math.cos(theta) + originY,
    0,
  ];
};

const relax$1 = ({ pivot, left, right, radians, stiffness }, stepCoefficient) => {
  const currentRadians = angle2(pivot.position, left.position, right.position);
  let diff = currentRadians - radians;

  if (diff <= -Math.PI) {
    diff += 2 * Math.PI;
  } else if (diff >= Math.PI) {
    diff -= 2 * Math.PI;
  }

  diff *= stepCoefficient * stiffness;

  left.position = rotate(left.position, pivot.position, diff);
  right.position = rotate(right.position, pivot.position, -diff);
  pivot.position = rotate(pivot.position, left.position, diff);
  pivot.position = rotate(pivot.position, right.position, -diff);
};

const create = ({ constraints, ids, particles }) => {
  const constrain = (left, pivot, right, angle, stiffness = 0.5) => {
    constraints.push({
      pivot: ensureParticle(ids, particles, pivot),
      left: ensureParticle(ids, particles, left),
      right: ensureParticle(ids, particles, right),
      stiffness,
      radians: (angle * Math.PI) / 180,
      relax: relax$1,
    });
  };
  return constrain;
};

// Distance

const relax$2 = ({ a, b, distance, stiffness }, stepCoefficient) => {
  const normal = subtract(a.position, b.position);
  let m = squaredDistance(normal, [0, 0, 0]);
  if (m === 0) {
    m = 1;
  }
  const scaledNormal = scale(
    ((distance * distance - m) / m) * stiffness * stepCoefficient,
    normal
  );
  a.position = add(a.position, scaledNormal);
  b.position = subtract(b.position, scaledNormal);
};

const create$1 = ({ constraints, ids, particles }) => {
  const constrain = (a, b, distance, stiffness = 0.5) => {
    constraints.push({
      a: ensureParticle(ids, particles, a),
      b: ensureParticle(ids, particles, b),
      distance,
      relax: relax$2,
      stiffness,
    });
  };
  return constrain;
};

// Pinning Constraint

const relax$3 = ({ particle, position }, stepCoefficient) => {
  if (position[0] !== undefined) {
    particle.position[0] = position[0];
  }
  if (position[1] !== undefined) {
    particle.position[1] = position[1];
  }
  if (position[2] !== undefined) {
    particle.position[2] = position[2];
  }
};

const create$2 = ({ constraints, ids, particles }) => {
  const constrain = (particle, position) => {
    constraints.push({
      particle: ensureParticle(ids, particles, particle),
      position,
      relax: relax$3,
    });
  };
  return constrain;
};

export { force as addGravity, force$1 as addInertia, create as createAngleConstraint, create$1 as createDistanceConstraint, create$2 as createPinnedConstraint, positions, solve, verlet };
