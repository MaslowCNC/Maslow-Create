import { transform as transform$1 } from './jsxcad-math-vec3.js';

const apothem = (apothem = 1, { at = [0, 0, 0], sides = 32 } = {}) => {
  return {
    type: 'apothem',
    at,
    apothem,
    sides,
  };
};

const box = (length, width) => {
  const at = [0, 0, 0];
  return {
    type: 'box',
    length,
    width,
    at,
  };
};

const corners = (right = 0, back = 0, left = 0, front = 0) => {
  if (left > right) [left, right] = [right, left];
  if (front > back) [front, back] = [back, front];
  const at = [0, 0, 0];
  return {
    type: 'corners',
    left,
    right,
    back,
    front,
    at,
  };
};

const diameter = (diameter = 1, { at = [0, 0, 0], sides = 32 } = {}) => {
  return {
    type: 'diameter',
    at,
    diameter,
    sides,
  };
};

const radius = (radius = 1, { at = [0, 0, 0], sides = 32 } = {}) => {
  return {
    type: 'radius',
    at,
    radius,
    sides,
  };
};

const getSides = (plan) => {
  switch (plan.type) {
    case 'radius':
    case 'apothem':
    case 'diameter':
      return plan.sides;
    default: {
      const { sides = 32 } = plan;
      return sides;
    }
  }
};

const toRadiusFromApothem = (apothem, sides = 32) =>
  apothem / Math.cos(Math.PI / sides);

const getRadius = (plan) => {
  if (typeof plan === 'number') {
    return plan;
  }
  switch (plan.type) {
    case 'apothem':
      return toRadiusFromApothem(plan.apothem, getSides(plan));
    case 'diameter':
      return plan.diameter / 2;
    case 'radius':
      return plan.radius;
    case 'box':
      return Math.min(plan.length, plan.width) / 2;
  }
};

const getBack = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    case 'corners':
      return plan.back;
    case 'box':
      return plan.width / -2;
    default:
      return -getRadius(plan);
  }
};

const getBottom = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    default:
      return -getRadius(plan);
  }
};

const getCenter = (plan) => {
  if (typeof plan === 'number') {
    return [0, 0, 0];
  }
  return plan.center || [0, 0, 0];
};

const getFront = (plan) => {
  if (typeof plan === 'number') {
    return plan;
  }
  switch (plan.type) {
    case 'corners':
      return plan.front;
    case 'box':
      return plan.width / 2;
    default:
      return getRadius(plan);
  }
};

const getLeft = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    case 'corners':
      return plan.left;
    case 'box':
      return plan.length / -2;
    default:
      return -getRadius(plan);
  }
};

const getRight = (plan) => {
  if (typeof plan === 'number') {
    return plan;
  }
  switch (plan.type) {
    case 'corners':
      return plan.right;
    case 'box':
      return plan.length / 2;
    default:
      return getRadius(plan);
  }
};

const getTop = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    default:
      return -getRadius(plan);
  }
};

const transform = (matrix, plan) => {
  if (plan.at) {
    const { at } = plan;
    const transformedAt = transform$1(matrix, at);
    if (at.length > 3) {
      const forward = at.slice(3, 6);
      const transformedForward = transform$1(matrix, forward);
      transformedAt.push(...transformedForward);
    }
    if (at.length > 6) {
      const right = at.slice(6, 9);
      const transformedRight = transform$1(matrix, right);
      transformedAt.push(...transformedRight);
    }
    return { ...plan, at: transformedAt };
  } else {
    return plan;
  }
};

export { apothem, box, corners, diameter, getBack, getBottom, getCenter, getFront, getLeft, getRadius, getRight, getSides, getTop, radius, transform };
