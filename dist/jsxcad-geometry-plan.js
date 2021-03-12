import { negate, distance, transform as transform$1 } from './jsxcad-math-vec3.js';
import { identityMatrix } from './jsxcad-math-mat4.js';

const apothem = (apothem = 1, { at = [0, 0, 0], sides = 32 } = {}) => {
  return {
    type: 'apothem',
    _at: at,
    _apothem: apothem,
    _sides: sides,
  };
};

const box = (length, width) => {
  return {
    type: 'box',
    _length: length,
    _width: width,
    _at: [0, 0, 0],
  };
};

const corners = (right = 0, back = 0, left = 0, front = 0) => {
  if (left > right) [left, right] = [right, left];
  if (front > back) [front, back] = [back, front];
  return {
    type: 'corners',
    _left: left,
    _right: right,
    _back: back,
    _front: front,
    _at: [0, 0, 0],
  };
};

const diameter = (diameter = 1, { at = [0, 0, 0], sides = 32 } = {}) => {
  return {
    type: 'diameter',
    _at: at,
    _diameter: diameter,
    _sides: sides,
  };
};

class Edge {
  constructor(data, change) {
    Object.assign(this, data, change);
    if (this._high[X] < this._low[X]) {
      [this._high[X], this._low[X]] = [this._low[X], this._high[X]];
    }
    if (this._high[Y] < this._low[Y]) {
      [this._high[Y], this._low[Y]] = [this._low[Y], this._high[Y]];
    }
    if (this._high[Z] < this._low[Z]) {
      [this._high[Z], this._low[Z]] = [this._low[Z], this._high[Z]];
    }
  }

  at(at) {
    this._at = at;
    return this.update({ _at: at });
  }
  sides(sides) {
    this._sides = sides;
    return this.update({ _sides: sides });
  }
  edge(x = 0, y = 0, z = 0) {
    return this.update({ _low: [x, y, z] });
  }
  to(x = 0, y = 0, z = 0) {
    return this.update({ _to: [x, y, z] });
  }

  update(change) {
    return new Edge(this, change);
  }
}

const X = 0;
const Y = 1;
const Z = 2;

const edge = (x = 0, y = 0, z = 0) => {
  const high = [x, y, z];
  return new Edge({
    type: 'edge',
    _at: [0, 0, 0],
    _high: high,
    _low: negate(high),
    _sides: 32,
  });
};

const radius = (radius = 1, { at = [0, 0, 0], sides = 32 } = {}) => {
  return {
    type: 'radius',
    _at: at,
    _radius: radius,
    _sides: sides,
  };
};

const getSides = (plan, value = 32) => {
  switch (plan.type) {
    case 'edge':
    case 'radius':
    case 'apothem':
    case 'diameter':
      return plan._sides;
    default: {
      const { sides = value } = plan;
      return sides;
    }
  }
};

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

const toRadiusFromApothem = (apothem, sides = 32) =>
  apothem / Math.cos(Math.PI / sides);

const getRadius = (plan) => {
  if (typeof plan === 'number') {
    return plan;
  }
  switch (plan.type) {
    case 'edge':
      return Math.min(
        ...plan._high.map((v) => Math.abs(v)),
        ...plan._low.map((v) => Math.abs(v))
      );
    case 'apothem':
      return toRadiusFromApothem(plan._apothem, getSides(plan));
    case 'diameter':
      return plan._diameter / 2;
    case 'radius':
      return plan._radius;
    case 'box':
      return Math.min(plan._length, plan._width) / 2;
    default: {
      let radius;
      if (plan.corner1 && plan.corner2) {
        const x = Math.abs(plan.corner1[X$1] - plan.corner2[X$1]) / 2;
        const y = Math.abs(plan.corner1[Y$1] - plan.corner2[Y$1]) / 2;
        const z = Math.abs(plan.corner1[Z$1] - plan.corner2[Z$1]) / 2;
        radius = [x, y, z];
      } else if (plan.corner1) {
        const x = Math.abs(plan.corner1[X$1]);
        const y = Math.abs(plan.corner1[Y$1]);
        const z = Math.abs(plan.corner1[Z$1]);
        radius = [x, y, z];
      } else if (plan.corner2) {
        const x = Math.abs(plan.corner2[X$1]);
        const y = Math.abs(plan.corner2[Y$1]);
        const z = Math.abs(plan.corner2[Z$1]);
        radius = [x, y, z];
      } else if (plan.radius !== undefined) radius = plan.radius;
      else if (plan.diameter !== undefined) {
        radius = plan.diameter.map((diameter) => diameter / 2);
      } else if (plan.apothem !== undefined) {
        radius = plan.apothem.map((apothem) =>
          toRadiusFromApothem(apothem, plan.sides)
        );
      } else throw Error(`Cannot produce radius from ${plan}`);
      let top;
      if (plan.from && plan.to) {
        top = distance(plan.from, plan.to);
      } else if (plan.top) {
        top = plan.top;
      } else {
        top = radius[Z$1];
      }
      let base;
      if (plan.from || plan.to) {
        base = 0;
      } else if (plan.base !== undefined) {
        base = plan.base;
      } else {
        base = -radius[Z$1];
      }
      return [radius[X$1], radius[Y$1], (top - base) / 2];
    }
  }
};

