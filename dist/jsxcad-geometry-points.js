import { fromTranslation } from './jsxcad-math-mat4.js';
import { transform as transform$1, canonicalize as canonicalize$1, subtract, max, min } from './jsxcad-math-vec3.js';

// A point in a cloud may be supplemented by a 'forward' and a 'right' vector
// allowing it to define a plane with a rotation.

const transform = (matrix, points) => {
  const transformedPoints = [];
  for (let nth = 0; nth < points.length; nth++) {
    const point = points[nth];
    const transformedPoint = transform$1(matrix, point);
    if (point.length > 3) {
      const forward = point.slice(3, 6);
      const transformedForward = transform$1(matrix, forward);
      transformedPoint.push(...transformedForward);
    }
    if (point.length > 6) {
      const right = point.slice(6, 9);
      const transformedRight = transform$1(matrix, right);
      transformedPoint.push(...transformedRight);
    }
    transformedPoints.push(transformedPoint);
  }
  return transformedPoints;
};

const translate = ([x = 0, y = 0, z = 0], points) =>
  transform(fromTranslation([x, y, z]), points);

const canonicalize = (points) => points.map(canonicalize$1);

const eachPoint = (thunk, points) => {
  for (const point of points) {
    thunk(point);
  }
};

const flip = (points) =>
  points.map((point) => {
    if (point.length <= 3) {
      return point;
    }
    const [x, y, z, xF, yF, zF, xR, yR, zR] = point;
    const [xFR, yFR, zFR] = subtract(
      [x, y, z],
      subtract([xR, yR, zR], [x, y, z])
    );
    return [x, y, z, xF, yF, zF, xFR, yFR, zFR];
  });

const fromPolygons = (polygons) => {
  const points = [];
  for (const polygon of polygons) {
    for (const point of polygon) {
      points.push(point);
    }
  }
  return points;
};

// returns an array of two Vector3Ds (minimum coordinates and maximum coordinates)
const measureBoundingBox = (points) => {
  let min$1 = [Infinity, Infinity, Infinity];
  let max$1 = [-Infinity, -Infinity, -Infinity];
  eachPoint((point) => {
    max$1 = max(max$1, point);
    min$1 = min(min$1, point);
  }, points);
  return [min$1, max$1];
};

const union = (...geometries) => [].concat(...geometries);

export { canonicalize, eachPoint, flip, fromPolygons, measureBoundingBox, transform, translate, union };