const Y$2 = 1;

const getBack = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    case 'edge':
      return plan._at[Y$2] + plan._low[Y$2];
    case 'corners':
      return plan._back;
    case 'box':
      return plan._width / -2;
    default:
      return -getRadius(plan)[Y$2];
  }
};

const Z$2 = 2;

const getBottom = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    case 'edge':
      return plan._at[Z$2] + plan._low[Z$2];
    default: {
      if (plan.from || plan.to) {
        return 0;
      } else if (plan.base !== undefined) {
        return plan.base;
      }
      return -getRadius(plan)[Z$2];
    }
  }
};

const getBase = getBottom;

const X$2 = 0;
const Y$3 = 1;
const Z$3 = 2;

const getCenter = (plan) => {
  let center;
  if (plan.corner1 && plan.corner2) {
    center = [
      (plan.corner1[X$2] + plan.corner2[X$2]) / 2,
      (plan.corner1[Y$3] + plan.corner2[Y$3]) / 2,
      (plan.corner1[Z$3] + plan.corner2[Z$3]) / 2,
    ];
  } else if (plan.corner1 || plan.corner2) {
    center = [0, 0, 0];
  } else {
    center = [0, 0, 0];
  }
  if (plan.top !== undefined || plan.base !== undefined) {
    center = [center[X$2], center[Y$3], 0];
  }
  return center;
};

const getDiameter = (plan) => getRadius(plan).map((r) => r * 2);

const Y$4 = 1;

const getFront = (plan) => {
  if (typeof plan === 'number') {
    return plan;
  }
  switch (plan.type) {
    case 'edge':
      return plan._at[Y$4] + plan._high[Y$4];
    case 'corners':
      return plan._front;
    case 'box':
      return plan._width / 2;
    default:
      return getRadius(plan)[Y$4];
  }
};

const getFrom = (plan) => plan.from || [0, 0, 0];

const X$3 = 0;

const getLeft = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    case 'edge':
      return plan._at[X$3] + plan._low[X$3];
    case 'corners':
      return plan._left;
    case 'box':
      return plan._length / -2;
    default:
      return -getRadius(plan)[X$3];
  }
};

const getMatrix = (plan) => plan.matrix || identityMatrix;

const X$4 = 0;

const getRight = (plan) => {
  if (typeof plan === 'number') {
    return plan;
  }
  switch (plan.type) {
    case 'edge':
      return plan._at[X$4] + plan._high[X$4];
    case 'corners':
      return plan._right;
    case 'box':
      return plan._length / 2;
    default:
      return getRadius(plan)[X$4];
  }
};

const getTo = (plan) => plan.to || [0, 0, 0];

const Z$4 = 2;

const getTop = (plan) => {
  if (typeof plan === 'number') {
    return -plan;
  }
  switch (plan.type) {
    case 'edge':
      return plan._at[Z$4] + plan._high[Z$4];
    default: {
      if (plan.from && plan.to) {
        return distance(plan.from, plan.to);
      }
      if (plan.top !== undefined) {
        return plan.top;
      }
      return getRadius(plan)[Z$4];
    }
  }
};

// FIX: Need to rethink this.
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

export { apothem, box, corners, diameter, edge, getBack, getBase, getBottom, getCenter, getDiameter, getFrom, getFront, getLeft, getMatrix, getRadius, getRight, getSides, getTo, getTop, radius, transform };
